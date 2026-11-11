"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  Mail,
  MessageCircle,
  PhoneCall,
  Search,
  UsersRound,
  X
} from "lucide-react";
import type { InternationalOutreachData, OutreachAccount, OutreachRegion } from "@/lib/international-outreach-data";
import { usMeetingsData, type USMeeting } from "@/lib/us-meetings-data";
import { uaeMeetingsData, type UAEMeeting } from "@/lib/uae-meetings-data";
import { usAccountsData, type USAccount } from "@/lib/us-accounts-data";
import { usOutboundEmailDataWithDerivedMetrics } from "@/lib/us-email-outreach-data";

type Props = { data: InternationalOutreachData };
type SummaryBase = {
  calls: number;
  accounts: number;
  leads: number;
  connected: number;
  notes: number;
  meetingSignals: number;
  preEventCalls: number;
  postEventCalls: number;
  statusCounts: Record<string, number>;
};
type Summary = SummaryBase & {
  meetingsCombined?: number;
  confirmedSALs?: number;
  mrr?: string;
  connectionRate?: string;
  phaseSummaries?: { preEvent: SummaryBase; postEvent: SummaryBase };
};

const tabs: Array<{ label: string; value: OutreachRegion }> = [
  { label: "All non-USA", value: "All non-USA" },
  { label: "UAE", value: "UAE" },
  { label: "Philippines", value: "Philippines" },
  { label: "Needs classification", value: "Needs classification" },
  { label: "US", value: "US" }
];

