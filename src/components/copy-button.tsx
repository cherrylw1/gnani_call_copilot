"use client";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) { const [done, setDone] = useState(false); return <button className="focus-ring inline-flex items-center gap-1.5 border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-400" onClick={async () => { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1400); }}>{done ? <Check className="size-3" /> : <Copy className="size-3" />}{done ? "Copied" : label}</button>; }
