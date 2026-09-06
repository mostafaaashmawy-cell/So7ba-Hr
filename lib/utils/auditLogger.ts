import { SupabaseClient } from '@supabase/supabase-js';

export interface AuditLogPayload {
  tenant_id: string;
  actor_id: string;
  action_type: string; // e.g. "AUTH_LOGIN", "USER_CREATE", "USER_UPDATE", "ROLE_CHANGE", "SALARY_UPDATE", "PAYROLL_RUN", "BONUS_PENALTY_APPROVAL", "SHIFT_SWAP_APPROVAL", "POLICY_UPDATE", "DOCUMENT_UPLOAD", "GEOFENCE_OVERRIDE"
  target_entity?: string; // e.g. "users", "payroll", "shifts", "company_settings", "contracts", "financial_adjustments"
  target_id?: string | null;
  entity_name?: string; // backward compatibility alias
  entity_id?: string | null; // backward compatibility alias
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export async function logAuditAction(supabase: SupabaseClient, payload: AuditLogPayload) {
  try {
    const finalEntity = payload.target_entity || payload.entity_name || 'general';
    const finalTargetId = payload.target_id !== undefined ? payload.target_id : (payload.entity_id || null);

    const { error } = await supabase.from('system_audit_logs').insert({
      tenant_id: payload.tenant_id,
      actor_id: payload.actor_id,
      action_type: payload.action_type,
      entity_name: finalEntity,
      target_entity: finalEntity,
      entity_id: finalTargetId,
      target_id: finalTargetId,
      old_values: payload.old_values || null,
      new_values: payload.new_values || null,
      details: payload.details || {},
      ip_address: payload.ip_address || null,
      user_agent: payload.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
    });

    if (error) {
      console.warn('Could not write audit log:', error.message);
    }
  } catch (err) {
    console.warn('Audit logger exception:', err);
  }
}