export function OutreachSummaryPage({ data }: Props) {
  const [region, setRegion] = useState<OutreachRegion>("All non-USA");
  const [phase, setPhase] = useState<"All activity" | "Pre-event" | "Post-event">("All activity");
  const [query, setQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<OutreachAccount | null>(null);

  const baseSummary = useMemo<Summary>(() => {
    if (region === "US") return data.us as Summary;
    if (region === "All non-USA") return data.allNonUSA as Summary;
    return data.regions[region] as Summary;
  }, [data, region]);

  const summary = useMemo<SummaryBase>(() => {
    if (region === "US" || phase === "All activity") return baseSummary;
    return baseSummary.phaseSummaries?.[phase === "Pre-event" ? "preEvent" : "postEvent"] ?? baseSummary;
  }, [baseSummary, phase, region]);

  const accounts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (region === "US") return [];
    const meetingAccountNames = new Set(uaeMeetingsData.meetings.map((meeting) => normalizeAccountName(meeting.company)));
    return data.accounts.filter((account) => {
      if (region !== "All non-USA" && account.region !== region) return false;
      if (phase === "Pre-event" && account.preEventCalls === 0) return false;
      if (phase === "Post-event" && account.postEventCalls === 0) return false;
      if (!normalizedQuery) return true;
      return [account.account, account.region, ...account.contacts.map((contact) => contact.name), ...account.notes.map((note) => note.note)].some((value) => value.toLowerCase().includes(normalizedQuery));
    }).sort((a, b) => Number(meetingAccountNames.has(normalizeAccountName(b.account))) - Number(meetingAccountNames.has(normalizeAccountName(a.account))) || b.meetingSignals - a.meetingSignals || b.notesCount - a.notesCount || b.connected - a.connected || b.calls - a.calls || a.account.localeCompare(b.account));
  }, [data.accounts, phase, query, region]);

  const notes = useMemo(() => accounts.flatMap((account) => account.notes.filter((note) => phase === "All activity" || note.phase === phase).map((note) => ({ ...note, account: account.account, accountId: account.id }))).slice(0, 12), [accounts, phase]);
  const phaseLabel = phase === "All activity" ? "All activity" : `${phase} outreach`;

  return (
    <div className="outreach-summary-page pb-14">
      <header className="flex flex-col gap-5 py-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300/80">Outreach intelligence</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-zinc-50 md:text-5xl">A clear read on every conversation.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">Explore accounts, call notes, event timing, and regional outcomes in one view. Select an account to open its full interaction history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-400">{region === "US" ? "US campaign rollup" : "Dubai Fintech Summit · Nov 2–3"}</span>
          <Link href="/call-report" className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">Open call report<ArrowUpRight className="size-3.5" /></Link>
        </div>
      </header>

      <section className="mt-7 rounded-3xl border border-emerald-300/20 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_42%),linear-gradient(135deg,#101a19,#0a0e10_70%)] p-5 shadow-[0_20px_70px_rgba(16,185,129,0.07)] md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-emerald-200/80"><CheckCircle2 className="size-4" />Executive readout</div>
            <p className="mt-4 text-lg leading-8 tracking-[-0.02em] text-zinc-100 md:text-xl">{heroCopy(region)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[38rem]">
            <MiniStat label="Accounts" value={formatNumber(summary.accounts)} />
            <MiniStat label="Leads" value={formatNumber(summary.leads)} />
            <MiniStat label="Calls" value={formatNumber(summary.calls)} />
            <MiniStat label="Notes" value={formatNumber(summary.notes)} />
          </div>
        </div>
      </section>

      <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b0e11] p-3 md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => <button key={tab.value} type="button" onClick={() => setRegion(tab.value)} className={`rounded-lg px-3 py-2 text-xs transition ${region === tab.value ? "bg-emerald-300 text-[#07100d]" : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"}`}>{tab.label}</button>)}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-600" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accounts, people, notes" className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.035] pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-300/40 sm:w-56" /></label>
          <select value={phase} disabled={region === "US"} onChange={(event) => setPhase(event.target.value as typeof phase)} className="h-9 rounded-lg border border-white/10 bg-[#111518] px-3 text-xs text-zinc-300 outline-none focus:border-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-50" title={region === "US" ? "Event phase applies to international outreach" : undefined}><option>All activity</option><option>Pre-event</option><option>Post-event</option></select>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
        <Panel title="Meeting movement" eyebrow={`${region} · ${phaseLabel}`} icon={CalendarDays}>
          <MeetingMovement region={region} phase={phase} summary={summary} data={data} />
        </Panel>
        <Panel title="Regional handoffs" eyebrow="The context behind the numbers" icon={MessageCircle}>
          <RegionalContext region={region} data={data} />
        </Panel>
      </section>

      {region === "US" ? <><USMeetingTracker /><USOutboundEmailPanel /><USAccountsPanel query={query} /></> : <>
        {region === "UAE" ? <UAEMeetingTracker /> : null}
        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
          <Panel title="Recent account notes" eyebrow={`${notes.length} highlighted notes · click an account for all`} icon={FileText}>
            {notes.length ? <div className="space-y-3">{notes.slice(0, 6).map((note) => <button key={`${note.accountId}-${note.date}-${note.name}`} type="button" onClick={() => setSelectedAccount(data.accounts.find((account) => account.id === note.accountId) ?? null)} className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-emerald-300/25 hover:bg-emerald-300/[0.04]"><div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-medium text-emerald-200">{note.account}</span><span className="shrink-0 text-[10px] text-zinc-600">{note.displayDate}</span></div><p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300">{note.note}</p><div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-600"><span>{note.name}</span><span>·</span><span>{note.phase}</span><span>·</span><span>{note.outcome}</span></div></button>)}</div> : <EmptyState text="No notes match this filter." />}
          </Panel>
          <Panel title="Account explorer" eyebrow={`${accounts.length.toLocaleString()} accounts in this view`} icon={UsersRound}>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-white/[0.08] text-[10px] uppercase tracking-[0.12em] text-zinc-600"><th className="pb-3 pr-4 font-medium">Account</th><th className="pb-3 pr-4 font-medium">Region</th><th className="pb-3 pr-4 font-medium">Meeting</th><th className="pb-3 pr-4 font-medium">Calls</th><th className="pb-3 pr-4 font-medium">Notes</th><th className="pb-3 font-medium">Last touch</th></tr></thead><tbody>{accounts.slice(0, 120).map((account) => <AccountRow key={account.id} account={account} meeting={findMeeting(account)} onOpen={() => setSelectedAccount(account)} />)}</tbody></table>{accounts.length > 120 ? <p className="mt-4 text-xs text-zinc-600">Showing the first 120 matching accounts. Search to narrow the list.</p> : null}</div>
          </Panel>
        </section>
      </>}

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-zinc-200">How to read this page</p><p className="mt-1 text-xs leading-5 text-zinc-500">Event phase is assigned using the November 2–3 Dubai Fintech Summit boundary. Select a region to see only its metrics and accounts, then click any row for the available notes.</p></div><Link href="/planning" className="focus-ring inline-flex items-center gap-1.5 text-xs text-emerald-300 transition hover:text-emerald-200">Open planning center<ChevronRight className="size-3.5" /></Link></div></section>
      {selectedAccount ? <AccountDrawer account={selectedAccount} onClose={() => setSelectedAccount(null)} /> : null}
    </div>
  );
}

