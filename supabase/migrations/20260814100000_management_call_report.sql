create table if not exists call_log_imports (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_fingerprint text not null unique,
  source_timezone text not null default 'Asia/Kolkata',
  source_rows integer not null default 0,
  imported_rows integer not null default 0,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists klenty_call_logs (
  id uuid primary key default gen_random_uuid(),
  import_id uuid references call_log_imports(id) on delete set null,
  call_id text,
  dedupe_key text not null unique,
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  prospect_email text not null,
  prospect_name text not null,
  account_name text not null,
  completed_at timestamptz not null,
  completed_at_raw text not null,
  source_timezone text not null default 'Asia/Kolkata',
  call_source text not null,
  prospect_status text not null,
  call_type text,
  purpose text,
  call_status text not null,
  call_notes text,
  to_number text,
  call_placed_by text,
  outcome text,
  duration_seconds integer,
  shareable_link text,
  from_number text,
  job_title text,
  persona_segment_raw text,
  persona_segment text,
  industry_raw text,
  industry text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_klenty_call_logs_completed_at on klenty_call_logs(completed_at desc);
create index if not exists idx_klenty_call_logs_email on klenty_call_logs(prospect_email);
create index if not exists idx_klenty_call_logs_contact on klenty_call_logs(contact_id);
create index if not exists idx_klenty_call_logs_company on klenty_call_logs(company_id);
create index if not exists idx_klenty_call_logs_account on klenty_call_logs(account_name);
create index if not exists idx_klenty_call_logs_status on klenty_call_logs(call_status);
create index if not exists idx_klenty_call_logs_source on klenty_call_logs(call_source);
create index if not exists idx_klenty_call_logs_persona on klenty_call_logs(persona_segment);
create index if not exists idx_klenty_call_logs_industry on klenty_call_logs(industry);
create index if not exists idx_klenty_call_logs_from_number on klenty_call_logs(from_number);

drop trigger if exists klenty_call_logs_set_updated_at on klenty_call_logs;
create trigger klenty_call_logs_set_updated_at
before update on klenty_call_logs
for each row execute function public.set_updated_at();

alter table call_log_imports enable row level security;
alter table klenty_call_logs enable row level security;

comment on table call_log_imports is 'Private metadata for server-side Klenty call-log imports.';
comment on table klenty_call_logs is 'Private call-level activity used by the management reporting dashboard.';
