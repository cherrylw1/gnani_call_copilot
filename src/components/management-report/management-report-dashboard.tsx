"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Expand,
  FileText,
  Filter,
  PhoneCall,
  Printer,
  RefreshCw,
  Search,
  Target,
  Users,
  X
} from "lucide-react";
import { toast } from "sonner";
import type { ManagementReport, ReportFilters } from "@/lib/call-analytics";

const EMPTY_FILTERS: ReportFilters = {};
const CHART_TOOLTIP = { backgroundColor: "#101318", border: "1px solid #2a3038", borderRadius: 12, color: "#f4f4f5", boxShadow: "0 18px 45px rgba(0,0,0,.35)" };
const STATUS_COLORS: Record<string, string> = {
  Answered: "#4ade80",
  "Voice Mail": "#64748b",
  "Not Answered": "#94a3b8",
  "Not Logged": "#475569",
  Errored: "#fb7185",
  Ivr: "#fbbf24",
  "Call Screener": "#f59e0b"
};

const number = (value: number, maximumFractionDigits = 0) => new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
const percent = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const duration = (seconds: number) => {
  if (seconds < 60) return `${number(seconds)} sec`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m ${Math.round(seconds % 60)}s`;
};
const dateTime = (value: string) => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
const dayInIst = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
const subtractDays = (day: string, count: number) => {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - count);
  return date.toISOString().slice(0, 10);
};

function Metric({ label, value, detail, icon: Icon, emphasis = false }: { label: string; value: string; detail: string; icon: typeof PhoneCall; emphasis?: boolean }) {
  return <div className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 ${emphasis ? "border-emerald-400/30 bg-emerald-400/[0.07]" : "border-white/[0.08] bg-white/[0.025]"}`}>
    <div className="flex items-center justify-between"><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p><Icon className={`size-4 ${emphasis ? "text-emerald-300" : "text-zinc-600"}`} strokeWidth={1.6} /></div>
    <p className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-zinc-50">{value}</p>
    <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{detail}</p>
  </div>;
}

function Section({ title, detail, children, action }: { title: string; detail?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1014] shadow-[0_24px_80px_rgba(0,0,0,.16)]">
    <header className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>{detail ? <p className="mt-1 text-xs text-zinc-500">{detail}</p> : null}</div>{action}
    </header>
    {children}
  </section>;
}