function Panel({ title, eyebrow, icon: Icon, children }: { title: string; eyebrow: string; icon: typeof PhoneCall; children: ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-[#0b0e11] p-5 md:p-6"><div className="mb-5 flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-300"><Icon className="size-4" /></div><div><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">{eyebrow}</p><h2 className="mt-1 text-base font-medium text-zinc-100">{title}</h2></div></div>{children}</section>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="font-mono text-2xl tracking-[-0.06em] text-zinc-100">{value}</p><p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-600">{label}</p></div>; }
function OutcomeRows({ rows }: { rows: Array<[string, string, string]> }) { return <div className="space-y-2">{rows.map(([label, value, detail]) => <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"><div><p className="text-sm text-zinc-200">{label}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></div><p className="shrink-0 font-mono text-2xl tracking-[-0.06em] text-emerald-200">{value}</p></div>)}</div>; }
function Handoff({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"><div><p className="text-sm text-zinc-200">{label}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></div><p className="shrink-0 font-mono text-sm text-zinc-300">{value}</p></div>; }
function EmailMetric({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: "default" | "accent" }) { return <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"><p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">{label}</p><p className={`mt-2 font-mono text-2xl tracking-[-0.06em] ${tone === "accent" ? "text-emerald-200" : "text-zinc-100"}`}>{value}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></div>; }
function USOutboundEmailPanel() {
  const email = usOutboundEmailDataWithDerivedMetrics;
  const funnel = [
    { label: "Sent", value: email.totalSent, width: 100, className: "bg-zinc-400" },
    { label: "Opened", value: email.reportedOpens, width: email.openRatePct, className: "bg-sky-300" },
    { label: "Replied", value: email.totalReplies, width: Math.max(email.replyRatePct * 4, 2), className: "bg-amber-300" },
    { label: "Meeting", value: email.meetingsBooked, width: Math.max(email.meetingRatePct * 8, 2), className: "bg-emerald-300" }
  ];
  return <section className="mt-5 rounded-2xl border border-sky-300/15 bg-[#0b0e11] p-5 md:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-sky-200/80"><Mail className="size-3.5" />US email outreach</div><h2 className="mt-2 text-xl font-medium tracking-[-0.03em] text-zinc-100">Research-driven email performance</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">The US-only email snapshot from the Breakdown workspace, shown separately from calls, scheduled meetings, and non-USA outreach.</p></div><Link href="/breakdown" className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border border-sky-300/20 bg-sky-300/[0.06] px-3 py-2 text-xs text-sky-200 transition hover:bg-sky-300/[0.12]">Open detailed Breakdown<ArrowUpRight className="size-3.5" /></Link></div><div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><EmailMetric label="Emails sent" value={email.totalSent.toLocaleString()} detail={email.strategy} /><EmailMetric label="Open rate" value={`${email.openRatePct}%`} detail={`~${email.reportedOpens.toLocaleString()} reported opens`} /><EmailMetric label="Replies" value={`${email.totalReplies}`} detail={`${email.replyRatePct.toFixed(2)}% of sent emails`} tone="accent" /><EmailMetric label="Meetings booked" value={`${email.meetingsBooked}`} detail={`${email.meetingFromReplyRatePct.toFixed(1)}% of replies`} tone="accent" /></div><div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-zinc-200">US email funnel</p><p className="mt-1 text-xs text-zinc-600">Reported campaign progression from delivery to booked meeting.</p></div><span className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">{email.sourceLabel}</span></div><div className="mt-4 space-y-3">{funnel.map((stage) => <div key={stage.label} className="flex items-center gap-3"><span className="w-14 text-xs text-zinc-500">{stage.label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]"><div className={`h-full rounded-full ${stage.className}`} style={{ width: `${Math.min(stage.width, 100)}%` }} /></div><span className="w-16 text-right font-mono text-xs text-zinc-300">{stage.value.toLocaleString()}</span></div>)}</div></div><p className="mt-4 text-[11px] leading-5 text-zinc-600">These are the figures currently reported in Breakdown; they are not a live sender-platform feed.</p></section>; }
function AccountRow({ account, meeting, onOpen }: { account: OutreachAccount; meeting?: UAEMeeting; onOpen: () => void }) { return <tr onClick={onOpen} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpen(); }} tabIndex={0} role="button" className="cursor-pointer border-b border-white/[0.06] text-xs transition hover:bg-white/[0.04]"><td className="max-w-[260px] truncate py-3 pr-4 font-medium text-zinc-200">{account.account}</td><td className="py-3 pr-4 text-zinc-500">{account.region}</td><td className="py-3 pr-4">{meeting ? <><span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2 py-1 text-[10px] text-emerald-200">Booked</span><p className="mt-2 text-[10px] text-zinc-600">{meeting.meetingDate}</p></> : <span className="text-zinc-700">—</span>}</td><td className="py-3 pr-4 font-mono text-zinc-300">{account.calls}</td><td className="py-3 pr-4 font-mono text-emerald-200">{account.notesCount}</td><td className="py-3 text-zinc-500">{account.lastTouch || "—"}</td></tr>; }
function EmptyState({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-zinc-600">{text}</div>; }
function AccountDrawer({ account, onClose }: { account: OutreachAccount; onClose: () => void }) { return <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0c1012] p-5 shadow-2xl md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.15em] text-emerald-300/80">{account.region} · account detail</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">{account.account}</h2><p className="mt-2 text-xs text-zinc-500">{account.calls} calls · {account.contacts.length} leads · {account.notesCount} notes · last touch {account.lastTouch || "—"}</p></div><button type="button" onClick={onClose} aria-label="Close account detail" className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-100"><X className="size-4" /></button></div><div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"><MiniStat label="Calls" value={`${account.calls}`} /><MiniStat label="Connected" value={`${account.connected}`} /><MiniStat label="Pre-event" value={`${account.preEventCalls}`} /><MiniStat label="Post-event" value={`${account.postEventCalls}`} /></div><section className="mt-7"><div className="flex items-center gap-2 text-sm font-medium text-zinc-200"><UsersRound className="size-4 text-emerald-200" />Contacts</div><div className="mt-3 space-y-2">{account.contacts.map((contact) => <div key={contact.name} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"><p className="text-sm text-zinc-200">{contact.name}</p></div>)}</div></section><section className="mt-7"><div className="flex items-center gap-2 text-sm font-medium text-zinc-200"><FileText className="size-4 text-emerald-200" />Call notes & outcomes</div><div className="mt-3 space-y-3">{account.notes.length ? account.notes.map((note) => <article key={`${note.date}-${note.name}-${note.note}`} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"><div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-600"><span>{note.displayDate}</span><span>·</span><span>{note.phase}</span><span>·</span><span>{note.status}</span><span>·</span><span>{note.outcome}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{note.note}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500"><span>{note.name}</span><span className="text-zinc-700">Call details available in the call report.</span></div></article>) : <EmptyState text="No call notes were recorded for this account." />}</div></section><section className="mt-7"><div className="flex items-center gap-2 text-sm font-medium text-zinc-200"><PhoneCall className="size-4 text-emerald-200" />Campaigns</div><div className="mt-3 flex flex-wrap gap-2">{account.campaigns.map((campaign) => <span key={campaign} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-zinc-500">{campaign}</span>)}</div></section></aside></div>; }

function heroCopy(region: OutreachRegion) {
  if (region === "US") return "US outreach is shown from the larger US campaign rollup, with the meeting tracker and account-level explorer below.";
  if (region === "UAE") return "UAE outreach combines call activity, the scheduled demo tracker, account notes, and pre/post-event movement.";
  if (region === "Philippines") return "Philippines outreach combines call activity, account notes, and the WhatsApp handoff to Fazal at InfiniWall.";
  if (region === "Needs classification") return "A small set of records needs a confident country assignment before it is moved into UAE, Philippines, or US.";
  return "All non-USA outreach combines UAE, Philippines, and records that still need a confident country assignment.";
}

function formatNumber(value: number) { return value.toLocaleString("en-US"); }

function MeetingMovement({ region, phase, summary, data }: { region: OutreachRegion; phase: "All activity" | "Pre-event" | "Post-event"; summary: SummaryBase; data: InternationalOutreachData }) {
  if (region === "US") return <OutcomeRows rows={[["US tracker records", `${usMeetingsData.summary.total}`, "Rows in the supplied schedule"], ["US meetings combined", `${data.us.meetingsCombined ?? 15}`, "Current US reporting input"], ["Confirmed SAL accounts", `${data.us.confirmedSALs ?? 2}`, "TCL Philippines · Dubai Islamic Bank"], ["MRR contribution", data.us.mrr ?? "₹3,00,000", "Two confirmed SAL accounts"]]} />;
  if (region === "UAE") return <OutcomeRows rows={[[`${phase === "All activity" ? "UAE calls" : `${phase} UAE calls`}`, `${summary.calls.toLocaleString()}`, `${summary.connected.toLocaleString()} connected`], ["UAE meetings booked · pre-event", `${data.event.uaeMeetingsPreEvent}`, "Calls through November 1"], ["UAE meetings booked · post-event", `${data.event.uaeMeetingsPostEvent}`, "Calls from November 2 onward"], ["UAE scheduled tracker", `${uaeMeetingsData.summary.total}`, `${uaeMeetingsData.summary.upcoming} upcoming · ${uaeMeetingsData.summary.awaitingResponse} awaiting response`]]} />;
  if (region === "Philippines") return <OutcomeRows rows={[[`${phase === "All activity" ? "Philippines calls" : `${phase} Philippines calls`}`, `${summary.calls.toLocaleString()}`, `${summary.connected.toLocaleString()} connected`], ["WhatsApp conversations", `${data.event.philippinesWhatsAppConversations}`, `Forwarded to ${data.event.philippinesWhatsAppOwner}`], ["Account notes", `${summary.notes.toLocaleString()}`, "Notes captured in the call export"]]} />;
  if (region === "Needs classification") return <OutcomeRows rows={[["Unclassified calls", `${summary.calls.toLocaleString()}`, `${summary.connected.toLocaleString()} connected`], ["Pre-event calls", `${summary.preEventCalls.toLocaleString()}`, "Through November 1"], ["Post-event calls", `${summary.postEventCalls.toLocaleString()}`, "From November 2 onward"], ["Account notes", `${summary.notes.toLocaleString()}`, "Records needing a confident UAE, Philippines, or US assignment"]]} />;
  return <OutcomeRows rows={[[`${phase === "All activity" ? "All non-USA calls" : `${phase} non-USA calls`}`, `${summary.calls.toLocaleString()}`, `${summary.connected.toLocaleString()} connected`], ["Pre-event calls", `${phase === "All activity" ? summary.preEventCalls.toLocaleString() : phase === "Pre-event" ? summary.calls.toLocaleString() : "0"}`, "Through November 1"], ["Post-event calls", `${phase === "All activity" ? summary.postEventCalls.toLocaleString() : phase === "Post-event" ? summary.calls.toLocaleString() : "0"}`, "From November 2 onward"], ["Account notes", `${summary.notes.toLocaleString()}`, "Notes across UAE, Philippines, and records needing classification"]]} />;
}

function RegionalContext({ region, data }: { region: OutreachRegion; data: InternationalOutreachData }) {
  if (region === "Philippines") return <div className="rounded-xl border border-sky-300/15 bg-sky-300/[0.05] p-4"><div className="flex items-center gap-2 text-sm text-sky-100"><MessageCircle className="size-4" />WhatsApp handoff</div><p className="mt-4 font-mono text-4xl tracking-[-0.07em] text-zinc-100">{data.event.philippinesWhatsAppConversations}</p><p className="mt-2 text-xs leading-5 text-zinc-500">Conversations forwarded to {data.event.philippinesWhatsAppOwner}.</p></div>;
  if (region === "UAE") return <div className="space-y-2"><Handoff label="Scheduled demos" value={`${uaeMeetingsData.summary.total}`} detail={`${uaeMeetingsData.summary.upcoming} upcoming · ${uaeMeetingsData.summary.today} today`} /><Handoff label="Awaiting response" value={`${uaeMeetingsData.summary.awaitingResponse}`} detail="Tentative or pending lead confirmation" /><Handoff label="UAE account notes" value={`${data.regions.UAE.notes}`} detail="Notes available in the account explorer" /></div>;
  if (region === "Needs classification") return <div className="space-y-2"><Handoff label="Needs classification" value={`${data.regions["Needs classification"].calls.toLocaleString()} calls`} detail={`${data.regions["Needs classification"].accounts} accounts need a country assignment`} /><Handoff label="Review rule" value="Manual" detail="Only confident phone, source, or company signals are assigned automatically" /></div>;
  if (region === "US") return <div className="space-y-2"><Handoff label="US accounts" value={`${usAccountsData.summary.accounts.toLocaleString()}`} detail="Account explorer loaded from the US call export" /><Handoff label="Meeting-booked accounts" value={`${usAccountsData.summary.meetingBooked}`} detail="Prioritized at the top of the explorer" /></div>;
  return <div className="space-y-2"><Handoff label="UAE" value={`${data.regions.UAE.calls.toLocaleString()} calls`} detail={`${data.regions.UAE.notes} notes · ${uaeMeetingsData.summary.total} scheduled demos`} /><Handoff label="Philippines" value={`${data.regions.Philippines.calls.toLocaleString()} calls`} detail={`${data.event.philippinesWhatsAppConversations} WhatsApp conversations forwarded`} /><Handoff label="Needs classification" value={`${data.regions["Needs classification"].calls.toLocaleString()} calls`} detail={`${data.regions["Needs classification"].accounts} accounts kept separate`} /></div>;
}

function UAEMeetingTracker() {
  const [filter, setFilter] = useState<"All" | "Upcoming" | "Today" | "Past / follow-up">("All");
  const visible = filter === "All" ? uaeMeetingsData.meetings : uaeMeetingsData.meetings.filter((meeting) => meeting.timing === filter);
  return <section className="mt-5 rounded-2xl border border-emerald-300/15 bg-[#0b0e11] p-5 md:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-300/80">UAE scheduled demo meetings</p><h2 className="mt-1 text-xl font-medium tracking-[-0.03em] text-zinc-100">Scheduled demo meetings and response state</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">This is the scheduled UAE demo list. It is separate from call activity so a new reader can see exactly what is booked, pending, or needs follow-up.</p></div><div className="grid grid-cols-3 gap-2 sm:min-w-[340px]"><DispositionStat label="Scheduled demos" value={uaeMeetingsData.summary.total} tone="neutral" /><DispositionStat label="Upcoming" value={uaeMeetingsData.summary.upcoming} tone="green" /><DispositionStat label="Awaiting response" value={uaeMeetingsData.summary.awaitingResponse} tone="amber" /></div></div><div className="mt-5 flex flex-wrap gap-1.5">{(["All", "Upcoming", "Today", "Past / follow-up"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-xs transition ${filter === value ? "bg-emerald-300 text-[#07100d]" : "border border-white/10 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"}`}>{value === "All" ? "All scheduled demos" : value}</button>)}</div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead><tr className="border-b border-white/[0.08] text-[10px] uppercase tracking-[0.12em] text-zinc-600"><th className="pb-3 pr-4 font-medium">Account / contact</th><th className="pb-3 pr-4 font-medium">Scheduled demo</th><th className="pb-3 pr-4 font-medium">Lead response</th><th className="pb-3 pr-4 font-medium">Timing</th><th className="pb-3 font-medium">Follow-up notes</th></tr></thead><tbody>{visible.map((meeting) => <UAEMeetingRow key={meeting.id} meeting={meeting} />)}</tbody></table></div></section>;
}

function UAEMeetingRow({ meeting }: { meeting: UAEMeeting }) { const timingStyle = meeting.timing === "Upcoming" ? "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200" : meeting.timing === "Today" ? "border-sky-300/20 bg-sky-300/[0.07] text-sky-200" : "border-white/10 bg-white/[0.03] text-zinc-400"; return <tr className="border-b border-white/[0.06] align-top text-xs"><td className="py-4 pr-4"><p className="font-medium text-zinc-200">{meeting.company}</p><p className="mt-1 text-zinc-500">{meeting.leadName}</p><p className="mt-1 text-[11px] text-zinc-600">{meeting.title}</p></td><td className="py-4 pr-4"><p className="text-zinc-300">{meeting.meetingDate}</p><p className="mt-1 text-zinc-500">{meeting.meetingTime}</p><p className="mt-1 text-[11px] text-zinc-600">{meeting.timezone} · {meeting.platform}</p></td><td className="py-4 pr-4"><span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-400">{meeting.responseStatus}</span></td><td className="py-4 pr-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] ${timingStyle}`}>{meeting.timing}</span></td><td className="max-w-[280px] py-4 text-zinc-500">{meeting.sourceNote}</td></tr>; }

function USAccountsPanel({ query }: { query: string }) { const normalizedQuery = query.trim().toLowerCase(); const filtered = usAccountsData.accounts.filter((account) => !normalizedQuery || [account.account, account.industry, account.latestNote, account.latestOutcome].some((value) => value.toLowerCase().includes(normalizedQuery))); const [selected, setSelected] = useState<USAccount | null>(null); return <><section className="mt-5 rounded-2xl border border-white/10 bg-[#0b0e11] p-5 md:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">US account explorer</p><h2 className="mt-1 text-xl font-medium tracking-[-0.03em] text-zinc-100">Top US accounts and meeting signals</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Meeting-booked accounts are prioritized first, followed by connected calls, notes, and call volume. Use the search box above to narrow this list.</p></div><span className="text-xs text-zinc-600">{filtered.length.toLocaleString()} matching accounts</span></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b border-white/[0.08] text-[10px] uppercase tracking-[0.12em] text-zinc-600"><th className="pb-3 pr-4 font-medium">Account</th><th className="pb-3 pr-4 font-medium">Industry</th><th className="pb-3 pr-4 font-medium">Calls</th><th className="pb-3 pr-4 font-medium">Connected</th><th className="pb-3 pr-4 font-medium">Notes</th><th className="pb-3 pr-4 font-medium">Meeting</th><th className="pb-3 font-medium">Last touch</th></tr></thead><tbody>{filtered.slice(0, 120).map((account) => <tr key={account.id} onClick={() => setSelected(account)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelected(account); }} tabIndex={0} role="button" className="cursor-pointer border-b border-white/[0.06] text-xs transition hover:bg-white/[0.04]"><td className="max-w-[260px] truncate py-3 pr-4 font-medium text-zinc-200">{account.account}</td><td className="max-w-[200px] truncate py-3 pr-4 text-zinc-500">{account.industry}</td><td className="py-3 pr-4 font-mono text-zinc-300">{account.calls}</td><td className="py-3 pr-4 font-mono text-emerald-200">{account.connected}</td><td className="py-3 pr-4 font-mono text-zinc-300">{account.notes}</td><td className="py-3 pr-4">{account.meetingBooked ? <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2 py-1 text-[10px] text-emerald-200">Booked</span> : <span className="text-zinc-700">—</span>}</td><td className="py-3 text-zinc-500">{account.lastTouch || "—"}</td></tr>)}</tbody></table>{filtered.length > 120 ? <p className="mt-4 text-xs text-zinc-600">Showing the top 120 matching accounts. Search to narrow the list.</p> : null}</div></section>{selected ? <USAccountDrawer account={selected} onClose={() => setSelected(null)} /> : null}</>; }

function USAccountDrawer({ account, onClose }: { account: USAccount; onClose: () => void }) { return <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#0c1012] p-5 shadow-2xl md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.15em] text-emerald-300/80">US account</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">{account.account}</h2><p className="mt-2 text-xs text-zinc-500">{account.industry} · {account.calls} calls · {account.connected} connected</p></div><button type="button" onClick={onClose} aria-label="Close account detail" className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-100"><X className="size-4" /></button></div><div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"><MiniStat label="Calls" value={`${account.calls}`} /><MiniStat label="Connected" value={`${account.connected}`} /><MiniStat label="Notes" value={`${account.notes}`} /><MiniStat label="Meeting" value={account.meetingBooked ? "Booked" : "—"} /></div><div className="mt-7 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"><p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">Latest call note</p><p className="mt-3 text-sm leading-6 text-zinc-300">{account.latestNote}</p><p className="mt-3 text-xs text-zinc-600">Latest outcome: {account.latestOutcome}</p></div>{account.meetingBooked ? <div className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4"><p className="text-sm text-emerald-100">Meeting booked</p><p className="mt-2 text-xs text-zinc-500">{account.meetingDate} · {account.meetingResponse || "Response recorded"}</p></div> : null}<Link href="/call-report" className="mt-6 inline-flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200">Open full call report<ArrowUpRight className="size-3.5" /></Link></aside></div>; }

function normalizeAccountName(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ""); }
function findMeeting(account: OutreachAccount) { const normalized = normalizeAccountName(account.account); return uaeMeetingsData.meetings.find((meeting) => normalizeAccountName(meeting.company) === normalized); }

function USMeetingTracker() {
  const [filter, setFilter] = useState<"All" | "Closed · Philippines" | "Waiting" | "Stale">("All");
  const visible = filter === "All" ? usMeetingsData.meetings : usMeetingsData.meetings.filter((meeting) => meeting.managementStatus === filter);
  return <section className="mt-5 rounded-2xl border border-white/10 bg-[#0b0e11] p-5 md:p-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">US scheduled demo meetings</p><h2 className="mt-1 text-xl font-medium tracking-[-0.03em] text-zinc-100">Scheduled demo meetings and what happened next</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">The supplied schedule is shown with the original lead response preserved and a clear current disposition added from the latest update.</p></div>
      <Link href="/call-report" className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-300/[0.08] px-3 py-2 text-xs text-emerald-200 transition hover:bg-emerald-300/[0.14]">Open full US call report<ArrowUpRight className="size-3.5" /></Link>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"><DispositionStat label="Scheduled demos" value={usMeetingsData.summary.total} tone="neutral" /><DispositionStat label="Closed · Philippines" value={usMeetingsData.summary.closed} tone="green" /><DispositionStat label="Waiting for response" value={usMeetingsData.summary.waiting} tone="amber" /><DispositionStat label="Stale / no reply" value={usMeetingsData.summary.stale} tone="muted" /></div>
    <div className="mt-6 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.045] p-4"><p className="text-sm font-medium text-emerald-100">Scheduled demo meeting readout</p><p className="mt-1 text-sm leading-6 text-zinc-400">TCL is closed for Philippines outreach. Infosys is still waiting for a response. The remaining {usMeetingsData.summary.stale} scheduled demo records are stale because there was no reply after the demo or before the scheduled demo.</p></div>
    <div className="mt-6 flex flex-wrap gap-1.5">{(["All", "Closed · Philippines", "Waiting", "Stale"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-xs transition ${filter === value ? "bg-zinc-100 text-zinc-950" : "border border-white/10 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"}`}>{value === "All" ? "All scheduled demos" : value}</button>)}</div>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead><tr className="border-b border-white/[0.08] text-[10px] uppercase tracking-[0.12em] text-zinc-600"><th className="pb-3 pr-4 font-medium">Account / contact</th><th className="pb-3 pr-4 font-medium">Scheduled demo</th><th className="pb-3 pr-4 font-medium">Lead response</th><th className="pb-3 pr-4 font-medium">Current status</th><th className="pb-3 font-medium">Follow-up notes</th></tr></thead><tbody>{visible.map((meeting) => <MeetingRow key={meeting.id} meeting={meeting} />)}</tbody></table></div>
  </section>;
}

function DispositionStat({ label, value, tone }: { label: string; value: number; tone: "neutral" | "green" | "amber" | "muted" }) { const colors = { neutral: "text-zinc-100", green: "text-emerald-200", amber: "text-amber-200", muted: "text-zinc-400" }; return <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3"><p className={`font-mono text-2xl tracking-[-0.06em] ${colors[tone]}`}>{value}</p><p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-600">{label}</p></div>; }

function MeetingRow({ meeting }: { meeting: USMeeting }) { const statusStyle = meeting.managementStatus.startsWith("Closed") ? "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200" : meeting.managementStatus === "Waiting" ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-200" : "border-white/10 bg-white/[0.03] text-zinc-400"; return <tr className="border-b border-white/[0.06] align-top text-xs"><td className="py-4 pr-4"><p className="font-medium text-zinc-200">{meeting.company}</p><p className="mt-1 text-zinc-500">{meeting.leadName}</p><p className="mt-1 text-[11px] text-zinc-600">{meeting.title}</p></td><td className="py-4 pr-4"><p className="max-w-[250px] text-zinc-300">{meeting.meetingTitle}</p><p className="mt-1 text-zinc-500">{meeting.meetingDate}</p><p className="mt-1 text-[11px] text-zinc-600">{meeting.meetingTime} · {meeting.timezone}</p><p className="mt-1 text-[11px] text-zinc-600">{meeting.platform}</p></td><td className="py-4 pr-4"><span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-400">{meeting.responseStatus}</span><p className="mt-2 max-w-[220px] leading-5 text-zinc-500">{meeting.sourceNote}</p></td><td className="py-4 pr-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] ${statusStyle}`}>{meeting.managementStatus}</span><p className="mt-2 max-w-[190px] leading-5 text-zinc-500">{meeting.managementNote}</p></td><td className="py-4 text-zinc-500"><p className="max-w-[220px] leading-5">Organizer: {meeting.organizer}</p><Link href="/call-report" className="mt-2 inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200">View related activity<ArrowUpRight className="size-3" /></Link></td></tr>; }
