'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, TrendingUp, ArrowUpRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';

interface EmployeeProgress {
  id: string;
  name: string;
  department: string;
  tasksCompleted: number;
  tasksTarget: number;
  unit: string;
  completionRate: number;
}

interface RawTargetRecord {
  id: string;
  user_id: string;
  target_quantity: number;
  kpi_unit: string | null;
  user?: {
    full_name?: string;
    department?: { name?: string };
  };
}

interface KpiEntryItem {
  id: string;
  user_id: string;
  amount: number;
  unit: string;
}

export default function HomeTaskAnalytics() {
  const { isRtl } = useLanguage();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [progressList, setProgressList] = useState<EmployeeProgress[]>([]);
  const [overallRate, setOverallRate] = useState<number>(0);

  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (!profile?.tenant_id) {
          setLoading(false);
          return;
        }

        // Fetch targets in this tenant
        const { data: targets } = await supabase
          .from('employee_targets')
          .select('*, user:users(id, full_name, department_id, department:departments(name))')
          .eq('tenant_id', profile.tenant_id)
          .order('created_at', { ascending: false });

        if (!targets || targets.length === 0) {
          setProgressList([]);
          setLoading(false);
          return;
        }

        // Fetch KPI entries for the tenant
        const { data: kpis } = await supabase
          .from('kpi_entries')
          .select('*')
          .eq('tenant_id', profile.tenant_id);

        const typedKpis = (kpis as unknown as KpiEntryItem[]) || [];

        const list: EmployeeProgress[] = (targets as unknown as RawTargetRecord[]).slice(0, 8).map((t) => {
          const userKpis = typedKpis.filter((k) => k.user_id === t.user_id && (!t.kpi_unit || k.unit === t.kpi_unit));
          const completed = userKpis.reduce((sum, k) => sum + Number(k.amount || 0), 0);
          const targetQty = Number(t.target_quantity) || 1;
          const rate = Math.min(100, Math.round((completed / targetQty) * 100));

          return {
            id: t.id,
            name: t.user?.full_name || 'Staff Member',
            department: t.user?.department?.name || 'Operations',
            tasksCompleted: completed,
            tasksTarget: targetQty,
            unit: t.kpi_unit || 'tasks',
            completionRate: rate,
          };
        });

        setProgressList(list);

        if (list.length > 0) {
          const avg = Math.round(list.reduce((acc, curr) => acc + curr.completionRate, 0) / list.length);
          setOverallRate(avg);
        }
      } catch (err) {
        console.error('Failed to load task analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
              {isRtl ? 'مؤشر الإنتاجية الحقيقي' : 'Live Productivity Index'}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {isRtl ? 'نسب إنجاز الأهداف والمهام المسندة' : 'Assigned Targets & Task Verification Progress'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isRtl
              ? 'متابعة لحظية ومباشرة من قاعدة البيانات للأهداف والمهام المنجزة'
              : 'Real-time database tracking of verified task achievements vs assigned operational targets'}
          </p>
        </div>

        {progressList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1 font-sans">
              <TrendingUp className="w-3.5 h-3.5" />
              {overallRate}% {isRtl ? 'متوسط الإنجاز' : 'Avg Completion'}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
          {isRtl ? 'جاري تحميل مؤشرات الإنجاز...' : 'Loading dynamic progress indicators...'}
        </div>
      ) : progressList.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
              {isRtl ? 'لا توجد أهداف مسندة مسجلة بعد' : 'No Operational Targets Assigned Yet'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {isRtl
                ? 'قم بإنشاء أهداف يومية أو شهرية لفريقك لمتابعة نسبة الإنجاز والإنتاجية لحظياً.'
                : 'Create daily or monthly targets for team members to track productivity and completion rates in real time.'}
            </p>
          </div>
          <Link
            href="/dashboard/targets"
            className="inline-flex items-center gap-1.5 gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
          >
            <span>{isRtl ? 'فتح لوحة متابعة الأهداف' : 'Go to Targets Board'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progressList.map((emp) => (
            <div
              key={emp.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center font-sans">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-950 dark:text-white block">{emp.name}</span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{emp.department}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold font-sans text-slate-950 dark:text-white">
                    {emp.completionRate}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">
                    {emp.tasksCompleted} / {emp.tasksTarget} {emp.unit}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    emp.completionRate >= 100
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : emp.completionRate >= 75
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                      : emp.completionRate >= 50
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${emp.completionRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
