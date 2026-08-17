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
      // Managers can only evaluate and view direct subordinates
      // Super Admins can evaluate and view anyone in the tenant
      const teamQuery = supabase
        .from('users')
        .select('*')
        .eq('tenant_id', profile.tenant_id);

      if (profile.role === 'manager') {
        teamQuery.eq('manager_id', authUser.id);
      }

      const { data: members } = await teamQuery;
      const loadedMembers = (members as UserProfile[]) || [];
      setTeamMembers(loadedMembers);

      if (loadedMembers.length > 0) {
        setSelectedMember(loadedMembers[0].id);
      }

      // 3. Evaluations Log query
      const evalQuery = supabase
        .from('evaluations')
        .select('*, user:users!user_id(full_name), reviewer:users!evaluated_by(full_name)')
        .eq('tenant_id', profile.tenant_id)
        .order('month', { ascending: false });

      if (profile.role === 'manager') {
        const subIds = loadedMembers.map((m) => m.id);
        if (subIds.length > 0) {
          evalQuery.in('user_id', subIds);
        } else {
          evalQuery.eq('user_id', '00000000-0000-0000-0000-000000000000');
        }
      }

      const { data: evals } = await evalQuery;
      if (evals) {
        setEvalList(evals as unknown as EvaluationItem[]);
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
        // Reset to default
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
      // Upsert evaluation
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

      // Reload evaluation list
      const evalQuery = supabase
        .from('evaluations')
        .select('*, user:users!user_id(full_name), reviewer:users!evaluated_by(full_name)')
        .eq('tenant_id', currentUser.tenant_id)
        .order('month', { ascending: false });

      if (currentUser.role === 'manager') {
        const subIds = teamMembers.map((m) => m.id);
        if (subIds.length > 0) {
          evalQuery.in('user_id', subIds);
        }
      }

      const { data: evals } = await evalQuery;
      if (evals) {
        setEvalList(evals as unknown as EvaluationItem[]);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Submission failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, setRating?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!setRating}
            onClick={() => setRating && setRating(star)}
            className={`transition-all ${
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'
            } ${setRating ? 'hover:scale-110 cursor-pointer' : ''}`}
          >
            <Star className="w-4 h-4" />
          </button>
        ))}
      </div>
    );
  };

  const today = new Date();
  const dayOfMonth = today.getDate();
  const showNudge = dayOfMonth >= 22 && dayOfMonth <= 25;

  // Filtered Evaluation List
  const filteredEvals = evalList.filter((item) => {
    const matchName = item.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery && !matchName) return false;
    if (filterMonth !== 'all' && !item.month.startsWith(filterMonth)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-sky-400 mr-2" />
        Loading HumAi evaluation manager...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar
        user={currentUser}
        activeRoleView={currentUser?.role === 'super_admin' ? 'super_admin' : 'manager'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Warning nudge for managers */}
        {showNudge && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold block">
                {isRtl ? 'تذكير التقييم الشهري للذكاء الاصطناعي' : 'Smart Monthly Evaluation Nudge'}
              </span>
              <span>
                {isRtl
                  ? 'نحن الآن في الفترة بين يوم 22 و25 من الشهر. يرجى إتمام تقييمات الفريق. التقييمات التي لم تسجل سيتم اعتماد 3/5 نجوم افتراضياً في حساب الرواتب.'
                  : 'We are currently between the 22nd and 25th of the month. Please complete all evaluations. Unsubmitted records will automatically fall back to 3/5 on the 25th.'}
              </span>
            </div>
          </div>
        )}

        {/* Top Header & Role Permissions Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              {isRtl ? 'سجل وإدارة تقييمات الأداء' : 'Performance Evaluation & Review Engine'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {currentUser?.role === 'super_admin'
                ? isRtl
                  ? 'صلاحية المشرف العام: مراجعة وتقييم كافة موظفي الشركة'
                  : 'Super Admin Access: Review and evaluate all employees across the company'
                : isRtl
                ? 'صلاحية المدير المباشر: مراجعة وتقييم أعضاء فريقك المباشر فقط'
                : 'Manager Access: Review and evaluate your direct subordinates only'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              {teamMembers.length}{' '}
              {isRtl ? 'موظف متاح للتقييم' : 'subordinates assigned'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rate Performance Form */}
          <div className="lg:col-span-1 glass-card p-6 rounded-3xl border border-gray-800 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                {isRtl ? 'إدخال تقييم موظف' : 'Submit Evaluation'}
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isRtl
                  ? 'حدد الموظف والشهر لاحتساب درجات التقييم'
                  : 'Select an employee and month to log ratings'}
              </p>
            </div>

            {msg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  msg.error
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {msg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {isRtl ? 'الموظف المستهدف' : 'Target Employee'}
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-sky-500"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.job_title || 'Employee'})
                    </option>
                  ))}
                  {teamMembers.length === 0 && (
                    <option value="">No subordinates assigned</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {isRtl ? 'شهر التقييم' : 'Evaluation Month'}
                </label>
                <input
                  type="month"
                  required
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none font-sans"
                />
              </div>

              {/* 4 Ratings Criteria */}
              <div className="space-y-3 pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between p-3 bg-gray-950/70 rounded-xl border border-gray-800">
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">
                      {isRtl ? 'الانضباط والالتزام بالمواعيد' : 'Punctuality & Shift Adherence'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isRtl ? 'حضور الوردية والانضباط' : 'Arrival timing & attendance'}
                    </span>
                  </div>
                  {renderStars(starsPunctuality, setStarsPunctuality)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-950/70 rounded-xl border border-gray-800">
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">
                      {isRtl ? 'جودة ودقة تنفيذ المهام' : 'Quality of Work'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isRtl ? 'دقة الإنجاز وعدم وجود أخطاء' : 'Accuracy and execution'}
                    </span>
                  </div>
                  {renderStars(starsQuality, setStarsQuality)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-950/70 rounded-xl border border-gray-800">
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">
                      {isRtl ? 'حل المشكلات والمبادرة' : 'Problem Solving & Initiative'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isRtl ? 'سرعة التعامل مع التحديات' : 'Self-starter abilities'}
                    </span>
                  </div>
                  {renderStars(starsProblemSolving, setStarsProblemSolving)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-950/70 rounded-xl border border-gray-800">
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">
                      {isRtl ? 'التواصل والتعاون مع الفريق' : 'Communication & Collaboration'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isRtl ? 'التعاون مع الإدارة والزملاء' : 'Teamwork and responsiveness'}
                    </span>
                  </div>
                  {renderStars(starsCommunication, setStarsCommunication)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {isRtl ? 'ملاحظات وتوجيهات المدير (اختياري)' : 'Manager Notes / Feedback'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isRtl
                      ? 'أضف ملاحظاتك وتوجيهاتك للموظف...'
                      : 'Provide constructive feedback or rationale...'
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || teamMembers.length === 0}
                className="gradient-btn py-2.5 rounded-xl text-xs font-bold text-white w-full flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-40"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                {isRtl ? 'حفظ واعتماد التقييم' : 'Save & Authorize Evaluation'}
              </button>
            </form>
          </div>

          {/* Evaluations History Logs Table */}
          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-gray-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-gray-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  {isRtl ? 'سجل تقييمات الأداء التاريخي' : 'Evaluation History Logs'}
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isRtl
                    ? 'سجل مفصل بالدرجات والملاحظات والمدير المقيّم'
                    : 'Detailed record of scores, criteria, comments, and reviewer names'}
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder={isRtl ? 'بحث بالاسم...' : 'Search employee...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-950 border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-100 focus:outline-none w-36 sm:w-48"
                  />
                </div>

                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none"
                >
                  <option value="all">{isRtl ? 'كل الشهور' : 'All Months'}</option>
                  {Array.from(new Set(evalList.map((e) => e.month.substring(0, 7)))).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto border border-gray-800/80 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-950/80 text-gray-400 font-semibold border-b border-gray-800 text-[11px]">
                  <tr>
                    <th className="p-3.5">{isRtl ? 'الموظف' : 'Employee'}</th>
                    <th className="p-3.5">{isRtl ? 'المُقيِّم' : 'Reviewer'}</th>
                    <th className="p-3.5">{isRtl ? 'الشهر' : 'Month'}</th>
                    <th className="p-3.5 text-center">{isRtl ? 'التفاصيل' : 'Scores'}</th>
                    <th className="p-3.5 text-center">{isRtl ? 'التقييم الإجمالي' : 'Overall'}</th>
                    <th className="p-3.5">{isRtl ? 'ملاحظات' : 'Feedback'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredEvals.map((item) => {
                    const avg =
                      (item.star_punctuality +
                        item.star_quality +
                        item.star_problem_solving +
                        item.star_communication) /
                      4;
                    return (
                      <tr key={item.id} className="hover:bg-gray-900/40 transition-colors">
                        <td className="p-3.5 font-bold text-gray-100">
                          {item.user?.full_name || 'Employee'}
                        </td>
                        <td className="p-3.5 text-gray-400">
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-300">
                            {item.reviewer?.full_name || 'Supervisor'}
                          </span>
                        </td>
                        <td className="p-3.5 font-sans text-sky-400 font-bold">
                          {item.month.substring(0, 7)}
                        </td>
                        <td className="p-3.5 text-center font-sans text-[10px] text-gray-400">
                          <div className="inline-grid grid-cols-2 gap-x-2 gap-y-0.5 text-left">
                            <span>Punctuality: {item.star_punctuality}★</span>
                            <span>Quality: {item.star_quality}★</span>
                            <span>Problem: {item.star_problem_solving}★</span>
                            <span>Comm: {item.star_communication}★</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span className="font-bold text-amber-400 font-sans">
                              {avg.toFixed(1)}
                            </span>
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          </div>
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-[11px] text-gray-400 italic">
                          {item.notes ? (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 shrink-0 text-gray-500" />
                              &quot;{item.notes}&quot;
                            </span>
                          ) : (
                            <span className="text-gray-600 font-normal">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEvals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 text-xs">
                        {isRtl
                          ? 'لا توجد تقييمات مسجلة تطابق البحث'
                          : 'No matching evaluation records found.'}
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
