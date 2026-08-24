'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import { UserProfile, ShiftRecord, ShiftSwapRequestRecord } from '@/lib/types/database';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  Clock,
  ArrowLeftRight,
  Plus,
  Trash2,
  Check,
  X,
  CheckCircle2,
  AlertTriangle,
  Users,
  RefreshCw,
} from 'lucide-react';
import { logAuditAction } from '@/lib/utils/auditLogger';

interface ShiftWithHeadcount extends ShiftRecord {
  employeeCount: number;
}

export default function ShiftsManagementPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [shifts, setShifts] = useState<ShiftWithHeadcount[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequestRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'roster' | 'swaps'>('roster');

  // New Shift Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [nightAllowance, setNightAllowance] = useState<number>(0);
  const [isSplit, setIsSplit] = useState(false);
  const [splitStart2, setSplitStart2] = useState('17:00');
  const [splitEnd2, setSplitEnd2] = useState('21:00');
  const [breakMins, setBreakMins] = useState<number>(0);
  const [rosterType, setRosterType] = useState<'fixed' | 'rotational_2week'>('fixed');

  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const fetchShiftsData = async () => {
    setLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile) return;
    setCurrentUser(profile as UserProfile);

    // Fetch Shifts
    const { data: shiftsData } = await supabase
      .from('shifts')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('start_time');

    // Fetch Users to calculate headcount per shift
    const { data: usersData } = await supabase
      .from('users')
      .select('id, shift_id')
      .eq('tenant_id', profile.tenant_id);

    const userList = usersData || [];

    if (shiftsData) {
      const formattedShifts: ShiftWithHeadcount[] = (shiftsData as ShiftRecord[]).map((s) => ({
        ...s,
        employeeCount: userList.filter((u) => u.shift_id === s.id).length,
      }));
      setShifts(formattedShifts);
    }

    // Fetch Swap Requests
    const { data: swapData } = await supabase
      .from('shift_swap_requests')
      .select('*, requester:users!requester_id(*), target_user:users!target_user_id(*), requester_shift:shifts!requester_shift_id(*), target_shift:shifts!target_shift_id(*)')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (swapData) {
      setSwapRequests(swapData as ShiftSwapRequestRecord[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchShiftsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser?.tenant_id) return;

    setSaving(true);
    setMsg(null);

    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          tenant_id: currentUser.tenant_id,
          name: name.trim(),
          start_time: startTime,
          end_time: endTime,
          night_shift_allowance: Number(nightAllowance || 0),
          is_split: Boolean(isSplit),
          split_start_time_2: isSplit ? splitStart2 : null,
          split_end_time_2: isSplit ? splitEnd2 : null,
          break_minutes: Number(breakMins || 0),
          roster_type: rosterType,
        })
        .select()
        .single();

      if (error) throw error;

      setMsg({
        text: isRtl ? 'تم إنشاء الوردية بنجاح!' : 'Shift created successfully!',
        error: false,
      });
      setShowAddModal(false);
      setName('');
      setNightAllowance(0);
      setIsSplit(false);
      setBreakMins(0);
      fetchShiftsData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to create shift';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShift = async (id: string, shiftName: string) => {
    if (!confirm(isRtl ? `هل تريد حذف وردية "${shiftName}"؟` : `Delete shift "${shiftName}"?`)) return;

    try {
      const { error } = await supabase.from('shifts').delete().eq('id', id);
      if (error) throw error;

      setShifts((prev) => prev.filter((s) => s.id !== id));
      setMsg({ text: isRtl ? 'تم حذف الوردية بنجاح.' : 'Shift deleted.', error: false });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Delete failed';
      setMsg({ text: errMsg, error: true });
    }
  };

  const handleReviewSwap = async (id: string, status: 'approved' | 'rejected') => {
    if (!currentUser || !currentUser.tenant_id) return;
    setActionId(id);
    setMsg(null);

    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({
          status,
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setSwapRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );

      logAuditAction(supabase, {
        tenant_id: currentUser.tenant_id,
        actor_id: currentUser.id,
        action_type: status === 'approved' ? 'APPROVE_SHIFT_SWAP' : 'REJECT_SHIFT_SWAP',
        entity_name: 'shift_swap_requests',
        entity_id: id,
        details: { status },
      });

      setMsg({
        text:
          status === 'approved'
            ? isRtl
              ? 'تمت الموافقة على تبديل الوردية!'
              : 'Shift swap request approved!'
            : isRtl
            ? 'تم رفض طلب التبديل.'
            : 'Shift swap request rejected.',
        error: false,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Action failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setActionId(null);
    }
  };

  const pendingSwaps = swapRequests.filter((r) => r.status === 'pending_admin');

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={currentUser} activeRoleView={currentUser?.role === 'super_admin' ? 'super_admin' : 'manager'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h1 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {isRtl ? 'إدارة الورديات ومصفوفة تبديل الدوام' : 'Shift Management & Swap Matrix'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRtl
                ? 'إعداد الورديات الصباحية والمسائية والليليّة، الورديات المقسمة، ومراجعة طلبات التبديل'
                : 'Configure split shifts, night allowances, rotational rosters, and audit peer swap requests.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchShiftsData}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إضافة وردية جديدة' : 'New Shift Schedule'}</span>
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {msg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              msg.error
                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            {msg.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isRtl ? 'إجمالي الورديات المعرفة' : 'Configured Shifts'}
            </span>
            <span className="text-2xl font-extrabold text-slate-950 dark:text-white font-sans">
              {shifts.length}
            </span>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
              {isRtl ? 'ورديات مقسمة (Split)' : 'Split Shifts'}
            </span>
            <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-sans">
              {shifts.filter((s) => s.is_split).length}
            </span>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {isRtl ? 'طلبات تبديل بانتظار الاعتماد' : 'Pending Swap Requests'}
            </span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-sans">
              {pendingSwaps.length}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isRtl ? 'جدول الورديات' : 'Shifts Roster'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('swaps')}
            className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'swaps'
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isRtl ? `طلبات التبديل (${pendingSwaps.length})` : `Swap Approvals (${pendingSwaps.length})`}
          </button>
        </div>

        {/* TAB 1: ROSTER */}
        {activeTab === 'roster' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="cleariq-card p-5 cleariq-card-hover flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                        {shift.name}
                      </h3>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-sans block mt-0.5">
                        {shift.start_time} — {shift.end_time}
                      </span>
                      {shift.is_split && shift.split_start_time_2 && (
                        <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 font-sans block">
                          & {shift.split_start_time_2} — {shift.split_end_time_2} (Session 2)
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteShift(shift.id, shift.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Attributes & Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold">
                    {Number(shift.night_shift_allowance || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
                        🌙 +{Number(shift.night_shift_allowance).toLocaleString()} EGP Allowance
                      </span>
                    )}
                    {shift.is_split && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300">
                        ⚡ Dual Session
                      </span>
                    )}
                    {Number(shift.break_minutes || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                        ☕ {shift.break_minutes}m Break
                      </span>
                    )}
                    {shift.roster_type === 'rotational_2week' && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                        🔄 2-Week Rotation
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-sans">
                    {shift.employeeCount} {isRtl ? 'موظف مسكن' : 'staff assigned'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Active Roster
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SWAP APPROVALS */}
        {activeTab === 'swaps' && (
          <div className="cleariq-card overflow-hidden cleariq-card-hover">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4">{isRtl ? 'الموظف الطالب' : 'Requester'}</th>
                    <th className="py-3 px-4">{isRtl ? 'الزميل المطلوب' : 'Target Peer'}</th>
                    <th className="py-3 px-4">{isRtl ? 'تاريخ التبديل' : 'Date'}</th>
                    <th className="py-3 px-4">{isRtl ? 'تبديل الوردية' : 'Shift Swap'}</th>
                    <th className="py-3 px-4 text-right">{isRtl ? 'الإجراء' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-sans">
                  {swapRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        {isRtl ? 'لا توجد طلبات تبديل ورديات مسجلة.' : 'No shift swap requests found.'}
                      </td>
                    </tr>
                  ) : (
                    swapRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-950 dark:text-white">
                          {r.requester?.full_name || 'Requester'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-950 dark:text-white">
                          {r.target_user?.full_name || 'Peer'}
                        </td>
                        <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-slate-100">
                          {r.requested_date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-sans text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {r.requester_shift?.name || 'Shift A'} ⇄ {r.target_shift?.name || 'Shift B'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {r.status === 'pending_admin' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleReviewSwap(r.id, 'approved')}
                                disabled={actionId === r.id}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'موافقة' : 'Approve'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReviewSwap(r.id, 'rejected')}
                                disabled={actionId === r.id}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'رفض' : 'Reject'}</span>
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                r.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                              }`}
                            >
                              {r.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create Shift Schedule */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="cleariq-card p-6 w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {isRtl ? 'إنشاء وتحديد جدول وردية جديد' : 'Create New Shift Schedule'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateShift} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                    {isRtl ? 'اسم الوردية' : 'Shift Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Night Operations, Split Retail Shift"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                      {isRtl ? 'وقت البدء (Session 1)' : 'Start Time (Session 1)'}
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                      {isRtl ? 'وقت الانتهاء (Session 1)' : 'End Time (Session 1)'}
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                      {isRtl ? 'بدل وردية ليلية (ج.م)' : 'Night Allowance (EGP)'}
                    </label>
                    <input
                      type="number"
                      value={nightAllowance}
                      onChange={(e) => setNightAllowance(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                      {isRtl ? 'خصم الاستراحة (دقائق)' : 'Break Minutes (Deduction)'}
                    </label>
                    <input
                      type="number"
                      value={breakMins}
                      onChange={(e) => setBreakMins(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                    />
                  </div>
                </div>

                {/* Split Shift */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={isSplit}
                      onChange={(e) => setIsSplit(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isRtl ? 'وردية مقسمة على فترتين (Split Shift)' : 'Enable Split Shift (Session 2)'}</span>
                  </label>

                  {isSplit && (
                    <div className="grid grid-cols-2 gap-3 pl-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          {isRtl ? 'بدء الفترة الثانية' : 'Session 2 Start'}
                        </label>
                        <input
                          type="time"
                          value={splitStart2}
                          onChange={(e) => setSplitStart2(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          {isRtl ? 'انتهاء الفترة الثانية' : 'Session 2 End'}
                        </label>
                        <input
                          type="time"
                          value={splitEnd2}
                          onChange={(e) => setSplitEnd2(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className="gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isRtl ? 'حفظ الوردية' : 'Create Shift'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
