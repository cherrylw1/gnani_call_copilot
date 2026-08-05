create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists lead_imports (
  id uuid primary key default gen_random_uuid(), file_name text not null,
  source text default 'CCW Las Vegas', total_rows int default 0, valid_rows int default 0,
  duplicate_email_count int default 0, status text default 'created', summary jsonb,
  created_at timestamptz default now()
);
create table if not exists raw_leads (
  id uuid primary key default gen_random_uuid(), import_id uuid references lead_imports(id) on delete cascade,
  row_number int not null, raw_data jsonb not null, data_quality_status text default 'ok',
  data_quality_notes text, created_at timestamptz default now()
);
create table if not exists companies (
  id uuid primary key default gen_random_uuid(), company_name text not null, normalized_company_name text,
  domain text, website_url text, industry_auto_classified text, country_primary text, company_type text,
  buyer_partner_competitor_status text, fit_score numeric, research_status text default 'not_started',
  research_summary text, research_data jsonb, likely_use_cases jsonb, recommended_gnani_products jsonb,
  last_researched_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(), raw_lead_id uuid references raw_leads(id) on delete set null,
  company_id uuid references companies(id) on delete set null, first_name text, last_name text, full_name text,
  job_title text, persona text, email text unique, email_domain text, work_phone text, street_address text,
  city text, state text, zip_code text, country text, previous_outreach text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists lead_signals (
  id uuid primary key default gen_random_uuid(), contact_id uuid references contacts(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade, no_right_tech_partner_raw text,
  outsourcing_apac_raw text, investing_chatbots_raw text, investing_voice_ai_raw text,
  investing_conversational_ivr_raw text, priority_score_raw text, priority_score_normalized numeric,
  call_volume_band_raw text, call_volume_match_100k_500k_raw text, budgeting_period_raw text,
  budgeting_period_jul_year_end_raw text, industry_auto_classified_raw text, pdf_match_confidence_raw text,
  created_at timestamptz default now()
);
create table if not exists company_research_sources (
  id uuid primary key default gen_random_uuid(), company_id uuid references companies(id) on delete cascade,
  source_type text, source_url text, source_title text, extracted_text text, summary text,
  confidence_score numeric, created_at timestamptz default now()
);
create table if not exists lead_intelligence_cards (
  id uuid primary key default gen_random_uuid(), contact_id uuid references contacts(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade, lead_category text, fit_score numeric,
  company_summary text, why_this_company text, best_gnani_angle text, recommended_products jsonb,
  cold_call_opener text, personalized_pitch text, discovery_questions jsonb, objection_handles jsonb,
  send_email_line text, meeting_ask text, demo_use_case text, source_confidence text,
  generated_by_model text, generated_at timestamptz default now()
);
create table if not exists call_activities (
  id uuid primary key default gen_random_uuid(), contact_id uuid references contacts(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade, outcome text, call_notes text, objection text,
  interest_level text, next_step text, follow_up_required boolean default false, created_at timestamptz default now()
);
create table if not exists generated_emails (
  id uuid primary key default gen_random_uuid(), contact_id uuid references contacts(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade, call_activity_id uuid references call_activities(id) on delete set null,
  email_type text, subject text, body text, generated_by_model text, copied_at timestamptz, created_at timestamptz default now()
);
create index if not exists idx_contacts_email on contacts(email);
create index if not exists idx_contacts_email_domain on contacts(email_domain);
create index if not exists idx_contacts_company_id on contacts(company_id);
create index if not exists idx_companies_domain on companies(domain);
create index if not exists idx_companies_normalized_name on companies(normalized_company_name);
create index if not exists idx_lead_signals_priority on lead_signals(priority_score_normalized);
create index if not exists idx_call_activities_contact on call_activities(contact_id);
create index if not exists idx_generated_emails_contact on generated_emails(contact_id);
drop trigger if exists companies_set_updated_at on companies;
create trigger companies_set_updated_at before update on companies for each row execute function public.set_updated_at();
drop trigger if exists contacts_set_updated_at on contacts;
create trigger contacts_set_updated_at before update on contacts for each row execute function public.set_updated_at();
