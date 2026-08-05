# gnani Call Copilot

An internal calling workspace for gnani.ai’s CCW Las Vegas follow-up list. It turns CSV-backed prospect signals into a fast call cockpit for discovery, call-note capture, and manual follow-up email drafting.

## Phase 1

- CSV upload and local development import
- Raw-lead preservation and normalized Supabase tables
- Contacts and companies tables
- Buyer-fit classification and adjustable scoring
- Call cockpit with CSV signals, call cards, notes, and follow-up email drafting
- Optional lightweight company-homepage research
- OpenRouter generation with a rule-based fallback

Phase 1 intentionally excludes voice demos, LinkedIn scraping, automatic emails, dialer integrations, Firecrawl, Exa, CRM integrations, and a full authentication system.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Supabase Postgres, Supabase JS, Papa Parse, Zod, Cheerio, OpenRouter, and Sonner.

## Local setup

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and enter your project values. Never commit `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=deepseek/deepseek-v4-flash-0731
OPENROUTER_FALLBACK_MODEL=google/gemini-3.5-flash-lite
```

## Database

Apply the migration in `supabase/migrations/20260805113000_phase_1_call_copilot.sql` using the Supabase CLI or SQL editor before importing leads.

```bash
supabase db push
```

The server uses the service-role key for data operations. Never expose this key in browser code.

## CSV import

CSV files are ignored by Git. In local development, the import page checks these paths in order:

1. `/data/Klenty_Master_Call_List_Clean.csv`
2. `Klenty_Master_Call_List_Clean.csv` at the project root

Use the upload flow in Vercel because local workspace files are not available in production. The importer preserves each source row as JSONB, validates malformed data without failing the entire import, normalizes useful records, and stores an aggregate import summary.

## Vercel

Connect the GitHub repository in Vercel, set the environment variables from `.env.example`, and deploy. Do not add local CSVs, API keys, or `.vercel` files to Git.
