-- Fix RLS defaults and BEFORE INSERT triggers for departments, kpi_units, and employee_targets

-- 1. DEPARTMENTS
ALTER TABLE public.departments ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();

CREATE OR REPLACE FUNCTION public.set_department_tenant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := public.auth_tenant_id();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_department_tenant_id ON public.departments;
CREATE TRIGGER trg_set_department_tenant_id
BEFORE INSERT ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.set_department_tenant_id();

-- 2. KPI UNITS
ALTER TABLE public.kpi_units ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();

CREATE OR REPLACE FUNCTION public.set_kpi_unit_tenant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := public.auth_tenant_id();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_kpi_unit_tenant_id ON public.kpi_units;
CREATE TRIGGER trg_set_kpi_unit_tenant_id
BEFORE INSERT ON public.kpi_units
FOR EACH ROW
EXECUTE FUNCTION public.set_kpi_unit_tenant_id();

-- 3. EMPLOYEE TARGETS
ALTER TABLE public.employee_targets ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();

CREATE OR REPLACE FUNCTION public.set_employee_target_tenant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := public.auth_tenant_id();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_employee_target_tenant_id ON public.employee_targets;
CREATE TRIGGER trg_set_employee_target_tenant_id
BEFORE INSERT ON public.employee_targets
FOR EACH ROW
EXECUTE FUNCTION public.set_employee_target_tenant_id();
