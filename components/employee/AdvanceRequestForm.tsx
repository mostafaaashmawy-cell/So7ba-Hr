'use client';

import React, { useState } from 'react';
import { DollarSign, AlertTriangle, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';
import { AdvanceRecord } from '@/lib/types/database';
import { getPayrollMonthDate, formatDate } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';

interface AdvanceRequestProps {
  userId: string;
  basicSalary: number;
  initialAdvances: AdvanceRecord[];
}

export default function AdvanceRequestForm({ userId, basicSalary, initialAdvances }: AdvanceRequestProps) {
  const [advances, setAdvances] = useState<AdvanceRecord[]>(initialAdvances);
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const supabase = createClient();

  const maxAllowed = basicSalary * 0.30;
  const currentPayrollMonth = getPayrollMonthDate();

  // Total advances taken in current payroll cycle
  const currentMonthAdvances = advances
    .filter((a) => a.month === currentPayrollMonth)
    .reduce((sum, a) => sum + Number(a.amount), 0);

  const remainingMargin = Math.max(0, maxAllowed - currentMonthAdvances);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setAmount(val);

    if (typeof val === 'number' && val > maxAllowed) {
      setMsg({
        text: `Requested amount exceeds 30% monthly salary limit (${maxAllowed.toLocaleString()} EGP).`,
        error: true,
      });
    } else if (typeof val === 'number' && val > remainingMargin) {
      setMsg({
        text: `Requested amount exceeds remaining available margin (${remainingMargin.toLocaleString()} EGP).`,
        error: true,
      });
    } else {
      setMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    if (amount > maxAllowed) {
      setMsg({
        text: `Cannot request more than 30% of basic salary (${maxAllowed.toLocaleString()} EGP).`,
        error: true,
      });
      return;
    }

    if (amount > remainingMargin) {
      setMsg({
        text: `Exceeds remaining available margin for this payroll month (${remainingMargin.toLocaleString()} EGP).`,
        error: true,
      });
      return;
    }

    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from('advances')
      .insert({
        user_id: userId,
        amount: Number(amount),
        month: currentPayrollMonth,
      })
      .select()
      .single();

    if (error) {
      setMsg({ text: error.message, error: true });
    } else if (data) {
      setAdvances([data as AdvanceRecord, ...advances]);
      setAmount('');
      setMsg({ text: 'Advance payment request logged successfully!', error: false });
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Advance Payment (السلف)</h3>
            <p className="text-xs text-gray-400">Monthly cap: 30% of basic salary</p>
          </div>
        </div>
      </div>

      {/* Salary & Cap Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs font-semibold text-gray-400 block mb-1">Basic Salary</span>
          <span className="text-xl font-bold text-white">{basicSalary.toLocaleString()} <span className="text-xs text-gray-400 font-normal">EGP</span></span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs font-semibold text-gray-400 block mb-1">Max Monthly Cap (30%)</span>
          <span className="text-xl font-bold text-amber-400">{maxAllowed.toLocaleString()} <span className="text-xs text-gray-400 font-normal">EGP</span></span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs font-semibold text-gray-400 block mb-1">Current Month Deductions</span>
          <span className="text-xl font-bold text-rose-400">{currentMonthAdvances.toLocaleString()} <span className="text-xs text-gray-400 font-normal">EGP</span></span>
        </div>
      </div>

      {/* Request Form */}
      {msg && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            msg.error
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {msg.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Requested Amount (Max: {remainingMargin.toLocaleString()} EGP remaining)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max={remainingMargin}
              step="100"
              value={amount}
              onChange={handleAmountChange}
              placeholder="e.g. 1500"
              required
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            />
            <DollarSign className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (typeof amount === 'number' && amount > remainingMargin)}
          className="w-full sm:w-auto gradient-btn px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          Request Advance
        </button>
      </form>

      {/* Advances Log */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Advance History</h4>
        {advances.length === 0 ? (
          <div className="text-center py-5 text-xs text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800">
            No advance requests recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 rounded-l-lg">Date</th>
                  <th className="px-4 py-2.5">Payroll Month</th>
                  <th className="px-4 py-2.5 text-right rounded-r-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {advances.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-900/40">
                    <td className="px-4 py-3 text-gray-400">{formatDate(a.created_at || a.month)}</td>
                    <td className="px-4 py-3 font-medium text-purple-300">{a.month}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">{Number(a.amount).toLocaleString()} EGP</td>
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
