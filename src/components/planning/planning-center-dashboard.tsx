"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronRight, CirclePause, ClipboardCheck, Filter, ListTodo, Search, Target, UserRoundSearch, Users, X } from "lucide-react";
import { toast } from "sonner";
import type { PlanningCenter } from "@/lib/planning-analytics";
import type { OutreachTask } from "@/lib/outreach-tasks";
import { AccountMemoryDrawer } from "@/components/planning/account-memory-drawer";

type AccountRow = PlanningCenter["accounts"][number];
const categoryStyles: Record<string, string> = {
  "Work now": "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200",
  "Find stakeholder": "border-sky-400/20 bg-sky-400/[0.07] text-sky-200",
  "Nurture": "border-amber-300/20 bg-amber-300/[0.06] text-amber-100",
  "Continue outreach": "border-white/10 bg-white/[0.04] text-zinc-300",
  "Data cleanup": "border-orange-300/20 bg-orange-300/[0.06] text-orange-100",
  "Pause": "border-rose-400/20 bg-rose-400/[0.06] text-rose-200",
  "Do not contact": "border-rose-400/25 bg-rose-400/[0.09] text-rose-100"
};
const formatPercent = (value: number) => `${(value * 100).toFixed(value < 0.01 ? 2 : 1)}%`;
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "No calls";

