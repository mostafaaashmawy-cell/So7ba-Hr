'use client';

import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

interface EmployeeProgress {
  name: string;
  department: string;
  tasksCompleted: number;
  tasksTarget: number;
  completionRate: number;
}

export default function HomeTaskAnalytics() {
  const sampleAnalytics: EmployeeProgress[] = [
    {
      name: 'Arthur Henry',
      department: 'Design / UI',
      tasksCompleted: 48,
      tasksTarget: 50,
      completionRate: 96,
    },
    {
      name: 'Kristin Cooper',
      department: 'Development',
      tasksCompleted: 92,
      tasksTarget: 100,
      completionRate: 92,
    },
    {
      name: 'Tanya Hill',
      department: 'Operations',
      tasksCompleted: 76,
      tasksTarget: 85,
      completionRate: 89,
    },
    {
      name: 'Ahmed Youssef',
      department: 'Sales Lead',
      tasksCompleted: 64,
      tasksTarget: 80,
      completionRate: 80,
    },
    {
      name: 'Sara Cruz',
      department: 'Marketing',
      tasksCompleted: 42,
      tasksTarget: 60,
      completionRate: 70,
    },
  ];

  return (
    <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Productivity Index
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Monthly Task Completion & Target Progress
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of assigned targets vs verified task submissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-sans">
            <TrendingUp className="w-3.5 h-3.5" />
            87.4% Avg Completion
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sampleAnalytics.map((emp) => (
          <div
            key={emp.name}
            className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5 hover:bg-blue-50/20 hover:border-blue-200 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center font-sans">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{emp.name}</span>
                  <span className="text-[10px] text-slate-400">{emp.department}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold font-sans text-slate-800">
                  {emp.completionRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-sans block">
                  {emp.tasksCompleted}/{emp.tasksTarget} tasks
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  emp.completionRate >= 90
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    : emp.completionRate >= 80
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
                style={{ width: `${emp.completionRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
