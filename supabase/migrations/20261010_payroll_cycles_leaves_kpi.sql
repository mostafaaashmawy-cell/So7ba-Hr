-- Migration: Add payroll financial cycle configuration, payroll records table, leave subtypes and approval trail, and kpi tenant trigger

-- 1. Add leave_sub_type and approval_trail to leaves_permissions
ALTER TABLE public.leaves_permissions 
ADD COLUMN IF NOT EXISTS leave_sub_type TEXT DEFAULT 'annual';

ALTER TABLE public.leaves_permissions 
ADD COLUMN IF NOT EXISTS approval_trail JSONB DEFAULT '[]'::jsonb;

-- 2. Add payroll financial cycle configuration to tenant_settings
ALTER TABLE public.tenant_settings 
ADD COLUMN IF NOT EXISTS payroll_cycle_start_day INTEGER DEFAULT 1;

ALTER TABLE public.tenant_settings 
ADD COLUMN IF NOT EXISTS payroll_cycle_type TEXT DEFAULT 'calendar_month';

-- 3. Set default and trigger for kpi_entries tenant_id
ALTER TABLE public.kpi_entries 
ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();

CREATE OR REPLACE FUNCTION public.set_kpi_entry_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := public.auth_tenant_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_kpi_entry_tenant_id'
    ) THEN
        CREATE TRIGGER trg_set_kpi_entry_tenant_id
        BEFORE INSERT ON public.kpi_entries
        FOR EACH ROW
        EXECUTE FUNCTION public.set_kpi_entry_tenant_id();
    END IF;
END $$;

-- 4. Create payroll_records table
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    cycle_start_date DATE NOT NULL,
    cycle_end_date DATE NOT NULL,
    basic_salary NUMERIC NOT NULL DEFAULT 0,
    gross_earnings NUMERIC NOT NULL DEFAULT 0,
    total_deductions NUMERIC NOT NULL DEFAULT 0,
    net_salary NUMERIC NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    payment_method TEXT DEFAULT 'bank_transfer',
    paid_at TIMESTAMPTZ,
    paid_by UUID REFERENCES public.users(id),
    commission_total NUMERIC DEFAULT 0,
    commission_paid NUMERIC DEFAULT 0,
    commission_deferred NUMERIC DEFAULT 0,
    deferred_notes TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_tenant_user_month UNIQUE(tenant_id, user_id, month)
);

CREATE OR REPLACE TRIGGER set_payroll_records_updated_at
BEFORE UPDATE ON public.payroll_records
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payroll_records' 
        AND policyname = 'Payroll records: select scope'
    ) THEN
        CREATE POLICY "Payroll records: select scope" 
        ON public.payroll_records FOR SELECT TO authenticated 
        USING (
            tenant_id = public.auth_tenant_id() 
            AND (
                user_id = auth.uid() 
                OR public.auth_user_role() IN ('manager', 'super_admin')
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payroll_records' 
        AND policyname = 'Payroll records: manage by admin'
    ) THEN
        CREATE POLICY "Payroll records: manage by admin" 
        ON public.payroll_records FOR ALL TO authenticated 
        USING (
            tenant_id = public.auth_tenant_id() 
            AND public.auth_user_role() = 'super_admin'
        )
        WITH CHECK (
            tenant_id = public.auth_tenant_id() 
            AND public.auth_user_role() = 'super_admin'
        );
    END IF;
END $$;
