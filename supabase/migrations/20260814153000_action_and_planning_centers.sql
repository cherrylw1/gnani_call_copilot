create table if not exists outreach_tasks (
  id uuid primary key default gen_random_uuid(),
  source_call_log_id uuid references klenty_call_logs(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  source_key text unique,
  source_kind text not null default 'manual' check (source_kind in ('manual', 'call_note', 'data_quality')),
  task_type text not null check (task_type in ('email', 'linkedin', 'call', 'referral', 'meeting', 'nurture', 'research', 'cleanup', 'general')),
  channel text not null default 'general' check (channel in ('email', 'linkedin', 'phone', 'internal', 'general')),
  title text not null,
  description text,
  evidence_text text,
  prospect_email text,
  prospect_name text,
  account_name text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'done', 'snoozed', 'dismissed')),
  due_at timestamptz,
  snoozed_until timestamptz,
  completed_at timestamptz,
  dismissed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_outreach_tasks_status_due on outreach_tasks(status, due_at);
create index if not exists idx_outreach_tasks_email on outreach_tasks(prospect_email);
create index if not exists idx_outreach_tasks_account on outreach_tasks(account_name);
create index if not exists idx_outreach_tasks_contact on outreach_tasks(contact_id);
create index if not exists idx_outreach_tasks_company on outreach_tasks(company_id);
create index if not exists idx_outreach_tasks_source_call on outreach_tasks(source_call_log_id);

drop trigger if exists outreach_tasks_set_updated_at on outreach_tasks;
create trigger outreach_tasks_set_updated_at
before update on outreach_tasks
for each row execute function public.set_updated_at();

alter table outreach_tasks enable row level security;

comment on table outreach_tasks is 'Personal follow-up and data-quality actions derived from call notes or created manually.';

create or replace function public.backfill_outreach_tasks()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
  affected integer := 0;
