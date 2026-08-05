import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CardData = Record<string, unknown>;

export function ColdCallCard({ card, onGenerate, loading, fallback }: { card: CardData | null; onGenerate: () => void; loading: boolean; fallback: boolean }) {
  const pitches = card?.elevator_pitches && typeof card.elevator_pitches === "object" ? card.elevator_pitches as Record<string, unknown> : null;
  const accountBrief = card?.account_brief && typeof card.account_brief === "object" ? card.account_brief as Record<string, unknown> : null;
  return <Card className="p-5">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Call brief</h2><p className="mt-2 text-sm text-zinc-400">Company context and a practical Gnani-specific approach.</p></div><Button onClick={onGenerate} disabled={loading}>{loading ? "Preparing..." : "Load call brief"}</Button></div>
    {fallback && <p className="mt-4 border border-zinc-700 p-2 text-xs text-zinc-400">Using an evidence-aware fallback. Refresh company research for a richer company brief.</p>}
    {card ? <div className="mt-5 space-y-5 text-sm"><Block label="Opening line" value={card.cold_call_opener} strong />{accountBrief ? <AccountBrief brief={accountBrief} /> : <><Block label="Company at a glance" value={card.company_summary} /><Block label="Why this contact / why now" value={card.why_this_company} /></>}<Block label="Gnani pitch angle" value={card.best_gnani_angle} />{pitches ? <ElevatorPitches pitches={pitches} /> : <Block label="Company-specific elevator pitch" value={card.personalized_pitch} strong />}<ListBlock label="Relevant Gnani capabilities" value={card.recommended_products} /><Block label="Suggested first use case" value={card.demo_use_case} /><ObjectBlock label="If they push back" value={card.objection_handles} /><Block label="Send-email line" value={card.send_email_line} /><Block label="Meeting ask" value={card.meeting_ask} strong /><Block label="Evidence level" value={card.source_confidence} /></div> : <p className="mt-5 text-sm text-zinc-500">Load a call brief after finding a prospect. Once a current brief is saved, it returns from the cache immediately.</p>}
  </Card>;
}

function ElevatorPitches({ pitches }: { pitches: Record<string, unknown> }) {
  return <section><h3 className="text-xs font-medium text-zinc-500">Company-specific elevator pitches</h3><p className="mt-1 text-xs text-zinc-500">Choose the length that fits the live conversation.</p><div className="mt-3 space-y-3">{(["detailed", "medium", "quick"] as const).map((size) => <div key={size} className="border border-zinc-800 bg-zinc-950 p-3"><p className="text-xs font-medium capitalize text-zinc-400">{size}</p><p className="mt-1 leading-6 text-zinc-100">{String(pitches[size] || "-")}</p></div>)}</div></section>;
}

function AccountBrief({ brief }: { brief: Record<string, unknown> }) { return <section className="space-y-4"><Block label="Company at a glance" value={brief.summary} /><ListBlock label="What the company delivers" value={brief.services} /><ListBlock label="Operating scale and facts" value={brief.operating_facts} /><Block label="Customer interaction context" value={brief.interaction_context} /><Block label="Role context" value={brief.role_context} /><ListBlock label="Potential workflows to validate" value={brief.workflow_hypotheses} /></section>; }

function Block({ label, value, strong = false }: { label: string; value: unknown; strong?: boolean }) { return <section><h3 className="text-xs font-medium text-zinc-500">{label}</h3><p className={`mt-1 leading-6 ${strong ? "text-zinc-100" : "text-zinc-300"}`}>{String(value || "-")}</p></section>; }
function ListBlock({ label, value }: { label: string; value: unknown }) { const list = Array.isArray(value) ? value : []; return <section><h3 className="text-xs font-medium text-zinc-500">{label}</h3><ul className="mt-2 space-y-2 text-zinc-300">{list.map((item, index) => <li key={index}>- {String(item)}</li>)}</ul></section>; }
function ObjectBlock({ label, value }: { label: string; value: unknown }) { const items = value && typeof value === "object" ? Object.entries(value as Record<string, unknown>) : []; return <section><h3 className="text-xs font-medium text-zinc-500">{label}</h3><div className="mt-2 space-y-2">{items.map(([key, item]) => <p key={key} className="text-zinc-300"><span className="capitalize text-zinc-500">{key.replace(/_/g, " ")}: </span>{String(item)}</p>)}</div></section>; }
