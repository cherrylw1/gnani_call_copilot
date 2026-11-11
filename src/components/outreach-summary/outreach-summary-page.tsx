import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign, PhoneCall, UsersRound } from "lucide-react";
import { outreachSummary } from "@/lib/outreach-summary";

const toneStyles = {
  emerald: "border-emerald-400/20 bg-emerald-400/[0.065] text-emerald-200",
  sky: "border-sky-400/20 bg-sky-400/[0.06] text-sky-200",
  violet: "border-violet-400/20 bg-violet-400/[0.065] text-violet-200",
  amber: "border-amber-300/20 bg-amber-300/[0.065] text-amber-100"
} as const;

const iconStyles = {
  emerald: "bg-emerald-400/[0.12] text-emerald-200",
  sky: "bg-sky-400/[0.12] text-sky-200",
  violet: "bg-violet-400/[0.12] text-violet-200",
  amber: "bg-amber-300/[0.12] text-amber-100"
} as const;

export function OutreachSummaryPage() {
  return <div className="outreach-summary-page pb-14">
    <header className="flex flex-col gap-5 py-2 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300/80">Executive activity summary</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-zinc-50 md:text-5xl">The outreach story, at a glance.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">A clean view of reach, conversations, meetings, SALs, and recurring revenue for the US motion.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-400">{outreachSummary.period}</span>
        <Link href="/call-report" className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">Open call report<ArrowUpRight className="size-3.5" /></Link>
      </div>
    </header>

    <section className="mt-7 overflow-hidden rounded-3xl border border-emerald-300/20 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_42%),linear-gradient(135deg,#101a19,#0a0e10_70%)] p-6 shadow-[0_20px_70px_rgba(16,185,129,0.07)] md:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-emerald-200/80"><CheckCircle2 className="size-4" />Outcome snapshot</div>
          <p className="mt-5 text-xl leading-9 tracking-[-0.025em] text-zinc-100 md:text-2xl">{outreachSummary.headline}</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-white/10 bg-black/20 p-5 lg:min-w-56">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">US meetings combined</p>
          <p className="mt-2 font-mono text-5xl tracking-[-0.08em] text-emerald-200">15</p>
          <p className="mt-2 text-xs text-zinc-500">8 identified in calls · 10 upcoming</p>
        </div>
      </div>
    </section>

    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {outreachSummary.reach.map((item) => <MetricCard key={item.label} {...item} />)}
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
      <Panel title="Conversation activity" eyebrow="What happened after the dial" icon={PhoneCall}>
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
          {outreachSummary.conversations.map((item) => <div key={item.label} className="bg-[#0b0e11] p-5"><p className="font-mono text-3xl tracking-[-0.06em] text-zinc-100">{item.value}</p><p className="mt-2 text-sm text-zinc-300">{item.label}</p><p className="mt-1 text-xs leading-5 text-zinc-600">{item.detail}</p></div>)}
        </div>
      </Panel>
      <Panel title="Meetings" eyebrow="The live calendar story" icon={CalendarDays}>
        <div className="space-y-2">
          {outreachSummary.meetings.map((item, index) => <div key={item.label} className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${index === 2 ? "border-emerald-300/20 bg-emerald-300/[0.06]" : "border-white/[0.08] bg-white/[0.02]"}`}><div><p className="text-sm text-zinc-200">{item.label}</p><p className="mt-1 text-xs text-zinc-600">{item.detail}</p></div><p className={`font-mono text-2xl tracking-[-0.06em] ${index === 2 ? "text-emerald-200" : "text-zinc-100"}`}>{item.value}</p></div>)}
        </div>
      </Panel>
    </section>

    <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Panel title="Confirmed SALs" eyebrow="Accounts that advanced" icon={UsersRound}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-mono text-5xl tracking-[-0.08em] text-zinc-100">{outreachSummary.pipeline.salCount}</p><p className="mt-2 text-sm text-zinc-400">confirmed SAL accounts</p></div>
          <div className="space-y-2 sm:min-w-64">{outreachSummary.pipeline.salAccounts.map((account) => <div key={account} className="flex items-center gap-2 text-sm text-zinc-200"><CheckCircle2 className="size-4 text-emerald-300" />{account}</div>)}</div>
        </div>
      </Panel>
      <Panel title="MRR contribution" eyebrow="Commercial outcome" icon={CircleDollarSign}>
        <p className="font-mono text-5xl tracking-[-0.08em] text-emerald-200">{outreachSummary.pipeline.mrr}</p>
        <p className="mt-3 text-sm text-zinc-400">{outreachSummary.pipeline.mrrDetail}</p>
        <div className="mt-5 h-px bg-white/[0.08]" />
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-600"><span>Accounts contributing</span><span className="font-mono text-zinc-300">2</span></div>
      </Panel>
    </section>

    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-zinc-200">How to read this page</p><p className="mt-1 text-xs leading-5 text-zinc-500">Phone activity is measured from the call export. Meeting and commercial figures reflect the current reporting inputs.</p></div><Link href="/planning" className="focus-ring inline-flex items-center gap-1.5 text-xs text-emerald-300 transition hover:text-emerald-200">Open planning center<ChevronRight className="size-3.5" /></Link></div>
    </section>
  </div>;
}

function Panel({ title, eyebrow, icon: Icon, children }: { title: string; eyebrow: string; icon: typeof PhoneCall; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#0b0e11] p-5 md:p-6"><div className="mb-5 flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-300"><Icon className="size-4" /></div><div><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">{eyebrow}</p><h2 className="mt-1 text-base font-medium text-zinc-100">{title}</h2></div></div>{children}</section>;
}

function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: keyof typeof toneStyles }) {
  return <div className={`rounded-2xl border p-5 ${toneStyles[tone]}`}><div className={`flex size-8 items-center justify-center rounded-lg ${iconStyles[tone]}`}><span className="size-1.5 rounded-full bg-current" /></div><p className="mt-5 font-mono text-3xl tracking-[-0.07em] text-zinc-100">{value}</p><p className="mt-2 text-sm text-zinc-200">{label}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p></div>;
}
