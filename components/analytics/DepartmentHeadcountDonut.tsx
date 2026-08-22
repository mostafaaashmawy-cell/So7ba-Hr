'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { FolderTree } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface DepartmentHeadcountItem {
  name: string;
  count: number;
  color?: string;
}

interface DepartmentHeadcountDonutProps {
  data?: DepartmentHeadcountItem[];
}

const PALETTE = [
  '#10B981', // Emerald Primary
  '#0D9488', // Teal
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#1F2937', // Deep Charcoal
];

const DEFAULT_DATA: DepartmentHeadcountItem[] = [
  { name: 'Operations & Logistics', count: 32 },
  { name: 'Sales & Business Dev', count: 24 },
  { name: 'Engineering & Tech', count: 18 },
  { name: 'Marketing & Media', count: 12 },
  { name: 'Customer Success & HR', count: 8 },
];

export default function DepartmentHeadcountDonut({ data = DEFAULT_DATA }: DepartmentHeadcountDonutProps) {
  const { isRtl } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const enrichedData = data.map((d, idx) => ({
    ...d,
    color: d.color || PALETTE[idx % PALETTE.length],
  }));

  const totalHeadcount = enrichedData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
              {isRtl ? 'توزيع الموظفين حسب الأقسام' : 'Headcount by Department'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl ? 'نسبة الكثافة العددية لكل وحدة تنظيمية' : 'Workforce proportion across active units'}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800 font-sans">
          {enrichedData.length} {isRtl ? 'أقسام نشطة' : 'Departments'}
        </span>
      </div>

      {/* Donut Chart */}
      <div className="relative h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enrichedData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={92}
              paddingAngle={3}
              dataKey="count"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              cursor="pointer"
            >
              {enrichedData.map((entry, index) => (
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
                  const pct =
                    totalHeadcount > 0 ? Math.round(((item.value as number) / totalHeadcount) * 100) : 0;
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs font-sans">
                      <p className="font-extrabold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
                        {item.name}
                      </p>
                      <p className="mt-1 text-slate-300 font-semibold">
                        Staff: <span className="text-white font-extrabold">{item.value}</span> ({pct}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-sans tracking-tight">
            {totalHeadcount}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {isRtl ? 'إجمالي الفريق' : 'Active Team'}
          </span>
        </div>
      </div>

      {/* Department Breakdown List */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto pr-1">
        {enrichedData.map((dept, idx) => {
          const pct = totalHeadcount > 0 ? Math.round((dept.count / totalHeadcount) * 100) : 0;
          return (
            <div
              key={dept.name || idx}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {dept.name}
                </span>
              </div>
              <div className="flex items-center gap-2 font-sans shrink-0">
                <span className="text-xs font-extrabold text-slate-950 dark:text-white">{dept.count}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
