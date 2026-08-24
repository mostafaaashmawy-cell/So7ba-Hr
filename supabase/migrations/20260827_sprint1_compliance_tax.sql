-- ============================================================================
-- MIGRATION: 20260827_sprint1_compliance_tax.sql
-- Description: Sprint 1 - Income Tax Engine, Annual Leave Allowance, and Financial Guardrails
-- ============================================================================

-- 1. Add enable_income_tax to tenant_settings
ALTER TABLE public.tenant_settings 
ADD COLUMN IF NOT EXISTS enable_income_tax BOOLEAN NOT NULL DEFAULT false;

-- 2. Add income_tax_rate & annual_leave_allowance to users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS income_tax_rate NUMERIC(5,2) DEFAULT 0;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS annual_leave_allowance INTEGER DEFAULT 21;

-- 3. Create helper RPC to validate and submit salary advances atomically
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
    v_user_id       UUID := auth.uid();
    v_tenant_id     UUID;
    v_basic_salary  NUMERIC;
    v_settings      RECORD;
    v_max_pct       INTEGER;
    v_max_allowed   NUMERIC;
    v_existing_sum  NUMERIC;
    v_new_id        UUID;
BEGIN
    SELECT tenant_id, basic_salary INTO v_tenant_id, v_basic_salary
    FROM public.users WHERE id = v_user_id;

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User has no assigned tenant.');
    END IF;

    SELECT * INTO v_settings FROM public.tenant_settings WHERE tenant_id = v_tenant_id;
    
    v_max_pct := COALESCE(v_settings.max_advance_percentage, 50);
    v_max_allowed := ROUND(COALESCE(v_basic_salary, 0) * (v_max_pct::NUMERIC / 100.0), 2);

    -- Calculate total already requested/approved advances in the given month
    SELECT COALESCE(SUM(amount), 0) INTO v_existing_sum
    FROM public.advances
    WHERE user_id = v_user_id 
      AND tenant_id = v_tenant_id 
      AND month = p_month
      AND status IN ('pending', 'approved');

    IF (v_existing_sum + p_amount) > v_max_allowed THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Requested amount exceeds monthly advance limit. Max allowed: %s EGP, Already requested: %s EGP, Remaining: %s EGP',
                            v_max_allowed, v_existing_sum, GREATEST(0, v_max_allowed - v_existing_sum))
        );
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

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
