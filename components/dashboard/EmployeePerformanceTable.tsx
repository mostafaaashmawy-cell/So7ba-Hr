'use client';

import React from 'react';
import { UserProfile } from '@/lib/types/database';
import { MoreVertical, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EmployeePerformanceTableProps {
  employees: UserProfile[];
}

export default function EmployeePerformanceTable({ employees }: EmployeePerformanceTableProps) {
  // Determine badge styling based on salary/role/index
  const getPerformanceBadge = (idx: number, role: string) => {
    if (role === 'super_admin' || idx % 3 === 0) {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 uppercase tracking-wide font-sans">
          Excellent
        </span>
      );
    } else if (idx % 3 === 1) {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wide font-sans">
          Good
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 uppercase tracking-wide font-sans">
          Average
        </span>
      );
    }
  };

  const sampleList = employees.length > 0 ? employees.slice(0, 6) : [];

  return (
    <div className="cleariq-card p-6 cleariq-card-hover space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-950 dark:text-white">Employee Performance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active team designations and evaluation status
          </p>
        </div>
        <Link
          href="/dashboard/evaluations"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
        >
          View all reviews
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80">
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-950 dark:text-slate-100 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 pl-2">Name</th>
              <th className="py-3">Designation</th>
              <th className="py-3 text-center">Performance</th>
              <th className="py-3 pr-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sampleList.map((emp, idx) => (
              <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3.5 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200/60 shrink-0">
                      {emp.full_name ? emp.full_name.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                        {emp.full_name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">
                        {emp.mobile || 'emp@humai.com'}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 text-slate-800 dark:text-slate-200 font-medium">
                  {emp.job_title || (emp.role === 'super_admin' ? 'Executive Director' : 'Specialist')}
                </td>

                <td className="py-3.5 text-center">
                  {getPerformanceBadge(idx, emp.role)}
                </td>

                <td className="py-3.5 pr-2 text-right">
                  <Link
                    href="/dashboard/evaluations"
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 inline-block transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}

            {sampleList.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                  No employee performance entries recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
