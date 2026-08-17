'use client';

import React from 'react';
import { Users, TrendingUp, DollarSign, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
            className="text-slate-100"
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
        <span className="absolute text-[11px] font-bold text-slate-700 font-sans">
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
          <span className="text-xs font-semibold text-slate-500 block">Total Employees</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            {totalEmployees.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12% increase</span>
            <span className="text-slate-400 font-normal ml-1">Last month</span>
          </div>
        </div>
        <RadialGauge percentage={85} color="#6366f1" />
      </div>

      {/* CARD 2: Active on Duty Today */}
      <div className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Active On Duty Today</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            {activeToday.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{attendanceRate}% present</span>
            <span className="text-slate-400 font-normal ml-1">Today</span>
          </div>
        </div>
        <RadialGauge percentage={attendanceRate || 75} color="#2563eb" />
      </div>

      {/* CARD 3: Performance Index */}
      <div className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Avg Performance Score</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans flex items-baseline gap-1">
            {avgPerformance > 0 ? avgPerformance.toFixed(1) : '4.2'}
            <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8% rating</span>
            <span className="text-slate-400 font-normal ml-1">Reviews</span>
          </div>
        </div>
        <RadialGauge percentage={performanceRate || 84} color="#06b6d4" />
      </div>

      {/* CARD 4: Total Monthly Payroll */}
      <div className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Estimated Payroll</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            {totalPayrollEgp.toLocaleString()}
            <span className="text-xs font-bold text-slate-400 ml-1">EGP</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>On schedule</span>
            <span className="text-slate-400 font-normal ml-1">This month</span>
          </div>
        </div>
        <RadialGauge percentage={92} color="#f59e0b" />
      </div>
    </div>
  );
}
