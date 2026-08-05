-- ========================================================
-- SO7BA HR - SCHEMA UPDATES V2 (EMPLOYEE REGISTRY & HOLIDAY COMP)
-- ========================================================

-- 1. Create Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to departments" ON public.departments FOR ALL USING (get_current_user_role() = 'super_admin');

-- Seed default departments
INSERT INTO public.departments (name) VALUES 
  ('HR'), 
  ('Operations'), 
  ('Sales'), 
  ('IT'), 
  ('Finance') 
ON CONFLICT (name) DO NOTHING;

-- 2. Add Employee Details Columns to public.users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_photo_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_cert_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS qualification_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS criminal_record_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- 3. Create Holiday Work Compensation Table
CREATE TABLE IF NOT EXISTS public.holiday_work (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  working_date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on holiday_work
ALTER TABLE public.holiday_work ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to holiday_work" 
  ON public.holiday_work FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR get_current_user_role() = 'super_admin'
    OR (get_current_user_role() = 'manager' AND EXISTS (SELECT 1 FROM public.users WHERE id = public.holiday_work.user_id AND manager_id = auth.uid()))
  );

CREATE POLICY "Allow manager/admin insert access to holiday_work" 
  ON public.holiday_work FOR INSERT 
  WITH CHECK (
    get_current_by_role_manager_or_admin(auth.uid())
  );

-- Helper function to check if user is manager or admin
CREATE OR REPLACE FUNCTION public.get_current_by_role_manager_or_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_uuid AND (role = 'manager' OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the policy using the defined function
DROP POLICY IF EXISTS "Allow manager/admin insert access to holiday_work" ON public.holiday_work;
CREATE POLICY "Allow manager/admin insert access to holiday_work" 
  ON public.holiday_work FOR INSERT 
  WITH CHECK (
    public.get_current_by_role_manager_or_admin(auth.uid())
  );

CREATE POLICY "Allow admin delete access to holiday_work" 
  ON public.holiday_work FOR DELETE 
  USING (get_current_user_role() = 'super_admin');

-- 4. Clean up Advances database (optional, can drop the table)
DROP TABLE IF EXISTS public.advances CASCADE;
