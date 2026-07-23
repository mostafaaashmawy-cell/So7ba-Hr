'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface WelcomeHeaderProps {
  fullName: string;
  kpiUnit: string;
}

export default function WelcomeHeader({ fullName, kpiUnit }: WelcomeHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-gray-800">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white font-sans">
          {t('welcome')},{' '}
          <span className="gradient-text">{fullName || 'Employee'}</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-sans">
          {t('portal')}
        </p>
      </div>

      <div className="flex items-center gap-3 bg-gray-900/80 px-4 py-2 rounded-2xl border border-gray-800 text-xs font-sans">
        <span className="text-gray-400">{t('assignedMetric')}:</span>
        <span className="font-bold text-purple-300 capitalize">{kpiUnit || 'tasks'}</span>
      </div>
    </div>
  );
}
