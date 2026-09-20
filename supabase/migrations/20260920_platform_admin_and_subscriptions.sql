-- ==============================================================================
-- HumAi Platform Owner Super Console & Subscription Management Migration
-- ==============================================================================

-- 1. Add Platform Admin Flag to Users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT false;

-- 2. Add Subscription Management Columns to Tenants
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'expired')),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'annual' CHECK (subscription_plan IN ('monthly', 'semi_annual', 'annual', 'enterprise', 'custom')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 year'),
ADD COLUMN IF NOT EXISTS max_employees INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- 3. Extend Tenant Invitations for Offline & Online Payment Tracking
ALTER TABLE public.tenant_invitations
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'annual',
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'offline',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. RLS Policy: Platform Admins have full access across all tenants and tables
DROP POLICY IF EXISTS "Platform Admins can view all tenants" ON public.tenants;
CREATE POLICY "Platform Admins can view all tenants" ON public.tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND is_platform_admin = true
        )
    );

DROP POLICY IF EXISTS "Platform Admins can view all users" ON public.users;
CREATE POLICY "Platform Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND is_platform_admin = true
        )
    );

DROP POLICY IF EXISTS "Platform Admins can manage all invitations" ON public.tenant_invitations;
CREATE POLICY "Platform Admins can manage all invitations" ON public.tenant_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND is_platform_admin = true
        )
    );

-- 5. RPC: Get Platform-Wide Analytics & Metrics (Callable by Platform Admins)
CREATE OR REPLACE FUNCTION public.get_platform_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_platform_admin BOOLEAN;
    v_total_tenants INT;
    v_total_users INT;
    v_pending_invitations INT;
    v_total_annual INT;
    v_total_monthly INT;
    v_total_revenue NUMERIC;
BEGIN
    -- Verify caller is a platform admin
    SELECT is_platform_admin INTO v_is_platform_admin
    FROM public.users
    WHERE id = auth.uid();

    IF v_is_platform_admin IS NOT TRUE THEN
        RETURN jsonb_build_object('error', 'Unauthorized. Platform Admin privileges required.');
    END IF;

    -- Aggregate platform stats
    SELECT count(*) INTO v_total_tenants FROM public.tenants;
    SELECT count(*) INTO v_total_users FROM public.users;
    SELECT count(*) INTO v_pending_invitations FROM public.tenant_invitations WHERE is_used = false AND expires_at > now();
    SELECT count(*) INTO v_total_annual FROM public.tenants WHERE subscription_plan = 'annual';
    SELECT count(*) INTO v_total_monthly FROM public.tenants WHERE subscription_plan = 'monthly';
    SELECT coalesce(sum(amount_paid), 0) INTO v_total_revenue FROM public.tenant_invitations WHERE amount_paid > 0;

    RETURN jsonb_build_object(
        'total_tenants', v_total_tenants,
        'total_users', v_total_users,
        'pending_invitations', v_pending_invitations,
        'total_annual', v_total_annual,
        'total_monthly', v_total_monthly,
        'total_revenue', v_total_revenue
    );
END;
$$;

-- 6. RPC: Generate Client Invitation (for Offline & Direct Onboarding)
CREATE OR REPLACE FUNCTION public.generate_client_invitation(
    p_company_name TEXT,
    p_email TEXT,
    p_plan_type TEXT DEFAULT 'annual',
    p_amount_paid NUMERIC DEFAULT 0,
    p_payment_method TEXT DEFAULT 'offline',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_platform_admin BOOLEAN;
    v_token TEXT;
    v_invitation_id UUID;
BEGIN
    -- Verify caller is platform admin or super admin
    SELECT is_platform_admin INTO v_is_platform_admin
    FROM public.users
    WHERE id = auth.uid();

    IF v_is_platform_admin IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized. Platform Admin privileges required.');
    END IF;

    IF p_company_name IS NULL OR trim(p_company_name) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Company name is required');
    END IF;

    -- Generate a secure 64-character hexadecimal token
    v_token := encode(gen_random_bytes(32), 'hex');

    INSERT INTO public.tenant_invitations (
        token,
        company_name,
        email,
        role,
        is_used,
        expires_at,
        created_by,
        plan_type,
        amount_paid,
        payment_method,
        notes
    )
    VALUES (
        v_token,
        trim(p_company_name),
        trim(p_email),
        'super_admin',
        false,
        now() + INTERVAL '14 days',
        auth.uid(),
        p_plan_type,
        COALESCE(p_amount_paid, 0),
        COALESCE(p_payment_method, 'offline'),
        p_notes
    )
    RETURNING id INTO v_invitation_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_invitation_id,
        'token', v_token,
        'company_name', trim(p_company_name),
        'email', trim(p_email),
        'expires_at', (now() + INTERVAL '14 days')
    );
END;
$$;
