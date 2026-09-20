import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, is_platform_admin, tenant_id')
    .eq('id', user.id)
    .single();

  // Profile null guard — orphaned auth user or RLS blocked
  if (!profile) {
    redirect('/login');
  }

  // Platform owner goes to platform console
  if (profile.is_platform_admin) {
    redirect('/platform-admin');
  }

  // No tenant — needs to complete onboarding
  if (!profile.tenant_id) {
    redirect('/onboarding');
  }

  if (profile.role === 'super_admin') {
    redirect('/dashboard/admin');
  } else if (profile.role === 'manager') {
    redirect('/dashboard/manager');
  } else {
    redirect('/dashboard/employee');
  }
}
