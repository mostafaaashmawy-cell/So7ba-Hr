-- ========================================================
-- SIMPLY HR SYSTEM - SCHEMA UPDATES V3 (RLS ONBOARDING FIX)
-- ========================================================

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Allow read access to user's tenant" ON public.tenants;
DROP POLICY IF EXISTS "Allow read access to tenant_settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "Allow admin edit access to tenant_settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "Allow settings insert for authenticated users" ON public.tenant_settings;

-- Create secure, onboarding-friendly policies for tenants
CREATE POLICY "Allow read access to tenants for authenticated users" ON public.tenants
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert access to tenants for authenticated users" ON public.tenants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create secure, onboarding-friendly policies for tenant_settings
CREATE POLICY "Allow read access to settings for authenticated users" ON public.tenant_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert access to settings for authenticated users" ON public.tenant_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write access to settings" ON public.tenant_settings
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()) 
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );
