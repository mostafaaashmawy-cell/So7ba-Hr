-- Migration: 20261008_security_hardening.sql
-- Production Security Hardening & Strict Multi-Tenant Isolation
-- Applied and verified on production Supabase database

-- 1. Departments Policy Hardening (Eliminate cross-tenant write/read)
ALTER POLICY "Allow read access to departments" ON public.departments 
  USING (tenant_id = auth_tenant_id());

ALTER POLICY "Allow admin write access to departments" ON public.departments 
  USING ((tenant_id = auth_tenant_id()) AND (auth_user_role() = 'super_admin'::text))
  WITH CHECK ((tenant_id = auth_tenant_id()) AND (auth_user_role() = 'super_admin'::text));

-- 2. KPI Units Policy Hardening (Eliminate cross-tenant read/write)
ALTER POLICY "Allow read access to KPI units" ON public.kpi_units 
  USING (tenant_id = auth_tenant_id());

ALTER POLICY "Allow admin write access to KPI units" ON public.kpi_units 
  USING ((tenant_id = auth_tenant_id()) AND (auth_user_role() = 'super_admin'))
  WITH CHECK ((tenant_id = auth_tenant_id()) AND (auth_user_role() = 'super_admin'));

-- 3. Holiday Work Policies (Ensure tenant-scoped management)
ALTER POLICY "Allow admin delete access to holiday_work" ON public.holiday_work 
  USING ((tenant_id = auth_tenant_id()) AND (auth_user_role() = 'super_admin'::text));

ALTER POLICY "Allow manager/admin insert access to holiday_work" ON public.holiday_work 
  WITH CHECK ((tenant_id = auth_tenant_id()) AND (auth_user_role() = ANY (ARRAY['manager'::text, 'super_admin'::text])));

ALTER POLICY "Allow read access to holiday_work" ON public.holiday_work 
  USING ((tenant_id = auth_tenant_id()) AND ((user_id = auth.uid()) OR (auth_user_role() = 'super_admin'::text) OR ((auth_user_role() = 'manager'::text) AND (EXISTS (SELECT 1 FROM users u WHERE u.id = holiday_work.user_id AND u.manager_id = auth.uid())))));

-- 4. Attendance Policies Hardening (Prevent tenant ID spoofing)
ALTER POLICY "Attendance: insert self or admin" ON public.attendance 
  WITH CHECK ((tenant_id = auth_tenant_id()) AND ((user_id = auth.uid()) OR (auth_user_role() = 'super_admin'::text)));

ALTER POLICY "Attendance: update self or admin" ON public.attendance 
  USING ((tenant_id = auth_tenant_id()) AND ((user_id = auth.uid()) OR (auth_user_role() = 'super_admin'::text)))
  WITH CHECK ((tenant_id = auth_tenant_id()) AND ((user_id = auth.uid()) OR (auth_user_role() = 'super_admin'::text)));

-- 5. Leaves & KPI Insert/Update Hardening
ALTER POLICY "KPI: insert self or admin" ON public.kpi_entries 
  WITH CHECK ((tenant_id = auth_tenant_id()) AND ((user_id = auth.uid()) OR (auth_user_role() = 'super_admin'::text)));

ALTER POLICY "Leaves: insert self or admin" ON public.leaves_permissions 
  WITH CHECK ((tenant_id = auth_tenant_id()) AND ((user_id = auth.uid()) OR (auth_user_role() = 'super_admin'::text)));

ALTER POLICY "Leaves: update by manager or admin" ON public.leaves_permissions 
  USING (tenant_id = auth_tenant_id() AND ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM users u WHERE u.id = leaves_permissions.user_id AND u.tenant_id = auth_tenant_id() AND (u.manager_id = auth.uid() OR EXISTS (SELECT 1 FROM users me WHERE me.id = auth.uid() AND me.tenant_id = auth_tenant_id() AND me.role = 'super_admin'::user_role))))));

-- 6. Tenant Invitations Isolation
ALTER POLICY "Super Admins can view invitations in their tenant" ON public.tenant_invitations 
  USING ((auth.uid() = created_by) OR is_current_platform_admin());

-- 7. Secure Search Path for Stored Procedures
ALTER FUNCTION check_user_role_update() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION handle_new_user() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION get_current_by_role_manager_or_admin(uuid) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION get_current_tenant_id() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION get_current_user_role() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION tenant_policy_check(uuid) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION auto_close_stale_attendance() SET search_path TO 'public', 'pg_temp';

