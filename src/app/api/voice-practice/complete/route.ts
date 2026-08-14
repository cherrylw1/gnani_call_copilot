import { NextResponse } from "next/server";
import { z } from "zod";
import { coachPracticeSession } from "@/lib/voice-practice";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const payloadSchema = z.object({ sessionId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const { sessionId } = payloadSchema.parse(await request.json());
    const admin = createAdminSupabaseClient();
    const { data: session, error: sessionError } = await admin.from("voice_practice_sessions").select("id, scenario, coaching, status").eq("id", sessionId).maybeSingle();
    if (sessionError) throw new Error(sessionError.message);
    if (!session) return NextResponse.json({ error: "Practice session not found." }, { status: 404 });
    if (session.coaching) return NextResponse.json({ coaching: session.coaching, cached: true });
    const { data: turns, error: turnsError } = await admin.from("voice_practice_turns").select("speaker, transcript").eq("session_id", sessionId).order("turn_index", { ascending: true });
    if (turnsError) throw new Error(turnsError.message);
    const { coaching, model } = await coachPracticeSession(session.scenario || {}, (turns || []).map((turn) => ({ role: turn.speaker === "seller" ? "user" as const : "buyer" as const, text: turn.transcript })));
    const { error: updateError } = await admin.from("voice_practice_sessions").update({ status: "completed", coaching, coaching_model: model, completed_at: new Date().toISOString() }).eq("id", sessionId);
    if (updateError) throw new Error(updateError.message);
    return NextResponse.json({ coaching, cached: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not generate coaching." }, { status: 400 });
  }
}
