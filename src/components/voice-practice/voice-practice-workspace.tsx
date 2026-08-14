"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, Bot, LoaderCircle, Mic, Pause, Play, Search, ShieldCheck, Sparkles, Volume2, Waves } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

type Mode = "fish" | "gemini_tts" | "gpt_audio_mini" | "gemini_live";
type Difficulty = "receptive" | "busy" | "skeptical" | "technical";
type ModelOption = { id: Mode; label: string; model: string; detail: string; available: boolean; streaming: boolean };
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
  if (mode === "gemini_tts") return "Gemini 3.1 Voice";
  if (mode === "gpt_audio_mini") return "Legacy GPT Audio";
  return "Legacy Gemini Live";
}

export function VoicePracticeWorkspace() {
  const [email, setEmail] = useState("");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [mode, setMode] = useState<Mode>("gemini_tts");
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
  const [listeningPaused, setListeningPaused] = useState(false);
  const [hasSpeech, setHasSpeech] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const voiceFrameRef = useRef<number | null>(null);
  const silenceStartedRef = useRef<number | null>(null);
  const speechStartedRef = useRef<number | null>(null);
  const activeSessionRef = useRef<string | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackEndsAtRef = useRef(0);
  const playbackSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const listeningPausedRef = useRef(false);

  const selected = models.find((item) => item.id === mode);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch("/api/voice-practice/config");
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load voice options.");
        setModels(body.models as ModelOption[]);
        const firstAvailable = (body.models as ModelOption[]).find((item) => item.id === "gemini_tts" && item.available) || (body.models as ModelOption[]).find((item) => item.available);
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
    if (recorderTimerRef.current) clearTimeout(recorderTimerRef.current);
    if (voiceFrameRef.current) cancelAnimationFrame(voiceFrameRef.current);
    audioContextRef.current?.close();
    playbackSourcesRef.current.forEach((source) => source.stop());
    playbackContextRef.current?.close();
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
      activeSessionRef.current = body.session.id;
      listeningPausedRef.current = false;
      setListeningPaused(false);
      toast.success(`Call started with ${modeTitle(mode)}. Speak when you are ready.`);
      await resumeListening(body.session.id);
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

  const stopVoiceWatcher = () => {
    if (voiceFrameRef.current) cancelAnimationFrame(voiceFrameRef.current);
    voiceFrameRef.current = null;
    silenceStartedRef.current = null;
    speechStartedRef.current = null;
    setHasSpeech(false);
  };

  const stopAutomaticTurn = (submit: boolean) => {
    stopVoiceWatcher();
    const recorder = recorderRef.current;
    if (recorderTimerRef.current) clearTimeout(recorderTimerRef.current);
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (submit) void sendRecordedTurn(blob);
      };
      recorder.stop();
    }
    setRecording(false);
  };

  const playPcmChunk = async (base64: string, sampleRate: number) => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) throw new Error("This browser cannot play the streamed Gemini voice.");
    const context = playbackContextRef.current || new AudioContextClass();
    playbackContextRef.current = context;
    if (context.state === "suspended") await context.resume();
    const raw = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    const frames = Math.floor(raw.byteLength / 2);
    if (!frames) return;
    const buffer = context.createBuffer(1, frames, sampleRate);
    const output = buffer.getChannelData(0);
    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
    for (let index = 0; index < frames; index += 1) output[index] = view.getInt16(index * 2, true) / 0x8000;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startAt = Math.max(context.currentTime + 0.045, playbackEndsAtRef.current);
    playbackEndsAtRef.current = startAt + buffer.duration;
    playbackSourcesRef.current.push(source);
    source.onended = () => { playbackSourcesRef.current = playbackSourcesRef.current.filter((item) => item !== source); };
    source.start(startAt);
    setPlaying(true);
  };

  const playCompletedAudio = (source: string) => {
    audioRef.current?.pause();
    const audio = new Audio(source);
    audioRef.current = audio;
    audio.onplay = () => setPlaying(true);
    audio.onerror = () => { setPlaying(false); toast.error("The generated audio could not be played."); };
    void audio.play().catch(() => toast.message("Audio is ready. Use replay if your browser blocked automatic playback."));
  };

  const resumeListening = async (sessionId: string, force = false) => {
    if ((!force && (listeningPausedRef.current || processing || playing)) || !activeSessionRef.current || activeSessionRef.current !== sessionId) return;
    try {
      let stream = streamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        streamRef.current = stream;
      }
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) throw new Error("This browser cannot detect the end of your spoken turn.");
      const audioContext = audioContextRef.current || new AudioContextClass();
      audioContextRef.current = audioContext;
      if (audioContext.state === "suspended") await audioContext.resume();
      const analyser = analyserRef.current || audioContext.createAnalyser();
      if (!analyserRef.current) audioContext.createMediaStreamSource(stream).connect(analyser);
      analyser.fftSize = 1024;
      analyserRef.current = analyser;
      chunksRef.current = [];
      const mimeType = getPreferredMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.start(250);
      setRecording(true);
      const samples = new Uint8Array(analyser.fftSize);
      const watch = () => {
        if (recorder.state === "inactive" || activeSessionRef.current !== sessionId || listeningPausedRef.current) return;
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) { const level = (sample - 128) / 128; sum += level * level; }
        const level = Math.sqrt(sum / samples.length);
        const now = performance.now();
        if (level > 0.018) {
          if (!speechStartedRef.current) speechStartedRef.current = now;
          silenceStartedRef.current = null;
          setHasSpeech(true);
        } else if (speechStartedRef.current) {
          silenceStartedRef.current ||= now;
          if (now - silenceStartedRef.current > 720 && now - speechStartedRef.current > 420) {
            stopAutomaticTurn(true);
            return;
          }
        }
        voiceFrameRef.current = requestAnimationFrame(watch);
      };
      voiceFrameRef.current = requestAnimationFrame(watch);
      recorderTimerRef.current = setTimeout(() => {
        if (recorder.state !== "inactive") {
          toast.message("Your turn has been sent so the buyer can respond.");
          stopAutomaticTurn(Boolean(speechStartedRef.current));
        }
      }, 50_000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Microphone access is required to begin the practice call.");
      listeningPausedRef.current = true;
      setListeningPaused(true);
    }
  };

  const sendRecordedTurn = async (blob: Blob) => {
    const sessionId = activeSessionRef.current;
    if (!sessionId || blob.size < 700) {
      if (sessionId) void resumeListening(sessionId);
      return;
    }
    setProcessing(true);
    let receivedAudio = false;
    try {
      const normalized = await normalizeToWav(blob);
      const audioBase64 = await readBlobAsBase64(normalized);
      const response = await fetch("/api/voice-practice/turn-stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, audioBase64, mimeType: normalized.type }) });
      if (!response.ok || !response.body) throw new Error("Could not start the buyer response.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";
        for (const block of blocks) {
          const type = /^event: (.+)$/m.exec(block)?.[1];
          const data = /^data: (.+)$/m.exec(block)?.[1];
          if (!type || !data) continue;
          const payload = JSON.parse(data) as { text?: string; data?: string; mimeType?: string; sampleRate?: number; message?: string };
          if (type === "seller" && payload.text) setMessages((current) => [...current, { role: "seller", text: payload.text! }]);
          if (type === "buyer" && payload.text) setMessages((current) => [...current, { role: "buyer", text: payload.text! }]);
          if (type === "audio" && payload.data) { receivedAudio = true; await playPcmChunk(payload.data, payload.sampleRate || 24_000); }
          if (type === "audio-complete" && payload.data) {
            receivedAudio = true;
            const source = `data:${payload.mimeType || "audio/mpeg"};base64,${payload.data}`;
            setLastAudio(source);
            playCompletedAudio(source);
          }
          if (type === "error") throw new Error(payload.message || "The buyer could not respond.");
        }
      }
      if (!receivedAudio) throw new Error("The buyer response did not include playable audio.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not process that practice turn.");
      if (activeSessionRef.current === sessionId) void resumeListening(sessionId);
    } finally {
      setProcessing(false);
      if (receivedAudio && mode === "gemini_tts") {
        const context = playbackContextRef.current;
        const wait = Math.max(80, ((playbackEndsAtRef.current || context?.currentTime || 0) - (context?.currentTime || 0)) * 1000 + 80);
        window.setTimeout(() => {
          setPlaying(false);
          if (activeSessionRef.current === sessionId) void resumeListening(sessionId);
        }, wait);
      } else if (receivedAudio && mode === "fish") {
        const audio = audioRef.current;
        if (audio) audio.onended = () => { setPlaying(false); if (activeSessionRef.current === sessionId) void resumeListening(sessionId); };
      }
    }
  };

  const finishSession = async () => {
    if (!session || processing) return;
    listeningPausedRef.current = true;
    setListeningPaused(true);
    if (recording) stopAutomaticTurn(false);
    audioRef.current?.pause();
    playbackSourcesRef.current.forEach((source) => source.stop());
    setPlaying(false);
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
    activeSessionRef.current = null;
    stopAutomaticTurn(false);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    audioRef.current?.pause();
    playbackSourcesRef.current.forEach((source) => source.stop());
    playbackContextRef.current?.close();
    playbackContextRef.current = null;
    playbackEndsAtRef.current = 0;
    setSession(null);
    setContext(null);
    setMessages([]);
    setCoaching(null);
    setLastAudio(null);
    setRecording(false);
    setPlaying(false);
    listeningPausedRef.current = false;
    setListeningPaused(false);
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
        <Button onClick={startSession} disabled={starting || loadingModels || !email || !selected?.available}>{starting ? "Starting..." : "Start call"}</Button>
      </div>

      <section className="max-w-5xl"><h2 className="text-sm font-medium text-zinc-200">Choose the buyer voice</h2><p className="mt-1 text-sm text-zinc-500">Start the call once. The microphone stays ready, detects the end of each spoken turn, and sends only that turn to the selected OpenRouter voice path.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">{loadingModels ? [0, 1].map((item) => <div className="h-40 animate-pulse border border-zinc-800 bg-zinc-900/40" key={item} />) : models.map((item) => <button key={item.id} type="button" onClick={() => item.available && setMode(item.id)} disabled={!item.available} className={`focus-ring min-h-40 border p-4 text-left transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 ${mode === item.id ? "border-zinc-100 bg-zinc-100 text-zinc-950" : "border-zinc-800 bg-zinc-950 text-zinc-100 hover:border-zinc-600"}`}>
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><AudioLines className="size-4" strokeWidth={1.5} /><span className="text-sm font-medium">{item.label}</span></div><span className={`text-[11px] ${mode === item.id ? "text-zinc-600" : "text-zinc-500"}`}>{item.available ? item.streaming ? "Streamed default" : "Alternative voice" : "Needs setup"}</span></div>
          <p className={`mt-5 text-sm leading-6 ${mode === item.id ? "text-zinc-700" : "text-zinc-400"}`}>{item.detail}</p><p className={`mono mt-4 break-all text-[11px] ${mode === item.id ? "text-zinc-500" : "text-zinc-600"}`}>{item.model}</p>
        </button>)}</div>
      </section>

      <section className="max-w-5xl"><h2 className="text-sm font-medium text-zinc-200">Set the buyer posture</h2><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{difficulties.map((item) => <button key={item.id} type="button" onClick={() => setDifficulty(item.id)} className={`focus-ring min-h-28 border p-4 text-left transition active:translate-y-px ${difficulty === item.id ? "border-zinc-100 bg-zinc-900" : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"}`}><p className="text-sm font-medium">{item.label}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{item.detail}</p></button>)}</div></section>
    </> : <>
      <div className="grid gap-5 xl:grid-cols-[0.76fr_1.24fr]">
        <aside className="space-y-5">
          <Card className="p-5"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center border border-zinc-700 bg-zinc-900"><Bot className="size-4 text-zinc-300" strokeWidth={1.5} /></div><div><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Simulated buyer</p><h2 className="mt-2 text-base font-semibold">{String(session.scenario.prospect_name || "Prospect")} at {String(session.scenario.company_name || "Company")}</h2><p className="mt-1 text-sm text-zinc-500">{String(session.scenario.simulated_role || "Business leader")}</p></div></div><dl className="mt-5 space-y-3 text-sm"><Fact label="Voice mode" value={modeTitle(session.selected_mode)} /><Fact label="Buyer posture" value={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} /><Fact label="Account" value={valueOf(context?.company, "company_name", String(session.scenario.company_name || "Company"))} /><Fact label="Decision focus" value={String(session.scenario.coach_focus || "Business relevance")} /><Fact label="Gnani lens" value={String(session.scenario.recommended_products || "Gnani platform")} /></dl></Card>
          <Card className="p-5"><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-zinc-400" strokeWidth={1.5} /><h2 className="text-sm font-medium">Practice privacy</h2></div><p className="mt-3 text-sm leading-6 text-zinc-500">This is a simulated role, not an impersonation of the real contact. Audio is used to process the active turn only. Session history stores transcripts and coaching, not raw recordings.</p></Card>
          <Button onClick={finishSession} disabled={finishing || processing || Boolean(coaching)} className="w-full">{finishing ? "Coaching..." : coaching ? "Coaching complete" : "End call and coach"}</Button>
          <Button onClick={reset} disabled={processing} className="w-full border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900">Start another practice</Button>
        </aside>

        <div className="space-y-5">
          <Card className="overflow-hidden"><div className="border-b border-zinc-800 px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Hands-free rehearsal</p><h2 className="mt-1 text-base font-semibold">You open the call</h2></div><div className="flex items-center gap-2 text-xs text-zinc-500">{processing ? <><LoaderCircle className="size-3 animate-spin" /> Buyer is preparing a reply</> : playing ? <><Volume2 className="size-3" /> Buyer speaking</> : listeningPaused ? <><Pause className="size-3" /> Microphone paused</> : recording ? <><Waves className="size-3" /> {hasSpeech ? "Listening — pause naturally to send" : "Listening for your first words"}</> : <><Mic className="size-3" /> Preparing microphone</>}</div></div></div>
            <div className="min-h-88 space-y-4 p-5">{messages.length ? messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[85%] border p-4 ${message.role === "seller" ? "ml-auto border-zinc-600 bg-zinc-900" : "border-zinc-800 bg-zinc-950"}`}><p className="text-xs font-medium text-zinc-500">{message.role === "seller" ? "You" : "Simulated buyer"}</p><p className="mt-2 text-sm leading-6 text-zinc-200">{message.text || "Transcription unavailable. The buyer still received your audio."}</p></div>) : <EmptyState title="Begin when you are ready" detail="Use a concise CCW opener. The buyer will react to the words you actually use, then challenge relevance, proof, timing, or fit based on the selected posture." />}</div>
            <div className="border-t border-zinc-800 bg-zinc-900/30 p-4"><div className="flex flex-wrap items-center gap-3"><div className="flex min-w-0 items-center gap-3"><span className={`flex size-8 items-center justify-center border ${recording && !listeningPaused ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-200" : "border-zinc-700 text-zinc-500"}`}><Mic className="size-4" /></span><p className="text-xs leading-5 text-zinc-500">{processing ? "Your turn is being transcribed, answered, and voiced." : playing ? "The microphone will reopen automatically when the buyer finishes." : listeningPaused ? "Resume when you are ready. Your next spoken turn will send after a short natural pause." : recording ? "Speak normally. A short pause sends your turn automatically." : "Preparing the next hands-free turn."}</p></div><Button type="button" onClick={() => { if (!session) return; if (listeningPaused) { listeningPausedRef.current = false; setListeningPaused(false); void resumeListening(session.id, true); } else { listeningPausedRef.current = true; setListeningPaused(true); stopAutomaticTurn(false); } }} disabled={processing || playing || Boolean(coaching)} className="ml-auto border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900">{listeningPaused ? "Resume mic" : "Pause mic"}</Button>{lastAudio && !playing ? <button type="button" onClick={() => playCompletedAudio(lastAudio)} className="focus-ring inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-100"><Play className="size-3" /> Replay buyer</button> : null}</div></div>
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
