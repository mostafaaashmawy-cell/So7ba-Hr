import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import AttendanceWidget from '@/components/employee/AttendanceWidget';
import LeavePermissionForm from '@/components/employee/LeavePermissionForm';
import KpiTrackerWidget from '@/components/employee/KpiTrackerWidget';
import ShiftSwapCard from '@/components/employee/ShiftSwapCard';
import {
  UserProfile,
  AttendanceRecord,
  LeavePermissionRecord,
  KpiEntryRecord,
} from '@/lib/types/database';
import WelcomeHeader from '@/components/employee/WelcomeHeader';
import AdvanceRequestModal from '@/components/employee/AdvanceRequestModal';

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Fetch User Profile with Shift details
  const { data: userProfile } = await supabase
    .from('users')
    .select('*, shift:shifts(*)')
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
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={user} activeRoleView="employee" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <WelcomeHeader fullName={user?.full_name} kpiUnit={user?.kpi_unit || 'tasks'} />

        {/* EMPLOYEE COMMAND CENTER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!tenantSettings || tenantSettings.enable_commissions) && (
            <Link
              href="/dashboard/sales"
              className="cleariq-card p-5 cleariq-card-hover flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Log Sales Achievements</h3>
                  <p className="text-[11px] text-slate-400">Submit logs to earn commissions</p>
                </div>
              </div>
              <span className="py-2 px-3 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold transition-all text-center">
                Open Sales Portal
              </span>
            </Link>
          )}

          <Link
            href="/dashboard/targets"
            className="cleariq-card p-5 cleariq-card-hover flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Operational Targets</h3>
                <p className="text-[11px] text-slate-400">View goals vs actual progress</p>
              </div>
            </div>
            <span className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 group-hover:bg-purple-600 group-hover:text-white text-purple-700 dark:text-purple-300 text-xs font-bold transition-all text-center">
              View My Targets
            </span>
          </Link>

          {(!tenantSettings || tenantSettings.enable_advances) && (
            <AdvanceRequestModal
              userId={authUser.id}
              basicSalary={user?.basic_salary || 0}
              tenantSettings={tenantSettings}
            />
          )}
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

        {/* KPI / Performance Daily Logs Widget */}
        <KpiTrackerWidget
          userId={authUser.id}
          kpiUnit={user?.kpi_unit || 'tasks'}
          initialEntries={(kpiHistory as KpiEntryRecord[]) || []}
        />

        {/* Shift Swap Request Card (When shifts system is enabled) */}
        {(!tenantSettings || tenantSettings.enable_shifts) && (
          <ShiftSwapCard
            userId={authUser.id}
            tenantId={user.tenant_id!}
          />
        )}
      </main>
    </div>
  );
}
