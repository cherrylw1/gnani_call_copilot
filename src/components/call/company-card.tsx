import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const researchText = (research: unknown, key: string) => {
  if (!research || typeof research !== "object") return "";
  const value = (research as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
};

export function CompanyCard({ company, onResearch, loading }: { company: Record<string, unknown> | null; onResearch: () => void; loading: boolean }) {
  const research = company?.research_data;
  const details = [
    ["What the company does", researchText(research, "company_overview") || String(company?.research_summary || "Research this company to add a public-web company brief.")],
    ["Products and services", researchText(research, "products_and_services")],
    ["Who they serve", researchText(research, "customer_segments")],
    ["Operating footprint", researchText(research, "operating_footprint")],
    ["Customer-operations context", researchText(research, "customer_operations_context")],
    ["Noteworthy context", researchText(research, "noteworthy_context")]
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return <Card className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Company details</h2><p className="mt-3 font-medium">{String(company?.company_name || "Company unknown")}</p></div>{Boolean(company?.id) && <Button className="bg-zinc-900 text-zinc-100 hover:bg-zinc-800" onClick={onResearch} disabled={loading}>{loading ? "Researching..." : "Research company"}</Button>}</div><p className="mt-2 text-sm text-zinc-400">{String(company?.industry_auto_classified || "Industry unknown")}</p><dl className="mt-4 grid gap-4 text-sm"><div><dt className="text-xs text-zinc-500">Domain</dt><dd>{String(company?.domain || "-")}</dd></div>{details.map(([label, value]) => <div key={label}><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1 leading-6 text-zinc-300">{value}</dd></div>)}{researchText(research, "source_confidence") ? <div><dt className="text-xs text-zinc-500">Research confidence</dt><dd className="mt-1 text-zinc-300">{researchText(research, "source_confidence")}</dd></div> : null}</dl></Card>;
}
