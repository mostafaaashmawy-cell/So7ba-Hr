-- ==============================================================================
-- HumAi Platform: Phase 1 - Core Schema, Multi-Tenancy & P0 Security Fix
-- Migration:  20260823_humai_core_fix.sql
-- Run in:     Supabase Dashboard -> SQL Editor
-- Idempotent: Yes - every statement uses CREATE IF NOT EXISTS / DROP IF EXISTS
-- ==============================================================================

-- SECTION 0: HELPER FUNCTIONS (shared across all RLS policies)
CREATE OR REPLACE FUNCTION public.auth_tenant_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role::TEXT FROM public.users WHERE id = auth.uid();
$$;

-- SECTION 1: TENANTS TABLE
CREATE TABLE IF NOT EXISTS public.tenants (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    plan       TEXT        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenants: members read own tenant" ON public.tenants;
CREATE POLICY "Tenants: members read own tenant" ON public.tenants
    FOR SELECT USING (id = public.auth_tenant_id());

DROP POLICY IF EXISTS "Tenants: insert for authenticated users" ON public.tenants;
CREATE POLICY "Tenants: insert for authenticated users" ON public.tenants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Tenants: super_admin can update own tenant" ON public.tenants;
CREATE POLICY "Tenants: super_admin can update own tenant" ON public.tenants
    FOR UPDATE USING (id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin');

-- SECTION 2: TENANT SETTINGS (P0 #6 - strict tenant isolation)
CREATE TABLE IF NOT EXISTS public.tenant_settings (
    tenant_id                 UUID          PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    industry                  TEXT          DEFAULT 'Organization',
    branches                  JSONB         DEFAULT '[]'::jsonb,
    enable_advances           BOOLEAN       NOT NULL DEFAULT true,
    enable_commissions        BOOLEAN       NOT NULL DEFAULT true,
    enable_insurances         BOOLEAN       NOT NULL DEFAULT true,
    enable_shifts             BOOLEAN       NOT NULL DEFAULT false,
    enable_holiday_work_comp  BOOLEAN       NOT NULL DEFAULT true,
    enable_overtime           BOOLEAN       NOT NULL DEFAULT false,
    work_start_time           TEXT          DEFAULT '09:00',
    work_end_time             TEXT          DEFAULT '17:00',
    work_days                 JSONB         DEFAULT '["Sunday","Monday","Tuesday","Wednesday","Thursday"]'::jsonb,
    grace_period_mins         INTEGER       DEFAULT 15,
    lateness_mode             TEXT          DEFAULT 'tiered' CHECK (lateness_mode IN ('tiered', 'percentage_per_minute')),
    minute_deduction_rate     NUMERIC(6,4)  DEFAULT 0.0050,
    lateness_policy           JSONB         DEFAULT '{"thresholds":[]}'::jsonb,
    max_advance_percentage    INTEGER       DEFAULT 50,
    advance_eligibility_day   INTEGER       DEFAULT 15,
    overtime_rate_multiplier  NUMERIC(4,2)  DEFAULT 1.5,
    overtime_calculation_mode TEXT          DEFAULT 'multiplier' CHECK (overtime_calculation_mode IN ('multiplier', 'fixed_rate')),
    overtime_fixed_rate       NUMERIC(10,2) DEFAULT 50,
    geofencing_lat            NUMERIC(10,7),
    geofencing_lng            NUMERIC(10,7),
    geofencing_radius         INTEGER       DEFAULT 200,
    created_at                TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

-- Remove old overly-permissive v3 policies
DROP POLICY IF EXISTS "Allow read access to tenants for authenticated users"    ON public.tenants;
DROP POLICY IF EXISTS "Allow insert access to tenants for authenticated users"  ON public.tenants;
DROP POLICY IF EXISTS "Allow read access to settings for authenticated users"   ON public.tenant_settings;
DROP POLICY IF EXISTS "Allow insert access to settings for authenticated users" ON public.tenant_settings;
DROP POLICY IF EXISTS "Allow admin write access to settings"                    ON public.tenant_settings;

DROP POLICY IF EXISTS "TenantSettings: members read own tenant" ON public.tenant_settings;
CREATE POLICY "TenantSettings: members read own tenant" ON public.tenant_settings
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS "TenantSettings: insert for authenticated users" ON public.tenant_settings;
CREATE POLICY "TenantSettings: insert for authenticated users" ON public.tenant_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "TenantSettings: super_admin can update" ON public.tenant_settings;
CREATE POLICY "TenantSettings: super_admin can update" ON public.tenant_settings
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 3: DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Departments: members read own tenant" ON public.departments;
CREATE POLICY "Departments: members read own tenant" ON public.departments
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS "Departments: super_admin manage" ON public.departments;
CREATE POLICY "Departments: super_admin manage" ON public.departments
    FOR ALL USING (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 4: USERS TABLE - strict tenant-scoped RLS (P0 #2, #14)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tenant_id               UUID        REFERENCES public.tenants(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mobile                  TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_number               TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_photo_url            TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age                     INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date              DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_cert_url          TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS qualification           TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS qualification_url       TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address                 TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS job_title               TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS criminal_record_url     TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department_id           UUID        REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_method          TEXT        DEFAULT 'bank_transfer';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS social_insurance        NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS health_insurance        NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS contract_type           TEXT        DEFAULT 'full_time';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS probation_period        INTEGER     DEFAULT 90;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS contract_end_date       DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS commission_rate         NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_remote               BOOLEAN     DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_flexible             BOOLEAN     DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS required_daily_hours    NUMERIC     DEFAULT 8;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS shift_id                UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS custom_schedule_enabled BOOLEAN     DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS custom_start_time       TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS custom_end_time         TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS custom_work_days        JSONB;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS branch_id               TEXT;

-- Drop legacy policies
DROP POLICY IF EXISTS "Users Select Policy"                        ON public.users;
DROP POLICY IF EXISTS "Users Update Policy (Super Admin Only)"     ON public.users;
DROP POLICY IF EXISTS "Users Insert Policy (Self or Super Admin)"  ON public.users;
DROP POLICY IF EXISTS "users_select"                               ON public.users;
DROP POLICY IF EXISTS "users_insert"                               ON public.users;
DROP POLICY IF EXISTS "users_update"                               ON public.users;
DROP POLICY IF EXISTS "Users: select with tenant scope"            ON public.users;
DROP POLICY IF EXISTS "Users: insert self on signup"               ON public.users;
DROP POLICY IF EXISTS "Users: update with tenant scope"            ON public.users;
DROP POLICY IF EXISTS "Users: delete by super_admin only"          ON public.users;

CREATE POLICY "Users: select with tenant scope" ON public.users
    FOR SELECT USING (
        auth.uid() = id
        OR (
            public.auth_tenant_id() IS NOT NULL
            AND tenant_id = public.auth_tenant_id()
            AND public.auth_user_role() IN ('manager', 'super_admin')
        )
    );

CREATE POLICY "Users: insert self on signup" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users: update with tenant scope" ON public.users
    FOR UPDATE USING (
        auth.uid() = id
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin')
    );

CREATE POLICY "Users: delete by super_admin only" ON public.users
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 5: ATTENDANCE - tenant_id + strict RLS (P0 #4)
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS tenant_id       UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS is_remote        BOOLEAN DEFAULT false;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS check_in_note    TEXT;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS overtime_minutes INTEGER DEFAULT 0;

DROP POLICY IF EXISTS "Attendance Select Policy"                           ON public.attendance;
DROP POLICY IF EXISTS "Attendance Insert Policy (Self)"                    ON public.attendance;
DROP POLICY IF EXISTS "Attendance Update Policy (Check-out & Super Admin)" ON public.attendance;
DROP POLICY IF EXISTS "Attendance Delete Policy (Super Admin Only)"        ON public.attendance;
DROP POLICY IF EXISTS "Attendance: select with tenant scope"               ON public.attendance;
DROP POLICY IF EXISTS "Attendance: insert self or admin"                   ON public.attendance;
DROP POLICY IF EXISTS "Attendance: update self or admin"                   ON public.attendance;
DROP POLICY IF EXISTS "Attendance: delete by super_admin only"             ON public.attendance;

CREATE POLICY "Attendance: select with tenant scope" ON public.attendance
    FOR SELECT USING (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() IN ('manager', 'super_admin'))
    );

CREATE POLICY "Attendance: insert self or admin" ON public.attendance
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin')
    );

CREATE POLICY "Attendance: update self or admin" ON public.attendance
    FOR UPDATE USING (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin')
    );

CREATE POLICY "Attendance: delete by super_admin only" ON public.attendance
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 6: LEAVES & PERMISSIONS
ALTER TABLE public.leaves_permissions ADD COLUMN IF NOT EXISTS tenant_id  UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.leaves_permissions ADD COLUMN IF NOT EXISTS timeframe   TEXT;
ALTER TABLE public.leaves_permissions ADD COLUMN IF NOT EXISTS excuse_time TEXT;

DROP POLICY IF EXISTS "Leaves Select Policy"                    ON public.leaves_permissions;
DROP POLICY IF EXISTS "Leaves Insert Policy"                    ON public.leaves_permissions;
DROP POLICY IF EXISTS "Leaves Delete Policy (Super Admin Only)" ON public.leaves_permissions;
DROP POLICY IF EXISTS "Leaves: select with tenant scope"        ON public.leaves_permissions;
DROP POLICY IF EXISTS "Leaves: insert self or admin"            ON public.leaves_permissions;
DROP POLICY IF EXISTS "Leaves: update by super_admin"           ON public.leaves_permissions;
DROP POLICY IF EXISTS "Leaves: delete by super_admin"           ON public.leaves_permissions;

CREATE POLICY "Leaves: select with tenant scope" ON public.leaves_permissions
    FOR SELECT USING (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() IN ('manager', 'super_admin'))
    );

CREATE POLICY "Leaves: insert self or admin" ON public.leaves_permissions
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin')
    );

CREATE POLICY "Leaves: update by super_admin" ON public.leaves_permissions
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

CREATE POLICY "Leaves: delete by super_admin" ON public.leaves_permissions
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 7: KPI ENTRIES
ALTER TABLE public.kpi_entries ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.kpi_entries ADD COLUMN IF NOT EXISTS notes     TEXT;

DROP POLICY IF EXISTS "KPI Select Policy"                    ON public.kpi_entries;
DROP POLICY IF EXISTS "KPI Insert Policy (Self)"             ON public.kpi_entries;
DROP POLICY IF EXISTS "KPI Delete Policy (Super Admin Only)" ON public.kpi_entries;
DROP POLICY IF EXISTS "KPI: select with tenant scope"        ON public.kpi_entries;
DROP POLICY IF EXISTS "KPI: insert self or admin"            ON public.kpi_entries;
DROP POLICY IF EXISTS "KPI: delete by super_admin"           ON public.kpi_entries;

CREATE POLICY "KPI: select with tenant scope" ON public.kpi_entries
    FOR SELECT USING (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() IN ('manager', 'super_admin'))
    );

CREATE POLICY "KPI: insert self or admin" ON public.kpi_entries
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin')
    );

CREATE POLICY "KPI: delete by super_admin" ON public.kpi_entries
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 8: ADVANCES
ALTER TABLE public.advances ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.advances ADD COLUMN IF NOT EXISTS status    TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.advances ADD COLUMN IF NOT EXISTS notes     TEXT;

ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Advances Select Policy"                    ON public.advances;
DROP POLICY IF EXISTS "Advances Insert Policy (Self)"             ON public.advances;
DROP POLICY IF EXISTS "Advances Delete Policy (Super Admin Only)" ON public.advances;
DROP POLICY IF EXISTS "Allow select on advances"                  ON public.advances;
DROP POLICY IF EXISTS "Allow insert on advances"                  ON public.advances;
DROP POLICY IF EXISTS "Allow update on advances"                  ON public.advances;
DROP POLICY IF EXISTS "Allow delete on advances"                  ON public.advances;
DROP POLICY IF EXISTS "Advances: select with tenant scope"        ON public.advances;
DROP POLICY IF EXISTS "Advances: insert by same tenant"           ON public.advances;
DROP POLICY IF EXISTS "Advances: update by super_admin"           ON public.advances;
DROP POLICY IF EXISTS "Advances: delete by super_admin"           ON public.advances;

CREATE POLICY "Advances: select with tenant scope" ON public.advances
    FOR SELECT USING (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() IN ('manager', 'super_admin'))
    );

