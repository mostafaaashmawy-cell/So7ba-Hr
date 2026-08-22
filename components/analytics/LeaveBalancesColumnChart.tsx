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
} from 'recharts';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface DepartmentLeaveBalanceItem {
  department: string;
  unusedDays: number;
  consumedDays: number;
  totalAccrued: number;
}

interface LeaveBalancesColumnChartProps {
  data?: DepartmentLeaveBalanceItem[];
}

const DEFAULT_DATA: DepartmentLeaveBalanceItem[] = [
  { department: 'Operations', unusedDays: 142, consumedDays: 58, totalAccrued: 200 },
  { department: 'Sales & BD', unusedDays: 98, consumedDays: 62, totalAccrued: 160 },
  { department: 'Engineering', unusedDays: 84, consumedDays: 36, totalAccrued: 120 },
  { department: 'Marketing', unusedDays: 45, consumedDays: 35, totalAccrued: 80 },
  { department: 'HR & Legal', unusedDays: 28, consumedDays: 22, totalAccrued: 50 },
];

export default function LeaveBalancesColumnChart({
  data = DEFAULT_DATA,
}: LeaveBalancesColumnChartProps) {
  const { isRtl } = useLanguage();

  const totalUnusedLiability = data.reduce((acc, curr) => acc + curr.unusedDays, 0);

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
              {isRtl ? 'أرصدة الإجازات والالتزامات حسب القسم' : 'Leave Balances by Department'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'مقارنة الأيام المستحقة المتبقية بالمستهلكة لتحديد التزامات الإجازات'
                : 'Accrued vs unused days to identify department leave liabilities'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-extrabold font-sans">
            {totalUnusedLiability} {isRtl ? 'يوم متبقي (التزام)' : 'Unused Days Liability'}
          </span>
        </div>
      </div>

      {/* Column Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
                  const item = payload[0].payload as DepartmentLeaveBalanceItem;
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs font-sans space-y-1.5">
                      <p className="font-extrabold text-sm text-purple-400">{item.department}</p>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>Unused (Remaining):</span>
                        <span className="font-bold text-amber-400">{item.unusedDays} days</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>Consumed (Taken):</span>
                        <span className="font-bold text-slate-200">{item.consumedDays} days</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t border-slate-700 text-white font-extrabold">
                        <span>Total Entitled:</span>
                        <span>{item.totalAccrued} days</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="unusedDays" name="Unused Balance" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="consumedDays" name="Consumed Days" fill="#CBD5E1" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Summary */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#8B5CF6]" />
          <span className="text-slate-700 dark:text-slate-300">{isRtl ? 'الرصيد المتبقي (التزام)' : 'Unused Balance (Liability)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#CBD5E1] dark:bg-slate-700" />
          <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'الإجازات المستهلكة' : 'Consumed Days'}</span>
        </div>
      </div>
    </div>
  );
}
