import { NextResponse } from "next/server";
import { buildAccountMemory, loadPlanningSource } from "@/lib/planning-source";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const source = await loadPlanningSource();
    const memory = buildAccountMemory({ key: params.get("key") || undefined, companyId: params.get("companyId") || undefined, account: params.get("account") || undefined }, source.calls, source.contacts, source.companies, source.tasks);
    return NextResponse.json(memory, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Account memory unavailable." }, { status: 500 });
  }
}
