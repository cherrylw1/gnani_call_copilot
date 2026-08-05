import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
export async function GET() {
  try { const admin = createAdminSupabaseClient(); const [contacts, companies, imports, calls, review] = await Promise.all([admin.from("contacts").select("id", { count: "exact", head: true }), admin.from("companies").select("id", { count: "exact", head: true }), admin.from("lead_imports").select("*").order("created_at", { ascending: false }).limit(5), admin.from("call_activities").select("*").order("created_at", { ascending: false }).limit(6), admin.from("raw_leads").select("id", { count: "exact", head: true }).eq("data_quality_status", "needs_review")]); return NextResponse.json({ contacts: contacts.count ?? 0, companies: companies.count ?? 0, imports: imports.data ?? [], activities: calls.data ?? [], qualityIssues: review.count ?? 0 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Dashboard unavailable." }, { status: 500 }); }
}
