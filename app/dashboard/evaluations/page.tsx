'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types/database';
import {
  Star,
  FileText,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  Search,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface EvaluationItem {
  id: string;
  tenant_id: string;
  user_id: string;
  evaluated_by?: string | null;
  month: string;
  star_punctuality: number;
  star_quality: number;
  star_problem_solving: number;
  star_communication: number;
  notes?: string | null;
  created_at?: string;
  user?: { full_name: string };
  reviewer?: { full_name: string };
}

export default function EvaluationsPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');

  // Date Picker Month
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // 'YYYY-MM'
  );

  // Form State
  const [starsPunctuality, setStarsPunctuality] = useState(3);
  const [starsQuality, setStarsQuality] = useState(3);
  const [starsProblemSolving, setStarsProblemSolving] = useState(3);
  const [starsCommunication, setStarsCommunication] = useState(3);
  const [notes, setNotes] = useState('');

  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [evalList, setEvalList] = useState<EvaluationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');

  // Load User, Team Members based on Hierarchy, and Evaluations Logs
  const loadData = async () => {
    setLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    // 1. Profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setCurrentUser(profile as UserProfile);

      // 2. Hierarchy Permissions:
      // - Employee: Read-only access to own evaluations. Cannot submit.
      // - Manager: Can evaluate & view direct subordinates only.
      // - Super Admin: Can evaluate & view all employees.
      if (profile.role === 'super_admin') {
        const { data: allMembers } = await supabase
          .from('users')
          .select('*')
          .eq('tenant_id', profile.tenant_id);
        const membersList = (allMembers as UserProfile[]) || [];
        setTeamMembers(membersList);
        if (membersList.length > 0) setSelectedMember(membersList[0].id);

        const { data: evals } = await supabase
          .from('evaluations')
          .select('*, user:users!user_id(full_name), reviewer:users!evaluated_by(full_name)')
          .eq('tenant_id', profile.tenant_id)
          .order('month', { ascending: false });
        if (evals) setEvalList(evals as unknown as EvaluationItem[]);
      } else if (profile.role === 'manager') {
        const { data: subMembers } = await supabase
          .from('users')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .eq('manager_id', authUser.id);
        const membersList = (subMembers as UserProfile[]) || [];
        setTeamMembers(membersList);
        if (membersList.length > 0) setSelectedMember(membersList[0].id);

        const subIds = membersList.map((m) => m.id);
        if (subIds.length > 0) {
          const { data: evals } = await supabase
            .from('evaluations')
            .select('*, user:users!user_id(full_name), reviewer:users!evaluated_by(full_name)')
            .eq('tenant_id', profile.tenant_id)
            .in('user_id', subIds)
            .order('month', { ascending: false });
          if (evals) setEvalList(evals as unknown as EvaluationItem[]);
        } else {
          setEvalList([]);
        }
      } else {
        // Employee role: strictly read-only for own evaluations
        setTeamMembers([]);
        const { data: evals } = await supabase
          .from('evaluations')
          .select('*, user:users!user_id(full_name), reviewer:users!evaluated_by(full_name)')
          .eq('tenant_id', profile.tenant_id)
          .eq('user_id', authUser.id)
          .order('month', { ascending: false });
        if (evals) setEvalList(evals as unknown as EvaluationItem[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch evaluation when user/month changes to populate form
  useEffect(() => {
    if (!selectedMember || !selectedMonth) return;

    const fetchSingleEval = async () => {
      const monthDate = `${selectedMonth}-01`;
      const { data } = await supabase
        .from('evaluations')
        .select('*')
        .eq('user_id', selectedMember)
        .eq('month', monthDate)
        .maybeSingle();

      if (data) {
        setStarsPunctuality(data.star_punctuality);
        setStarsQuality(data.star_quality);
        setStarsProblemSolving(data.star_problem_solving);
        setStarsCommunication(data.star_communication);
        setNotes(data.notes || '');
      } else {
        setStarsPunctuality(3);
        setStarsQuality(3);
        setStarsProblemSolving(3);
        setStarsCommunication(3);
        setNotes('');
      }
    };
    fetchSingleEval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMember, selectedMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedMember || !selectedMonth) return;

    setSubmitting(true);
    setMsg(null);

    const monthDate = `${selectedMonth}-01`;

    try {
      const { data: existing } = await supabase
        .from('evaluations')
        .select('id')
        .eq('user_id', selectedMember)
        .eq('month', monthDate)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('evaluations')
          .update({
            star_punctuality: starsPunctuality,
            star_quality: starsQuality,
            star_problem_solving: starsProblemSolving,
            star_communication: starsCommunication,
            notes: notes.trim() || null,
            evaluated_by: currentUser.id,
          })
          .eq('id', existing.id);

        if (error) throw error;
        setMsg({
          text: isRtl ? 'تم تحديث تقييم الموظف بنجاح!' : 'Employee evaluation updated successfully!',
          error: false,
        });
      } else {
        const { error } = await supabase.from('evaluations').insert({
          tenant_id: currentUser.tenant_id,
          user_id: selectedMember,
          month: monthDate,
          star_punctuality: starsPunctuality,
          star_quality: starsQuality,
          star_problem_solving: starsProblemSolving,
          star_communication: starsCommunication,
          notes: notes.trim() || null,
          evaluated_by: currentUser.id,
        });

        if (error) throw error;
        setMsg({
          text: isRtl ? 'تم حفظ التقييم بنجاح!' : 'Evaluation saved successfully!',
          error: false,
        });
      }

      loadData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Evaluation submission failed';
      setMsg({ text: errorMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const currentDay = new Date().getDate();
  const showNudge = currentDay >= 22 && currentDay <= 25 && currentUser?.role !== 'employee';
  const isPrivileged = currentUser?.role === 'super_admin' || currentUser?.role === 'manager';

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-125 transition-transform cursor-pointer"
          >
            <Star
              className={`w-4 h-4 ${
                star <= value
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 ml-1 font-sans">
          {value}/5
        </span>
      </div>
    </div>
  );

  const calculateScore = (e: EvaluationItem) => {
    const sum =
      e.star_punctuality +
      e.star_quality +
      e.star_problem_solving +
      e.star_communication;
    return (sum / 4).toFixed(1);
  };

  const filteredEvals = evalList.filter((item) => {
    const matchName = item.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery && !matchName) return false;
    if (filterMonth !== 'all' && !item.month.startsWith(filterMonth)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg) flex items-center justify-center text-slate-400 text-xs font-bold">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
        Loading evaluations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans">
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
        {/* Warning nudge for managers */}
        {showNudge && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <span className="font-extrabold block">
                {isRtl ? 'تذكير التقييم الشهري' : 'Monthly Evaluation Review Period'}
              </span>
              <span className="font-medium">
                {isRtl
                  ? 'يرجى إتمام تقييمات أعضاء الفريق لشهر الاستحقاق قبل إغلاق مسير الرواتب.'
                  : 'Please submit evaluation reviews for all team members before the 25th of this month.'}
              </span>
            </div>
          </div>
        )}

        {/* Top Header & Role Permissions Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              {isRtl ? 'سجل وإدارة تقييمات الأداء' : 'Performance Evaluation & Review Engine'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentUser?.role === 'super_admin'
                ? isRtl
                  ? 'صلاحية المشرف العام: مراجعة وتقييم كافة موظفي الشركة'
                  : 'Super Admin Access: Review and evaluate all employees across the company'
                : currentUser?.role === 'manager'
                ? isRtl
                  ? 'صلاحية المدير المباشر: مراجعة وتقييم أعضاء فريقك المباشر فقط'
                  : 'Manager Access: Review and evaluate your direct team members only'
                : isRtl
                ? 'عرض سجل تقييمات أدائي الشخصية'
                : 'My Personal Performance Review History'}
            </p>
          </div>

          {isPrivileged && (
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1.5 font-sans">
                <UserCheck className="w-3.5 h-3.5" />
                {teamMembers.length}{' '}
                {isRtl ? 'موظف متاح للتقييم' : 'subordinates assigned'}
              </span>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 ${isPrivileged ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
          {/* Rate Performance Form — Only for Super Admin & Manager */}
          {isPrivileged && (
            <div className="lg:col-span-1 cleariq-card p-6 cleariq-card-hover space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isRtl ? 'إدخال تقييم موظف' : 'Submit Evaluation'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl
                    ? 'حدد الموظف والشهر لاحتساب درجات التقييم'
                    : 'Select an employee and month to log ratings'}
                </p>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                    {isRtl ? 'الموظف المستهدف' : 'Target Employee'}
                  </label>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.job_title || 'Employee'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                    {isRtl ? 'شهر التقييم' : 'Evaluation Month'}
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                  <StarRating
                    label={isRtl ? 'الالتزام والانضباط' : 'Punctuality & Discipline'}
                    value={starsPunctuality}
                    onChange={setStarsPunctuality}
                  />
                  <StarRating
                    label={isRtl ? 'جودة ودقة العمل' : 'Quality of Work'}
                    value={starsQuality}
                    onChange={setStarsQuality}
                  />
                  <StarRating
                    label={isRtl ? 'حل المشكلات والمبادرة' : 'Problem Solving'}
                    value={starsProblemSolving}
                    onChange={setStarsProblemSolving}
                  />
                  <StarRating
                    label={isRtl ? 'التواصل والتعاون' : 'Communication & Teamwork'}
                    value={starsCommunication}
                    onChange={setStarsCommunication}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                    {isRtl ? 'ملاحظات وتوجيهات المدير' : 'Manager Notes & Recommendations'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      isRtl
                        ? 'أضف نقاط القوة أو مجالات التحسين...'
                        : 'Highlight achievements and improvement areas...'
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || teamMembers.length === 0}
                  className="w-full py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isRtl ? 'حفظ واعتماد التقييم' : 'Save & Certify Evaluation'}
                </button>
              </form>
            </div>
          )}

          {/* Evaluations History Logs */}
          <div className={`${isPrivileged ? 'lg:col-span-2' : 'lg:col-span-1'} cleariq-card p-6 cleariq-card-hover space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  {isPrivileged
                    ? isRtl
                      ? 'سجل التقييمات المعتمدة'
                      : 'Certified Reviews History'
                    : isRtl
                    ? 'سجل تقييماتي الشهرية'
                    : 'My Certified Reviews'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl ? 'عرض نتائج التقييم الشهرية وملاحظات الإدارة' : 'Monthly evaluation scores and performance breakdowns'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isPrivileged && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder={isRtl ? 'بحث بالاسم...' : 'Search employee...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none w-36 sm:w-44"
                    />
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="month"
                    value={filterMonth === 'all' ? '' : filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value || 'all')}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-950 dark:text-white focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-200 uppercase text-[10px] tracking-wider font-extrabold">
                  <tr>
                    <th className="px-4 py-3.5">{isRtl ? 'الموظف' : 'Employee'}</th>
                    <th className="px-4 py-3.5">{isRtl ? 'الشهر' : 'Month'}</th>
                    <th className="px-4 py-3.5">{isRtl ? 'المتوسط' : 'Avg Score'}</th>
                    <th className="px-4 py-3.5">{isRtl ? 'الانضباط' : 'Punctuality'}</th>
                    <th className="px-4 py-3.5">{isRtl ? 'الجودة' : 'Quality'}</th>
                    <th className="px-4 py-3.5">{isRtl ? 'المشاكل' : 'Solving'}</th>
                    <th className="px-4 py-3.5">{isRtl ? 'التواصل' : 'Comm'}</th>
                    <th className="px-4 py-3.5">{isRtl ? 'الملاحظات' : 'Notes'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredEvals.map((e) => {
                    const avg = calculateScore(e);
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-950 dark:text-white">
                          {e.user?.full_name || 'Staff Member'}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-200 font-sans">
                          {e.month.substring(0, 7)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold font-sans ${
                              Number(avg) >= 4.0
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : Number(avg) >= 3.0
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}
                          >
                            ⭐ {avg}/5
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-300 font-sans">{e.star_punctuality}★</td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-300 font-sans">{e.star_quality}★</td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-300 font-sans">{e.star_problem_solving}★</td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-300 font-sans">{e.star_communication}★</td>
                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                          {e.notes ? (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                              {e.notes}
                            </span>
                          ) : (
                            '--'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEvals.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400 dark:text-slate-500">
                        {isRtl ? 'لا توجد تقييمات مسجلة لهذا الشهر.' : 'No evaluations logged for this selection.'}
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
