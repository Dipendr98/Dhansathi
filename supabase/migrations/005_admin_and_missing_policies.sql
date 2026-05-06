-- ===== ADMIN USERS TABLE =====
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can view their own record
CREATE POLICY "Admins can view own record" ON public.admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- ===== HELPER FUNCTION: is_admin() =====
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ===== MISSING USER POLICIES =====

-- Profiles: allow INSERT for new users
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Notifications: user can insert/delete own
CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: users can insert/update own
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Payments: users can insert own
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scheme matches: users can update own
CREATE POLICY "Users can update own matches" ON public.scheme_matches
  FOR UPDATE USING (auth.uid() = user_id);

-- Simulation credits: users can insert/update own
CREATE POLICY "Users can update own credits" ON public.simulation_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON public.simulation_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support queries: users can update own
CREATE POLICY "Users can update own queries" ON public.support_queries
  FOR UPDATE USING (auth.uid() = user_id);

-- ===== ADMIN POLICIES (admins can do everything) =====

CREATE POLICY "Admin full access profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access schemes" ON public.government_schemes
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin read all matches" ON public.scheme_matches
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin full access subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access payments" ON public.payments
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access notifications" ON public.notifications
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin read all simulations" ON public.simulations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin read all credits" ON public.simulation_credits
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin read all alerts" ON public.stock_alerts
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin read all watchlists" ON public.stock_watchlist
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin full access support_queries" ON public.support_queries
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin can view all admins" ON public.admin_users
  FOR SELECT USING (public.is_admin());