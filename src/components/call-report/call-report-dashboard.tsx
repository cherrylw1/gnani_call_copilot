"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowUpRight, Building2, CalendarDays, CheckCircle2, ChevronRight, Expand, Filter, MessageSquareText, PhoneCall, Printer, RefreshCw, Search, Target, Users, X } from "lucide-react";
import type { CallReport, ReportFilters } from "@/lib/call-analytics";
import { CallDetailDrawer, type Drilldown } from "@/components/call-report/call-detail-drawer";

const EMPTY_FILTERS: ReportFilters = {};
const CHART_TOOLTIP = { backgroundColor: "#101318", border: "1px solid #2a3038", borderRadius: 12, color: "#f4f4f5", boxShadow: "0 18px 45px rgba(0,0,0,.35)" };
const STATUS_COLORS: Record<string, string> = { Answered: "#4ade80", "Voice Mail": "#64748b", "Not Answered": "#94a3b8", "Not Logged": "#475569", Errored: "#fb7185", Ivr: "#fbbf24", "Call Screener": "#f59e0b" };

const number = (value: number, maximumFractionDigits = 0) => new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
const percent = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const dateTime = (value: string) => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
const dayInIst = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
const subtractDays = (day: string, count: number) => { const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate() - count); return date.toISOString().slice(0, 10); };

function Metric({ label, value, detail, icon: Icon, emphasis = false, onClick }: { label: string; value: string; detail: string; icon: typeof PhoneCall; emphasis?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`focus-ring group relative overflow-hidden rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/20 ${emphasis ? "border-emerald-400/30 bg-emerald-400/[0.07]" : "border-white/[0.08] bg-white/[0.025]"}`}>
    <div className="flex items-center justify-between"><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p><Icon className={`size-4 ${emphasis ? "text-emerald-300" : "text-zinc-600"}`} strokeWidth={1.6} /></div>
    <p className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-zinc-50">{value}</p>
    <div className="mt-1.5 flex items-center justify-between gap-2"><p className="text-xs leading-relaxed text-zinc-500">{detail}</p><ChevronRight className="size-3.5 shrink-0 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-zinc-300"/></div>
  </button>;
}

function Section({ title, detail, children, action }: { title: string; detail?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1014] shadow-[0_24px_80px_rgba(0,0,0,.16)]">
    <header className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>{detail ? <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p> : null}</div>{action}</header>
    {children}
  </section>;
}

