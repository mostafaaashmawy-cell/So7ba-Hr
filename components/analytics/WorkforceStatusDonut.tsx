'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Users, CheckCircle2, Globe, Calendar, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface WorkforceStatusData {
  present: number;
  remote: number;
  onLeave: number;
  absent: number;
}

interface WorkforceStatusDonutProps {
  data?: WorkforceStatusData;
}

const DEFAULT_DATA: WorkforceStatusData = {
  present: 42,
  remote: 18,
  onLeave: 6,
  absent: 4,
};

export default function WorkforceStatusDonut({ data = DEFAULT_DATA }: WorkforceStatusDonutProps) {
  const { isRtl } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.present + data.remote + data.onLeave + data.absent;

  const chartData = [
    { name: isRtl ? 'حضور بالمكتب' : 'On-Site Present', value: data.present, color: '#10B981', icon: CheckCircle2 },
    { name: isRtl ? 'عمل عن بعد (WFH)' : 'Remote (WFH)', value: data.remote, color: '#3B82F6', icon: Globe },
    { name: isRtl ? 'في إجازة رسمية' : 'On Approved Leave', value: data.onLeave, color: '#F59E0B', icon: Calendar },
    { name: isRtl ? 'غياب غير مسجل' : 'Unexcused Absent', value: data.absent, color: '#F43F5E', icon: AlertCircle },
  ];

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
              {isRtl ? 'حالة القوى العاملة اليوم' : 'Daily Workforce Status'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl ? 'توزيع الحضور والعمل عن بعد والإجازات اللحظي' : 'Real-time breakdown of team activity today'}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 font-sans">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE TODAY
        </span>
      </div>

      {/* Chart & Central Metric */}
      <div className="relative h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={92}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="transparent"
                  className="transition-all duration-300"
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  const pct = total > 0 ? Math.round(((item.value as number) / total) * 100) : 0;
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs font-sans">
                      <p className="font-extrabold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
                        {item.name}
                      </p>
                      <p className="mt-1 text-slate-300 font-semibold">
                        Count: <span className="text-white font-extrabold">{item.value}</span> ({pct}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Central Overlay Stat */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-sans tracking-tight">
            {total}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {isRtl ? 'إجمالي الموظفين' : 'Total Staff'}
          </span>
        </div>
      </div>

      {/* Legend & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {chartData.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={item.name}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-baseline justify-between font-sans">
                <span className="text-sm font-extrabold text-slate-950 dark:text-white">{item.value}</span>
                <span className="text-[10px] font-semibold text-slate-400">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
