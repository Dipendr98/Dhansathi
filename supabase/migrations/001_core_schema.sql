-- DhanSathi Core Schema
-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ===== PROFILES =====
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  date_of_birth date,
  gender text check (gender in ('Male', 'Female', 'Other')),
  marital_status text,
  state text,
  district text,
  pincode text,
  occupation text,
  annual_income integer,
  category text check (category in ('General', 'OBC', 'SC', 'ST', 'EWS')),
  is_bpl boolean default false,
  has_disability boolean default false,
  phone text,
  plan text default 'free' check (plan in ('free', 'pro', 'pro_plus')),
  plan_expiry timestamptz,
  is_annual boolean default false,
  onboarding_complete boolean default false,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== GOVERNMENT SCHEMES =====
create table if not exists public.government_schemes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_hi text,
  description text,
  ministry text,
  scheme_type text,
  benefit_amount text,
  eligibility_criteria jsonb default '{}',
  documents_required text[] default '{}',
  application_url text,
  is_active boolean default true,
  is_verified boolean default false,
  verified_at timestamptz,
  deadline timestamptz,
  states text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== SCHEME MATCHES =====
create table if not exists public.scheme_matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  scheme_id uuid references public.government_schemes(id) on delete cascade,
  match_score integer,
  matched_criteria text[] default '{}',
  missed_criteria text[] default '{}',
  status text default 'matched' check (status in ('matched', 'applied', 'approved', 'rejected', 'expired')),
  applied_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, scheme_id)
);

-- ===== STOCK MASTER =====
create table if not exists public.stock_master (
  symbol text primary key,
  company_name text not null,
  sector text,
  industry text,
  market_cap numeric,
  is_nifty50 boolean default false,
  is_nifty_next50 boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ===== STOCK DAILY DATA =====
create table if not exists public.stock_daily_data (
  id uuid default uuid_generate_v4() primary key,
  symbol text references public.stock_master(symbol) on delete cascade,
  date date not null,
  open_price numeric,
  high_price numeric,
  low_price numeric,
  close_price numeric,
  volume bigint,
  delivery_qty bigint,
  delivery_pct numeric,
  created_at timestamptz default now(),
  unique(symbol, date)
);

-- ===== STOCK INDICATORS =====
create table if not exists public.stock_indicators (
  id uuid default uuid_generate_v4() primary key,
  symbol text references public.stock_master(symbol) on delete cascade,
  date date not null,
  rsi_14 numeric,
  sma_20 numeric,
  sma_50 numeric,
  sma_200 numeric,
  ema_12 numeric,
  ema_26 numeric,
  macd numeric,
  macd_signal numeric,
  bollinger_upper numeric,
  bollinger_lower numeric,
  atr_14 numeric,
  high_52w numeric,
  low_52w numeric,
  signal text check (signal in ('strong_buy', 'buy', 'neutral', 'sell', 'strong_sell', 'oversold', 'overbought')),
  created_at timestamptz default now(),
  unique(symbol, date)
);

-- ===== STOCK WATCHLIST =====
create table if not exists public.stock_watchlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  symbol text references public.stock_master(symbol) on delete cascade,
  added_at timestamptz default now(),
  unique(user_id, symbol)
);

-- ===== STOCK ALERTS =====
create table if not exists public.stock_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  symbol text references public.stock_master(symbol) on delete cascade,
  alert_type text not null check (alert_type in ('price_above', 'price_below', 'rsi_above', 'rsi_below', 'volume_spike', 'delivery_above')),
  threshold numeric not null,
  is_triggered boolean default false,
  triggered_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ===== NOTIFICATIONS =====
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text,
  type text default 'info' check (type in ('info', 'success', 'warning', 'error', 'alert', 'scheme', 'stock')),
  is_read boolean default false,
  action_url text,
  created_at timestamptz default now()
);

-- ===== SUBSCRIPTIONS =====
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('free', 'pro', 'pro_plus')),
  status text default 'active' check (status in ('active', 'cancelled', 'expired', 'past_due')),
  razorpay_subscription_id text,
  razorpay_payment_id text,
  amount integer,
  currency text default 'INR',
  is_annual boolean default false,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now()
);

-- ===== PAYMENTS =====
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id),
  razorpay_payment_id text,
  amount integer not null,
  currency text default 'INR',
  status text default 'captured' check (status in ('created', 'captured', 'failed', 'refunded')),
  method text,
  created_at timestamptz default now()
);

-- ===== RLS POLICIES =====
alter table public.profiles enable row level security;
alter table public.scheme_matches enable row level security;
alter table public.stock_watchlist enable row level security;
alter table public.stock_alerts enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Scheme matches: users can view their own
create policy "Users can view own matches" on public.scheme_matches for select using (auth.uid() = user_id);
create policy "Users can insert own matches" on public.scheme_matches for insert with check (auth.uid() = user_id);

-- Government schemes: public read
alter table public.government_schemes enable row level security;
create policy "Anyone can view active schemes" on public.government_schemes for select using (is_active = true);

-- Stock data: public read
alter table public.stock_master enable row level security;
alter table public.stock_daily_data enable row level security;
alter table public.stock_indicators enable row level security;
create policy "Anyone can view stocks" on public.stock_master for select using (true);
create policy "Anyone can view stock data" on public.stock_daily_data for select using (true);
create policy "Anyone can view indicators" on public.stock_indicators for select using (true);

-- Watchlist: users own
create policy "Users manage own watchlist" on public.stock_watchlist for all using (auth.uid() = user_id);

-- Alerts: users own
create policy "Users manage own alerts" on public.stock_alerts for all using (auth.uid() = user_id);

-- Notifications: users own
create policy "Users view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Subscriptions: users view own
create policy "Users view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

-- Payments: users view own
create policy "Users view own payments" on public.payments for select using (auth.uid() = user_id);

-- ===== AUTO CREATE PROFILE ON SIGNUP =====
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===== INDEXES =====
create index if not exists idx_scheme_matches_user on public.scheme_matches(user_id);
create index if not exists idx_stock_daily_symbol_date on public.stock_daily_data(symbol, date desc);
create index if not exists idx_stock_indicators_symbol on public.stock_indicators(symbol, date desc);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_payments_user on public.payments(user_id);
