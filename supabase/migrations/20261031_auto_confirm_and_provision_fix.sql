-- Migration: Ensure email_confirmed_at is always set when provisioning employees
-- and retroactively confirm all existing users in auth.users

UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

CREATE OR REPLACE FUNCTION public.admin_provision_employee(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_role TEXT DEFAULT 'employee',
    p_user_id UUID DEFAULT NULL,
    p_profile_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_caller_id UUID;
    v_caller_role TEXT;
    v_caller_tenant_id UUID;
    v_caller_is_platform_admin BOOLEAN;
    v_target_user_id UUID;
    v_target_tenant_id UUID;
    v_enc_pass TEXT;
    v_clean_email TEXT;
    v_exists_in_auth BOOLEAN;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: User not authenticated');
    END IF;

    SELECT role::text, tenant_id, is_platform_admin INTO v_caller_role, v_caller_tenant_id, v_caller_is_platform_admin
    FROM public.users
    WHERE id = v_caller_id;

    IF v_caller_role NOT IN ('super_admin') AND NOT COALESCE(v_caller_is_platform_admin, false) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Permission denied: Super Admin role required');
    END IF;

    v_clean_email := lower(trim(p_email));
    IF v_clean_email IS NULL OR v_clean_email = '' OR position('@' in v_clean_email) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Valid email address is required for employee login credentials');
    END IF;

    IF p_password IS NOT NULL AND length(trim(p_password)) < 6 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Password must be at least 6 characters long');
    END IF;

    -- Determine target user and target tenant
    v_target_user_id := p_user_id;

    IF v_target_user_id IS NOT NULL THEN
        SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = v_target_user_id) INTO v_exists_in_auth;
        SELECT COALESCE(NULLIF(p_profile_data->>'tenant_id', '')::uuid, v_caller_tenant_id, tenant_id)
        INTO v_target_tenant_id
        FROM public.users WHERE id = v_target_user_id;
    ELSE
        SELECT id INTO v_target_user_id FROM auth.users WHERE lower(email) = v_clean_email;
        v_exists_in_auth := (v_target_user_id IS NOT NULL);
        v_target_tenant_id := COALESCE(NULLIF(p_profile_data->>'tenant_id', '')::uuid, v_caller_tenant_id);
    END IF;

    IF v_exists_in_auth THEN
        -- Check if new email is used by another user
        IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = v_clean_email AND id <> v_target_user_id) THEN
            RETURN jsonb_build_object('success', false, 'error', 'This email is already in use by another account');
        END IF;

        -- UPDATE existing user credentials in auth.users and ensure email is confirmed
        IF p_password IS NOT NULL AND trim(p_password) <> '' THEN
            v_enc_pass := extensions.crypt(trim(p_password), extensions.gen_salt('bf'));
            UPDATE auth.users
            SET encrypted_password = v_enc_pass,
                email = v_clean_email,
                email_confirmed_at = COALESCE(email_confirmed_at, now()),
                raw_user_meta_data = jsonb_build_object('full_name', p_full_name, 'role', p_role),
                updated_at = now()
            WHERE id = v_target_user_id;
        ELSE
            UPDATE auth.users
            SET email = v_clean_email,
                email_confirmed_at = COALESCE(email_confirmed_at, now()),
                raw_user_meta_data = jsonb_build_object('full_name', p_full_name, 'role', p_role),
                updated_at = now()
            WHERE id = v_target_user_id;
        END IF;

        -- UPDATE or INSERT into auth.identities
        IF EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_target_user_id) THEN
            UPDATE auth.identities
            SET identity_data = jsonb_build_object('sub', v_target_user_id::text, 'email', v_clean_email, 'full_name', p_full_name),
                updated_at = now()
            WHERE user_id = v_target_user_id;
        ELSE
            INSERT INTO auth.identities (
                id,
                provider_id,
                user_id,
                identity_data,
                provider,
                last_sign_in_at,
                created_at,
                updated_at
            )
            VALUES (
                gen_random_uuid(),
                v_target_user_id::text,
                v_target_user_id,
                jsonb_build_object('sub', v_target_user_id::text, 'email', v_clean_email, 'full_name', p_full_name),
                'email',
                now(),
                now(),
                now()
            );
        END IF;

    ELSE
        -- CREATE new user in auth.users
        IF p_password IS NULL OR trim(p_password) = '' THEN
            RETURN jsonb_build_object('success', false, 'error', 'Password is required to create new login credentials');
        END IF;

        IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = v_clean_email) THEN
            RETURN jsonb_build_object('success', false, 'error', 'An account with this email already exists');
        END IF;

        v_target_user_id := COALESCE(p_user_id, gen_random_uuid());
        v_enc_pass := extensions.crypt(trim(p_password), extensions.gen_salt('bf', 10));

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change,
            email_change_token_current,
            phone_change,
            phone_change_token,
            reauthentication_token,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_target_user_id,
            'authenticated',
            'authenticated',
            v_clean_email,
            v_enc_pass,
            now(),
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object('full_name', p_full_name, 'role', p_role),
            now(),
            now()
        );

        INSERT INTO auth.identities (
            id,
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        )
        VALUES (
            gen_random_uuid(),
            v_target_user_id::text,
            v_target_user_id,
            jsonb_build_object('sub', v_target_user_id::text, 'email', v_clean_email, 'full_name', p_full_name),
            'email',
            now(),
            now(),
            now()
        );
    END IF;

    -- UPSERT Profile into public.users
    INSERT INTO public.users (
        id,
        tenant_id,
        email,
        full_name,
        role,
        department_id,
        job_title,
        basic_salary,
        kpi_unit,
        mobile,
        national_id,
        created_at,
        updated_at
    )
    VALUES (
        v_target_user_id,
        v_target_tenant_id,
        v_clean_email,
        p_full_name,
        COALESCE(p_role, 'employee'),
        NULLIF(p_profile_data->>'department_id', '')::uuid,
        p_profile_data->>'job_title',
        COALESCE((p_profile_data->>'basic_salary')::numeric, 0),
        COALESCE(p_profile_data->>'kpi_unit', 'tasks'),
        p_profile_data->>'mobile',
        p_profile_data->>'national_id',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department_id = COALESCE(EXCLUDED.department_id, public.users.department_id),
        job_title = COALESCE(EXCLUDED.job_title, public.users.job_title),
        basic_salary = COALESCE(EXCLUDED.basic_salary, public.users.basic_salary),
        kpi_unit = COALESCE(EXCLUDED.kpi_unit, public.users.kpi_unit),
        mobile = COALESCE(EXCLUDED.mobile, public.users.mobile),
        national_id = COALESCE(EXCLUDED.national_id, public.users.national_id),
        updated_at = now();

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_target_user_id,
        'email', v_clean_email
    );
END;
$$;
