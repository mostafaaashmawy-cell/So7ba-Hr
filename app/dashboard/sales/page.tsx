'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types/database';
import {
  TrendingUp,
  Plus,
  Check,
  X,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Trash,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface SalesLog {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  user?: { full_name: string };
}

export default function SalesCommissionsPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [sales, setSales] = useState<SalesLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);

  // Log Form State
  const [salesAmount, setSalesAmount] = useState<number | ''>('');
  const [salesDate, setSalesDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Load User details and Sales logs with strict manager scoping
  const loadData = async () => {
    setLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    // Profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setCurrentUser(profile as UserProfile);
      setSelectedEmployee(profile.id);

      // Fetch Sales logs
      let query = supabase.from('sales_logs').select('*, user:users(full_name)');

      if (profile.role === 'manager') {
        // Load direct team members only
        const { data: team } = await supabase
          .from('users')
          .select('*')
          .eq('manager_id', authUser.id);

        if (team) {
          setTeamMembers([profile as UserProfile, ...(team as UserProfile[])]);
          const teamIds = [authUser.id, ...team.map((m) => m.id)];
          query = query.in('user_id', teamIds);
        }
      } else if (profile.role === 'super_admin') {
        // Super admin sees all in tenant
        const { data: all } = await supabase
          .from('users')
          .select('*')
          .eq('tenant_id', profile.tenant_id);
        if (all) {
          setTeamMembers(all as UserProfile[]);
        }
      } else {
        // Employee: strictly personal sales
        query = query.eq('user_id', authUser.id);
      }

      const { data: logs } = await query.order('date', { ascending: false });
      if (logs) {
        setSales(logs as SalesLog[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !salesAmount || Number(salesAmount) <= 0) return;

    setSubmitting(true);
    setMsg(null);

    const targetUserId =
      currentUser.role === 'super_admin' || currentUser.role === 'manager'
        ? selectedEmployee || currentUser.id
        : currentUser.id;

    try {
      const { error } = await supabase.from('sales_logs').insert({
        tenant_id: currentUser.tenant_id,
        user_id: targetUserId,
        amount: Number(salesAmount),
        date: salesDate,
        status:
          currentUser.role === 'super_admin' || currentUser.role === 'manager'
            ? 'approved'
            : 'pending',
      });

      if (error) throw error;

      setMsg({
        text: isRtl ? 'تم تسجيل المعاملة البيعية بنجاح!' : 'Sales achievement logged successfully!',
        error: false,
      });
      setSalesAmount('');
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Submission failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    logId: string,
    newStatus: 'approved' | 'rejected'
  ) => {
    setActionId(logId);
    try {
      const { error } = await supabase
        .from('sales_logs')
        .update({ status: newStatus })
        .eq('id', logId);

      if (error) throw error;
      setSales(
        sales.map((s) => (s.id === logId ? { ...s, status: newStatus } : s))
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Update failed';
      alert(errMsg);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (logId: string) => {
    setActionId(logId);
    try {
      const { error } = await supabase.from('sales_logs').delete().eq('id', logId);
      if (error) throw error;
      setSales(sales.filter((s) => s.id !== logId));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Delete failed';
      alert(errMsg);
    } finally {
      setActionId(null);
    }
  };

  const isPrivileged = currentUser?.role === 'super_admin' || currentUser?.role === 'manager';

  const totalApproved = sales
    .filter((s) => s.status === 'approved')
    .reduce((sum, current) => sum + Number(current.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
        Loading sales & commissions...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar
        user={currentUser}
        activeRoleView={
          currentUser?.role === 'super_admin'
            ? 'super_admin'
            : currentUser?.role === 'manager'
            ? 'manager'
            : 'employee'
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Header & Total Volume */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Revenue & Commissions
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              {isRtl ? 'بوابة مبيعات وعمولات الموظفين' : 'Sales & Commission Engine'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl
                ? 'تسجيل عمليات البيع، احتساب العمولات، واعتماد المعاملات لمسير الرواتب'
                : 'Log client deals, track commissions, and validate payouts for payroll'}
            </p>
          </div>

          <div className="flex items-center gap-3 cleariq-card px-4 py-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              💵
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Approved
              </span>
              <span className="text-base font-extrabold text-slate-900 font-sans">
                {totalApproved.toLocaleString()} EGP
              </span>
            </div>
          </div>
        </div>

        {/* Form & List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LOG SALES FORM */}
          <div className="lg:col-span-1 cleariq-card p-6 cleariq-card-hover space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                {isRtl ? 'تسجيل معاملة بيعية جديدة' : 'Log New Sales Entry'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isRtl ? 'أدخل قيمة الصفقة وتاريخ التعاقد' : 'Enter deal amount and transaction date'}
              </p>
            </div>

            {msg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  msg.error
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {isPrivileged && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الموظف صاحب العمولة' : 'Commission Earner'}
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.job_title || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'قيمة الصفقة / المبيعات (ج.م)' : 'Deal / Sales Amount (EGP)'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  required
                  value={salesAmount}
                  onChange={(e) =>
                    setSalesAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'تاريخ المعاملة' : 'Transaction Date'}
                </label>
                <input
                  type="date"
                  required
                  value={salesDate}
                  onChange={(e) => setSalesDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !salesAmount || Number(salesAmount) <= 0}
                className="gradient-btn w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                {isRtl ? 'تسجيل العملية' : 'Submit Sales Log'}
              </button>
            </form>
          </div>

          {/* SALES LOGS TABLE */}
          <div className="lg:col-span-2 cleariq-card p-6 cleariq-card-hover space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isRtl ? 'سجل المعاملات والعمولات' : 'Sales Logs & Payouts Approval'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isRtl
                  ? 'مراجعة واعتماد صفقات الفريق قبل دمجها في الحسابات'
                  : 'Review, approve, or reject transactions for commission payout'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">{isRtl ? 'الموظف' : 'Employee'}</th>
                    <th className="pb-3">{isRtl ? 'المبلغ' : 'Amount'}</th>
                    <th className="pb-3">{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th className="pb-3 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="pb-3 pr-2 text-right">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-slate-900">
                        {item.user?.full_name || 'Employee'}
                      </td>
                      <td className="py-3.5 font-bold font-sans text-emerald-600 dark:text-emerald-400">
                        {Number(item.amount).toLocaleString()} EGP
                      </td>
                      <td className="py-3.5 text-slate-500 font-sans">{item.date}</td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPrivileged && item.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={actionId === item.id}
                                onClick={() => handleUpdateStatus(item.id, 'approved')}
                                className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                title="Approve"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={actionId === item.id}
                                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                className="p-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {isPrivileged && (
                            <button
                              type="button"
                              disabled={actionId === item.id}
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                        {isRtl
                          ? 'لا توجد معاملات مبيعات مسجلة'
                          : 'No sales records logged yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
