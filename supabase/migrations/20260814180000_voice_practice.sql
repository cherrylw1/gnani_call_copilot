create table if not exists voice_practice_sessions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  selected_mode text not null check (selected_mode in ('fish', 'gpt_audio_mini', 'gemini_live')),
  difficulty text not null check (difficulty in ('receptive', 'busy', 'skeptical', 'technical')),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  scenario jsonb not null default '{}'::jsonb,
  coaching jsonb,
  coaching_model text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists voice_practice_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references voice_practice_sessions(id) on delete cascade,
  turn_index integer not null,
  speaker text not null check (speaker in ('seller', 'buyer')),
  transcript text not null,
  model text,
  created_at timestamptz not null default now(),
  unique(session_id, turn_index)
);

create index if not exists idx_voice_practice_sessions_started_at on voice_practice_sessions(started_at desc);
create index if not exists idx_voice_practice_sessions_contact on voice_practice_sessions(contact_id);
create index if not exists idx_voice_practice_turns_session on voice_practice_turns(session_id, turn_index);

drop trigger if exists voice_practice_sessions_set_updated_at on voice_practice_sessions;
create trigger voice_practice_sessions_set_updated_at
before update on voice_practice_sessions
for each row execute function public.set_updated_at();

alter table voice_practice_sessions enable row level security;
alter table voice_practice_turns enable row level security;

comment on table voice_practice_sessions is 'Cold-call practice sessions. Stores scenario, transcript-derived coaching, and metadata only. Raw microphone audio is never persisted.';
comment on table voice_practice_turns is 'Transcript-only turns for cold-call practice sessions.';
