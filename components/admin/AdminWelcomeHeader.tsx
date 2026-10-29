'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTenantSettings } from '@/lib/context/SettingsContext';
import { ShieldCheck, Building2 } from 'lucide-react';

interface AdminWelcomeHeaderProps {
  adminName?: string;
  companyName?: string;
}

export default function AdminWelcomeHeader({ adminName, companyName }: AdminWelcomeHeaderProps) {
  const { t, isRtl } = useLanguage();
  const { companyName: contextCompanyName } = useTenantSettings();
  const displayCompanyName = companyName || contextCompanyName || '';

  return (
    <div className="cleariq-card p-6 cleariq-card-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {isRtl ? 'مركز القيادة والتحكم الإداري' : 'Executive Command Center'}
          </span>
          {displayCompanyName && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-sans">
              <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {displayCompanyName}
            </span>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
          {adminName ? (
            <>
              {isRtl ? 'مرحباً، ' : 'Welcome, '}
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{adminName}</span>
            </>
          ) : (
            t('adminControl')
          )}
        </h1>
        {displayCompanyName ? (
          <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">{displayCompanyName}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-400 dark:text-slate-400 font-normal">{t('adminDesc')}</span>
          </div>
        ) : (
          <p className="text-xs text-slate-400 mt-1 font-sans">{t('adminDesc')}</p>
        )}
      </div>

      <div className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider font-sans flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        {t('fullWrite')}
      </div>
    </div>
  );
}
