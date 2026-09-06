'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import { UserProfile, LeavePermissionRecord } from '@/lib/types/database';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { logAuditAction } from '@/lib/utils/auditLogger';

interface LeaveWithUser extends LeavePermissionRecord {
  user?: UserProfile & { department?: { name?: string } };
}

export default function LeaveApprovalsPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [leaves, setLeaves] = useState<LeaveWithUser[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected'>('pending');
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const fetchLeaves = async () => {
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

    // Fetch leaves for tenant
    const { data: leavesData } = await supabase
      .from('leaves_permissions')
      .select('*, user:users(*, department:departments(*))')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (leavesData) {
      setLeaves(leavesData as LeaveWithUser[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'rejected') => {
    if (!currentUser || !currentUser.tenant_id) return;
    setActionId(id);
    setMsg(null);

    try {
      const { error } = await supabase
        .from('leaves_permissions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setLeaves((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );

      logAuditAction(supabase, {
        tenant_id: currentUser.tenant_id,
        actor_id: currentUser.id,
        action_type: newStatus === 'active' ? 'APPROVE_LEAVE' : 'REJECT_LEAVE',
        entity_name: 'leaves_permissions',
        entity_id: id,
        details: { status: newStatus },
      });

      setMsg({
        text:
          newStatus === 'active'
            ? isRtl
              ? 'تمت الموافقة على الطلب بنجاح!'
              : 'Leave request approved successfully!'
            : isRtl
            ? 'تم رفض الطلب.'
            : 'Leave request rejected.',
        error: false,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Action failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setActionId(null);
    }
  };

  // Metrics
  const pendingCount = leaves.filter((l) => l.status === 'pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'active').length;
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

  const filteredLeaves = leaves.filter((l) => {
    const tabMatch = l.status === activeTab;
    const searchMatch =
      l.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.type.toLowerCase().includes(searchQuery.toLowerCase());
    return tabMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={currentUser} activeRoleView={currentUser?.role === 'super_admin' ? 'super_admin' : 'manager'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <h1 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {isRtl ? 'سجل واعتماد طلبات الإجازات والاستئذان' : 'Leave & Permission Approvals'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRtl
                ? 'مراجعة واعتماد طلبات الإجازات السنوية، العارضة، والاستئذانات اليومية للموظفين'
                : 'Review, approve, or reject employee leave and permission requests with dynamic balance tracking.'}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchLeaves}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {isRtl ? 'طلبات قيد المراجعة' : 'Pending Requests'}
            </span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-sans">
              {pendingCount}
            </span>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {isRtl ? 'إجازات معتمدة' : 'Approved Requests'}
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
              {approvedCount}
            </span>
          </div>

          <div className="cleariq-card p-4 cleariq-card-hover space-y-1">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              {isRtl ? 'طلبات مرفوضة' : 'Rejected Requests'}
            </span>
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-sans">
              {rejectedCount}
            </span>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isRtl ? `قيد المراجعة (${pendingCount})` : `Pending (${pendingCount})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isRtl ? `المعتمدة (${approvedCount})` : `Approved (${approvedCount})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'rejected'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isRtl ? `المرفوضة (${rejectedCount})` : `Rejected (${rejectedCount})`}
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={isRtl ? 'بحث بالاسم أو النوع...' : 'Search name or type...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Leaves Table */}
        <div className="cleariq-card overflow-hidden cleariq-card-hover">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">{isRtl ? 'الموظف' : 'Employee'}</th>
                  <th className="py-3 px-4">{isRtl ? 'نوع الطلب' : 'Request Type'}</th>
                  <th className="py-3 px-4">{isRtl ? 'تاريخ الطلب' : 'Date'}</th>
                  <th className="py-3 px-4">{isRtl ? 'الفترة / الوقت' : 'Timeframe'}</th>
                  <th className="py-3 px-4">{isRtl ? 'الرصيد المتاح' : 'Leave Allowance'}</th>
                  <th className="py-3 px-4 text-right">{isRtl ? 'الإجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-sans">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {isRtl
                        ? 'لا توجد طلبات إجازات مسجلة في هذا التبويب.'
                        : 'No leave requests found in this tab.'}
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                            {l.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-950 dark:text-white block">
                              {l.user?.full_name || 'Staff Member'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {l.user?.department?.name || 'Operations'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            l.type === 'leave'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                          }`}
                        >
                          {l.type === 'leave'
                            ? isRtl
                              ? 'إجازة اعتيادية'
                              : 'Full Day Leave'
                            : isRtl
                            ? 'إذن استئذان'
                            : 'Permission'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 font-sans">
                        {l.date}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {l.type === 'permission' ? (
                          <span className="font-sans font-bold">
                            {l.timeframe === 'morning' ? 'Morning' : 'Evening'} ({l.excuse_time || '10:00'})
                          </span>
                        ) : (
                          'Full Day'
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                        {l.user?.annual_leave_allowance ?? 21} Days Cap
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {l.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(l.id, 'active')}
                              disabled={actionId === l.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'موافقة' : 'Approve'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(l.id, 'rejected')}
                              disabled={actionId === l.id}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'رفض' : 'Reject'}</span>
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              l.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            {l.status === 'active' ? 'Approved' : 'Rejected'}
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
      </main>
    </div>
  );
}
