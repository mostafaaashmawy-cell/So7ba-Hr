-- ========================================================
-- HUMAI - SCHEMA UPDATES V5 (MULTI-BRANCH, LATENESS ENGINE, ADVANCE RULES, EVALUATIONS)
-- ========================================================

-- 1. Extend tenant_settings with HumAi specifications
ALTER TABLE public.tenant_settings 
  ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'Organization',
  ADD COLUMN IF NOT EXISTS branches JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS work_start_time TEXT DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS work_end_time TEXT DEFAULT '17:00',
  ADD COLUMN IF NOT EXISTS work_days JSONB DEFAULT '["Sunday","Monday","Tuesday","Wednesday","Thursday"]'::jsonb,
  ADD COLUMN IF NOT EXISTS grace_period_mins INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS lateness_mode TEXT DEFAULT 'tiered',
  ADD COLUMN IF NOT EXISTS minute_deduction_rate NUMERIC(6,4) DEFAULT 0.0050,
  ADD COLUMN IF NOT EXISTS max_advance_percentage INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS advance_eligibility_day INTEGER DEFAULT 15;

-- 2. Extend users table with custom schedule override fields
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS custom_schedule_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS custom_start_time TEXT,
  ADD COLUMN IF NOT EXISTS custom_end_time TEXT,
  ADD COLUMN IF NOT EXISTS custom_work_days JSONB,
  ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- 3. Extend evaluations table with evaluated_by reviewer reference
ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS evaluated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
