"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Building2, Loader2, Mail, Search, X } from "lucide-react";
import type { CallDetails, CallDetailScope, ReportFilters } from "@/lib/call-analytics";

export type Drilldown = { title: string; description: string; scope: CallDetailScope; value?: string };

const number = (value: number) => new Intl.NumberFormat("en-US").format(value);
const dateTime = (value: string) => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
const duration = (seconds: number | null) => {
  if (seconds === null) return "Not recorded";
  if (seconds < 60) return `${seconds} sec`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
};

export function CallDetailDrawer({ drilldown, filters, onClose }: { drilldown: Drilldown | null; filters: ReportFilters; onClose: () => void }) {
  const [details, setDetails] = useState<CallDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [settledSearch, setSettledSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setSettledSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSearch("");
    setSettledSearch("");
  }, [drilldown]);

  const query = useMemo(() => {
    if (!drilldown) return "";
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
    params.set("scope", drilldown.scope);
    if (drilldown.value) params.set("value", drilldown.value);
    if (settledSearch) params.set("search", settledSearch);
    params.set("page", String(page));
    params.set("pageSize", "30");
    return params.toString();
  }, [drilldown, filters, page, settledSearch]);

  useEffect(() => {
    if (!drilldown || !query) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/call-report/details?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load call details.");
        setDetails(body);
      })
      .catch((reason) => { if (reason.name !== "AbortError") setError(reason instanceof Error ? reason.message : "Could not load call details."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [drilldown, query]);

  useEffect(() => {
    if (!drilldown) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drilldown, onClose]);

  if (!drilldown) return null;

  return <div className="call-detail-layer fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <aside role="dialog" aria-modal="true" aria-labelledby="call-detail-title" className="flex h-full w-full max-w-3xl flex-col border-l border-white/10 bg-[#0b0e12] shadow-[-32px_0_90px_rgba(0,0,0,.48)]">
      <header className="border-b border-white/[0.08] px-5 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[11px] font-medium uppercase tracking-[0.13em] text-emerald-300/80">Supporting records</p><h2 id="call-detail-title" className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">{drilldown.title}</h2><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">{drilldown.description}</p></div>
          <button onClick={onClose} aria-label="Close call details" className="focus-ring inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"><X className="size-4" /></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <label className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3"><Search className="size-3.5 text-zinc-500"/><span className="sr-only">Search supporting records</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search person, company, title, note or outcome" className="w-full bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"/></label>
          <div className="flex gap-2 text-[10px] text-zinc-500"><span className="rounded-lg border border-white/[0.08] px-2.5 py-2">{number(details?.uniqueProspects ?? 0)} people</span><span className="rounded-lg border border-white/[0.08] px-2.5 py-2">{number(details?.total ?? 0)} calls</span></div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-7">
        {error ? <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-200">{error}</div> : null}
        {loading && !details ? <div className="flex min-h-72 items-center justify-center text-sm text-zinc-500"><Loader2 className="mr-2 size-4 animate-spin"/>Loading call records</div> : null}
        {!loading && details?.rows.length === 0 ? <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-zinc-500">No matching call records.</div> : null}
        <div className="space-y-3">
          {details?.rows.map((call) => <article key={call.id} className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-white/[0.14]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-zinc-100">{call.prospect_name || call.prospect_email}</h3><p className="mt-1 truncate text-xs text-zinc-400">{call.job_title || "Job title unavailable"}</p></div>
              <div className="flex shrink-0 items-center gap-2"><span className={`rounded-md border px-2 py-1 text-[10px] ${call.call_status === "Answered" ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300" : "border-white/10 text-zinc-400"}`}>{call.call_status}</span><span className="mono text-[10px] text-zinc-500">{dateTime(call.completed_at)}</span></div>
            </div>
            <div className="mt-4 grid gap-2 text-[11px] text-zinc-400 sm:grid-cols-2">
              <p className="flex min-w-0 items-center gap-2"><Mail className="size-3 shrink-0 text-zinc-600"/><span className="truncate">{call.prospect_email}</span></p>
              <p className="flex min-w-0 items-center gap-2"><Building2 className="size-3 shrink-0 text-zinc-600"/><span className="truncate">{call.account_name}</span></p>
              <p><span className="text-zinc-600">Industry:</span> {call.industry || "Unclassified"}</p>
              <p><span className="text-zinc-600">Campaign:</span> {call.call_source}</p>
              <p><span className="text-zinc-600">Duration:</span> {duration(call.duration_seconds)}</p>
              <p><span className="text-zinc-600">Outcome:</span> {call.outcome || "Missing"}</p>
            </div>
            <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/20 px-3.5 py-3"><p className="text-[10px] font-medium uppercase tracking-[0.11em] text-zinc-600">Call notes</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-300">{call.call_notes?.trim() || "No call notes were recorded."}</p></div>
            <div className="mt-3 flex justify-end">{call.shareable_link ? <a href={call.shareable_link} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[11px] text-zinc-300 transition hover:bg-white/[0.06] hover:text-white">Open call <ArrowUpRight className="size-3.5"/></a> : <span className="text-[10px] text-zinc-600">No call link available</span>}</div>
          </article>)}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3 text-[10px] text-zinc-500 sm:px-7"><span>{details ? `Page ${details.page} of ${details.pageCount}` : ""}</span><div className="flex gap-2"><button disabled={!details || details.page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-zinc-300 disabled:opacity-30">Previous</button><button disabled={!details || details.page >= details.pageCount || loading} onClick={() => setPage((current) => current + 1)} className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-zinc-300 disabled:opacity-30">Next</button></div></footer>
    </aside>
  </div>;
}
