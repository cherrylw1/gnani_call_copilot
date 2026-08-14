"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, FileText, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { buildMasterScript, masterScriptText, type MasterScriptInput } from "@/lib/master-script";

type Match = { contact: Record<string, unknown>; company: Record<string, unknown> | null };

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function MasterScriptWorkspace() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setMatches([]);
      setSelected(null);
      setLoading(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/master-script?q=${encodeURIComponent(trimmed)}`);
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load that contact.");
        const nextMatches = body.matches as Match[];
        setMatches(nextMatches);
        setSelected(nextMatches.length === 1 ? nextMatches[0] : null);
      } catch (error) {
        setMatches([]);
        setSelected(null);
        toast.error(error instanceof Error ? error.message : "Could not load that contact.");
      } finally {
        setLoading(false);
      }
    }, trimmed.includes("@") ? 80 : 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  const input = useMemo<MasterScriptInput | null>(() => {
    if (!selected) return null;
    const contact = selected.contact;
    const company = selected.company;
    return {
      firstName: textValue(contact.first_name, textValue(contact.full_name, "there").split(" ")[0]),
      companyName: textValue(company?.company_name, "your organization"),
      companySummary: textValue(company?.research_summary),
      industry: textValue(company?.industry_auto_classified)
    };
  }, [selected]);

  const script = input ? buildMasterScript(input) : null;
  const copyScript = async () => {
    if (!input) return;
    await navigator.clipboard.writeText(masterScriptText(input));
    setCopied(true);
    toast.success("Master script copied.");
    window.setTimeout(() => setCopied(false), 1600);
  };

  return <div className="space-y-6">
    <div><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Universal call flow</p><h1 className="mt-2 text-xl font-semibold tracking-tight">Master Script</h1><p className="mt-1 max-w-3xl text-sm text-zinc-500">One confident, read-aloud conversation for every prospect. Contact and company context are inserted locally after the lookup; no model generation is used.</p></div>
    <div className="flex max-w-4xl gap-2">
      <label className="flex min-w-0 flex-1 items-center gap-2 border border-zinc-700 bg-zinc-950 px-3"><Search className="size-4 text-zinc-500" /><input aria-label="Search contact by email or name" className="focus-ring h-12 w-full bg-transparent text-sm outline-none placeholder:text-zinc-600" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Paste a prospect email or type a name" autoComplete="off" /></label>
      <div className="flex min-w-28 items-center justify-center border border-zinc-800 px-3 text-xs text-zinc-500">{loading ? "Loading…" : query.length >= 3 ? `${matches.length} match${matches.length === 1 ? "" : "es"}` : "Ready"}</div>
    </div>

    {matches.length > 1 && !selected ? <Card className="max-w-4xl p-4"><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Choose a prospect</p><div className="mt-3 grid gap-2 md:grid-cols-2">{matches.map((match) => <button type="button" className="focus-ring border border-zinc-800 p-3 text-left transition hover:border-zinc-500 hover:bg-zinc-900" key={String(match.contact.id)} onClick={() => setSelected(match)}><div className="flex items-center gap-2"><UserRound className="size-4 text-zinc-500" /><span className="text-sm text-zinc-100">{textValue(match.contact.full_name, textValue(match.contact.email))}</span></div><p className="mt-1 text-xs text-zinc-500">{textValue(match.contact.job_title, "Title unavailable")} · {textValue(match.company?.company_name, "Company unavailable")}</p></button>)}</div></Card> : null}

    {!script ? <EmptyState title="Paste a prospect email or name" detail="The master script appears immediately after the contact lookup. The wording stays fixed; only the person and available company context change." /> : <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <aside className="space-y-5"><Card className="p-5"><div className="flex items-start gap-3"><div className="flex size-9 items-center justify-center border border-zinc-700 bg-zinc-900"><UserRound className="size-4 text-zinc-300" /></div><div><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Prospect</p><h2 className="mt-2 text-base font-semibold">{textValue(selected?.contact.full_name, "Prospect")}</h2><p className="mt-1 text-sm text-zinc-500">{textValue(selected?.contact.job_title, "Title unavailable")}</p></div></div><dl className="mt-5 space-y-3 text-sm"><Info label="Company" value={textValue(selected?.company?.company_name, "Company unavailable")} /><Info label="Industry" value={textValue(selected?.company?.industry_auto_classified, "Industry unavailable")} /><Info label="Email" value={textValue(selected?.contact.email, "Email unavailable")} /></dl></Card><Card className="p-5"><div className="flex items-center gap-2"><FileText className="size-4 text-zinc-400" /><h2 className="text-sm font-medium">How to use it</h2></div><p className="mt-3 text-sm leading-6 text-zinc-500">Read the opening, pause, and let them respond. Use the next section only when it fits what they say. The script is designed to stay confident without assuming a specific pain point.</p></Card></aside>
      <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Read-aloud call flow</p><h2 className="mt-2 text-base font-semibold">One master conversation</h2></div><button type="button" onClick={copyScript} className="focus-ring inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-900">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "Copied" : "Copy script"}</button></div><div className="mt-5 space-y-6"><ScriptBlock label="Opening" value={script.opening} strong /><ScriptBlock label="Value" value={script.value} /><ScriptBlock label="Question" value={script.question} strong /><ScriptBlock label="Meeting ask" value={script.meetingAsk} strong /><section><h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">If the conversation takes a different turn</h3><div className="mt-3 grid gap-3 md:grid-cols-2"><Response label="They are interested" value={script.ifInterested} /><Response label="They ask for information" value={script.ifSendInformation} /><Response label="They already have a solution" value={script.ifExistingSolution} /><Response label="They are not interested" value={script.ifNotInterested} /><Response label="Wrong person" value={script.ifWrongPerson} /><Response label="They are busy" value={script.ifBusy} /></div></section></div></Card>
    </div>}
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1 text-zinc-300">{value}</dd></div>; }
function ScriptBlock({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <section><h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</h3><p className={`mt-2 whitespace-pre-wrap text-sm leading-7 ${strong ? "text-zinc-50" : "text-zinc-300"}`}>{value}</p></section>; }
function Response({ label, value }: { label: string; value: string }) { return <div className="border border-zinc-800 p-3"><p className="text-xs font-medium text-zinc-400">{label}</p><p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p></div>; }
