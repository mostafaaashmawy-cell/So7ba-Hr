'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { ShieldCheck } from 'lucide-react';

export default function AdminWelcomeHeader() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {isRtl ? 'مركز القيادة والتحكم الإداري' : 'Executive Command Center'}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
          {t('adminControl')}
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">{t('adminDesc')}</p>
      </div>

      <div className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-blue-700 border border-emerald-200 uppercase tracking-wider font-sans flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        {t('fullWrite')}
      </div>
    </div>
  );
}
