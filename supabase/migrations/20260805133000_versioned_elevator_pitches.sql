alter table public.lead_intelligence_cards
  add column if not exists elevator_pitches jsonb,
  add column if not exists brief_recipe_version text;

create index if not exists idx_lead_intelligence_cards_recipe_version
  on public.lead_intelligence_cards (brief_recipe_version);
