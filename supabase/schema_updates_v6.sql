-- Schema Updates V6: HumAi Advanced Settings & Holiday Comp Global Toggle

-- 1. Add enable_holiday_work_comp to tenant_settings
ALTER TABLE public.tenant_settings 
  ADD COLUMN IF NOT EXISTS enable_holiday_work_comp BOOLEAN DEFAULT TRUE;

-- 2. Update comments
COMMENT ON COLUMN public.tenant_settings.enable_holiday_work_comp IS 'Global toggle to enable or disable holiday work compensation system';
