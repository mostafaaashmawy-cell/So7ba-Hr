import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import AppLayout from '@/components/layout/AppLayout';
import { UserProfile } from '@/lib/types/database';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isCapture = cookieStore.get('humai-capture-user')?.value === 'super_admin';

  let userProfile: UserProfile | null = null;
  const targetUserId = authUser?.id || (isCapture ? '505cd64e-1e84-43c2-a623-a67f24af3144' : null);

  if (targetUserId) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .maybeSingle();

    if (profile) {
      userProfile = profile as UserProfile;
    }
  }

  return <AppLayout user={userProfile}>{children}</AppLayout>;
}
