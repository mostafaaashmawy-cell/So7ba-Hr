'use client';

import React from 'react';

export default function DepartmentDistributionChart() {
  const departments = [
    { name: 'Design / UI', count: 55, color: '#2563eb', bg: 'bg-blue-600' },
    { name: 'Development / IT', count: 28, color: '#10b981', bg: 'bg-emerald-500' },
    { name: 'Operations & HR', count: 17, color: '#06b6d4', bg: 'bg-cyan-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1. Department Breakdown (Overlapping Bubbles Visual from Cleariq) */}
      <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Department Distribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">Staff breakdown across major departments</p>
        </div>

        <div className="relative h-44 flex items-center justify-center">
          {/* Main Bubble (Design / 55) */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-500/25 z-20">
            <span className="text-2xl font-extrabold font-sans">55%</span>
            <span className="text-[10px] font-semibold text-blue-100 uppercase tracking-wider">
              Operations
            </span>
          </div>

          {/* Secondary Bubble (Dev / 28) */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex flex-col items-center justify-center shadow-md shadow-emerald-500/20 absolute right-8 sm:right-14 top-4 z-10">
            <span className="text-lg font-bold font-sans">28%</span>
            <span className="text-[9px] font-medium text-emerald-100 uppercase">Sales</span>
          </div>

          {/* Tertiary Bubble (HR / 17) */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 text-white flex flex-col items-center justify-center shadow-md shadow-cyan-500/20 absolute left-8 sm:left-14 bottom-2 z-10">
            <span className="text-sm font-bold font-sans">17%</span>
            <span className="text-[8px] font-medium text-cyan-100 uppercase">HR & IT</span>
          </div>
        </div>

        <div className="flex items-center justify-around border-t border-slate-100 pt-3">
          {departments.map((dept) => (
            <div key={dept.name} className="flex items-center gap-1.5 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${dept.bg}`} />
              <span className="text-slate-600 font-medium">{dept.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Employee Structure (Circular Gauge 100% Ring from Cleariq) */}
      <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Employee Structure</h3>
          <p className="text-xs text-slate-400 mt-0.5">Contract and retention allocation</p>
        </div>

        <div className="relative h-44 flex items-center justify-center">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-slate-100"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Full-time ring (75%) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#2563eb"
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
              stroke="#06b6d4"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - 0.25)}
              strokeLinecap="round"
              fill="transparent"
              className="rotate-180 origin-center"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-extrabold text-slate-900 font-sans block">100%</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Staff</span>
          </div>
        </div>

        <div className="flex items-center justify-around border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-600 font-medium">Full-Time (75%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-600 font-medium">Part-Time (25%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
