'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types/database';
import {
  Target,
  Plus,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Trash,
  BarChart2,
  Calendar,
  Layers,
} from 'lucide-react';
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
  actual_value?: number;
}

interface KpiUnit {
  id: string;
  name: string;
}

export default function TargetsTasksPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [targets, setTargets] = useState<EmployeeTarget[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [kpiUnitsList, setKpiUnitsList] = useState<KpiUnit[]>([]);

  // Form State
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('tasks');
  const [targetVal, setTargetVal] = useState<number | ''>('');
  const [targetType, setTargetType] = useState<'daily' | 'monthly'>('monthly');

  // Single Day Date vs Range
  const [singleDayDate, setSingleDayDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]
  );

  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Load KPI units, team members, and targets
  const loadData = async () => {
    setLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    // 1. Fetch KPI units from database
    const { data: units } = await supabase.from('kpi_units').select('*').order('name');
    if (units && units.length > 0) {
      setKpiUnitsList(units as KpiUnit[]);
      setTargetUnit(units[0].name);
    } else {
      setKpiUnitsList([
        { id: '1', name: 'tasks' },
        { id: '2', name: 'calls' },
        { id: '3', name: 'deals' },
        { id: '4', name: 'visits' },
        { id: '5', name: 'hours' },
      ]);
    }

    // 2. Profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setCurrentUser(profile as UserProfile);

      // 3. Hierarchy: Manager strictly gets direct subordinates
      let teamQuery = supabase.from('users').select('*');
      if (profile.role === 'manager') {
        teamQuery = teamQuery.eq('manager_id', authUser.id);
      } else if (profile.role === 'super_admin') {
        teamQuery = teamQuery.eq('tenant_id', profile.tenant_id);
      } else {
        teamQuery = teamQuery.eq('id', authUser.id);
      }

      const { data: team } = await teamQuery;
      if (team) {
        setTeamMembers(team as UserProfile[]);
        if (team.length > 0) {
          setSelectedEmployee(team[0].id);
        }
      }

      // 4. Fetch Targets
      let targetQuery = supabase
        .from('employee_targets')
        .select('*, user:users(full_name)');

      if (profile.role === 'manager') {
        const teamIds = team ? team.map((m) => m.id) : [];
        if (teamIds.length > 0) {
          targetQuery = targetQuery.in('user_id', teamIds);
        } else {
          targetQuery = targetQuery.eq('user_id', '00000000-0000-0000-0000-000000000000');
        }
      } else if (profile.role === 'employee') {
        targetQuery = targetQuery.eq('user_id', authUser.id);
      }

      const { data: targetList } = await targetQuery.order('start_date', {
        ascending: false,
      });

      if (targetList) {
        const parsedTargets = targetList as EmployeeTarget[];

        // Dynamically compute the ACTUAL results from kpi_entries
        for (const target of parsedTargets) {
          const { data: achievements } = await supabase
            .from('kpi_entries')
            .select('amount')
            .eq('user_id', target.user_id)
            .eq('unit', target.unit)
            .gte('date', target.start_date)
            .lte('date', target.end_date);

          const totalAchieved = achievements
            ? achievements.reduce((sum, current) => sum + Number(current.amount), 0)
            : 0;
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

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedEmployee || !targetVal || Number(targetVal) <= 0) return;

    setSubmitting(true);
    setMsg(null);

    const finalStartDate = targetType === 'daily' ? singleDayDate : startDate;
    const finalEndDate = targetType === 'daily' ? singleDayDate : endDate;

    try {
      const { error } = await supabase.from('employee_targets').insert({
        tenant_id: currentUser.tenant_id,
        user_id: selectedEmployee,
        unit: targetUnit,
        target_value: Number(targetVal),
        target_type: targetType,
        start_date: finalStartDate,
        end_date: finalEndDate,
      });

      if (error) throw error;

      setMsg({
        text: isRtl ? 'تم تحديد الهدف بنجاح!' : 'Operational target assigned successfully!',
        error: false,
      });
      setTargetVal('');
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Creation failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    setActionId(targetId);
    try {
      const { error } = await supabase.from('employee_targets').delete().eq('id', targetId);
      if (error) throw error;
      setTargets(targets.filter((t) => t.id !== targetId));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Delete failed';
      alert(errMsg);
    } finally {
      setActionId(null);
    }
  };

  const isPrivileged = currentUser?.role === 'super_admin' || currentUser?.role === 'manager';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
        Loading HumAi targets board...
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Performance & Targets
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              {isRtl ? 'لوحة الأهداف والمهام التشغيلية' : 'Operational Targets & Goals Board'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl
                ? 'تعيين ومتابعة الأهداف اليومية والشهرية ومعدلات الإنجاز الفعلي'
                : 'Set and track daily/monthly targets vs actual achievements in real time'}
            </p>
          </div>
        </div>

        {/* Form & List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ASSIGN TARGET FORM (Privileged users only) */}
          {isPrivileged && (
            <div className="lg:col-span-1 cleariq-card p-6 cleariq-card-hover space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  {isRtl ? 'إسناد هدف تشغيلي جديد' : 'Assign New Target'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {currentUser?.role === 'manager'
                    ? isRtl
                      ? 'إسناد لأحد أعضاء فريقك المباشر'
                      : 'Assign goal to your direct team subordinate'
                    : isRtl
                    ? 'إسناد لأي موظف في الشركة'
                    : 'Assign goal to any company employee'}
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

              <form onSubmit={handleCreateTarget} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الموظف المستهدف' : 'Target Employee'}
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.job_title || 'Staff'})
                      </option>
                    ))}
                    {teamMembers.length === 0 && (
                      <option value="">No subordinates assigned</option>
                    )}
                  </select>
                </div>

                {/* Target Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'نوع الدورية' : 'Target Duration Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType('daily')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        targetType === 'daily'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {isRtl ? 'هدف يومي (Daily)' : 'Daily Target'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType('monthly')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        targetType === 'monthly'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {isRtl ? 'شهري / فترة (Monthly)' : 'Monthly / Range'}
                    </button>
                  </div>
                </div>

                {/* Date Inputs based on Target Type */}
                {targetType === 'daily' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {isRtl ? 'يوم الهدف المحدد' : 'Target Day Picker'}
                    </label>
                    <input
                      type="date"
                      required
                      value={singleDayDate}
                      onChange={(e) => setSingleDayDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {isRtl ? 'من تاريخ' : 'Start Date'}
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {isRtl ? 'إلى تاريخ' : 'End Date'}
                      </label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                )}

                {/* KPI Units Dropdown & Target Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-600" />
                      {isRtl ? 'وحدة القياس (Unit)' : 'KPI Unit'}
                    </label>
                    <select
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 capitalize cursor-pointer"
                    >
                      {kpiUnitsList.map((unit) => (
                        <option key={unit.id} value={unit.name}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'الكمية المطلوبة' : 'Goal Quantity'}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={targetVal}
                      onChange={(e) =>
                        setTargetVal(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !targetVal || teamMembers.length === 0}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isRtl ? 'تأكيد إسناد الهدف' : 'Assign Target Goal'}
                </button>
              </form>
            </div>
          )}

          {/* TARGETS STATUS & PROGRESS LIST */}
          <div
            className={`${
              isPrivileged ? 'lg:col-span-2' : 'lg:col-span-3'
            } cleariq-card p-6 cleariq-card-hover space-y-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  {isRtl ? 'سجل متابعة الأهداف والنتائج' : 'Active Goals & Progress Tracking'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isRtl
                    ? 'نسبة الإنجاز الفعلي المحققة من سجلات العمليات مقارنة بالهدف'
                    : 'Real-time computed achievements vs target goals'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {targets.map((tgt) => {
                const actual = tgt.actual_value || 0;
                const pct = Math.min(
                  100,
                  Math.round((actual / Math.max(1, tgt.target_value)) * 100)
                );
                const isCompleted = actual >= tgt.target_value;

                return (
                  <div
                    key={tgt.id}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {isCompleted ? '✓' : '🎯'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {tgt.user?.full_name || 'Staff member'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {tgt.target_type === 'daily'
                              ? `Day: ${tgt.start_date}`
                              : `Period: ${tgt.start_date} → ${tgt.end_date}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {pct}% Completed
                        </span>

                        {isPrivileged && (
                          <button
                            type="button"
                            disabled={actionId === tgt.id}
                            onClick={() => handleDeleteTarget(tgt.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-sans">
                        <span className="font-semibold text-slate-600">
                          {actual} / {tgt.target_value} {tgt.unit}
                        </span>
                        <span className="text-slate-400 font-medium">
                          Target: {tgt.target_value} {tgt.unit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {targets.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  {isRtl ? 'لا توجد أهداف مسندة حالياً' : 'No operational targets assigned yet.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
