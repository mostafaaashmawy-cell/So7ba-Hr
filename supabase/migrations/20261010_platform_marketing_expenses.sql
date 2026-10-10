-- Migration: Create platform_marketing_expenses table for SaaS Ad Spend & Marketing P&L
CREATE TABLE IF NOT EXISTS public.platform_marketing_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel TEXT NOT NULL CHECK (channel IN ('meta', 'google', 'tiktok', 'linkedin', 'twitter', 'offline', 'other')),
    campaign_name TEXT,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'EGP',
    date_spent DATE NOT NULL DEFAULT CURRENT_DATE,
    period_month TEXT NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER set_platform_marketing_expenses_updated_at
BEFORE UPDATE ON public.platform_marketing_expenses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.platform_marketing_expenses ENABLE ROW LEVEL SECURITY;

-- Restrict to Platform Admins
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'platform_marketing_expenses' 
        AND policyname = 'Platform admins can manage marketing expenses'
    ) THEN
        CREATE POLICY "Platform admins can manage marketing expenses" 
        ON public.platform_marketing_expenses 
        FOR ALL TO authenticated 
        USING (public.is_current_platform_admin())
        WITH CHECK (public.is_current_platform_admin());
    END IF;
END $$;
