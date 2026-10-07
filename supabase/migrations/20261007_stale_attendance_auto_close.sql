-- Migration: 20261007_stale_attendance_auto_close.sql
-- Description: Adds missing checkout support and PostgreSQL function to automatically close stale attendance sessions from prior days with overnight shift support.

ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS check_out_note text,
ADD COLUMN IF NOT EXISTS is_missing_checkout boolean DEFAULT false;

CREATE OR REPLACE FUNCTION public.auto_close_stale_attendance(
  p_user_id uuid DEFAULT NULL,
  p_tenant_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer := 0;
  v_cairo_now timestamptz;
BEGIN
  v_cairo_now := CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Cairo';

  WITH stale_records AS (
    SELECT 
      a.id,
      a.date,
      a.check_in_time,
      CASE 
        -- If shift exists with start and end time:
        WHEN s.end_time IS NOT NULL AND s.start_time IS NOT NULL THEN
          CASE 
            -- Overnight shift (end_time < start_time): add 1 day to end_time
            WHEN s.end_time::time < s.start_time::time THEN
              (a.check_in_time::date + interval '1 day' + s.end_time::time)
            ELSE
              (a.check_in_time::date + s.end_time::time)
          END
        -- If tenant setting work_end_time exists:
        WHEN ts.work_end_time IS NOT NULL THEN
          (a.check_in_time::date + ts.work_end_time::time)
        -- Fallback: standard 8-hour shift
        ELSE 
          a.check_in_time + interval '8 hours'
      END AS resolved_check_out
    FROM public.attendance a
    LEFT JOIN public.users u ON u.id = a.user_id
    LEFT JOIN public.shifts s ON s.id = u.shift_id
    LEFT JOIN public.tenant_settings ts ON ts.tenant_id = a.tenant_id
    WHERE a.check_out_time IS NULL
      AND (
        -- Stale if checked in on a prior day AND at least 14 hours have elapsed
        (a.date < v_cairo_now::date AND a.check_in_time < NOW() - interval '14 hours')
        -- OR unconditionally stale if older than 20 hours
        OR a.check_in_time < NOW() - interval '20 hours'
      )
      AND (p_user_id IS NULL OR a.user_id = p_user_id)
      AND (p_tenant_id IS NULL OR a.tenant_id = p_tenant_id)
  ),
  updated AS (
    UPDATE public.attendance a
    SET 
      check_out_time = sr.resolved_check_out,
      is_missing_checkout = true,
      check_out_note = 'إغلاق تلقائي: نسيت تسجيل الإنصراف (Auto-closed: forgotten check-out)',
      overtime_minutes = 0
    FROM stale_records sr
    WHERE a.id = sr.id
    RETURNING a.id
  )
  SELECT count(*) INTO v_count FROM updated;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_close_stale_attendance(uuid, uuid) TO authenticated, service_role, anon;
