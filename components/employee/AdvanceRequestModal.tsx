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

  // Calculate accumulated pending + approved advances this month
  const currentMonthAdvances = history
    .filter(
      (item) =>
        (item.month?.startsWith(currentMonthStr.substring(0, 7)) || item.created_at?.startsWith(currentMonthStr.substring(0, 7))) &&
        (item.status === 'pending' || item.status === 'approved')
    )
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const remainingAllowed = Math.max(0, maxAllowed - currentMonthAdvances);

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

    if (remainingAllowed <= 0) {
      setMsg({
        text: isRtl
          ? `لقد استنفدت الحد الأقصى للسلف لهذا الشهر (${maxAllowed.toLocaleString()} ج.م)!`
          : `You have exhausted the maximum advance limit for this month (${maxAllowed.toLocaleString()} EGP)!`,
        error: true,
      });
      return;
    }

    if (Number(amount) > remainingAllowed) {
      setMsg({
        text: isRtl
          ? `المبلغ المطلوب يتجاوز الرصيد المتبقي المتاح للسلف وهو ${remainingAllowed.toLocaleString()} ج.م (إجمالي الحد: ${maxAllowed.toLocaleString()} ج.م)!`
          : `Amount exceeds remaining available advance of ${remainingAllowed.toLocaleString()} EGP (Total monthly cap: ${maxAllowed.toLocaleString()} EGP)!`,
        error: true,
      });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      // Check tenant-level monthly liability budget if configured
      const tenantBudget = Number(tenantSettings?.max_monthly_tenant_advance_budget || 0);
      if (tenantBudget > 0 && tenantSettings?.tenant_id) {
        const { data: tenantAdvances } = await supabase
          .from('advances')
          .select('amount')
          .eq('tenant_id', tenantSettings.tenant_id)
          .gte('month', currentMonthStr)
          .in('status', ['pending', 'approved']);

        const totalTenantSum = (tenantAdvances || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        if (totalTenantSum + Number(amount) > tenantBudget) {
          const remainingTenant = Math.max(0, tenantBudget - totalTenantSum);
          throw new Error(
            isRtl
              ? `عذراً، تم استهلاك ميزانية سلف الشركة الشهرية المعتمدة (${tenantBudget.toLocaleString()} ج.م). الرصيد المتاح للشركة: ${remainingTenant.toLocaleString()} ج.م`
              : `Company monthly advance budget limit (${tenantBudget.toLocaleString()} EGP) reached. Remaining available: ${remainingTenant.toLocaleString()} EGP`
          );
        }
      }

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
      {/* Workspace Advance Request Card — Consistent Cleariq Light & Dark theme */}
      <div className="cleariq-card p-5 cleariq-card-hover flex flex-col justify-between space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                {isRtl ? 'طلب سلفة على الراتب' : 'Salary Advance Engine'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isRtl
                  ? `الحد الأقصى ${maxPct}% من الأساسي (${maxAllowed.toLocaleString()} ج.م)`
                  : `Up to ${maxPct}% of basic salary (${maxAllowed.toLocaleString()} EGP)`}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isEligible
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
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
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:border-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
        >
          {isRtl ? 'تقديم أو متابعة طلب السلفة' : 'Request / View Advances'}
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  {isRtl ? 'طلب سلفة مالية شهرية' : 'Monthly Salary Advance Request'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Eligibility Note */}
            {!isEligible && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
                <Clock className="w-4 h-4 shrink-0 text-amber-600" />
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
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
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
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-200">
                    {isRtl ? 'مبلغ السلفة المطلوب (ج.م)' : 'Requested Advance Amount (EGP)'}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-sans">
                      {isRtl ? 'المتاح: ' : 'Remaining: '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{remainingAllowed.toLocaleString()} EGP</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      ({isRtl ? 'الحد: ' : 'Cap: '}{maxAllowed.toLocaleString()} EGP)
                    </span>
                  </div>
                </div>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  max={remainingAllowed}
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                  {isRtl ? 'ملاحظات أو سبب الطلب (اختياري)' : 'Reason / Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isRtl ? 'اكتب ملاحظات الطلب...' : 'Add any context for your manager...'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !amount || Number(amount) <= 0 || !isEligible}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {isRtl ? 'تأكيد تقديم طلب السلفة' : 'Submit Advance Request'}
              </button>
            </form>

            {/* Request History */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300">
                {isRtl ? 'سجل طلبات السلف السابقة' : 'My Advance Requests History'}
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-slate-950 dark:text-white font-sans">
                        {Number(item.amount).toLocaleString()} EGP
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                        {item.month?.substring(0, 7)}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          : item.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-4 text-[11px] text-slate-400">
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