function Select({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="min-w-0"><span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-600">{label}</span><select value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="focus-ring h-9 w-full min-w-36 rounded-lg border border-white/10 bg-[#11151a] px-2.5 text-xs text-zinc-300 outline-none"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function EmptyReport({ message }: { message: string }) {
  return <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-8 text-center"><div><Activity className="mx-auto size-7 text-zinc-600"/><p className="mt-4 text-sm font-medium">No report data</p><p className="mt-1 text-xs text-zinc-500">{message}</p></div></div>;
}

export function ManagementReportDashboard() {
  const [filters, setFilters] = useState<ReportFilters>(EMPTY_FILTERS);
  const [report, setReport] = useState<ManagementReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preset, setPreset] = useState("all");
  const [presentation, setPresentation] = useState(false);
  const [prospectSearch, setProspectSearch] = useState("");
  const [prospectCohort, setProspectCohort] = useState("all");
  const [prospectPage, setProspectPage] = useState(1);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/management-report${query ? `?${query}` : ""}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load the management report.");
        setReport(body);
      })
      .catch((reason) => { if (reason.name !== "AbortError") setError(reason instanceof Error ? reason.message : "Could not load the management report."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    document.documentElement.classList.toggle("management-presentation", presentation);
    return () => document.documentElement.classList.remove("management-presentation");
  }, [presentation]);

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
  const enterPresentation = async () => {
    setPresentation(true);
    try { await document.documentElement.requestFullscreen?.(); } catch { /* Fullscreen can be blocked; layout mode still works. */ }
  };
  const exitPresentation = async () => {
    setPresentation(false);
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
  };

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
  const reportPeriod = filters.from || filters.to ? `${filters.from ?? "Start"} – ${filters.to ?? "Latest"}` : "All recorded activity";

  return <div className="management-report relative space-y-5 pb-12">
    <div className="pointer-events-none absolute inset-x-0 -top-7 -z-10 h-72 bg-[radial-gradient(circle_at_12%_0%,rgba(52,211,153,.09),transparent_42%),radial-gradient(circle_at_88%_10%,rgba(59,130,246,.06),transparent_36%)]" />
    <header className="flex flex-col gap-5 py-2 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl"><div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300/80"><span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.75)]"/>Management reporting</div><h1 className="text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">Call activity, clearly accounted for.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">A management-ready view of outreach volume, account coverage, contact-level touchpoints, and recorded outcomes.</p></div>
      <div className="management-actions flex flex-wrap items-center gap-2"><button onClick={() => window.print()} className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-300 transition hover:bg-white/[0.07]"><Printer className="size-3.5"/>Print report</button>{presentation ? <button onClick={exitPresentation} className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-950"><X className="size-3.5"/>Exit presentation</button> : <button onClick={enterPresentation} className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-950 transition hover:bg-white"><Expand className="size-3.5"/>Present</button>}</div>
    </header>

    <div className="management-filter-bar sticky top-0 z-20 rounded-2xl border border-white/10 bg-[#0a0d11]/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,.3)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-medium text-zinc-400"><Filter className="size-3.5"/>Filters{activeFilterCount ? <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">{activeFilterCount} active</span> : null}</div>{activeFilterCount ? <button onClick={clearFilters} className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"><X className="size-3.5"/>Clear all</button> : null}</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        <label><span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-600">Period</span><select value={preset} onChange={(event) => applyPreset(event.target.value)} className="focus-ring h-9 w-full rounded-lg border border-white/10 bg-[#11151a] px-2.5 text-xs text-zinc-300 outline-none"><option value="all">All activity</option><option value="7d">Last 7 days</option><option value="14d">Last 14 days</option><option value="30d">Last 30 days</option><option value="custom">Custom range</option></select></label>
        <label><span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-600">From</span><input type="date" value={filters.from ?? ""} onChange={(event) => { setPreset("custom"); updateFilter("from", event.target.value); }} className="focus-ring h-9 w-full rounded-lg border border-white/10 bg-[#11151a] px-2.5 text-xs text-zinc-300 outline-none"/></label>
        <label><span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-600">To</span><input type="date" value={filters.to ?? ""} onChange={(event) => { setPreset("custom"); updateFilter("to", event.target.value); }} className="focus-ring h-9 w-full rounded-lg border border-white/10 bg-[#11151a] px-2.5 text-xs text-zinc-300 outline-none"/></label>
        <Select label="Campaign" value={filters.callSource} options={report.options.callSources} onChange={(value) => updateFilter("callSource", value)} />
        <Select label="Persona" value={filters.persona} options={report.options.personas} onChange={(value) => updateFilter("persona", value)} />
        <Select label="Industry" value={filters.industry} options={report.options.industries} onChange={(value) => updateFilter("industry", value)} />
        <Select label="Result" value={filters.status} options={report.options.statuses} onChange={(value) => updateFilter("status", value)} />
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-zinc-500"><div className="flex items-center gap-2"><CalendarDays className="size-3.5"/><span>{reportPeriod}</span><span className="text-zinc-700">•</span><span>{report.summary.activeDays} active calling days</span></div><div className="flex items-center gap-2"><RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`}/><span>Imported {report.latestImport?.created_at ? dateTime(report.latestImport.created_at) : "—"}</span></div></div>

    {report.summary.totalCalls === 0 ? <EmptyReport message="Adjust the selected reporting filters." /> : <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <Metric label="Call touchpoints" value={number(report.summary.totalCalls)} detail={`${number(report.summary.callsPerActiveDay, 1)} per active day`} icon={PhoneCall}/>
        <Metric label="Prospects attempted" value={number(report.summary.uniqueProspects)} detail={`${percent(report.summary.listCoverage)} of master list`} icon={Users}/>
        <Metric label="Accounts covered" value={number(report.summary.uniqueAccounts)} detail="Unique organizations touched" icon={Building2}/>
        <Metric label="Prospects reached" value={number(report.summary.uniqueReached)} detail={`${number(report.summary.answeredCalls)} answered calls`} icon={CheckCircle2} emphasis/>
        <Metric label="Observed connect rate" value={percent(report.summary.connectRate, 2)} detail="Answered ÷ definitive statuses" icon={Target}/>
        <Metric label="Avg. touches / prospect" value={number(report.summary.averageTouches, 1)} detail={`${number(report.summary.totalCalls)} total call attempts`} icon={Activity}/>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1.55fr_.85fr]">
        <Section title="Activity and connects" detail="Daily calling volume with answered conversations layered over it.">
          <div className="h-[350px] px-2 py-5 sm:px-4"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={report.daily} margin={{ top: 8, right: 14, left: -10, bottom: 0 }}><defs><linearGradient id="callsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid stroke="#20252c" vertical={false}/><XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={CHART_TOOLTIP} labelStyle={{ color: "#a1a1aa" }} formatter={(value, name) => [number(Number(value)), name === "calls" ? "Call touchpoints" : "Answered"]}/><Area type="monotone" dataKey="calls" stroke="#60a5fa" fill="url(#callsFill)" strokeWidth={2}/><Line type="monotone" dataKey="answered" stroke="#4ade80" strokeWidth={2.5} dot={{ fill: "#4ade80", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }}/></ComposedChart></ResponsiveContainer></div>
        </Section>
        <Section title="What management should know" detail="Automatically calculated from the selected activity.">
          <div className="divide-y divide-white/[0.06]">{report.insights.map((insight, index) => <div key={insight} className="flex gap-3 px-5 py-4"><span className="mono mt-0.5 text-[10px] text-emerald-300/70">0{index + 1}</span><p className="text-sm leading-6 text-zinc-300">{insight}</p></div>)}</div>
        </Section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Section title="Call result composition" detail="Every call status, with volume and prospect coverage.">
          <div className="space-y-4 p-5">{report.statuses.map((status) => <button key={status.name} onClick={() => updateFilter("status", filters.status === status.name ? "" : status.name)} className="group grid w-full grid-cols-[92px_1fr_64px] items-center gap-3 text-left"><span className="text-xs text-zinc-400 group-hover:text-zinc-100">{status.name}</span><span className="h-2 overflow-hidden rounded-full bg-white/[0.045]"><span className="block h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(1, status.calls / maxStatus * 100)}%`, backgroundColor: STATUS_COLORS[status.name] ?? "#71717a" }}/></span><span className="text-right"><strong className="mono block text-xs font-medium text-zinc-300">{number(status.calls)}</strong><span className="text-[10px] text-zinc-600">{percent(status.share)}</span></span></button>)}</div>
        </Section>
        <Section title="Answered-call dispositions" detail={`${report.summary.outcomeCaptured} of ${report.summary.answeredCalls} answered calls have a recorded outcome.`}>
          <div className="grid grid-cols-2 gap-px bg-white/[0.07] sm:grid-cols-5 xl:grid-cols-2">{report.outcomes.map((outcome) => <div key={outcome.name} className="bg-[#0d1014] p-4"><p className="text-[11px] text-zinc-500">{outcome.name}</p><p className="mt-3 text-2xl font-semibold tracking-tight">{number(outcome.calls)}</p><p className="mt-1 text-[10px] text-zinc-600">{percent(outcome.share)} of answered</p></div>)}</div>
        </Section>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[.75fr_1.25fr]">
        <Section title="Touchpoint coverage" detail="How frequently prospects were called inside the selected period.">
          <div className="h-[310px] p-5"><ResponsiveContainer width="100%" height="100%"><BarChart data={report.touchpointDistribution} layout="vertical" margin={{ left: 12, right: 12 }}><CartesianGrid stroke="#20252c" horizontal={false}/><XAxis type="number" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="name" width={94} tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: "rgba(255,255,255,.025)" }} formatter={(value) => [number(Number(value)), "Prospects"]}/><Bar dataKey="prospects" fill="#60a5fa" radius={[0, 6, 6, 0]} barSize={18}/></BarChart></ResponsiveContainer></div>
        </Section>
        <Section title="Prospect touchpoint ledger" detail="Period calls, lifetime calls, distinct calling days, and last recorded result." action={<span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] text-zinc-500">{number(filteredProspects.length)} prospects</span>}>
          <div className="flex flex-col gap-2 border-b border-white/[0.07] p-3 sm:flex-row"><label className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3"><Search className="size-3.5 text-zinc-600"/><input value={prospectSearch} onChange={(event) => { setProspectSearch(event.target.value); setProspectPage(1); }} placeholder="Search prospect, email, account or title" className="w-full bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-700"/></label><select value={prospectCohort} onChange={(event) => { setProspectCohort(event.target.value); setProspectPage(1); }} className="focus-ring h-9 rounded-lg border border-white/10 bg-[#11151a] px-2.5 text-xs text-zinc-300 outline-none"><option value="all">All prospects</option><option value="answered">Reached at least once</option><option value="never">Never answered</option><option value="six">6+ touches in period</option></select></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-600"><tr><th className="px-4 py-3 font-medium">Prospect</th><th className="px-3 py-3 font-medium">Account</th><th className="px-3 py-3 text-right font-medium">Period</th><th className="px-3 py-3 text-right font-medium">Lifetime</th><th className="px-3 py-3 text-right font-medium">Days</th><th className="px-3 py-3 font-medium">Last result</th><th className="px-4 py-3 font-medium">Last touch</th></tr></thead><tbody>{visibleProspects.map((item) => <tr key={item.email} className="border-t border-white/[0.055] transition hover:bg-white/[0.025]"><td className="px-4 py-3"><p className="font-medium text-zinc-200">{item.prospect}</p><p className="mt-0.5 max-w-56 truncate text-[10px] text-zinc-600">{item.email} · {item.jobTitle || "Title unavailable"}</p></td><td className="max-w-52 truncate px-3 py-3 text-zinc-400">{item.account}</td><td className="mono px-3 py-3 text-right font-medium text-blue-300">{item.periodTouches}</td><td className="mono px-3 py-3 text-right text-zinc-400">{item.lifetimeTouches}</td><td className="mono px-3 py-3 text-right text-zinc-400">{item.daysTouched}</td><td className="px-3 py-3"><span className="inline-flex rounded-full border border-white/[0.08] px-2 py-1 text-[10px] text-zinc-400">{item.lastStatus}</span></td><td className="mono px-4 py-3 text-[10px] text-zinc-500">{dateTime(item.lastTouch)}</td></tr>)}</tbody></table></div>
          <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3 text-[10px] text-zinc-600"><span>Page {prospectPage} of {prospectPages}</span><div className="flex gap-1"><button disabled={prospectPage === 1} onClick={() => setProspectPage((page) => Math.max(1, page - 1))} className="focus-ring rounded-md border border-white/[0.08] px-2.5 py-1.5 text-zinc-400 disabled:opacity-30">Previous</button><button disabled={prospectPage === prospectPages} onClick={() => setProspectPage((page) => Math.min(prospectPages, page + 1))} className="focus-ring rounded-md border border-white/[0.08] px-2.5 py-1.5 text-zinc-400 disabled:opacity-30">Next</button></div></div>
        </Section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <RankingTable title="Campaign performance" detail="Where activity was allocated and how often calls connected." rows={report.campaigns} />
        <RankingTable title="Persona performance" detail="Normalized persona groups with raw activity aggregated beneath them." rows={report.personas} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Section title="Most-worked accounts" detail="Accounts ranked by call touchpoints during the selected period.">
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-600"><tr><th className="px-4 py-3 font-medium">Account</th><th className="px-3 py-3 text-right font-medium">Calls</th><th className="px-3 py-3 text-right font-medium">Prospects</th><th className="px-3 py-3 text-right font-medium">Answered</th><th className="px-4 py-3 text-right font-medium">Connect rate</th></tr></thead><tbody>{report.accounts.slice(0, 15).map((item) => <tr key={item.name} className="border-t border-white/[0.055]"><td className="max-w-80 truncate px-4 py-3 font-medium text-zinc-300">{item.name}</td><td className="mono px-3 py-3 text-right text-zinc-400">{number(item.calls)}</td><td className="mono px-3 py-3 text-right text-zinc-400">{number(item.prospects)}</td><td className="mono px-3 py-3 text-right text-emerald-300">{number(item.answered)}</td><td className="mono px-4 py-3 text-right text-zinc-400">{percent(item.connectRate, 2)}</td></tr>)}</tbody></table></div>
        </Section>
        <Section title="Outbound number health" detail="A quick comparison of the six numbers used for calls.">
          <div className="divide-y divide-white/[0.06]">{report.outboundNumbers.map((item) => <div key={item.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5"><div><p className="mono text-xs text-zinc-300">{item.name}</p><p className="mt-1 text-[10px] text-zinc-600">{percent(item.voicemailRate)} voicemail · {percent(item.errorRate)} error</p></div><div className="text-right"><p className="mono text-xs text-zinc-300">{number(item.calls)}</p><p className="text-[10px] text-zinc-600">calls</p></div><div className="min-w-14 text-right"><p className="mono text-xs text-emerald-300">{percent(item.connectRate, 2)}</p><p className="text-[10px] text-zinc-600">connect</p></div></div>)}</div>
        </Section>
      </div>

      <Section title="Supporting call records" detail="The most recent filtered calls, retained for management-level verification." action={<button onClick={() => toast.success("Use Print report for a management-ready export.")} className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-200"><FileText className="size-3"/>Report export</button>}>
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-600"><tr><th className="px-4 py-3 font-medium">Date</th><th className="px-3 py-3 font-medium">Prospect</th><th className="px-3 py-3 font-medium">Account</th><th className="px-3 py-3 font-medium">Campaign</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 text-right font-medium">Duration</th><th className="px-3 py-3 font-medium">Outcome</th><th className="px-4 py-3 text-right font-medium">Call</th></tr></thead><tbody>{report.recentCalls.slice(0, 40).map((call) => <tr key={call.id} className="border-t border-white/[0.055] transition hover:bg-white/[0.025]"><td className="mono whitespace-nowrap px-4 py-3 text-[10px] text-zinc-500">{dateTime(call.completed_at)}</td><td className="px-3 py-3"><p className="font-medium text-zinc-300">{call.prospect_name}</p><p className="mt-0.5 max-w-48 truncate text-[10px] text-zinc-600">{call.job_title || call.prospect_email}</p></td><td className="max-w-52 truncate px-3 py-3 text-zinc-400">{call.account_name}</td><td className="max-w-52 truncate px-3 py-3 text-zinc-500">{call.call_source}</td><td className="px-3 py-3"><span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[call.call_status] ?? "#71717a" }}/>{call.call_status}</span></td><td className="mono px-3 py-3 text-right text-zinc-400">{call.duration_seconds === null ? "—" : duration(call.duration_seconds)}</td><td className="px-3 py-3 text-zinc-500">{call.outcome || "—"}</td><td className="px-4 py-3 text-right">{call.shareable_link ? <a href={call.shareable_link} target="_blank" rel="noreferrer" aria-label={`Open call record for ${call.prospect_name}`} className="focus-ring inline-flex size-7 items-center justify-center rounded-md border border-white/[0.08] text-zinc-500 transition hover:text-zinc-100"><ArrowUpRight className="size-3.5"/></a> : <span className="text-zinc-700">—</span>}</td></tr>)}</tbody></table></div>
      </Section>
    </>}
  </div>;
}

function RankingTable({ title, detail, rows }: { title: string; detail: string; rows: ManagementReport["campaigns"] }) {
  return <Section title={title} detail={detail}><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-600"><tr><th className="px-4 py-3 font-medium">Group</th><th className="px-3 py-3 text-right font-medium">Calls</th><th className="px-3 py-3 text-right font-medium">Prospects</th><th className="px-3 py-3 text-right font-medium">Answered</th><th className="px-4 py-3 text-right font-medium">Connect</th></tr></thead><tbody>{rows.map((item) => <tr key={item.name} className="border-t border-white/[0.055]"><td className="max-w-72 truncate px-4 py-3 font-medium text-zinc-300">{item.name}</td><td className="mono px-3 py-3 text-right text-zinc-400">{number(item.calls)}</td><td className="mono px-3 py-3 text-right text-zinc-400">{number(item.prospects)}</td><td className="mono px-3 py-3 text-right text-emerald-300">{number(item.answered)}</td><td className="mono px-4 py-3 text-right text-zinc-400">{percent(item.connectRate, 2)}</td></tr>)}</tbody></table></div></Section>;
}
