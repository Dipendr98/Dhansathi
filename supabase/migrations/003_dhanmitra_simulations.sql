-- DhanMitra AI Simulation Tables (renamed from MiroFish)

create table if not exists public.simulations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  stock_symbol text not null,
  scenario_type text not null,
  scenario_description text,
  prediction_horizon text default '1_week',
  status text default 'pending' check (status in ('pending', 'graph_building', 'env_setup', 'simulating', 'reporting', 'completed', 'failed')),
  progress integer default 0,
  seed_data jsonb default '{}',
  prediction jsonb,
  raw_report text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.simulation_credits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  plan text default 'free',
  credits_total integer default 0,
  credits_used integer default 0,
  reset_at timestamptz default (date_trunc('month', now()) + interval '1 month'),
  updated_at timestamptz default now()
);

create table if not exists public.simulation_bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  simulation_id uuid references public.simulations(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, simulation_id)
);

-- RLS
alter table public.simulations enable row level security;
alter table public.simulation_credits enable row level security;
alter table public.simulation_bookmarks enable row level security;

create policy "Users manage own simulations" on public.simulations for all using (auth.uid() = user_id);
create policy "Users view own credits" on public.simulation_credits for select using (auth.uid() = user_id);
create policy "Users manage own bookmarks" on public.simulation_bookmarks for all using (auth.uid() = user_id);

-- Credit deduction function
create or replace function public.deduct_simulation_credit(p_user_id uuid)
returns boolean as $$
declare
  v_credits simulation_credits%rowtype;
begin
  select * into v_credits from simulation_credits where user_id = p_user_id for update;

  if not found then
    -- Auto-provision based on user plan
    insert into simulation_credits (user_id, plan, credits_total, credits_used)
    select p_user_id, coalesce(p.plan, 'free'),
      case coalesce(p.plan, 'free')
        when 'pro_plus' then 30
        else 0
      end, 0
    from profiles p where p.id = p_user_id;

    select * into v_credits from simulation_credits where user_id = p_user_id;
  end if;

  -- Reset monthly if needed
  if v_credits.reset_at < now() then
    update simulation_credits
    set credits_used = 0,
        reset_at = date_trunc('month', now()) + interval '1 month',
        updated_at = now()
    where user_id = p_user_id;
    v_credits.credits_used := 0;
  end if;

  -- Check available
  if v_credits.credits_used >= v_credits.credits_total then
    return false;
  end if;

  -- Deduct
  update simulation_credits
  set credits_used = credits_used + 1, updated_at = now()
  where user_id = p_user_id;

  return true;
end;
$$ language plpgsql security definer;

-- Indexes
create index if not exists idx_simulations_user on public.simulations(user_id, created_at desc);
create index if not exists idx_simulations_status on public.simulations(status);
