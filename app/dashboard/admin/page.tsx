import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import EmployeeManagement from '@/components/admin/EmployeeManagement';
import RecordOverrideTable from '@/components/admin/RecordOverrideTable';
import { UserProfile, AttendanceRecord, LeavePermissionRecord, KpiEntryRecord } from '@/lib/types/database';

import AdminWelcomeHeader from '@/components/admin/AdminWelcomeHeader';

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
  const { data: allUsers } = await supabase.from('users').select('*').order('created_at', { ascending: false });

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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={admin} activeRoleView="super_admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <AdminWelcomeHeader />

        {/* ADMIN COMMAND CENTER */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/onboarding" className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/30 transition-all text-center space-y-2 group">
            <span className="text-xl font-bold text-sky-400 block group-hover:scale-105 transition-all">⚙️</span>
            <span className="text-xs font-bold text-white block">Setup Wizard</span>
            <span className="text-[10px] text-gray-500 block">Toggles & Geofence</span>
          </Link>

          <Link href="/dashboard/payroll" className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/30 transition-all text-center space-y-2 group">
            <span className="text-xl font-bold text-sky-400 block group-hover:scale-105 transition-all">💵</span>
            <span className="text-xs font-bold text-white block">Payroll Engine</span>
            <span className="text-[10px] text-gray-500 block">Payslips & Advances</span>
          </Link>

          <Link href="/dashboard/contracts" className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/30 transition-all text-center space-y-2 group">
            <span className="text-xl font-bold text-sky-400 block group-hover:scale-105 transition-all">📝</span>
            <span className="text-xs font-bold text-white block">Contract Builder</span>
            <span className="text-[10px] text-gray-500 block">Print Agreements</span>
          </Link>

          <Link href="/dashboard/sales" className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/30 transition-all text-center space-y-2 group">
            <span className="text-xl font-bold text-sky-400 block group-hover:scale-105 transition-all">📈</span>
            <span className="text-xs font-bold text-white block">Sales Logging</span>
            <span className="text-[10px] text-gray-500 block">Validate Payouts</span>
          </Link>

          <Link href="/dashboard/evaluations" className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/30 transition-all text-center space-y-2 group">
            <span className="text-xl font-bold text-sky-400 block group-hover:scale-105 transition-all">⭐</span>
            <span className="text-xs font-bold text-white block">Evaluations</span>
            <span className="text-[10px] text-gray-500 block">Review Ratings</span>
          </Link>

          <Link href="/dashboard/targets" className="p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/30 transition-all text-center space-y-2 group">
            <span className="text-xl font-bold text-sky-400 block group-hover:scale-105 transition-all">🎯</span>
            <span className="text-xs font-bold text-white block">Targets Board</span>
            <span className="text-[10px] text-gray-500 block">KPI Goals tracking</span>
          </Link>
        </div>

        {/* Employee Management Section */}
        <EmployeeManagement initialUsers={(allUsers as UserProfile[]) || []} />

        {/* Global Record Override & Delete Section (No Advances) */}
        <RecordOverrideTable
          initialAttendance={(allAttendance as AttendanceRecord[]) || []}
          initialLeaves={(allLeaves as LeavePermissionRecord[]) || []}
          initialKpis={(allKpis as KpiEntryRecord[]) || []}
        />
      </main>
    </div>
  );
}
