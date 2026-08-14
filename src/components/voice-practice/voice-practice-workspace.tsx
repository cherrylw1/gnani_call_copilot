"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, Bot, CircleStop, LoaderCircle, Mic, Play, Search, ShieldCheck, Sparkles, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

type Mode = "fish" | "gpt_audio_mini" | "gemini_live";
type Difficulty = "receptive" | "busy" | "skeptical" | "technical";
type ModelOption = { id: Mode; label: string; model: string; detail: string; available: boolean; nativeAudio: boolean };
type Context = { contact: Record<string, unknown>; company: Record<string, unknown> | null; card: Record<string, unknown> | null };
type Session = { id: string; selected_mode: Mode; difficulty: Difficulty; scenario: Record<string, unknown>; started_at: string };
type Message = { role: "seller" | "buyer"; text: string };
type Coaching = {
  overall_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  next_repetition: string;
  signals: { clear_relevance: number; discovery: number; objection_handling: number; next_step: number };
};

const difficulties: { id: Difficulty; label: string; detail: string }[] = [
  { id: "receptive", label: "Receptive", detail: "Interested, but still discerning." },
  { id: "busy", label: "Busy", detail: "Short answers and limited patience." },
  { id: "skeptical", label: "Skeptical", detail: "Challenges generic claims and proof." },
  { id: "technical", label: "Technical", detail: "Tests the architecture and workflow." }
];

