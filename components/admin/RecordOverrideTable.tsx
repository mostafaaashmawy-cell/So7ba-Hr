'use client';

import React, { useState } from 'react';
import { Trash2, ShieldAlert, Clock, Calendar, Target, CheckCircle2, AlertCircle, Filter, User } from 'lucide-react';
import { AttendanceRecord, LeavePermissionRecord, KpiEntryRecord } from '@/lib/types/database';
import { formatDate, formatTime } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';

interface RecordOverrideProps {
  initialAttendance: AttendanceRecord[];
  initialLeaves: LeavePermissionRecord[];
  initialKpis: KpiEntryRecord[];
}

export default function RecordOverrideTable({
  initialAttendance,
  initialLeaves,
  initialKpis,
}: RecordOverrideProps) {
  const { t, isRtl } = useLanguage();
  const [leaves, setLeaves] = useState<LeavePermissionRecord[]>(initialLeaves);
  const [kpis, setKpis] = useState<KpiEntryRecord[]>(initialKpis);

  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'kpis'>('attendance');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  // GLOBAL FILTER BY EMPLOYEE
  const [selectedUser, setSelectedUser] = useState<string>('all');

  // ADVANCED DATE RANGE FILTERS
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

  const supabase = createClient();

  // Extract unique users across all records
  const uniqueUsersMap = new Map<string, string>();
  initialAttendance.forEach((r) => { if (r.user) uniqueUsersMap.set(r.user_id, r.user.full_name); });
  leaves.forEach((r) => { if (r.user) uniqueUsersMap.set(r.user_id, r.user.full_name); });
  kpis.forEach((r) => { if (r.user) uniqueUsersMap.set(r.user_id, r.user.full_name); });

  const uniqueUsersList = Array.from(uniqueUsersMap.entries()).map(([id, name]) => ({ id, name }));

  const handleDelete = async (table: string, id: string) => {
    if (!confirm(isRtl ? 'هل أنت متأكد أنك تريد حذف هذا السجل نهائياً؟' : 'Are you sure you want to permanently delete this record?')) return;

    setLoadingId(id);
    setMsg(null);

    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      setMsg({ text: error.message, error: true });
    } else {
      if (table === 'leaves_permissions') setLeaves(leaves.filter((r) => r.id !== id));
      if (table === 'kpi_entries') setKpis(kpis.filter((r) => r.id !== id));

      setMsg({ text: isRtl ? 'تم حذف السجل نهائياً من النظام.' : 'Record permanently deleted from system.', error: false });
    }
    setLoadingId(null);
  };

  // FILTER LOGIC WITH DATE RANGE SUPPORT
  const filteredAttendance = initialAttendance.filter((r) => {
    if (selectedUser !== 'all' && r.user_id !== selectedUser) return false;
    
    // Date / Date-Range checks
    if (attStart && !attEnd && r.date !== attStart) return false;
    if (attStart && attEnd && (r.date < attStart || r.date > attEnd)) return false;
    if (!attStart && attEnd && r.date !== attEnd) return false;

    return true;
  });

  const filteredLeaves = leaves.filter((r) => {
    if (selectedUser !== 'all' && r.user_id !== selectedUser) return false;
    if (leavesType !== 'all' && r.type !== leavesType) return false;

    // Date / Date-Range checks
    if (leaveStart && !leaveEnd && r.date !== leaveStart) return false;
    if (leaveStart && leaveEnd && (r.date < leaveStart || r.date > leaveEnd)) return false;
    if (!leaveStart && leaveEnd && r.date !== leaveEnd) return false;

    return true;
  });

  const uniqueKpiUnits = Array.from(new Set(kpis.map((k) => k.unit)));

  const filteredKpis = kpis.filter((r) => {
    if (selectedUser !== 'all' && r.user_id !== selectedUser) return false;
    if (kpisUnit !== 'all' && r.unit !== kpisUnit) return false;

    // Date / Date-Range checks
    if (kpiStart && !kpiEnd && r.date !== kpiStart) return false;
    if (kpiStart && kpiEnd && (r.date < kpiStart || r.date > kpiEnd)) return false;
    if (!kpiStart && kpiEnd && r.date !== kpiEnd) return false;

    const qty = Number(r.amount);
    if (kpisMinQty !== '' && qty < kpisMinQty) return false;
    if (kpisMaxQty !== '' && qty > kpisMaxQty) return false;
    return true;
  });

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-sky-400" /> {t('recordCenter')}
          </h3>
          <p className="text-xs text-gray-400">{t('recordCenterDesc')}</p>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            msg.error
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Global User Filter */}
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <User className="w-4 h-4 text-sky-400" />
          <span>{isRtl ? 'تصفية الجدول بالكامل حسب الموظف:' : 'Filter Entire Dashboard by Employee:'}</span>
        </div>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full sm:w-64"
        >
          <option value="all">{isRtl ? 'جميع الموظفين' : 'All Employees'}</option>
          {uniqueUsersList.map((usr) => (
            <option key={usr.id} value={usr.id}>
              {usr.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" /> {t('attendance')} ({filteredAttendance.length})
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'leaves'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> {t('leavesTitle')} ({filteredLeaves.length})
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'kpis'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Target className="w-4 h-4" /> {t('kpiTitle')} ({filteredKpis.length})
        </button>
      </div>

      {/* FILTER CONTROLS PANEL (With range Date Pickers) */}
      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3">
        <h4 className="text-xs font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-sky-400" /> {t('filters')}
        </h4>

        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                {isRtl ? 'التاريخ (أو تاريخ البدء):' : 'Date (or Start Date):'}
              </label>
              <input
                type="date"
                value={attStart}
                onChange={(e) => setAttStart(e.target.value)}
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                {isRtl ? 'تاريخ الانتهاء (اختياري لنطاق التواريخ):' : 'End Date (Optional for date range):'}
              </label>
              <input
                type="date"
                value={attEnd}
                onChange={(e) => setAttEnd(e.target.value)}
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">{t('filterByType')}</label>
              <select
                value={leavesType}
                onChange={(e) => setLeavesType(e.target.value as 'all' | 'leave' | 'permission')}
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              >
                <option value="all">{t('all')}</option>
                <option value="leave">{t('annualLeave')}</option>
                <option value="permission">{t('permission')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                {isRtl ? 'التاريخ (أو تاريخ البدء):' : 'Date (or Start Date):'}
              </label>
              <input
                type="date"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                {isRtl ? 'تاريخ الانتهاء (اختياري لنطاق التواريخ):' : 'End Date (Optional for date range):'}
              </label>
              <input
                type="date"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">{t('filterByUnit')}</label>
              <select
                value={kpisUnit}
                onChange={(e) => setKpisUnit(e.target.value)}
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
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
              <label className="block text-[11px] text-gray-500 mb-1">
                {isRtl ? 'البدء:' : 'Start Date:'}
              </label>
              <input
                type="date"
                value={kpiStart}
                onChange={(e) => setKpiStart(e.target.value)}
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                {isRtl ? 'الانتهاء:' : 'End Date:'}
              </label>
              <input
                type="date"
                value={kpiEnd}
                onChange={(e) => setKpiEnd(e.target.value)}
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">{t('minQty')}</label>
              <input
                type="number"
                value={kpisMinQty}
                onChange={(e) => setKpisMinQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 10"
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">{t('maxQty')}</label>
              <input
                type="number"
                value={kpisMaxQty}
                onChange={(e) => setKpisMaxQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 100"
                className="bg-gray-955 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="overflow-x-auto">
        {/* Attendance */}
        {activeTab === 'attendance' && (
          <table className="w-full text-left text-xs text-gray-300 font-sans">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                <th className="px-4 py-3">{t('date')}</th>
                <th className="px-4 py-3">{t('checkInTime')}</th>
                <th className="px-4 py-3 rounded-r-lg">{t('checkOutTime')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-sans">
              {filteredAttendance.map((r) => (
                <tr key={r.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-emerald-400">{formatTime(r.check_in_time)}</td>
                  <td className="px-4 py-3 text-rose-400">{formatTime(r.check_out_time)}</td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    {isRtl ? 'لا توجد سجلات حضور مطابقة.' : 'No matching attendance records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Leaves */}
        {activeTab === 'leaves' && (
          <table className="w-full text-left text-xs text-gray-300 font-sans">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                <th className="px-4 py-3">{t('type')}</th>
                <th className="px-4 py-3">{t('date')}</th>
                <th className="px-4 py-3">{t('permissionDetails')}</th>
                <th className="px-4 py-3">{t('active')}</th>
                <th className="px-4 py-3 text-right rounded-r-lg">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-sans">
              {filteredLeaves.map((r) => (
                <tr key={r.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3 capitalize font-medium text-sky-300">
                    {r.type === 'leave' ? t('annualLeave') : t('permission')}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {r.type === 'permission' && r.timeframe ? (
                      <span>
                        {r.timeframe === 'morning' ? t('morning') : t('evening')}
                        {r.excuse_time ? ` (${r.excuse_time})` : ''}
                      </span>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="px-4 py-3 text-emerald-400">{r.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete('leaves_permissions', r.id)}
                      disabled={loadingId === r.id}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    {isRtl ? 'لا توجد طلبات إجازة مطابقة.' : 'No matching requests found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* KPIs */}
        {activeTab === 'kpis' && (
          <table className="w-full text-left text-xs text-gray-300 font-sans">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                <th className="px-4 py-3">{t('date')}</th>
                <th className="px-4 py-3">{t('quantity')}</th>
                <th className="px-4 py-3">{t('unit')}</th>
                <th className="px-4 py-3">{t('notes')}</th>
                <th className="px-4 py-3 text-right rounded-r-lg">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-sans">
              {filteredKpis.map((r) => (
                <tr key={r.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 font-bold text-blue-400">{r.amount}</td>
                  <td className="px-4 py-3 capitalize text-gray-400">{r.unit}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs italic max-w-xs truncate">
                    {r.notes || '--'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete('kpi_entries', r.id)}
                      disabled={loadingId === r.id}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredKpis.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    {isRtl ? 'لا توجد بيانات إنتاجية مطابقة.' : 'No matching KPI records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
