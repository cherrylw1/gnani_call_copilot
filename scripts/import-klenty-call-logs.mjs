import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Usage: node --env-file=.env.local scripts/import-klenty-call-logs.mjs <csv-path>");
for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (!process.env[key]) throw new Error(`Missing ${key}.`);
}

const SOURCE_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 330;
const BATCH_SIZE = 300;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const text = (value) => String(value ?? "").trim();
const lower = (value) => text(value).toLowerCase();
const hash = (value) => createHash("sha256").update(value).digest("hex");
const chunk = (items, size = BATCH_SIZE) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));

function normalizePersona(value) {
  const raw = lower(value);
  if (raw.includes("executive") || raw.includes("coo") || raw.includes("general management")) return "Executive Operations";
  if (raw.includes("customer experience") || raw.includes("cx") || raw.includes("customer success")) return "Customer Experience";
  if (raw.includes("product") || raw.includes("technology") || raw.includes(" it ") || raw.startsWith("it ")) return "Product, IT & Technology";
  if (raw.includes("sales") || raw.includes("revenue") || raw.includes("growth")) return "Sales & Revenue Growth";
  if (raw.includes("marketing") || raw.includes("brand")) return "Marketing & Brand";
  if (raw.includes("hr") || raw.includes("training") || raw.includes("quality")) return "HR, Training & Quality";
  if (raw.includes("operations") || raw.includes("customer service") || raw.includes("contact center")) return "Operations & Customer Service";
  return text(value) || "Other";
}

function normalizeIndustry(value) {
  const raw = lower(value);
  if (!raw || raw === "unclassified" || raw === "other") return "Other / Unclassified";
  if (raw.includes("health")) return "Healthcare & Life Sciences";
  if (raw.includes("bank") || raw.includes("bfsi") || raw.includes("fintech") || raw.includes("financial") || raw.includes("insurance") || raw.includes("payment") || raw.includes("mortgage") || raw.includes("loan") || raw.includes("credit union")) return "BFSI & Insurance";
  if (raw.includes("bpo") || raw.includes("outsourc") || raw.includes("contact center")) return "BPO & Contact Center Services";
  if (raw.includes("cx technology") || raw.includes("software") || raw.includes("technology") || raw.includes("cloud") || raw.includes("telecom")) return "Technology & Telecom";
  if (raw.includes("retail") || raw.includes("consumer") || raw.includes("e-commerce") || raw.includes("ecommerce") || raw.includes("food")) return "Retail & Consumer";
  if (raw.includes("travel") || raw.includes("hospitality") || raw.includes("airline") || raw.includes("transport")) return "Travel, Hospitality & Transportation";
  if (raw.includes("utilit") || raw.includes("energy") || raw.includes("government") || raw.includes("public sector") || raw.includes("municipal")) return "Utilities & Public Sector";
  if (raw.includes("business service") || raw.includes("professional service") || raw.includes("consult")) return "Business & Professional Services";
  if (raw.includes("manufactur") || raw.includes("industrial") || raw.includes("automotive")) return "Manufacturing & Automotive";
  if (raw.includes("media") || raw.includes("entertainment") || raw.includes("publishing")) return "Media & Entertainment";
  if (raw.includes("education") || raw.includes("nonprofit") || raw.includes("association")) return "Education & Nonprofit";
  return text(value);
}

function parseIstTimestamp(value) {
  const match = text(value).match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)\s+(\d{4}),\s+(\d{1,2}):(\d{2}):(\d{2})\s+(am|pm)$/i);
  if (!match) throw new Error(`Unrecognized Completed Date: ${value}`);
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const month = months.indexOf(match[1].toLowerCase());
  if (month < 0) throw new Error(`Unrecognized month: ${match[1]}`);
  let hour = Number(match[4]) % 12;
  if (match[7].toLowerCase() === "pm") hour += 12;
  const utcMs = Date.UTC(Number(match[3]), month, Number(match[2]), hour, Number(match[5]), Number(match[6])) - IST_OFFSET_MINUTES * 60_000;
  return new Date(utcMs).toISOString();
}

async function fetchAll(table, select) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) return rows;
  }
}

const csvText = await readFile(inputPath, "utf8");
const fingerprint = hash(csvText);
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true, transformHeader: (header) => header.replace(/^\uFEFF/, "").trim() });
if (parsed.errors.length) throw new Error(`CSV parse failed: ${parsed.errors[0].message}`);

const rows = parsed.data;
const headers = new Set(parsed.meta.fields ?? []);
const cleanExport = headers.has("Call Date") && headers.has("Call Status") && headers.has("Email Address");
const requiredHeaders = cleanExport
  ? ["Call Date", "Call Time", "Prospect Name", "Job Title", "Company / Account", "Industry", "Persona Segment", "Phone Number", "Email Address", "Call Status", "Duration (Secs)", "Outcome Summary", "Call Notes", "Caller", "Recording / Shareable Link"]
  : ["Call Id", "Prospect EmailId", "Completed Date", "Prospect", "Call Source", "Status", "Account", "To Number", "From Number", "Job Title", "Persona Segment", "Industry"];
const missing = requiredHeaders.filter((header) => !headers.has(header));
if (missing.length) throw new Error(`Missing required headers: ${missing.join(", ")}`);

