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
    
    if (attStart && attEnd) {
      if (r.date < attStart || r.date > attEnd) return false;
    } else if (attStart) {
      if (r.date !== attStart) return false;
    }
    return true;
  });

  const filteredLeaves = leaves.filter((r) => {
    if (selectedUser !== 'all' && r.user_id !== selectedUser) return false;
    if (leavesType !== 'all' && r.type !== leavesType) return false;

    if (leaveStart && leaveEnd) {
      if (r.date < leaveStart || r.date > leaveEnd) return false;
    } else if (leaveStart) {
      if (r.date !== leaveStart) return false;
    }
    return true;
  });

  // Extract unique KPI units
  const uniqueKpiUnits = Array.from(new Set(kpis.map((k) => k.unit)));

  const filteredKpis = kpis.filter((r) => {
    if (selectedUser !== 'all' && r.user_id !== selectedUser) return false;
    if (kpisUnit !== 'all' && r.unit !== kpisUnit) return false;

    if (kpiStart && kpiEnd) {
      if (r.date < kpiStart || r.date > kpiEnd) return false;
    } else if (kpiStart) {
      if (r.date !== kpiStart) return false;
    }

    if (kpisMinQty !== '' && r.amount < Number(kpisMinQty)) return false;
    if (kpisMaxQty !== '' && r.amount > Number(kpisMaxQty)) return false;

    return true;
  });

  return (
    <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white">
              {isRtl ? 'سجل العمليات والرقابة الإدارية' : 'System Logs & Administrative Audit Trail'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl ? 'مراجعة وتدقيق وتعديل سجلات الحضور والإجازات والإنتاجية' : 'Audit, filter, and manage all attendance, leaves, and KPI submissions'}
            </p>
          </div>
        </div>

        {/* Global Employee Picker */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">{isRtl ? 'جميع الموظفين' : 'All Employees'}</option>
            {uniqueUsersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            msg.error
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span className="font-medium">{msg.text}</span>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" /> {isRtl ? 'سجل الحضور' : 'Attendance Logs'} ({filteredAttendance.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'leaves'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" /> {isRtl ? 'سجل الإجازات والأذونات' : 'Leaves & Permissions'} ({filteredLeaves.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'kpis'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Target className="w-4 h-4" /> {isRtl ? 'سجل الإنتاجية ومؤشرات الأداء' : 'KPI & Tasks Logs'} ({filteredKpis.length})
        </button>
      </div>

      {/* FILTER CONTROLS PANEL */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-blue-600" /> {t('filters')}
        </h4>

        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">
                {isRtl ? 'التاريخ (أو تاريخ البدء):' : 'Date (or Start Date):'}
              </label>
              <input
                type="date"
                value={attStart}
                onChange={(e) => setAttStart(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">
                {isRtl ? 'تاريخ الانتهاء (اختياري لنطاق التواريخ):' : 'End Date (Optional for date range):'}
              </label>
              <input
                type="date"
                value={attEnd}
                onChange={(e) => setAttEnd(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full font-sans"
              />
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">{t('filterByType')}</label>
              <select
                value={leavesType}
                onChange={(e) => setLeavesType(e.target.value as 'all' | 'leave' | 'permission')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full cursor-pointer"
              >
                <option value="all">{t('all')}</option>
                <option value="leave">{t('annualLeave')}</option>
                <option value="permission">{t('permission')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">
                {isRtl ? 'التاريخ (أو تاريخ البدء):' : 'Date (or Start Date):'}
              </label>
              <input
                type="date"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">
                {isRtl ? 'تاريخ الانتهاء (اختياري لنطاق التواريخ):' : 'End Date (Optional for date range):'}
              </label>
              <input
                type="date"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full font-sans"
              />
            </div>
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">{t('filterByUnit')}</label>
              <select
                value={kpisUnit}
                onChange={(e) => setKpisUnit(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full cursor-pointer"
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
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">
                {isRtl ? 'البدء:' : 'Start Date:'}
              </label>
              <input
                type="date"
                value={kpiStart}
                onChange={(e) => setKpiStart(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">
                {isRtl ? 'الانتهاء:' : 'End Date:'}
              </label>
              <input
                type="date"
                value={kpiEnd}
                onChange={(e) => setKpiEnd(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">{t('minQty')}</label>
              <input
                type="number"
                value={kpisMinQty}
                onChange={(e) => setKpisMinQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 10"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">{t('maxQty')}</label>
              <input
                type="number"
                value={kpisMaxQty}
                onChange={(e) => setKpisMaxQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 100"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-full font-sans"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tables with high-contrast text */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Attendance */}
        {activeTab === 'attendance' && (
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-200 uppercase text-[10px] tracking-wider font-extrabold">
              <tr>
                <th className="px-4 py-3.5">{t('fullName')}</th>
                <th className="px-4 py-3.5">{t('date')}</th>
                <th className="px-4 py-3.5">{t('checkInTime')}</th>
                <th className="px-4 py-3.5">{t('checkOutTime')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredAttendance.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-950 dark:text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-200 font-sans">{formatDate(r.date)}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700 dark:text-emerald-400 font-sans">{formatTime(r.check_in_time)}</td>
                  <td className="px-4 py-3.5 font-bold text-rose-700 dark:text-rose-400 font-sans">{formatTime(r.check_out_time)}</td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-slate-400 dark:text-slate-500">
                    {isRtl ? 'لا توجد سجلات حضور مطابقة.' : 'No matching attendance records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Leaves */}
        {activeTab === 'leaves' && (
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-200 uppercase text-[10px] tracking-wider font-extrabold">
              <tr>
                <th className="px-4 py-3.5">{t('fullName')}</th>
                <th className="px-4 py-3.5">{t('type')}</th>
                <th className="px-4 py-3.5">{t('date')}</th>
                <th className="px-4 py-3.5">{t('permissionDetails')}</th>
                <th className="px-4 py-3.5">{t('active')}</th>
                <th className="px-4 py-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredLeaves.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-950 dark:text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3.5 capitalize font-bold text-blue-700 dark:text-blue-400">
                    {r.type === 'leave' ? t('annualLeave') : t('permission')}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-200 font-sans">{formatDate(r.date)}</td>
                  <td className="px-4 py-3.5 text-slate-800 dark:text-slate-300 font-medium">
                    {r.type === 'permission' && r.timeframe ? (
                      <span>
                        {r.timeframe === 'morning' ? t('morning') : t('evening')}
                        {r.excuse_time ? ` (${r.excuse_time})` : ''}
                      </span>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700 dark:text-emerald-400">{r.status}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete('leaves_permissions', r.id)}
                      disabled={loadingId === r.id}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg transition-all cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 dark:text-slate-500">
                    {isRtl ? 'لا توجد طلبات إجازة مطابقة.' : 'No matching requests found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* KPIs */}
        {activeTab === 'kpis' && (
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-200 uppercase text-[10px] tracking-wider font-extrabold">
              <tr>
                <th className="px-4 py-3.5">{t('fullName')}</th>
                <th className="px-4 py-3.5">{t('date')}</th>
                <th className="px-4 py-3.5">{t('quantity')}</th>
                <th className="px-4 py-3.5">{t('unit')}</th>
                <th className="px-4 py-3.5">{t('notes')}</th>
                <th className="px-4 py-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredKpis.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-950 dark:text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-200 font-sans">{formatDate(r.date)}</td>
                  <td className="px-4 py-3.5 font-extrabold text-blue-700 dark:text-blue-400 font-sans">{r.amount}</td>
                  <td className="px-4 py-3.5 capitalize font-semibold text-slate-800 dark:text-slate-300">{r.unit}</td>
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-400 italic max-w-xs truncate">
                    {r.notes || '--'}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete('kpi_entries', r.id)}
                      disabled={loadingId === r.id}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg transition-all cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredKpis.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 dark:text-slate-500">
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
