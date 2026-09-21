'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Check,
  X,
  User,
  MessageSquare,
  Search,
} from 'lucide-react';
import { LeavePermissionRecord, UserProfile } from '@/lib/types/database';
import { formatDate } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';

interface TeamRequestsApprovalCenterProps {
  initialRequests: LeavePermissionRecord[];
  teamMembers: UserProfile[];
  currentUserId: string;
  currentUserRole: 'manager' | 'super_admin';
  tenantId?: string | null;
}

export default function TeamRequestsApprovalCenter({
  initialRequests,
  teamMembers,
  currentUserId,
  currentUserRole,
  tenantId,
}: TeamRequestsApprovalCenterProps) {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [requests, setRequests] = useState<LeavePermissionRecord[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);

  // Map user profiles by id for quick lookup
  const membersMap = new Map<string, UserProfile>();
  teamMembers.forEach((m) => membersMap.set(m.id, m));

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'active' || r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const filteredRequests = requests.filter((r) => {
    // Tab filter
    if (activeTab === 'pending' && r.status !== 'pending') return false;
    if (activeTab === 'approved' && r.status !== 'active' && r.status !== 'approved') return false;
    if (activeTab === 'rejected' && r.status !== 'rejected') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const user = membersMap.get(r.user_id);
      const nameMatch = user?.full_name?.toLowerCase().includes(q);
      const typeMatch = r.type?.toLowerCase().includes(q);
      const dateMatch = r.date?.includes(q);
      if (!nameMatch && !typeMatch && !dateMatch) return false;
    }

    return true;
  });

  const handleApprove = async (request: LeavePermissionRecord) => {
    setProcessingId(request.id);
    setFeedback(null);

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('leaves_permissions')
        .update({
          status: 'active',
          reviewed_by: currentUserId,
          reviewed_at: now,
        })
        .eq('id', request.id);

      if (error) throw error;

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? { ...r, status: 'active', reviewed_by: currentUserId, reviewed_at: now }
            : r
        )
      );

      // Send notification to requester
      if (tenantId) {
        await supabase.from('notifications').insert({
          tenant_id: tenantId,
          user_id: request.user_id,
          title: isRtl ? 'تمت الموافقة على طلبك' : 'Leave/Permission Request Approved',
          message: isRtl
            ? `تمت الموافقة على طلب ${request.type === 'leave' ? 'الإجازة' : 'إذن المغادرة'} لتاريخ ${request.date}.`
            : `Your ${request.type} request for ${request.date} has been approved.`,
          type: 'success',
          is_read: false,
        });
      }

      setFeedback({
        text: isRtl ? 'تمت الموافقة على الطلب بنجاح وتم إشعار الموظف.' : 'Request approved successfully and employee notified.',
        error: false,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Action failed';
      setFeedback({ text: errMsg, error: true });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: LeavePermissionRecord) => {
    setProcessingId(request.id);
    setFeedback(null);

    try {
      const now = new Date().toISOString();
      const reason = rejectionReason.trim() || null;

      const { error } = await supabase
        .from('leaves_permissions')
        .update({
          status: 'rejected',
          reviewed_by: currentUserId,
          reviewed_at: now,
          rejection_reason: reason,
        })
        .eq('id', request.id);

      if (error) throw error;

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? {
                ...r,
                status: 'rejected',
                reviewed_by: currentUserId,
                reviewed_at: now,
                rejection_reason: reason,
              }
            : r
        )
      );

      // Send notification to requester
      if (tenantId) {
        await supabase.from('notifications').insert({
          tenant_id: tenantId,
          user_id: request.user_id,
          title: isRtl ? 'تم رفض طلبك' : 'Leave/Permission Request Rejected',
          message: isRtl
            ? `تم رفض طلب ${request.type === 'leave' ? 'الإجازة' : 'إذن المغادرة'} لتاريخ ${request.date}.${
                reason ? ` سبب الرفض: ${reason}` : ''
              }`
            : `Your ${request.type} request for ${request.date} was rejected.${
                reason ? ` Reason: ${reason}` : ''
              }`,
          type: 'error',
          is_read: false,
        });
      }

      setFeedback({
        text: isRtl ? 'تم رفض الطلب وتم إشعار الموظف.' : 'Request rejected and employee notified.',
        error: false,
      });
      setRejectionTargetId(null);
      setRejectionReason('');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Action failed';
      setFeedback({ text: errMsg, error: true });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white">
                {isRtl ? 'مركز اعتمادات طلبات الفريق' : 'Team Requests Approval Center'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl
                  ? 'مراجعة واعتماد أو رفض طلبات الإجازات الاعتيادية وأذونات المغادرة لفريقك'
                  : 'Review, approve, or reject leave and permission requests for your team members'}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isRtl ? 'بحث باسم الموظف أو التاريخ...' : 'Search employee or date...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>{isRtl ? 'قيد الانتظار' : 'Pending'}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>{isRtl ? 'المعتمدة' : 'Approved'}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
            }`}
          >
            {approvedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rejected')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>{isRtl ? 'المرفوضة' : 'Rejected'}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
            }`}
          >
            {rejectedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>{isRtl ? 'الكل' : 'All Requests'}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            {requests.length}
          </span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.error
              ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
          }`}
        >
          {feedback.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span className="font-bold">{feedback.text}</span>
        </div>
      )}

      {/* Requests Table / Cards */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
          <p className="font-bold">
            {isRtl ? 'لا توجد طلبات مطابقة للعرض حالياً.' : 'No matching requests found.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">{isRtl ? 'الموظف' : 'Employee'}</th>
                <th className="py-3 px-4">{isRtl ? 'نوع الطلب' : 'Type'}</th>
                <th className="py-3 px-4">{isRtl ? 'تاريخ الطلب' : 'Target Date'}</th>
                <th className="py-3 px-4">{isRtl ? 'التفاصيل / التوقيت' : 'Timing / Details'}</th>
                <th className="py-3 px-4">{isRtl ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-sans">
              {filteredRequests.map((req) => {
                const user = membersMap.get(req.user_id) || req.user;
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'active' || req.status === 'approved';
                const isRejected = req.status === 'rejected';
                const isProcessing = processingId === req.id;
                const isRejectingThis = rejectionTargetId === req.id;

                return (
                  <React.Fragment key={req.id}>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Employee info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs">
                            {user?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-950 dark:text-white block">
                              {user?.full_name || 'Unknown Employee'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                              {user?.job_title || user?.role || 'Employee'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Request Type */}
                      <td className="py-3.5 px-4">
                        {req.type === 'leave' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                            <Calendar className="w-3 h-3" />
                            {isRtl ? 'إجازة اعتيادية' : 'Annual Leave'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                            <Clock className="w-3 h-3" />
                            {isRtl ? 'إذن مغادرة' : 'Permission'}
                          </span>
                        )}
                      </td>

                      {/* Target Date */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {formatDate(req.date)}
                      </td>

                      {/* Timing Details */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                        {req.type === 'permission' ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {req.timeframe === 'morning'
                                ? isRtl
                                  ? 'إذن صباحي (تأخير حضور)'
                                  : 'Morning (Late Arrival)'
                                : isRtl
                                ? 'إذن مسائي (انصراف مبكر)'
                                : 'Evening (Early Leave)'}
                            </span>
                            {req.excuse_time && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                {req.excuse_time}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            {isRtl ? 'يوم كامل' : 'Full Day'}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                          }`}
                        >
                          {isApproved && <Check className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isRejected && <X className="w-3 h-3" />}
                          {isApproved
                            ? isRtl ? 'معتمد' : 'Approved'
                            : isPending
                            ? isRtl ? 'قيد المراجعة' : 'Pending'
                            : isRtl ? 'مرفوض' : 'Rejected'}
                        </span>
                        {req.rejection_reason && (
                          <span className="block text-[10px] text-rose-500 dark:text-rose-400 mt-1 max-w-[180px] truncate" title={req.rejection_reason}>
                            {req.rejection_reason}
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleApprove(req)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-all shadow-sm disabled:opacity-50"
                                title="Approve Request"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'موافقة' : 'Approve'}</span>
                              </button>

                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => {
                                  if (isRejectingThis) {
                                    setRejectionTargetId(null);
                                    setRejectionReason('');
                                  } else {
                                    setRejectionTargetId(req.id);
                                    setRejectionReason('');
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                                title="Reject Request"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'رفض' : 'Reject'}</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold">
                              {req.reviewed_at ? formatDate(req.reviewed_at) : '—'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Inline Rejection Reason Form */}
                    {isRejectingThis && (
                      <tr className="bg-rose-50/50 dark:bg-rose-950/20">
                        <td colSpan={6} className="p-4">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-[11px] font-bold text-rose-800 dark:text-rose-300 mb-1">
                                {isRtl ? 'سبب الرفض (اختياري، يظهر للموظف في الإشعار):' : 'Rejection Reason (Optional, shown in notification):'}
                              </label>
                              <input
                                type="text"
                                placeholder={isRtl ? 'أدخل سبب الرفض مثل: ضغط العمل، تعارض مع موعد مهم...' : 'e.g., Heavy workload, conflicting shift...'}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                              />
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-4">
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleReject(req)}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                              >
                                {isRtl ? 'تأكيد الرفض' : 'Confirm Rejection'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectionTargetId(null);
                                  setRejectionReason('');
                                }}
                                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 transition-all cursor-pointer"
                              >
                                {isRtl ? 'إلغاء' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
