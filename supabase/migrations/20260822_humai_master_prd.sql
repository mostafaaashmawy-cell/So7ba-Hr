-- ==============================================================================
-- HumAi SaaS Upgrade: Shifts Engine, Swaps, Remote/Flexible, Overtime & Audit Logs
-- ==============================================================================

-- 1. Shifts Definition Table
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Morning Shift (08:00 - 16:00)"
    start_time TEXT NOT NULL DEFAULT '08:00',
    end_time TEXT NOT NULL DEFAULT '16:00',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shifts in their tenant" ON public.shifts
    FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Super Admins can manage shifts" ON public.shifts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_admin' 
            AND tenant_id = public.shifts.tenant_id
        )
    );

-- 2. Shift Swap Requests Table
CREATE TABLE IF NOT EXISTS public.shift_swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    requested_date DATE NOT NULL,
    requester_shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
    target_shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending_admin' CHECK (status IN ('pending_admin', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ
);

-- Enable RLS on shift_swap_requests
ALTER TABLE public.shift_swap_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view swap requests in their tenant" ON public.shift_swap_requests
    FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Users can create swap requests" ON public.shift_swap_requests
    FOR INSERT WITH CHECK (
        requester_id = auth.uid()
    );

CREATE POLICY "Super Admins can manage and review swap requests" ON public.shift_swap_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_admin' 
            AND tenant_id = public.shift_swap_requests.tenant_id
        )
    );

-- 3. System Audit Logs Table
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- e.g. "UPDATE_SETTINGS", "APPROVE_SHIFT_SWAP", "RECORD_OVERRIDE"
    entity_name TEXT NOT NULL, -- e.g. "tenant_settings", "shift_swap_requests", "attendance"
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on system_audit_logs
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can view audit logs" ON public.system_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_admin' 
            AND tenant_id = public.system_audit_logs.tenant_id
        )
    );

CREATE POLICY "System and Admins can insert audit logs" ON public.system_audit_logs
    FOR INSERT WITH CHECK (
        actor_id = auth.uid()
    );

-- 4. Extend Users Table with Remote, Flexible, and Shift columns
ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_flexible BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS required_daily_hours NUMERIC DEFAULT 8,
    ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL;

-- 5. Extend Tenant Settings with Overtime Configurations
ALTER TABLE public.tenant_settings
    ADD COLUMN IF NOT EXISTS enable_overtime BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS overtime_rate_multiplier NUMERIC DEFAULT 1.5,
    ADD COLUMN IF NOT EXISTS overtime_calculation_mode TEXT DEFAULT 'multiplier',
    ADD COLUMN IF NOT EXISTS overtime_fixed_rate NUMERIC DEFAULT 50;
