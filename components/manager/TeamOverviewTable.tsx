'use client';

import React, { useState } from 'react';
import { Users, Clock, Calendar, Target, MapPin, Filter, FileText, Printer, ChevronRight, Download } from 'lucide-react';
import { UserProfile, AttendanceRecord, LeavePermissionRecord, KpiEntryRecord } from '@/lib/types/database';
import { formatDate, formatTime, calculateWorkingHours } from '@/lib/utils/dateUtils';
import { useLanguage } from '@/lib/context/LanguageContext';
import { exportToCSV } from '@/lib/utils/csvExport';

interface TeamOverviewProps {
  teamMembers: UserProfile[];
  attendanceRecords: AttendanceRecord[];
  leaveRecords: LeavePermissionRecord[];
  kpiRecords: KpiEntryRecord[];
}

export default function TeamOverviewTable({
  teamMembers,
  attendanceRecords,
  leaveRecords,
  kpiRecords,
}: TeamOverviewProps) {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'kpis' | 'report'>('attendance');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  // FILTERS STATE
  // Attendance
  const [attStart, setAttStart] = useState<string>('');
  const [attEnd, setAttEnd] = useState<string>('');
  // Leaves
  const [leavesType, setLeavesType] = useState<'all' | 'leave' | 'permission'>('all');
  const [leaveStart, setLeaveStart] = useState<string>('');
  const [leaveEnd, setLeaveEnd] = useState<string>('');
  // KPIs
  const [kpisUnit, setKpisUnit] = useState<string>('all');
  const [kpiStart, setKpiStart] = useState<string>('');
  const [kpiEnd, setKpiEnd] = useState<string>('');
  const [kpisMinQty, setKpisMinQty] = useState<number | ''>('');
  const [kpisMaxQty, setKpisMaxQty] = useState<number | ''>('');

  // PERFORMANCE REPORT STATE
  const [reportUser, setReportUser] = useState<string>(teamMembers[0]?.id || '');
  const [reportStart, setReportStart] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [reportEnd, setReportEnd] = useState<string>(new Date().toISOString().split('T')[0]);

  // 1. FILTER BY MEMBER (TAB VIEWS)
  const memberAttendance = attendanceRecords.filter(
    (a) => selectedMember === 'all' || a.user_id === selectedMember
  );

  const memberLeaves = leaveRecords.filter(
    (l) => selectedMember === 'all' || l.user_id === selectedMember
  );

  const memberKpis = kpiRecords.filter(
    (k) => selectedMember === 'all' || k.user_id === selectedMember
  );

  // 2. APPLY ADVANCED FILTERS WITH DATE RANGE SUPPORT
  const filteredAttendance = memberAttendance.filter((r) => {
    if (attStart && !attEnd && r.date !== attStart) return false;
    if (attStart && attEnd && (r.date < attStart || r.date > attEnd)) return false;
    if (!attStart && attEnd && r.date !== attEnd) return false;
    return true;
  });

  const filteredLeaves = memberLeaves.filter((r) => {
    if (leavesType !== 'all' && r.type !== leavesType) return false;
    if (leaveStart && !leaveEnd && r.date !== leaveStart) return false;
    if (leaveStart && leaveEnd && (r.date < leaveStart || r.date > leaveEnd)) return false;
    if (!leaveStart && leaveEnd && r.date !== leaveEnd) return false;
    return true;
  });

  const uniqueKpiUnits = Array.from(new Set(kpiRecords.map((k) => k.unit)));

  const filteredKpis = memberKpis.filter((r) => {
    if (kpisUnit !== 'all' && r.unit !== kpisUnit) return false;
    if (kpiStart && !kpiEnd && r.date !== kpiStart) return false;
    if (kpiStart && kpiEnd && (r.date < kpiStart || r.date > kpiEnd)) return false;
    if (!kpiStart && kpiEnd && r.date !== kpiEnd) return false;
    const qty = Number(r.amount);
    if (kpisMinQty !== '' && qty < kpisMinQty) return false;
    if (kpisMaxQty !== '' && qty > kpisMaxQty) return false;
    return true;
  });

  // 3. EXPORT REPORTS TO EXCEL (CSV)
  const handleExportCSV = () => {
    if (activeTab === 'attendance') {
      const data = filteredAttendance.map((rec) => ({
        Employee: rec.user?.full_name || rec.user_id,
        Date: rec.date,
        'Check-In': rec.check_in_time ? new Date(rec.check_in_time).toLocaleTimeString() : '',
        'Check-Out': rec.check_out_time ? new Date(rec.check_out_time).toLocaleTimeString() : '',
        'Working Hours': calculateWorkingHours(rec.check_in_time, rec.check_out_time),
      }));
      exportToCSV(data, `Attendance_Report_${new Date().toISOString().split('T')[0]}`);
    } else if (activeTab === 'leaves') {
      const data = filteredLeaves.map((rec) => ({
        Employee: rec.user?.full_name || rec.user_id,
        Type: rec.type,
        Date: rec.date,
        Details: rec.type === 'permission' ? `${rec.timeframe || ''} (${rec.excuse_time || ''})` : 'Annual Leave',
        Status: rec.status,
      }));
      exportToCSV(data, `Leaves_Report_${new Date().toISOString().split('T')[0]}`);
    } else if (activeTab === 'kpis') {
      const data = filteredKpis.map((rec) => ({
        Employee: rec.user?.full_name || rec.user_id,
        Date: rec.date,
        Quantity: rec.amount,
        Unit: rec.unit,
        Notes: rec.notes || '',
      }));
      exportToCSV(data, `KPIs_Production_Report_${new Date().toISOString().split('T')[0]}`);
    }
  };

  // 4. CALCULATE PERFORMANCE REPORT METRICS
  const selectedEmpProfile = teamMembers.find((m) => m.id === reportUser) || null;

  const reportAttendance = attendanceRecords.filter(
    (a) => a.user_id === reportUser && a.date >= reportStart && a.date <= reportEnd
  );

  const reportLeaves = leaveRecords.filter(
    (l) => l.user_id === reportUser && l.date >= reportStart && l.date <= reportEnd && l.status === 'active'
  );

  const reportKpis = kpiRecords.filter(
    (k) => k.user_id === reportUser && k.date >= reportStart && k.date <= reportEnd
  );

  const totalWorkedMinutes = reportAttendance.reduce((sum, rec) => {
    if (!rec.check_in_time || !rec.check_out_time) return sum;
    const start = new Date(rec.check_in_time);
    const end = new Date(rec.check_out_time);
    return sum + Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  }, 0);

  const reportWorkedHoursText = `${Math.floor(totalWorkedMinutes / 60)}h ${totalWorkedMinutes % 60}m`;
  const totalLeavesCount = reportLeaves.filter((l) => l.type === 'leave').length;
  const totalExcusesCount = reportLeaves.filter((l) => l.type === 'permission').length;

  // Group KPIs by unit
  const kpisSummaryMap = new Map<string, number>();
  reportKpis.forEach((k) => {
    kpisSummaryMap.set(k.unit, (kpisSummaryMap.get(k.unit) || 0) + Number(k.amount));
  });
  const kpisSummaryList = Array.from(kpisSummaryMap.entries()).map(([unit, amount]) => ({ unit, amount }));

  return (
    <div className="space-y-6">
      {/* Team Header & Filters */}
      <div className="cleariq-card p-6 cleariq-card-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" /> {t('teamOverview')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('teamDesc')}</p>
        </div>

        {activeTab !== 'report' && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">{t('filterMember')}:</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 w-full md:w-56"
            >
              <option value="all">{t('allMembers')} ({teamMembers.length})</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" /> {t('attendance')} ({filteredAttendance.length})
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'leaves'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> {t('leavesTitle')} ({filteredLeaves.length})
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'kpis'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4" /> {t('kpiTitle')} ({filteredKpis.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('report');
            if (teamMembers.length > 0 && !reportUser) setReportUser(teamMembers[0].id);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'report'
              ? 'bg-lime-500/20 text-lime-300 border border-lime-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> {isRtl ? 'تقرير الأداء المهني' : 'Performance Report'}
        </button>
      </div>

      {/* FILTER CONTROLS PANEL (Except Report Tab) */}
      {activeTab !== 'report' && (
        <div className="cleariq-card p-4 cleariq-card-hover space-y-3 print:hidden">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-sky-400" /> {t('filters')}
            </h4>
            
            {/* Export excel button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-bold text-lime-400 hover:text-slate-950 dark:hover:text-white hover:bg-lime-500/20 hover:border-lime-500/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تصدير إكسل' : 'Export Excel'}</span>
            </button>
          </div>

          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? 'التاريخ (أو تاريخ البدء):' : 'Date (or Start Date):'}
                </label>
                <input
                  type="date"
                  value={attStart}
                  onChange={(e) => setAttStart(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? 'تاريخ الانتهاء (اختياري لنطاق التواريخ):' : 'End Date (Optional for date range):'}
                </label>
                <input
                  type="date"
                  value={attEnd}
                  onChange={(e) => setAttEnd(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                />
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t('filterByType')}</label>
                <select
                  value={leavesType}
                  onChange={(e) => setLeavesType(e.target.value as 'all' | 'leave' | 'permission')}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                >
                  <option value="all">{t('all')}</option>
                  <option value="leave">{t('annualLeave')}</option>
                  <option value="permission">{t('permission')}</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? 'التاريخ (أو تاريخ البدء):' : 'Date (or Start Date):'}
                </label>
                <input
                  type="date"
                  value={leaveStart}
                  onChange={(e) => setLeaveStart(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? 'تاريخ الانتهاء (اختياري لنطاق التواريخ):' : 'End Date (Optional for date range):'}
                </label>
                <input
                  type="date"
                  value={leaveEnd}
                  onChange={(e) => setLeaveEnd(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                />
              </div>
            </div>
          )}

          {activeTab === 'kpis' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t('filterByUnit')}</label>
                <select
                  value={kpisUnit}
                  onChange={(e) => setKpisUnit(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                >
                  <option value="all">{t('all')}</option>
                  {uniqueKpiUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? 'البدء:' : 'Start Date:'}
                </label>
                <input
                  type="date"
                  value={kpiStart}
                  onChange={(e) => setKpiStart(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? 'الانتهاء:' : 'End Date:'}
                </label>
                <input
                  type="date"
                  value={kpiEnd}
                  onChange={(e) => setKpiEnd(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t('minQty')}</label>
                <input
                  type="number"
                  value={kpisMinQty}
                  onChange={(e) => setKpisMinQty(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 10"
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t('maxQty')}</label>
                <input
                  type="number"
                  value={kpisMaxQty}
                  onChange={(e) => setKpisMaxQty(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 100"
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents */}
      <div className="cleariq-card p-6 cleariq-card-hover print:bg-white print:text-black print:border-none print:shadow-none">
        {/* TAB: Attendance */}
        {activeTab === 'attendance' && (
          <div>
            {filteredAttendance.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">{isRtl ? 'لا توجد سجلات حضور مطابقة.' : 'No matching attendance logs found.'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                      <th className="px-4 py-3">{t('date')}</th>
                      <th className="px-4 py-3">{t('checkInTime')}</th>
                      <th className="px-4 py-3">{t('checkOutTime')}</th>
                      <th className="px-4 py-3">{t('totalWorked')}</th>
                      <th className="px-4 py-3 rounded-r-lg">{t('coordinates')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-slate-950 dark:text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(rec.date)}</td>
                        <td className="px-4 py-3 font-medium text-emerald-400">{formatTime(rec.check_in_time)}</td>
                        <td className="px-4 py-3 font-medium text-rose-400">{formatTime(rec.check_out_time)}</td>
                        <td className="px-4 py-3 font-bold text-amber-300">
                          {calculateWorkingHours(rec.check_in_time, rec.check_out_time)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                          {rec.lat && rec.lng ? (
                            <span className="flex items-center gap-1 text-sky-300">
                              <MapPin className="w-3 h-3" /> {rec.lat.toFixed(4)}, {rec.lng.toFixed(4)}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: Leaves & Permissions */}
        {activeTab === 'leaves' && (
          <div>
            {filteredLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">{isRtl ? 'لا توجد طلبات إجازة مطابقة.' : 'No matching requests found.'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                      <th className="px-4 py-3">{t('type')}</th>
                      <th className="px-4 py-3">{t('date')}</th>
                      <th className="px-4 py-3">{t('permissionDetails')}</th>
                      <th className="px-4 py-3 rounded-r-lg">{t('active')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredLeaves.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-slate-950 dark:text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 capitalize font-medium text-sky-300">
                          {rec.type === 'leave' ? t('annualLeave') : t('permission')}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(rec.date)}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {rec.type === 'permission' && rec.timeframe ? (
                            <span>
                              {rec.timeframe === 'morning' ? t('morning') : t('evening')}
                              {rec.excuse_time ? ` (${rec.excuse_time})` : ''}
                            </span>
                          ) : (
                            '--'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              rec.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 border-red-200 dark:border-red-500/30'
                            }`}
                          >
                            {rec.status === 'active' ? t('active') : t('cancelled')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: KPIs */}
        {activeTab === 'kpis' && (
          <div>
            {filteredKpis.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">{isRtl ? 'لا توجد بيانات إنتاجية مطابقة.' : 'No matching KPI records found.'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                      <th className="px-4 py-3">{t('date')}</th>
                      <th className="px-4 py-3">{t('quantity')}</th>
                      <th className="px-4 py-3">{t('unit')}</th>
                      <th className="px-4 py-3 rounded-r-lg">{t('notes')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {filteredKpis.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-slate-950 dark:text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(rec.date)}</td>
                        <td className="px-4 py-3 font-bold text-blue-400">{rec.amount}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 capitalize">{rec.unit}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs italic max-w-xs truncate">
                          {rec.notes || '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: Performance Report */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            {/* Filter selection header */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between print:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {isRtl ? 'الموظف المستهدف:' : 'Select Employee:'}
                  </label>
                  <select
                    value={reportUser}
                    onChange={(e) => setReportUser(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {isRtl ? 'تاريخ البدء:' : 'Start Date:'}
                  </label>
                  <input
                    type="date"
                    value={reportStart}
                    onChange={(e) => setReportStart(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {isRtl ? 'تاريخ الانتهاء:' : 'End Date:'}
                  </label>
                  <input
                    type="date"
                    value={reportEnd}
                    onChange={(e) => setReportEnd(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none w-full"
                  />
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-950 dark:text-white shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Printer className="w-4 h-4" /> {isRtl ? 'طباعة التقرير المهني' : 'Print Report'}
              </button>
            </div>

            {/* Printable Report Layout */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 print:border-none print:bg-white print:text-black">
              {/* Report Header */}
              <div className="border-b border-slate-200 dark:border-slate-700/80 pb-5 flex justify-between items-center print:border-black">
                <div>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white print:text-black flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-400 print:text-black" />{' '}
                    {isRtl ? 'تقرير الأداء المهني العام' : 'Professional Performance Summary Report'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 print:text-black mt-1">
                    {isRtl ? 'مستخرج من صحبة HR للرعاية والتنمية' : 'Generated by So7ba HR Portal'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {isRtl ? 'فترة التقرير' : 'Report Period'}
                  </span>
                  <span className="text-xs font-semibold text-sky-300 print:text-black font-sans">
                    {reportStart} {isRtl ? 'إلى' : 'to'} {reportEnd}
                  </span>
                </div>
              </div>

              {/* Employee Bio */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-slate-200 dark:border-slate-700/40 print:border-black">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{isRtl ? 'الاسم:' : 'Name:'}</span>
                  <span className="text-sm font-bold text-slate-950 dark:text-white print:text-black">
                    {selectedEmpProfile?.full_name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{isRtl ? 'الدور الوظيفي:' : 'Role:'}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 print:text-black capitalize">
                    {selectedEmpProfile?.role || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{isRtl ? 'الراتب الأساسي:' : 'Basic Salary:'}</span>
                  <span className="text-sm font-bold text-emerald-400 print:text-black font-sans">
                    {Number(selectedEmpProfile?.basic_salary || 0).toLocaleString()} EGP
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{isRtl ? 'معيار القياس الافتراضي:' : 'Default KPI Metric:'}</span>
                  <span className="text-sm font-semibold text-purple-300 print:text-black capitalize">
                    {selectedEmpProfile?.kpi_unit || 'tasks'}
                  </span>
                </div>
              </div>

              {/* Metrics Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-sans">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 print:border-black print:bg-gray-100">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    {isRtl ? 'إجمالي الحضور (ساعات)' : 'Attendance (Hours)'}
                  </span>
                  <span className="text-xl font-extrabold text-sky-400 print:text-black font-sans">
                    {reportWorkedHoursText}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 print:border-black print:bg-gray-100">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    {isRtl ? 'جلسات الحضور' : 'Check-in Count'}
                  </span>
                  <span className="text-xl font-extrabold text-amber-400 print:text-black font-sans">
                    {reportAttendance.length} {isRtl ? 'أيام' : 'sessions'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 print:border-black print:bg-gray-100">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    {isRtl ? 'الإجازات / الأذونات' : 'Leaves / Excuses'}
                  </span>
                  <span className="text-xl font-extrabold text-purple-400 print:text-black font-sans">
                    {totalLeavesCount}L / {totalExcusesCount}P
                  </span>
                </div>
              </div>

              {/* KPI Production Summary */}
              <div className="space-y-3 font-sans">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black uppercase tracking-wider flex items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-sky-400 print:text-black" />{' '}
                  {isRtl ? 'مؤشرات الإنتاجية المحققة خلال الفترة' : 'KPI Production Achievements Breakdown'}
                </h4>
                {kpisSummaryList.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                    {isRtl ? 'لم يتم تسجيل أي إنتاجية في هذه الفترة.' : 'No KPI entries logged in this period.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {kpisSummaryList.map((kpi) => (
                      <div key={kpi.unit} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:border-black print:bg-gray-100">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">{kpi.unit}</span>
                        <span className="text-lg font-black text-purple-300 print:text-black font-sans">
                          {kpi.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Signature section */}
              <div className="hidden print:flex justify-between mt-20 text-xs font-bold pt-10">
                <div className="text-center w-40 border-t border-black pt-2">
                  {isRtl ? 'توقيع الموظف' : "Employee's Signature"}
                </div>
                <div className="text-center w-40 border-t border-black pt-2">
                  {isRtl ? 'توقيع المشرف' : "Manager's Signature"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
