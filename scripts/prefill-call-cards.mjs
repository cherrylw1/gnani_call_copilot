import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing ${name}. Run with your local environment file.`);
}

const baseUrl = (process.env.PREFILL_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const concurrency = Math.max(1, Number.parseInt(process.env.PREFILL_CONCURRENCY || "5", 10) || 5);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function fetchAll(table, select) {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < pageSize) return rows;
  }
}

async function post(path, body, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw new Error(`${label}: ${lastError instanceof Error ? lastError.message : "unknown error"}`);
}

async function runPool(items, worker) {
  let cursor = 0;
  const failures = [];
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      try { await worker(item); } catch (error) { failures.push(error instanceof Error ? error.message : String(error)); }
    }
  });
  await Promise.all(runners);
  return failures;
}

const researchIsCurrent = (company) => company.research_status === "completed" && company.research_recipe_version === "2026-08-05.1" && company.research_data;

const contacts = await fetchAll("contacts", "id,email,company_id");
const companies = await fetchAll("companies", "id,company_name,domain,research_status,research_recipe_version,research_data");
const cards = await fetchAll("lead_intelligence_cards", "contact_id,brief_recipe_version,generated_by_model,generated_at");
const companiesById = new Map(companies.map((company) => [company.id, company]));
const latestCards = new Map();
for (const card of cards.sort((a, b) => String(b.generated_at).localeCompare(String(a.generated_at)))) {
  if (!latestCards.has(card.contact_id)) latestCards.set(card.contact_id, card);
}

const byCompany = new Map();
for (const contact of contacts) {
  if (!contact.company_id || !companiesById.has(contact.company_id)) continue;
  const list = byCompany.get(contact.company_id) || [];
  list.push(contact);
  byCompany.set(contact.company_id, list);
}

const companyJobs = [...byCompany.keys()]
  .map((id) => companiesById.get(id))
  .filter((company) => company.domain && !researchIsCurrent(company));
let researched = 0;
console.log(`Research stage: ${companyJobs.length} companies to prepare (${companies.length - companyJobs.length} already current).`);
const researchFailures = await runPool(companyJobs, async (company) => {
  await post("/api/research-company", { company_id: company.id }, `research ${company.company_name}`);
  researched += 1;
  if (researched % 25 === 0 || researched === companyJobs.length) console.log(`Research: ${researched}/${companyJobs.length}`);
});

const cardJobs = contacts.filter((contact) => {
  const card = latestCards.get(contact.id);
  return !(card?.brief_recipe_version === "2026-08-05.2" && card.generated_by_model && card.generated_by_model !== "rule-based");
});
let generated = 0;
console.log(`Card stage: ${cardJobs.length} contacts to generate (${contacts.length - cardJobs.length} already model-generated).`);
const cardFailures = await runPool(cardJobs, async (contact) => {
  await post("/api/generate-call-card", { email: contact.email, refresh: true, strict: true }, `card ${contact.email}`);
  generated += 1;
  if (generated % 50 === 0 || generated === cardJobs.length) console.log(`Cards: ${generated}/${cardJobs.length}`);
});

console.log(JSON.stringify({
  research: { attempted: companyJobs.length, completed: researched, failed: researchFailures.length },
  cards: { attempted: cardJobs.length, completed: generated, failed: cardFailures.length },
  failures: [...researchFailures, ...cardFailures].slice(0, 20)
}, null, 2));

if (researchFailures.length || cardFailures.length) process.exitCode = 1;
