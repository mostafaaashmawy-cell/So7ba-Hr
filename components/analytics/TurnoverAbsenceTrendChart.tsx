'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface MonthlyTrendData {
  month: string;
  absenteeismRate: number; // Percentage, e.g. 4.2%
  turnoverRate: number; // Percentage, e.g. 1.8%
}

interface TurnoverAbsenceTrendChartProps {
  data?: MonthlyTrendData[];
}

const DEFAULT_DATA: MonthlyTrendData[] = [
  { month: 'Jan', absenteeismRate: 3.8, turnoverRate: 1.2 },
  { month: 'Feb', absenteeismRate: 4.2, turnoverRate: 1.4 },
  { month: 'Mar', absenteeismRate: 3.5, turnoverRate: 0.9 },
  { month: 'Apr', absenteeismRate: 5.1, turnoverRate: 2.1 },
  { month: 'May', absenteeismRate: 4.0, turnoverRate: 1.5 },
  { month: 'Jun', absenteeismRate: 3.2, turnoverRate: 1.1 },
  { month: 'Jul', absenteeismRate: 4.8, turnoverRate: 1.8 },
  { month: 'Aug', absenteeismRate: 5.4, turnoverRate: 2.3 },
  { month: 'Sep', absenteeismRate: 3.9, turnoverRate: 1.2 },
  { month: 'Oct', absenteeismRate: 3.6, turnoverRate: 1.0 },
  { month: 'Nov', absenteeismRate: 3.1, turnoverRate: 0.8 },
  { month: 'Dec', absenteeismRate: 4.4, turnoverRate: 1.6 },
];

export default function TurnoverAbsenceTrendChart({
  data = DEFAULT_DATA,
}: TurnoverAbsenceTrendChartProps) {
  const { isRtl } = useLanguage();

  const avgAbsence = (
    data.reduce((acc, curr) => acc + curr.absenteeismRate, 0) / data.length
  ).toFixed(1);
  const avgTurnover = (
    data.reduce((acc, curr) => acc + curr.turnoverRate, 0) / data.length
  ).toFixed(1);

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
              {isRtl ? 'مؤشرات الغياب ومعدل دوران العمالة' : 'Turnover & Absenteeism Trajectory'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'تتبع سنوي (12 شهر) لمعدلات الغياب الشهري ونسبة تسرب الموظفين'
                : '12-month historical comparison of absenteeism vs turnover rates'}
            </p>
          </div>
        </div>

        {/* Quick Averages */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">
              Avg Absence
            </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
              {avgAbsence}%
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs">
            <span className="text-[10px] text-rose-800 dark:text-rose-300 font-bold block">
              Avg Turnover
            </span>
            <span className="font-extrabold text-rose-600 dark:text-rose-400 font-sans">
              {avgTurnover}%
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Line Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600, fontFamily: 'sans-serif' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'sans-serif' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs font-sans space-y-1.5">
                      <p className="font-extrabold text-sm text-slate-200">{label} 2026</p>
                      <div className="flex items-center justify-between gap-4 text-emerald-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Absenteeism:
                        </span>
                        <span>{payload[0].value}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-rose-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Turnover:
                        </span>
                        <span>{payload[1].value}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="absenteeismRate"
              name="Absenteeism Rate (%)"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#10B981' }}
            />
            <Line
              type="monotone"
              dataKey="turnoverRate"
              name="Turnover Rate (%)"
              stroke="#F43F5E"
              strokeWidth={3}
              strokeDasharray="4 4"
              dot={{ r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#F43F5E' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 rounded-full bg-emerald-500" />
          <span className="text-slate-700 dark:text-slate-300">
            {isRtl ? 'معدل الغياب الشهري (%)' : 'Monthly Absenteeism Rate (%)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 rounded-full bg-rose-500" />
          <span className="text-slate-700 dark:text-slate-300">
            {isRtl ? 'معدل تسرب الموظفين (%)' : 'Turnover Rate (%)'}
          </span>
        </div>
      </div>
    </div>
  );
}
