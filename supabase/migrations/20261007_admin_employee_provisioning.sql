-- Migration: 20261007_admin_employee_provisioning.sql
-- Enables Super Admins to provision employee login accounts (email & password)
-- and synchronizes email column to public.users

-- 1. Ensure email column exists on public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE public.users u SET email = au.email FROM auth.users au WHERE u.id = au.id;

-- 2. Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, role, basic_salary, kpi_unit, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'employee'::user_role,
        COALESCE((NEW.raw_user_meta_data->>'basic_salary')::NUMERIC, 5000.00),
        COALESCE(NEW.raw_user_meta_data->>'kpi_unit', 'tasks'),
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Super Admin RPC to provision employee login credentials
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

        -- UPDATE existing user credentials in auth.users
        IF p_password IS NOT NULL AND trim(p_password) <> '' THEN
            v_enc_pass := extensions.crypt(trim(p_password), extensions.gen_salt('bf'));
            UPDATE auth.users
            SET encrypted_password = v_enc_pass,
                email = v_clean_email,
                raw_user_meta_data = jsonb_build_object('full_name', p_full_name, 'role', p_role),
                updated_at = now()
            WHERE id = v_target_user_id;
        ELSE
            UPDATE auth.users
            SET email = v_clean_email,
                raw_user_meta_data = jsonb_build_object('full_name', p_full_name, 'role', p_role),
                updated_at = now()
            WHERE id = v_target_user_id;
        END IF;

        -- UPDATE or INSERT into auth.identities (NOTE: email column is ALWAYS GENERATED, do not update it directly)
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
        v_enc_pass := extensions.crypt(trim(p_password), extensions.gen_salt('bf'));

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
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

    -- Upsert profile into public.users
    INSERT INTO public.users (
        id,
        tenant_id,
        full_name,
        email,
        role,
        mobile,
        national_id,
        job_title,
        department_id,
        manager_id,
        basic_salary,
        shift_id,
        contract_type,
        probation_period,
        hire_date,
        annual_leave_allowance,
        payout_method,
        bank_name,
        bank_account_number,
        iban,
        wallet_phone_number,
        instapay_handle,
        fawry_mobile_number,
        is_remote,
        is_flexible,
        required_daily_hours,
        commission_rate,
        income_tax_rate,
        social_insurance,
        health_insurance,
        insurance_number,
        address,
        qualification,
        age,
        birth_date,
        id_expiry_date,
        emergency_contact_phone,
        emergency_contact_relation,
        military_status,
        updated_at
    )
    VALUES (
        v_target_user_id,
        v_target_tenant_id,
        p_full_name,
        v_clean_email,
        p_role::user_role,
        p_profile_data->>'mobile',
        p_profile_data->>'national_id',
        p_profile_data->>'job_title',
        NULLIF(p_profile_data->>'department_id', '')::uuid,
        NULLIF(p_profile_data->>'manager_id', '')::uuid,
        COALESCE((p_profile_data->>'basic_salary')::numeric, 0),
        NULLIF(p_profile_data->>'shift_id', '')::uuid,
        COALESCE(p_profile_data->>'contract_type', 'Full-Time'),
        COALESCE((p_profile_data->>'probation_period')::integer, 3),
        NULLIF(p_profile_data->>'hire_date', '')::date,
        COALESCE((p_profile_data->>'annual_leave_allowance')::integer, 21),
        COALESCE(p_profile_data->>'payout_method', 'cash'),
        p_profile_data->>'bank_name',
        p_profile_data->>'bank_account_number',
        p_profile_data->>'iban',
        p_profile_data->>'wallet_phone_number',
        p_profile_data->>'instapay_handle',
        p_profile_data->>'fawry_mobile_number',
        COALESCE((p_profile_data->>'is_remote')::boolean, false),
        COALESCE((p_profile_data->>'is_flexible')::boolean, false),
        COALESCE((p_profile_data->>'required_daily_hours')::numeric, 8),
        COALESCE((p_profile_data->>'commission_rate')::numeric, 0),
        COALESCE((p_profile_data->>'income_tax_rate')::numeric, 0),
        COALESCE((p_profile_data->>'social_insurance')::numeric, 0),
        COALESCE((p_profile_data->>'health_insurance')::numeric, 0),
        p_profile_data->>'insurance_number',
        p_profile_data->>'address',
        p_profile_data->>'qualification',
        NULLIF(p_profile_data->>'age', '')::integer,
        NULLIF(p_profile_data->>'birth_date', '')::date,
        NULLIF(p_profile_data->>'id_expiry_date', '')::date,
        p_profile_data->>'emergency_contact_phone',
        p_profile_data->>'emergency_contact_relation',
        COALESCE(p_profile_data->>'military_status', 'not_applicable'),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        mobile = EXCLUDED.mobile,
        national_id = EXCLUDED.national_id,
        job_title = EXCLUDED.job_title,
        department_id = EXCLUDED.department_id,
        manager_id = EXCLUDED.manager_id,
        basic_salary = EXCLUDED.basic_salary,
        shift_id = EXCLUDED.shift_id,
        contract_type = EXCLUDED.contract_type,
        probation_period = EXCLUDED.probation_period,
        hire_date = EXCLUDED.hire_date,
        annual_leave_allowance = EXCLUDED.annual_leave_allowance,
        payout_method = EXCLUDED.payout_method,
        bank_name = EXCLUDED.bank_name,
        bank_account_number = EXCLUDED.bank_account_number,
        iban = EXCLUDED.iban,
        wallet_phone_number = EXCLUDED.wallet_phone_number,
        instapay_handle = EXCLUDED.instapay_handle,
        fawry_mobile_number = EXCLUDED.fawry_mobile_number,
        is_remote = EXCLUDED.is_remote,
        is_flexible = EXCLUDED.is_flexible,
        required_daily_hours = EXCLUDED.required_daily_hours,
        commission_rate = EXCLUDED.commission_rate,
        income_tax_rate = EXCLUDED.income_tax_rate,
        social_insurance = EXCLUDED.social_insurance,
        health_insurance = EXCLUDED.health_insurance,
        insurance_number = EXCLUDED.insurance_number,
        address = EXCLUDED.address,
        qualification = EXCLUDED.qualification,
        age = EXCLUDED.age,
        birth_date = EXCLUDED.birth_date,
        id_expiry_date = EXCLUDED.id_expiry_date,
        emergency_contact_phone = EXCLUDED.emergency_contact_phone,
        emergency_contact_relation = EXCLUDED.emergency_contact_relation,
        military_status = EXCLUDED.military_status,
        updated_at = now();

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_target_user_id,
        'email', v_clean_email
    );
END;
$$;
