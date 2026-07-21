'use client';

import React, { useState } from 'react';
import { Trash2, ShieldAlert, Clock, Calendar, Wallet, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { AttendanceRecord, LeavePermissionRecord, AdvanceRecord, KpiEntryRecord } from '@/lib/types/database';
import { formatDate, formatTime, calculateWorkingHours } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';

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
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [leaves, setLeaves] = useState<LeavePermissionRecord[]>(initialLeaves);
  const [advances, setAdvances] = useState<AdvanceRecord[]>(initialAdvances);
  const [kpis, setKpis] = useState<KpiEntryRecord[]>(initialKpis);

  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'advances' | 'kpis'>('attendance');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const supabase = createClient();

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to permanently delete this record?')) return;

    setLoadingId(id);
    setMsg(null);

    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      setMsg({ text: error.message, error: true });
    } else {
      if (table === 'attendance') setAttendance(attendance.filter((r) => r.id !== id));
      if (table === 'leaves_permissions') setLeaves(leaves.filter((r) => r.id !== id));
      if (table === 'advances') setAdvances(advances.filter((r) => r.id !== id));
      if (table === 'kpi_entries') setKpis(kpis.filter((r) => r.id !== id));

      setMsg({ text: 'Record permanently deleted from system.', error: false });
    }
    setLoadingId(null);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Global Record Override & Deletion Center
          </h3>
          <p className="text-xs text-gray-400">Super Admin authority to delete or invalidate invalid logs</p>
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
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Attendance ({attendance.length})
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'leaves'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Leaves ({leaves.length})
        </button>

        <button
          onClick={() => setActiveTab('advances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'advances'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Wallet className="w-4 h-4" /> Advances ({advances.length})
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'kpis'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Target className="w-4 h-4" /> KPIs ({kpis.length})
        </button>
      </div>

      {/* Tables */}
      <div className="overflow-x-auto">
        {/* Attendance */}
        {activeTab === 'attendance' && (
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">User</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Check-In</th>
                <th className="px-4 py-3">Check-Out</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Delete Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {attendance.map((r) => (
                <tr key={r.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-emerald-400">{formatTime(r.check_in_time)}</td>
                  <td className="px-4 py-3 text-rose-400">{formatTime(r.check_out_time)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete('attendance', r.id)}
                      disabled={loadingId === r.id}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Leaves */}
        {activeTab === 'leaves' && (
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Delete Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {leaves.map((r) => (
                <tr key={r.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3 capitalize font-medium text-purple-300">{r.type}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-emerald-400">{r.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete('leaves_permissions', r.id)}
                      disabled={loadingId === r.id}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Advances */}
        {activeTab === 'advances' && (
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">User</th>
                <th className="px-4 py-3">Payroll Month</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Delete Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {advances.map((r) => (
                <tr key={r.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3 text-purple-300">{r.month}</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">{Number(r.amount).toLocaleString()} EGP</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete('advances', r.id)}
                      disabled={loadingId === r.id}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* KPIs */}
        {activeTab === 'kpis' && (
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">User</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Achieved</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Delete Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {kpis.map((r) => (
                <tr key={r.id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 font-semibold text-white">{r.user?.full_name || r.user_id}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 font-bold text-blue-400">{r.amount}</td>
                  <td className="px-4 py-3 capitalize text-gray-400">{r.unit}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete('kpi_entries', r.id)}
                      disabled={loadingId === r.id}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
