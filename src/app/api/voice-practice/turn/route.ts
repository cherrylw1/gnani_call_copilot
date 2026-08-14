import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { practiceDifficultySchema, practiceModeSchema, respondToPracticeTurn } from "@/lib/voice-practice";

const payloadSchema = z.object({
  sessionId: z.string().uuid(),
  audioBase64: z.string().min(20).max(8_000_000),
  mimeType: z.string().min(3).max(100)
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = payloadSchema.parse(await request.json());
    const admin = createAdminSupabaseClient();
    const { data: session, error: sessionError } = await admin.from("voice_practice_sessions").select("id, selected_mode, difficulty, scenario, status, contact_id, company_id").eq("id", payload.sessionId).maybeSingle();
    if (sessionError) throw new Error(sessionError.message);
    if (!session) return NextResponse.json({ error: "Practice session not found." }, { status: 404 });
    if (session.status !== "active") return NextResponse.json({ error: "This practice session has already ended." }, { status: 409 });

    const [{ data: contact, error: contactError }, { data: company, error: companyError }, { data: card, error: cardError }, { data: turns, error: turnsError }] = await Promise.all([
      session.contact_id ? admin.from("contacts").select("*").eq("id", session.contact_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      session.company_id ? admin.from("companies").select("*").eq("id", session.company_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      session.contact_id ? admin.from("lead_intelligence_cards").select("*").eq("contact_id", session.contact_id).order("generated_at", { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null, error: null }),
      admin.from("voice_practice_turns").select("speaker, transcript").eq("session_id", session.id).order("turn_index", { ascending: true })
    ]);
    if (contactError || companyError || cardError || turnsError) throw new Error(contactError?.message || companyError?.message || cardError?.message || turnsError?.message || "Could not load practice context.");
    if (!contact) throw new Error("The source contact is no longer available.");

    const history = (turns || []).map((turn) => ({ role: turn.speaker === "seller" ? "user" as const : "buyer" as const, text: turn.transcript }));
    const response = await respondToPracticeTurn({
      mode: practiceModeSchema.parse(session.selected_mode),
      difficulty: practiceDifficultySchema.parse(session.difficulty),
      context: { contact, company, card },
      history,
      audioBase64: payload.audioBase64,
      mimeType: payload.mimeType
    });
    const nextIndex = (turns?.length || 0) + 1;
    const { error: turnError } = await admin.from("voice_practice_turns").insert([
      { session_id: session.id, turn_index: nextIndex, speaker: "seller", transcript: response.userTranscript, model: process.env.OPENROUTER_TRANSCRIPTION_MODEL || "openai/whisper-large-v3" },
      { session_id: session.id, turn_index: nextIndex + 1, speaker: "buyer", transcript: response.reply, model: response.model }
    ]);
    if (turnError) throw new Error(turnError.message);
    return NextResponse.json({ sellerTranscript: response.userTranscript, buyerTranscript: response.reply, audioBase64: response.audioBase64, audioMimeType: response.audioMimeType, model: response.model });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not process that practice turn." }, { status: 400 });
  }
}