const sourceLabel = cleanExport ? basename(inputPath).replace(/\.csv$/i, "") : null;
const canonicalRow = (row) => cleanExport ? {
  "Call Id": "",
  "Prospect EmailId": text(row["Email Address"]),
  "Completed Date": `${text(row["Call Date"])}, ${text(row["Call Time"])}`,
  Prospect: text(row["Prospect Name"]),
  "Call Source": sourceLabel,
  "Prospect Status": "",
  "Call Type": "",
  Purpose: "",
  Status: text(row["Call Status"]),
  "Call Notes": text(row["Call Notes"]),
  Account: text(row["Company / Account"]),
  "To Number": text(row["Phone Number"]),
  "Call Placed By": text(row.Caller),
  Outcome: text(row["Outcome Summary"]),
  "Call Duration (in secs)": text(row["Duration (Secs)"]),
  "Call shareable link": text(row["Recording / Shareable Link"]),
  "From Number": "",
  "Job Title": text(row["Job Title"]),
  "Persona Segment": text(row["Persona Segment"]),
  Industry: text(row.Industry)
} : row;

const [contacts, previousImport] = await Promise.all([
  fetchAll("contacts", "id,email,company_id"),
  supabase.from("call_log_imports").select("id,imported_rows").eq("file_fingerprint", fingerprint).maybeSingle()
]);
if (previousImport.error) throw new Error(previousImport.error.message);
const contactByEmail = new Map(contacts.map((contact) => [lower(contact.email), contact]));

let importId = previousImport.data?.id;
if (!importId) {
  const { data, error } = await supabase.from("call_log_imports").insert({
    file_name: basename(inputPath), file_fingerprint: fingerprint, source_timezone: SOURCE_TIMEZONE, source_rows: rows.length
  }).select("id").single();
  if (error) throw new Error(error.message);
  importId = data.id;
}

const preparedRows = rows.map((row) => {
  const canonical = canonicalRow(row);
  const callId = text(canonical["Call Id"]);
  const email = lower(canonical["Prospect EmailId"]);
  const contact = contactByEmail.get(email);
  const completedAt = parseIstTimestamp(canonical["Completed Date"]);
  const fallbackIdentity = [email, completedAt, text(canonical["To Number"]), text(canonical["From Number"]), text(canonical.Status), text(canonical["Call Duration (in secs)"]), text(canonical["Call Source"])].join("|");
  const duration = Number.parseInt(text(canonical["Call Duration (in secs)"]), 10);
  return {
    import_id: importId,
    call_id: callId || null,
    dedupe_key: callId ? `call:${callId}` : `fallback:${hash(fallbackIdentity)}`,
    contact_id: contact?.id ?? null,
    company_id: contact?.company_id ?? null,
    prospect_email: email,
    prospect_name: text(canonical.Prospect),
    account_name: text(canonical.Account),
    completed_at: completedAt,
    completed_at_raw: text(canonical["Completed Date"]),
    source_timezone: SOURCE_TIMEZONE,
    call_source: text(canonical["Call Source"]),
    prospect_status: text(canonical["Prospect Status"]),
    call_type: text(canonical["Call Type"]) || null,
    purpose: text(canonical.Purpose) || null,
    call_status: text(canonical.Status),
    call_notes: text(canonical["Call Notes"]) || null,
    to_number: text(canonical["To Number"]) || null,
    call_placed_by: text(canonical["Call Placed By"]) || null,
    outcome: text(canonical.Outcome) || null,
    duration_seconds: Number.isFinite(duration) ? duration : null,
    shareable_link: text(canonical["Call shareable link"]) || null,
    from_number: text(canonical["From Number"]) || null,
    job_title: text(canonical["Job Title"]) || null,
    persona_segment_raw: text(canonical["Persona Segment"]) || null,
    persona_segment: normalizePersona(canonical["Persona Segment"]),
    industry_raw: text(canonical.Industry) || null,
    industry: normalizeIndustry(canonical.Industry)
  };
});

// A clean export can contain the same call more than once (for example, a
// repeated row with the same timestamp, phone, status, and duration). The
// fallback identity intentionally maps those rows to one stable key. Remove
// duplicates before batching so Postgres does not receive the same conflict
// key twice in one upsert statement.
const prepared = [...new Map(preparedRows.map((row) => [row.dedupe_key, row])).values()];
if (prepared.length !== preparedRows.length) {
  console.log(`Skipped ${preparedRows.length - prepared.length} duplicate row(s) within the source file.`);
}

let imported = 0;
for (const batch of chunk(prepared)) {
  const { error } = await supabase.from("klenty_call_logs").upsert(batch, { onConflict: "dedupe_key" });
  if (error) throw new Error(`Call-log import failed after ${imported} rows: ${error.message}`);
  imported += batch.length;
  if (imported % 1500 === 0 || imported === prepared.length) console.log(`Imported ${imported}/${prepared.length}`);
}

const statusCounts = prepared.reduce((out, row) => ({ ...out, [row.call_status]: (out[row.call_status] ?? 0) + 1 }), {});
const summary = {
  sourceRows: rows.length,
  uniqueProspects: new Set(prepared.map((row) => row.prospect_email)).size,
  uniqueAccounts: new Set(prepared.map((row) => lower(row.account_name))).size,
  matchedContacts: new Set(prepared.filter((row) => row.contact_id).map((row) => row.prospect_email)).size,
  statusCounts
};
const { error: updateError } = await supabase.from("call_log_imports").update({ imported_rows: imported, summary }).eq("id", importId);
if (updateError) throw new Error(updateError.message);

const { data: tasksCreated, error: taskError } = await supabase.rpc("backfill_outreach_tasks");
if (taskError) console.warn(`Call logs imported, but task backfill did not run: ${taskError.message}`);

console.log(JSON.stringify({ importId, ...summary, tasksCreated: Number(tasksCreated ?? 0) }, null, 2));
