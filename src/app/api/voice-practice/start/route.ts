import { NextResponse } from "next/server";
import { z } from "zod";
import { getContactContext } from "@/lib/contact-context";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { assertPracticeModelAvailable, buildScenarioSnapshot, practiceDifficultySchema, practiceModeSchema } from "@/lib/voice-practice";

const payloadSchema = z.object({ email: z.string().email(), mode: practiceModeSchema, difficulty: practiceDifficultySchema });

export async function POST(request: Request) {
  try {
    const payload = payloadSchema.parse(await request.json());
    assertPracticeModelAvailable(payload.mode);
    const context = await getContactContext(payload.email);
    if (!context) return NextResponse.json({ error: "No imported contact was found for this email." }, { status: 404 });
    const scenario = buildScenarioSnapshot(context, payload.difficulty);
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.from("voice_practice_sessions").insert({
      contact_id: context.contact.id,
      company_id: context.company?.id || null,
      selected_mode: payload.mode,
      difficulty: payload.difficulty,
      scenario
    }).select("id, selected_mode, difficulty, scenario, started_at").single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ session: data, context: { contact: context.contact, company: context.company, card: context.card } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not start practice." }, { status: 400 });
  }
}
