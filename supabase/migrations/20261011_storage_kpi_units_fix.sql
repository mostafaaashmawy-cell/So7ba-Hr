-- Migration: 20261011_storage_kpi_units_fix.sql
-- Description: Allow public read of employee-documents for branding/logos, allow authenticated updates,
-- support logo_url on tenant_settings, and fix KPI units unique constraint and RLS scoping.

-- 1. Storage bucket policies for employee-documents (logos & public company branding)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Employee Docs: public read'
    ) THEN
        CREATE POLICY "Employee Docs: public read" ON storage.objects 
            FOR SELECT USING (bucket_id = 'employee-documents'::text);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Employee Docs: authenticated update'
    ) THEN
        CREATE POLICY "Employee Docs: authenticated update" ON storage.objects 
            FOR UPDATE USING ((bucket_id = 'employee-documents'::text) AND (auth.role() = 'authenticated'::text));
    END IF;
END $$;

-- 2. Add logo_url column to tenant_settings if missing
ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Fix KPI units unique constraint from global name to (tenant_id, lower(name))
ALTER TABLE public.kpi_units DROP CONSTRAINT IF EXISTS kpi_units_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_kpi_units_tenant_name 
ON public.kpi_units (COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));

-- 4. Allow read access to both system defaults (tenant_id IS NULL) and tenant KPI units
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'kpi_units' 
        AND policyname = 'Allow read access to KPI units'
    ) THEN
        ALTER POLICY "Allow read access to KPI units" ON public.kpi_units 
            USING (tenant_id IS NULL OR tenant_id = public.auth_tenant_id());
    END IF;
END $$;
