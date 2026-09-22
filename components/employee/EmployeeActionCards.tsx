'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';

interface EmployeeActionCardsProps {
  enableCommissions?: boolean;
}

export default function EmployeeActionCards({
  enableCommissions = true,
}: EmployeeActionCardsProps) {
  const { isRtl } = useLanguage();

  return (
    <>
      {enableCommissions && (
        <Link
          href="/dashboard/sales"
          className="cleariq-card p-5 cleariq-card-hover flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isRtl ? 'تسجيل إنجازات المبيعات' : 'Log Sales Achievements'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isRtl ? 'تسجيل العمليات لاحتساب العمولات' : 'Submit logs to earn commissions'}
              </p>
            </div>
          </div>
          <span className="py-2 px-3 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold transition-all text-center">
            {isRtl ? 'فتح بوابة المبيعات' : 'Open Sales Portal'}
          </span>
        </Link>
      )}

      <Link
        href="/dashboard/targets"
        className="cleariq-card p-5 cleariq-card-hover flex flex-col justify-between space-y-4 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isRtl ? 'المستهدفات التشغيلية' : 'Operational Targets'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isRtl ? 'متابعة الأهداف ونسب الإنجاز' : 'View goals vs actual progress'}
            </p>
          </div>
        </div>
        <span className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 group-hover:bg-purple-600 group-hover:text-white text-purple-700 dark:text-purple-300 text-xs font-bold transition-all text-center">
          {isRtl ? 'عرض مستهدفاتي' : 'View My Targets'}
        </span>
      </Link>
    </>
  );
}
