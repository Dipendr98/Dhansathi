create table if not exists public.scholarships_feed (
  id text primary key,
  name text not null,
  provider text not null,
  department text not null,
  education_levels jsonb not null default '[]'::jsonb,
  target_groups jsonb not null default '[]'::jsonb,
  benefits text not null,
  eligibility text not null,
  documents_required jsonb not null default '[]'::jsonb,
  application_url text not null,
  portal text not null,
  source text not null,
  source_url text not null,
  specifications_url text,
  faq_url text,
  schemeOpenDate date,
  studentApplicationCloseDate date,
  deadline_hint text not null,
  status text not null,
  state text,
  university text,
  programs jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default now()
);

alter table public.scholarships_feed enable row level security;

create policy "Enable read access for all users"
  on public.scholarships_feed for select
  using (true);

create policy "Enable all access for service role only"
  on public.scholarships_feed for all
  using (auth.jwt() ->> 'role' = 'service_role');
