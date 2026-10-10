-- Migration: 20261010_platform_subscription_orders.sql
-- Super Console SaaS Platform: Orders, Subscriptions & Financial Management

CREATE TABLE IF NOT EXISTS public.subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  admin_email TEXT,
  admin_phone TEXT,
  plan_type TEXT NOT NULL DEFAULT 'annual',
  billing_cycle TEXT DEFAULT 'annual',
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EGP',
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payment_status TEXT NOT NULL DEFAULT 'paid',
  payment_reference TEXT,
  invoice_date DATE DEFAULT (NOW() AT TIME ZONE 'Africa/Cairo')::DATE,
  starts_at DATE,
  expires_at DATE,
  notes TEXT,
  invitation_id UUID REFERENCES public.tenant_invitations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscription_orders' AND policyname = 'Platform admins can do all on subscription_orders'
  ) THEN
    CREATE POLICY "Platform admins can do all on subscription_orders"
    ON public.subscription_orders
    FOR ALL
    USING (is_current_platform_admin())
    WITH CHECK (is_current_platform_admin());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscription_orders_tenant_id ON public.subscription_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_created_at ON public.subscription_orders(created_at DESC);
