import { NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { importLeads } from "@/lib/import-leads";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const formData = await request.formData(); const file = z.instanceof(File).parse(formData.get("file"));
    const text = await file.text(); const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: "greedy" });
    if (parsed.errors.length && !parsed.data.length) throw new Error("Could not parse the CSV file.");
    const headers = parsed.meta.fields ?? []; const summary = await importLeads(parsed.data, headers, file.name);
    return NextResponse.json({ summary });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "CSV import failed." }, { status: 400 }); }
}
