'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Plus, ShieldAlert, Sparkles } from 'lucide-react';
import { LeavePermissionRecord } from '@/lib/types/database';
import { formatDate } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';

interface LeavePermissionProps {
  userId: string;
  initialRecords: LeavePermissionRecord[];
}

export default function LeavePermissionForm({ userId, initialRecords }: LeavePermissionProps) {
  const [records, setRecords] = useState<LeavePermissionRecord[]>(initialRecords);
  const [type, setType] = useState<'leave' | 'permission'>('leave');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const supabase = createClient();

  const ANNUAL_LIMIT = 21;
  const consumedLeaves = records.filter((r) => r.type === 'leave' && r.status === 'active').length;
  const remainingLeaves = Math.max(0, ANNUAL_LIMIT - consumedLeaves);
  const permissionsCount = records.filter((r) => r.type === 'permission' && r.status === 'active').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    if (type === 'leave' && remainingLeaves <= 0) {
      setMsg({ text: 'Annual leave balance exceeded! Maximum 21 days allowed per year.', error: true });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('leaves_permissions')
      .insert({
        user_id: userId,
        type,
        date,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setRecords([data as LeavePermissionRecord, ...records]);
      setMsg({ text: `${type === 'leave' ? 'Leave' : 'Permission'} logged successfully!`, error: false });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Cards Summary grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">Total Allowance</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{ANNUAL_LIMIT} <span className="text-xs font-normal text-gray-400">days</span></div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">Consumed Leave</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{consumedLeaves} <span className="text-xs font-normal text-gray-400">days</span></div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">Remaining Leave</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{remainingLeaves} <span className="text-xs font-normal text-gray-400">days</span></div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">Permissions Taken</span>
            <CheckCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{permissionsCount} <span className="text-xs font-normal text-gray-400">requests</span></div>
        </div>
      </div>

      {/* Logging Form */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800">
        <h3 className="font-bold text-lg text-white mb-1">Request Leave or Permission</h3>
        <p className="text-xs text-gray-400 mb-5">Auto-logged instantly to operations system</p>

        {msg && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              msg.error
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Request Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'leave' | 'permission')}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            >
              <option value="leave">Annual Leave (إجازة سنوية)</option>
              <option value="permission">Permission / Excuse (إذن مغادرة)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-2.5 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Log Request
            </button>
          </div>
        </form>

        {/* History table */}
        <div className="mt-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Recent Requests</h4>
          {records.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800">
              No leave or permission requests logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5 rounded-l-lg">Type</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {records.slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-900/40">
                      <td className="px-4 py-3 font-medium capitalize">
                        {r.type === 'leave' ? (
                          <span className="text-purple-300">Annual Leave</span>
                        ) : (
                          <span className="text-blue-300">Permission</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(r.date)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            r.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-300 border-red-500/30'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
