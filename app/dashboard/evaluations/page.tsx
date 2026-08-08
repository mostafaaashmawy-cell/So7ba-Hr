'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types/database';
import { Star, FileText, CheckCircle2, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface DBEvaluation {
  id: string;
  user_id: string;
  month: string;
  star_punctuality: number;
  star_quality: number;
  star_problem_solving: number;
  star_communication: number;
  notes: string;
  user?: { full_name: string };
  created_at?: string;
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
  const [evalList, setEvalList] = useState<DBEvaluation[]>([]);

  // Load User, Team, and existing evaluations
  const loadData = async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    // Profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setCurrentUser(profile as UserProfile);

      // Load Team Members
      const query = supabase.from('users').select('*');
      if (profile.role === 'manager') {
        query.eq('manager_id', authUser.id);
      }
      const { data: members } = await query;
      if (members) {
        setTeamMembers(members as UserProfile[]);
        if (members.length > 0) {
          setSelectedMember(members[0].id);
        }
      }

      // Load all evaluations in tenant
      const { data: evals } = await supabase
        .from('evaluations')
        .select('*, user:users(full_name)')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (evals) {
        setEvalList(evals);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch evaluation when user/month changes
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
            notes: notes.trim() || null
          })
          .eq('id', existing.id);

        if (error) throw error;
        setMsg({ text: isRtl ? 'تم تحديث التقييم بنجاح!' : 'Evaluation updated successfully!', error: false });
      } else {
        const { error } = await supabase
          .from('evaluations')
          .insert({
            tenant_id: currentUser.tenant_id,
            user_id: selectedMember,
            evaluator_id: currentUser.id,
            month: monthDate,
            star_punctuality: starsPunctuality,
            star_quality: starsQuality,
            star_problem_solving: starsProblemSolving,
            star_communication: starsCommunication,
            notes: notes.trim() || null
          });

        if (error) throw error;
        setMsg({ text: isRtl ? 'تم تقديم التقييم بنجاح!' : 'Evaluation submitted successfully!', error: false });
      }

      // Reload evaluation list
      const { data: evals } = await supabase
        .from('evaluations')
        .select('*, user:users(full_name)')
        .eq('tenant_id', currentUser.tenant_id)
        .order('created_at', { ascending: false });

      if (evals) {
        setEvalList(evals);
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
            <Star className="w-5 h-5" />
          </button>
        ))}
      </div>
    );
  };

  // Check Nudge Status
  const today = new Date();
  const dayOfMonth = today.getDate();
  const showNudge = dayOfMonth >= 22 && dayOfMonth <= 25;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-sky-400 mr-2" />
        Loading evaluation manager...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={currentUser} activeRoleView={currentUser?.role === 'super_admin' ? 'super_admin' : 'manager'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Warning nudge for managers */}
        {showNudge && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold block">Smart Monthly Evaluation Nudge</span>
              <span>We are currently between the 22nd and 25th of the month. Please complete all evaluations. Unsubmitted records will automatically fall back to 3/5 on the 25th.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit Evaluation Form */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" /> Rate Team Member Performance
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Select a month and team member to enter or adjust ratings.</p>
            </div>

            {msg && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                msg.error ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                {msg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Target Employee</label>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Evaluation Month</label>
                  <input
                    type="month"
                    required
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* 4 Ratings Criteria */}
              <div className="space-y-4 pt-4 border-t border-gray-900">
                <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl border border-gray-900/60">
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">Punctuality & Shift Adherence</span>
                    <span className="text-[10px] text-gray-500">Arrival timing, attendance completeness.</span>
                  </div>
                  {renderStars(starsPunctuality, setStarsPunctuality)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl border border-gray-900/60">
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">Quality & Correctness of Work</span>
                    <span className="text-[10px] text-gray-500">Accuracy, lack of errors, performance.</span>
                  </div>
                  {renderStars(starsQuality, setStarsQuality)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl border border-gray-900/60">
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">Problem Solving & Initiative</span>
                    <span className="text-[10px] text-gray-500">Handled issues, self-start abilities.</span>
                  </div>
                  {renderStars(starsProblemSolving, setStarsProblemSolving)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl border border-gray-900/60">
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">Communication & Team Collaboration</span>
                    <span className="text-[10px] text-gray-500">Cooperation with managers and teammates.</span>
                  </div>
                  {renderStars(starsCommunication, setStarsCommunication)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Additional Review Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide brief feedback or justification for the rating..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="gradient-btn py-2.5 rounded-xl text-xs font-bold text-white w-full flex items-center justify-center gap-1.5 shadow-lg"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Save Evaluation
              </button>
            </form>
          </div>

          {/* Evaluations History List */}
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-gray-200">Logged Evaluations</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Historical records of evaluations in your system.</p>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {evalList.map((ev) => {
                const totalStars = (ev.star_punctuality + ev.star_quality + ev.star_problem_solving + ev.star_communication) / 4;
                return (
                  <div key={ev.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-200">
                      <span>{ev.user?.full_name || 'Employee'}</span>
                      <span className="text-[10px] font-sans text-sky-400">{ev.month.substring(0, 7)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(Math.round(totalStars))}
                      <span className="text-[10px] text-gray-400 font-bold ml-1 font-sans">({totalStars.toFixed(1)}/5)</span>
                    </div>
                    {ev.notes && (
                      <p className="text-[10px] text-gray-500 italic truncate mt-1">&quot;{ev.notes}&quot;</p>
                    )}
                  </div>
                );
              })}
              {evalList.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-500">No evaluations submitted yet.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
