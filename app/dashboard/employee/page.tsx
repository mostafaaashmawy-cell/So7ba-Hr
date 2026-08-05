import React from 'react';
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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={user} activeRoleView="employee" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <WelcomeHeader
          fullName={user?.full_name}
          kpiUnit={user?.kpi_unit || 'tasks'}
        />

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
