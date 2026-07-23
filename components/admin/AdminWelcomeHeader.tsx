'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function AdminWelcomeHeader() {
  const { t } = useLanguage();

  return (
    <div className="glass-card p-6 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white font-sans">
          {t('adminControl')}
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-sans">
          {t('adminDesc')}
        </p>
      </div>

      <div className="px-3.5 py-1.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider font-sans">
        {t('fullWrite')}
      </div>
    </div>
  );
}
