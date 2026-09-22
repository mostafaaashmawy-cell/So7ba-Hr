import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import EmployeeManagement from '@/components/admin/EmployeeManagement';
import RecordOverrideTable from '@/components/admin/RecordOverrideTable';
import {
  UserProfile,
  AttendanceRecord,
  LeavePermissionRecord,
  KpiEntryRecord,
  TenantSettings,
  ShiftRecord,
  SystemAuditLogRecord,
  DepartmentRecord,
} from '@/lib/types/database';
import AdminWelcomeHeader from '@/components/admin/AdminWelcomeHeader';
import OperationsHub from '@/components/admin/OperationsHub';
import StatCards from '@/components/dashboard/StatCards';
import HRIntelligenceDashboard from '@/components/analytics/HRIntelligenceDashboard';
import EmployeePerformanceTable from '@/components/dashboard/EmployeePerformanceTable';
import HomeTaskAnalytics from '@/components/dashboard/HomeTaskAnalytics';
import {
  Wand2,
  DollarSign,
  FileText,
  TrendingUp,
  Star,
  Target,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*, department:departments(name)')
    .eq('id', authUser.id)
    .single();

  // If profile not found (RLS blocked or orphaned auth user), send back to login
  if (!userProfile) {
    redirect('/login');
  }

  if (!userProfile.tenant_id) {
    redirect('/onboarding');
  }

  const admin = userProfile as UserProfile;

  if (admin?.role !== 'super_admin') {
    redirect('/dashboard/employee');
  }

  // Fetch All Users
  const { data: allUsers } = await supabase
    .from('users')
    .select('*, department:departments(name), shift:shifts(*)')
    .eq('tenant_id', admin.tenant_id)
    .order('created_at', { ascending: false });

  // Fetch Departments
  const { data: allDepts } = await supabase
    .from('departments')
    .select('*')
    .order('name');

  // Fetch All Attendance Records
  const { data: allAttendance } = await supabase
    .from('attendance')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false });

  // Fetch All Leave Records
  const { data: allLeaves } = await supabase
    .from('leaves_permissions')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false });

  // Fetch All KPI Records
  const { data: allKpis } = await supabase
    .from('kpi_entries')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false });

  // Fetch Tenant Settings
  const { data: tenantSettings } = await supabase
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', admin.tenant_id)
    .maybeSingle();

  // Fetch Shifts
  const { data: allShifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('tenant_id', admin.tenant_id)
    .order('start_time', { ascending: true });

  // Fetch System Audit Logs
  const { data: allAuditLogs } = await supabase
    .from('system_audit_logs')
    .select('*, actor:users(full_name)')
    .eq('tenant_id', admin.tenant_id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch Evaluations for performance average
  const { data: allEvals } = await supabase
    .from('evaluations')
    .select('star_punctuality, star_quality, star_problem_solving, star_communication')
    .eq('tenant_id', admin.tenant_id);

  let avgPerformance = 4.8;
  if (allEvals && allEvals.length > 0) {
    const totalScore = allEvals.reduce((acc, curr) => {
      const rowAvg =
        (Number(curr.star_punctuality || 0) +
          Number(curr.star_quality || 0) +
          Number(curr.star_problem_solving || 0) +
          Number(curr.star_communication || 0)) /
        4;
      return acc + rowAvg;
    }, 0);
    avgPerformance = Number((totalScore / allEvals.length).toFixed(1)) || 4.8;
  }

  const totalEmployees = allUsers?.length || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceList =
    allAttendance?.filter((a) => a.date === todayStr || a.check_in_time?.startsWith(todayStr)) || [];
  const activeToday = todayAttendanceList.length || 0;
  const totalLeavesMonth = allLeaves?.length || 0;
  const totalPayrollEstimate =
    allUsers?.reduce((sum, u) => sum + Number(u.basic_salary ?? 0), 0) || 0;

  // 1. Advance Liabilities MTD
  const currentMonthStr = todayStr.substring(0, 7);
  const { data: monthAdvances } = await supabase
    .from('advances')
    .select('amount, status')
    .eq('tenant_id', admin.tenant_id)
    .gte('month', `${currentMonthStr}-01`);

  const totalAdvancesMTD = (monthAdvances || [])
    .filter((a) => a.status === 'approved' || a.status === 'pending')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // 2. Probation Expirations within next 14 days
  const in14Days = new Date();
  in14Days.setDate(in14Days.getDate() + 14);
  const in14DaysStr = in14Days.toISOString().split('T')[0];

  const probationAlerts = (allUsers || []).filter((u) => {
    if (!u.probation_end_date) return false;
    return u.probation_end_date <= in14DaysStr;
  });

  const settings = tenantSettings as TenantSettings | null;
  const tenantAdvanceBudget = Number(settings?.max_monthly_tenant_advance_budget || 0);

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={admin} activeRoleView="super_admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <AdminWelcomeHeader />

        {/* Executive Risk & Governance Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Advance Liability Tracker */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Company Advance Liability MTD
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-slate-950 dark:text-white font-sans">
                  {totalAdvancesMTD.toLocaleString()} EGP
                </span>
                {tenantAdvanceBudget > 0 && (
                  <span className="text-xs font-semibold text-slate-400 font-sans">
                    / {tenantAdvanceBudget.toLocaleString()} EGP Budget ({Math.min(100, Math.round((totalAdvancesMTD / tenantAdvanceBudget) * 100))}%)
                  </span>
                )}
              </div>
            </div>
            <Link
              href="/dashboard/payroll#advances"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold transition-all"
            >
              Review Advances →
            </Link>
          </div>

          {/* Probation Expirations */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Probation Endings (Next 14 Days)
              </span>
              <span className="text-lg font-extrabold text-slate-950 dark:text-white font-sans flex items-center gap-1.5">
                {probationAlerts.length > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    ⚠️ {probationAlerts.length} Employees Awaiting Confirmation
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                    ✓ All Team Members Confirmed
                  </span>
                )}
              </span>
            </div>
            <Link
              href="/dashboard/employees"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold transition-all"
            >
              Directory →
            </Link>
          </div>
        </div>

        {/* 1. High-Level Stat Cards with Radial Gauges */}
        <StatCards
          totalEmployees={totalEmployees}
          activeToday={activeToday}
          totalLeavesMonth={totalLeavesMonth}
          avgPerformance={avgPerformance}
          totalPayrollEgp={totalPayrollEstimate}
        />

        {/* 2. Visual Analytics & Advanced HR Charts Engine (Recharts Integration) */}
        <HRIntelligenceDashboard
          users={(allUsers as UserProfile[]) || []}
          departments={(allDepts as DepartmentRecord[]) || []}
          todayAttendance={(todayAttendanceList as AttendanceRecord[]) || []}
          allAttendance={(allAttendance as AttendanceRecord[]) || []}
          leaves={(allLeaves as LeavePermissionRecord[]) || []}
        />

        {/* 3. Performance Leaderboard & Task Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HomeTaskAnalytics />
          </div>
          <div className="lg:col-span-1">
            <EmployeePerformanceTable employees={(allUsers as UserProfile[]) || []} />
          </div>
        </div>

        {/* 4. HumAi Operations Hub: Modular Grid Architecture (Localized) */}
        <OperationsHub
          enableAdvances={!tenantSettings || tenantSettings.enable_advances !== false}
          enableCommissions={!tenantSettings || tenantSettings.enable_commissions !== false}
        />

        {/* 5. Enterprise Employee Directory & Configuration Tabs */}
        <div>
          <EmployeeManagement
            initialUsers={(allUsers as UserProfile[]) || []}
            initialShifts={(allShifts as ShiftRecord[]) || []}
            initialAuditLogs={(allAuditLogs as SystemAuditLogRecord[]) || []}
          />
        </div>

        {/* 6. Admin Record Override Tool */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <RecordOverrideTable
            initialAttendance={(allAttendance as AttendanceRecord[]) || []}
            initialLeaves={(allLeaves as LeavePermissionRecord[]) || []}
            initialKpis={(allKpis as KpiEntryRecord[]) || []}
          />
        </div>
      </main>
    </div>
  );
}
