import "server-only";

import { z } from "zod";
import { buildScript, classifySegment, type SegmentId } from "@/lib/ccw-executive-scripts";
import { openRouterJson, openRouterText } from "@/lib/openrouter";

export const practiceModeSchema = z.enum(["fish", "gpt_audio_mini", "gemini_live"]);
export const practiceDifficultySchema = z.enum(["receptive", "busy", "skeptical", "technical"]);
export type PracticeMode = z.infer<typeof practiceModeSchema>;
export type PracticeDifficulty = z.infer<typeof practiceDifficultySchema>;

export type PracticeContext = {
  contact: Record<string, unknown>;
  company: Record<string, unknown> | null;
  card: Record<string, unknown> | null;
};

export type PracticeMessage = { role: "user" | "buyer"; text: string };

type AudioReply = { reply: string; audioBase64: string; audioMimeType: string; model: string };

const FISH_TTS_MODEL = "fish-audio/s2.1-pro-free:free";
const GPT_AUDIO_MODEL = "openai/gpt-audio-mini";
const TRANSCRIPTION_MODEL = "openai/whisper-large-v3";

function getRouterKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OpenRouter is not configured for Voice Practice.");
  return key;
}

export function getPracticeModelOptions() {
  const hasRouter = Boolean(process.env.OPENROUTER_API_KEY);
  const geminiModel = process.env.OPENROUTER_GEMINI_LIVE_MODEL?.trim();
  return [
    {
      id: "fish" as const,
      label: "Fish Voice",
      model: process.env.OPENROUTER_FISH_TTS_MODEL || FISH_TTS_MODEL,
      detail: "Fish voice with server transcription and the saved Gnani buyer scenario.",
      available: hasRouter,
      nativeAudio: false
    },
    {
      id: "gpt_audio_mini" as const,
      label: "GPT Audio Mini",
      model: process.env.OPENROUTER_GPT_AUDIO_MODEL || GPT_AUDIO_MODEL,
      detail: "Native audio conversation through OpenRouter.",
      available: hasRouter,
      nativeAudio: true
    },
    {
      id: "gemini_live" as const,
      label: "Gemini Live",
      model: geminiModel || "Model ID required",
      detail: geminiModel
        ? "Native audio conversation through the configured OpenRouter model."
        : "Enable by adding the exact OpenRouter Gemini Live model ID to Vercel.",
      available: hasRouter && Boolean(geminiModel),
      nativeAudio: true
    }
  ];
}