function Select({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="min-w-0"><span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-500">{label}</span><select value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="focus-ring h-10 w-full min-w-36 rounded-lg border border-white/10 bg-[#11151a] px-2.5 text-xs text-zinc-200 outline-none"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function EmptyReport({ message }: { message: string }) {
  return <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-8 text-center"><div><Activity className="mx-auto size-7 text-zinc-600"/><p className="mt-4 text-sm font-medium">No report data</p><p className="mt-1 text-xs text-zinc-500">{message}</p></div></div>;
}

function SignalBadge({ signal }: { signal: string }) {
  const classes = signal === "Prioritize" ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300" : signal === "Rework" ? "border-rose-400/25 bg-rose-400/[0.07] text-rose-300" : "border-white/10 bg-white/[0.025] text-zinc-400";
  return <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] ${classes}`}>{signal}</span>;
}

export function CallReportDashboard() {
  const [filters, setFilters] = useState<ReportFilters>(EMPTY_FILTERS);
  const [report, setReport] = useState<CallReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preset, setPreset] = useState("all");
  const [presentation, setPresentation] = useState(false);
  const [prospectSearch, setProspectSearch] = useState("");
  const [prospectCohort, setProspectCohort] = useState("all");
  const [prospectPage, setProspectPage] = useState(1);
  const [drilldown, setDrilldown] = useState<Drilldown | null>(null);

  const query = useMemo(() => { const params = new URLSearchParams(); for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value); return params.toString(); }, [filters]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/call-report${query ? `?${query}` : ""}`, { signal: controller.signal })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error || "Could not load the call report."); setReport(body); })
      .catch((reason) => { if (reason.name !== "AbortError") setError(reason instanceof Error ? reason.message : "Could not load the call report."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query]);
  useEffect(() => { document.documentElement.classList.toggle("call-report-presentation", presentation); return () => document.documentElement.classList.remove("call-report-presentation"); }, [presentation]);

  const open = useCallback((title: string, description: string, scope: Drilldown["scope"], value?: string) => setDrilldown({ title, description, scope, value }), []);
  const updateFilter = (key: keyof ReportFilters, value: string) => setFilters((current) => ({ ...current, [key]: value || undefined }));
  const applyPreset = (value: string) => {
    setPreset(value);
    if (value === "all") return setFilters((current) => ({ ...current, from: undefined, to: undefined }));
    if (value === "custom" || !report?.sourceRange?.max) return;
    const maxDay = dayInIst(report.sourceRange.max);
    const days = value === "7d" ? 7 : value === "14d" ? 14 : 30;
    setFilters((current) => ({ ...current, from: subtractDays(maxDay, days - 1), to: maxDay }));
  };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setPreset("all"); };
  const enterPresentation = async () => { setPresentation(true); try { await document.documentElement.requestFullscreen?.(); } catch { /* The compact layout still works if fullscreen is blocked. */ } };
  const exitPresentation = async () => { setPresentation(false); if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined); };

  const filteredProspects = useMemo(() => {
    if (!report) return [];
    const search = prospectSearch.trim().toLowerCase();
    return report.prospects.filter((item) => {
      if (search && !`${item.prospect} ${item.email} ${item.account} ${item.jobTitle}`.toLowerCase().includes(search)) return false;
      if (prospectCohort === "answered" && item.answered === 0) return false;
      if (prospectCohort === "never" && item.answered > 0) return false;
      if (prospectCohort === "six" && item.periodTouches < 6) return false;
      return true;
    });
  }, [report, prospectSearch, prospectCohort]);
  const prospectPages = Math.max(1, Math.ceil(filteredProspects.length / 25));
  const visibleProspects = filteredProspects.slice((prospectPage - 1) * 25, prospectPage * 25);

  if (error) return <EmptyReport message={error} />;
  if (!report && loading) return <div className="space-y-5"><div className="h-28 animate-pulse rounded-2xl bg-white/[0.035]"/><div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-white/[0.035]"/>)}</div><div className="h-96 animate-pulse rounded-2xl bg-white/[0.035]"/></div>;
  if (!report) return null;

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const maxStatus = Math.max(...report.statuses.map((item) => item.calls), 1);
  const reportPeriod = filters.from || filters.to ? `${filters.from ?? "Start"} to ${filters.to ?? "Latest"}` : "All recorded activity";
  const prioritized = report.campaigns.filter((item) => item.signal === "Prioritize").slice(0, 3);
  const rework = report.campaigns.filter((item) => item.signal === "Rework").slice(0, 3);

  return <div className="call-report relative space-y-5 pb-12">
    <div className="pointer-events-none absolute inset-x-0 -top-7 -z-10 h-72 bg-[radial-gradient(circle_at_12%_0%,rgba(52,211,153,.09),transparent_42%),radial-gradient(circle_at_88%_10%,rgba(59,130,246,.06),transparent_36%)]" />
    <header className="flex flex-col gap-5 py-2 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl"><div className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300/80">Call activity report</div><h1 className="text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">Every attempt, connect, and outcome.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Review outreach volume, account coverage, prospect touchpoints, connected-call notes, and the segments producing the strongest signal.</p></div>
      <div className="call-report-actions flex flex-wrap items-center gap-2"><Link href="/conversation-insights" className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 text-xs text-emerald-300 transition hover:bg-emerald-400/[0.1]"><MessageSquareText className="size-3.5"/>Conversation insights</Link><button onClick={() => window.print()} className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-300 transition hover:bg-white/[0.07]"><Printer className="size-3.5"/>Print report</button>{presentation ? <button onClick={exitPresentation} className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-950"><X className="size-3.5"/>Exit presentation</button> : <button onClick={enterPresentation} className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-950 transition hover:bg-white"><Expand className="size-3.5"/>Present</button>}</div>
    </header>

    <div className="call-report-filter-bar z-20 rounded-2xl border border-white/10 bg-[#0a0d11]/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,.3)] backdrop-blur-xl lg:sticky lg:top-0">
      <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-medium text-zinc-300"><Filter className="size-3.5"/>Filters{activeFilterCount ? <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">{activeFilterCount} active</span> : null}</div>{activeFilterCount ? <button onClick={clearFilters} className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"><X className="size-3.5"/>Clear all</button> : null}</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        <label><span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-500">Period</span><select value={preset} onChange={(event) => applyPreset(event.target.value)} className="focus-ring h-10 w-full rounded-lg border border-white/10 bg-[#11151a] px-2.5 text-xs text-zinc-200 outline-none"><option value="all">All activity</option><option value="7d">Last 7 days</option><option value="14d">Last 14 days</option><option value="30d">Last 30 days</option><option value="custom">Custom range</option></select></label>
        <label><span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-500">From</span><input type="date" value={filters.from ?? ""} onInput={(event) => { setPreset("custom"); updateFilter("from", event.currentTarget.value); }} className="call-report-date focus-ring h-10 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-2.5 text-xs font-medium text-zinc-950 outline-none"/></label>
        <label><span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-500">To</span><input type="date" value={filters.to ?? ""} onInput={(event) => { setPreset("custom"); updateFilter("to", event.currentTarget.value); }} className="call-report-date focus-ring h-10 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-2.5 text-xs font-medium text-zinc-950 outline-none"/></label>
        <Select label="Campaign" value={filters.callSource} options={report.options.callSources} onChange={(value) => updateFilter("callSource", value)} />
        <Select label="Persona" value={filters.persona} options={report.options.personas} onChange={(value) => updateFilter("persona", value)} />
        <Select label="Industry" value={filters.industry} options={report.options.industries} onChange={(value) => updateFilter("industry", value)} />
        <Select label="Result" value={filters.status} options={report.options.statuses} onChange={(value) => updateFilter("status", value)} />
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-zinc-500"><div className="flex items-center gap-2"><CalendarDays className="size-3.5"/><span>{reportPeriod}</span><span className="text-zinc-700">|</span><span>{report.summary.activeDays} active calling days</span></div><div className="flex items-center gap-2"><RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`}/><span>Imported {report.latestImport?.created_at ? dateTime(report.latestImport.created_at) : "Not available"}</span></div></div>

    {report.summary.totalCalls === 0 ? <EmptyReport message="Adjust the selected reporting filters." /> : <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <Metric label="Call touchpoints" value={number(report.summary.totalCalls)} detail={`${number(report.summary.callsPerActiveDay, 1)} per active day`} icon={PhoneCall} onClick={() => open("All calls in this period", "Every call matching the current date range and filters.", "all")}/>
        <Metric label="Prospects attempted" value={number(report.summary.uniqueProspects)} detail={`${percent(report.summary.listCoverage)} of master list`} icon={Users} onClick={() => open("Prospects attempted", "Call-by-call evidence for every prospect attempted in the selected period.", "all")}/>
        <Metric label="Accounts covered" value={number(report.summary.uniqueAccounts)} detail="Unique organizations touched" icon={Building2} onClick={() => open("Accounts covered", "All activity across the accounts reached by the current filters.", "all")}/>
        <Metric label="Prospects reached" value={number(report.summary.uniqueReached)} detail={`${number(report.summary.answeredCalls)} answered calls`} icon={CheckCircle2} emphasis onClick={() => open("Connected calls", "Answered calls with contact details, outcomes, notes, and call links.", "answered")}/>
        <Metric label="Observed connect rate" value={percent(report.summary.connectRate, 2)} detail="Answered divided by definitive results" icon={Target} onClick={() => open("Calls behind the connect rate", "The answered calls used in the observed connect-rate calculation.", "answered")}/>
        <Metric label="Avg. touches per prospect" value={number(report.summary.averageTouches, 1)} detail={`${number(report.summary.totalCalls)} total attempts`} icon={Activity} onClick={() => open("Touchpoint evidence", "Every attempt used to calculate average touches per prospect.", "all")}/>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1.55fr_.85fr]">
        <Section title="Activity and connects" detail="Select a day in the chart to inspect its calls.">
          <div className="h-[350px] px-2 py-5 sm:px-4"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={report.daily} margin={{ top: 8, right: 14, left: -10, bottom: 0 }} onClick={(state) => { const item = report.daily.find((day) => day.label === state?.activeLabel); if (item) open(`Calls on ${item.label}`, "All calls completed on this calling day.", "day", item.date); }} className="cursor-pointer"><defs><linearGradient id="callsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid stroke="#303640" vertical={false}/><XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={CHART_TOOLTIP} labelStyle={{ color: "#d4d4d8" }} formatter={(value, name) => [number(Number(value)), name === "calls" ? "Call touchpoints" : "Answered"]}/><Area type="monotone" dataKey="calls" stroke="#60a5fa" fill="url(#callsFill)" strokeWidth={2}/><Line type="monotone" dataKey="answered" stroke="#4ade80" strokeWidth={2.5} dot={{ fill: "#4ade80", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }}/></ComposedChart></ResponsiveContainer></div>
        </Section>
        <Section title="Period summary" detail="Calculated from the current date range and filters."><div className="space-y-1 p-3">{report.insights.map((insight) => <div key={insight} className="rounded-xl px-3 py-3 transition hover:bg-white/[0.025]"><p className="text-sm leading-6 text-zinc-300">{insight}</p></div>)}</div></Section>
      </div>

      <Section title="Connected calls and notes" detail="The most recent answered calls in this period. Select any record to see the complete call evidence." action={<button onClick={() => open("All connected calls", "Answered calls with contact details, outcomes, notes, and call links.", "answered")} className="focus-ring inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200">View all {number(report.summary.answeredCalls)} <ChevronRight className="size-3.5"/></button>}>
        {report.connectedCalls.length ? <div className="grid gap-px bg-white/[0.06] md:grid-cols-2 xl:grid-cols-3">{report.connectedCalls.slice(0, 6).map((call) => <button key={call.id} onClick={() => open(call.prospect_name, "All calls with this prospect inside the selected period.", "prospect", call.prospect_email)} className="group bg-[#0d1014] p-5 text-left transition hover:bg-white/[0.035]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-100">{call.prospect_name}</p><p className="mt-1 truncate text-xs text-zinc-500">{call.job_title || "Job title unavailable"}</p></div><ArrowUpRight className="size-3.5 shrink-0 text-zinc-700 transition group-hover:text-emerald-300"/></div><p className="mt-3 truncate text-xs text-zinc-400">{call.account_name}</p><p className="mt-4 line-clamp-3 min-h-15 text-xs leading-5 text-zinc-300">{call.call_notes?.trim() || "No call notes were recorded."}</p><div className="mt-4 flex items-center justify-between text-[10px] text-zinc-600"><span>{call.outcome || "Outcome missing"}</span><span className="mono">{dateTime(call.completed_at)}</span></div></button>)}</div> : <div className="p-8 text-center text-sm text-zinc-500">No connected calls in this period.</div>}
      </Section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Section title="Call result composition" detail="Select a result to inspect every matching person and call."><div className="space-y-2 p-4">{report.statuses.map((status) => <button key={status.name} onClick={() => open(`${status.name} calls`, `All calls recorded as ${status.name} in this period.`, "status", status.name)} className="group grid w-full grid-cols-[96px_1fr_72px] items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/[0.035]"><span className="text-xs text-zinc-400 group-hover:text-zinc-100">{status.name}</span><span className="h-2 overflow-hidden rounded-full bg-white/[0.055]"><span className="block h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(1, status.calls / maxStatus * 100)}%`, backgroundColor: STATUS_COLORS[status.name] ?? "#71717a" }}/></span><span className="text-right"><strong className="mono block text-xs font-medium text-zinc-300">{number(status.calls)}</strong><span className="text-[10px] text-zinc-600">{percent(status.share)}</span></span></button>)}</div></Section>
        <Section title="Answered-call outcomes" detail={`${report.summary.outcomeCaptured} of ${report.summary.answeredCalls} answered calls have a recorded outcome.`}><div className="grid grid-cols-2 gap-px bg-white/[0.07] sm:grid-cols-5 xl:grid-cols-2">{report.outcomes.map((outcome) => <button key={outcome.name} onClick={() => open(`${outcome.name} outcomes`, `Answered calls with the ${outcome.name} outcome in this period.`, "outcome", outcome.name)} className="group bg-[#0d1014] p-4 text-left transition hover:bg-white/[0.035]"><div className="flex items-center justify-between"><p className="text-[11px] text-zinc-500 group-hover:text-zinc-300">{outcome.name}</p><ChevronRight className="size-3 text-zinc-700 group-hover:text-zinc-300"/></div><p className="mt-3 text-2xl font-semibold tracking-tight">{number(outcome.calls)}</p><p className="mt-1 text-[10px] text-zinc-600">{percent(outcome.share)} of answered</p></button>)}</div></Section>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[.75fr_1.25fr]">
        <Section title="Touchpoint coverage" detail="Select a cohort to see every call made to those prospects."><div className="space-y-2 p-4">{report.touchpointDistribution.map((bucket) => <button key={bucket.name} onClick={() => open(bucket.name, `All calls made to prospects with ${bucket.name.toLowerCase()} in this period.`, "touchpoint", bucket.name)} className="group flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition hover:border-white/[0.14] hover:bg-white/[0.04]"><span className="text-xs text-zinc-400 group-hover:text-zinc-100">{bucket.name}</span><span className="flex items-center gap-3"><strong className="mono text-sm font-medium text-zinc-200">{number(bucket.prospects)}</strong><ChevronRight className="size-3.5 text-zinc-700 group-hover:text-zinc-300"/></span></button>)}</div></Section>
        <Section title="Prospect touchpoint ledger" detail="Period calls, lifetime calls, calling days, and latest result. Select a row for its full call history." action={<span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] text-zinc-500">{number(filteredProspects.length)} prospects</span>}>
          <div className="flex flex-col gap-2 border-b border-white/[0.07] p-3 sm:flex-row"><label className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3"><Search className="size-3.5 text-zinc-500"/><input value={prospectSearch} onChange={(event) => { setProspectSearch(event.target.value); setProspectPage(1); }} placeholder="Search prospect, email, account or title" className="w-full bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-600"/></label><select value={prospectCohort} onChange={(event) => { setProspectCohort(event.target.value); setProspectPage(1); }} className="focus-ring h-9 rounded-lg border border-white/10 bg-[#11151a] px-2.5 text-xs text-zinc-300 outline-none"><option value="all">All prospects</option><option value="answered">Reached at least once</option><option value="never">Never answered</option><option value="six">6+ touches in period</option></select></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-500"><tr><th className="px-4 py-3 font-medium">Prospect</th><th className="px-3 py-3 font-medium">Account</th><th className="px-3 py-3 text-right font-medium">Period</th><th className="px-3 py-3 text-right font-medium">Lifetime</th><th className="px-3 py-3 text-right font-medium">Days</th><th className="px-3 py-3 font-medium">Last result</th><th className="px-4 py-3 font-medium">Last touch</th></tr></thead><tbody>{visibleProspects.map((item) => <tr key={item.email} onClick={() => open(item.prospect, `All calls with ${item.prospect} inside the selected period.`, "prospect", item.email)} className="cursor-pointer border-t border-white/[0.055] transition hover:bg-white/[0.04]"><td className="px-4 py-3"><p className="font-medium text-zinc-200">{item.prospect}</p><p className="mt-0.5 max-w-56 truncate text-[10px] text-zinc-500">{item.email} | {item.jobTitle || "Title unavailable"}</p></td><td className="max-w-52 truncate px-3 py-3 text-zinc-400">{item.account}</td><td className="mono px-3 py-3 text-right font-medium text-blue-300">{item.periodTouches}</td><td className="mono px-3 py-3 text-right text-zinc-400">{item.lifetimeTouches}</td><td className="mono px-3 py-3 text-right text-zinc-400">{item.daysTouched}</td><td className="px-3 py-3"><span className="inline-flex rounded-full border border-white/[0.08] px-2 py-1 text-[10px] text-zinc-400">{item.lastStatus}</span></td><td className="mono px-4 py-3 text-[10px] text-zinc-500">{dateTime(item.lastTouch)}</td></tr>)}</tbody></table></div>
          <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3 text-[10px] text-zinc-500"><span>Page {prospectPage} of {prospectPages}</span><div className="flex gap-1"><button disabled={prospectPage === 1} onClick={() => setProspectPage((page) => Math.max(1, page - 1))} className="focus-ring rounded-md border border-white/[0.08] px-2.5 py-1.5 text-zinc-300 disabled:opacity-30">Previous</button><button disabled={prospectPage === prospectPages} onClick={() => setProspectPage((page) => Math.min(prospectPages, page + 1))} className="focus-ring rounded-md border border-white/[0.08] px-2.5 py-1.5 text-zinc-300 disabled:opacity-30">Next</button></div></div>
        </Section>
      </div>

      <Section title="Where dialing is working" detail="Sample-aware campaign signals. Rankings use a conservative confidence floor, not raw connect rate alone.">
        <div className="grid gap-px bg-white/[0.07] lg:grid-cols-2"><div className="bg-[#0d1014] p-5"><p className="text-xs font-semibold text-emerald-300">Higher-confidence opportunities</p><p className="mt-1 text-[11px] leading-5 text-zinc-500">Segments with enough observations and a connect rate materially above the current baseline.</p><div className="mt-4 space-y-2">{prioritized.length ? prioritized.map((item) => <button key={item.name} onClick={() => open(item.name, "All calls in this campaign during the selected period.", "campaign", item.name)} className="flex w-full items-center justify-between rounded-lg border border-emerald-400/10 bg-emerald-400/[0.035] px-3 py-3 text-left"><span className="min-w-0"><span className="block truncate text-xs text-zinc-200">{item.name}</span><span className="mt-1 block text-[10px] text-zinc-500">{number(item.calls)} calls, {number(item.answered)} answered</span></span><span className="mono ml-3 text-xs text-emerald-300">{percent(item.connectRate, 2)}</span></button>) : <p className="rounded-lg border border-dashed border-white/10 p-4 text-xs text-zinc-500">No campaign clears the evidence threshold yet.</p>}</div></div><div className="bg-[#0d1014] p-5"><p className="text-xs font-semibold text-rose-300">Segments to revisit</p><p className="mt-1 text-[11px] leading-5 text-zinc-500">High-enough activity with a materially weaker connect rate than the current baseline.</p><div className="mt-4 space-y-2">{rework.length ? rework.map((item) => <button key={item.name} onClick={() => open(item.name, "All calls in this campaign during the selected period.", "campaign", item.name)} className="flex w-full items-center justify-between rounded-lg border border-rose-400/10 bg-rose-400/[0.03] px-3 py-3 text-left"><span className="min-w-0"><span className="block truncate text-xs text-zinc-200">{item.name}</span><span className="mt-1 block text-[10px] text-zinc-500">{number(item.calls)} calls, {number(item.answered)} answered</span></span><span className="mono ml-3 text-xs text-rose-300">{percent(item.connectRate, 2)}</span></button>) : <p className="rounded-lg border border-dashed border-white/10 p-4 text-xs text-zinc-500">No campaign currently meets the rework threshold.</p>}</div></div></div>
      </Section>

      <div className="grid gap-5 xl:grid-cols-2"><PerformanceTable title="Campaign performance" detail="Campaign efficiency with volume, connect rate, and sample-aware signal." rows={report.campaigns} scope="campaign" open={open}/><PerformanceTable title="Persona performance" detail="Persona groups ranked by conservative connect evidence." rows={report.personas} scope="persona" open={open}/></div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Section title="Most-worked accounts" detail="Select an account to inspect its people, calls, outcomes, notes, and call links."><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-500"><tr><th className="px-4 py-3 font-medium">Account</th><th className="px-3 py-3 text-right font-medium">Calls</th><th className="px-3 py-3 text-right font-medium">Prospects</th><th className="px-3 py-3 text-right font-medium">Answered</th><th className="px-4 py-3 text-right font-medium">Connect rate</th></tr></thead><tbody>{report.accounts.slice(0, 15).map((item) => <tr key={item.name} onClick={() => open(item.name, `All calls to ${item.name} during the selected period.`, "account", item.name)} className="cursor-pointer border-t border-white/[0.055] transition hover:bg-white/[0.04]"><td className="max-w-80 truncate px-4 py-3 font-medium text-zinc-300">{item.name}</td><td className="mono px-3 py-3 text-right text-zinc-400">{number(item.calls)}</td><td className="mono px-3 py-3 text-right text-zinc-400">{number(item.prospects)}</td><td className="mono px-3 py-3 text-right text-emerald-300">{number(item.answered)}</td><td className="mono px-4 py-3 text-right text-zinc-400">{percent(item.connectRate, 2)}</td></tr>)}</tbody></table></div></Section>
        <Section title="Outbound number health" detail="Select a number to inspect all calls placed from it."><div className="space-y-1 p-2">{report.outboundNumbers.map((item) => <button key={item.name} onClick={() => open(`Calls from ${item.name}`, "All calls placed from this outbound number during the selected period.", "outbound", item.name)} className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-white/[0.04]"><div><p className="mono text-xs text-zinc-300">{item.name}</p><p className="mt-1 text-[10px] text-zinc-500">{percent(item.voicemailRate)} voicemail | {percent(item.errorRate)} error</p></div><div className="text-right"><p className="mono text-xs text-zinc-300">{number(item.calls)}</p><p className="text-[10px] text-zinc-600">calls</p></div><div className="min-w-14 text-right"><p className="mono text-xs text-emerald-300">{percent(item.connectRate, 2)}</p><p className="text-[10px] text-zinc-600">connect</p></div></button>)}</div></Section>
      </div>

      <Section title="Recent call records" detail="Recent calls matching the current filters. Notes are visible here and the complete record is one click away." action={<button onClick={() => open("All filtered call records", "Every call matching the current filters.", "all")} className="focus-ring inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">View all <ChevronRight className="size-3.5"/></button>}>
        <div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left text-xs"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-500"><tr><th className="px-4 py-3 font-medium">Date</th><th className="px-3 py-3 font-medium">Prospect</th><th className="px-3 py-3 font-medium">Company and industry</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Outcome</th><th className="px-3 py-3 font-medium">Call notes</th><th className="px-4 py-3 text-right font-medium">Call</th></tr></thead><tbody>{report.recentCalls.slice(0, 30).map((call) => <tr key={call.id} onClick={() => open(call.prospect_name, "All calls with this prospect inside the selected period.", "prospect", call.prospect_email)} className="cursor-pointer border-t border-white/[0.055] align-top transition hover:bg-white/[0.04]"><td className="mono whitespace-nowrap px-4 py-3 text-[10px] text-zinc-500">{dateTime(call.completed_at)}</td><td className="px-3 py-3"><p className="font-medium text-zinc-300">{call.prospect_name}</p><p className="mt-0.5 max-w-56 truncate text-[10px] text-zinc-500">{call.prospect_email}</p><p className="mt-0.5 max-w-56 truncate text-[10px] text-zinc-600">{call.job_title || "Title unavailable"}</p></td><td className="px-3 py-3"><p className="max-w-52 truncate text-zinc-400">{call.account_name}</p><p className="mt-1 max-w-52 truncate text-[10px] text-zinc-600">{call.industry || "Unclassified"}</p></td><td className="px-3 py-3 text-zinc-400">{call.call_status}</td><td className="px-3 py-3 text-zinc-400">{call.outcome || "Missing"}</td><td className="max-w-80 px-3 py-3 text-[11px] leading-5 text-zinc-400"><p className="line-clamp-3">{call.call_notes?.trim() || "No call notes were recorded."}</p></td><td className="px-4 py-3 text-right">{call.shareable_link ? <a href={call.shareable_link} onClick={(event) => event.stopPropagation()} target="_blank" rel="noreferrer" aria-label={`Open call record for ${call.prospect_name}`} className="focus-ring inline-flex size-8 items-center justify-center rounded-md border border-white/[0.08] text-zinc-400 transition hover:text-zinc-100"><ArrowUpRight className="size-3.5"/></a> : <span className="text-zinc-700">None</span>}</td></tr>)}</tbody></table></div>
      </Section>
    </>}
    <CallDetailDrawer drilldown={drilldown} filters={filters} onClose={() => setDrilldown(null)} />
  </div>;
}

function PerformanceTable({ title, detail, rows, scope, open }: { title: string; detail: string; rows: CallReport["campaigns"]; scope: "campaign" | "persona"; open: (title: string, description: string, scope: Drilldown["scope"], value?: string) => void }) {
  return <Section title={title} detail={detail}><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-500"><tr><th className="px-4 py-3 font-medium">Group</th><th className="px-3 py-3 text-right font-medium">Calls</th><th className="px-3 py-3 text-right font-medium">Prospects</th><th className="px-3 py-3 text-right font-medium">Answered</th><th className="px-3 py-3 text-right font-medium">Connect</th><th className="px-3 py-3 text-right font-medium">Calls per connect</th><th className="px-4 py-3 text-right font-medium">Signal</th></tr></thead><tbody>{rows.map((item) => <tr key={item.name} onClick={() => open(item.name, `All calls in this ${scope} group during the selected period.`, scope, item.name)} className="cursor-pointer border-t border-white/[0.055] transition hover:bg-white/[0.04]"><td className="max-w-72 truncate px-4 py-3 font-medium text-zinc-300">{item.name}</td><td className="mono px-3 py-3 text-right text-zinc-400">{number(item.calls)}</td><td className="mono px-3 py-3 text-right text-zinc-400">{number(item.prospects)}</td><td className="mono px-3 py-3 text-right text-emerald-300">{number(item.answered)}</td><td className="mono px-3 py-3 text-right text-zinc-400">{percent(item.connectRate, 2)}</td><td className="mono px-3 py-3 text-right text-zinc-400">{item.callsPerConnect ? number(item.callsPerConnect, 1) : "No connects"}</td><td className="px-4 py-3 text-right"><SignalBadge signal={item.signal}/></td></tr>)}</tbody></table></div></Section>;
}
