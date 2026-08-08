'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types/database';
import { Target, Plus, CheckCircle2, RefreshCw, AlertCircle, Trash, ChevronRight, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface EmployeeTarget {
  id: string;
  user_id: string;
  unit: string;
  target_value: number;
  target_type: 'daily' | 'monthly';
  start_date: string;
  end_date: string;
  user?: { full_name: string };
  actual_value?: number; // Calculated on load
}

export default function TargetsTasksPage() {
  const { t, isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [targets, setTargets] = useState<EmployeeTarget[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);

  // Form State
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('tasks');
  const [targetVal, setTargetVal] = useState<number | ''>('');
  const [targetType, setTargetType] = useState<'daily' | 'monthly'>('monthly');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0] // Last day of current month
  );

  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Load targets and team members
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

      // Load Team members
      let teamQuery = supabase.from('users').select('*');
      if (profile.role === 'manager') {
        teamQuery = teamQuery.eq('manager_id', authUser.id);
      }
      const { data: team } = await teamQuery;
      if (team) {
        setTeamMembers(team as UserProfile[]);
        if (team.length > 0) {
          setSelectedEmployee(team[0].id);
        }
      }

      // Fetch targets in tenant
      // If manager: only retrieve assigned team targets
      let targetQuery = supabase.from('employee_targets').select('*, user:users(full_name)');
      if (profile.role === 'manager') {
        const teamIds = team ? team.map((m) => m.id) : [];
        targetQuery = targetQuery.in('user_id', teamIds);
      } else if (profile.role === 'employee') {
        targetQuery = targetQuery.eq('user_id', authUser.id);
      }

      const { data: targetList } = await targetQuery.order('start_date', { ascending: false });

      if (targetList) {
        const parsedTargets = targetList as EmployeeTarget[];

        // Dynamically compute the ACTUAL results from kpi_entries for each target duration
        for (const target of parsedTargets) {
          const { data: achievements } = await supabase
            .from('kpi_entries')
            .select('amount')
            .eq('user_id', target.user_id)
            .eq('unit', target.unit)
            .gte('date', target.start_date)
            .lte('date', target.end_date);

          const totalAchieved = achievements ? achievements.reduce((sum, current) => sum + Number(current.amount), 0) : 0;
          target.actual_value = totalAchieved;
        }

        setTargets(parsedTargets);
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
    if (!currentUser || !targetVal || !selectedEmployee) return;

    setSubmitting(true);
    setMsg(null);

    try {
      const { error } = await supabase
        .from('employee_targets')
        .insert({
          tenant_id: currentUser.tenant_id,
          user_id: selectedEmployee,
          unit: targetUnit.trim(),
          target_value: Number(targetVal),
          target_type: targetType,
          start_date: startDate,
          end_date: endDate,
          created_by: currentUser.id
        });

      if (error) throw error;

      setMsg({ text: isRtl ? 'تم تعيين الهدف بنجاح للموظف!' : 'Target successfully assigned to employee!', error: false });
      setTargetVal('');
      
      // Reload targets
      loadData();
    } catch (err: any) {
      setMsg({ text: err.message || 'Submission failed', error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? 'هل تريد حذف هذا الهدف؟' : 'Delete this target?')) return;
    setActionId(id);

    try {
      const { error } = await supabase
        .from('employee_targets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTargets(targets.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    } finally {
      setActionId(null);
    }
  };

  const isManagement = currentUser?.role === 'manager' || currentUser?.role === 'super_admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-sky-400 mr-2" />
        Loading targets manager...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={currentUser} activeRoleView={currentUser?.role === 'super_admin' ? 'super_admin' : currentUser?.role === 'manager' ? 'manager' : 'employee'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Target Assigner Form (Managers / Admins only) */}
          {isManagement ? (
            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-sky-400" /> Assign Numeric Target
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Assign daily/monthly operational targets to your team.</p>
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
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Target Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Target Type</label>
                    <select
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value as 'daily' | 'monthly')}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none"
                    >
                      <option value="daily">Daily Target</option>
                      <option value="monthly">Monthly Target</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">KPI Metric Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. calls"
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Target Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 150"
                    value={targetVal}
                    onChange={(e) => setTargetVal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 font-sans">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !targetVal}
                  className="gradient-btn py-2.5 rounded-xl text-xs font-bold text-white w-full flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Create Target
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-gray-200">Personal Goals Feed</h3>
              <p className="text-xs text-gray-500">View and track your targets assigned by your supervisor.</p>
            </div>
          )}

          {/* Targets Progression & Actual Comparison List */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-gray-200">Active Goals & Achievements</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Real-time validation of targets vs actual production logged in KPIs.</p>
            </div>

            <div className="space-y-4">
              {targets.map((target) => {
                const actual = target.actual_value || 0;
                const pct = Math.min(100, Math.round((actual / target.target_value) * 100));

                return (
                  <div key={target.id} className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl space-y-3 font-sans">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase tracking-wider mb-1.5">
                          {target.target_type}
                        </span>
                        <h4 className="text-xs font-bold text-white">
                          {target.user?.full_name || 'Team Member'}
                        </h4>
                        <span className="text-[10px] text-gray-500 font-sans block mt-0.5">
                          Period: {target.start_date} to {target.end_date}
                        </span>
                      </div>
                      
                      {isManagement && (
                        <button
                          onClick={() => handleDelete(target.id)}
                          disabled={actionId === target.id}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/20 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold font-sans">
                        <span className="text-gray-400">
                          Achieved: <span className="text-sky-400">{actual}</span> / {target.target_value} {target.unit}
                        </span>
                        <span className={pct >= 100 ? 'text-emerald-400' : 'text-sky-300'}>{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-900">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-sky-500 to-indigo-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {targets.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-500">
                  No targets assigned or scheduled.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
