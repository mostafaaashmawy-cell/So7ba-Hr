'use client';

import React from 'react';
import { ArrowUpRight, Users, Banknote } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface StatCardsProps {
  totalEmployees: number;
  activeToday: number;
  totalLeavesMonth: number;
  avgPerformance: number;
  totalPayrollEgp?: number;
}

export default function StatCards({
  totalEmployees,
  activeToday,
  totalLeavesMonth,
  avgPerformance,
  totalPayrollEgp = 128000,
}: StatCardsProps) {
  const { isRtl } = useLanguage();

  // SVG Circular Radial Progress Gauge Component
  const RadialGauge = ({ percentage, color }: { percentage: number; color: string }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 54 54">
          <circle
            cx="27"
            cy="27"
            r={radius}
            className="text-slate-100 dark:text-slate-800"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="27"
            cy="27"
            r={radius}
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-[11px] text-slate-950 dark:text-white font-extrabold font-sans">
          {percentage}%
        </span>
      </div>
    );
  };

  const attendanceRate = totalEmployees > 0 ? Math.round((activeToday / totalEmployees) * 100) : 0;
  const performanceRate = Math.round((avgPerformance / 5) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* CARD 1: Total Employees */}
      <div className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">
            {isRtl ? 'إجمالي الموظفين' : 'Total Employees'}
          </span>
          <div className="text-2xl sm:text-3xl text-slate-950 dark:text-white font-extrabold tracking-tight font-sans">
            {totalEmployees.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{isRtl ? 'قوة العمل الكلية' : 'Active Headcount'}</span>
          </div>
        </div>
        <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* CARD 2: Active on Duty Today */}
      <div className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">
            {isRtl ? 'الحاضرون بالعمل اليوم' : 'Active On Duty Today'}
          </span>
          <div className="text-2xl sm:text-3xl text-slate-950 dark:text-white font-extrabold tracking-tight font-sans">
            {activeToday.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{attendanceRate}% {isRtl ? 'حضور اليوم' : 'present today'}</span>
          </div>
        </div>
        <RadialGauge percentage={attendanceRate} color="#059669" />
      </div>

      {/* CARD 3: Performance Index */}
      <div className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">
            {isRtl ? 'متوسط تقييم الأداء' : 'Avg Performance Score'}
          </span>
          <div className="text-2xl sm:text-3xl text-slate-950 dark:text-white font-extrabold tracking-tight font-sans flex items-baseline gap-1">
            {avgPerformance > 0 ? avgPerformance.toFixed(1) : '0.0'}
            <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{performanceRate}% {isRtl ? 'نسبة الكفاءة' : 'efficiency index'}</span>
          </div>
        </div>
        <RadialGauge percentage={performanceRate} color="#0d9488" />
      </div>

      {/* CARD 4: Total Monthly Payroll */}
      <div className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">
            {isRtl ? 'إجمالي الرواتب التقديري' : 'Estimated Payroll'}
          </span>
          <div className="text-2xl sm:text-3xl text-slate-950 dark:text-white font-extrabold tracking-tight font-sans">
            {totalPayrollEgp.toLocaleString()}
            <span className="text-xs font-bold text-slate-400 ml-1">EGP</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{isRtl ? 'مجدول للصرف' : 'Scheduled this month'}</span>
          </div>
        </div>
        <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
          <Banknote className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