CREATE POLICY "Advances: insert by same tenant" ON public.advances
    FOR INSERT WITH CHECK (tenant_id = public.auth_tenant_id());

CREATE POLICY "Advances: update by super_admin" ON public.advances
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

CREATE POLICY "Advances: delete by super_admin" ON public.advances
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 9: EMPLOYEE TARGETS
CREATE TABLE IF NOT EXISTS public.employee_targets (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id    UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month      DATE          NOT NULL,
    target_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
    unit       TEXT          NOT NULL DEFAULT 'tasks',
    notes      TEXT,
    created_by UUID          REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on employee_targets" ON public.employee_targets;
DROP POLICY IF EXISTS "Allow insert on employee_targets" ON public.employee_targets;
DROP POLICY IF EXISTS "Allow update on employee_targets" ON public.employee_targets;
DROP POLICY IF EXISTS "Allow delete on employee_targets" ON public.employee_targets;

CREATE POLICY "Targets: select with tenant scope" ON public.employee_targets
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

CREATE POLICY "Targets: insert by manager or admin" ON public.employee_targets
    FOR INSERT WITH CHECK (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('manager', 'super_admin')
    );

CREATE POLICY "Targets: update by manager or admin" ON public.employee_targets
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('manager', 'super_admin')
    );

CREATE POLICY "Targets: delete by admin" ON public.employee_targets
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 10: SALES LOGS
CREATE TABLE IF NOT EXISTS public.sales_logs (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id           UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date              DATE          NOT NULL DEFAULT CURRENT_DATE,
    amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
    commission_rate   NUMERIC(5,2)  DEFAULT 0,
    commission_earned NUMERIC(12,2) GENERATED ALWAYS AS (amount * commission_rate / 100) STORED,
    notes             TEXT,
    status            TEXT          NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by       UUID          REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on sales_logs" ON public.sales_logs;
DROP POLICY IF EXISTS "Allow insert on sales_logs" ON public.sales_logs;
DROP POLICY IF EXISTS "Allow update on sales_logs" ON public.sales_logs;
DROP POLICY IF EXISTS "Allow delete on sales_logs" ON public.sales_logs;

CREATE POLICY "Sales: select with tenant scope" ON public.sales_logs
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

CREATE POLICY "Sales: insert by same tenant" ON public.sales_logs
    FOR INSERT WITH CHECK (tenant_id = public.auth_tenant_id());

CREATE POLICY "Sales: update by admin or self pending" ON public.sales_logs
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id()
        AND (
            public.auth_user_role() IN ('manager', 'super_admin')
            OR (user_id = auth.uid() AND status = 'pending')
        )
    );

