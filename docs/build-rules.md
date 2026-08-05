# Build Rules

## Security

- Never commit .env.local.
- Never commit API keys.
- Never commit CSV lead files.
- Never expose Supabase service role key to client code.
- Use service role key only in server-side routes/utilities.
- Do not print full lead emails or phone lists in logs or UI debug output.
- Do not scrape LinkedIn.
- Do not automate LinkedIn.
- Do not use paid crawling APIs like Firecrawl or Exa.

## Product scope

Phase 1 includes:

- CSV import
- lead/company normalization
- Supabase storage
- dashboard
- contacts table
- companies table
- live call cockpit
- OpenRouter call-card generation
- call notes
- follow-up email generation
- optional lightweight website research from company homepage/common pages

Phase 1 excludes:

- voice demo
- automatic email sending
- dialer integration
- CRM integration
- LinkedIn scraping
- Firecrawl
- Exa
- full authentication system

## Performance

The call cockpit must feel fast.

Do not deeply research every company during import.

Use this staged approach:

1. Import CSV and normalize data.
2. Generate call cards from CSV-backed context first.
3. Add optional company research on demand.
4. Cache company research and generated cards in Supabase.

## LLM rules

Use OpenRouter.

Primary model:

deepseek/deepseek-v4-flash-0731

Fallback model:

google/gemini-3.5-flash-lite

Keep outputs short and structured.

For call cards, return compact JSON fields:

- lead_category
- fit_score
- company_summary
- why_this_company
- best_gnani_angle
- recommended_products
- cold_call_opener
- personalized_pitch
- discovery_questions
- objection_handles
- send_email_line
- meeting_ask
- demo_use_case
- source_confidence

Label insights as:

- CSV-backed
- Website-backed
- Inferred
- Unknown

Do not hallucinate company facts.
When unsure, say inferred or unknown.
