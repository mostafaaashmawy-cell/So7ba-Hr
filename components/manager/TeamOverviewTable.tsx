'use client';

import React, { useState } from 'react';
import { Users, Clock, Calendar, Wallet, Target, MapPin, Filter, FileText, Printer, ChevronRight } from 'lucide-react';
import { UserProfile, AttendanceRecord, LeavePermissionRecord, AdvanceRecord, KpiEntryRecord } from '@/lib/types/database';
import { formatDate, formatTime, calculateWorkingHours } from '@/lib/utils/dateUtils';
import { useLanguage } from '@/lib/context/LanguageContext';

interface TeamOverviewProps {
  teamMembers: UserProfile[];
  attendanceRecords: AttendanceRecord[];
  leaveRecords: LeavePermissionRecord[];
  advanceRecords: AdvanceRecord[];
  kpiRecords: KpiEntryRecord[];
}

export default function TeamOverviewTable({
  teamMembers,
  attendanceRecords,
  leaveRecords,
  advanceRecords,
  kpiRecords,
}: TeamOverviewProps) {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'advances' | 'kpis' | 'report'>('attendance');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  // FILTERS STATE
  // Attendance
  const [attendanceDate, setAttendanceDate] = useState<string>('');
  // Leaves
  const [leavesType, setLeavesType] = useState<'all' | 'leave' | 'permission'>('all');
  // Advances
  const [advMin, setAdvMin] = useState<number | ''>('');
  const [advMax, setAdvMax] = useState<number | ''>('');
  const [advMonth, setAdvMonth] = useState<string>('');
  const [advDate, setAdvDate] = useState<string>('');
  // KPIs
  const [kpisUnit, setKpisUnit] = useState<string>('all');
  const [kpisDate, setKpisDate] = useState<string>('');
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

  const memberAdvances = advanceRecords.filter(
    (a) => selectedMember === 'all' || a.user_id === selectedMember
  );

  const memberKpis = kpiRecords.filter(
    (k) => selectedMember === 'all' || k.user_id === selectedMember
  );

  // 2. APPLY ADVANCED FILTERS
  const filteredAttendance = memberAttendance.filter((r) => {
    if (attendanceDate && r.date !== attendanceDate) return false;
    return true;
  });

  const filteredLeaves = memberLeaves.filter((r) => {
    if (leavesType !== 'all' && r.type !== leavesType) return false;
    return true;
  });

  const filteredAdvances = memberAdvances.filter((r) => {
    const amt = Number(r.amount);
    if (advMin !== '' && amt < advMin) return false;
    if (advMax !== '' && amt > advMax) return false;
    if (advMonth && r.month !== advMonth) return false;
    if (advDate && !(r.created_at || r.month).startsWith(advDate)) return false;
    return true;
  });

  const uniqueKpiUnits = Array.from(new Set(kpiRecords.map((k) => k.unit)));

  const filteredKpis = memberKpis.filter((r) => {
    if (kpisUnit !== 'all' && r.unit !== kpisUnit) return false;
    if (kpisDate && r.date !== kpisDate) return false;
    const qty = Number(r.amount);
    if (kpisMinQty !== '' && qty < kpisMinQty) return false;
    if (kpisMaxQty !== '' && qty > kpisMaxQty) return false;
    return true;
  });

  // 3. CALCULATE PERFORMANCE REPORT METRICS
  const selectedEmpProfile = teamMembers.find((m) => m.id === reportUser) || null;

  const reportAttendance = attendanceRecords.filter(
    (a) => a.user_id === reportUser && a.date >= reportStart && a.date <= reportEnd
  );

  const reportLeaves = leaveRecords.filter(
    (l) => l.user_id === reportUser && l.date >= reportStart && l.date <= reportEnd && l.status === 'active'
  );

  const reportAdvances = advanceRecords.filter((a) => {
    const dateStr = (a.created_at || a.month).substring(0, 10);
    return a.user_id === reportUser && dateStr >= reportStart && dateStr <= reportEnd;
  });

  const reportKpis = kpiRecords.filter(
    (k) => k.user_id === reportUser && k.date >= reportStart && k.date <= reportEnd
  );

  // Summarize metrics
  const totalWorkedMinutes = reportAttendance.reduce((sum, rec) => {
    if (!rec.check_in_time || !rec.check_out_time) return sum;
    const start = new Date(rec.check_in_time);
    const end = new Date(rec.check_out_time);
    return sum + Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  }, 0);

  const reportWorkedHoursText = `${Math.floor(totalWorkedMinutes / 60)}h ${totalWorkedMinutes % 60}m`;
  const totalLeavesCount = reportLeaves.filter((l) => l.type === 'leave').length;
  const totalExcusesCount = reportLeaves.filter((l) => l.type === 'permission').length;
  const totalAdvancesSum = reportAdvances.reduce((sum, a) => sum + Number(a.amount), 0);

  // Group KPIs by unit for report
  const kpisSummaryMap = new Map<string, number>();
  reportKpis.forEach((k) => {
    kpisSummaryMap.set(k.unit, (kpisSummaryMap.get(k.unit) || 0) + Number(k.amount));
  });
  const kpisSummaryList = Array.from(kpisSummaryMap.entries()).map(([unit, amount]) => ({ unit, amount }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Team Header & Filters */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" /> {t('teamOverview')}
          </h2>
          <p className="text-xs text-gray-400">{t('teamDesc')}</p>
        </div>

        {activeTab !== 'report' && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs text-gray-400 shrink-0 font-medium">{t('filterMember')}:</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none focus:border-sky-500 w-full md:w-56"
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
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" /> {t('attendance')} ({filteredAttendance.length})
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'leaves'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> {t('leavesTitle')} ({filteredLeaves.length})
        </button>

        <button
          onClick={() => setActiveTab('advances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'advances'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Wallet className="w-4 h-4" /> {t('advancesTitle')} ({filteredAdvances.length})
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'kpis'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-gray-400 hover:text-gray-200'
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
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" /> {isRtl ? 'تقرير الأداء المهني' : 'Performance Report'}
        </button>
      </div>

      {/* FILTER CONTROLS PANEL (Except Report Tab) */}
      {activeTab !== 'report' && (
        <div className="glass-card p-4 rounded-xl border border-gray-800 space-y-3 print:hidden">
          <h4 className="text-xs font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-sky-400" /> {t('filters')}
          </h4>

          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{t('filterByDay')}</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                />
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{t('filterByType')}</label>
                <select
                  value={leavesType}
                  onChange={(e) => setLeavesType(e.target.value as 'all' | 'leave' | 'permission')}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                >
                  <option value="all">{t('all')}</option>
                  <option value="leave">{t('annualLeave')}</option>
                  <option value="permission">{t('permission')}</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'advances' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{t('minAmount')}</label>
                <input
                  type="number"
                  value={advMin}
                  onChange={(e) => setAdvMin(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 500"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{t('maxAmount')}</label>
                <input
                  type="number"
                  value={advMax}
                  onChange={(e) => setAdvMax(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 2000"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{t('filterByMonth')}</label>
                <input
                  type="month"
                  value={advMonth ? advMonth.substring(0, 7) : ''}
                  onChange={(e) => setAdvMonth(e.target.value ? `${e.target.value}-01` : '')}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{t('filterByDate')}</label>
                <input
                  type="date"
                  value={advDate}
                  onChange={(e) => setAdvDate(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                />
              </div>
            </div>
          )}

          {activeTab === 'kpis' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{t('filterByUnit')}</label>
                <select
                  value={kpisUnit}
                  onChange={(e) => setKpisUnit(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
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
                <label className="block text-[11px] text-gray-500 mb-1">{t('filterByDate')}</label>
                <input
                  type="date"
                  value={kpisDate}
                  onChange={(e) => setKpisDate(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{t('minQty')}</label>
                <input
                  type="number"
                  value={kpisMinQty}
                  onChange={(e) => setKpisMinQty(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 10"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{t('maxQty')}</label>
                <input
                  type="number"
                  value={kpisMaxQty}
                  onChange={(e) => setKpisMaxQty(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 100"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* TAB: Attendance */}
        {activeTab === 'attendance' && (
          <div>
            {filteredAttendance.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">{isRtl ? 'لا توجد سجلات حضور مطابقة.' : 'No matching attendance logs found.'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                      <th className="px-4 py-3">{t('date')}</th>
                      <th className="px-4 py-3">{t('checkInTime')}</th>
                      <th className="px-4 py-3">{t('checkOutTime')}</th>
                      <th className="px-4 py-3">{t('totalWorked')}</th>
                      <th className="px-4 py-3 rounded-r-lg">{t('coordinates')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-semibold text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(rec.date)}</td>
                        <td className="px-4 py-3 font-medium text-emerald-400">{formatTime(rec.check_in_time)}</td>
                        <td className="px-4 py-3 font-medium text-rose-400">{formatTime(rec.check_out_time)}</td>
                        <td className="px-4 py-3 font-bold text-amber-300 font-sans">
                          {calculateWorkingHours(rec.check_in_time, rec.check_out_time)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-[11px]">
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
              <div className="py-8 text-center text-xs text-gray-500">{isRtl ? 'لا توجد طلبات إجازة مطابقة.' : 'No matching requests found.'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                      <th className="px-4 py-3">{t('type')}</th>
                      <th className="px-4 py-3">{t('date')}</th>
                      <th className="px-4 py-3">{t('permissionDetails')}</th>
                      <th className="px-4 py-3 rounded-r-lg">{t('active')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredLeaves.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-semibold text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 capitalize font-medium text-sky-300">
                          {rec.type === 'leave' ? t('annualLeave') : t('permission')}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(rec.date)}</td>
                        <td className="px-4 py-3 text-gray-400">
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
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-red-500/10 text-red-300 border-red-500/30'
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

        {/* TAB: Advances */}
        {activeTab === 'advances' && (
          <div>
            {filteredAdvances.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">{isRtl ? 'لا توجد سلف مالية مطابقة.' : 'No matching advance requests found.'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                      <th className="px-4 py-3">{t('date')}</th>
                      <th className="px-4 py-3">{t('payrollMonth')}</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">{t('amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredAdvances.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-semibold text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(rec.created_at || rec.month)}</td>
                        <td className="px-4 py-3 text-sky-300">{rec.month}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-400">
                          {Number(rec.amount).toLocaleString()} EGP
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
              <div className="py-8 text-center text-xs text-gray-500">{isRtl ? 'لا توجد بيانات إنتاجية مطابقة.' : 'No matching KPI records found.'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                      <th className="px-4 py-3">{t('date')}</th>
                      <th className="px-4 py-3">{t('quantity')}</th>
                      <th className="px-4 py-3">{t('unit')}</th>
                      <th className="px-4 py-3 rounded-r-lg">{t('notes')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredKpis.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-semibold text-white">
                          {rec.user?.full_name || 'Team Member'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(rec.date)}</td>
                        <td className="px-4 py-3 font-bold text-blue-400">{rec.amount}</td>
                        <td className="px-4 py-3 text-gray-400 capitalize">{rec.unit}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs italic max-w-xs truncate">
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

        {/* TAB: Professional Performance Report Tab */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            {/* Filter selection header */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col md:flex-row items-center gap-4 justify-between print:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    {isRtl ? 'الموظف المستهدف:' : 'Select Employee:'}
                  </label>
                  <select
                    value={reportUser}
                    onChange={(e) => setReportUser(e.target.value)}
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    {isRtl ? 'تاريخ البدء:' : 'Start Date:'}
                  </label>
                  <input
                    type="date"
                    value={reportStart}
                    onChange={(e) => setReportStart(e.target.value)}
                    className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    {isRtl ? 'تاريخ الانتهاء:' : 'End Date:'}
                  </label>
                  <input
                    type="date"
                    value={reportEnd}
                    onChange={(e) => setReportEnd(e.target.value)}
                    className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
                  />
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Printer className="w-4 h-4" /> {isRtl ? 'طباعة التقرير المهني' : 'Print Report'}
              </button>
            </div>

            {/* Printable Report Layout */}
            <div className="p-6 rounded-2xl bg-gray-950/40 border border-gray-800 space-y-6 print:border-none print:bg-white print:text-black">
              {/* Report Header */}
              <div className="border-b border-gray-800/80 pb-5 flex justify-between items-center print:border-black">
                <div>
                  <h3 className="text-xl font-black text-white print:text-black flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-400 print:text-black" />{' '}
                    {isRtl ? 'تقرير الأداء المهني العام' : 'Professional Performance Summary Report'}
                  </h3>
                  <p className="text-xs text-gray-400 print:text-black mt-1">
                    {isRtl ? 'مستخرج من صحبة HR للرعاية والتنمية' : 'Generated by So7ba HR Portal'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {isRtl ? 'فترة التقرير' : 'Report Period'}
                  </span>
                  <span className="text-xs font-semibold text-sky-300 print:text-black font-sans">
                    {reportStart} {isRtl ? 'إلى' : 'to'} {reportEnd}
                  </span>
                </div>
              </div>

              {/* Employee Bio */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-gray-800/40 print:border-black">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block">{isRtl ? 'الاسم:' : 'Name:'}</span>
                  <span className="text-sm font-bold text-white print:text-black">
                    {selectedEmpProfile?.full_name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block">{isRtl ? 'الدور الوظيفي:' : 'Role:'}</span>
                  <span className="text-sm font-semibold text-gray-300 print:text-black capitalize">
                    {selectedEmpProfile?.role || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block">{isRtl ? 'الراتب الأساسي:' : 'Basic Salary:'}</span>
                  <span className="text-sm font-bold text-emerald-400 print:text-black">
                    {Number(selectedEmpProfile?.basic_salary || 0).toLocaleString()} EGP
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block">{isRtl ? 'معيار القياس الافتراضي:' : 'Default KPI Metric:'}</span>
                  <span className="text-sm font-semibold text-purple-300 print:text-black capitalize">
                    {selectedEmpProfile?.kpi_unit || 'tasks'}
                  </span>
                </div>
              </div>

              {/* Metrics Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800/80 print:border-black print:bg-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">
                    {isRtl ? 'إجمالي الحضور (ساعات)' : 'Attendance (Hours)'}
                  </span>
                  <span className="text-xl font-extrabold text-sky-400 print:text-black font-sans">
                    {reportWorkedHoursText}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800/80 print:border-black print:bg-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">
                    {isRtl ? 'جلسات الحضور' : 'Check-in Count'}
                  </span>
                  <span className="text-xl font-extrabold text-amber-400 print:text-black font-sans">
                    {reportAttendance.length} {isRtl ? 'أيام' : 'sessions'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800/80 print:border-black print:bg-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">
                    {isRtl ? 'الإجازات / الأذونات' : 'Leaves / Excuses'}
                  </span>
                  <span className="text-xl font-extrabold text-purple-400 print:text-black font-sans">
                    {totalLeavesCount}L / {totalExcusesCount}P
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800/80 print:border-black print:bg-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">
                    {isRtl ? 'إجمالي السلف' : 'Advances Drawn'}
                  </span>
                  <span className="text-xl font-extrabold text-emerald-400 print:text-black font-sans">
                    {totalAdvancesSum.toLocaleString()} EGP
                  </span>
                </div>
              </div>

              {/* KPI Production Summary breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-300 print:text-black uppercase tracking-wider flex items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-sky-400 print:text-black" />{' '}
                  {isRtl ? 'مؤشرات الإنتاجية المحققة خلال الفترة' : 'KPI Production Achievements Breakdown'}
                </h4>
                {kpisSummaryList.length === 0 ? (
                  <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 text-center text-xs text-gray-500">
                    {isRtl ? 'لم يتم تسجيل أي إنتاجية في هذه الفترة.' : 'No KPI entries logged in this period.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {kpisSummaryList.map((kpi) => (
                      <div key={kpi.unit} className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 print:border-black print:bg-gray-100">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">{kpi.unit}</span>
                        <span className="text-lg font-black text-purple-300 print:text-black font-sans">
                          {kpi.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Signature section (Visible only when printing) */}
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
