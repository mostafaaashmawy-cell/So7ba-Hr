import { SupabaseClient } from '@supabase/supabase-js';

export interface AuditLogPayload {
  tenant_id: string;
  actor_id: string;
  action_type: string; // e.g. "UPDATE_SETTINGS", "APPROVE_SHIFT_SWAP", "RECORD_OVERRIDE", "UPDATE_EMPLOYEE"
  entity_name: string; // e.g. "tenant_settings", "shift_swap_requests", "attendance", "users"
  entity_id?: string | null;
  details?: Record<string, unknown>;
}

export async function logAuditAction(supabase: SupabaseClient, payload: AuditLogPayload) {
  try {
    const { error } = await supabase.from('system_audit_logs').insert({
      tenant_id: payload.tenant_id,
      actor_id: payload.actor_id,
      action_type: payload.action_type,
      entity_name: payload.entity_name,
      entity_id: payload.entity_id || null,
      details: payload.details || {},
    });

    if (error) {
      console.warn('Could not write audit log:', error.message);
    }
  } catch (err) {
    console.warn('Audit logger exception:', err);
  }
}
