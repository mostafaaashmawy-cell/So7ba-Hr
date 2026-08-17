'use client';

import React, { useState } from 'react';

interface SalaryUnitChartProps {
  title?: string;
  subtitle?: string;
}

export default function SalaryUnitChart({
  title = 'Total Salary / Activity by Unit',
  subtitle = 'Monthly comparison between Operations & Sales activities',
}: SalaryUnitChartProps) {
  const [activeSeries, setActiveSeries] = useState<'both' | 'sales' | 'operations'>('both');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const monthsData = [
    { month: 'Jan', ops: 45, sales: 30 },
    { month: 'Feb', ops: 65, sales: 48 },
    { month: 'Mar', ops: 38, sales: 25 },
    { month: 'Apr', ops: 78, sales: 55 },
    { month: 'May', ops: 52, sales: 40 },
    { month: 'Jun', ops: 88, sales: 62 },
    { month: 'Jul', ops: 70, sales: 50 },
    { month: 'Aug', ops: 92, sales: 75 },
    { month: 'Sep', ops: 60, sales: 45 },
    { month: 'Oct', ops: 82, sales: 68 },
    { month: 'Nov', ops: 74, sales: 58 },
    { month: 'Dec', ops: 95, sales: 80 },
  ];

  return (
    <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Legend & Filter Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSeries(activeSeries === 'sales' ? 'both' : 'sales')}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-opacity ${
                activeSeries === 'operations' ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span className="text-slate-700">Operations</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSeries(activeSeries === 'operations' ? 'both' : 'operations')
              }
              className={`flex items-center gap-1.5 text-xs font-semibold transition-opacity ${
                activeSeries === 'sales' ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
              <span className="text-slate-700">Sales</span>
            </button>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
            2026 Monthly
          </span>
        </div>
      </div>

      {/* Pill Bars Container (Matching Cleariq Visual Reference) */}
      <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 px-2 relative border-b border-slate-100">
        {/* Horizontal Guide Lines */}
        <div className="absolute inset-x-0 top-8 border-b border-slate-100/60 pointer-events-none" />
        <div className="absolute inset-x-0 top-28 border-b border-slate-100/60 pointer-events-none" />
        <div className="absolute inset-x-0 top-48 border-b border-slate-100/60 pointer-events-none" />

        {monthsData.map((d, idx) => {
          const opsHeight = (d.ops / 100) * 100;
          const salesHeight = (d.sales / 100) * 100;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={d.month}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in">
                  <span>Ops: {d.ops}k</span> • <span>Sales: {d.sales}k</span>
                </div>
              )}

              {/* Dual-tone pill bar */}
              <div className="w-3.5 sm:w-5 md:w-6 flex flex-col items-center justify-end rounded-full overflow-hidden bg-slate-100/80 transition-all duration-300 group-hover:scale-105">
                {/* Upper bar (Operations) */}
                {(activeSeries === 'both' || activeSeries === 'operations') && (
                  <div
                    className="w-full bg-gradient-to-b from-blue-600 to-blue-500 rounded-t-full transition-all duration-500"
                    style={{ height: `${opsHeight * 1.6}px` }}
                  />
                )}

                {/* Lower bar (Sales) */}
                {(activeSeries === 'both' || activeSeries === 'sales') && (
                  <div
                    className="w-full bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-b-full transition-all duration-500"
                    style={{ height: `${salesHeight * 0.9}px` }}
                  />
                )}
              </div>

              {/* Month Label */}
              <span
                className={`text-[11px] font-sans font-semibold mt-2 transition-colors ${
                  isHovered ? 'text-blue-600 font-bold' : 'text-slate-400'
                }`}
              >
                {d.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
