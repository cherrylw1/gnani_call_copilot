import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { PageTitle } from "@/components/page-title";
import { salesReference } from "@/lib/sales-reference";

export default function SalesReferencePage() {
  return <div className="space-y-7">
    <PageTitle title="Sales Reference" subtitle="Static Gnani positioning, call-ready drop-ins, proof-point guardrails, and U.S.-market battle cards." />
    <Card className="p-5"><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">How to frame Gnani</p><h2 className="mt-2 text-lg font-semibold tracking-tight">{salesReference.positioning.headline}</h2><p className="mt-3 max-w-4xl leading-7 text-zinc-300">{salesReference.positioning.summary}</p><div className="mt-5 grid gap-3 md:grid-cols-2">{salesReference.positioning.pillars.map((pillar) => <section key={pillar.title} className="border border-zinc-800 bg-zinc-950 p-4"><h3 className="text-sm font-medium">{pillar.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{pillar.detail}</p></section>)}</div></Card>

    <section><h2 className="text-sm font-semibold">Call-ready drop-ins</h2><p className="mt-1 text-sm text-zinc-500">Short, reusable lines for the middle of a conversation - use the one that matches the confirmed workflow.</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{salesReference.dropIns.map((line) => <Card className="flex items-start justify-between gap-4 p-4" key={line}><p className="text-sm leading-6 text-zinc-300">{line}</p><CopyButton value={line} label="Copy" /></Card>)}</div></section>

    <section><h2 className="text-sm font-semibold">Proof points and reference discipline</h2><p className="mt-1 text-sm text-zinc-500">Useful context for calls, with the scope you need to keep attached to each claim.</p><div className="mt-3 grid gap-3 md:grid-cols-2">{salesReference.proofPoints.map((proof) => <Card className="p-4" key={proof.label}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium">{proof.label}</h3><span className="border border-zinc-800 px-2 py-1 text-[11px] text-zinc-500">{proof.scope}</span></div><p className="mt-3 text-sm leading-6 text-zinc-300">{proof.value}</p></Card>)}</div></section>

    <section><h2 className="text-sm font-semibold">Product-to-workflow map</h2><div className="mt-3 overflow-x-auto border border-zinc-800"><table className="w-full min-w-[720px] border-collapse text-left text-sm"><thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="p-3 font-medium">When you hear</th><th className="p-3 font-medium">Bring in</th><th className="p-3 font-medium">What to make concrete</th></tr></thead><tbody>{salesReference.useCaseMap.map((row) => <tr className="border-t border-zinc-800" key={row.trigger}><td className="p-3 text-zinc-300">{row.trigger}</td><td className="p-3 text-zinc-100">{row.products}</td><td className="p-3 leading-6 text-zinc-400">{row.outcome}</td></tr>)}</tbody></table></div></section>

    <section><h2 className="text-sm font-semibold">U.S. market battle cards</h2><p className="mt-1 text-sm text-zinc-500">Public positioning is sourced from each company&apos;s own site. Use the Gnani angle to guide a constructive comparison, not a negative claim.</p><div className="mt-3 grid gap-4 xl:grid-cols-2">{salesReference.competitors.map((competitor) => <Card className="p-5" key={competitor.name}><div className="flex items-center justify-between gap-3"><h3 className="font-medium">{competitor.name}</h3><a className="focus-ring inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-100" href={competitor.sourceUrl} target="_blank" rel="noreferrer">Public positioning <ExternalLink className="size-3" /></a></div><BattleBlock label="What they lead with" value={competitor.publicPositioning} /><BattleBlock label="Gnani field position" value={competitor.gnaniAngle} /><BattleBlock label="Useful field move" value={competitor.fieldMove} /></Card>)}</div></section>

    <Card className="border-amber-900/70 bg-amber-950/20 p-5"><h2 className="text-sm font-semibold text-amber-100">Keep the claims clean</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50/80">{salesReference.guardrails.map((guardrail) => <li key={guardrail}>- {guardrail}</li>)}</ul></Card>
  </div>;
}

function BattleBlock({ label, value }: { label: string; value: string }) { return <section className="mt-4"><h4 className="text-xs font-medium text-zinc-500">{label}</h4><p className="mt-1 text-sm leading-6 text-zinc-300">{value}</p></section>; }