-- 8. Stored Procedure Multi-Tenant Verification: get_employee_info
CREATE OR REPLACE FUNCTION get_employee_info(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_caller_tid UUID;
  v_is_platform_admin BOOLEAN := false;
BEGIN
  v_caller_tid := auth_tenant_id();
  v_is_platform_admin := is_current_platform_admin();

  IF NOT v_is_platform_admin AND (v_caller_tid IS NULL OR v_caller_tid <> p_tenant_id) THEN
    RETURN '[]'::jsonb;
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', u.id,
        'full_name', COALESCE(u.full_name_ar, u.full_name),
        'email', u.email,
        'role', u.role,
        'department_id', u.department_id,
        'department_name', d.name,
        'base_salary', u.base_salary,
        'hire_date', u.hire_date,
        'is_active', u.is_active,
        'contract_type', u.contract_type,
        'shift_id', u.shift_id
      )
    )
    FROM public.users u
    LEFT JOIN public.departments d ON d.id = u.department_id
    WHERE u.tenant_id = p_tenant_id
      AND u.is_active = true
  ), '[]'::jsonb);
END;
$$;

-- 9. Stored Procedure Multi-Tenant Verification: get_attendance_summary
CREATE OR REPLACE FUNCTION get_attendance_summary(p_tenant_id UUID, p_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_caller_tid UUID;
  v_is_platform_admin BOOLEAN := false;
  v_result JSONB;
BEGIN
  v_caller_tid := auth_tenant_id();
  v_is_platform_admin := is_current_platform_admin();

  IF NOT v_is_platform_admin AND (v_caller_tid IS NULL OR v_caller_tid <> p_tenant_id) THEN
    RETURN jsonb_build_object(
      'error', 'Unauthorized: Tenant isolation mismatch',
      'date', p_date,
      'summary', '[]'::jsonb
    );
  END IF;

  SELECT jsonb_build_object(
    'date', p_date,
    'total_present', COUNT(DISTINCT a.user_id) FILTER (WHERE a.clock_in IS NOT NULL),
    'total_late', COUNT(DISTINCT a.user_id) FILTER (WHERE a.status = 'late'),
    'records', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'user_id', a.user_id,
          'employee_name', COALESCE(u.full_name_ar, u.full_name),
          'clock_in', a.clock_in,
          'clock_out', a.clock_out,
          'status', a.status,
          'work_hours', a.work_hours,
          'overtime_hours', a.overtime_hours
        )
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::jsonb
    )
  ) INTO v_result
  FROM public.attendance a
  JOIN public.users u ON u.id = a.user_id
  WHERE a.tenant_id = p_tenant_id
    AND a.date = p_date;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 10. Stored Procedure Multi-Tenant Verification: get_leaves_summary
