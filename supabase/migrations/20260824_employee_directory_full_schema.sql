-- ==============================================================================
-- HumAi Platform: Complete Employee Directory & Document Storage Migration
-- Migration:  20260824_employee_directory_full_schema.sql
-- Description: Adds Egyptian/MENA HR fields, payout channels, and storage bucket
-- ==============================================================================

-- 1. EXTEND USERS TABLE FOR COMPLETE MENA/EGYPTIAN HR ATTRIBUTES
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name_ar              TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name_en              TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS national_id               TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_expiry_date            DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_phone   TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS military_status           TEXT DEFAULT 'not_applicable';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hire_date                 DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS probation_end_date        DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS insurance_number          TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payout_method             TEXT DEFAULT 'cash';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bank_name                 TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bank_account_number       TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS iban                      TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wallet_phone_number       TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS instapay_handle           TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS national_id_front_url     TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS national_id_back_url      TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS graduation_cert_url       TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS military_cert_url         TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS insurance_print_url       TEXT;

-- Sync national_id with id_number if either was set
UPDATE public.users 
SET national_id = id_number 
WHERE national_id IS NULL AND id_number IS NOT NULL;

UPDATE public.users 
SET id_number = national_id 
WHERE id_number IS NULL AND national_id IS NOT NULL;

-- 2. CREATE SUPABASE STORAGE BUCKET FOR EMPLOYEE DOCUMENTS (IDEMPOTENT)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'employee-documents',
    'employee-documents',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- 3. STORAGE RLS POLICIES FOR EMPLOYEE DOCUMENTS
DROP POLICY IF EXISTS "Employee Docs: authenticated upload" ON storage.objects;
CREATE POLICY "Employee Docs: authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'employee-documents' 
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Employee Docs: authenticated read" ON storage.objects;
CREATE POLICY "Employee Docs: authenticated read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'employee-documents'
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Employee Docs: super_admin delete" ON storage.objects;
CREATE POLICY "Employee Docs: super_admin delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'employee-documents'
        AND auth.role() = 'authenticated'
    );

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_national_id    ON public.users(national_id);
CREATE INDEX IF NOT EXISTS idx_users_payout_method  ON public.users(payout_method);
CREATE INDEX IF NOT EXISTS idx_users_hire_date      ON public.users(hire_date);
