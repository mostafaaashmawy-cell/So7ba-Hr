-- ============================================================================
-- MIGRATION: 20260828_part1_operations_and_risk.sql
-- Description: Complete Part 1 - Multi-level adjustment approvals, tenant advance budget,
--              night shift allowance, split shifts, and rotational rosters.
-- ============================================================================

-- 1. Tenant-Level Monthly Advance Liability Budget
ALTER TABLE public.tenant_settings
ADD COLUMN IF NOT EXISTS max_monthly_tenant_advance_budget NUMERIC(12,2) DEFAULT 0;

-- 2. Shifts Enhancements: Night Allowance, Split Shifts, Break Deduction, Rotational Rosters
ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS night_shift_allowance NUMERIC(10,2) DEFAULT 0;

ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS is_split BOOLEAN DEFAULT false;

ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS split_start_time_2 TEXT DEFAULT NULL;

ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS split_end_time_2 TEXT DEFAULT NULL;

ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS break_minutes INTEGER DEFAULT 0;

ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS work_days JSONB DEFAULT '["Sunday","Monday","Tuesday","Wednesday","Thursday"]'::jsonb;

ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS roster_type TEXT DEFAULT 'fixed';

ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS roster_week_b_days JSONB DEFAULT '["Sunday","Monday","Tuesday","Wednesday","Thursday"]'::jsonb;

-- 3. Financial Adjustments Multi-Level Approval Fields
ALTER TABLE public.financial_adjustments
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE public.financial_adjustments
ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;

ALTER TABLE public.financial_adjustments
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.financial_adjustments
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ DEFAULT NULL;

-- 4. Update request_salary_advance RPC with Tenant-Level Budget Check
CREATE OR REPLACE FUNCTION public.request_salary_advance(
    p_amount NUMERIC,
    p_month  DATE,
    p_notes  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id             UUID := auth.uid();
    v_tenant_id           UUID;
    v_basic_salary        NUMERIC;
    v_settings            RECORD;
    v_max_pct             INTEGER;
    v_max_allowed         NUMERIC;
    v_existing_user_sum   NUMERIC;
    v_existing_tenant_sum NUMERIC;
    v_tenant_budget       NUMERIC;
    v_new_id              UUID;
BEGIN
    SELECT tenant_id, basic_salary INTO v_tenant_id, v_basic_salary
    FROM public.users WHERE id = v_user_id;

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User has no assigned tenant.');
    END IF;

    SELECT * INTO v_settings FROM public.tenant_settings WHERE tenant_id = v_tenant_id;
    
    -- Check individual employee cap
    v_max_pct := COALESCE(v_settings.max_advance_percentage, 50);
    v_max_allowed := ROUND(COALESCE(v_basic_salary, 0) * (v_max_pct::NUMERIC / 100.0), 2);

    SELECT COALESCE(SUM(amount), 0) INTO v_existing_user_sum
    FROM public.advances
    WHERE user_id = v_user_id 
      AND tenant_id = v_tenant_id 
      AND month = p_month
      AND status IN ('pending', 'approved');

    IF (v_existing_user_sum + p_amount) > v_max_allowed THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Requested amount exceeds your individual monthly limit (%s EGP). Remaining available: %s EGP',
                            v_max_allowed, GREATEST(0, v_max_allowed - v_existing_user_sum))
        );
    END IF;

    -- Check tenant-level monthly liability budget (if configured > 0)
    v_tenant_budget := COALESCE(v_settings.max_monthly_tenant_advance_budget, 0);
    IF v_tenant_budget > 0 THEN
        SELECT COALESCE(SUM(amount), 0) INTO v_existing_tenant_sum
        FROM public.advances
        WHERE tenant_id = v_tenant_id 
          AND month = p_month
          AND status IN ('pending', 'approved');

        IF (v_existing_tenant_sum + p_amount) > v_tenant_budget THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', format('Company-wide monthly advance budget (%s EGP) reached. Remaining company budget: %s EGP',
                                v_tenant_budget, GREATEST(0, v_tenant_budget - v_existing_tenant_sum))
            );
        END IF;
    END IF;

    INSERT INTO public.advances (tenant_id, user_id, amount, month, status, notes)
    VALUES (v_tenant_id, v_user_id, p_amount, p_month, 'pending', p_notes)
    RETURNING id INTO v_new_id;

    INSERT INTO public.system_audit_logs (tenant_id, actor_id, action_type, entity_name, entity_id, details)
    VALUES (v_tenant_id, v_user_id, 'REQUEST_ADVANCE', 'advances', v_new_id::TEXT,
            jsonb_build_object('amount', p_amount, 'month', p_month, 'notes', p_notes));

    RETURN jsonb_build_object('success', true, 'advance_id', v_new_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
