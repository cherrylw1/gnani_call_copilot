alter table public.lead_intelligence_cards
  add column if not exists account_brief jsonb;
