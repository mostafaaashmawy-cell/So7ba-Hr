import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import AttendanceWidget from '@/components/employee/AttendanceWidget';
import LeavePermissionForm from '@/components/employee/LeavePermissionForm';
import AdvanceRequestForm from '@/components/employee/AdvanceRequestForm';
import KpiTrackerWidget from '@/components/employee/KpiTrackerWidget';
import { UserProfile, AttendanceRecord, LeavePermissionRecord, AdvanceRecord, KpiEntryRecord } from '@/lib/types/database';

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Fetch User Profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  const user = userProfile as UserProfile;
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch Today's Attendance
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', authUser.id)
    .eq('date', todayStr)
    .maybeSingle();

  // Fetch Leaves & Permissions History
  const { data: leavesHistory } = await supabase
    .from('leaves_permissions')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false });

  // Fetch Advances History
  const { data: advancesHistory } = await supabase
    .from('advances')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false });

  // Fetch KPI History
  const { data: kpiHistory } = await supabase
    .from('kpi_entries')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar user={user} activeRoleView="employee" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-gray-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Welcome back, <span className="gradient-text">{user?.full_name || 'Employee'}</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Employee Operations Portal & Daily Tracking
            </p>
          </div>

          <div className="flex items-center gap-3 bg-gray-900/80 px-4 py-2 rounded-2xl border border-gray-800 text-xs">
            <span className="text-gray-400">Assigned Metric:</span>
            <span className="font-bold text-purple-300 capitalize">{user?.kpi_unit || 'tasks'}</span>
          </div>
        </div>

        {/* Attendance Widget */}
        <AttendanceWidget
          userId={authUser.id}
          initialAttendance={todayAttendance as AttendanceRecord | null}
        />

        {/* Leaves & Permissions Management */}
        <LeavePermissionForm
          userId={authUser.id}
          initialRecords={(leavesHistory as LeavePermissionRecord[]) || []}
        />

        {/* Grid for Financial Advances & Dynamic KPI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AdvanceRequestForm
            userId={authUser.id}
            basicSalary={Number(user?.basic_salary || 0)}
            initialAdvances={(advancesHistory as AdvanceRecord[]) || []}
          />

          <KpiTrackerWidget
            userId={authUser.id}
            kpiUnit={user?.kpi_unit || 'tasks'}
            initialEntries={(kpiHistory as KpiEntryRecord[]) || []}
          />
        </div>
      </main>
    </div>
  );
}
