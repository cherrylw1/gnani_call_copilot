import { NextResponse } from "next/server";
import { buildPlanningCenter } from "@/lib/planning-analytics";
import { loadPlanningSource } from "@/lib/planning-source";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const source = await loadPlanningSource();
    return NextResponse.json(buildPlanningCenter(source.calls, source.contacts, source.companies, source.tasks), { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Planning data unavailable." }, { status: 500 });
  }
}
