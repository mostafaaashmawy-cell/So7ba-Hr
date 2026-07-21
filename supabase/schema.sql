-- ========================================================
-- SO7BA HR & OPERATIONS MANAGEMENT SYSTEM - SUPABASE SCHEMA
-- ========================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('employee', 'manager', 'super_admin');
CREATE TYPE leave_perm_type AS ENUM ('leave', 'permission');

-- 2. Users / Profiles Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  basic_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  kpi_unit TEXT DEFAULT 'tasks',
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Attendance Table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ,
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leaves & Permissions Table
CREATE TABLE public.leaves_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type leave_perm_type NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Advance Payments Table (السلف)
CREATE TABLE public.advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  month DATE NOT NULL, -- e.g. '2026-07-01' representing the payroll month
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Dynamic KPI Entries Table
CREATE TABLE public.kpi_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_entries ENABLE ROW LEVEL SECURITY;

-- Helper function to check role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Trigger to automatically create a profile in public.users when a new user signs up in Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role, basic_salary, kpi_unit)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'employee'::user_role),
    COALESCE((new.raw_user_meta_data->>'basic_salary')::numeric, 5000.00),
    COALESCE(new.raw_user_meta_data->>'kpi_unit', 'tasks')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
---------------------------------------------------------

-- USERS TABLE POLICIES
CREATE POLICY "Users Select Policy" 
  ON public.users FOR SELECT 
  USING (
    auth.uid() = id 
    OR get_current_user_role() = 'super_admin' 
    OR (get_current_user_role() = 'manager' AND manager_id = auth.uid())
  );

CREATE POLICY "Users Update Policy (Super Admin Only)" 
  ON public.users FOR UPDATE 
  USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Users Insert Policy (Self or Super Admin)" 
  ON public.users FOR INSERT 
  WITH CHECK (get_current_user_role() = 'super_admin' OR auth.uid() = id);

-- ATTENDANCE TABLE POLICIES
CREATE POLICY "Attendance Select Policy" 
  ON public.attendance FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR get_current_user_role() = 'super_admin'
    OR (get_current_user_role() = 'manager' AND EXISTS (SELECT 1 FROM public.users WHERE id = public.attendance.user_id AND manager_id = auth.uid()))
  );

CREATE POLICY "Attendance Insert Policy (Self)" 
  ON public.attendance FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR get_current_user_role() = 'super_admin');

CREATE POLICY "Attendance Update Policy (Check-out & Super Admin)" 
  ON public.attendance FOR UPDATE 
  USING (user_id = auth.uid() OR get_current_user_role() = 'super_admin');

CREATE POLICY "Attendance Delete Policy (Super Admin Only)" 
  ON public.attendance FOR DELETE 
  USING (get_current_user_role() = 'super_admin');

-- LEAVES & PERMISSIONS POLICIES
CREATE POLICY "Leaves Select Policy" 
  ON public.leaves_permissions FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR get_current_user_role() = 'super_admin'
    OR (get_current_user_role() = 'manager' AND EXISTS (SELECT 1 FROM public.users WHERE id = public.leaves_permissions.user_id AND manager_id = auth.uid()))
  );

CREATE POLICY "Leaves Insert Policy" 
  ON public.leaves_permissions FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR get_current_user_role() = 'super_admin');

CREATE POLICY "Leaves Delete Policy (Super Admin Only)" 
  ON public.leaves_permissions FOR DELETE 
  USING (get_current_user_role() = 'super_admin');

-- ADVANCES POLICIES
CREATE POLICY "Advances Select Policy" 
  ON public.advances FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR get_current_user_role() = 'super_admin'
    OR (get_current_user_role() = 'manager' AND EXISTS (SELECT 1 FROM public.users WHERE id = public.advances.user_id AND manager_id = auth.uid()))
  );

CREATE POLICY "Advances Insert Policy (Self)" 
  ON public.advances FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR get_current_user_role() = 'super_admin');

CREATE POLICY "Advances Delete Policy (Super Admin Only)" 
  ON public.advances FOR DELETE 
  USING (get_current_user_role() = 'super_admin');

-- KPI ENTRIES POLICIES
CREATE POLICY "KPI Select Policy" 
  ON public.kpi_entries FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR get_current_user_role() = 'super_admin'
    OR (get_current_user_role() = 'manager' AND EXISTS (SELECT 1 FROM public.users WHERE id = public.kpi_entries.user_id AND manager_id = auth.uid()))
  );

CREATE POLICY "KPI Insert Policy (Self)" 
  ON public.kpi_entries FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR get_current_user_role() = 'super_admin');

CREATE POLICY "KPI Delete Policy (Super Admin Only)" 
  ON public.kpi_entries FOR DELETE 
  USING (get_current_user_role() = 'super_admin');