CREATE POLICY "Sales: delete by admin or self pending" ON public.sales_logs
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id()
        AND (
            public.auth_user_role() IN ('manager', 'super_admin')
            OR (user_id = auth.uid() AND status = 'pending')
        )
    );

-- SECTION 11: FINANCIAL ADJUSTMENTS
CREATE TABLE IF NOT EXISTS public.financial_adjustments (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id     UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month       DATE          NOT NULL,
    type        TEXT          NOT NULL CHECK (type IN ('bonus', 'deduction', 'overtime', 'holiday_comp', 'other')),
    amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    description TEXT,
    created_by  UUID          REFERENCES public.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on financial_adjustments" ON public.financial_adjustments;
DROP POLICY IF EXISTS "Allow insert on financial_adjustments" ON public.financial_adjustments;
DROP POLICY IF EXISTS "Allow update on financial_adjustments" ON public.financial_adjustments;
DROP POLICY IF EXISTS "Allow delete on financial_adjustments" ON public.financial_adjustments;

CREATE POLICY "FinAdj: select with tenant scope" ON public.financial_adjustments
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

CREATE POLICY "FinAdj: insert by manager or admin" ON public.financial_adjustments
    FOR INSERT WITH CHECK (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('manager', 'super_admin')
    );

CREATE POLICY "FinAdj: update by manager or admin" ON public.financial_adjustments
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('manager', 'super_admin')
    );

