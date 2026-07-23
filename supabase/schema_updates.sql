-- ========================================================
-- SO7BA HR & OPERATIONS MANAGEMENT SYSTEM - SCHEMA UPDATES
-- ========================================================

-- 1. Add optional notes column to KPI entries
ALTER TABLE public.kpi_entries ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add morning/evening excuse details to leaves_permissions
ALTER TABLE public.leaves_permissions ADD COLUMN IF NOT EXISTS timeframe TEXT; -- 'morning' or 'evening'
ALTER TABLE public.leaves_permissions ADD COLUMN IF NOT EXISTS excuse_time TEXT; -- e.g. '10:30 AM'

-- 3. Create global KPI units table configured by Super Admin
CREATE TABLE IF NOT EXISTS public.kpi_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on kpi_units
ALTER TABLE public.kpi_units ENABLE ROW LEVEL SECURITY;

-- Select policy: Available to all authenticated users
CREATE POLICY "Allow read access to KPI units" 
  ON public.kpi_units FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Full control policy: Super Admin only
CREATE POLICY "Allow admin write access to KPI units" 
  ON public.kpi_units FOR ALL 
  USING (get_current_user_role() = 'super_admin');

-- Seed default KPI units
INSERT INTO public.kpi_units (name) VALUES 
  ('calls'), 
  ('pieces'), 
  ('reports'), 
  ('tasks') 
ON CONFLICT (name) DO NOTHING;
