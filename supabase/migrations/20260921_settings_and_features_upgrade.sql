-- 1. Tenant Settings: Leave approval mode
ALTER TABLE public.tenant_settings
ADD COLUMN IF NOT EXISTS leave_approval_mode text DEFAULT 'auto_approve';

-- 2. Leaves & Permissions: Approval tracking
ALTER TABLE public.leaves_permissions
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 3. Users: Fawry mobile number
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS fawry_mobile_number text;

-- 4. Tenants: Logo URL
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS logo_url text;

-- 5. Financial Adjustments: Ensure month and description exist
ALTER TABLE public.financial_adjustments
ADD COLUMN IF NOT EXISTS month date,
ADD COLUMN IF NOT EXISTS description text;

-- Sync trigger for financial_adjustments to keep date/month and notes/description in sync
CREATE OR REPLACE FUNCTION public.sync_financial_adjustments_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date IS NOT NULL AND NEW.month IS NULL THEN
    NEW.month := NEW.date;
  ELSIF NEW.month IS NOT NULL AND NEW.date IS NULL THEN
    NEW.date := NEW.month;
  END IF;

  IF NEW.notes IS NOT NULL AND NEW.description IS NULL THEN
    NEW.description := NEW.notes;
  ELSIF NEW.description IS NOT NULL AND NEW.notes IS NULL THEN
    NEW.notes := NEW.description;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_financial_adjustments ON public.financial_adjustments;
CREATE TRIGGER trg_sync_financial_adjustments
BEFORE INSERT OR UPDATE ON public.financial_adjustments
FOR EACH ROW
EXECUTE FUNCTION public.sync_financial_adjustments_fields();

-- 6. Ensure managers and admins can update leaves_permissions for their team members
DROP POLICY IF EXISTS "Leaves: update by manager or admin" ON public.leaves_permissions;
CREATE POLICY "Leaves: update by manager or admin"
ON public.leaves_permissions
FOR UPDATE
USING (
  (auth.uid() = user_id) OR
  (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = public.leaves_permissions.user_id
      AND (
        u.manager_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users me WHERE me.id = auth.uid() AND me.role = 'super_admin')
      )
  ))
);
