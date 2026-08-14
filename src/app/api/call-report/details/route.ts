import { NextResponse } from "next/server";
import { buildCallDetails, type CallDetailScope } from "@/lib/call-analytics";
import { loadCallReportSource, parseReportFilters } from "@/lib/call-report-source";

export const dynamic = "force-dynamic";

const scopes = new Set<CallDetailScope>(["all", "answered", "prospect", "status", "outcome", "campaign", "persona", "industry", "account", "outbound", "touchpoint", "day"]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedScope = searchParams.get("scope") as CallDetailScope | null;
    const scope = requestedScope && scopes.has(requestedScope) ? requestedScope : "all";
    const source = await loadCallReportSource();
    return NextResponse.json(buildCallDetails(source.rows, parseReportFilters(searchParams), {
      scope,
      value: searchParams.get("value") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: Number(searchParams.get("page") || 1),
      pageSize: Number(searchParams.get("pageSize") || 30)
    }), { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Call details unavailable." }, { status: 500 });
  }
}
