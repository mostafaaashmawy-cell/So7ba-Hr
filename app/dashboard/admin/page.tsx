import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import EmployeeManagement from '@/components/admin/EmployeeManagement';
import RecordOverrideTable from '@/components/admin/RecordOverrideTable';
import { UserProfile, AttendanceRecord, LeavePermissionRecord, AdvanceRecord, KpiEntryRecord } from '@/lib/types/database';

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

  // Fetch All Advance Records
  const { data: allAdvances } = await supabase
    .from('advances')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false });

  // Fetch All KPI Records
  const { data: allKpis } = await supabase
    .from('kpi_entries')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar user={admin} activeRoleView="super_admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="glass-card p-6 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Super Admin Control Center
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Global system authority, salary configurations, and record override management
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Full System Write Access
          </div>
        </div>

        {/* Employee Management Section */}
        <EmployeeManagement initialUsers={(allUsers as UserProfile[]) || []} />

        {/* Global Record Override & Delete Section */}
        <RecordOverrideTable
          initialAttendance={(allAttendance as AttendanceRecord[]) || []}
          initialLeaves={(allLeaves as LeavePermissionRecord[]) || []}
          initialAdvances={(allAdvances as AdvanceRecord[]) || []}
          initialKpis={(allKpis as KpiEntryRecord[]) || []}
        />
      </main>
    </div>
  );
}
