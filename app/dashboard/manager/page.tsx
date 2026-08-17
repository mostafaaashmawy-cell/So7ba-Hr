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
import StatCards from '@/components/dashboard/StatCards';
import HomeTaskAnalytics from '@/components/dashboard/HomeTaskAnalytics';

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

  if (userProfile && !userProfile.tenant_id) {
    redirect('/onboarding');
  }

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

  const totalTeam = teamMembers?.length || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const activeToday =
    attendanceRecords?.filter(
      (a) => a.date === todayStr || a.check_in_time?.startsWith(todayStr)
    ).length || 0;
  const totalLeaves = leaveRecords?.length || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={manager} activeRoleView="manager" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Stat Cards for Team */}
        <StatCards
          totalEmployees={totalTeam}
          activeToday={activeToday}
          totalLeavesMonth={totalLeaves}
          avgPerformance={4.4}
          totalPayrollEgp={totalTeam * 6500}
        />

        {/* MANAGER COMMAND CENTER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/evaluations"
            className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Evaluations</h3>
                <p className="text-[11px] text-slate-400">Rate and review team performance</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>

          <Link
            href="/dashboard/sales"
            className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sales Logging</h3>
                <p className="text-[11px] text-slate-400">Approve client sales & commissions</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>

          <Link
            href="/dashboard/targets"
            className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Targets Board</h3>
                <p className="text-[11px] text-slate-400">Set and validate goals achievements</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Monthly Task Completion & Target Progress Analytics */}
        <HomeTaskAnalytics />

        {/* Team Overview Dashboard */}
        <TeamOverviewTable
          teamMembers={(teamMembers as UserProfile[]) || []}
          attendanceRecords={(attendanceRecords as AttendanceRecord[]) || []}
          leaveRecords={(leaveRecords as LeavePermissionRecord[]) || []}
          kpiRecords={(kpiRecords as KpiEntryRecord[]) || []}
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
