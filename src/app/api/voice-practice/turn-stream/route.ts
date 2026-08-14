import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  practiceDifficultySchema,
  practiceModeSchema,
  preparePracticeTurn,
  synthesizeGeminiPcm,
  type PracticeMessage,
  type PracticeScenario
} from "@/lib/voice-practice";

const payloadSchema = z.object({
  sessionId: z.string().uuid(),
  audioBase64: z.string().min(20).max(8_000_000),
  mimeType: z.string().min(3).max(100)
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function event(name: string, payload: unknown) {
  return encoder.encode(`event: ${name}\ndata: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(request: Request) {
  let payload: z.infer<typeof payloadSchema>;
  try {
    payload = payloadSchema.parse(await request.json());
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid practice turn." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (name: string, body: unknown) => controller.enqueue(event(name, body));
      try {
        const admin = createAdminSupabaseClient();
        const { data: session, error: sessionError } = await admin
          .from("voice_practice_sessions")
          .select("id, selected_mode, difficulty, scenario, status")
          .eq("id", payload.sessionId)
          .maybeSingle();
        if (sessionError) throw new Error(sessionError.message);
        if (!session) throw new Error("Practice session not found.");
        if (session.status !== "active") throw new Error("This practice session has already ended.");

        const mode = practiceModeSchema.parse(session.selected_mode);
        if (mode !== "fish" && mode !== "gemini_tts") {
          throw new Error("This session uses a retired voice mode. Start a new practice call with Gemini 3.1 Voice or Fish Voice.");
        }

        const { data: storedTurns, error: turnsError } = await admin
          .from("voice_practice_turns")
          .select("speaker, transcript")
          .eq("session_id", session.id)
          .order("turn_index", { ascending: true });
        if (turnsError) throw new Error(turnsError.message);

        const history: PracticeMessage[] = (storedTurns || []).map((turn) => ({
          role: turn.speaker === "seller" ? "user" : "buyer",
          text: turn.transcript
        }));
        const prepared = await preparePracticeTurn({
          difficulty: practiceDifficultySchema.parse(session.difficulty),
          scenario: (session.scenario || {}) as PracticeScenario,
          history,
          audioBase64: payload.audioBase64,
          mimeType: payload.mimeType
        });

        send("seller", { text: prepared.userTranscript });
        send("buyer", { text: prepared.reply });

        let voiceModel: string;
        if (mode === "gemini_tts") {
          const speech = await synthesizeGeminiPcm(prepared.reply);
          voiceModel = speech.model;
          const reader = speech.stream.getReader();
          let remainder = Buffer.alloc(0);
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value?.byteLength) {
              const bytes = Buffer.concat([remainder, Buffer.from(value)]);
              const completeLength = bytes.length - (bytes.length % 2);
              if (completeLength) send("audio", { data: bytes.subarray(0, completeLength).toString("base64"), sampleRate: speech.sampleRate });
              remainder = completeLength === bytes.length ? Buffer.alloc(0) : bytes.subarray(completeLength);
            }
          }
        } else {
          // Fish's OpenRouter response is a completed MP3, so it remains an alternate
          // turn-based voice while Gemini is the low-latency streamed default.
          const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: process.env.OPENROUTER_FISH_TTS_MODEL || "fish-audio/s2.1-pro-free:free",
              input: prepared.reply,
              response_format: "mp3",
              ...(process.env.OPENROUTER_FISH_VOICE?.trim() ? { voice: process.env.OPENROUTER_FISH_VOICE.trim() } : {})
            })
          });
          if (!response.ok) throw new Error(`Fish voice generation failed (${response.status}).`);
          const bytes = await response.arrayBuffer();
          if (!bytes.byteLength) throw new Error("Fish voice generation returned no audio.");
          voiceModel = process.env.OPENROUTER_FISH_TTS_MODEL || "fish-audio/s2.1-pro-free:free";
          send("audio-complete", { data: Buffer.from(bytes).toString("base64"), mimeType: response.headers.get("content-type") || "audio/mpeg" });
        }

        const nextIndex = (storedTurns?.length || 0) + 1;
        const { error: writeError } = await admin.from("voice_practice_turns").insert([
          { session_id: session.id, turn_index: nextIndex, speaker: "seller", transcript: prepared.userTranscript, model: process.env.OPENROUTER_TRANSCRIPTION_MODEL || "openai/whisper-large-v3" },
          { session_id: session.id, turn_index: nextIndex + 1, speaker: "buyer", transcript: prepared.reply, model: `${prepared.model} + ${voiceModel}` }
        ]);
        if (writeError) throw new Error(writeError.message);
        send("done", { model: `${prepared.model} + ${voiceModel}` });
      } catch (error) {
        send("error", { message: error instanceof Error ? error.message : "Could not process that practice turn." });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}
