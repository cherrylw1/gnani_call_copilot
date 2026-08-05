import { calculateFitScore } from "./lead-scoring";
import { classifyLead } from "./lead-classification";
import { normalizeText, type CsvRow } from "./csv-normalization";
import { missingRequiredColumns, validateCsvRow } from "./csv-validation";
import { createAdminSupabaseClient } from "./supabase/admin";

const BATCH_SIZE = 250;

type PreparedRow = {
  row: CsvRow;
  rowNumber: number;
  validation: ReturnType<typeof validateCsvRow>;
};

export type ImportSummary = {
  importId?: string;
  totalRows: number;
  validRows: number;
  duplicateEmails: number;
  missingEmails: number;
  uniqueCompanies: number;
  uniqueDomains: number;
  rowsNeedingReview: number;
  contactsCreated: number;
  contactsUpdated: number;
  companiesCreated: number;
  companiesUpdated: number;
  topPersonas: [string, number][];
  topIndustries: [string, number][];
  countries: [string, number][];
  requiredColumnsMissing: string[];
};

const chunk = <T>(items: T[], size = BATCH_SIZE) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
const countTop = (values: string[]) => Object.entries(values.reduce<Record<string, number>>((out, value) => { if (value) out[value] = (out[value] ?? 0) + 1; return out; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 10) as [string, number][];

export function summarizeRows(rows: CsvRow[], headers: string[]): ImportSummary {
  const emails = new Map<string, number>(); const companies = new Set<string>(); const domains = new Set<string>();
  let validRows = 0; let missingEmails = 0; let rowsNeedingReview = 0;
  for (const row of rows) {
    const validation = validateCsvRow(row, headers); const mapped = validation.mapped;
    if (validation.status === "ok") validRows++; else rowsNeedingReview++;
    if (!mapped.email) missingEmails++; else emails.set(mapped.email, (emails.get(mapped.email) ?? 0) + 1);
    if (mapped.normalizedCompany) companies.add(mapped.normalizedCompany);
    if (mapped.companyDomain) domains.add(mapped.companyDomain);
  }
  return { totalRows: rows.length, validRows, missingEmails, rowsNeedingReview, duplicateEmails: [...emails.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0), uniqueCompanies: companies.size, uniqueDomains: domains.size, contactsCreated: 0, contactsUpdated: 0, companiesCreated: 0, companiesUpdated: 0, topPersonas: countTop(rows.map((row) => normalizeText(row.Persona))), topIndustries: countTop(rows.map((row) => normalizeText(row["Filter: Industry (auto-classified)"]))), countries: countTop(rows.map((row) => normalizeText(row.Country))), requiredColumnsMissing: missingRequiredColumns(headers) };
}

const scoreRow = (prepared: PreparedRow) => {
  const { mapped } = prepared.validation;
  return calculateFitScore({ priority: mapped.priority, industry: mapped.industry, persona: mapped.persona, company: mapped.company, voice: prepared.row["Priority: Investing in Voice/Speech AI"], chatbot: prepared.row["Priority: Investing in Chatbots/Virtual Agents"], ivr: prepared.row["Priority: Investing in Conversational IVR/Voicebots"], callVolume: prepared.row["Filter: Call Volume Band"], budget: prepared.row["Filter: Budgeting Period"], previousOutreach: prepared.row["Previous Outreach"] });
};

export async function importLeads(rows: CsvRow[], headers: string[], fileName: string) {
  const admin = createAdminSupabaseClient();
  const summary = summarizeRows(rows, headers);
  const preparedRows = rows.map((row, index) => ({ row, rowNumber: index + 1, validation: validateCsvRow(row, headers) }));
  const { data: importRecord, error: importError } = await admin.from("lead_imports").insert({ file_name: fileName, total_rows: summary.totalRows, valid_rows: summary.validRows, duplicate_email_count: summary.duplicateEmails, status: "processing", summary }).select().single();
  if (importError) throw new Error(importError.message);

  try {
    for (const batch of chunk(preparedRows)) {
      const { error } = await admin.from("raw_leads").insert(batch.map(({ row, rowNumber, validation }) => ({ import_id: importRecord.id, row_number: rowNumber, raw_data: row, data_quality_status: validation.status, data_quality_notes: validation.notes.join("; ") || null })));
      if (error) throw new Error(error.message);
    }

    const importableRows = preparedRows.filter(({ validation }) => Boolean(validation.mapped.email));
    const latestByEmail = new Map<string, PreparedRow>();
    const seedByNormalizedCompany = new Map<string, PreparedRow>();
    for (const prepared of importableRows) {
      latestByEmail.set(prepared.validation.mapped.email, prepared);
      if (prepared.validation.mapped.company && !seedByNormalizedCompany.has(prepared.validation.mapped.normalizedCompany)) seedByNormalizedCompany.set(prepared.validation.mapped.normalizedCompany, prepared);
    }

    const [{ data: existingCompanies, error: companiesReadError }, { data: existingContacts, error: contactsReadError }, { data: rawRows, error: rawReadError }] = await Promise.all([
      admin.from("companies").select("id,normalized_company_name"),
      admin.from("contacts").select("id,email,company_id"),
      admin.from("raw_leads").select("id,row_number").eq("import_id", importRecord.id)
    ]);
    if (companiesReadError || contactsReadError || rawReadError) throw new Error(companiesReadError?.message || contactsReadError?.message || rawReadError?.message || "Could not resolve imported records.");

    const companyIdByNormalized = new Map((existingCompanies ?? []).filter((company) => company.normalized_company_name).map((company) => [company.normalized_company_name as string, company.id]));
    const missingCompanies = [...seedByNormalizedCompany.entries()].filter(([normalized]) => !companyIdByNormalized.has(normalized));
    for (const batch of chunk(missingCompanies)) {
      const { error } = await admin.from("companies").insert(batch.map(([normalized, prepared]) => {
        const { mapped } = prepared.validation;
        return { company_name: mapped.company, normalized_company_name: normalized, domain: mapped.companyDomain, website_url: mapped.companyDomain ? `https://${mapped.companyDomain}` : null, industry_auto_classified: mapped.industry, country_primary: mapped.country, buyer_partner_competitor_status: classifyLead(mapped.industry, mapped.company, prepared.validation.status === "needs_review"), fit_score: scoreRow(prepared) };
      }));
      if (error) throw new Error(error.message);
    }
    if (missingCompanies.length) {
      const { data: refreshedCompanies, error } = await admin.from("companies").select("id,normalized_company_name");
      if (error) throw new Error(error.message);
      for (const company of refreshedCompanies ?? []) if (company.normalized_company_name) companyIdByNormalized.set(company.normalized_company_name, company.id);
    }

    const rawIdByRowNumber = new Map((rawRows ?? []).map((raw) => [raw.row_number, raw.id]));
    const existingContactByEmail = new Map((existingContacts ?? []).map((contact) => [contact.email, contact]));
    const existingEmails = new Set(existingContactByEmail.keys());
    const resolveCompanyId = (prepared: PreparedRow) => prepared.validation.mapped.company ? companyIdByNormalized.get(prepared.validation.mapped.normalizedCompany) ?? null : existingContactByEmail.get(prepared.validation.mapped.email)?.company_id ?? null;
    const uniqueContacts = [...latestByEmail.values()];
    for (const batch of chunk(uniqueContacts)) {
      const { error } = await admin.from("contacts").upsert(batch.map((prepared) => {
        const { mapped } = prepared.validation;
        const companyId = resolveCompanyId(prepared);
        return { raw_lead_id: rawIdByRowNumber.get(prepared.rowNumber) ?? null, company_id: companyId, first_name: mapped.firstName, last_name: mapped.lastName, full_name: mapped.fullName, job_title: mapped.title, persona: mapped.persona, email: mapped.email, email_domain: mapped.emailDomain, work_phone: mapped.phone, street_address: normalizeText(prepared.row["Street Address"]), city: normalizeText(prepared.row.City), state: normalizeText(prepared.row.State), zip_code: normalizeText(prepared.row["Zip Code"]), country: mapped.country, previous_outreach: normalizeText(prepared.row["Previous Outreach"]) };
      }), { onConflict: "email" });
      if (error) throw new Error(error.message);
    }

    const contactIdByEmail = new Map<string, string>();
    for (const batch of chunk([...latestByEmail.keys()])) {
      const { data, error } = await admin.from("contacts").select("id,email").in("email", batch);
      if (error) throw new Error(error.message);
      for (const contact of data ?? []) contactIdByEmail.set(contact.email, contact.id);
    }
    const contactsWithResolvedCompany = uniqueContacts.filter((prepared) => Boolean(resolveCompanyId(prepared)));
    for (const batch of chunk(contactsWithResolvedCompany)) {
      const { error } = await admin.from("lead_signals").insert(batch.map((prepared) => {
        const { mapped } = prepared.validation;
        const contactId = contactIdByEmail.get(mapped.email); const companyId = resolveCompanyId(prepared);
        if (!contactId || !companyId) throw new Error(`Could not resolve signal owner for ${mapped.email}.`);
        return { contact_id: contactId, company_id: companyId, no_right_tech_partner_raw: prepared.row["Priority: Havent Found Right Tech Partner"], outsourcing_apac_raw: prepared.row["Priority: Outsourcing to Asia-Pacific"], investing_chatbots_raw: prepared.row["Priority: Investing in Chatbots/Virtual Agents"], investing_voice_ai_raw: prepared.row["Priority: Investing in Voice/Speech AI"], investing_conversational_ivr_raw: prepared.row["Priority: Investing in Conversational IVR/Voicebots"], priority_score_raw: mapped.priorityRaw, priority_score_normalized: mapped.priority, call_volume_band_raw: prepared.row["Filter: Call Volume Band"], call_volume_match_100k_500k_raw: prepared.row["Filter: Call Volume Match (100K-500K)"], budgeting_period_raw: prepared.row["Filter: Budgeting Period"], budgeting_period_jul_year_end_raw: prepared.row["Filter: Budgeting Period Match (Jul-Year End)"], industry_auto_classified_raw: mapped.industry, pdf_match_confidence_raw: prepared.row["PDF Match Confidence"] };
      }));
      if (error) throw new Error(error.message);
    }

    const finalSummary: ImportSummary = { ...summary, importId: importRecord.id, contactsCreated: uniqueContacts.filter((prepared) => !existingEmails.has(prepared.validation.mapped.email)).length, contactsUpdated: uniqueContacts.filter((prepared) => existingEmails.has(prepared.validation.mapped.email)).length, companiesCreated: missingCompanies.length, companiesUpdated: seedByNormalizedCompany.size - missingCompanies.length };
    const { error: completeError } = await admin.from("lead_imports").update({ status: "completed", summary: finalSummary }).eq("id", importRecord.id);
    if (completeError) throw new Error(completeError.message);
    await admin.from("lead_imports").update({ status: "superseded" }).eq("status", "processing").neq("id", importRecord.id);
    return finalSummary;
  } catch (error) {
    await admin.from("lead_imports").update({ status: "failed", summary: { ...summary, error: error instanceof Error ? error.message : "Import failed" } }).eq("id", importRecord.id);
    throw error;
  }
}
