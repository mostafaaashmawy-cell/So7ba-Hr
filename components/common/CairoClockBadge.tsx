'use client';

import React from 'react';
import { Clock, Wifi } from 'lucide-react';
import { useCairoTime } from '@/lib/hooks/useCairoTime';

interface CairoClockBadgeProps {
  showDate?: boolean;
  compact?: boolean;
  className?: string;
}

export default function CairoClockBadge({
  showDate = false,
  compact = false,
  className = '',
}: CairoClockBadgeProps) {
  const { timeStr, dateStr, isSynced } = useCairoTime();

  if (compact) {
    return (
      <div
        title={isSynced ? 'متزامن مع توقيت القاهرة عبر الشبكة (Cairo Internet Time)' : 'جاري المزامنة...'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 font-sans shadow-xs ${className}`}
      >
        <span className="relative flex h-2 w-2">
          {isSynced && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isSynced ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          ></span>
        </span>
        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="tabular-nums tracking-wide">{timeStr}</span>
        <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">القاهرة</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 font-sans shadow-xs ${className}`}
    >
      <div className="p-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <Clock className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="tabular-nums tracking-wide text-sm font-extrabold text-slate-950 dark:text-white">
            {timeStr}
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Wifi className="w-2.5 h-2.5" />
            توقيت القاهرة
          </span>
        </div>
        {showDate && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
            {dateStr}
          </span>
        )}
      </div>
    </div>
  );
}
