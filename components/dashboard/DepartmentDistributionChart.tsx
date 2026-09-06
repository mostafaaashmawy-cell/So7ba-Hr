'use client';

import React from 'react';

export default function DepartmentDistributionChart() {
  const departments = [
    { name: 'Operations & HR', count: 55, color: '#10b981', bg: 'bg-emerald-500' },
    { name: 'Sales & BD', count: 28, color: '#1f2937', bg: 'bg-slate-800 dark:bg-slate-400' },
    { name: 'Development / IT', count: 17, color: '#0d9488', bg: 'bg-teal-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1. Department Breakdown (Overlapping Bubbles Visual from Cleariq) */}
      <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-950 dark:text-white">Department Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Staff breakdown across major operational units</p>
        </div>

        <div className="relative h-44 flex items-center justify-center">
          {/* Main Bubble (Operations / 55) */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-500/25 z-20">
            <span className="text-2xl font-extrabold font-sans">55%</span>
            <span className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">
              Operations
            </span>
          </div>

          {/* Secondary Bubble (Sales / 28) */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 text-white flex flex-col items-center justify-center shadow-md shadow-slate-800/20 absolute right-8 sm:right-14 top-4 z-10">
            <span className="text-lg font-bold font-sans">28%</span>
            <span className="text-[9px] font-medium text-slate-200 uppercase">Sales</span>
          </div>

          {/* Tertiary Bubble (Tech / 17) */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex flex-col items-center justify-center shadow-md shadow-teal-500/20 absolute left-8 sm:left-14 bottom-2 z-10">
            <span className="text-sm font-bold font-sans">17%</span>
            <span className="text-[8px] font-medium text-teal-100 uppercase">IT & Dev</span>
          </div>
        </div>

        <div className="flex items-center justify-around border-t border-slate-100 dark:border-slate-800 pt-3">
          {departments.map((dept) => (
            <div key={dept.name} className="flex items-center gap-1.5 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${dept.bg}`} />
              <span className="text-slate-600 dark:text-slate-400 font-medium">{dept.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Employee Structure (Circular Gauge 100% Ring from Cleariq) */}
      <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-950 dark:text-white">Employee Structure</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Contract and retention allocation</p>
        </div>

        <div className="relative h-44 flex items-center justify-center">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Full-time ring (75%) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - 0.75)}
              strokeLinecap="round"
              fill="transparent"
            />
            {/* Part-time ring (25%) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#64748b"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - 0.25)}
              strokeLinecap="round"
              fill="transparent"
              className="rotate-180 origin-center"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-extrabold text-slate-950 dark:text-white font-sans block">100%</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Staff</span>
          </div>
        </div>

        <div className="flex items-center justify-around border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Full-Time (75%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Part-Time (25%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