CREATE POLICY "FinAdj: delete by admin" ON public.financial_adjustments
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 12: EVALUATIONS
CREATE TABLE IF NOT EXISTS public.evaluations (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id              UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    evaluated_by         UUID         REFERENCES public.users(id) ON DELETE SET NULL,
    month                DATE         NOT NULL,
    star_punctuality     NUMERIC(3,1) NOT NULL DEFAULT 0 CHECK (star_punctuality BETWEEN 0 AND 5),
    star_quality         NUMERIC(3,1) NOT NULL DEFAULT 0 CHECK (star_quality BETWEEN 0 AND 5),
    star_problem_solving NUMERIC(3,1) NOT NULL DEFAULT 0 CHECK (star_problem_solving BETWEEN 0 AND 5),
    star_communication   NUMERIC(3,1) NOT NULL DEFAULT 0 CHECK (star_communication BETWEEN 0 AND 5),
    notes                TEXT,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, user_id, month)
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Allow insert on evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Allow update on evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Allow delete on evaluations" ON public.evaluations;

CREATE POLICY "Eval: select with tenant scope" ON public.evaluations
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

CREATE POLICY "Eval: insert by manager or admin" ON public.evaluations
    FOR INSERT WITH CHECK (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('manager', 'super_admin')
    );

