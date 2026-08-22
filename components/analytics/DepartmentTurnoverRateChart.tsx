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
import { UserMinus } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface DepartmentTurnoverItem {
  department: string;
  turnoverRate: number; // e.g. 5.8%
  resignations: number;
}

interface DepartmentTurnoverRateChartProps {
  data?: DepartmentTurnoverItem[];
}

const DEFAULT_DATA: DepartmentTurnoverItem[] = [
  { department: 'Customer Success', turnoverRate: 7.2, resignations: 4 },
  { department: 'Sales & BD', turnoverRate: 5.4, resignations: 3 },
  { department: 'Operations', turnoverRate: 3.8, resignations: 3 },
  { department: 'Marketing', turnoverRate: 2.5, resignations: 1 },
  { department: 'Engineering', turnoverRate: 1.2, resignations: 1 },
];

export default function DepartmentTurnoverRateChart({
  data = DEFAULT_DATA,
}: DepartmentTurnoverRateChartProps) {
  const { isRtl } = useLanguage();

  // Sort descending by turnover rate
  const sortedData = [...data].sort((a, b) => b.turnoverRate - a.turnoverRate);

  const getRiskColor = (rate: number) => {
    if (rate >= 5.0) return '#F43F5E'; // High risk - Rose
    if (rate >= 3.0) return '#F59E0B'; // Moderate - Amber
    return '#10B981'; // Healthy - Emerald
  };

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <UserMinus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
              {isRtl ? 'معدل دوران العمالة حسب القسم' : 'Departmental Turnover Rate'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'ترتيب تنازلي لنسبة تسرب واستقالات الموظفين لتحديد نقاط الضعف'
                : 'Ranked retention breakdown to identify talent attrition risks'}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-sans">
          {isRtl ? 'مؤشر الاحتفاظ بالموظفين' : 'Retention Risk Monitor'}
        </span>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 10, right: 25, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'sans-serif' }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="department"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
              width={90}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)', radius: 8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DepartmentTurnoverItem;
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs font-sans space-y-1">
                      <p className="font-extrabold text-sm text-slate-100">{item.department}</p>
                      <p className="text-slate-300">
                        Turnover Rate: <span className="font-extrabold text-rose-400">{item.turnoverRate}%</span>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Departures: <span className="text-white font-bold">{item.resignations} employees</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="turnoverRate" radius={[0, 8, 8, 0]} maxBarSize={28}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getRiskColor(entry.turnoverRate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Benchmarks */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Optimal (&lt; 3.0%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Moderate (3.0% - 5.0%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>High Risk (&gt; 5.0%)</span>
        </div>
      </div>
    </div>
  );
}
