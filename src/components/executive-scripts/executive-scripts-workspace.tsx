"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { CopyButton } from "@/components/copy-button";
import { ContactCard } from "@/components/call/contact-card";
import { CompanyCard } from "@/components/call/company-card";
import { buildScript, classifySegment, getSegment, SEGMENT_IDS, type SegmentId } from "@/lib/ccw-executive-scripts";

type Context = {
  contact: Record<string, unknown>;
  company: Record<string, unknown> | null;
  signals: Record<string, unknown> | null;
};

export function ExecutiveScriptsWorkspace() {
  const [email, setEmail] = useState("");
  const [context, setContext] = useState<Context | null>(null);
  const [segmentId, setSegmentId] = useState<SegmentId>("operations");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    setContext(null);
    try {
      const response = await fetch(`/api/search-contact?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      if (!body.context) {
        toast.message("No contact found for this email.");
        return;
      }
      const nextContext = body.context as Context;
      setContext(nextContext);
      setSegmentId(classifySegment(String(nextContext.contact.job_title || ""), String(nextContext.contact.persona || "")));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const script = context ? buildScript(segmentId, {
    firstName: String(context.contact.first_name || "there"),
    companyName: String(context.company?.company_name || "your organization"),
    title: String(context.contact.job_title || context.contact.persona || ""),
    industry: String(context.company?.industry_auto_classified || "")
  }) : null;

  const fullScript = script ? [
    `CCW Executive Script — ${script.label}`,
    "",
    "Opening",
    script.opening,
    "",
    "Elevator pitch",
    script.elevatorPitch,
    "",
    "Act two — Value",
    script.value,
    "",
    "Act three — Meeting ask",
    script.turn,
    "",
    "Pushbacks",
    ...script.pushbacks.flatMap((item) => [`${item.label}:`, item.response])
  ].join("\n") : "";

  return <div className="space-y-6">
    <div><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">CCW post-event campaign</p><h1 className="mt-2 text-xl font-semibold tracking-tight">Executive Scripts</h1><p className="mt-1 max-w-3xl text-sm text-zinc-500">A zero-cost, read-aloud teleprompter. It uses saved contact and company data only—no model generation.</p></div>
    <div className="flex max-w-3xl gap-2">
      <label className="flex min-w-0 flex-1 items-center gap-2 border border-zinc-700 bg-zinc-950 px-3"><Search className="size-4 text-zinc-500" /><input className="focus-ring h-12 w-full bg-transparent text-sm outline-none placeholder:text-zinc-600" value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} placeholder="Paste prospect email" /></label>
      <Button onClick={search} disabled={loading || !email}>{loading ? "Searching..." : "Load script"}</Button>
    </div>
    {!context || !script ? <EmptyState title="Load a CCW prospect" detail="Paste an imported prospect email to view the company brief and a segment-specific read-aloud script. This page never calls OpenRouter." /> : <>
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5"><ContactCard contact={context.contact} /><CompanyCard company={context.company} /><SignalSummary signals={context.signals} /></div>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Read-aloud CCW script</h2><p className="mt-2 text-sm text-zinc-400">Selected from the prospect’s title; change the segment any time.</p></div><CopyButton value={fullScript} label="Copy full script" /></div>
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end"><div><label className="text-xs text-zinc-500">Persona segment</label><select className="focus-ring mt-1 h-10 w-full border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none" value={segmentId} onChange={(event) => setSegmentId(event.target.value as SegmentId)}>{SEGMENT_IDS.map((id) => <option key={id} value={id}>{getSegment(id).label}</option>)}</select></div><p className="max-w-sm text-xs leading-5 text-zinc-500">Decision currency: {script.decisionCurrency}</p></div>
          <div className="mt-5 grid gap-3 border-y border-zinc-800 py-4 text-sm md:grid-cols-2"><Meta label="Primary Gnani focus" value={script.products} /><Meta label="Company workflow lens" value={context.company?.industry_auto_classified ? `${String(context.company.industry_auto_classified)} — ${String(context.company.company_name)}` : String(context.company?.company_name || "Company context") } /></div>
          <div className="mt-5 space-y-6"><ScriptBlock label="Act one — Opening" value={script.opening} strong /><ScriptBlock label="Segment elevator pitch" value={script.elevatorPitch} /><ScriptBlock label="Act two — Value and relevance" value={script.value} /><ScriptBlock label="Act three — Turn and meeting ask" value={script.turn} strong /><section><h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">If they push back</h3><div className="mt-3 space-y-3">{script.pushbacks.map((item) => <div key={item.label} className="border border-zinc-800 p-3"><p className="text-xs font-medium text-zinc-400">{item.label}</p><p className="mt-1 text-sm leading-6 text-zinc-200">{item.response}</p></div>)}</div></section></div>
        </Card>
      </div>
      <p className="text-xs text-zinc-600">Script content is deterministic and based on the CCW playbooks. Company details are the existing saved research profile; use the segment selector whenever the title alone is ambiguous.</p>
    </>}
  </div>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 leading-6 text-zinc-300">{value}</p></div>; }
function ScriptBlock({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <section><h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</h3><p className={`mt-2 whitespace-pre-wrap leading-7 ${strong ? "text-zinc-50" : "text-zinc-300"}`}>{value}</p></section>; }
function SignalSummary({ signals }: { signals: Record<string, unknown> | null }) {
  if (!signals) return null;
  const items: [string, unknown][] = [
    ["Priority score", signals.priority_score_normalized],
    ["Call-volume signal", signals.call_volume_band_raw],
    ["Budgeting period", signals.budgeting_period_raw]
  ].filter((item) => item[1] !== null && item[1] !== undefined && item[1] !== "") as [string, unknown][];
  if (!items.length) return null;
  return <Card className="p-4"><h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Lead signals</h2><dl className="mt-3 grid gap-3 text-sm">{items.map(([label, value]) => <div key={label}><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1 text-zinc-300">{String(value)}</dd></div>)}</dl></Card>;
}
