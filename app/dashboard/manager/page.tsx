import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import TeamOverviewTable from '@/components/manager/TeamOverviewTable';
import HolidayWorkForm from '@/components/manager/HolidayWorkForm';
import {
  UserProfile,
  AttendanceRecord,
  LeavePermissionRecord,
  KpiEntryRecord,
} from '@/lib/types/database';
import TeamRequestsApprovalCenter from '@/components/manager/TeamRequestsApprovalCenter';
import HomeTaskAnalytics from '@/components/dashboard/HomeTaskAnalytics';
import ManagerActionCards from '@/components/manager/ManagerActionCards';

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

  if (!userProfile) {
    redirect('/login');
  }

  if (!userProfile.tenant_id) {
    redirect('/onboarding');
  }

  const manager = userProfile as UserProfile;

  if (manager?.role !== 'manager' && manager?.role !== 'super_admin') {
    redirect('/dashboard/employee');
  }

  // Fetch Tenant Settings to check approval workflow
  const { data: tenantSettings } = await supabase
    .from('tenant_settings')
    .select('leave_approval_mode')
    .eq('tenant_id', manager.tenant_id)
    .maybeSingle();

  const isHierarchicalApproval = tenantSettings?.leave_approval_mode === 'hierarchical';

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

  // Fetch Evaluations for team average
  const { data: teamEvals } = await supabase
    .from('evaluations')
    .select('star_punctuality, star_quality, star_problem_solving, star_communication')
    .in('user_id', teamIds.length > 0 ? teamIds : ['00000000-0000-0000-0000-000000000000']);

  let avgPerformance = 4.8;
  if (teamEvals && teamEvals.length > 0) {
    const totalScore = teamEvals.reduce((acc, curr) => {
      const rowAvg =
        (Number(curr.star_punctuality || 0) +
          Number(curr.star_quality || 0) +
          Number(curr.star_problem_solving || 0) +
          Number(curr.star_communication || 0)) /
        4;
      return acc + rowAvg;
    }, 0);
    avgPerformance = Number((totalScore / teamEvals.length).toFixed(1)) || 4.8;
  }

  const totalTeam = teamMembers?.length || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const activeToday =
    attendanceRecords?.filter(
      (a) => a.date === todayStr || a.check_in_time?.startsWith(todayStr)
    ).length || 0;
  const totalLeaves = leaveRecords?.length || 0;

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={manager} activeRoleView="manager" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* MANAGER COMMAND CENTER (Localized) */}
        <ManagerActionCards />

        {/* Monthly Task Completion & Target Progress Analytics */}
        <HomeTaskAnalytics />

        {/* Team Requests Approval Center (Leaves & Permissions) - Strictly visible when Hierarchical Mode is active */}
        {isHierarchicalApproval && (
          <TeamRequestsApprovalCenter
            initialRequests={(leaveRecords as LeavePermissionRecord[]) || []}
            teamMembers={(teamMembers as UserProfile[]) || []}
            currentUserId={authUser.id}
            currentUserRole={manager.role === 'super_admin' ? 'super_admin' : 'manager'}
            tenantId={manager.tenant_id}
          />
        )}

        {/* Team Overview Dashboard */}
        <TeamOverviewTable
          teamMembers={(teamMembers as UserProfile[]) || []}
          attendanceRecords={(attendanceRecords as AttendanceRecord[]) || []}
          leaveRecords={(leaveRecords as LeavePermissionRecord[]) || []}
          kpiRecords={(kpiRecords as KpiEntryRecord[]) || []}
          isSuperAdmin={manager?.role === 'super_admin'}
        />

        {/* Holiday Work Compensations Form */}
        <div id="holiday-compensation" className="scroll-mt-24">
          <HolidayWorkForm
            teamMembers={(teamMembers as UserProfile[]) || []}
            currentUserId={authUser.id}
            isSuperAdmin={manager?.role === 'super_admin'}
          />
        </div>
      </main>
    </div>
  );
}
