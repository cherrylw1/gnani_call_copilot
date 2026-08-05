import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
export async function GET(request: Request) {
  try { const params = new URL(request.url).searchParams; const page = Math.max(1, Number(params.get("page") ?? 1)); const search = params.get("search")?.trim() ?? ""; const admin = createAdminSupabaseClient(); let query = admin.from("contacts").select("*", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * 25, page * 25 - 1); if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,job_title.ilike.%${search}%`); const { data, count, error } = await query; if (error) throw new Error(error.message); return NextResponse.json({ data, count: count ?? 0, page }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load contacts." }, { status: 500 }); }
}
