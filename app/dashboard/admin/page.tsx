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
} from '@/lib/types/database';
import AdminWelcomeHeader from '@/components/admin/AdminWelcomeHeader';
import StatCards from '@/components/dashboard/StatCards';
import SalaryUnitChart from '@/components/dashboard/SalaryUnitChart';
import DepartmentDistributionChart from '@/components/dashboard/DepartmentDistributionChart';
import EmployeePerformanceTable from '@/components/dashboard/EmployeePerformanceTable';
import HomeTaskAnalytics from '@/components/dashboard/HomeTaskAnalytics';

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Fetch Super Admin Profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
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
    .select('*')
    .eq('tenant_id', admin.tenant_id)
    .order('created_at', { ascending: false });

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

  const totalEmployees = allUsers?.length || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const activeToday =
    allAttendance?.filter((a) => a.date === todayStr || a.check_in_time?.startsWith(todayStr))
      .length || 0;
  const totalLeavesMonth = allLeaves?.length || 0;
  const totalPayrollEstimate =
    allUsers?.reduce((sum, u) => sum + Number(u.basic_salary || 5000), 0) || 128000;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Navbar user={admin} activeRoleView="super_admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <AdminWelcomeHeader />

        {/* 1. Cleariq High-Level Stat Cards with Radial Gauges */}
        <StatCards
          totalEmployees={totalEmployees}
          activeToday={activeToday}
          totalLeavesMonth={totalLeavesMonth}
          avgPerformance={4.3}
          totalPayrollEgp={totalPayrollEstimate}
        />

        {/* 2. Cleariq Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalaryUnitChart />
          </div>
          <div className="lg:col-span-1">
            <EmployeePerformanceTable employees={(allUsers as UserProfile[]) || []} />
          </div>
        </div>

        {/* 3. Department & Employee Structure Breakdown */}
        <DepartmentDistributionChart />

        {/* 4. Monthly Task Completion & Target Progress Analytics */}
        <HomeTaskAnalytics />

        {/* 4. Quick Module Hub */}
        <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">HumAi Operations Hub</h3>
              <p className="text-xs text-slate-400 mt-0.5">Quick access to all operational engines</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/onboarding"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all text-center space-y-2 group"
            >
              <span className="text-2xl block group-hover:scale-110 transition-transform">⚙️</span>
              <span className="text-xs font-bold text-slate-800 block">Setup Wizard</span>
              <span className="text-[10px] text-slate-400 block">Toggles & Branches</span>
            </Link>

            <Link
              href="/dashboard/payroll"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all text-center space-y-2 group"
            >
              <span className="text-2xl block group-hover:scale-110 transition-transform">💵</span>
              <span className="text-xs font-bold text-slate-800 block">Payroll Engine</span>
              <span className="text-[10px] text-slate-400 block">Payslips & Advances</span>
            </Link>

            <Link
              href="/dashboard/contracts"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all text-center space-y-2 group"
            >
              <span className="text-2xl block group-hover:scale-110 transition-transform">📝</span>
              <span className="text-xs font-bold text-slate-800 block">Contract Builder</span>
              <span className="text-[10px] text-slate-400 block">Print Agreements</span>
            </Link>

            <Link
              href="/dashboard/sales"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all text-center space-y-2 group"
            >
              <span className="text-2xl block group-hover:scale-110 transition-transform">📈</span>
              <span className="text-xs font-bold text-slate-800 block">Sales & Payouts</span>
              <span className="text-[10px] text-slate-400 block">Commissions</span>
            </Link>

            <Link
              href="/dashboard/evaluations"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all text-center space-y-2 group"
            >
              <span className="text-2xl block group-hover:scale-110 transition-transform">⭐</span>
              <span className="text-xs font-bold text-slate-800 block">Evaluations</span>
              <span className="text-[10px] text-slate-400 block">Review Logs</span>
            </Link>

            <Link
              href="/dashboard/targets"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all text-center space-y-2 group"
            >
              <span className="text-2xl block group-hover:scale-110 transition-transform">🎯</span>
              <span className="text-xs font-bold text-slate-800 block">Targets Board</span>
              <span className="text-[10px] text-slate-400 block">Goals & KPIs</span>
            </Link>
          </div>
        </div>

        {/* 5. Employee Directory & Custom Schedule Override */}
        <div id="employee-management" className="scroll-mt-24">
          <EmployeeManagement initialUsers={(allUsers as UserProfile[]) || []} />
        </div>

        {/* 6. Attendance & Record Audit Log Table */}
        <RecordOverrideTable
          initialAttendance={(allAttendance as AttendanceRecord[]) || []}
          initialLeaves={(allLeaves as LeavePermissionRecord[]) || []}
          initialKpis={(allKpis as KpiEntryRecord[]) || []}
        />
      </main>
    </div>
  );
}
