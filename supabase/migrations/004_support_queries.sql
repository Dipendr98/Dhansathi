-- Support Queries table for user help requests
CREATE TABLE IF NOT EXISTS public.support_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;

-- Users can read their own queries
CREATE POLICY "Users can view own queries" ON public.support_queries
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own queries
CREATE POLICY "Users can create queries" ON public.support_queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role (admin) can do everything - handled by service key