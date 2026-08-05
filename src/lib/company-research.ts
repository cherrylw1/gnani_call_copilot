import "server-only";
import * as cheerio from "cheerio";
import { openRouterJson } from "./openrouter";
import { companyResearchPrompt } from "./prompts/company-research";

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
        extracted: $("body").text().replace(/\s+/g, " ").trim().slice(0, 5500),
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
  const result = await openRouterJson<Record<string, unknown>>(companyResearchPrompt({ sources }), 1200);
  return { url: homepage.url, title: homepage.title, extracted: homepage.extracted, sources, ...result.data, model: result.model };
}
