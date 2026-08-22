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
import { DollarSign } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface DepartmentPayrollCostItem {
  department: string;
  basicSalaries: number; // in EGP
  commissionsBonuses: number; // in EGP
  insurancesOvertime: number; // in EGP
  totalCost?: number;
}

interface PayrollCostStackedBarChartProps {
  data?: DepartmentPayrollCostItem[];
}

const DEFAULT_DATA: DepartmentPayrollCostItem[] = [
  { department: 'Operations', basicSalaries: 180000, commissionsBonuses: 35000, insurancesOvertime: 22000 },
  { department: 'Sales & BD', basicSalaries: 140000, commissionsBonuses: 85000, insurancesOvertime: 15000 },
  { department: 'Engineering', basicSalaries: 220000, commissionsBonuses: 25000, insurancesOvertime: 18000 },
  { department: 'Marketing', basicSalaries: 95000, commissionsBonuses: 20000, insurancesOvertime: 12000 },
  { department: 'HR & Legal', basicSalaries: 65000, commissionsBonuses: 10000, insurancesOvertime: 8000 },
];

export default function PayrollCostStackedBarChart({
  data = DEFAULT_DATA,
}: PayrollCostStackedBarChartProps) {
  const { isRtl } = useLanguage();

  const enrichedData = data.map((d) => ({
    ...d,
    totalCost: d.basicSalaries + d.commissionsBonuses + d.insurancesOvertime,
  }));

  const totalPayrollExpenditure = enrichedData.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
              {isRtl ? 'تكاليف الرواتب والمزايا حسب القسم' : 'Payroll & Benefits Cost by Department'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'تحليل تفصيلي لمصروفات الكوادر (رواتب أساسية، عمولات ومكافآت، تأمينات وإضافي)'
                : 'Stacked personnel expenses: Base Pay, Commissions/Bonuses & Insurances/Overtime'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 font-bold block">Total Monthly Outlay</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-sans">
              {totalPayrollExpenditure.toLocaleString()} EGP
            </span>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={enrichedData}
            margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
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
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)', radius: 8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as typeof enrichedData[0];
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs font-sans space-y-1.5 min-w-[200px]">
                      <p className="font-extrabold text-sm text-emerald-400">{item.department}</p>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Basic Salaries:
                        </span>
                        <span className="font-bold">{item.basicSalaries.toLocaleString()} EGP</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-500" /> Commissions & Bonus:
                        </span>
                        <span className="font-bold">{item.commissionsBonuses.toLocaleString()} EGP</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400" /> Insurances & Overtime:
                        </span>
                        <span className="font-bold">{item.insurancesOvertime.toLocaleString()} EGP</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-700 text-white font-extrabold">
                        <span>Total Department Cost:</span>
                        <span className="text-emerald-400">{item.totalCost.toLocaleString()} EGP</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="basicSalaries" name="Basic Salaries" stackId="a" fill="#10B981" maxBarSize={48} />
            <Bar dataKey="commissionsBonuses" name="Commissions & Bonuses" stackId="a" fill="#0D9488" maxBarSize={48} />
            <Bar
              dataKey="insurancesOvertime"
              name="Insurances & Overtime"
              stackId="a"
              fill="#334155"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#10B981]" />
          <span className="text-slate-700 dark:text-slate-300">
            {isRtl ? 'الرواتب الأساسية' : 'Basic Salaries'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#0D9488]" />
          <span className="text-slate-700 dark:text-slate-300">
            {isRtl ? 'العمولات والمكافآت' : 'Commissions & Bonuses'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#334155] dark:bg-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">
            {isRtl ? 'التأمينات والعمل الإضافي' : 'Insurances & Overtime'}
          </span>
        </div>
      </div>
    </div>
  );
}
