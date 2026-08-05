export const GENERIC_EMAIL_DOMAINS = new Set(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "aol.com", "proton.me", "protonmail.com"]);

export function normalizeText(value: unknown) { return String(value ?? "").trim().replace(/\s+/g, " "); }
export function normalizeCompanyName(value: unknown) { return normalizeText(value).toLowerCase().replace(/[.,]/g, "").replace(/\b(inc|llc|ltd|corp|corporation|company)\b/g, "").trim(); }
export function normalizeEmail(value: unknown) { return normalizeText(value).toLowerCase(); }
export function extractEmailDomain(email: string) { const match = normalizeEmail(email).match(/@([^\s@]+)$/); return match?.[1] ?? null; }
export function isGenericEmailDomain(domain: string | null) { return !domain || GENERIC_EMAIL_DOMAINS.has(domain); }
export function normalizePriorityScore(value: unknown) {
  const text = normalizeText(value).replace(/%/g, "");
  if (!text) return null;
  const numeric = Number(text);
  if (!Number.isFinite(numeric)) return null;
  return numeric <= 5 ? numeric * 20 : numeric;
}

export type CsvRow = Record<string, string>;
export function mapCsvRow(row: CsvRow) {
  const email = normalizeEmail(row["Email Address"]);
  const emailDomain = extractEmailDomain(email);
  return {
    firstName: normalizeText(row["First Name"]), lastName: normalizeText(row["Last Name"]),
    fullName: [normalizeText(row["First Name"]), normalizeText(row["Last Name"])].filter(Boolean).join(" "),
    company: normalizeText(row.Company), normalizedCompany: normalizeCompanyName(row.Company), email, emailDomain,
    companyDomain: isGenericEmailDomain(emailDomain) ? null : emailDomain,
    title: normalizeText(row["Job Title"]), persona: normalizeText(row.Persona), phone: normalizeText(row["Work Phone Number"]),
    industry: normalizeText(row["Filter: Industry (auto-classified)"]), country: normalizeText(row.Country),
    priorityRaw: normalizeText(row["Priority Score (0-5)"]), priority: normalizePriorityScore(row["Priority Score (0-5)"])
  };
}
