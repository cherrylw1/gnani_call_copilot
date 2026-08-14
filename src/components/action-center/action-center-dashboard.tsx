"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ArrowUpRight, CalendarClock, Check, CheckCircle2, Clock3, Mail, MessageSquare, MoreHorizontal, Phone, Plus, RefreshCw, Search, Send, Settings2, UserRoundSearch, X } from "lucide-react";
import { toast } from "sonner";
import type { OutreachTask, OutreachTaskChannel, OutreachTaskPriority, OutreachTaskStatus, OutreachTaskType, TaskDashboard } from "@/lib/outreach-tasks";

type View = "active" | "overdue" | "today" | "upcoming" | "unscheduled" | "done" | "dismissed";

const typeLabels: Record<OutreachTaskType, string> = { email: "Email", linkedin: "LinkedIn", call: "Call back", referral: "Referral", meeting: "Meeting", nurture: "Nurture", research: "Research", cleanup: "Cleanup", general: "General" };
const channelLabels: Record<OutreachTaskChannel, string> = { email: "Email", linkedin: "LinkedIn", phone: "Phone", internal: "Internal", general: "General" };
const priorityStyles: Record<OutreachTaskPriority, string> = { high: "border-rose-400/25 bg-rose-400/[0.08] text-rose-200", medium: "border-amber-300/20 bg-amber-300/[0.06] text-amber-100", low: "border-white/10 bg-white/[0.035] text-zinc-400" };
const typeIcons: Record<OutreachTaskType, typeof Mail> = { email: Mail, linkedin: MessageSquare, call: Phone, referral: Send, meeting: CalendarClock, nurture: Clock3, research: UserRoundSearch, cleanup: Settings2, general: MoreHorizontal };
const formatDateTime = (value: string | null) => value ? new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "No due date";
const dateKey = (value: string | null) => value ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value)) : null;
const todayKey = () => dateKey(new Date().toISOString())!;
const inputDate = (value: string | null) => value ? new Date(new Date(value).getTime() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : "";

type TaskForm = {
  id?: string;
  title: string;
  task_type: OutreachTaskType;
  channel: OutreachTaskChannel;
  priority: OutreachTaskPriority;
  prospect_email: string;
  prospect_name: string;
  account_name: string;
  due_at: string;
  description: string;
};

const blankForm: TaskForm = { title: "", task_type: "email", channel: "email", priority: "medium", prospect_email: "", prospect_name: "", account_name: "", due_at: "", description: "" };

export function ActionCenterDashboard() {
  const [report, setReport] = useState<TaskDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("active");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<OutreachTaskType | "all">("all");
  const [channel, setChannel] = useState<OutreachTaskChannel | "all">("all");
  const [priority, setPriority] = useState<OutreachTaskPriority | "all">("all");
  const [form, setForm] = useState<TaskForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Tasks unavailable.");
      setReport(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Tasks unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    if (!report) return [];
    const today = todayKey();
    return report.tasks.filter((task) => {
      const due = task.status === "snoozed" && task.snoozed_until ? task.snoozed_until : task.due_at;
      const dueKey = dateKey(due);
      const active = task.status === "open" || task.status === "snoozed";
      if (view === "active" && !active) return false;
      if (view === "overdue" && (!active || !dueKey || dueKey >= today)) return false;
      if (view === "today" && (!active || dueKey !== today)) return false;
      if (view === "upcoming" && (!active || !dueKey || dueKey <= today)) return false;
      if (view === "unscheduled" && (!active || dueKey)) return false;
      if (view === "done" && task.status !== "done") return false;
      if (view === "dismissed" && task.status !== "dismissed") return false;
      if (type !== "all" && task.task_type !== type) return false;
      if (channel !== "all" && task.channel !== channel) return false;
      if (priority !== "all" && task.priority !== priority) return false;
      if (search && ![task.title, task.description, task.evidence_text, task.prospect_name, task.prospect_email, task.account_name].some((value) => value?.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [report, view, type, channel, priority, search]);

  const updateTask = async (task: OutreachTask, patch: Partial<{ status: OutreachTaskStatus; priority: OutreachTaskPriority; title: string; description: string | null; due_at: string | null; snoozed_until: string | null }>, success: string) => {
    setBusyId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Task update failed.");
      toast.success(success);
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Task update failed.");
    } finally {
      setBusyId(null);
    }
  };

  const scanNotes = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/tasks/backfill", { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Note scan failed.");
      toast.success(body.inserted ? `${body.inserted} new tasks created.` : "No new actions were found.");
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Note scan failed.");
    } finally {
      setSaving(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const payload = { ...form, due_at: form.due_at ? new Date(form.due_at).toISOString() : null };
      const response = form.id
        ? await fetch(`/api/tasks/${form.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: payload.title, description: payload.description || null, priority: payload.priority, due_at: payload.due_at }) })
        : await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Task save failed.");
      toast.success(form.id ? "Task updated." : "Task created.");
      setForm(null);
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Task save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!report && loading) return <div className="space-y-5"><div className="h-28 animate-pulse rounded-2xl bg-white/[0.035]"/><div className="grid gap-3 md:grid-cols-4"><div className="h-28 animate-pulse rounded-2xl bg-white/[0.035] md:col-span-3"/><div className="h-28 animate-pulse rounded-2xl bg-white/[0.035]"/></div><div className="h-96 animate-pulse rounded-2xl bg-white/[0.035]"/></div>;
  if (error || !report) return <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-6"><h1 className="text-xl font-semibold">Action Center unavailable</h1><p className="mt-2 text-sm text-rose-100/70">{error}</p><button onClick={() => void load()} className="focus-ring mt-5 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950">Try again</button></div>;

  const metricViews: Array<{ label: string; value: number; target: View; helper: string }> = [
    { label: "Open actions", value: report.summary.active, target: "active", helper: `${report.summary.highPriority} high priority` },
    { label: "Overdue", value: report.summary.overdue, target: "overdue", helper: "Needs review" },
    { label: "Due today", value: report.summary.dueToday, target: "today", helper: "Current workload" },
    { label: "No date", value: report.summary.unscheduled, target: "unscheduled", helper: "Needs scheduling" }
  ];

  return <div className="pb-12">
    <header className="flex flex-col gap-5 py-2 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl"><p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300/80">Action center</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-zinc-50 md:text-4xl">Turn call evidence into finished work.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Follow-ups, referrals, future timing, and cleanup actions stay connected to the call that created them.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/planning" className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-sm text-zinc-300 hover:bg-white/[0.07]">Planning Center<ArrowUpRight className="size-4"/></Link><button onClick={scanNotes} disabled={saving} className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-3 text-sm text-emerald-200 disabled:opacity-50"><RefreshCw className={`size-4 ${saving ? "animate-spin" : ""}`}/>Scan call notes</button><button onClick={() => setForm(blankForm)} className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-100 px-3 text-sm font-medium text-zinc-950"><Plus className="size-4"/>New task</button></div>
    </header>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricViews.map((metric) => <button key={metric.target} onClick={() => setView(metric.target)} className={`focus-ring rounded-2xl border p-4 text-left transition active:scale-[0.99] ${view === metric.target ? "border-emerald-400/30 bg-emerald-400/[0.07]" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.05]"}`}><p className="text-xs text-zinc-500">{metric.label}</p><p className="mono mt-3 text-3xl font-semibold tracking-tight text-zinc-100">{metric.value}</p><p className="mt-2 text-xs text-zinc-500">{metric.helper}</p></button>)}
    </section>

    <section className="mt-5 rounded-2xl border border-white/10 bg-[#0c0f12] p-3">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(130px,180px))]">
        <label className="block"><span className="mb-2 block text-xs text-zinc-500">Search tasks</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600"/><input value={search} onChange={(event) => setSearch(event.target.value)} className="focus-ring h-10 w-full rounded-lg border border-white/10 bg-zinc-950 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600" placeholder="Contact, company, note or action"/></span></label>
        <label><span className="mb-2 block text-xs text-zinc-500">Task type</span><select value={type} onChange={(event) => setType(event.target.value as OutreachTaskType | "all")} className="focus-ring h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"><option value="all">All types</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span className="mb-2 block text-xs text-zinc-500">Channel</span><select value={channel} onChange={(event) => setChannel(event.target.value as OutreachTaskChannel | "all")} className="focus-ring h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"><option value="all">All channels</option>{Object.entries(channelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span className="mb-2 block text-xs text-zinc-500">Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value as OutreachTaskPriority | "all")} className="focus-ring h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"><option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{(["active", "overdue", "today", "upcoming", "unscheduled", "done", "dismissed"] as View[]).map((item) => <button key={item} onClick={() => setView(item)} className={`focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-xs capitalize ${view === item ? "bg-zinc-100 font-medium text-zinc-950" : "bg-white/[0.035] text-zinc-400 hover:bg-white/[0.07]"}`}>{item === "unscheduled" ? "No date" : item}</button>)}</div>
    </section>

    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e11]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div><h2 className="text-sm font-medium text-zinc-200">Task queue</h2><p className="mt-1 text-xs text-zinc-500">{filtered.length} matching actions</p></div>{loading && <RefreshCw className="size-4 animate-spin text-zinc-500"/>}</div>
        {filtered.length ? <div className="divide-y divide-white/[0.07]">{filtered.map((task) => <TaskRow key={task.id} task={task} busy={busyId === task.id} onUpdate={updateTask} onEdit={() => setForm({ id: task.id, title: task.title, task_type: task.task_type, channel: task.channel, priority: task.priority, prospect_email: task.prospect_email || "", prospect_name: task.prospect_name || "", account_name: task.account_name || "", due_at: inputDate(task.due_at), description: task.description || "" })}/>)}</div> : <div className="px-6 py-16 text-center"><CheckCircle2 className="mx-auto size-8 text-emerald-300/70"/><h3 className="mt-4 text-base font-medium">No tasks in this view</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">Change the filters, scan the latest call notes, or add a manual action.</p></div>}
      </section>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><h2 className="text-sm font-medium">Next seven days</h2><div className="mt-4 space-y-3">{report.nextSevenDays.map((day) => <div key={day.date} className="grid grid-cols-[72px_1fr_28px] items-center gap-3"><span className="text-xs text-zinc-500">{new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short", month: "short", day: "numeric" }).format(new Date(`${day.date}T12:00:00+05:30`))}</span><div className="h-px bg-white/10"/><span className="mono text-right text-sm text-zinc-300">{day.count}</span></div>)}</div></section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><h2 className="text-sm font-medium">Open work by type</h2><div className="mt-4 grid grid-cols-2 gap-2">{report.byType.filter((item) => item.count).map((item) => <button key={item.name} onClick={() => { setType(item.name); setView("active"); }} className="focus-ring rounded-lg bg-white/[0.035] p-3 text-left hover:bg-white/[0.07]"><p className="text-xs text-zinc-500">{typeLabels[item.name]}</p><p className="mono mt-2 text-xl text-zinc-200">{item.count}</p></button>)}</div></section>
        <section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-4"><h2 className="text-sm font-medium text-emerald-100">Rule-based and auditable</h2><p className="mt-2 text-xs leading-5 text-emerald-100/60">Automatic tasks retain the exact call note that triggered them. Re-scanning never recreates the same source task, and no model tokens are used.</p></section>
      </aside>
    </div>

    {form && <TaskModal form={form} setForm={setForm} saving={saving} onSubmit={submit}/>}
  </div>;
}

function TaskRow({ task, busy, onUpdate, onEdit }: { task: OutreachTask; busy: boolean; onUpdate: (task: OutreachTask, patch: Partial<{ status: OutreachTaskStatus; priority: OutreachTaskPriority; title: string; description: string | null; due_at: string | null; snoozed_until: string | null }>, message: string) => Promise<void>; onEdit: () => void }) {
  const Icon = typeIcons[task.task_type];
  const active = task.status === "open" || task.status === "snoozed";
  const snooze = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); void onUpdate(task, { status: "snoozed", snoozed_until: date.toISOString() }, `Task snoozed for ${days} day${days === 1 ? "" : "s"}.`); };
  return <article className="p-4 transition hover:bg-white/[0.018] md:p-5">
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035]"><Icon className="size-4 text-zinc-300" strokeWidth={1.6}/></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${priorityStyles[task.priority]}`}>{task.priority}</span><span className="text-xs text-zinc-500">{typeLabels[task.task_type]}</span>{task.source_kind !== "manual" && <span className="text-xs text-emerald-300/70">From call note</span>}</div><h3 className="mt-2 text-sm font-medium leading-5 text-zinc-100">{task.title}</h3><p className="mt-1 text-xs text-zinc-500">{[task.prospect_name, task.account_name, task.prospect_email].filter(Boolean).join(" | ") || "Manual task"}</p></div><div className="shrink-0 text-left md:text-right"><p className={`text-xs ${task.due_at && new Date(task.due_at) < new Date() && active ? "text-rose-300" : "text-zinc-400"}`}>{formatDateTime(task.status === "snoozed" && task.snoozed_until ? task.snoozed_until : task.due_at)}</p><p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-zinc-600">{task.status === "snoozed" ? "Snoozed" : task.status}</p></div></div>
        {task.description && <p className="mt-3 text-sm leading-6 text-zinc-400">{task.description}</p>}
        {task.evidence_text && <blockquote className="mt-3 border-l-2 border-emerald-400/30 pl-3 text-xs leading-5 text-zinc-500"><span className="text-zinc-300">Call evidence:</span> {task.evidence_text}</blockquote>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {active ? <button disabled={busy} onClick={() => void onUpdate(task, { status: "done" }, "Task completed.")} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-950 disabled:opacity-50"><Check className="size-3.5"/>Done</button> : task.status === "done" ? <button disabled={busy} onClick={() => void onUpdate(task, { status: "open" }, "Task reopened.")} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs text-zinc-300">Reopen</button> : null}
          {active && <><button disabled={busy} onClick={() => snooze(1)} className="focus-ring h-8 rounded-lg border border-white/10 px-3 text-xs text-zinc-400 hover:bg-white/[0.05]">Tomorrow</button><button disabled={busy} onClick={() => snooze(7)} className="focus-ring h-8 rounded-lg border border-white/10 px-3 text-xs text-zinc-400 hover:bg-white/[0.05]">Next week</button></>}
          <button disabled={busy} onClick={onEdit} className="focus-ring h-8 rounded-lg border border-white/10 px-3 text-xs text-zinc-400 hover:bg-white/[0.05]">Edit</button>
          {active && <button disabled={busy} onClick={() => void onUpdate(task, { status: "dismissed" }, "Task dismissed.")} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-zinc-600 hover:text-zinc-300"><Archive className="size-3.5"/>Dismiss</button>}
          {task.metadata && typeof task.metadata === "object" && typeof task.metadata.call_source === "string" && <span className="ml-auto text-[10px] text-zinc-600">{task.metadata.call_source}</span>}
        </div>
      </div>
    </div>
  </article>;
}

function TaskModal({ form, setForm, saving, onSubmit }: { form: TaskForm; setForm: (form: TaskForm | null) => void; saving: boolean; onSubmit: (event: FormEvent) => void }) {
  const change = <K extends keyof TaskForm>(key: K, value: TaskForm[K]) => setForm({ ...form, [key]: value });
  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/80 p-0 backdrop-blur-sm md:items-center md:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setForm(null); }}><form onSubmit={onSubmit} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-[#101317] p-5 shadow-2xl md:max-w-2xl md:rounded-2xl md:p-6" aria-label={form.id ? "Edit task" : "Create task"}>
    <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold">{form.id ? "Edit task" : "Create a task"}</h2><p className="mt-1 text-sm text-zinc-500">Keep a manual action alongside tasks found in call notes.</p></div><button type="button" onClick={() => setForm(null)} aria-label="Close task form" className="focus-ring rounded-lg p-2 text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"><X className="size-4"/></button></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <label className="md:col-span-2"><span className="mb-2 block text-xs font-medium text-zinc-400">Task title</span><input required value={form.title} onChange={(event) => change("title", event.target.value)} className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm placeholder:text-zinc-700" placeholder="Send the requested overview"/></label>
      {!form.id && <><label><span className="mb-2 block text-xs font-medium text-zinc-400">Task type</span><select value={form.task_type} onChange={(event) => change("task_type", event.target.value as OutreachTaskType)} className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm">{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span className="mb-2 block text-xs font-medium text-zinc-400">Channel</span><select value={form.channel} onChange={(event) => change("channel", event.target.value as OutreachTaskChannel)} className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm">{Object.entries(channelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></>}
      <label><span className="mb-2 block text-xs font-medium text-zinc-400">Priority</span><select value={form.priority} onChange={(event) => change("priority", event.target.value as OutreachTaskPriority)} className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
      <label><span className="mb-2 block text-xs font-medium text-zinc-400">Due date</span><input type="datetime-local" value={form.due_at} onChange={(event) => change("due_at", event.target.value)} className="call-report-date focus-ring h-11 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 text-sm text-zinc-950"/></label>
      {!form.id && <><label><span className="mb-2 block text-xs font-medium text-zinc-400">Contact name</span><input value={form.prospect_name} onChange={(event) => change("prospect_name", event.target.value)} className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"/></label><label><span className="mb-2 block text-xs font-medium text-zinc-400">Email</span><input type="email" value={form.prospect_email} onChange={(event) => change("prospect_email", event.target.value)} className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"/></label><label className="md:col-span-2"><span className="mb-2 block text-xs font-medium text-zinc-400">Company</span><input value={form.account_name} onChange={(event) => change("account_name", event.target.value)} className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm"/></label></>}
      <label className="md:col-span-2"><span className="mb-2 block text-xs font-medium text-zinc-400">Notes</span><textarea rows={4} value={form.description} onChange={(event) => change("description", event.target.value)} className="focus-ring w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm leading-6" placeholder="Add the context needed to complete this action."/></label>
    </div>
    <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setForm(null)} className="focus-ring h-10 rounded-lg border border-white/10 px-4 text-sm text-zinc-400">Cancel</button><button disabled={saving} className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 disabled:opacity-50">{saving && <RefreshCw className="size-4 animate-spin"/>}{form.id ? "Save changes" : "Create task"}</button></div>
  </form></div>;
}