export function assertPracticeModelAvailable(mode: PracticeMode) {
  const option = getPracticeModelOptions().find((item) => item.id === mode);
  if (!option?.available) {
    if (mode === "gemini_live") {
      throw new Error("Gemini Live needs an exact OPENROUTER_GEMINI_LIVE_MODEL value before it can be started.");
    }
    throw new Error("Voice Practice is not configured on this deployment.");
  }
  return option;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function compact(value: unknown, limit: number) {
  return stringValue(value).replace(/\s+/g, " ").slice(0, limit);
}

function difficultyBrief(difficulty: PracticeDifficulty) {
  if (difficulty === "receptive") return "You are polite and reasonably open, but still protect your time and ask a practical question before agreeing to a next step.";
  if (difficulty === "busy") return "You are between meetings, give short answers, and make the seller earn one more minute of attention.";
  if (difficulty === "skeptical") return "You have seen generic Voice AI pitches before. Challenge unsupported claims and ask how this differs from the existing stack.";
  return "You are technically informed. Ask about architecture, latency, integration boundaries, security, and how the proposed workflow would operate.";
}

function scenarioDetails(context: PracticeContext) {
  const contact = context.contact;
  const company = context.company;
  const title = stringValue(contact.job_title, stringValue(contact.persona, "business leader"));
  const firstName = stringValue(contact.first_name, "there");
  const companyName = stringValue(company?.company_name, "the company");
  const industry = stringValue(company?.industry_auto_classified, "");
  const segment = classifySegment(title, stringValue(contact.persona));
  const script = buildScript(segment, { firstName, companyName, title, industry });
  const companyOverview = compact(context.card?.company_overview || company?.research_summary || company?.company_description, 850);
  const accountBrief = compact(context.card?.account_brief, 850);
  return { firstName, title, companyName, industry, segment, script, companyOverview, accountBrief };
}

export function buildScenarioSnapshot(context: PracticeContext, difficulty: PracticeDifficulty) {
  const details = scenarioDetails(context);
  return {
    prospect_name: details.firstName,
    simulated_role: details.title,
    company_name: details.companyName,
    industry: details.industry || null,
    segment: details.segment,
    difficulty,
    company_overview: details.companyOverview || null,
    account_brief: details.accountBrief || null,
    coach_focus: details.script.decisionCurrency,
    recommended_products: details.script.products
  };
}

function buyerPrompt(context: PracticeContext, difficulty: PracticeDifficulty, history: PracticeMessage[]) {
  const details = scenarioDetails(context);
  const transcript = history.slice(-10).map((message) => `${message.role === "user" ? "Sharath" : "Buyer"}: ${message.text}`).join("\n");
  return `You are a simulated buyer for a private cold-call practice session. You are not the real ${details.firstName}; never claim to be them. You are a ${details.title} at ${details.companyName}.

Company context (use only when relevant; do not invent facts):
${details.companyOverview || "No verified company research is available. Keep company-specific claims cautious."}

Account context:
${details.accountBrief || "No additional account brief is available."}

The seller is practicing a Gnani.ai CCW follow-up. Their segment is ${details.script.label}. Their relevant Gnani products are ${details.script.products}. Their likely decision criteria are: ${details.script.decisionCurrency}

Your behavior: ${difficultyBrief(difficulty)}

Rules:
- Speak like a busy US enterprise buyer on a phone call, not a coach.
- Stay within 8-34 words. One or two sentences only.
- React to what the seller actually said. Do not volunteer a pitch for Gnani.
- Do not invent company systems, budgets, projects, or event attendance.
- You can use realistic objections: time, existing tools, unclear relevance, wrong owner, proof, security, or a narrower use case.
- Do not use the phrase "Did I catch you at a bad time?".
- If the seller earns a next step, acknowledge it naturally but do not book a meeting on their behalf.

Conversation so far:
${transcript || "The seller has not spoken yet."}

Reply as the simulated buyer only.`;
}

function coachingPrompt(snapshot: Record<string, unknown>, turns: PracticeMessage[]) {
  const transcript = turns.map((turn) => `${turn.role === "user" ? "Sharath" : "Buyer"}: ${turn.text}`).join("\n");
  return `You are an exacting sales-call coach. Assess a practice cold call using only this transcript and the provided scenario. Do not invent performance details.

Scenario:
${JSON.stringify(snapshot)}

Approved opening shape:
${buildScript(snapshot.segment as SegmentId, {
  firstName: String(snapshot.prospect_name || "there"),
  companyName: String(snapshot.company_name || "the company"),
  title: String(snapshot.simulated_role || ""),
  industry: String(snapshot.industry || "")
}).opening}

Transcript:
${transcript || "No spoken turns were captured."}

Return valid JSON only:
{
  "overall_score": 1-5,
  "summary": "one concise evidence-based assessment",
  "strengths": ["up to three specific strengths"],
  "improvements": ["up to three specific, actionable improvements"],
  "next_repetition": "one short phrase or behavior to practice next",
  "signals": { "clear_relevance": 1-5, "discovery": 1-5, "objection_handling": 1-5, "next_step": 1-5 }
}

Score only what occurred. If there are too few turns, say that clearly and keep scores conservative.`;
}

const coachingSchema = z.object({
  overall_score: z.number().min(1).max(5),
  summary: z.string().min(1).max(600),
  strengths: z.array(z.string().min(1).max(300)).max(3),
  improvements: z.array(z.string().min(1).max(300)).max(3),
  next_repetition: z.string().min(1).max(300),
  signals: z.object({
    clear_relevance: z.number().min(1).max(5),
    discovery: z.number().min(1).max(5),
    objection_handling: z.number().min(1).max(5),
    next_step: z.number().min(1).max(5)
  })
});

export async function coachPracticeSession(snapshot: Record<string, unknown>, turns: PracticeMessage[]) {
  const result = await openRouterJson<unknown>(coachingPrompt(snapshot, turns), 700);
  return { coaching: coachingSchema.parse(result.data), model: result.model };
}

async function transcribeAudio(audioBase64: string, format: string) {
  const response = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${getRouterKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ input_audio: { data: audioBase64, format }, language: "en", model: process.env.OPENROUTER_TRANSCRIPTION_MODEL || TRANSCRIPTION_MODEL })
  });
  if (!response.ok) throw new Error(`Transcription failed (${response.status}).`);
  const data = await response.json() as { text?: string };
  const text = data.text?.trim();
  if (!text) throw new Error("The transcription service returned no speech.");
  return text;
}

async function synthesizeFish(text: string) {
  const voice = process.env.OPENROUTER_FISH_VOICE?.trim();
  const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${getRouterKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENROUTER_FISH_TTS_MODEL || FISH_TTS_MODEL,
      input: text,
      response_format: "mp3",
      ...(voice ? { voice } : {})
    })
  });
  if (!response.ok) throw new Error(`Fish voice generation failed (${response.status}).`);
  const bytes = await response.arrayBuffer();
  if (!bytes.byteLength) throw new Error("Fish voice generation returned no audio.");
  return { audioBase64: Buffer.from(bytes).toString("base64"), audioMimeType: response.headers.get("content-type") || "audio/mpeg" };
}

