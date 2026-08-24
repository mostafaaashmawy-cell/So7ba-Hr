-- ==============================================================================
-- HumAi Platform: Fix Tenant Settings Columns & Reload PostgREST Cache
-- Migration: 20260826_fix_tenant_settings_columns.sql
-- ==============================================================================

-- 1. Safely add any missing columns to existing tenant_settings table
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS enable_holiday_work_comp  BOOLEAN       NOT NULL DEFAULT true;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS enable_overtime           BOOLEAN       NOT NULL DEFAULT false;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS overtime_rate_multiplier  NUMERIC(4,2)  DEFAULT 1.5;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS overtime_calculation_mode TEXT          DEFAULT 'multiplier';
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS overtime_fixed_rate       NUMERIC(10,2) DEFAULT 50;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS industry                  TEXT          DEFAULT 'Organization';
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS branches                  JSONB         DEFAULT '[]'::jsonb;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS work_start_time           TEXT          DEFAULT '09:00';
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS work_end_time             TEXT          DEFAULT '17:00';
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS work_days                 JSONB         DEFAULT '["Sunday","Monday","Tuesday","Wednesday","Thursday"]'::jsonb;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS grace_period_mins         INTEGER       DEFAULT 15;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS lateness_mode             TEXT          DEFAULT 'tiered';
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS minute_deduction_rate     NUMERIC(6,4)  DEFAULT 0.0050;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS lateness_policy           JSONB         DEFAULT '{"thresholds":[]}'::jsonb;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS max_advance_percentage    INTEGER       DEFAULT 50;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS advance_eligibility_day   INTEGER       DEFAULT 15;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS geofencing_lat            NUMERIC(10,7);
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS geofencing_lng            NUMERIC(10,7);
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS geofencing_radius         INTEGER       DEFAULT 200;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS enable_advances           BOOLEAN       NOT NULL DEFAULT true;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS enable_commissions        BOOLEAN       NOT NULL DEFAULT true;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS enable_insurances         BOOLEAN       NOT NULL DEFAULT true;
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS enable_shifts             BOOLEAN       NOT NULL DEFAULT false;

-- 2. Force Supabase PostgREST Schema Cache to reload immediately
NOTIFY pgrst, 'reload schema';
