import { SupabaseClient } from '@supabase/supabase-js';

export async function generateDynamicNotifications(supabase: SupabaseClient, userId: string, role: string, tenantId: string) {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 1. Check Contract & ID Expirations (30 days prior)
    // Query user profile
    const { data: profile } = await supabase
      .from('users')
      .select('contract_end_date, full_name')
      .eq('id', userId)
      .single();

    if (profile && profile.contract_end_date) {
      const expiryDate = new Date(profile.contract_end_date);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && diffDays <= 30) {
        const notifTitle = 'Contract Expiration Warning';
        const notifMsg = `Your employment contract is expiring in ${diffDays} days (on ${profile.contract_end_date}).`;

        // Check if already notified
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'contract_expiry')
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from('notifications').insert({
            tenant_id: tenantId,
            user_id: userId,
            title: notifTitle,
            message: notifMsg,
            type: 'contract_expiry',
            is_read: false
          });
        }
      }
    }

    // 2. Evaluation Nudges for Managers (Between 22nd and 25th of the month)
    if (role === 'manager' || role === 'super_admin') {
      const dayOfMonth = today.getDate();
      if (dayOfMonth >= 22 && dayOfMonth <= 25) {
        const monthStartStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const notifTitle = 'Monthly Evaluation Nudge';
        const notifMsg = 'Reminder: Please submit performance evaluations for your team before the 25th deadline.';

        // Check if already notified this month
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'evaluation_nudge')
          .gte('created_at', monthStartStr)
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from('notifications').insert({
            tenant_id: tenantId,
            user_id: userId,
            title: notifTitle,
            message: notifMsg,
            type: 'evaluation_nudge',
            is_read: false
          });
        }
      }
    }

    // 3. Pending Financial Approvals for Admins
    if (role === 'super_admin') {
      const { data: pendingAdjustments } = await supabase
        .from('financial_adjustments')
        .select('id')
        .eq('status', 'pending');

      const { data: pendingAdvances } = await supabase
        .from('advances')
        .select('id')
        .eq('status', 'pending');

      const totalPending = (pendingAdjustments?.length || 0) + (pendingAdvances?.length || 0);

      if (totalPending > 0) {
        const notifTitle = 'Pending Financial Approvals';
        const notifMsg = `You have ${totalPending} pending adjustments/advances awaiting your review.`;

        // Check if already notified recently (last 24 hours)
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'financial_approval')
          .gt('created_at', yesterday)
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from('notifications').insert({
            tenant_id: tenantId,
            user_id: userId,
            title: notifTitle,
            message: notifMsg,
            type: 'financial_approval',
            is_read: false
          });
        }
      }
    }

    // 4. Assigned Targets for Employees
    const { data: activeTargets } = await supabase
      .from('employee_targets')
      .select('id, unit, target_value, start_date')
      .eq('user_id', userId)
      .gte('end_date', todayStr);

    if (activeTargets && activeTargets.length > 0) {
      for (const target of activeTargets) {
        const notifTitle = 'New Target Assigned';
        const notifMsg = `You have been assigned a target of ${target.target_value} ${target.unit} starting ${target.start_date}.`;

        // Check if already notified for this target ID
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'target_assigned')
          .like('message', `%${target.start_date}%`)
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from('notifications').insert({
            tenant_id: tenantId,
            user_id: userId,
            title: notifTitle,
            message: notifMsg,
            type: 'target_assigned',
            is_read: false
          });
        }
      }
    }

  } catch (e) {
    console.error('Error generating dynamic notifications:', e);
  }
}
