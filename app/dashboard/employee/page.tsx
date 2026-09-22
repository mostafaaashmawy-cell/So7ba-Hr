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
import EmployeeActionCards from '@/components/employee/EmployeeActionCards';

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

  // If profile not found (RLS blocked or orphaned auth user), send back to login
  if (!userProfile) {
    redirect('/login');
  }

  if (!userProfile.tenant_id) {
    redirect('/onboarding');
  }

  const user = userProfile as UserProfile;
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }); // YYYY-MM-DD in Cairo TZ

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
          <EmployeeActionCards enableCommissions={!tenantSettings || tenantSettings.enable_commissions} />

          {(!tenantSettings || tenantSettings.enable_advances) && (
            <AdvanceRequestModal
              userId={authUser.id}
              basicSalary={user?.basic_salary || 0}
              tenantSettings={tenantSettings}
            />
          )}
        </div>

        {/* Attendance Widget */}
        <div id="checkin-section" className="scroll-mt-20">
          <AttendanceWidget
            userId={authUser.id}
            initialAttendance={(todayAttendance as AttendanceRecord[]) || []}
          />
        </div>

        {/* Leaves & Permissions Management with Holiday comp balance */}
        <div id="leaves-section" className="scroll-mt-20">
          <LeavePermissionForm
            userId={authUser.id}
            initialRecords={(leavesHistory as LeavePermissionRecord[]) || []}
            holidayWorkCount={holidayWorkCount}
            annualLeaveAllowance={user?.annual_leave_allowance ?? 21}
            userRole={user?.role || 'employee'}
            managerId={user?.manager_id || null}
            tenantId={user?.tenant_id}
            userName={user?.full_name || user?.full_name_ar || user?.full_name_en}
            leaveApprovalMode={tenantSettings?.leave_approval_mode || 'auto_approve'}
          />
        </div>

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