function audioFormatFromMime(mimeType: string) {
  if (/ogg/i.test(mimeType)) return "ogg";
  if (/wav/i.test(mimeType)) return "wav";
  if (/mpeg|mp3/i.test(mimeType)) return "mp3";
  if (/m4a|mp4/i.test(mimeType)) return "m4a";
  return "webm";
}

function pcm16ToWavBase64(pcmBase64: string, sampleRate = 24_000) {
  const pcm = Buffer.from(pcmBase64, "base64");
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]).toString("base64");
}

async function nativeAudioReply(mode: "gpt_audio_mini" | "gemini_live", context: PracticeContext, difficulty: PracticeDifficulty, history: PracticeMessage[], audioBase64: string, mimeType: string): Promise<AudioReply> {
  const model = mode === "gpt_audio_mini"
    ? process.env.OPENROUTER_GPT_AUDIO_MODEL || GPT_AUDIO_MODEL
    : process.env.OPENROUTER_GEMINI_LIVE_MODEL!;
  const voice = mode === "gpt_audio_mini" ? "alloy" : process.env.OPENROUTER_GEMINI_LIVE_VOICE || "Aoede";
  const responseFormat = mode === "gpt_audio_mini" ? "pcm16" : "wav";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${getRouterKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 110,
      temperature: 0.55,
      modalities: ["text", "audio"],
      audio: { voice, format: responseFormat },
      messages: [
        { role: "system", content: buyerPrompt(context, difficulty, history) },
        {
          role: "user",
          content: [
            { type: "text", text: "Listen to the seller's latest turn and reply as the buyer." },
            { type: "input_audio", input_audio: { data: audioBase64, format: audioFormatFromMime(mimeType) } }
          ]
        }
      ]
    })
  });
  if (!response.ok || !response.body) throw new Error(`${mode === "gpt_audio_mini" ? "GPT Audio Mini" : "Gemini Live"} failed (${response.status}).`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const audioChunks: string[] = [];
  const transcriptChunks: string[] = [];
  const textChunks: string[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      try {
        const chunk = JSON.parse(data) as { choices?: { delta?: { content?: string; audio?: { data?: string; transcript?: string } } }[] };
        const delta = chunk.choices?.[0]?.delta;
        if (delta?.audio?.data) audioChunks.push(delta.audio.data);
        if (delta?.audio?.transcript) transcriptChunks.push(delta.audio.transcript);
        if (delta?.content) textChunks.push(delta.content);
      } catch {
        // Ignore a malformed SSE event and continue reading the provider response.
      }
    }
  }
  const audioBase64Result = audioChunks.join("");
  const reply = (transcriptChunks.join("") || textChunks.join("")).trim();
  if (!audioBase64Result || !reply) throw new Error("The audio model returned an incomplete response.");
  return {
    reply,
    audioBase64: mode === "gpt_audio_mini" ? pcm16ToWavBase64(audioBase64Result) : audioBase64Result,
    audioMimeType: "audio/wav",
    model
  };
}

export async function respondToPracticeTurn(input: {
  mode: PracticeMode;
  difficulty: PracticeDifficulty;
  context: PracticeContext;
  history: PracticeMessage[];
  audioBase64: string;
  mimeType: string;
}) {
  assertPracticeModelAvailable(input.mode);
  if (input.mode === "fish") {
    const userTranscript = await transcribeAudio(input.audioBase64, audioFormatFromMime(input.mimeType));
    const history = [...input.history, { role: "user" as const, text: userTranscript }];
    const buyer = await openRouterText(buyerPrompt(input.context, input.difficulty, history), 100);
    const reply = buyer.text.replace(/^Buyer:\s*/i, "").replace(/\s+/g, " ").trim();
    const audio = await synthesizeFish(reply);
    return { userTranscript, reply, audioBase64: audio.audioBase64, audioMimeType: audio.audioMimeType, model: `${buyer.model} + ${process.env.OPENROUTER_FISH_TTS_MODEL || FISH_TTS_MODEL}` };
  }

  const [userTranscript, nativeReply] = await Promise.all([
    transcribeAudio(input.audioBase64, audioFormatFromMime(input.mimeType)),
    nativeAudioReply(input.mode, input.context, input.difficulty, input.history, input.audioBase64, input.mimeType)
  ]);
  return { userTranscript, reply: nativeReply.reply, audioBase64: nativeReply.audioBase64, audioMimeType: nativeReply.audioMimeType, model: nativeReply.model };
}
