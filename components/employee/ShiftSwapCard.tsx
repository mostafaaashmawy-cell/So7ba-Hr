'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, ShiftSwapRequestRecord } from '@/lib/types/database';
import { useLanguage } from '@/lib/context/LanguageContext';

interface ShiftSwapCardProps {
  userId: string;
  tenantId: string;
}

export default function ShiftSwapCard({ userId, tenantId }: ShiftSwapCardProps) {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [colleagues, setColleagues] = useState<UserProfile[]>([]);
  const [swapHistory, setSwapHistory] = useState<ShiftSwapRequestRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Form State
  const [targetUserId, setTargetUserId] = useState('');
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      // 1. Fetch Colleagues in Tenant
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, job_title, shift_id, shift:shifts(*)')
        .eq('tenant_id', tenantId)
        .neq('id', userId);

      if (users) {
        setColleagues((users as unknown) as UserProfile[]);
        if (users.length > 0) setTargetUserId(users[0].id);
      }

      // 2. Fetch My Swap Requests
      const { data: swaps } = await supabase
        .from('shift_swap_requests')
        .select('*, target_user:users!shift_swap_requests_target_user_id_fkey(full_name)')
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });

      if (swaps) {
        setSwapHistory(swaps as ShiftSwapRequestRecord[]);
      }
    } catch (err) {
      console.warn('Could not load shift swap data:', err);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tenantId]);

  const handleSubmitSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) return;

    setSubmitting(true);
    setMsg(null);

    try {
      const { data, error } = await supabase.from('shift_swap_requests').insert({
        tenant_id: tenantId,
        requester_id: userId,
        target_user_id: targetUserId,
        requested_date: requestedDate,
        notes: notes.trim() || null,
        status: 'pending_admin',
      }).select('*, target_user:users!shift_swap_requests_target_user_id_fkey(full_name)').single();

      if (error) throw error;

      if (data) {
        setSwapHistory([data as ShiftSwapRequestRecord, ...swapHistory]);
        setNotes('');
        setMsg({
          text: isRtl
            ? 'تم إرسال طلب تبديل الوردية للمشرف العام للمراجعة والاعتماد!'
            : 'Shift swap proposal submitted! Awaiting Super Admin review and approval.',
          error: false,
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Swap request failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {isRtl ? 'طلب تبديل وردية العمل' : 'Shift Swap Request Engine'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isRtl
              ? 'اختر الزميل وتاريخ اليوم لطلب تبديل الوردية. يتطلب موافقة المشرف العام.'
              : 'Propose a shift exchange with a teammate. Pending requests require Super Admin approval.'}
          </p>
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

      {/* Request Form */}
      <form onSubmit={handleSubmitSwap} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isRtl ? 'الزميل المراد التبديل معه' : 'Target Teammate'}
          </label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {colleagues.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.job_title || 'Colleague'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isRtl ? 'تاريخ الوردية المستهدفة' : 'Shift Date'}
          </label>
          <input
            type="date"
            required
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isRtl ? 'ملاحظات / سبب التبديل' : 'Reason / Notes (Optional)'}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRtl ? 'سبب التبديل...' : 'e.g. Urgent family matter'}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting || colleagues.length === 0}
            className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowLeftRight className="w-4 h-4" />
            )}
            <span>{submitting ? (isRtl ? 'جاري الإرسال...' : 'Submitting...') : (isRtl ? 'إرسال طلب التبديل' : 'Submit Swap Proposal')}</span>
          </button>
        </div>
      </form>

      {/* Swap History Table */}
      {swapHistory.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isRtl ? 'سجل طلبات التبديل السابقة' : 'My Shift Swap Proposals'}
          </h4>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3">{isRtl ? 'التاريخ' : 'Date'}</th>
                  <th className="py-2.5 px-3">{isRtl ? 'الزميل' : 'Teammate'}</th>
                  <th className="py-2.5 px-3">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3">{isRtl ? 'ملاحظات' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {swapHistory.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-slate-100">
                      {s.requested_date}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-950 dark:text-white">
                      {s.target_user?.full_name || 'Teammate'}
                    </td>
                    <td className="py-2.5 px-3">
                      {s.status === 'approved' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                          Approved by Admin
                        </span>
                      ) : s.status === 'rejected' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                          Rejected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                          Pending Admin Review
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                      {s.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
