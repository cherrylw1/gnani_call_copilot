import { NextResponse } from "next/server";
import { getPracticeModelOptions } from "@/lib/voice-practice";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ models: getPracticeModelOptions() }, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