CREATE OR REPLACE FUNCTION get_leaves_summary(p_tenant_id UUID, p_month TEXT, p_dept_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_caller_tid UUID;
  v_is_platform_admin BOOLEAN := false;
  v_start_date DATE;
  v_end_date   DATE;
  v_result     JSONB;
BEGIN
  v_caller_tid := auth_tenant_id();
  v_is_platform_admin := is_current_platform_admin();

  IF NOT v_is_platform_admin AND (v_caller_tid IS NULL OR v_caller_tid <> p_tenant_id) THEN
    RETURN jsonb_build_object(
      'error', 'Unauthorized: Tenant isolation mismatch',
      'month', p_month,
      'department', p_dept_id,
      'leaves', '[]'::jsonb
    );
  END IF;

  BEGIN
    v_start_date := TO_DATE(TRIM(p_month) || '-01', 'YYYY-MM-DD');
  EXCEPTION WHEN OTHERS THEN
    v_start_date := DATE_TRUNC('month', (NOW() AT TIME ZONE 'Africa/Cairo'))::DATE;
  END;
  v_end_date := (v_start_date + INTERVAL '1 month - 1 day')::DATE;

  SELECT jsonb_build_object(
    'month',       TO_CHAR(v_start_date, 'YYYY-MM'),
    'department',  p_dept_id,
    'leaves', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'employee_id',        u.id,
          'employee_name',      COALESCE(u.full_name_ar, u.full_name),
          'department_id',      u.department_id,
          'leave_type',         lp.type,
          'date',               lp.date,
          'status',             lp.status,
          'timeframe',          lp.timeframe,
          'annual_allowance',   COALESCE(u.annual_leave_allowance, 21),
          'annual_taken_ytd',   (
            SELECT COUNT(*)::int
            FROM public.leaves_permissions lp2
            WHERE lp2.user_id = u.id
              AND lp2.tenant_id = p_tenant_id
              AND EXTRACT(YEAR FROM lp2.date) = EXTRACT(YEAR FROM v_start_date)
              AND lp2.status = 'approved'
              AND lp2.type::text = 'annual'
          ),
          'annual_remaining',   (
            COALESCE(u.annual_leave_allowance, 21) - (
              SELECT COUNT(*)::int
              FROM public.leaves_permissions lp3
              WHERE lp3.user_id = u.id
                AND lp3.tenant_id = p_tenant_id
                AND EXTRACT(YEAR FROM lp3.date) = EXTRACT(YEAR FROM v_start_date)
                AND lp3.status = 'approved'
                AND lp3.type::text = 'annual'
            )
          )
        ) ORDER BY lp.date
      )
      FROM public.leaves_permissions lp
      JOIN public.users u ON u.id = lp.user_id
      WHERE lp.tenant_id = p_tenant_id
        AND lp.date BETWEEN v_start_date AND v_end_date
        AND (p_dept_id IS NULL OR u.department_id = p_dept_id)
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 11. Stored Procedure Multi-Tenant Verification: add_financial_adjustment
CREATE OR REPLACE FUNCTION add_financial_adjustment(
  p_tenant_id uuid,
  p_user_id uuid,
  p_type text,
  p_amount numeric,
  p_reason text,
  p_created_by uuid
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_caller_tid UUID;
  v_caller_uid UUID;
  v_is_platform_admin BOOLEAN := false;
  v_new_id     UUID;
  v_emp_name   TEXT;
  v_emp_dept   UUID;
  v_actor_role TEXT;
  v_actor_dept UUID;
  v_dup_id     UUID;
BEGIN
  v_caller_tid := auth_tenant_id();
  v_caller_uid := auth.uid();
  v_is_platform_admin := is_current_platform_admin();

  IF NOT v_is_platform_admin THEN
    IF v_caller_tid IS NULL OR v_caller_tid <> p_tenant_id THEN
      RETURN jsonb_build_object(
        'success', false,
        'error',   'عفواً، لا يمكنك إجراء عمليات لمؤسسة أخرى.'
      );
    END IF;
    IF v_caller_uid IS NULL OR v_caller_uid <> p_created_by THEN
      p_created_by := v_caller_uid;
    END IF;
  END IF;

  IF p_type NOT IN ('bonus', 'deduction', 'expense') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'نوع العملية غير صحيح. يجب أن يكون: bonus أو deduction أو expense.'
    );
  END IF;

  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'المبلغ يجب أن يكون رقماً موجباً أكبر من صفر.'
    );
  END IF;

  SELECT role::text, department_id
    INTO v_actor_role, v_actor_dept
    FROM public.users
   WHERE id = p_created_by AND tenant_id = p_tenant_id;

  IF v_actor_role IS NULL OR v_actor_role NOT IN ('super_admin', 'manager') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'عفواً، ليس لديك صلاحية إدارية لتسجيل عمليات مالية.'
    );
  END IF;

  SELECT COALESCE(full_name_ar, full_name), department_id
    INTO v_emp_name, v_emp_dept
    FROM public.users
   WHERE id = p_user_id AND tenant_id = p_tenant_id;

  IF v_emp_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'الموظف غير موجود في هذه المؤسسة أو لا ينتمي إليها.'
    );
  END IF;

  IF v_actor_role = 'manager' AND (v_actor_dept IS NULL OR v_actor_dept != v_emp_dept) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'عفواً، صلاحيات المدير تقتصر على موظفي قسمه فقط.'
    );
  END IF;

  SELECT id INTO v_dup_id
    FROM public.financial_adjustments
   WHERE tenant_id = p_tenant_id
     AND user_id = p_user_id
     AND type = p_type
     AND amount = p_amount
     AND date = (NOW() AT TIME ZONE 'Africa/Cairo')::DATE
     AND created_at >= (NOW() - INTERVAL '10 minutes')
   LIMIT 1;

  IF v_dup_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success',   true,
      'duplicate', true,
      'message',   '⚠️ تم تسجيل هذه العملية المالية مسبقاً لهذا الموظف لتجنب التكرار والازدواجية.'
    );
  END IF;

  INSERT INTO public.financial_adjustments
    (tenant_id, user_id, type, amount, date, status, notes, created_by)
  VALUES
    (p_tenant_id, p_user_id, p_type, p_amount,
     (NOW() AT TIME ZONE 'Africa/Cairo')::DATE,
     'approved', p_reason, p_created_by)
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'success',       true,
    'duplicate',     false,
    'adjustment_id', v_new_id,
    'employee_name', v_emp_name,
    'type',          p_type,
    'amount',        p_amount,
    'reason',        p_reason,
    'message',       '✅ تم تسجيل ' || p_type || ' بقيمة ' || p_amount || ' جنيه للموظف ' || v_emp_name || ' بنجاح.'
  );
END;
$$;

-- 12. High-Performance Multi-Tenant Indexes
CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON public.departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_holiday_work_tenant_id ON public.holiday_work(tenant_id);
CREATE INDEX IF NOT EXISTS idx_holiday_work_records_tenant_id ON public.holiday_work_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kpi_units_tenant_id ON public.kpi_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_user_date ON public.attendance(tenant_id, user_id, date);
CREATE INDEX IF NOT EXISTS idx_leaves_tenant_user_date ON public.leaves_permissions(tenant_id, user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_invitations_token ON public.tenant_invitations(token);
