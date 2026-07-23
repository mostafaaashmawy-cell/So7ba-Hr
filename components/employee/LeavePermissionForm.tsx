'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { LeavePermissionRecord } from '@/lib/types/database';
import { formatDate, getCairoDate } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';

interface LeavePermissionProps {
  userId: string;
  initialRecords: LeavePermissionRecord[];
}

export default function LeavePermissionForm({ userId, initialRecords }: LeavePermissionProps) {
  const { t, isRtl } = useLanguage();
  const [records, setRecords] = useState<LeavePermissionRecord[]>(initialRecords);
  const [type, setType] = useState<'leave' | 'permission'>('leave');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeframe, setTimeframe] = useState<'morning' | 'evening'>('morning');
  const [excuseTime, setExcuseTime] = useState<string>('10:00');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const supabase = createClient();

  const ANNUAL_LIMIT = 21;
  const consumedLeaves = records.filter((r) => r.type === 'leave' && r.status === 'active').length;
  const remainingLeaves = Math.max(0, ANNUAL_LIMIT - consumedLeaves);
  
  // Calculate permissions in the current calendar month
  const currentMonthStr = getCairoDate().toISOString().slice(0, 7); // "YYYY-MM"
  const permissionsInCurrentMonth = records.filter(
    (r) => r.type === 'permission' && r.status === 'active' && r.date.startsWith(currentMonthStr)
  );
  const permissionsCount = permissionsInCurrentMonth.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    if (type === 'leave' && remainingLeaves <= 0) {
      setMsg({ text: t('maxLeavesExceeded'), error: true });
      setLoading(false);
      return;
    }

    if (type === 'permission') {
      const selectedMonthStr = date.slice(0, 7); // check limit for the requested month
      const countInSelectedMonth = records.filter(
        (r) => r.type === 'permission' && r.status === 'active' && r.date.startsWith(selectedMonthStr)
      ).length;

      if (countInSelectedMonth >= 4) {
        setMsg({ text: t('maxPermsExceeded'), error: true });
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from('leaves_permissions')
      .insert({
        user_id: userId,
        type,
        date,
        status: 'active',
        timeframe: type === 'permission' ? timeframe : null,
        excuse_time: type === 'permission' ? excuseTime : null,
      })
      .select()
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setRecords([data as LeavePermissionRecord, ...records]);
      setMsg({ text: t('requestLogged'), error: false });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Cards Summary grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">{t('totalAllowance')}</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {ANNUAL_LIMIT} <span className="text-xs font-normal text-gray-400">{t('days')}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">{t('consumedLeave')}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {consumedLeaves} <span className="text-xs font-normal text-gray-400">{t('days')}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">{t('remainingLeave')}</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {remainingLeaves} <span className="text-xs font-normal text-gray-400">{t('days')}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">{t('permissionsTaken')}</span>
            <CheckCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">
            {permissionsCount} / 4{' '}
            <span className="text-xs font-normal text-gray-400">{t('requests')}</span>
          </div>
        </div>
      </div>

      {/* Logging Form */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800">
        <h3 className="font-bold text-lg text-white mb-1">{t('leavesTitle')}</h3>
        <p className="text-xs text-gray-400 mb-5">{t('leavesDesc')}</p>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('type')}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'leave' | 'permission')}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
              >
                <option value="leave">{t('annualLeave')}</option>
                <option value="permission">{t('permission')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('date')}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            {type !== 'permission' && (
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-btn py-2.5 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> {t('logRequest')}
                </button>
              </div>
            )}
          </div>

          {/* Conditional excuse fields for permission */}
          {type === 'permission' && (
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-4">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                {t('permissionDetails')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('timeframe')}</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as 'morning' | 'evening')}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="morning">{t('morning')}</option>
                    <option value="evening">{t('evening')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('excuseTime')}</label>
                  <input
                    type="time"
                    value={excuseTime}
                    onChange={(e) => setExcuseTime(e.target.value)}
                    required
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-btn py-2.5 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> {t('logRequest')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* History table */}
        <div className="mt-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{t('recentRequests')}</h4>
          {records.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800">
              {isRtl ? 'لا يوجد طلبات إجازة أو إذن مغادرة مسجلة.' : 'No leave or permission requests logged yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5 rounded-l-lg">{t('type')}</th>
                    <th className="px-4 py-2.5">{t('date')}</th>
                    <th className="px-4 py-2.5">{t('permissionDetails')}</th>
                    <th className="px-4 py-2.5 rounded-r-lg">{t('active')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {records.slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-900/40">
                      <td className="px-4 py-3 font-medium capitalize">
                        {r.type === 'leave' ? (
                          <span className="text-purple-300">{t('annualLeave')}</span>
                        ) : (
                          <span className="text-blue-300">{t('permission')}</span>
                        )}
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
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            r.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-300 border-red-500/30'
                          }`}
                        >
                          {r.status === 'active' ? t('active') : t('cancelled')}
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
