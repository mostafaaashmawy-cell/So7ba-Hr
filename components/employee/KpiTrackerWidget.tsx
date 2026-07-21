'use client';

import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { KpiEntryRecord } from '@/lib/types/database';
import { formatDate } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';

interface KpiTrackerProps {
  userId: string;
  kpiUnit: string;
  initialEntries: KpiEntryRecord[];
}

export default function KpiTrackerWidget({ userId, kpiUnit, initialEntries }: KpiTrackerProps) {
  const [entries, setEntries] = useState<KpiEntryRecord[]>(initialEntries);
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const supabase = createClient();

  const totalAchieved = entries.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || Number(amount) <= 0) return;

    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from('kpi_entries')
      .insert({
        user_id: userId,
        date,
        amount: Number(amount),
        unit: kpiUnit || 'tasks',
      })
      .select()
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setEntries([data as KpiEntryRecord, ...entries]);
      setAmount('');
      setMsg({ text: 'KPI log recorded successfully!', error: false });
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Daily Production & KPI Tracking</h3>
            <p className="text-xs text-gray-400">
              Assigned Metric Unit: <span className="font-bold text-purple-300 capitalize">{kpiUnit || 'tasks'}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Total Logged</span>
          <span className="text-xl font-extrabold text-purple-400">
            {totalAchieved.toLocaleString()} <span className="text-xs font-normal text-gray-400">{kpiUnit || 'tasks'}</span>
          </span>
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

      {/* Entry Input Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Achieved Amount ({kpiUnit || 'tasks'})
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 45"
            required
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="gradient-btn py-2.5 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Log Production
        </button>
      </form>

      {/* Production History */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Recent Production Log</h4>
        {entries.length === 0 ? (
          <div className="text-center py-5 text-xs text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800">
            No KPI entries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 rounded-l-lg">Date</th>
                  <th className="px-4 py-2.5">Achieved Quantity</th>
                  <th className="px-4 py-2.5 rounded-r-lg">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {entries.slice(0, 5).map((e) => (
                  <tr key={e.id} className="hover:bg-gray-900/40">
                    <td className="px-4 py-3 text-gray-400">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 font-bold text-purple-300">{e.amount}</td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{e.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
