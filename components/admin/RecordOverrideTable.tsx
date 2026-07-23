'use client';

import React, { useState } from 'react';
import { Trash2, ShieldAlert, Clock, Calendar, Wallet, Target, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { AttendanceRecord, LeavePermissionRecord, AdvanceRecord, KpiEntryRecord } from '@/lib/types/database';
import { formatDate, formatTime } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';

interface RecordOverrideProps {
  initialAttendance: AttendanceRecord[];
  initialLeaves: LeavePermissionRecord[];
  initialAdvances: AdvanceRecord[];
  initialKpis: KpiEntryRecord[];
}

export default function RecordOverrideTable({
  initialAttendance,
  initialLeaves,
  initialAdvances,
  initialKpis,
}: RecordOverrideProps) {
  const { t, isRtl } = useLanguage();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [leaves, setLeaves] = useState<LeavePermissionRecord[]>(initialLeaves);
  const [advances, setAdvances] = useState<AdvanceRecord[]>(initialAdvances);
  const [kpis, setKpis] = useState<KpiEntryRecord[]>(initialKpis);

  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'advances' | 'kpis'>('attendance');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

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

  const supabase = createClient();

  const handleDelete = async (table: string, id: string) => {
    if (!confirm(isRtl ? 'هل أنت متأكد أنك تريد حذف هذا السجل نهائياً؟' : 'Are you sure you want to permanently delete this record?')) return;

    setLoadingId(id);
    setMsg(null);

    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      setMsg({ text: error.message, error: true });
    } else {
      if (table === 'leaves_permissions') setLeaves(leaves.filter((r) => r.id !== id));
      if (table === 'advances') setAdvances(advances.filter((r) => r.id !== id));
      if (table === 'kpi_entries') setKpis(kpis.filter((r) => r.id !== id));

      setMsg({ text: isRtl ? 'تم حذف السجل نهائياً من النظام.' : 'Record permanently deleted from system.', error: false });
    }
    setLoadingId(null);
  };

  // FILTER LOGIC
  const filteredAttendance = attendance.filter((r) => {
    if (attendanceDate && r.date !== attendanceDate) return false;
    return true;
  });

  const filteredLeaves = leaves.filter((r) => {
    if (leavesType !== 'all' && r.type !== leavesType) return false;
    return true;
  });

  const filteredAdvances = advances.filter((r) => {
    const amt = Number(r.amount);
    if (advMin !== '' && amt < advMin) return false;
    if (advMax !== '' && amt > advMax) return false;
    if (advMonth && r.month !== advMonth) return false;
    if (advDate && !(r.created_at || r.month).startsWith(advDate)) return false;
    return true;
  });

  // Extract unique KPI units for filtering dropdown
  const uniqueKpiUnits = Array.from(new Set(kpis.map((k) => k.unit)));

  const filteredKpis = kpis.filter((r) => {
    if (kpisUnit !== 'all' && r.unit !== kpisUnit) return false;
    if (kpisDate && r.date !== kpisDate) return false;
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
            <ShieldAlert className="w-5 h-5 text-rose-400" /> {t('recordCenter')}
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" /> {t('attendance')} ({filteredAttendance.length})
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'leaves'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> {t('leavesTitle')} ({filteredLeaves.length})
        </button>

        <button
          onClick={() => setActiveTab('advances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'advances'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Wallet className="w-4 h-4" /> {t('advancesTitle')} ({filteredAdvances.length})
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'kpis'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Target className="w-4 h-4" /> {t('kpiTitle')} ({filteredKpis.length})
        </button>
      </div>

      {/* FILTER CONTROLS PANEL */}
      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3">
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
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
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
                onChange={(e) => setLeavesType(e.target.value as any)}
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
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
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">{t('maxAmount')}</label>
              <input
                type="number"
                value={advMax}
                onChange={(e) => setAdvMax(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 2000"
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">{t('filterByMonth')}</label>
              <input
                type="month"
                value={advMonth ? advMonth.substring(0, 7) : ''}
                onChange={(e) => setAdvMonth(e.target.value ? `${e.target.value}-01` : '')}
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">{t('filterByDate')}</label>
              <input
                type="date"
                value={advDate}
                onChange={(e) => setAdvDate(e.target.value)}
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
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
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
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
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">{t('minQty')}</label>
              <input
                type="number"
                value={kpisMinQty}
                onChange={(e) => setKpisMinQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 10"
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">{t('maxQty')}</label>
              <input
                type="number"
                value={kpisMaxQty}
                onChange={(e) => setKpisMaxQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 100"
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="overflow-x-auto">
        {/* Attendance */}
        {activeTab === 'attendance' && (
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                <th className="px-4 py-3">{t('date')}</th>
                <th className="px-4 py-3">{t('checkInTime')}</th>
                <th className="px-4 py-3 rounded-r-lg">{t('checkOutTime')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
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
          <table className="w-full text-left text-xs text-gray-300">
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
            <tbody className="divide-y divide-gray-800/60">
              {filteredLeaves.map((r) => (
                <tr key={r.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3 capitalize font-medium text-purple-300">
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

        {/* Advances */}
        {activeTab === 'advances' && (
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">{t('fullName')}</th>
                <th className="px-4 py-3">{t('date')}</th>
                <th className="px-4 py-3">{t('payrollMonth')}</th>
                <th className="px-4 py-3">{t('amount')}</th>
                <th className="px-4 py-3 text-right rounded-r-lg">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredAdvances.map((r) => (
                <tr key={r.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.created_at || r.month)}</td>
                  <td className="px-4 py-3 text-purple-300">{r.month}</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">{Number(r.amount).toLocaleString()} EGP</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete('advances', r.id)}
                      disabled={loadingId === r.id}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAdvances.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    {isRtl ? 'لا توجد سلف مطابقة.' : 'No matching advances found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* KPIs */}
        {activeTab === 'kpis' && (
          <table className="w-full text-left text-xs text-gray-300">
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
            <tbody className="divide-y divide-gray-800/60">
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
