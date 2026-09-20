-- ==============================================================================
-- HumAi Security Migration: Tenant Invitations, Token Validation & Role Guards
-- ==============================================================================

-- 1. Create Tenant Invitations / Activation Tokens Table
CREATE TABLE IF NOT EXISTS public.tenant_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    email TEXT,
    role user_role NOT NULL DEFAULT 'super_admin',
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on tenant_invitations
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

-- Policies on tenant_invitations
DROP POLICY IF EXISTS "Super Admins can view invitations in their tenant" ON public.tenant_invitations;
CREATE POLICY "Super Admins can view invitations in their tenant" ON public.tenant_invitations
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Super Admins can insert invitations" ON public.tenant_invitations;
CREATE POLICY "Super Admins can insert invitations" ON public.tenant_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- 2. Secure RPC: Validate Activation Token (callable by unauthenticated clients)
CREATE OR REPLACE FUNCTION public.validate_activation_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation RECORD;
BEGIN
    IF p_token IS NULL OR trim(p_token) = '' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Missing activation token');
    END IF;

    SELECT id, company_name, email, role, is_used, expires_at
    INTO v_invitation
    FROM public.tenant_invitations
    WHERE token = trim(p_token);

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invalid activation link');
    END IF;

    IF v_invitation.is_used THEN
        RETURN jsonb_build_object('valid', false, 'error', 'This activation link has already been used');
    END IF;

    IF v_invitation.expires_at < now() THEN
        RETURN jsonb_build_object('valid', false, 'error', 'This activation link has expired');
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'company_name', v_invitation.company_name,
        'email', v_invitation.email,
        'role', v_invitation.role::text
    );
END;
$$;

-- 3. Secure RPC: Claim Activation Token (Atomically creates Tenant & binds Super Admin)
CREATE OR REPLACE FUNCTION public.claim_activation_token(
    p_token TEXT,
    p_user_id UUID,
    p_company_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation RECORD;
    v_tenant_id UUID;
    v_final_company_name TEXT;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User ID required');
    END IF;

    -- Lock invitation row for update to prevent race conditions
    SELECT id, company_name, email, role, is_used, expires_at
    INTO v_invitation
    FROM public.tenant_invitations
    WHERE token = trim(p_token)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid activation token');
    END IF;

    IF v_invitation.is_used THEN
        RETURN jsonb_build_object('success', false, 'error', 'Activation token already used');
    END IF;

    IF v_invitation.expires_at < now() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Activation token has expired');
    END IF;

    -- Verify user matches invitation email if email was specified
    IF v_invitation.email IS NOT NULL AND v_invitation.email <> '' THEN
        IF NOT EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = p_user_id AND lower(email) = lower(v_invitation.email)
        ) THEN
            RETURN jsonb_build_object('success', false, 'error', 'User email does not match invitation recipient');
        END IF;
    END IF;

    v_final_company_name := COALESCE(nullif(trim(p_company_name), ''), v_invitation.company_name);

    -- 1. Create the new Tenant
    INSERT INTO public.tenants (name, plan)
    VALUES (v_final_company_name, 'enterprise')
    RETURNING id INTO v_tenant_id;

    -- 2. Bind the user to the tenant and assign role
    INSERT INTO public.users (id, full_name, role, tenant_id)
    VALUES (
        p_user_id,
        v_final_company_name || ' Admin',
        v_invitation.role,
        v_tenant_id
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        tenant_id = v_tenant_id,
        role = v_invitation.role,
        updated_at = now();

    -- 3. Mark invitation as used
    UPDATE public.tenant_invitations
    SET 
        is_used = true,
        used_by = p_user_id,
        used_at = now()
    WHERE id = v_invitation.id;

    RETURN jsonb_build_object(
        'success', true,
        'tenant_id', v_tenant_id,
        'role', v_invitation.role::text,
        'company_name', v_final_company_name
    );
END;
$$;

-- 4. Database Trigger: Prevent Unauthorized Role Elevation
CREATE OR REPLACE FUNCTION public.check_user_role_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If role or tenant_id is being modified:
    IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id) THEN
        -- Allow if running as postgres/service_role (e.g. from claim_activation_token RPC)
        IF current_user IN ('postgres', 'service_role') THEN
            RETURN NEW;
        END IF;

        -- Must be an authenticated super_admin belonging to the same tenant
        IF NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'super_admin'
            AND tenant_id = OLD.tenant_id
        ) THEN
            RAISE EXCEPTION 'Security violation: Only an existing Super Admin of this tenant can modify user roles or tenant association.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_user_role_update ON public.users;
CREATE TRIGGER trg_check_user_role_update
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_role_update();
