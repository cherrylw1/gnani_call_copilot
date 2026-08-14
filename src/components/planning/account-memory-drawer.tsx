"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, CalendarClock, CheckCircle2, Mail, Phone, RefreshCw, UserRound, X } from "lucide-react";
import type { AccountMemory } from "@/lib/planning-source";

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "No activity";
const formatDuration = (seconds: number | null) => { const value = seconds ?? 0; return value >= 60 ? `${Math.floor(value / 60)}m ${value % 60}s` : `${value}s`; };

export function AccountMemoryDrawer({ account, onClose }: { account: { companyId: string | null; companyName: string } | null; onClose: () => void }) {
  const [memory, setMemory] = useState<AccountMemory | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account) return;
    setMemory(null);
    setError("");
    const controller = new AbortController();
    const params = new URLSearchParams({ account: account.companyName });
    if (account.companyId) params.set("companyId", account.companyId);
    fetch(`/api/planning/account?${params}`, { cache: "no-store", signal: controller.signal }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Account memory unavailable.");
      setMemory(body);
    }).catch((cause) => { if (cause.name !== "AbortError") setError(cause instanceof Error ? cause.message : "Account memory unavailable."); });
    return () => controller.abort();
  }, [account]);

  if (!account) return null;
  return <div className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="absolute inset-y-0 right-0 w-full overflow-y-auto border-l border-white/10 bg-[#0b0e11] shadow-2xl md:max-w-3xl" aria-label={`Account memory for ${account.companyName}`}>
    <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-[#0b0e11]/95 p-5 backdrop-blur-xl"><div><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-300/70">Account memory</p><h2 className="mt-2 text-xl font-semibold tracking-tight">{account.companyName}</h2></div><button onClick={onClose} aria-label="Close account memory" className="focus-ring rounded-lg p-2 text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"><X className="size-5"/></button></div>
    {!memory && !error && <div className="flex min-h-80 items-center justify-center"><RefreshCw className="size-5 animate-spin text-zinc-500"/></div>}
    {error && <div className="m-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-100/80">{error}</div>}
    {memory && <div className="space-y-6 p-5">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">{[
        ["Known contacts", memory.summary.contacts, UserRound], ["Call attempts", memory.summary.calls, Phone], ["Connected", memory.summary.connectedCalls, CheckCircle2], ["Open tasks", memory.summary.openTasks, CalendarClock]
      ].map(([label, value, Icon]) => { const Glyph = Icon as typeof UserRound; return <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.025] p-3"><Glyph className="size-4 text-zinc-500"/><p className="mono mt-4 text-2xl text-zinc-100">{String(value)}</p><p className="mt-1 text-xs text-zinc-500">{String(label)}</p></div>; })}</section>

      <section><h3 className="text-sm font-medium">Account context</h3><div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"><div className="flex gap-3"><Building2 className="mt-0.5 size-4 shrink-0 text-zinc-500"/><div><p className="text-sm text-zinc-200">{memory.company.company_name}</p><p className="mt-1 text-xs text-zinc-500">{memory.company.industry_auto_classified || "Industry not classified"}</p><p className="mt-2 text-xs text-zinc-600">Last touch: {formatDate(memory.summary.lastTouch)}</p></div></div></div></section>

      <section><div className="flex items-center justify-between"><h3 className="text-sm font-medium">People at this account</h3><span className="text-xs text-zinc-600">{memory.contacts.length} records</span></div>{memory.contacts.length ? <div className="mt-3 grid gap-2 md:grid-cols-2">{memory.contacts.map((contact) => <div key={contact.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3"><p className="text-sm text-zinc-200">{contact.full_name || contact.email}</p><p className="mt-1 text-xs text-zinc-500">{contact.job_title || "Title unavailable"}</p><a href={`mailto:${contact.email}`} className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300/80 hover:text-emerald-200"><Mail className="size-3.5"/>{contact.email}</a></div>)}</div> : <p className="mt-3 text-sm text-zinc-500">No master-contact records are linked to this account.</p>}</section>

      {memory.tasks.length > 0 && <section><div className="flex items-center justify-between"><h3 className="text-sm font-medium">Account tasks</h3><span className="text-xs text-zinc-600">{memory.tasks.length}</span></div><div className="mt-3 space-y-2">{memory.tasks.map((task) => <div key={task.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-zinc-200">{task.title}</p><p className="mt-1 text-xs capitalize text-zinc-500">{task.task_type} | {task.priority} priority</p></div><span className={`rounded-md px-2 py-1 text-[10px] uppercase tracking-[0.08em] ${task.status === "done" ? "bg-emerald-400/[0.08] text-emerald-200" : "bg-white/[0.05] text-zinc-400"}`}>{task.status}</span></div></div>)}</div></section>}

      {memory.competitorNotes.length > 0 && <section><h3 className="text-sm font-medium">Tools, vendors, and competitive context</h3><div className="mt-3 space-y-2">{memory.competitorNotes.map((item) => <div key={item.id} className="rounded-xl border border-amber-300/15 bg-amber-300/[0.035] p-3"><p className="text-xs leading-5 text-zinc-400">{item.note}</p><p className="mt-2 text-[10px] text-zinc-600">{item.prospect} | {formatDate(item.completedAt)}</p></div>)}</div></section>}

      <section><div className="flex items-center justify-between"><h3 className="text-sm font-medium">Call timeline</h3><span className="text-xs text-zinc-600">Latest 100 calls</span></div><div className="mt-3 space-y-2">{memory.calls.map((call) => <article key={call.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-medium text-zinc-200">{call.prospect_name}</p><p className="mt-1 text-xs text-zinc-500">{call.job_title || call.prospect_email}</p></div><div className="text-left sm:text-right"><p className="text-xs text-zinc-400">{formatDate(call.completed_at)}</p><p className="mt-1 text-[10px] text-zinc-600">{call.call_status} | {formatDuration(call.duration_seconds)}</p></div></div>{call.call_notes && <p className="mt-3 border-l-2 border-emerald-400/25 pl-3 text-xs leading-5 text-zinc-400">{call.call_notes}</p>}{call.shareable_link && <a href={call.shareable_link} target="_blank" rel="noreferrer" className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300/80 hover:text-emerald-200">Open call<ArrowUpRight className="size-3.5"/></a>}</article>)}</div></section>
    </div>}
  </aside></div>;
}
