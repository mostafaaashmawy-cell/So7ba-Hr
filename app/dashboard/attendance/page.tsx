'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import { UserProfile, AttendanceRecord, DepartmentRecord } from '@/lib/types/database';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  Clock,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  MapPin,
  Calendar,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { calculateWorkingHours, calculateShiftLatenessMinutes } from '@/lib/utils/dateUtils';

interface AttendanceWithDetails extends AttendanceRecord {
  user?: UserProfile & { department?: { name?: string } };
}

export default function AttendanceMonitorPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<AttendanceWithDetails[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchAttendance = async () => {
    setLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile) return;
    setCurrentUser(profile as UserProfile);

    // Fetch Departments
    const { data: depts } = await supabase
      .from('departments')
      .select('*')
      .eq('tenant_id', profile.tenant_id);

    if (depts) setDepartments(depts as DepartmentRecord[]);

    // Fetch Attendance
    const { data: attData } = await supabase
      .from('attendance')
      .select('*, user:users(*, department:departments(*))')
      .eq('tenant_id', profile.tenant_id)
      .eq('date', selectedDate)
      .order('check_in_time', { ascending: false });

    if (attData) {
      setRecords(attData as AttendanceWithDetails[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Summary Metrics
  const totalCheckIns = records.length;
  const presentCount = records.filter((r) => r.check_in_time).length;
  const inProgressCount = records.filter((r) => r.check_in_time && !r.check_out_time).length;
  const completedCount = records.filter((r) => r.check_in_time && r.check_out_time).length;

  // Filtered List
  const filteredRecords = records.filter((r) => {
    const nameMatch =
      r.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user?.id_number?.includes(searchQuery);

    const deptMatch =
      selectedDept === 'all' ||
      r.user?.department_id === selectedDept ||
      r.user?.department?.name === selectedDept;

    let statusMatch = true;
    if (selectedStatus === 'in_progress') {
      statusMatch = Boolean(r.check_in_time && !r.check_out_time);
    } else if (selectedStatus === 'completed') {
      statusMatch = Boolean(r.check_in_time && r.check_out_time);
    }

    return nameMatch && deptMatch && statusMatch;
  });

  // Export CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'Employee Name',
      'ID Number',
      'Department',
      'Date',
      'Check-In Time',
      'Check-Out Time',
      'Working Hours',
      'Mode',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.user?.full_name || 'N/A'}"`,
      `"${r.user?.id_number || 'N/A'}"`,
      `"${r.user?.department?.name || 'N/A'}"`,
      r.date,
      r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : 'N/A',
      r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : 'In Progress',
      calculateWorkingHours(r.check_in_time || '', r.check_out_time),
      r.user?.is_remote ? 'Remote' : 'Office',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={currentUser} activeRoleView={currentUser?.role === 'super_admin' ? 'super_admin' : 'manager'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              <h1 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {isRtl ? 'شاشة مراقبة الحضور والانصراف الحية' : 'Attendance Live Monitor'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRtl
                ? 'متابعة سجلات الحضور والانصراف، فترات التأخير وساعات العمل الفعلية للموظفين'
                : 'Real-time timesheet logging, shift lateness evaluation, and active shifts tracking.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAttendance}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isRtl ? 'تصدير كشف Excel / CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isRtl ? 'إجمالي الحضور اليوم' : 'Total Check-Ins'}
            </span>
            <span className="text-2xl font-extrabold text-slate-950 dark:text-white font-sans">
              {presentCount}
            </span>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {isRtl ? 'مستمرون في الدوام' : 'Currently On Duty'}
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
              {inProgressCount}
            </span>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              {isRtl ? 'أتموا دوام اليوم' : 'Shift Completed'}
            </span>
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-sans">
              {completedCount}
            </span>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isRtl ? 'التاريخ المحدد' : 'Selected Date'}
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-sans truncate block mt-1">
              {selectedDate}
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="cleariq-card p-4 cleariq-card-hover grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {isRtl ? 'تاريخ الحضور' : 'Date'}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {isRtl ? 'القسم الإداري' : 'Department'}
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white cursor-pointer"
            >
              <option value="all">{isRtl ? 'جميع الأقسام' : 'All Departments'}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {isRtl ? 'حالة الدوام' : 'Shift Status'}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white cursor-pointer"
            >
              <option value="all">{isRtl ? 'الكل' : 'All Statuses'}</option>
              <option value="in_progress">{isRtl ? 'مستمر الآن (In Progress)' : 'Currently In Progress'}</option>
              <option value="completed">{isRtl ? 'انصرف (Completed)' : 'Completed Shift'}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {isRtl ? 'بحث باسم الموظف' : 'Search Employee'}
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={isRtl ? 'ابحث بالاسم...' : 'Search by name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="cleariq-card overflow-hidden cleariq-card-hover">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">{isRtl ? 'الموظف' : 'Employee'}</th>
                  <th className="py-3 px-4">{isRtl ? 'القسم' : 'Department'}</th>
                  <th className="py-3 px-4">{isRtl ? 'وقت الحضور' : 'Check-In'}</th>
                  <th className="py-3 px-4">{isRtl ? 'وقت الانصراف' : 'Check-Out'}</th>
                  <th className="py-3 px-4">{isRtl ? 'ساعات العمل' : 'Duration'}</th>
                  <th className="py-3 px-4">{isRtl ? 'طبيعة العمل' : 'Mode'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-sans">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {isRtl
                        ? 'لا توجد سجلات حضور مسجلة لهذا التاريخ والفلاتر المحددة.'
                        : 'No attendance records found for this date and filter criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                            {r.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-950 dark:text-white block">
                              {r.user?.full_name || 'Staff Member'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {r.user?.job_title || 'Employee'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {r.user?.department?.name || 'Operations'}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 font-sans">
                        {r.check_in_time ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>
                              {new Date(r.check_in_time).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 font-sans">
                        {r.check_out_time ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>
                              {new Date(r.check_out_time).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                            {isRtl ? 'مستمر الآن' : 'In Progress'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 font-sans">
                        {calculateWorkingHours(r.check_in_time || '', r.check_out_time)}
                      </td>

                      <td className="py-3.5 px-4">
                        {r.user?.is_remote ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
                            🏠 Remote
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                            🏢 Office
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
