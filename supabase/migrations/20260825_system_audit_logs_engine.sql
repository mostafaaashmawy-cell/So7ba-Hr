-- ==============================================================================
-- HumAi Platform: Standalone Administrative Audit Trail Engine
-- Migration:  20260825_system_audit_logs_engine.sql
-- Description: Extends system_audit_logs with target_entity, diff snapshots & indexes
-- ==============================================================================

-- 1. EXTEND SYSTEM AUDIT LOGS TABLE
ALTER TABLE public.system_audit_logs ADD COLUMN IF NOT EXISTS target_entity TEXT;
ALTER TABLE public.system_audit_logs ADD COLUMN IF NOT EXISTS target_id     TEXT;
ALTER TABLE public.system_audit_logs ADD COLUMN IF NOT EXISTS ip_address    TEXT;
ALTER TABLE public.system_audit_logs ADD COLUMN IF NOT EXISTS user_agent    TEXT;
ALTER TABLE public.system_audit_logs ADD COLUMN IF NOT EXISTS old_values    JSONB;
ALTER TABLE public.system_audit_logs ADD COLUMN IF NOT EXISTS new_values    JSONB;

-- Sync columns with legacy entity_name & entity_id
UPDATE public.system_audit_logs
SET target_entity = entity_name
WHERE target_entity IS NULL AND entity_name IS NOT NULL;

UPDATE public.system_audit_logs
SET target_id = entity_id
WHERE target_id IS NULL AND entity_id IS NOT NULL;

UPDATE public.system_audit_logs
SET entity_name = target_entity
WHERE entity_name IS NULL AND target_entity IS NOT NULL;

UPDATE public.system_audit_logs
SET entity_id = target_id
WHERE entity_id IS NULL AND target_id IS NOT NULL;

-- 2. ENSURE STRICT RLS
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit: super_admin view own tenant" ON public.system_audit_logs;
CREATE POLICY "Audit: super_admin view own tenant" ON public.system_audit_logs
    FOR SELECT USING (
        tenant_id = public.auth_tenant_id() 
        AND public.auth_user_role() = 'super_admin'
    );

DROP POLICY IF EXISTS "Audit: insert by actor in same tenant" ON public.system_audit_logs;
CREATE POLICY "Audit: insert by actor in same tenant" ON public.system_audit_logs
    FOR INSERT WITH CHECK (
        actor_id = auth.uid()
        AND tenant_id = public.auth_tenant_id()
    );

-- 3. PERFORMANCE INDEXES FOR LOG ANALYSIS DATA GRID
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created_desc ON public.system_audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_action       ON public.system_audit_logs(tenant_id, action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_actor        ON public.system_audit_logs(tenant_id, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_target       ON public.system_audit_logs(tenant_id, target_entity);
