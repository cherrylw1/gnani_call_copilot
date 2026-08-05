import { mapCsvRow, type CsvRow } from "./csv-normalization";

const REQUIRED_COLUMNS = ["First Name", "Last Name", "Company", "Email Address", "Persona"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function missingRequiredColumns(headers: string[]) { return REQUIRED_COLUMNS.filter((column) => !headers.includes(column)); }
export function validateCsvRow(row: CsvRow, headers: string[]) {
  const mapped = mapCsvRow(row); const notes: string[] = [];
  if (missingRequiredColumns(headers).length) notes.push("Required columns missing");
  if (!mapped.email || !emailPattern.test(mapped.email)) notes.push("Missing or invalid email");
  if (!mapped.company) notes.push("Missing company");
  if (mapped.priorityRaw && mapped.priority === null) notes.push("Malformed priority score");
  const hasLongCategorical = [mapped.persona, mapped.industry].some((value) => value.length > 160);
  if (hasLongCategorical) notes.push("Unexpectedly long categorical value");
  return { status: notes.length ? "needs_review" : "ok", notes, mapped } as const;
}
