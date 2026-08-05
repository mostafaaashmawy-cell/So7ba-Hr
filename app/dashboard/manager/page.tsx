import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import TeamOverviewTable from '@/components/manager/TeamOverviewTable';
import HolidayWorkForm from '@/components/manager/HolidayWorkForm';
import { UserProfile, AttendanceRecord, LeavePermissionRecord, KpiEntryRecord } from '@/lib/types/database';

export default async function ManagerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Fetch Manager Profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  const manager = userProfile as UserProfile;

  if (manager?.role !== 'manager' && manager?.role !== 'super_admin') {
    redirect('/dashboard/employee');
  }

  // Fetch Team Members assigned to manager
  const teamQuery = supabase.from('users').select('*');
  if (manager.role === 'manager') {
    teamQuery.eq('manager_id', authUser.id);
  }
  const { data: teamMembers } = await teamQuery;

  const teamIds = (teamMembers || []).map((m) => m.id);

  // Fetch Attendance Records
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('*, user:users(*)')
    .in('user_id', teamIds.length > 0 ? teamIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false });

  // Fetch Leave Records
  const { data: leaveRecords } = await supabase
    .from('leaves_permissions')
    .select('*, user:users(*)')
    .in('user_id', teamIds.length > 0 ? teamIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false });

  // Fetch KPI Records
  const { data: kpiRecords } = await supabase
    .from('kpi_entries')
    .select('*, user:users(*)')
    .in('user_id', teamIds.length > 0 ? teamIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={manager} activeRoleView="manager" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Team Overview Dashboard */}
        <TeamOverviewTable
          teamMembers={(teamMembers as UserProfile[]) || []}
          attendanceRecords={(attendanceRecords as AttendanceRecord[]) || []}
          leaveRecords={(leaveRecords as LeavePermissionRecord[]) || []}
          kpiRecords={(kpiRecords as KpiEntryRecord[]) || []}
        />

        {/* Manager-only Holiday Working Days Compensation Section */}
        <HolidayWorkForm
          teamMembers={(teamMembers as UserProfile[]) || []}
          currentUserId={authUser.id}
          isSuperAdmin={manager.role === 'super_admin'}
        />
      </main>
    </div>
  );
}
