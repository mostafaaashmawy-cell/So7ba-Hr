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

  if (userProfile && !userProfile.tenant_id) {
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

  const totalEmployees = allUsers?.length || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceList =
    allAttendance?.filter((a) => a.date === todayStr || a.check_in_time?.startsWith(todayStr)) || [];
  const activeToday = todayAttendanceList.length || 0;
  const totalLeavesMonth = allLeaves?.length || 0;
  const totalPayrollEstimate =
    allUsers?.reduce((sum, u) => sum + Number(u.basic_salary || 5000), 0) || 128000;

  const settings = tenantSettings as TenantSettings | null;

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={admin} activeRoleView="super_admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <AdminWelcomeHeader />

        {/* 1. High-Level Stat Cards with Radial Gauges */}
        <StatCards
          totalEmployees={totalEmployees}
          activeToday={activeToday}
          totalLeavesMonth={totalLeavesMonth}
          avgPerformance={4.3}
          totalPayrollEgp={totalPayrollEstimate}
        />

        {/* 2. Visual Analytics & Advanced HR Charts Engine (Recharts Integration) */}
        <HRIntelligenceDashboard
          users={(allUsers as UserProfile[]) || []}
          departments={(allDepts as DepartmentRecord[]) || []}
          todayAttendance={(todayAttendanceList as AttendanceRecord[]) || []}
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

        {/* 4. HumAi Operations Hub: Modular Grid Architecture */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                HumAi Operations Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Central command grid for enterprise workflows, policies, and system governance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* 1. Setup Wizard */}
            <Link
              href="/onboarding"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Wand2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Setup Wizard</span>
              <span className="text-[10px] text-slate-400 block truncate">Toggles & Branches</span>
            </Link>

            {/* 2. Payroll Engine */}
            {(!settings || settings.enable_advances !== false) && (
              <Link
                href="/dashboard/payroll"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Payroll Engine</span>
                <span className="text-[10px] text-slate-400 block truncate">Payslips & Advances</span>
              </Link>
            )}

            {/* 3. Contract Builder */}
            <Link
              href="/dashboard/contracts"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Contract Builder</span>
              <span className="text-[10px] text-slate-400 block truncate">Agreements & PDF</span>
            </Link>

            {/* 4. Sales & Payouts */}
            {(!settings || settings.enable_commissions !== false) && (
              <Link
                href="/dashboard/sales"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Sales & Payouts</span>
                <span className="text-[10px] text-slate-400 block truncate">Commissions Log</span>
              </Link>
            )}

            {/* 5. Evaluations */}
            <Link
              href="/dashboard/evaluations"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Evaluations</span>
              <span className="text-[10px] text-slate-400 block truncate">Reviews & Ratings</span>
            </Link>

            {/* 6. Targets Board */}
            <Link
              href="/dashboard/targets"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Targets Board</span>
              <span className="text-[10px] text-slate-400 block truncate">KPIs & Goals</span>
            </Link>

            {/* 7. Company Policies */}
            <Link
              href="/dashboard/settings"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Company Policies</span>
              <span className="text-[10px] text-slate-400 block truncate">Hours, GPS & Overtime</span>
            </Link>

            {/* 8. System Audit Logs */}
            <Link
              href="/dashboard/settings"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Audit Trail</span>
              <span className="text-[10px] text-slate-400 block truncate">Security & Overrides</span>
            </Link>
          </div>
        </div>

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
