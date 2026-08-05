import "server-only";
import * as cheerio from "cheerio";
import { openRouterJson } from "./openrouter";
import { companyResearchPrompt } from "./prompts/company-research";

export type CompanyResearch = Record<string, unknown> & { url: string; title: string; extracted: string; model: string };

export async function researchCompany(domain: string): Promise<CompanyResearch> {
  const url = `https://${domain}`; const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "gnani-call-copilot/1.0" } });
    if (!response.ok) throw new Error(`Website returned ${response.status}`);
    const html = await response.text(); const $ = cheerio.load(html); $("script,style,noscript,svg").remove();
    const extracted = $("body").text().replace(/\s+/g, " ").trim().slice(0, 7000);
    const title = $("title").text().trim(); const description = $("meta[name=description]").attr("content") ?? "";
    const result = await openRouterJson<Record<string, unknown>>(companyResearchPrompt({ url, title, description, extracted }), 800);
    return { url, title, extracted, ...result.data, model: result.model };
  } finally { clearTimeout(timer); }
}
