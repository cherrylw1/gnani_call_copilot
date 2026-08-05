import "server-only";
import * as cheerio from "cheerio";
import { openRouterJson } from "./openrouter";
import { companyResearchPrompt } from "./prompts/company-research";
import { createAdminSupabaseClient } from "./supabase/admin";

export const COMPANY_RESEARCH_RECIPE_VERSION = "2026-08-05.1";

export type CompanyResearch = Record<string, unknown> & { url: string; title: string; extracted: string; sources: { url: string; title: string; extracted: string }[]; model: string };

export async function researchCompany(domain: string): Promise<CompanyResearch> {
  const baseUrl = `https://${domain}`;
  const fetchPage = async (url: string) => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "gnani-call-copilot/1.0" } });
      if (!response.ok) throw new Error(`Website returned ${response.status}`);
      const html = await response.text(); const $ = cheerio.load(html); $("script,style,noscript,svg").remove();
      return {
        url: response.url,
        title: $("title").text().trim(),
        description: $("meta[name=description]").attr("content") ?? "",
        extracted: $("body").text().replace(/\s+/g, " ").trim().slice(0, 4200),
        links: $("a[href]").map((_, element) => $(element).attr("href") ?? "").get()
      };
    } finally { clearTimeout(timer); }
  };

  const homepage = await fetchPage(baseUrl);
  const candidates = homepage.links
    .flatMap((href) => { try { return [new URL(href, homepage.url)]; } catch { return []; } })
    .filter((url) => url.hostname === new URL(homepage.url).hostname)
    .filter((url) => /about|company|what-we-do|services|solutions|products|industries/i.test(`${url.pathname}${url.search}`))
    .map((url) => url.toString())
    .filter((url, index, list) => url !== homepage.url && list.indexOf(url) === index)
    .slice(0, 2);
  const extraPages = (await Promise.allSettled(candidates.map(fetchPage))).flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  const sources = [homepage, ...extraPages].map(({ url, title, extracted }) => ({ url, title, extracted }));
  const result = await openRouterJson<Record<string, unknown>>(companyResearchPrompt({ sources }), 900);
  return { url: homepage.url, title: homepage.title, extracted: homepage.extracted, sources, ...result.data, model: result.model };
}

export async function researchAndSaveCompany(company: { id: string; domain: string | null }) {
  if (!company.domain) throw new Error("No non-generic company domain is available for research.");
  const admin = createAdminSupabaseClient();
  await admin.from("companies").update({ research_status: "researching" }).eq("id", company.id);
  try {
    const research = await researchCompany(company.domain);
    const overview = typeof research.company_overview === "string" ? research.company_overview : null;
    const { error: updateError } = await admin.from("companies").update({ research_status: "completed", research_summary: overview, research_data: research, research_recipe_version: COMPANY_RESEARCH_RECIPE_VERSION, last_researched_at: new Date().toISOString() }).eq("id", company.id);
    if (updateError) throw new Error(updateError.message);
    const sourceRows = research.sources.map((source) => ({ company_id: company.id, source_type: "website", source_url: source.url, source_title: source.title, extracted_text: source.extracted, summary: overview, confidence_score: typeof research.confidence === "number" ? research.confidence : null }));
    if (sourceRows.length) await admin.from("company_research_sources").insert(sourceRows);
    return research;
  } catch (error) {
    await admin.from("companies").update({ research_status: "failed", research_data: { error: error instanceof Error ? error.message : "Research failed" } }).eq("id", company.id);
    throw error;
  }
}
