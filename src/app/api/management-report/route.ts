import { NextResponse } from "next/server";
import { buildManagementReport, type CallLogRow, type ReportFilters } from "@/lib/call-analytics";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CacheEntry = { expiresAt: number; rows: CallLogRow[]; contacts: number; latestImport: { created_at?: string; file_name?: string } | null };
let cache: CacheEntry | null = null;

async function loadSourceData() {
  if (cache && cache.expiresAt > Date.now()) return cache;
  const admin = createAdminSupabaseClient();
  const [{ count: callCount, error: callCountError }, { count: contactCount, error: contactCountError }, { data: latestImport, error: importError }] = await Promise.all([
    admin.from("klenty_call_logs").select("id", { count: "exact", head: true }),
    admin.from("contacts").select("id", { count: "exact", head: true }),
    admin.from("call_log_imports").select("created_at,file_name").order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);
  if (callCountError || contactCountError || importError) throw new Error(callCountError?.message || contactCountError?.message || importError?.message || "Could not load report metadata.");
  const select = "id,call_id,prospect_email,prospect_name,account_name,completed_at,call_source,prospect_status,call_type,purpose,call_status,call_notes,outcome,duration_seconds,shareable_link,from_number,to_number,job_title,persona_segment,industry";
  const pages = await Promise.all(Array.from({ length: Math.ceil((callCount ?? 0) / 1000) }, (_, index) => {
    const from = index * 1000;
    return admin.from("klenty_call_logs").select(select).order("completed_at", { ascending: false }).range(from, from + 999);
  }));
  const failed = pages.find((page) => page.error);
  if (failed?.error) throw new Error(failed.error.message);
  const rows = pages.flatMap((page) => (page.data ?? []) as CallLogRow[]);
  cache = { expiresAt: Date.now() + 45_000, rows, contacts: contactCount ?? 0, latestImport };
  return cache;
}

const optional = (params: URLSearchParams, key: string) => params.get(key)?.trim() || undefined;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: ReportFilters = {
      from: optional(searchParams, "from"),
      to: optional(searchParams, "to"),
      callSource: optional(searchParams, "callSource"),
      persona: optional(searchParams, "persona"),
      industry: optional(searchParams, "industry"),
      status: optional(searchParams, "status"),
      account: optional(searchParams, "account")
    };
    const source = await loadSourceData();
    return NextResponse.json(buildManagementReport(source.rows, filters, source.contacts, source.latestImport), {
      headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Management report unavailable." }, { status: 500 });
  }
}
