import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { data, error } = await createAdminSupabaseClient().rpc("backfill_outreach_tasks");
    if (error) throw new Error(error.message);
    return NextResponse.json({ inserted: Number(data ?? 0) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Task scan failed." }, { status: 400 });
  }
}
