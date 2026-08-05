import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
export async function GET(request: Request) {
  try { const params = new URL(request.url).searchParams; const page = Math.max(1, Number(params.get("page") ?? 1)); const search = params.get("search")?.trim() ?? ""; const admin = createAdminSupabaseClient(); let query = admin.from("companies").select("*", { count: "exact" }).order("fit_score", { ascending: false }).range((page - 1) * 25, page * 25 - 1); if (search) query = query.or(`company_name.ilike.%${search}%,industry_auto_classified.ilike.%${search}%`); const { data, count, error } = await query; if (error) throw new Error(error.message); return NextResponse.json({ data, count: count ?? 0, page }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load companies." }, { status: 500 }); }
}
