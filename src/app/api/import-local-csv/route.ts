import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";
import { importLeads } from "@/lib/import-leads";

export const runtime = "nodejs";
export async function POST() {
  try {
    const candidates = [join(process.cwd(), "data", "Klenty_Master_Call_List_Clean.csv"), join(process.cwd(), "Klenty_Master_Call_List_Clean.csv")];
    const path = candidates.find(existsSync); if (!path) throw new Error("Local CSV not found. Upload the CSV instead, or place it at /data/Klenty_Master_Call_List_Clean.csv for local development.");
    const parsed = Papa.parse<Record<string, string>>(readFileSync(path, "utf8"), { header: true, skipEmptyLines: "greedy" });
    const summary = await importLeads(parsed.data, parsed.meta.fields ?? [], path.split("/").pop() ?? "local.csv");
    return NextResponse.json({ summary });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Local import failed." }, { status: 400 }); }
}