CREATE POLICY "Eval: update by manager or admin" ON public.evaluations
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('manager', 'super_admin')
    );

CREATE POLICY "Eval: delete by admin" ON public.evaluations
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 13: NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title      TEXT        NOT NULL,
    body       TEXT        NOT NULL,
    type       TEXT        DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read    BOOLEAN     NOT NULL DEFAULT false,
    link       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow insert on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow update on notifications" ON public.notifications;

CREATE POLICY "Notif: select own or admin" ON public.notifications
    FOR SELECT USING (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin')
    );

CREATE POLICY "Notif: insert by same tenant" ON public.notifications
    FOR INSERT WITH CHECK (tenant_id = public.auth_tenant_id());

CREATE POLICY "Notif: update is_read by owner or admin" ON public.notifications
    FOR UPDATE USING (
        user_id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin')
    );

-- SECTION 14: CONTRACT TEMPLATES
CREATE TABLE IF NOT EXISTS public.contract_templates (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    body_html  TEXT        NOT NULL,
    is_default BOOLEAN     NOT NULL DEFAULT false,
    created_by UUID        REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on contract_templates" ON public.contract_templates;
DROP POLICY IF EXISTS "Allow insert on contract_templates" ON public.contract_templates;
DROP POLICY IF EXISTS "Allow update on contract_templates" ON public.contract_templates;
DROP POLICY IF EXISTS "Allow delete on contract_templates" ON public.contract_templates;

CREATE POLICY "Contracts: select with tenant scope" ON public.contract_templates
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

CREATE POLICY "Contracts: insert by super_admin" ON public.contract_templates
    FOR INSERT WITH CHECK (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

CREATE POLICY "Contracts: update by super_admin" ON public.contract_templates
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

CREATE POLICY "Contracts: delete by super_admin" ON public.contract_templates
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 15: SHIFTS (idempotent)
CREATE TABLE IF NOT EXISTS public.shifts (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    start_time TEXT        NOT NULL DEFAULT '08:00',
    end_time   TEXT        NOT NULL DEFAULT '16:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view shifts in their tenant" ON public.shifts;
DROP POLICY IF EXISTS "Super Admins can manage shifts"        ON public.shifts;
DROP POLICY IF EXISTS "Shifts: members read own tenant"       ON public.shifts;
DROP POLICY IF EXISTS "Shifts: super_admin manage"            ON public.shifts;

CREATE POLICY "Shifts: members read own tenant" ON public.shifts
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

CREATE POLICY "Shifts: super_admin manage" ON public.shifts
    FOR ALL USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 16: SHIFT SWAP REQUESTS (idempotent)
CREATE TABLE IF NOT EXISTS public.shift_swap_requests (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id          UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    requester_id       UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    requested_date     DATE        NOT NULL,
    requester_shift_id UUID        REFERENCES public.shifts(id) ON DELETE SET NULL,
    target_shift_id    UUID        REFERENCES public.shifts(id) ON DELETE SET NULL,
    status             TEXT        NOT NULL DEFAULT 'pending_admin'
                       CHECK (status IN ('pending_admin', 'approved', 'rejected')),
    notes              TEXT,
    reviewed_by        UUID        REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shift_swap_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view swap requests in their tenant"     ON public.shift_swap_requests;
DROP POLICY IF EXISTS "Users can create swap requests"                   ON public.shift_swap_requests;
DROP POLICY IF EXISTS "Super Admins can manage and review swap requests" ON public.shift_swap_requests;
DROP POLICY IF EXISTS "SwapReqs: members view own tenant"                ON public.shift_swap_requests;
DROP POLICY IF EXISTS "SwapReqs: employees can create"                   ON public.shift_swap_requests;
DROP POLICY IF EXISTS "SwapReqs: super_admin manage"                     ON public.shift_swap_requests;

CREATE POLICY "SwapReqs: members view own tenant" ON public.shift_swap_requests
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

CREATE POLICY "SwapReqs: employees can create" ON public.shift_swap_requests
    FOR INSERT WITH CHECK (
        requester_id = auth.uid()
        AND tenant_id = public.auth_tenant_id()
    );

CREATE POLICY "SwapReqs: super_admin manage" ON public.shift_swap_requests
    FOR ALL USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 17: SYSTEM AUDIT LOGS (idempotent)
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT        NOT NULL,
    entity_name TEXT        NOT NULL,
    entity_id   TEXT,
    details     JSONB       DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admins can view audit logs"          ON public.system_audit_logs;
DROP POLICY IF EXISTS "System and Admins can insert audit logs"   ON public.system_audit_logs;
DROP POLICY IF EXISTS "Audit: super_admin view own tenant"        ON public.system_audit_logs;
DROP POLICY IF EXISTS "Audit: insert by actor in same tenant"     ON public.system_audit_logs;

CREATE POLICY "Audit: super_admin view own tenant" ON public.system_audit_logs
    FOR SELECT USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

CREATE POLICY "Audit: insert by actor in same tenant" ON public.system_audit_logs
    FOR INSERT WITH CHECK (
        actor_id = auth.uid()
        AND tenant_id = public.auth_tenant_id()
    );

-- SECTION 18: HOLIDAY WORK RECORDS
CREATE TABLE IF NOT EXISTS public.holiday_work_records (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    working_date DATE        NOT NULL,
    notes        TEXT,
    created_by   UUID        REFERENCES public.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.holiday_work_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "HolidayWork: members view own tenant" ON public.holiday_work_records;
DROP POLICY IF EXISTS "HolidayWork: super_admin manage"      ON public.holiday_work_records;

CREATE POLICY "HolidayWork: members view own tenant" ON public.holiday_work_records
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

CREATE POLICY "HolidayWork: super_admin manage" ON public.holiday_work_records
    FOR ALL USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'super_admin'
    );

-- SECTION 19: PERFORMANCE INDEXES (P0 #16)
CREATE INDEX IF NOT EXISTS idx_users_tenant_id               ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role                    ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department_id           ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id            ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date        ON public.attendance(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_leaves_user_id                ON public.leaves_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_leaves_tenant_date            ON public.leaves_permissions(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_kpi_user_id                   ON public.kpi_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_tenant_date               ON public.kpi_entries(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_advances_tenant_user          ON public.advances(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_tenant_month      ON public.evaluations(tenant_id, user_id, month);
CREATE INDEX IF NOT EXISTS idx_sales_logs_tenant_user        ON public.sales_logs(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_financial_adj_tenant_user     ON public.financial_adjustments(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id         ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread          ON public.notifications(tenant_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_shifts_tenant_id              ON public.shifts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_tenant_id         ON public.shift_swap_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created     ON public.system_audit_logs(tenant_id, created_at DESC);

-- SECTION 20: RPC - check_in_with_geofence (P0 #7)
-- Server-side Haversine geofence validation - prevents GPS coordinate spoofing.
CREATE OR REPLACE FUNCTION public.check_in_with_geofence(
    p_lat       NUMERIC,
    p_lng       NUMERIC,
    p_branch_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id    UUID;
    v_user_id      UUID := auth.uid();
    v_settings     RECORD;
    v_branch       JSONB;
    v_fence_lat    NUMERIC;
    v_fence_lng    NUMERIC;
    v_fence_radius INTEGER;
    v_distance_m   NUMERIC;
    v_new_id       UUID;
    v_today        DATE := CURRENT_DATE;
    v_existing_id  UUID;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM public.users WHERE id = v_user_id;
    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User has no tenant assignment.');
    END IF;

    SELECT * INTO v_settings FROM public.tenant_settings WHERE tenant_id = v_tenant_id;

    SELECT id INTO v_existing_id FROM public.attendance
    WHERE user_id = v_user_id AND date = v_today LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already checked in today.', 'existing_id', v_existing_id);
    END IF;

    IF v_settings.geofencing_lat IS NOT NULL AND v_settings.geofencing_lng IS NOT NULL THEN
        IF p_branch_id IS NOT NULL THEN
            SELECT b INTO v_branch
            FROM jsonb_array_elements(COALESCE(v_settings.branches, '[]'::jsonb)) AS b
            WHERE b->>'id' = p_branch_id LIMIT 1;

            IF v_branch IS NOT NULL THEN
                v_fence_lat    := (v_branch->>'lat')::NUMERIC;
                v_fence_lng    := (v_branch->>'lng')::NUMERIC;
                v_fence_radius := COALESCE((v_branch->>'radius')::INTEGER, v_settings.geofencing_radius, 200);
            ELSE
                v_fence_lat    := v_settings.geofencing_lat;
                v_fence_lng    := v_settings.geofencing_lng;
                v_fence_radius := COALESCE(v_settings.geofencing_radius, 200);
            END IF;
        ELSE
            v_fence_lat    := v_settings.geofencing_lat;
            v_fence_lng    := v_settings.geofencing_lng;
            v_fence_radius := COALESCE(v_settings.geofencing_radius, 200);
        END IF;

        -- Haversine formula: distance in metres
        v_distance_m := 6371000 * acos(
            LEAST(1.0, GREATEST(-1.0,
                cos(radians(v_fence_lat)) * cos(radians(p_lat)) *
                cos(radians(p_lng) - radians(v_fence_lng)) +
                sin(radians(v_fence_lat)) * sin(radians(p_lat))
            ))
        );

        IF v_distance_m > v_fence_radius THEN
            RETURN jsonb_build_object(
                'success', false, 'error', 'Outside allowed geofence.',
                'distance_m', round(v_distance_m::NUMERIC, 1),
                'radius_m', v_fence_radius
            );
        END IF;
    END IF;

    INSERT INTO public.attendance (user_id, tenant_id, check_in_time, lat, lng, date)
    VALUES (v_user_id, v_tenant_id, now(), p_lat, p_lng, v_today)
    RETURNING id INTO v_new_id;

    INSERT INTO public.system_audit_logs (tenant_id, actor_id, action_type, entity_name, entity_id, details)
    VALUES (v_tenant_id, v_user_id, 'CHECK_IN', 'attendance', v_new_id::TEXT,
            jsonb_build_object('lat', p_lat, 'lng', p_lng, 'branch_id', p_branch_id));

    RETURN jsonb_build_object('success', true, 'attendance_id', v_new_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- SECTION 21: RPC - approve_shift_swap (P0 #9)
-- Atomic: swap shift_id between two users + update status + notify + audit.
CREATE OR REPLACE FUNCTION public.approve_shift_swap(p_swap_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id  UUID := auth.uid();
    v_tenant_id UUID;
    v_swap      RECORD;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM public.users WHERE id = v_actor_id;

    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = v_actor_id AND role = 'super_admin' AND tenant_id = v_tenant_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only super_admin can approve shift swaps.');
    END IF;

    SELECT * INTO v_swap FROM public.shift_swap_requests
    WHERE id = p_swap_id AND tenant_id = v_tenant_id AND status = 'pending_admin';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Swap request not found or already processed.');
    END IF;

    -- Atomic shift swap
    UPDATE public.users SET shift_id = v_swap.target_shift_id   WHERE id = v_swap.requester_id;
    UPDATE public.users SET shift_id = v_swap.requester_shift_id WHERE id = v_swap.target_user_id;

    UPDATE public.shift_swap_requests
    SET status = 'approved', reviewed_by = v_actor_id, reviewed_at = now()
    WHERE id = p_swap_id;

    INSERT INTO public.system_audit_logs (tenant_id, actor_id, action_type, entity_name, entity_id, details)
    VALUES (v_tenant_id, v_actor_id, 'APPROVE_SHIFT_SWAP', 'shift_swap_requests', p_swap_id::TEXT,
            jsonb_build_object(
                'requester_id', v_swap.requester_id, 'target_user_id', v_swap.target_user_id,
                'requester_shift', v_swap.requester_shift_id, 'target_shift', v_swap.target_shift_id
            ));

    INSERT INTO public.notifications (tenant_id, user_id, title, body, type)
    VALUES
        (v_tenant_id, v_swap.requester_id,   'Shift Swap Approved', 'Your shift swap request has been approved.', 'success'),
        (v_tenant_id, v_swap.target_user_id, 'Shift Swap Approved', 'A shift swap involving you has been approved.', 'info');

    RETURN jsonb_build_object('success', true, 'swap_id', p_swap_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- SECTION 22: RPC - create_tenant_and_bootstrap (P0 #1)
-- Single atomic transaction: create tenant + settings + promote caller to super_admin.
CREATE OR REPLACE FUNCTION public.create_tenant_and_bootstrap(
    p_company_name TEXT,
    p_industry     TEXT DEFAULT 'Organization',
    p_full_name    TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id      UUID := auth.uid();
    v_tenant_id    UUID;
    v_existing_tid UUID;
BEGIN
    SELECT tenant_id INTO v_existing_tid FROM public.users WHERE id = v_user_id;
    IF v_existing_tid IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User already belongs to a tenant.', 'tenant_id', v_existing_tid);
    END IF;

    INSERT INTO public.tenants (name) VALUES (p_company_name) RETURNING id INTO v_tenant_id;

    INSERT INTO public.tenant_settings (tenant_id, industry)
    VALUES (v_tenant_id, p_industry);

    UPDATE public.users
    SET tenant_id = v_tenant_id, role = 'super_admin',
        full_name = COALESCE(p_full_name, full_name)
    WHERE id = v_user_id;

    -- Seed default morning shift
    INSERT INTO public.shifts (tenant_id, name, start_time, end_time)
    VALUES (v_tenant_id, 'Morning Shift', '08:00', '16:00');

    INSERT INTO public.system_audit_logs (tenant_id, actor_id, action_type, entity_name, entity_id, details)
    VALUES (v_tenant_id, v_user_id, 'TENANT_CREATED', 'tenants', v_tenant_id::TEXT,
            jsonb_build_object('company_name', p_company_name, 'industry', p_industry));

    RETURN jsonb_build_object('success', true, 'tenant_id', v_tenant_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- SECTION 23: SAFE handle_new_user TRIGGER (P0 #2)
-- Always creates user as employee; bootstrap RPC promotes to super_admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, full_name, role, basic_salary, kpi_unit)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'employee'::user_role,
        COALESCE((NEW.raw_user_meta_data->>'basic_salary')::NUMERIC, 5000.00),
        COALESCE(NEW.raw_user_meta_data->>'kpi_unit', 'tasks')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SECTION 24: updated_at AUTO-TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.tenants;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.tenant_settings;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tenant_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.contract_templates;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contract_templates
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- END OF MIGRATION: 20260823_humai_core_fix.sql
