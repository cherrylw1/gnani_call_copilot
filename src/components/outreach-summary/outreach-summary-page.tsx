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
  MessageCircle,
  PhoneCall,
  Search,
  UsersRound,
  X
} from "lucide-react";
import type { InternationalOutreachData, OutreachAccount, OutreachRegion } from "@/lib/international-outreach-data";

type Props = { data: InternationalOutreachData };
type Summary = {
  calls: number;
  accounts: number;
  leads: number;
  connected: number;
  notes: number;
  meetingSignals: number;
  preEventCalls: number;
  postEventCalls: number;
  statusCounts: Record<string, number>;
  meetingsCombined?: number;
  confirmedSALs?: number;
  mrr?: string;
  connectionRate?: string;
};

const tabs: Array<{ label: string; value: OutreachRegion }> = [
  { label: "All international", value: "All international" },
  { label: "UAE", value: "UAE" },
  { label: "Philippines", value: "Philippines" },
  { label: "Other international", value: "Other international" },
  { label: "US", value: "US" }
];

export function OutreachSummaryPage({ data }: Props) {
  const [region, setRegion] = useState<OutreachRegion>("All international");
  const [phase, setPhase] = useState<"All activity" | "Pre-event" | "Post-event">("All activity");
  const [query, setQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<OutreachAccount | null>(null);

  const summary = useMemo<Summary>(() => {
    if (region === "US") return data.us as Summary;
    if (region === "All international") return data.allInternational as Summary;
    return data.regions[region] as Summary;
  }, [data, region]);

  const accounts = useMemo(() => {
    if (region === "US") return [];
    const normalizedQuery = query.trim().toLowerCase();
    return data.accounts.filter((account) => {
      if (region !== "All international" && account.region !== region) return false;
      if (phase === "Pre-event" && account.preEventCalls === 0) return false;
      if (phase === "Post-event" && account.postEventCalls === 0) return false;
      if (!normalizedQuery) return true;
      return [account.account, account.region, ...account.contacts.flatMap((contact) => [contact.name, contact.email]), ...account.notes.map((note) => note.note)].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [data.accounts, phase, query, region]);

  const notes = useMemo(() => accounts.flatMap((account) => account.notes.map((note) => ({ ...note, account: account.account, accountId: account.id }))).slice(0, 12), [accounts]);
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
          <span className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-400">Dubai Fintech Summit · Nov 2–3</span>
          <Link href="/call-report" className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">Open call report<ArrowUpRight className="size-3.5" /></Link>
        </div>
      </header>

      <section className="mt-7 rounded-3xl border border-emerald-300/20 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_42%),linear-gradient(135deg,#101a19,#0a0e10_70%)] p-5 shadow-[0_20px_70px_rgba(16,185,129,0.07)] md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-emerald-200/80"><CheckCircle2 className="size-4" />Executive readout</div>
            <p className="mt-4 text-lg leading-8 tracking-[-0.02em] text-zinc-100 md:text-xl">The international export now includes the underlying account notes, contact names, call outcomes, and recording links—not just topline counts.</p>
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
          <select value={phase} onChange={(event) => setPhase(event.target.value as typeof phase)} className="h-9 rounded-lg border border-white/10 bg-[#111518] px-3 text-xs text-zinc-300 outline-none focus:border-emerald-300/40"><option>All activity</option><option>Pre-event</option><option>Post-event</option></select>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
        <Panel title="Meeting movement" eyebrow={`${region} · ${phaseLabel}`} icon={CalendarDays}>
          {region === "US" ? <OutcomeRows rows={[["US meetings combined", `${data.us.meetingsCombined ?? 15}`, "Current US reporting input"], ["Confirmed SAL accounts", `${data.us.confirmedSALs ?? 2}`, "TCL Philippines · Dubai Islamic Bank"], ["MRR contribution", data.us.mrr ?? "₹3,00,000", "Two confirmed SAL accounts"]]} /> : <OutcomeRows rows={[["UAE meetings booked · pre-event", `${data.event.uaeMeetingsPreEvent}`, "Calls through November 1"], ["UAE meetings booked · post-event", `${data.event.uaeMeetingsPostEvent}`, "Calls from November 2 onward"], ["UAE upcoming meetings", `${data.event.uaeUpcomingMeetings}`, "Current follow-up calendar"]]} />}
        </Panel>
        <Panel title="Regional handoffs" eyebrow="The context behind the numbers" icon={MessageCircle}>
          {region === "Philippines" ? <div className="rounded-xl border border-sky-300/15 bg-sky-300/[0.05] p-4"><div className="flex items-center gap-2 text-sm text-sky-100"><MessageCircle className="size-4" />WhatsApp conversations</div><p className="mt-4 font-mono text-4xl tracking-[-0.07em] text-zinc-100">{data.event.philippinesWhatsAppConversations}</p><p className="mt-2 text-xs leading-5 text-zinc-500">Active conversations forwarded to {data.event.philippinesWhatsAppOwner}.</p></div> : <div className="space-y-2"><Handoff label="UAE" value={`${data.regions.UAE.calls.toLocaleString()} calls`} detail={`${data.regions.UAE.notes} notes with account context`} /><Handoff label="Philippines" value={`${data.regions.Philippines.calls.toLocaleString()} calls`} detail={`${data.event.philippinesWhatsAppConversations} WhatsApp conversations forwarded`} /><Handoff label="Other international" value={`${data.regions["Other international"].calls.toLocaleString()} calls`} detail={`${data.regions["Other international"].notes} notes captured`} /></div>}
        </Panel>
      </section>

      {region === "US" ? <section className="mt-5 rounded-2xl border border-white/10 bg-[#0b0e11] p-5 md:p-6"><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">US activity detail</p><h2 className="mt-1 text-base font-medium text-zinc-100">Open the call report for account-level US records</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">The international export supplies the UAE, Philippines, and other international account notes. The existing US call report remains the source for the full US contact and call history.</p><Link href="/call-report" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-300/[0.08] px-3 py-2 text-xs text-emerald-200 transition hover:bg-emerald-300/[0.14]">Open US call report<ArrowUpRight className="size-3.5" /></Link></section> : <>
        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
          <Panel title="Recent account notes" eyebrow={`${notes.length} highlighted notes · click an account for all`} icon={FileText}>
            {notes.length ? <div className="space-y-3">{notes.slice(0, 6).map((note) => <button key={`${note.accountId}-${note.date}-${note.email}`} type="button" onClick={() => setSelectedAccount(data.accounts.find((account) => account.id === note.accountId) ?? null)} className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-emerald-300/25 hover:bg-emerald-300/[0.04]"><div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-medium text-emerald-200">{note.account}</span><span className="shrink-0 text-[10px] text-zinc-600">{note.displayDate}</span></div><p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300">{note.note}</p><div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-600"><span>{note.name}</span><span>·</span><span>{note.phase}</span><span>·</span><span>{note.outcome}</span></div></button>)}</div> : <EmptyState text="No notes match this filter." />}
          </Panel>
          <Panel title="Account explorer" eyebrow={`${accounts.length.toLocaleString()} accounts in this view`} icon={UsersRound}>
            <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left"><thead><tr className="border-b border-white/[0.08] text-[10px] uppercase tracking-[0.12em] text-zinc-600"><th className="pb-3 pr-4 font-medium">Account</th><th className="pb-3 pr-4 font-medium">Region</th><th className="pb-3 pr-4 font-medium">Calls</th><th className="pb-3 pr-4 font-medium">Notes</th><th className="pb-3 font-medium">Last touch</th></tr></thead><tbody>{accounts.slice(0, 120).map((account) => <AccountRow key={account.id} account={account} onOpen={() => setSelectedAccount(account)} />)}</tbody></table>{accounts.length > 120 ? <p className="mt-4 text-xs text-zinc-600">Showing the first 120 matching accounts. Search to narrow the list.</p> : null}</div>
          </Panel>
        </section>
      </>}

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-zinc-200">How to read this page</p><p className="mt-1 text-xs leading-5 text-zinc-500">Event phase is assigned using the November 2–3 Dubai Fintech Summit boundary. Click any account row or note to view contacts, outcomes, and available call links.</p></div><Link href="/planning" className="focus-ring inline-flex items-center gap-1.5 text-xs text-emerald-300 transition hover:text-emerald-200">Open planning center<ChevronRight className="size-3.5" /></Link></div></section>
      {selectedAccount ? <AccountDrawer account={selectedAccount} onClose={() => setSelectedAccount(null)} /> : null}
    </div>
  );
}

function Panel({ title, eyebrow, icon: Icon, children }: { title: string; eyebrow: string; icon: typeof PhoneCall; children: ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-[#0b0e11] p-5 md:p-6"><div className="mb-5 flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-300"><Icon className="size-4" /></div><div><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">{eyebrow}</p><h2 className="mt-1 text-base font-medium text-zinc-100">{title}</h2></div></div>{children}</section>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="font-mono text-2xl tracking-[-0.06em] text-zinc-100">{value}</p><p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-600">{label}</p></div>; }
function OutcomeRows({ rows }: { rows: Array<[string, string, string]> }) { return <div className="space-y-2">{rows.map(([label, value, detail]) => <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"><div><p className="text-sm text-zinc-200">{label}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></div><p className="shrink-0 font-mono text-2xl tracking-[-0.06em] text-emerald-200">{value}</p></div>)}</div>; }
function Handoff({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"><div><p className="text-sm text-zinc-200">{label}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></div><p className="shrink-0 font-mono text-sm text-zinc-300">{value}</p></div>; }
function AccountRow({ account, onOpen }: { account: OutreachAccount; onOpen: () => void }) { return <tr onClick={onOpen} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpen(); }} tabIndex={0} role="button" className="cursor-pointer border-b border-white/[0.06] text-xs transition hover:bg-white/[0.04]"><td className="max-w-[260px] truncate py-3 pr-4 font-medium text-zinc-200">{account.account}</td><td className="py-3 pr-4 text-zinc-500">{account.region}</td><td className="py-3 pr-4 font-mono text-zinc-300">{account.calls}</td><td className="py-3 pr-4 font-mono text-emerald-200">{account.notesCount}</td><td className="py-3 text-zinc-500">{account.lastTouch || "—"}</td></tr>; }
function EmptyState({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-zinc-600">{text}</div>; }
function AccountDrawer({ account, onClose }: { account: OutreachAccount; onClose: () => void }) { return <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0c1012] p-5 shadow-2xl md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.15em] text-emerald-300/80">{account.region} · account detail</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">{account.account}</h2><p className="mt-2 text-xs text-zinc-500">{account.calls} calls · {account.contacts.length} leads · {account.notesCount} notes · last touch {account.lastTouch || "—"}</p></div><button type="button" onClick={onClose} aria-label="Close account detail" className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-100"><X className="size-4" /></button></div><div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"><MiniStat label="Calls" value={`${account.calls}`} /><MiniStat label="Connected" value={`${account.connected}`} /><MiniStat label="Pre-event" value={`${account.preEventCalls}`} /><MiniStat label="Post-event" value={`${account.postEventCalls}`} /></div><section className="mt-7"><div className="flex items-center gap-2 text-sm font-medium text-zinc-200"><UsersRound className="size-4 text-emerald-200" />Contacts</div><div className="mt-3 space-y-2">{account.contacts.map((contact) => <div key={`${contact.email}-${contact.phone}`} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"><p className="text-sm text-zinc-200">{contact.name}</p><p className="mt-1 break-all text-xs text-zinc-500">{contact.email || contact.phone || "No contact detail"}</p></div>)}</div></section><section className="mt-7"><div className="flex items-center gap-2 text-sm font-medium text-zinc-200"><FileText className="size-4 text-emerald-200" />Call notes & outcomes</div><div className="mt-3 space-y-3">{account.notes.length ? account.notes.map((note) => <article key={`${note.date}-${note.email}-${note.note}`} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"><div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-600"><span>{note.displayDate}</span><span>·</span><span>{note.phase}</span><span>·</span><span>{note.status}</span><span>·</span><span>{note.outcome}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{note.note}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500"><span>{note.name}{note.email ? ` · ${note.email}` : ""}</span>{note.link ? <a href={note.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200">Open call recording<ArrowUpRight className="size-3" /></a> : <span className="text-zinc-700">No recording link</span>}</div></article>) : <EmptyState text="No call notes were recorded for this account." />}</div></section><section className="mt-7"><div className="flex items-center gap-2 text-sm font-medium text-zinc-200"><PhoneCall className="size-4 text-emerald-200" />Campaigns</div><div className="mt-3 flex flex-wrap gap-2">{account.campaigns.map((campaign) => <span key={campaign} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-zinc-500">{campaign}</span>)}</div></section></aside></div>; }

function formatNumber(value: number) { return value.toLocaleString("en-US"); }
