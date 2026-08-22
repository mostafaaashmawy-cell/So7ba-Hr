'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface DepartmentLatenessItem {
  department: string;
  latenessMinutes: number;
  delayedIncidents: number;
}

interface DepartmentLatenessBarChartProps {
  data?: DepartmentLatenessItem[];
}

const DEFAULT_DATA: DepartmentLatenessItem[] = [
  { department: 'Operations', latenessMinutes: 340, delayedIncidents: 22 },
  { department: 'Sales & BD', latenessMinutes: 215, delayedIncidents: 16 },
  { department: 'Marketing', latenessMinutes: 140, delayedIncidents: 9 },
  { department: 'Engineering', latenessMinutes: 75, delayedIncidents: 5 },
  { department: 'HR & Admin', latenessMinutes: 25, delayedIncidents: 2 },
];

export default function DepartmentLatenessBarChart({
  data = DEFAULT_DATA,
}: DepartmentLatenessBarChartProps) {
  const { isRtl } = useLanguage();

  // Sort descending by lateness minutes
  const sortedData = [...data].sort((a, b) => b.latenessMinutes - a.latenessMinutes);
  const totalLatenessMins = sortedData.reduce((acc, curr) => acc + curr.latenessMinutes, 0);

  const getBarColor = (mins: number) => {
    if (mins >= 200) return '#F43F5E'; // Rose (High delay)
    if (mins >= 100) return '#F59E0B'; // Amber (Moderate delay)
    return '#10B981'; // Emerald (Low/Compliant)
  };

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
              {isRtl ? 'الأقسام الأكثر تأخيراً (دقائق التأخير المتراكمة)' : 'Top Delayed Teams / Lateness by Dept'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'إجمالي دقائق التأخير المسجلة خلال الشهر الحالي لكل قسم'
                : 'Accumulated delay minutes in the current month'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-extrabold text-slate-900 dark:text-slate-100 font-sans border border-slate-200 dark:border-slate-700">
            {totalLatenessMins} {isRtl ? 'دقيقة إجمالية' : 'Total Mins'}
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis
              dataKey="department"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'sans-serif' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)', radius: 8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DepartmentLatenessItem;
                  const hours = (item.latenessMinutes / 60).toFixed(1);
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs font-sans space-y-1">
                      <p className="font-extrabold text-sm text-emerald-400">{item.department}</p>
                      <p className="text-slate-300">
                        Total Lateness: <span className="font-bold text-white">{item.latenessMinutes} mins</span> ({hours} hrs)
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Late Check-in Incidents: <span className="text-amber-400 font-bold">{item.delayedIncidents}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="latenessMinutes" radius={[8, 8, 0, 0]} maxBarSize={46}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.latenessMinutes)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Compliance Threshold Tags */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Compliant (&lt; 100m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Warning (100 - 200m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Critical Lateness (&gt; 200m)</span>
        </div>
      </div>
    </div>
  );
}
