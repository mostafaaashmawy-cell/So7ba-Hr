'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Target } from 'lucide-react';

interface WelcomeHeaderProps {
  fullName: string;
  kpiUnit: string;
}

export default function WelcomeHeader({ fullName, kpiUnit }: WelcomeHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 cleariq-card p-6 cleariq-card-hover">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Employee Workspace
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          {t('welcome')},{' '}
          <span className="text-blue-600 font-extrabold">{fullName || 'Employee'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">{t('portal')}</p>
      </div>

      <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-sans">
        <Target className="w-4 h-4 text-blue-600" />
        <span className="text-slate-500 font-medium">{t('assignedMetric')}:</span>
        <span className="font-bold text-slate-900 capitalize font-sans">{kpiUnit || 'tasks'}</span>
      </div>
    </div>
  );
}