export function PlanningCenterDashboard() {
  const [report, setReport] = useState<PlanningCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [account, setAccount] = useState<{ companyId: string | null; companyName: string } | null>(null);
  const [visibleAccounts, setVisibleAccounts] = useState(60);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/planning", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Planning data unavailable.");
      setReport(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Planning data unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const accounts = useMemo(() => {
    if (!report) return [];
    return report.accounts.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (industry !== "all" && item.industry !== industry) return false;
      if (search && ![item.companyName, item.industry, item.category, item.reason, item.nextAction, item.latestNote].some((value) => value?.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [report, category, industry, search]);

  const clear = () => { setSearch(""); setCategory("all"); setIndustry("all"); setVisibleAccounts(60); };
  const updateTask = async (task: OutreachTask, status: "done" | "dismissed") => {
    setBusyId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Task update failed.");
      toast.success(status === "done" ? "Cleanup completed." : "Cleanup dismissed.");
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Task update failed.");
    } finally {
      setBusyId(null);
    }
  };

  if (!report && loading) return <div className="space-y-5"><div className="h-28 animate-pulse rounded-2xl bg-white/[0.035]"/><div className="grid gap-3 md:grid-cols-3"><div className="h-32 animate-pulse rounded-2xl bg-white/[0.035] md:col-span-2"/><div className="h-32 animate-pulse rounded-2xl bg-white/[0.035]"/></div><div className="h-[480px] animate-pulse rounded-2xl bg-white/[0.035]"/></div>;
  if (error || !report) return <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-6"><h1 className="text-xl font-semibold">Planning Center unavailable</h1><p className="mt-2 text-sm text-rose-100/70">{error}</p><button onClick={() => void load()} className="focus-ring mt-5 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950">Try again</button></div>;

  const industries = [...new Set(report.accounts.map((item) => item.industry))].sort();
  const activeFilters = Number(Boolean(search)) + Number(category !== "all") + Number(industry !== "all");

  return <div className="pb-12">
    <header className="flex flex-col gap-5 py-2 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl"><p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300/80">Planning center</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-zinc-50 md:text-4xl">Decide where the next block of effort goes.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Account priorities combine master-list coverage, call history, connected evidence, and unfinished actions.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/action-center" className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-3 text-sm text-emerald-200"><ListTodo className="size-4"/>Action Center</Link><Link href="/call-report" className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-sm text-zinc-300">Call Report<ArrowUpRight className="size-4"/></Link></div>
    </header>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Accounts to work now" value={report.summary.workNow} helper="Open follow-up evidence" icon={Target} onClick={() => setCategory("Work now")} active={category === "Work now"}/>
      <Metric label="Untouched contacts" value={report.summary.untouchedContacts} helper={`${report.summary.attemptedContacts.toLocaleString()} already attempted`} icon={Users}/>
      <Metric label="Find another stakeholder" value={report.summary.findStakeholder} helper="Wrong owner or missing path" icon={UserRoundSearch} onClick={() => setCategory("Find stakeholder")} active={category === "Find stakeholder"}/>
      <Metric label="Cleanup actions" value={report.summary.cleanup} helper={`${report.summary.overdue} overdue actions`} icon={ClipboardCheck} onClick={() => setCategory("Data cleanup")} active={category === "Data cleanup"}/>
    </section>

    <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,.75fr)]">
      <div className="rounded-2xl border border-white/10 bg-[#0b0e11] p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-base font-medium">Today&apos;s operating plan</h2><p className="mt-1 text-sm text-zinc-500">Start with open evidence, then expand account coverage.</p></div><span className="text-xs text-zinc-600">{report.summary.masterContacts.toLocaleString()} master contacts</span></div><div className="mt-5 grid gap-3 md:grid-cols-2">
        <PlanStep title="Complete high-signal actions" value={report.summary.workNow} detail="Meeting, email, and referral evidence should be worked before another cold batch." icon={Check}/>
        <PlanStep title="Resolve contact blockers" value={report.summary.cleanup} detail="Suppression, departed contacts, missing notes, and wrong-owner records need cleanup." icon={ClipboardCheck}/>
        <PlanStep title="Expand untouched coverage" value={report.summary.untouchedContacts} detail="These master-list contacts have no matching call record in the current export." icon={Users}/>
        <PlanStep title="Protect against over-dialing" value={report.summary.paused} detail="Accounts with repeated attempts or negative connected evidence are deprioritized." icon={CirclePause}/>
      </div></div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h2 className="text-base font-medium">Contact coverage</h2><p className="mt-1 text-sm text-zinc-500">Touch distribution across the master list.</p><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">{report.coverageBuckets.map((bucket) => <div key={bucket.name} className="rounded-xl border border-white/[0.07] bg-zinc-950/40 p-3"><p className="mono text-2xl text-zinc-100">{bucket.contacts.toLocaleString()}</p><p className="mt-2 text-xs text-zinc-500">{bucket.name}</p></div>)}</div><p className="mt-4 text-xs leading-5 text-zinc-600">The master-contact table is the denominator, so contacts with zero call records remain visible.</p></div>
    </section>

    <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e11]">
      <div className="border-b border-white/10 p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-base font-medium">Account priority board</h2><p className="mt-1 text-sm text-zinc-500">Every category includes the evidence and next action behind it.</p></div>{activeFilters > 0 && <button onClick={clear} className="focus-ring inline-flex h-9 items-center gap-2 self-start rounded-lg border border-white/10 px-3 text-xs text-zinc-400"><X className="size-3.5"/>Clear {activeFilters} filter{activeFilters === 1 ? "" : "s"}</button>}</div><div className="mt-4 grid gap-3 md:grid-cols-[minmax(220px,1fr)_200px_220px]"><label><span className="mb-2 block text-xs text-zinc-500">Search accounts</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600"/><input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleAccounts(60); }} className="focus-ring h-10 w-full rounded-lg border border-white/10 bg-zinc-950 pl-9 pr-3 text-sm placeholder:text-zinc-700" placeholder="Company, industry, note or action"/></span></label><label><span className="mb-2 block text-xs text-zinc-500">Priority category</span><select value={category} onChange={(event) => { setCategory(event.target.value); setVisibleAccounts(60); }} className="focus-ring h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"><option value="all">All categories</option>{report.categories.map((item) => <option key={item.name} value={item.name}>{item.name} ({item.accounts})</option>)}</select></label><label><span className="mb-2 block text-xs text-zinc-500">Industry</span><select value={industry} onChange={(event) => { setIndustry(event.target.value); setVisibleAccounts(60); }} className="focus-ring h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"><option value="all">All industries</option>{industries.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-600"><tr><th className="px-4 py-3 font-medium">Account</th><th className="px-4 py-3 font-medium">Priority</th><th className="px-4 py-3 font-medium">Coverage</th><th className="px-4 py-3 font-medium">Calls</th><th className="px-4 py-3 font-medium">Last touch</th><th className="px-4 py-3 font-medium">Recommended next action</th><th className="px-4 py-3 font-medium"></th></tr></thead><tbody className="divide-y divide-white/[0.07]">{accounts.slice(0, visibleAccounts).map((item) => <AccountTableRow key={item.key} account={item} onOpen={() => setAccount({ companyId: item.companyId, companyName: item.companyName })}/>)}</tbody></table></div>
      {!accounts.length && <div className="px-6 py-14 text-center"><Filter className="mx-auto size-7 text-zinc-600"/><p className="mt-3 text-sm text-zinc-400">No accounts match these filters.</p></div>}
      {accounts.length > visibleAccounts && <div className="border-t border-white/10 p-4 text-center"><button onClick={() => setVisibleAccounts((value) => value + 60)} className="focus-ring rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 hover:bg-white/[0.05]">Show 60 more</button></div>}
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e11]"><div className="border-b border-white/10 p-4"><h2 className="text-base font-medium">Campaign allocation</h2><p className="mt-1 text-sm text-zinc-500">Connect rate, task yield, and sample size are shown together.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.1em] text-zinc-600"><tr><th className="px-4 py-3 font-medium">Campaign</th><th className="px-4 py-3 font-medium">Calls</th><th className="px-4 py-3 font-medium">Connects</th><th className="px-4 py-3 font-medium">Connect rate</th><th className="px-4 py-3 font-medium">Open actions</th><th className="px-4 py-3 font-medium">Signal</th></tr></thead><tbody className="divide-y divide-white/[0.07]">{report.campaigns.map((item) => <tr key={item.name} className="text-sm"><td className="max-w-[300px] px-4 py-4"><p className="truncate text-zinc-300">{item.name}</p><p className="mt-1 text-xs text-zinc-600">{item.prospects.toLocaleString()} prospects</p></td><td className="mono px-4 py-4 text-zinc-400">{item.calls.toLocaleString()}</td><td className="mono px-4 py-4 text-zinc-400">{item.answered}</td><td className="mono px-4 py-4 text-zinc-300">{formatPercent(item.connectRate)}</td><td className="mono px-4 py-4 text-zinc-300">{item.actionable}</td><td className="px-4 py-4"><span className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.08em] ${item.recommendation === "Prioritize" ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200" : item.recommendation === "Rework" ? "border-rose-400/20 bg-rose-400/[0.06] text-rose-200" : "border-white/10 bg-white/[0.035] text-zinc-400"}`}>{item.recommendation}</span></td></tr>)}</tbody></table></div></div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e11]"><div className="flex items-start justify-between border-b border-white/10 p-4"><div><h2 className="text-base font-medium">Data cleanup queue</h2><p className="mt-1 text-sm text-zinc-500">Resolve before more outreach.</p></div><Link href="/action-center" className="focus-ring rounded-lg p-2 text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200" aria-label="Open Action Center"><ArrowUpRight className="size-4"/></Link></div>{report.cleanupTasks.length ? <div className="max-h-[560px] overflow-y-auto divide-y divide-white/[0.07]">{report.cleanupTasks.map((task) => <CleanupRow key={task.id} task={task} busy={busyId === task.id} onDone={() => void updateTask(task, "done")} onDismiss={() => void updateTask(task, "dismissed")}/>)}</div> : <div className="px-6 py-14 text-center"><Check className="mx-auto size-7 text-emerald-300/70"/><p className="mt-3 text-sm text-zinc-400">No unresolved cleanup actions.</p></div>}</div>
    </section>

    <section className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4"><p className="text-sm text-emerald-100">Transparent planning rules</p><p className="mt-2 max-w-4xl text-xs leading-5 text-emerald-100/60">The board favors explicit meetings, requested follow-ups, referrals, and connected evidence. It reduces priority for suppression, negative notes, unresolved cleanup, and repeated attempts without a connect. Call duration alone never creates buying intent.</p></section>

    <AccountMemoryDrawer account={account} onClose={() => setAccount(null)}/>
  </div>;
}

function Metric({ label, value, helper, icon: Icon, onClick, active }: { label: string; value: number; helper: string; icon: typeof Target; onClick?: () => void; active?: boolean }) {
  const Element = onClick ? "button" : "div";
  return <Element onClick={onClick} className={`rounded-2xl border p-4 text-left transition ${active ? "border-emerald-400/30 bg-emerald-400/[0.07]" : "border-white/10 bg-white/[0.025]"} ${onClick ? "focus-ring hover:bg-white/[0.05] active:scale-[0.99]" : ""}`}><Icon className="size-4 text-zinc-500"/><p className="mono mt-5 text-3xl font-semibold tracking-tight text-zinc-100">{value.toLocaleString()}</p><p className="mt-2 text-sm text-zinc-300">{label}</p><p className="mt-1 text-xs text-zinc-600">{helper}</p></Element>;
}

function PlanStep({ title, value, detail, icon: Icon }: { title: string; value: number; detail: string; icon: typeof Check }) {
  return <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"><div className="flex items-start gap-3"><div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]"><Icon className="size-4 text-zinc-400"/></div><div><div className="flex items-center gap-2"><p className="text-sm font-medium text-zinc-200">{title}</p><span className="mono text-sm text-emerald-300">{value.toLocaleString()}</span></div><p className="mt-2 text-xs leading-5 text-zinc-500">{detail}</p></div></div></div>;
}

function AccountTableRow({ account, onOpen }: { account: AccountRow; onOpen: () => void }) {
  return <tr className="text-sm transition hover:bg-white/[0.018]"><td className="px-4 py-4"><p className="max-w-[240px] truncate font-medium text-zinc-200">{account.companyName}</p><p className="mt-1 max-w-[240px] truncate text-xs text-zinc-600">{account.industry}</p></td><td className="px-4 py-4"><span className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.08em] ${categoryStyles[account.category] || categoryStyles["Continue outreach"]}`}>{account.category}</span><p className="mono mt-2 text-xs text-zinc-600">Score {account.priorityScore}</p></td><td className="px-4 py-4"><p className="mono text-zinc-300">{account.attemptedContacts}/{account.contacts}</p><p className="mt-1 text-xs text-zinc-600">contacts attempted</p></td><td className="px-4 py-4"><p className="mono text-zinc-300">{account.calls}</p><p className="mt-1 text-xs text-zinc-600">{account.connectedCalls} connected</p></td><td className="px-4 py-4"><p className="text-xs text-zinc-400">{formatDate(account.lastTouch)}</p><p className="mt-1 text-[10px] text-zinc-600">{account.daysSinceLastTouch === null ? "No call history" : `${account.daysSinceLastTouch} days ago`}</p></td><td className="max-w-[320px] px-4 py-4"><p className="text-xs leading-5 text-zinc-300">{account.nextAction}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-zinc-600">{account.reason}</p></td><td className="px-4 py-4"><button onClick={onOpen} className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs text-emerald-300/80 hover:bg-emerald-400/[0.06] hover:text-emerald-200">Memory<ChevronRight className="size-3.5"/></button></td></tr>;
}

function CleanupRow({ task, busy, onDone, onDismiss }: { task: OutreachTask; busy: boolean; onDone: () => void; onDismiss: () => void }) {
  return <article className="p-4"><div className="flex items-start gap-3"><div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-300/[0.07]"><ClipboardCheck className="size-4 text-orange-200/70"/></div><div className="min-w-0 flex-1"><p className="text-sm leading-5 text-zinc-200">{task.title}</p><p className="mt-1 truncate text-xs text-zinc-600">{[task.prospect_name, task.account_name].filter(Boolean).join(" | ")}</p>{task.evidence_text && <p className="mt-3 line-clamp-3 text-xs leading-5 text-zinc-500">{task.evidence_text}</p>}<div className="mt-3 flex gap-2"><button disabled={busy} onClick={onDone} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-950 disabled:opacity-50"><Check className="size-3.5"/>Done</button><button disabled={busy} onClick={onDismiss} className="focus-ring h-8 rounded-lg px-2 text-xs text-zinc-600 hover:text-zinc-300">Dismiss</button></div></div></div></article>;
}
