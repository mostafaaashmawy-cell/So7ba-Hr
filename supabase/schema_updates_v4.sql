-- ========================================================
-- SIMPLY HR SYSTEM - SCHEMA UPDATES V4 (RLS FOR NEW MODULES)
-- ========================================================

-- Enable Row Level Security (RLS) on all tables (in case not enabled)
ALTER TABLE IF EXISTS public.employee_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sales_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financial_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contract_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent naming conflicts
DROP POLICY IF EXISTS "Allow select on employee_targets" ON public.employee_targets;
DROP POLICY IF EXISTS "Allow insert on employee_targets" ON public.employee_targets;
DROP POLICY IF EXISTS "Allow update on employee_targets" ON public.employee_targets;
DROP POLICY IF EXISTS "Allow delete on employee_targets" ON public.employee_targets;

DROP POLICY IF EXISTS "Allow select on sales_logs" ON public.sales_logs;
DROP POLICY IF EXISTS "Allow insert on sales_logs" ON public.sales_logs;
DROP POLICY IF EXISTS "Allow update on sales_logs" ON public.sales_logs;
DROP POLICY IF EXISTS "Allow delete on sales_logs" ON public.sales_logs;

DROP POLICY IF EXISTS "Allow select on financial_adjustments" ON public.financial_adjustments;
DROP POLICY IF EXISTS "Allow insert on financial_adjustments" ON public.financial_adjustments;
DROP POLICY IF EXISTS "Allow update on financial_adjustments" ON public.financial_adjustments;
DROP POLICY IF EXISTS "Allow delete on financial_adjustments" ON public.financial_adjustments;

DROP POLICY IF EXISTS "Allow select on evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Allow insert on evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Allow update on evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Allow delete on evaluations" ON public.evaluations;

DROP POLICY IF EXISTS "Allow select on advances" ON public.advances;
DROP POLICY IF EXISTS "Allow insert on advances" ON public.advances;
DROP POLICY IF EXISTS "Allow update on advances" ON public.advances;
DROP POLICY IF EXISTS "Allow delete on advances" ON public.advances;

DROP POLICY IF EXISTS "Allow select on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow insert on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow update on notifications" ON public.notifications;

DROP POLICY IF EXISTS "Allow select on contract_templates" ON public.contract_templates;
DROP POLICY IF EXISTS "Allow insert on contract_templates" ON public.contract_templates;
DROP POLICY IF EXISTS "Allow update on contract_templates" ON public.contract_templates;
DROP POLICY IF EXISTS "Allow delete on contract_templates" ON public.contract_templates;


-- 1. EMPLOYEE TARGETS POLICIES
CREATE POLICY "Allow select on employee_targets" ON public.employee_targets
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow insert on employee_targets" ON public.employee_targets
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
  );

CREATE POLICY "Allow update on employee_targets" ON public.employee_targets
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
  );

CREATE POLICY "Allow delete on employee_targets" ON public.employee_targets
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
  );


-- 2. SALES LOGS POLICIES
CREATE POLICY "Allow select on sales_logs" ON public.sales_logs
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow insert on sales_logs" ON public.sales_logs
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow update on sales_logs" ON public.sales_logs
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (
      (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
      OR (user_id = auth.uid() AND status = 'pending')
    )
  );

CREATE POLICY "Allow delete on sales_logs" ON public.sales_logs
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (
      (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
      OR (user_id = auth.uid() AND status = 'pending')
    )
  );


-- 3. FINANCIAL ADJUSTMENTS POLICIES
CREATE POLICY "Allow select on financial_adjustments" ON public.financial_adjustments
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow insert on financial_adjustments" ON public.financial_adjustments
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
  );

CREATE POLICY "Allow update on financial_adjustments" ON public.financial_adjustments
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
  );

CREATE POLICY "Allow delete on financial_adjustments" ON public.financial_adjustments
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
  );


-- 4. EVALUATIONS POLICIES
CREATE POLICY "Allow select on evaluations" ON public.evaluations
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow insert on evaluations" ON public.evaluations
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
  );

CREATE POLICY "Allow update on evaluations" ON public.evaluations
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
  );

CREATE POLICY "Allow delete on evaluations" ON public.evaluations
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('manager', 'super_admin')
  );


-- 5. ADVANCES POLICIES
CREATE POLICY "Allow select on advances" ON public.advances
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow insert on advances" ON public.advances
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow update on advances" ON public.advances
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Allow delete on advances" ON public.advances
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );


-- 6. NOTIFICATIONS POLICIES
CREATE POLICY "Allow select on notifications" ON public.notifications
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow insert on notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow update on notifications" ON public.notifications
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );


-- 7. CONTRACT TEMPLATES POLICIES
CREATE POLICY "Allow select on contract_templates" ON public.contract_templates
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Allow insert on contract_templates" ON public.contract_templates
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Allow update on contract_templates" ON public.contract_templates
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Allow delete on contract_templates" ON public.contract_templates
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
  );
