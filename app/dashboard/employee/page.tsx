import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import AttendanceWidget from '@/components/employee/AttendanceWidget';
import LeavePermissionForm from '@/components/employee/LeavePermissionForm';
import KpiTrackerWidget from '@/components/employee/KpiTrackerWidget';
import { UserProfile, AttendanceRecord, LeavePermissionRecord, KpiEntryRecord } from '@/lib/types/database';
import WelcomeHeader from '@/components/employee/WelcomeHeader';

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Fetch User Profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (userProfile && !userProfile.tenant_id) {
    redirect('/onboarding');
  }

  const user = userProfile as UserProfile;
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch Today's Attendance Sessions
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', authUser.id)
    .eq('date', todayStr)
    .order('check_in_time', { ascending: false });

  // Fetch Leaves & Permissions History
  const { data: leavesHistory } = await supabase
    .from('leaves_permissions')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false });

  // Fetch KPI History
  const { data: kpiHistory } = await supabase
    .from('kpi_entries')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false });

  // Fetch Holiday Work Compensations count
  const { data: holidayWorkHistory } = await supabase
    .from('holiday_work')
    .select('id')
    .eq('user_id', authUser.id);

  const holidayWorkCount = holidayWorkHistory?.length || 0;

  // Fetch Tenant Settings
  const { data: tenantSettings } = await supabase
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', user.tenant_id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={user} activeRoleView="employee" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <WelcomeHeader
          fullName={user?.full_name}
          kpiUnit={user?.kpi_unit || 'tasks'}
        />

        {/* EMPLOYEE COMMAND CENTER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(!tenantSettings || tenantSettings.enable_commissions) && (
            <Link href="/dashboard/sales" className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/30 transition-all text-center space-y-2 group">
              <span className="text-xl font-bold text-sky-400 block group-hover:scale-105 transition-all">📈</span>
              <span className="text-xs font-bold text-white block">Log My Sales Achievements</span>
              <span className="text-[10px] text-gray-500 block">Submit logs to get commissions</span>
            </Link>
          )}

          <Link href="/dashboard/targets" className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/30 transition-all text-center space-y-2 group">
            <span className="text-xl font-bold text-sky-400 block group-hover:scale-105 transition-all">🎯</span>
            <span className="text-xs font-bold text-white block">My Operational Targets</span>
            <span className="text-[10px] text-gray-500 block">View my assigned targets vs progress</span>
          </Link>
        </div>

        {/* Attendance Widget */}
        <AttendanceWidget
          userId={authUser.id}
          initialAttendance={(todayAttendance as AttendanceRecord[]) || []}
        />

        {/* Leaves & Permissions Management with Holiday comp balance */}
        <LeavePermissionForm
          userId={authUser.id}
          initialRecords={(leavesHistory as LeavePermissionRecord[]) || []}
          holidayWorkCount={holidayWorkCount}
        />

        {/* KPI Tracker only (Advances removed) */}
        <div>
          <KpiTrackerWidget
            userId={authUser.id}
            kpiUnit={user?.kpi_unit || 'tasks'}
            initialEntries={(kpiHistory as KpiEntryRecord[]) || []}
          />
        </div>
      </main>
    </div>
  );
}
