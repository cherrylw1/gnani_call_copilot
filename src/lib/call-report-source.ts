import type { CallLogRow } from "@/lib/call-analytics";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type SourceCache = {
  expiresAt: number;
  rows: CallLogRow[];
  contacts: number;
  latestImport: { created_at?: string; file_name?: string } | null;
};

let cache: SourceCache | null = null;

export async function loadCallReportSource() {
  if (cache && cache.expiresAt > Date.now()) return cache;
  const admin = createAdminSupabaseClient();
  const [{ count: callCount, error: callCountError }, { count: contactCount, error: contactCountError }, { data: latestImport, error: importError }] = await Promise.all([
    admin.from("klenty_call_logs").select("id", { count: "exact", head: true }),
    admin.from("contacts").select("id", { count: "exact", head: true }),
    admin.from("call_log_imports").select("created_at,file_name").order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);
  if (callCountError || contactCountError || importError) {
    throw new Error(callCountError?.message || contactCountError?.message || importError?.message || "Could not load call data.");
  }
  const select = "id,call_id,contact_id,company_id,prospect_email,prospect_name,account_name,completed_at,call_source,prospect_status,call_type,purpose,call_status,call_notes,outcome,duration_seconds,shareable_link,from_number,to_number,job_title,persona_segment,industry";
  const pages = await Promise.all(Array.from({ length: Math.ceil((callCount ?? 0) / 1000) }, (_, index) => {
    const from = index * 1000;
    return admin.from("klenty_call_logs").select(select).order("completed_at", { ascending: false }).range(from, from + 999);
  }));
  const failed = pages.find((page) => page.error);
  if (failed?.error) throw new Error(failed.error.message);
  cache = {
    expiresAt: Date.now() + 45_000,
    rows: pages.flatMap((page) => (page.data ?? []) as CallLogRow[]),
    contacts: contactCount ?? 0,
    latestImport
  };
  return cache;
}

export function parseReportFilters(params: URLSearchParams) {
  const optional = (key: string) => params.get(key)?.trim() || undefined;
  return {
    from: optional("from"),
    to: optional("to"),
    callSource: optional("callSource"),
    persona: optional("persona"),
    industry: optional("industry"),
    status: optional("status"),
    account: optional("account")
  };
}