begin
  delete from outreach_tasks t
  using klenty_call_logs l
  where t.source_call_log_id = l.id
    and t.source_kind <> 'manual'
    and (
      (t.task_type = 'referral' and coalesce(l.call_notes, '') !~* '(forward|proper lead|gave me a name|connect you|who handles|who owns)')
      or (t.task_type = 'research' and coalesce(l.call_notes, '') ~* '(wrong number|remove.{0,30}(list|contact)|left the company|not working for the company|do not call|don''t call|not to call|stop contact|disconnected|don''t need|doesn''t need|do not need|won''t recommend)')
      or (t.task_type = 'nurture' and coalesce(l.call_notes, '') ~* '(they|he|she) (will|would) reach out')
    );

  insert into outreach_tasks (
    source_call_log_id, contact_id, company_id, source_key, source_kind, task_type, channel,
    title, description, evidence_text, prospect_email, prospect_name, account_name, priority, due_at, metadata
  )
  select
    l.id, l.contact_id, l.company_id, 'call:' || l.id || ':cleanup', 'data_quality', 'cleanup', 'internal',
    case
      when coalesce(l.call_notes, '') ~* '(do not call|don''t call|not to call|stop contact|take (me|him|her) off|calling list)' then 'Remove ' || coalesce(nullif(l.prospect_name, ''), l.prospect_email) || ' from outreach'
      when coalesce(l.call_notes, '') ~* '(left the company|not working for the company|wrong number)' then 'Correct the contact record for ' || coalesce(nullif(l.prospect_name, ''), l.prospect_email)
      when nullif(trim(coalesce(l.call_notes, '')), '') is null then 'Add or verify notes for the connected call'
      else 'Add or verify the outcome for the connected call'
    end,
    'Review this record in Klenty or the CRM, then mark the cleanup task complete.',
    nullif(trim(l.call_notes), ''), l.prospect_email, l.prospect_name, l.account_name, 'high',
    greatest(l.completed_at + interval '1 day', now()),
    jsonb_build_object('outcome', l.outcome, 'call_status', l.call_status, 'call_source', l.call_source)
  from klenty_call_logs l
  where l.call_status = 'Answered'
    and (
      coalesce(l.call_notes, '') ~* '(do not call|don''t call|not to call|stop contact|take (me|him|her) off|calling list|left the company|not working for the company|wrong number)'
      or nullif(trim(coalesce(l.call_notes, '')), '') is null
      or nullif(trim(coalesce(l.outcome, '')), '') is null
    )
  on conflict (source_key) do nothing;
  get diagnostics affected = row_count;
  inserted_count := inserted_count + affected;

  insert into outreach_tasks (
    source_call_log_id, contact_id, company_id, source_key, source_kind, task_type, channel,
    title, description, evidence_text, prospect_email, prospect_name, account_name, priority, due_at, metadata
  )
  select
    l.id, l.contact_id, l.company_id, 'call:' || l.id || ':meeting', 'call_note', 'meeting', 'phone',
    'Confirm the next conversation with ' || coalesce(nullif(l.prospect_name, ''), l.prospect_email),
    'Use the call note and account context to confirm a specific next conversation.',
    l.call_notes, l.prospect_email, l.prospect_name, l.account_name, 'high',
    greatest(l.completed_at + interval '1 day', now()),
    jsonb_build_object('outcome', l.outcome, 'call_source', l.call_source, 'rule', 'meeting language')
  from klenty_call_logs l
  where l.call_status = 'Answered'
    and coalesce(l.call_notes, '') ~* '(meeting|schedule|calendar|book(ed)?|set up a time|set a time)'
    and coalesce(l.call_notes, '') !~* '(do not call|don''t call|not to call|stop contact|not interested)'
  on conflict (source_key) do nothing;
  get diagnostics affected = row_count;
  inserted_count := inserted_count + affected;

  insert into outreach_tasks (
    source_call_log_id, contact_id, company_id, source_key, source_kind, task_type, channel,
    title, description, evidence_text, prospect_email, prospect_name, account_name, priority, due_at, metadata
  )
  select
    l.id, l.contact_id, l.company_id, 'call:' || l.id || ':referral', 'call_note', 'referral', 'email',
    'Follow up on the referral path at ' || coalesce(nullif(l.account_name, ''), 'this account'),
    'Reference the original conversation and identify the named or implied stakeholder.',
    l.call_notes, l.prospect_email, l.prospect_name, l.account_name, 'high',
    greatest(l.completed_at + interval '3 days', now() + interval '3 days'),
    jsonb_build_object('outcome', l.outcome, 'call_source', l.call_source, 'rule', 'referral language')
  from klenty_call_logs l
  where l.call_status = 'Answered'
    and coalesce(l.call_notes, '') ~* '(forward|proper lead|gave me a name|connect you|who handles|who owns)'
    and coalesce(l.call_notes, '') !~* '(do not call|don''t call|not to call|stop contact|went to voicemail)'
  on conflict (source_key) do nothing;
  get diagnostics affected = row_count;
  inserted_count := inserted_count + affected;

  insert into outreach_tasks (
    source_call_log_id, contact_id, company_id, source_key, source_kind, task_type, channel,
    title, description, evidence_text, prospect_email, prospect_name, account_name, priority, due_at, metadata
  )
  select
    l.id, l.contact_id, l.company_id, 'call:' || l.id || ':email', 'call_note', 'email', 'email',
    'Send the requested follow-up to ' || coalesce(nullif(l.prospect_name, ''), l.prospect_email),
    'Send concise information that reflects the specific topic in the call note.',
    l.call_notes, l.prospect_email, l.prospect_name, l.account_name,
    case when coalesce(l.call_notes, '') ~* '(evaluat|decision|two weeks|next week|next month)' then 'high' else 'medium' end,
    greatest(l.completed_at + interval '1 day', now()),
    jsonb_build_object('outcome', l.outcome, 'call_source', l.call_source, 'rule', 'requested email')
  from klenty_call_logs l
  where l.call_status = 'Answered'
    and coalesce(l.call_notes, '') ~* '((send|share).{0,40}(email|information|info|overview|details|case stud)|asked.{0,40}(email|send|share))'
    and coalesce(l.call_notes, '') !~* '(already sent|i''ve sent|i have sent|do not call|don''t call|not to call|stop contact)'
  on conflict (source_key) do nothing;
  get diagnostics affected = row_count;
  inserted_count := inserted_count + affected;

  insert into outreach_tasks (
    source_call_log_id, contact_id, company_id, source_key, source_kind, task_type, channel,
    title, description, evidence_text, prospect_email, prospect_name, account_name, priority, due_at, metadata
  )
  select
    l.id, l.contact_id, l.company_id, 'call:' || l.id || ':linkedin', 'call_note', 'linkedin', 'linkedin',
    'Follow up with ' || coalesce(nullif(l.prospect_name, ''), l.prospect_email) || ' on LinkedIn',
    'Use the context from this call when sending the LinkedIn message or connection request.',
    l.call_notes, l.prospect_email, l.prospect_name, l.account_name, 'medium',
    greatest(l.completed_at + interval '1 day', now()),
    jsonb_build_object('outcome', l.outcome, 'call_source', l.call_source, 'rule', 'linkedin mention')
  from klenty_call_logs l
  where l.call_status = 'Answered'
    and coalesce(l.call_notes, '') ~* 'linked[ -]?in'
    and coalesce(l.call_notes, '') !~* '(do not call|don''t call|not to call|stop contact)'
  on conflict (source_key) do nothing;
  get diagnostics affected = row_count;
  inserted_count := inserted_count + affected;

  insert into outreach_tasks (
    source_call_log_id, contact_id, company_id, source_key, source_kind, task_type, channel,
    title, description, evidence_text, prospect_email, prospect_name, account_name, priority, due_at, metadata
  )
  select
    l.id, l.contact_id, l.company_id, 'call:' || l.id || ':callback', 'call_note', 'call', 'phone',
    'Call ' || coalesce(nullif(l.prospect_name, ''), l.prospect_email) || ' back',
    'Use the original note to continue the conversation at the requested time.',
    l.call_notes, l.prospect_email, l.prospect_name, l.account_name, 'high',
    greatest(
      case
        when coalesce(l.call_notes, '') ~* 'two weeks' then l.completed_at + interval '14 days'
        when coalesce(l.call_notes, '') ~* 'next week' then l.completed_at + interval '7 days'
        when coalesce(l.call_notes, '') ~* 'next month' then l.completed_at + interval '30 days'
        else l.completed_at + interval '2 days'
      end,
      now()
    ),
    jsonb_build_object('outcome', l.outcome, 'call_source', l.call_source, 'rule', 'callback language')
  from klenty_call_logs l
  where l.call_status = 'Answered'
    and coalesce(l.call_notes, '') ~* '(call back|callback|call again|reach back|ring back)'
    and coalesce(l.call_notes, '') !~* '(do not call|don''t call|not to call|stop contact)'
  on conflict (source_key) do nothing;
  get diagnostics affected = row_count;
  inserted_count := inserted_count + affected;

  insert into outreach_tasks (
    source_call_log_id, contact_id, company_id, source_key, source_kind, task_type, channel,
    title, description, evidence_text, prospect_email, prospect_name, account_name, priority, due_at, metadata
  )
  select
    l.id, l.contact_id, l.company_id, 'call:' || l.id || ':nurture', 'call_note', 'nurture', 'general',
    'Revisit ' || coalesce(nullif(l.account_name, ''), coalesce(nullif(l.prospect_name, ''), l.prospect_email)),
    'The note contains future timing. Review the account before restarting outreach.',
    l.call_notes, l.prospect_email, l.prospect_name, l.account_name, 'low',
    case
      when coalesce(l.call_notes, '') ~* 'two weeks' then l.completed_at + interval '14 days'
      when coalesce(l.call_notes, '') ~* 'next week' then l.completed_at + interval '7 days'
      when coalesce(l.call_notes, '') ~* 'next month' then l.completed_at + interval '30 days'
      when coalesce(l.call_notes, '') ~* '(next quarter|this year)' then l.completed_at + interval '90 days'
      when coalesce(l.call_notes, '') ~* 'next year' then l.completed_at + interval '365 days'
      else null
    end,
    jsonb_build_object('outcome', l.outcome, 'call_source', l.call_source, 'rule', 'future timing')
  from klenty_call_logs l
  where l.call_status = 'Answered'
    and coalesce(l.call_notes, '') ~* '(two weeks|next week|next month|next quarter|this year|next year|future|later|few years|circle back|when they are ready)'
    and coalesce(l.call_notes, '') !~* '(do not call|don''t call|not to call|stop contact)'
    and coalesce(l.call_notes, '') !~* '(they|he|she) (will|would) reach out'
  on conflict (source_key) do nothing;
  get diagnostics affected = row_count;
  inserted_count := inserted_count + affected;

  insert into outreach_tasks (
    source_call_log_id, contact_id, company_id, source_key, source_kind, task_type, channel,
    title, description, evidence_text, prospect_email, prospect_name, account_name, priority, due_at, metadata
  )
  select
    l.id, l.contact_id, l.company_id, 'call:' || l.id || ':research', 'data_quality', 'research', 'internal',
    'Find the correct stakeholder at ' || coalesce(nullif(l.account_name, ''), 'this account'),
    'The connected person was not the correct owner and no strong referral path was recorded.',
    l.call_notes, l.prospect_email, l.prospect_name, l.account_name, 'medium', null,
    jsonb_build_object('outcome', l.outcome, 'call_source', l.call_source, 'rule', 'wrong contact')
  from klenty_call_logs l
  where l.call_status = 'Answered'
    and (coalesce(l.outcome, '') = 'Wrong contact' or coalesce(l.call_notes, '') ~* '(wrong person|wrong contact|not the right person)')
    and coalesce(l.call_notes, '') !~* '(forward|proper lead|gave me a name|connect you|who handles|who owns|wrong number|remove.{0,30}(list|contact)|left the company|not working for the company|do not call|don''t call|not to call|stop contact|disconnected|don''t need|doesn''t need|do not need|won''t recommend)'
  on conflict (source_key) do nothing;
  get diagnostics affected = row_count;
  inserted_count := inserted_count + affected;

  return inserted_count;
end;
$$;

revoke all on function public.backfill_outreach_tasks() from public;
grant execute on function public.backfill_outreach_tasks() to service_role;
