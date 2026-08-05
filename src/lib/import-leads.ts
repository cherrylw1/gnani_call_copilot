import { calculateFitScore } from "./lead-scoring";
import { classifyLead } from "./lead-classification";
import { normalizeText, type CsvRow } from "./csv-normalization";
import { missingRequiredColumns, validateCsvRow } from "./csv-validation";
import { createAdminSupabaseClient } from "./supabase/admin";

export type ImportSummary = { totalRows: number; validRows: number; duplicateEmails: number; missingEmails: number; uniqueCompanies: number; uniqueDomains: number; rowsNeedingReview: number; contactsCreated: number; contactsUpdated: number; companiesCreated: number; companiesUpdated: number; topPersonas: [string, number][]; topIndustries: [string, number][]; countries: [string, number][]; requiredColumnsMissing: string[] };
const countTop = (values: string[]) => Object.entries(values.reduce<Record<string, number>>((out, value) => { if (value) out[value] = (out[value] ?? 0) + 1; return out; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 10) as [string, number][];

export function summarizeRows(rows: CsvRow[], headers: string[]): ImportSummary {
  const emails = new Map<string, number>(); const companies = new Set<string>(); const domains = new Set<string>();
  let validRows = 0; let missingEmails = 0; let rowsNeedingReview = 0;
  for (const row of rows) { const validation = validateCsvRow(row, headers); const mapped = validation.mapped; if (validation.status === "ok") validRows++; else rowsNeedingReview++; if (!mapped.email) missingEmails++; else emails.set(mapped.email, (emails.get(mapped.email) ?? 0) + 1); if (mapped.normalizedCompany) companies.add(mapped.normalizedCompany); if (mapped.companyDomain) domains.add(mapped.companyDomain); }
  return { totalRows: rows.length, validRows, missingEmails, rowsNeedingReview, duplicateEmails: [...emails.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0), uniqueCompanies: companies.size, uniqueDomains: domains.size, contactsCreated: 0, contactsUpdated: 0, companiesCreated: 0, companiesUpdated: 0, topPersonas: countTop(rows.map((row) => normalizeText(row.Persona))), topIndustries: countTop(rows.map((row) => normalizeText(row["Filter: Industry (auto-classified)"]))), countries: countTop(rows.map((row) => normalizeText(row.Country))), requiredColumnsMissing: missingRequiredColumns(headers) };
}

export async function importLeads(rows: CsvRow[], headers: string[], fileName: string) {
  const admin = createAdminSupabaseClient(); const summary = summarizeRows(rows, headers);
  const { data: importRecord, error: importError } = await admin.from("lead_imports").insert({ file_name: fileName, total_rows: summary.totalRows, valid_rows: summary.validRows, duplicate_email_count: summary.duplicateEmails, status: "processing", summary }).select().single();
  if (importError) throw new Error(importError.message);
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]; const validation = validateCsvRow(row, headers); const mapped = validation.mapped;
    const { data: raw, error: rawError } = await admin.from("raw_leads").insert({ import_id: importRecord.id, row_number: index + 1, raw_data: row, data_quality_status: validation.status, data_quality_notes: validation.notes.join("; ") || null }).select().single();
    if (rawError) throw new Error(rawError.message);
    if (!mapped.email || !mapped.company) continue;
    const { data: existingCompany } = await admin.from("companies").select("id").eq("normalized_company_name", mapped.normalizedCompany).limit(1).maybeSingle();
    let companyId = existingCompany?.id;
    const score = calculateFitScore({ priority: mapped.priority, industry: mapped.industry, persona: mapped.persona, company: mapped.company, voice: row["Priority: Investing in Voice/Speech AI"], chatbot: row["Priority: Investing in Chatbots/Virtual Agents"], ivr: row["Priority: Investing in Conversational IVR/Voicebots"], callVolume: row["Filter: Call Volume Band"], budget: row["Filter: Budgeting Period"], previousOutreach: row["Previous Outreach"] });
    if (!companyId) { const { data, error } = await admin.from("companies").insert({ company_name: mapped.company, normalized_company_name: mapped.normalizedCompany, domain: mapped.companyDomain, website_url: mapped.companyDomain ? `https://${mapped.companyDomain}` : null, industry_auto_classified: mapped.industry, country_primary: mapped.country, buyer_partner_competitor_status: classifyLead(mapped.industry, mapped.company, validation.status === "needs_review"), fit_score: score }).select().single(); if (error) throw new Error(error.message); companyId = data.id; summary.companiesCreated++; } else summary.companiesUpdated++;
    const { data: existingContact } = await admin.from("contacts").select("id").eq("email", mapped.email).maybeSingle();
    const contactPayload = { raw_lead_id: raw.id, company_id: companyId, first_name: mapped.firstName, last_name: mapped.lastName, full_name: mapped.fullName, job_title: mapped.title, persona: mapped.persona, email: mapped.email, email_domain: mapped.emailDomain, work_phone: mapped.phone, street_address: normalizeText(row["Street Address"]), city: normalizeText(row.City), state: normalizeText(row.State), zip_code: normalizeText(row["Zip Code"]), country: mapped.country, previous_outreach: normalizeText(row["Previous Outreach"]) };
    const { data: contact, error: contactError } = existingContact ? await admin.from("contacts").update(contactPayload).eq("id", existingContact.id).select().single() : await admin.from("contacts").insert(contactPayload).select().single();
    if (contactError) throw new Error(contactError.message);
    if (existingContact) summary.contactsUpdated++;
    else summary.contactsCreated++;
    await admin.from("lead_signals").insert({ contact_id: contact.id, company_id: companyId, no_right_tech_partner_raw: row["Priority: Havent Found Right Tech Partner"], outsourcing_apac_raw: row["Priority: Outsourcing to Asia-Pacific"], investing_chatbots_raw: row["Priority: Investing in Chatbots/Virtual Agents"], investing_voice_ai_raw: row["Priority: Investing in Voice/Speech AI"], investing_conversational_ivr_raw: row["Priority: Investing in Conversational IVR/Voicebots"], priority_score_raw: mapped.priorityRaw, priority_score_normalized: mapped.priority, call_volume_band_raw: row["Filter: Call Volume Band"], call_volume_match_100k_500k_raw: row["Filter: Call Volume Match (100K-500K)"], budgeting_period_raw: row["Filter: Budgeting Period"], budgeting_period_jul_year_end_raw: row["Filter: Budgeting Period Match (Jul-Year End)"], industry_auto_classified_raw: mapped.industry, pdf_match_confidence_raw: row["PDF Match Confidence"] });
  }
  await admin.from("lead_imports").update({ status: "completed", summary }).eq("id", importRecord.id);
  return summary;
}
