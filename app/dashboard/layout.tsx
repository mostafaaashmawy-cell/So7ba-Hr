import React from 'react';
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

  let userProfile: UserProfile | null = null;
  if (authUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profile) {
      userProfile = profile as UserProfile;
    }
  }

  return <AppLayout user={userProfile}>{children}</AppLayout>;
}
