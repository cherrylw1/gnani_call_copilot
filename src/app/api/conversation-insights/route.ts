import { NextResponse } from "next/server";
import { buildConversationInsights } from "@/lib/conversation-analytics";
import { loadCallReportSource, parseReportFilters } from "@/lib/call-report-source";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = await loadCallReportSource();
    return NextResponse.json(buildConversationInsights(source.rows, parseReportFilters(searchParams), source.latestImport), {
      headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Conversation insights unavailable." }, { status: 500 });
  }
}
