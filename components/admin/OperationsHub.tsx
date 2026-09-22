'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  Wand2,
  DollarSign,
  FileText,
  TrendingUp,
  Star,
  Target,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

interface OperationsHubProps {
  enableAdvances?: boolean;
  enableCommissions?: boolean;
}

export default function OperationsHub({
  enableAdvances = true,
  enableCommissions = true,
}: OperationsHubProps) {
  const { isRtl } = useLanguage();

  return (
    <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
            {isRtl ? 'مركز عمليات وإدارة HumAi' : 'HumAi Operations Hub'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isRtl
              ? 'الشبكة المركزية لإدارة مسارات العمل والسياسات والحوكمة الإدارية'
              : 'Central command grid for enterprise workflows, policies, and system governance'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Setup Wizard */}
        <Link
          href="/onboarding"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Wand2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            {isRtl ? 'معالج الإعداد' : 'Setup Wizard'}
          </span>
          <span className="text-[10px] text-slate-400 block truncate">
            {isRtl ? 'الإعدادات والفروع' : 'Toggles & Branches'}
          </span>
        </Link>

        {/* 2. Payroll Engine */}
        {enableAdvances && (
          <Link
            href="/dashboard/payroll"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              {isRtl ? 'محرك الرواتب' : 'Payroll Engine'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {isRtl ? 'كشوف المرتبات والسلف' : 'Payslips & Advances'}
            </span>
          </Link>
        )}

        {/* 3. Contract Builder */}
        <Link
          href="/dashboard/contracts"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            {isRtl ? 'صانع العقود' : 'Contract Builder'}
          </span>
          <span className="text-[10px] text-slate-400 block truncate">
            {isRtl ? 'العقود والاتفاقيات' : 'Agreements & PDF'}
          </span>
        </Link>

        {/* 4. Sales & Payouts */}
        {enableCommissions && (
          <Link
            href="/dashboard/sales"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              {isRtl ? 'المبيعات والعمولات' : 'Sales & Payouts'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {isRtl ? 'سجل إنجازات البيع' : 'Commissions Log'}
            </span>
          </Link>
        )}

        {/* 5. Evaluations */}
        <Link
          href="/dashboard/evaluations"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Star className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            {isRtl ? 'التقييمات' : 'Evaluations'}
          </span>
          <span className="text-[10px] text-slate-400 block truncate">
            {isRtl ? 'المراجعات والدرجات' : 'Reviews & Ratings'}
          </span>
        </Link>

        {/* 6. Targets Board */}
        <Link
          href="/dashboard/targets"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            {isRtl ? 'لوحة الأهداف' : 'Targets Board'}
          </span>
          <span className="text-[10px] text-slate-400 block truncate">
            {isRtl ? 'مؤشرات الأداء والأهداف' : 'KPIs & Goals'}
          </span>
        </Link>

        {/* 7. Company Policies */}
        <Link
          href="/dashboard/settings"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Sliders className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            {isRtl ? 'سياسات الشركة' : 'Company Policies'}
          </span>
          <span className="text-[10px] text-slate-400 block truncate">
            {isRtl ? 'المواعيد والموقع والخصومات' : 'Hours, GPS & Overtime'}
          </span>
        </Link>

        {/* 8. System Audit Logs */}
        <Link
          href="/dashboard/audit-logs"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            {isRtl ? 'سجل العمليات' : 'Audit Trail'}
          </span>
          <span className="text-[10px] text-slate-400 block truncate">
            {isRtl ? 'الأمان وتعديلات النظام' : 'Security & Overrides'}
          </span>
        </Link>
      </div>
    </div>
  );
}
