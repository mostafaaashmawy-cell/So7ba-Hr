'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function ManagerActionCards() {
  const { isRtl } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Link
        href="/dashboard/evaluations"
        className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400">
            <span className="text-xl">⭐</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isRtl ? 'تقييمات الأداء الشهرية' : 'Monthly Evaluations'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isRtl ? 'تقييم ومراجعة أداء أفراد الفريق' : 'Rate and review team performance'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
          {isRtl ? '←' : '→'}
        </span>
      </Link>

      <Link
        href="/dashboard/sales"
        className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
            <span className="text-xl">📈</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isRtl ? 'إنجازات المبيعات' : 'Sales Logging'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isRtl ? 'اعتماد مبيعات وعمولات الفريق' : 'Approve client sales & commissions'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
          {isRtl ? '←' : '→'}
        </span>
      </Link>

      <Link
        href="/dashboard/targets"
        className="cleariq-card p-5 cleariq-card-hover flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isRtl ? 'لوحة المستهدفات' : 'Targets Board'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isRtl ? 'تحديد ومتابعة إنجاز الأهداف' : 'Set and validate goals achievements'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
          {isRtl ? '←' : '→'}
        </span>
      </Link>
    </div>
  );
}