function valueOf(record: Record<string, unknown> | null | undefined, key: string, fallback = "") {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function modeTitle(mode: Mode) {
  if (mode === "fish") return "Fish Voice";
  if (mode === "gpt_audio_mini") return "GPT Audio Mini";
  return "Gemini Live";
}

export function VoicePracticeWorkspace() {
  const [email, setEmail] = useState("");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [mode, setMode] = useState<Mode>("fish");
  const [difficulty, setDifficulty] = useState<Difficulty>("busy");
  const [session, setSession] = useState<Session | null>(null);
  const [context, setContext] = useState<Context | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [coaching, setCoaching] = useState<Coaching | null>(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [starting, setStarting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lastAudio, setLastAudio] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = models.find((item) => item.id === mode);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch("/api/voice-practice/config");
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load voice options.");
        setModels(body.models as ModelOption[]);
        const firstAvailable = (body.models as ModelOption[]).find((item) => item.available);
        if (firstAvailable) setMode(firstAvailable.id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load voice options.");
      } finally {
        setLoadingModels(false);
      }
    };
    void loadModels();
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioRef.current?.pause();
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
  }, []);

  const startSession = async () => {
    if (!selected?.available) {
      toast.error(selected?.detail || "Choose an available voice option.");
      return;
    }
    setStarting(true);
    try {
      const response = await fetch("/api/voice-practice/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase(), mode, difficulty }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setSession(body.session as Session);
      setContext(body.context as Context);
      setMessages([]);
      setCoaching(null);
      setLastAudio(null);
      toast.success(`Practice started with ${modeTitle(mode)}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start practice.");
    } finally {
      setStarting(false);
    }
  };

  const getPreferredMime = () => {
    if (typeof MediaRecorder === "undefined") return "";
    return ["audio/ogg;codecs=opus", "audio/webm;codecs=opus", "audio/webm"].find((mime) => MediaRecorder.isTypeSupported(mime)) || "";
  };

  const readBlobAsBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      if (comma < 0) return reject(new Error("Could not prepare the recorded audio."));
      resolve(result.slice(comma + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the recorded audio."));
    reader.readAsDataURL(blob);
  });

  const normalizeToWav = async (blob: Blob) => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) throw new Error("This browser cannot prepare microphone audio for the selected provider.");
    const audioContext = new AudioContextClass();
    try {
      const decoded = await audioContext.decodeAudioData((await blob.arrayBuffer()).slice(0));
      const targetRate = 16_000;
      const outputLength = Math.max(1, Math.floor(decoded.length * targetRate / decoded.sampleRate));
      const wav = new ArrayBuffer(44 + outputLength * 2);
      const view = new DataView(wav);
      const writeText = (offset: number, value: string) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
      writeText(0, "RIFF");
      view.setUint32(4, 36 + outputLength * 2, true);
      writeText(8, "WAVE");
      writeText(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, targetRate, true);
      view.setUint32(28, targetRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeText(36, "data");
      view.setUint32(40, outputLength * 2, true);
      const ratio = decoded.sampleRate / targetRate;
      for (let outputIndex = 0; outputIndex < outputLength; outputIndex += 1) {
        const start = Math.floor(outputIndex * ratio);
        const end = Math.min(decoded.length, Math.max(start + 1, Math.floor((outputIndex + 1) * ratio)));
        let aggregate = 0;
        let count = 0;
        for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
          const values = decoded.getChannelData(channel);
          for (let inputIndex = start; inputIndex < end; inputIndex += 1) { aggregate += values[inputIndex] || 0; count += 1; }
        }
        const sample = Math.max(-1, Math.min(1, aggregate / Math.max(1, count)));
        view.setInt16(44 + outputIndex * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      }
      return new Blob([wav], { type: "audio/wav" });
    } finally {
      await audioContext.close();
    }
  };

  const playAudio = (source: string) => {
    audioRef.current?.pause();
    const audio = new Audio(source);
    audioRef.current = audio;
    audio.onplay = () => setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => { setPlaying(false); toast.error("The generated audio could not be played."); };
    void audio.play().catch(() => toast.message("Audio is ready. Use replay if your browser blocked automatic playback."));
  };

  const sendRecordedTurn = async (blob: Blob) => {
    if (!session) return;
    if (blob.size < 700) {
      toast.message("That recording was too short. Try again with a complete sentence.");
      return;
    }
    setProcessing(true);
    try {
      const normalized = await normalizeToWav(blob);
      const audioBase64 = await readBlobAsBase64(normalized);
      const response = await fetch("/api/voice-practice/turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: session.id, audioBase64, mimeType: normalized.type }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setMessages((current) => [...current, { role: "seller", text: body.sellerTranscript }, { role: "buyer", text: body.buyerTranscript }]);
      const source = `data:${body.audioMimeType};base64,${body.audioBase64}`;
      setLastAudio(source);
      playAudio(source);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not process that turn.");
    } finally {
      setProcessing(false);
    }
  };

  const startRecording = async () => {
    if (!session || processing || playing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = getPreferredMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
        void sendRecordedTurn(blob);
      };
      recorder.start();
      setRecording(true);
      recordingTimerRef.current = setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
          setRecording(false);
          toast.message("Each practice turn is limited to 45 seconds so the buyer can respond naturally.");
        }
      }, 45_000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Microphone access is required to practice by voice.");
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    setRecording(false);
  };

  const finishSession = async () => {
    if (!session || recording || processing) return;
    setFinishing(true);
    try {
      const response = await fetch("/api/voice-practice/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: session.id }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setCoaching(body.coaching as Coaching);
      toast.success(body.cached ? "Loaded saved coaching." : "Call coaching is ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete this practice session.");
    } finally {
      setFinishing(false);
    }
  };

  const reset = () => {
    audioRef.current?.pause();
    setSession(null);
    setContext(null);
    setMessages([]);
    setCoaching(null);
    setLastAudio(null);
    setRecording(false);
    setPlaying(false);
  };

  return <div className="space-y-6">
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Private rehearsal</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">Voice Practice</h1>
      <p className="mt-1 max-w-3xl text-sm text-zinc-500">Practice a CCW follow-up with a simulated buyer using the saved account context. Only transcript and coaching are saved. Your microphone audio is discarded after each turn.</p>
    </div>

    {!session ? <>
      <div className="flex max-w-3xl gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 border border-zinc-700 bg-zinc-950 px-3"><Search className="size-4 text-zinc-500" /><input className="focus-ring h-12 w-full bg-transparent text-sm outline-none placeholder:text-zinc-600" value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => event.key === "Enter" && startSession()} placeholder="Paste an imported prospect email" /></label>
        <Button onClick={startSession} disabled={starting || loadingModels || !email || !selected?.available}>{starting ? "Starting..." : "Start practice"}</Button>
      </div>

      <section className="max-w-5xl"><h2 className="text-sm font-medium text-zinc-200">Choose the buyer voice</h2><p className="mt-1 text-sm text-zinc-500">Every option records your mic locally, then sends the turn to the selected server-side provider. This page does not use browser speech recognition or browser voice synthesis.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">{loadingModels ? [0, 1, 2].map((item) => <div className="h-40 animate-pulse border border-zinc-800 bg-zinc-900/40" key={item} />) : models.map((item) => <button key={item.id} type="button" onClick={() => item.available && setMode(item.id)} disabled={!item.available} className={`focus-ring min-h-40 border p-4 text-left transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 ${mode === item.id ? "border-zinc-100 bg-zinc-100 text-zinc-950" : "border-zinc-800 bg-zinc-950 text-zinc-100 hover:border-zinc-600"}`}>
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><AudioLines className="size-4" strokeWidth={1.5} /><span className="text-sm font-medium">{item.label}</span></div><span className={`text-[11px] ${mode === item.id ? "text-zinc-600" : "text-zinc-500"}`}>{item.available ? item.nativeAudio ? "Native audio" : "Natural voice" : "Needs setup"}</span></div>
          <p className={`mt-5 text-sm leading-6 ${mode === item.id ? "text-zinc-700" : "text-zinc-400"}`}>{item.detail}</p><p className={`mono mt-4 break-all text-[11px] ${mode === item.id ? "text-zinc-500" : "text-zinc-600"}`}>{item.model}</p>
        </button>)}</div>
      </section>

      <section className="max-w-5xl"><h2 className="text-sm font-medium text-zinc-200">Set the buyer posture</h2><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{difficulties.map((item) => <button key={item.id} type="button" onClick={() => setDifficulty(item.id)} className={`focus-ring min-h-28 border p-4 text-left transition active:translate-y-px ${difficulty === item.id ? "border-zinc-100 bg-zinc-900" : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"}`}><p className="text-sm font-medium">{item.label}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{item.detail}</p></button>)}</div></section>
    </> : <>
      <div className="grid gap-5 xl:grid-cols-[0.76fr_1.24fr]">
        <aside className="space-y-5">
          <Card className="p-5"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center border border-zinc-700 bg-zinc-900"><Bot className="size-4 text-zinc-300" strokeWidth={1.5} /></div><div><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Simulated buyer</p><h2 className="mt-2 text-base font-semibold">{String(session.scenario.prospect_name || "Prospect")} at {String(session.scenario.company_name || "Company")}</h2><p className="mt-1 text-sm text-zinc-500">{String(session.scenario.simulated_role || "Business leader")}</p></div></div><dl className="mt-5 space-y-3 text-sm"><Fact label="Voice mode" value={modeTitle(session.selected_mode)} /><Fact label="Buyer posture" value={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} /><Fact label="Account" value={valueOf(context?.company, "company_name", String(session.scenario.company_name || "Company"))} /><Fact label="Decision focus" value={String(session.scenario.coach_focus || "Business relevance")} /><Fact label="Gnani lens" value={String(session.scenario.recommended_products || "Gnani platform")} /></dl></Card>
          <Card className="p-5"><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-zinc-400" strokeWidth={1.5} /><h2 className="text-sm font-medium">Practice privacy</h2></div><p className="mt-3 text-sm leading-6 text-zinc-500">This is a simulated role, not an impersonation of the real contact. Audio is used to process the active turn only. Session history stores transcripts and coaching, not raw recordings.</p></Card>
          <Button onClick={finishSession} disabled={finishing || recording || processing || Boolean(coaching)} className="w-full">{finishing ? "Coaching..." : coaching ? "Coaching complete" : "End and coach"}</Button>
          <Button onClick={reset} disabled={recording || processing} className="w-full border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900">Start another practice</Button>
        </aside>

        <div className="space-y-5">
          <Card className="overflow-hidden"><div className="border-b border-zinc-800 px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Live rehearsal</p><h2 className="mt-1 text-base font-semibold">You open the call</h2></div><div className="flex items-center gap-2 text-xs text-zinc-500">{processing ? <><LoaderCircle className="size-3 animate-spin" /> Preparing buyer reply</> : playing ? <><Volume2 className="size-3" /> Buyer speaking</> : <><Mic className="size-3" /> Ready for your turn</>}</div></div></div>
            <div className="min-h-88 space-y-4 p-5">{messages.length ? messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[85%] border p-4 ${message.role === "seller" ? "ml-auto border-zinc-600 bg-zinc-900" : "border-zinc-800 bg-zinc-950"}`}><p className="text-xs font-medium text-zinc-500">{message.role === "seller" ? "You" : "Simulated buyer"}</p><p className="mt-2 text-sm leading-6 text-zinc-200">{message.text || "Transcription unavailable. The buyer still received your audio."}</p></div>) : <EmptyState title="Begin when you are ready" detail="Use a concise CCW opener. The buyer will react to the words you actually use, then challenge relevance, proof, timing, or fit based on the selected posture." />}</div>
            <div className="border-t border-zinc-800 bg-zinc-900/30 p-4"><div className="flex flex-wrap items-center gap-3"><Button onClick={recording ? stopRecording : startRecording} disabled={processing || playing || Boolean(coaching)} className={`min-w-44 gap-2 ${recording ? "border-red-300 bg-red-100 text-zinc-950 hover:bg-red-50" : ""}`}>{recording ? <CircleStop className="size-4" /> : <Mic className="size-4" />}{recording ? "Finish turn" : "Speak now"}</Button><p className="text-xs leading-5 text-zinc-500">{recording ? "Recording. Finish when you have completed your thought." : processing ? "Your turn is being transcribed and answered." : playing ? "Wait for the buyer to finish, then take your next turn." : "Tap Speak now, say your response, then tap Finish turn."}</p>{lastAudio && !playing ? <button type="button" onClick={() => playAudio(lastAudio)} className="focus-ring ml-auto inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-100"><Play className="size-3" /> Replay buyer</button> : null}</div></div>
          </Card>
          {coaching ? <CoachingPanel coaching={coaching} /> : null}
        </div>
      </div>
    </>}
  </div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1 leading-5 text-zinc-300">{value}</dd></div>; }

function CoachingPanel({ coaching }: { coaching: Coaching }) {
  const signals: [string, number][] = [["Relevance", coaching.signals.clear_relevance], ["Discovery", coaching.signals.discovery], ["Objections", coaching.signals.objection_handling], ["Next step", coaching.signals.next_step]];
  return <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">End-of-call coaching</p><h2 className="mt-2 text-base font-semibold">Practice score: {coaching.overall_score}/5</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{coaching.summary}</p></div><Sparkles className="size-5 text-zinc-500" strokeWidth={1.5} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{signals.map(([label, score]) => <div className="border border-zinc-800 p-3" key={label}><p className="text-xs text-zinc-500">{label}</p><p className="mono mt-2 text-lg text-zinc-100">{score}/5</p></div>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-2"><CoachList title="What worked" items={coaching.strengths} /><CoachList title="What to improve" items={coaching.improvements} /></div><div className="mt-5 border border-zinc-700 bg-zinc-900 p-4"><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Next repetition</p><p className="mt-2 text-sm leading-6 text-zinc-200">{coaching.next_repetition}</p></div></Card>;
}

function CoachList({ title, items }: { title: string; items: string[] }) { return <section><h3 className="text-sm font-medium text-zinc-200">{title}</h3>{items.length ? <ul className="mt-3 space-y-3">{items.map((item) => <li className="border-l border-zinc-700 pl-3 text-sm leading-6 text-zinc-400" key={item}>{item}</li>)}</ul> : <p className="mt-3 text-sm text-zinc-500">No evidence was captured yet.</p>}</section>; }
