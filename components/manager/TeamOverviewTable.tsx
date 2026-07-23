'use client';

import React, { useState } from 'react';
import { Users, Clock, Calendar, Wallet, Target, MapPin, Filter } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'advances' | 'kpis'>('attendance');
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

  // 1. FILTER BY MEMBER
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

  // Extract unique KPI units in manager view
  const uniqueKpiUnits = Array.from(new Set(kpiRecords.map((k) => k.unit)));

  const filteredKpis = memberKpis.filter((r) => {
    if (kpisUnit !== 'all' && r.unit !== kpisUnit) return false;
    if (kpisDate && r.date !== kpisDate) return false;
    const qty = Number(r.amount);
    if (kpisMinQty !== '' && qty < kpisMinQty) return false;
    if (kpisMaxQty !== '' && qty > kpisMaxQty) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Team Header & Filters */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" /> {t('teamOverview')}
          </h2>
          <p className="text-xs text-gray-400">{t('teamDesc')}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-gray-400 shrink-0 font-medium">{t('filterMember')}:</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500 w-full md:w-56"
          >
            <option value="all">{t('allMembers')} ({teamMembers.length})</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" /> {t('attendance')} ({filteredAttendance.length})
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'leaves'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> {t('leavesTitle')} ({filteredLeaves.length})
        </button>

        <button
          onClick={() => setActiveTab('advances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'advances'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Wallet className="w-4 h-4" /> {t('advancesTitle')} ({filteredAdvances.length})
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'kpis'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Target className="w-4 h-4" /> {t('kpiTitle')} ({filteredKpis.length})
        </button>
      </div>

      {/* FILTER CONTROLS PANEL */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 space-y-3">
        <h4 className="text-xs font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-purple-400" /> {t('filters')}
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

      {/* Tab Contents */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800">
        {/* TAB: Attendance */}
        {activeTab === 'attendance' && (
          <div>
            {filteredAttendance.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                {isRtl ? 'لا توجد سجلات حضور مطابقة.' : 'No matching attendance logs found.'}
              </div>
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
                        <td className="px-4 py-3 font-bold text-amber-300">
                          {calculateWorkingHours(rec.check_in_time, rec.check_out_time)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-[11px]">
                          {rec.lat && rec.lng ? (
                            <span className="flex items-center gap-1 text-purple-300">
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
              <div className="py-8 text-center text-xs text-gray-500">
                {isRtl ? 'لا توجد طلبات إجازة مطابقة.' : 'No matching requests found.'}
              </div>
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
                        <td className="px-4 py-3 capitalize font-medium text-purple-300">
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
              <div className="py-8 text-center text-xs text-gray-500">
                {isRtl ? 'لا توجد سلف مالية مطابقة.' : 'No matching advance requests found.'}
              </div>
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
                        <td className="px-4 py-3 text-purple-300">{rec.month}</td>
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
              <div className="py-8 text-center text-xs text-gray-500">
                {isRtl ? 'لا توجد بيانات إنتاجية مطابقة.' : 'No matching KPI records found.'}
              </div>
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
      </div>
    </div>
  );
}
