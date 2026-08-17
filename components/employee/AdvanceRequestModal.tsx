'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle2, Clock, X, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TenantSettings, AdvanceRecord } from '@/lib/types/database';
import { useLanguage } from '@/lib/context/LanguageContext';

interface AdvanceRequestModalProps {
  userId: string;
  basicSalary: number;
  tenantSettings: TenantSettings | null;
}

export default function AdvanceRequestModal({
  userId,
  basicSalary,
  tenantSettings,
}: AdvanceRequestModalProps) {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [history, setHistory] = useState<AdvanceRecord[]>([]);

  const maxPct = tenantSettings?.max_advance_percentage ?? 50;
  const maxAllowed = Math.round(Number(basicSalary || 0) * (maxPct / 100));
  const eligibilityDay = tenantSettings?.advance_eligibility_day ?? 15;

  const now = new Date();
  const currentDay = now.getDate();
  const isEligible = currentDay >= eligibilityDay;
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('advances')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setHistory(data as AdvanceRecord[]);
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    if (!isEligible) {
      setMsg({
        text: isRtl
          ? `عذراً، طلبات السلف تفتح ابتداءً من يوم ${eligibilityDay} من كل شهر!`
          : `Advance requests open on day ${eligibilityDay} of the month!`,
        error: true,
      });
      return;
    }

    if (Number(amount) > maxAllowed) {
      setMsg({
        text: isRtl
          ? `الحد الأقصى المسموح به هو ${maxAllowed.toLocaleString()} ج.م (${maxPct}% من الراتب الأساسي)!`
          : `Amount exceeds maximum limit of ${maxAllowed.toLocaleString()} EGP (${maxPct}% of basic salary)!`,
        error: true,
      });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const { error } = await supabase.from('advances').insert({
        tenant_id: tenantSettings?.tenant_id,
        user_id: userId,
        amount: Number(amount),
        month: currentMonthStr,
        status: 'pending',
        notes: notes.trim() || null,
      });

      if (error) throw error;

      setMsg({
        text: isRtl
          ? 'تم تقديم طلب السلفة بنجاح وهو قيد مراجعة الإدارة!'
          : 'Salary advance request submitted successfully and is pending review!',
        error: false,
      });
      setAmount('');
      setNotes('');
      fetchHistory();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Submission failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Workspace Advance Request Card */}
      <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-100">
                {isRtl ? 'طلب سلفة على الراتب' : 'Salary Advance Engine'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isRtl
                  ? `الحد الأقصى ${maxPct}% من الأساسي (${maxAllowed.toLocaleString()} ج.م)`
                  : `Up to ${maxPct}% of basic salary (${maxAllowed.toLocaleString()} EGP)`}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isEligible
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isEligible
              ? isRtl
                ? 'متاح الآن'
                : 'Unlocked'
              : isRtl
              ? `يفتح يوم ${eligibilityDay}`
              : `Day ${eligibilityDay}+`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all text-center"
        >
          {isRtl ? 'تقديم أو متابعة طلب السلفة' : 'Request / View Advances'}
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {isRtl ? 'طلب سلفة مالية شهرية' : 'Monthly Salary Advance Request'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Eligibility Note */}
            {!isEligible && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-300">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  {isRtl
                    ? `تنبيه: طلبات السلف تفتح رسمياً ابتداءً من يوم ${eligibilityDay} من كل شهر.`
                    : `Notice: Salary advance requests open on day ${eligibilityDay} of each month.`}
                </span>
              </div>
            )}

            {/* Notification alert */}
            {msg && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs ${
                  msg.error
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                }`}
              >
                {msg.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{msg.text}</span>
              </div>
            )}

            {/* Request Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    {isRtl ? 'مبلغ السلفة المطلوب (ج.م)' : 'Requested Advance Amount (EGP)'}
                  </label>
                  <span className="text-[10px] text-emerald-400 font-sans">
                    {isRtl ? 'الحد الأقصى: ' : 'Max allowed: '}
                    {maxAllowed.toLocaleString()} EGP
                  </span>
                </div>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  max={maxAllowed}
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {isRtl ? 'ملاحظات أو سبب الطلب (اختياري)' : 'Reason / Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isRtl ? 'اكتب ملاحظات الطلب...' : 'Add any context for your manager...'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !amount || Number(amount) <= 0 || !isEligible}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {isRtl ? 'تأكيد تقديم طلب السلفة' : 'Submit Advance Request'}
              </button>
            </form>

            {/* Request History */}
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <h4 className="text-xs font-bold text-gray-400">
                {isRtl ? 'سجل طلبات السلف السابقة' : 'My Advance Requests History'}
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white font-sans">
                        {Number(item.amount).toLocaleString()} EGP
                      </div>
                      <div className="text-[10px] text-gray-500 font-sans">
                        {item.month?.substring(0, 7)}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-3 text-[11px] text-gray-600">
                    {isRtl ? 'لا توجد طلبات سلف سابقة' : 'No previous advance requests logged'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
