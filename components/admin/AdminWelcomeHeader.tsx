'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function AdminWelcomeHeader() {
  const { t } = useLanguage();

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Executive Command Center
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          {t('adminControl')}
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">{t('adminDesc')}</p>
      </div>

      <div className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider font-sans flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        {t('fullWrite')}
      </div>
    </div>
  );
}
