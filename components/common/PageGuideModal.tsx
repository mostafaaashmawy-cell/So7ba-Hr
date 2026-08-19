'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  HelpCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface GuideSection {
  titleEn: string;
  titleAr: string;
  icon: string;
  items: {
    headingEn: string;
    headingAr: string;
    descEn: string;
    descAr: string;
  }[];
}

const GUIDES_BY_ROUTE: Record<string, GuideSection> = {
  '/dashboard/admin': {
    titleEn: 'Super Admin Executive Dashboard',
    titleAr: 'دليل لوحة تحكم المشرف العام',
    icon: '👑',
    items: [
      {
        headingEn: 'Top Stat Cards with Radial Gauges',
        headingAr: 'كروت المؤشرات الدائرية التفاعلية',
        descEn: 'Displays live headcount, active check-in presence, average performance rating, and total payroll estimate.',
        descAr: 'تعرض عدد الموظفين الإجمالي، نسبة الحضور اليومي الفعلي، مؤشر تقييم الأداء العام، وتقدير الرواتب الشهري.',
      },
      {
        headingEn: 'Salary & Unit Analytics Chart',
        headingAr: 'رسم بياني لتوزيع الرواتب والعمليات',
        descEn: 'Shows monthly dual-tone pill bar analytics comparing Operations vs Sales expenditures.',
        descAr: 'يعرض مقارنة شهرية تفاعلية بين مصروفات العمليات والمبيعات.',
      },
      {
        headingEn: 'Department Distribution & Retention Rings',
        headingAr: 'حلقات الهيكل الوظيفي وتوزيع الأقسام',
        descEn: 'Breakdown of staff allocation across departments and full-time vs part-time contracts.',
        descAr: 'توزيع القوى العاملة على الأقسام المختلفة ونسب العقود بدوام كامل وجزئي.',
      },
      {
        headingEn: 'Employee Registry & Schedule Override',
        headingAr: 'سجل الموظفين وتخصيص ساعات العمل',
        descEn: 'Manage all profiles, edit basic salaries, KPIs, and configure custom individual shift hours.',
        descAr: 'إدارة الموظفين والرواتب، وتخصيص مواعيد عمل وأيام دوام خاصة لموظف محدد.',
      },
    ],
  },
  '/dashboard/employee': {
    titleEn: 'Employee Self-Service Workspace',
    titleAr: 'دليل مساحة عمل الموظف اليومية',
    icon: '💼',
    items: [
      {
        headingEn: 'Multi-Branch Geofenced Check-In',
        headingAr: 'تسجيل الحضور بالبصمة الجغرافية',
        descEn: 'Press Check-In to record attendance. The system verifies your GPS location against approved company branch radiuses.',
        descAr: 'اضغط لتسجيل الحضور مع التحقق التلقائي من تواجدك الجغرافي داخل نطاق أحد فروع العمل المعتمدة.',
      },
      {
        headingEn: 'Leaves & Hourly Permission Requests',
        headingAr: 'طلب الإجازات والأذونات الساعية',
        descEn: 'Submit daily leaves (deducted from 21-day annual balance + holiday compensations) or morning/evening excuses.',
        descAr: 'تقديم طلبات الإجازات السنوية (21 يوماً + رصيد العمل بالعطلات) أو الأذونات الصباحية والمسائية.',
      },
      {
        headingEn: 'Salary Advance Engine',
        headingAr: 'محرك طلب السلف المالية على الراتب',
        descEn: 'Request monthly salary advances up to the company ceiling (e.g. 50%) if the monthly eligibility date is reached.',
        descAr: 'طلب سلفة مالية شهرية بحد أقصى محدد من الراتب الأساسي فور حلول يوم الاستحقاق المعتمد.',
      },
      {
        headingEn: 'KPI & Tasks Logging',
        headingAr: 'تسجيل إنجازات وتقارير المهام اليومية',
        descEn: 'Log daily units (tasks, calls, deals) to build up your productivity and performance index.',
        descAr: 'تسجيل عدد وحدات الإنجاز اليومية لمتابعة الإنتاجية وتقييم الأداء.',
      },
    ],
  },
  '/dashboard/manager': {
    titleEn: 'Manager Team Overview & Holiday Approvals',
    titleAr: 'دليل مدير الفريق واعتمادات العطلات',
    icon: '👥',
    items: [
      {
        headingEn: 'Team Attendance & Leaves Summary',
        headingAr: 'متابعة حضور وإجازات الفريق المباشر',
        descEn: 'Real-time overview of direct subordinates, today check-ins, remaining leaves balance, and KPI entries.',
        descAr: 'عرض شامل ومباشر لجميع الموظفين التابعين لك، مواعيد حضورهم، وأرصدة إجازاتهم.',
      },
      {
        headingEn: 'Holiday Work Compensation Form',
        headingAr: 'تسجيل تعويضات العمل في أيام العطلات',
        descEn: 'Grant extra leave balances to team members who worked during official weekends or holidays.',
        descAr: 'إضافة أيام إجازة تعويضية للموظفين الذين عملوا خلال الإجازات والعطلات الرسمية.',
      },
    ],
  },
  '/dashboard/targets': {
    titleEn: 'Target & Tasks Board Guide',
    titleAr: 'دليل لوحة الأهداف والمهام التشغيلية',
    icon: '🎯',
    items: [
      {
        headingEn: 'Daily vs Monthly/Quarterly Targets',
        headingAr: 'الأهداف اليومية والشهرية والربع سنوية',
        descEn: 'When Daily target is selected, a single Day Picker is used. For longer periods, start and end dates are specified.',
        descAr: 'عند اختيار هدف يومي يظهر محدد تاريخ ليوم واحد، بينما للأهداف الأطول يتم تحديد تاريخ البداية والنهاية.',
      },
      {
        headingEn: 'KPI Units Selection',
        headingAr: 'اختيار وحدة قياس الهدف (KPI Unit)',
        descEn: 'Select from pre-configured company KPI units dropdown (e.g. Tasks, Calls, Deals, Visits).',
        descAr: 'اختر وحدة قياس الهدف من القائمة المعتمدة في الشركة (مهام، مكالمات، مبيعات، زيارات).',
      },
      {
        headingEn: 'Progress Progress & Goal Completion',
        headingAr: 'تحديث نسبة إنجاز الهدف',
        descEn: 'Track achieved volume vs target goal with interactive progress bars and status tags.',
        descAr: 'متابعة حجم الإنجاز الفعلي مقابل المطلوب مع شريط تقدم ونسب إنجاز ملونة.',
      },
    ],
  },
  '/dashboard/sales': {
    titleEn: 'Sales & Commissions Portal Guide',
    titleAr: 'دليل بوابة المبيعات والعمولات',
    icon: '📈',
    items: [
      {
        headingEn: 'Logging Client Deals',
        headingAr: 'تسجيل عمليات البيع والعقود',
        descEn: 'Submit client sales values. The system automatically computes commission percentages.',
        descAr: 'إدخال قيمة مبيعات العملاء ليقوم النظام باحتساب نسبة العمولة المستحقة تلقائياً.',
      },
      {
        headingEn: 'Manager & Super Admin Verification',
        headingAr: 'اعتماد ومراجعة صفقات الفريق',
        descEn: 'Managers review deals for direct team members; Super Admins authorize payouts for monthly payroll.',
        descAr: 'يقوم المدير بمراجعة عمليات فريقه، والمشرف العام باعتمادها لتضاف إلى مسير الرواتب.',
      },
    ],
  },
  '/dashboard/payroll': {
    titleEn: 'Payroll Engine & Payslips Guide',
    titleAr: 'دليل محرك الرواتب والمسيرات الشهرية',
    icon: '💵',
    items: [
      {
        headingEn: 'Smart Lateness Deduction Engine',
        headingAr: 'محرك خصومات التأخير الذكي',
        descEn: 'Evaluates employee shifts, grace period, and applies Tiered intervals or Exact Minute % rates.',
        descAr: 'يحسب التأخيرات بناءً على وردية الموظف وفترة السماح بنظام الشرائح أو النسبة بالدقيقة.',
      },
      {
        headingEn: 'Approved Advances & Insurance',
        headingAr: 'استقطاعات السلف والتأمينات الاجتماعية',
        descEn: 'Automatically deducts approved monthly advances, social insurance, and health insurance from net pay.',
        descAr: 'خصم السلف المعتمدة وحصص التأمينات الاجتماعية والصحية تلقائياً من صافي المستحق.',
      },
      {
        headingEn: 'Payslip Compilation & PDF Export',
        headingAr: 'إصدار وطباعة مفردات المرتب (Payslip)',
        descEn: 'Compile complete financial statements for any employee and export printable official payslips.',
        descAr: 'تجميع كشف الحساب المالي الكامل وتصديره كقسيمة راتب رسمية جاهزة للطباعة.',
      },
    ],
  },
  '/dashboard/evaluations': {
    titleEn: 'Performance Evaluations & Hierarchy Guide',
    titleAr: 'دليل تقييمات الأداء وسجل المراجعات',
    icon: '⭐',
    items: [
      {
        headingEn: '4-Criteria Star Rating',
        headingAr: 'التقييم الرباعي بالنجوم',
        descEn: 'Rate Punctuality, Quality, Problem Solving, and Communication (1 to 5 stars).',
        descAr: 'تقييم الالتزام بالمواعيد، جودة العمل، حل المشكلات، والتواصل الفعال من 1 إلى 5 نجوم.',
      },
      {
        headingEn: 'Hierarchy & Subordinate Scoping',
        headingAr: 'صلاحيات وتقييم التابعين المباشرين',
        descEn: 'Managers evaluate direct subordinates only. Super Admins have full company-wide visibility.',
        descAr: 'المدير يقيم أعضاء فريقه المباشر فقط، بينما المشرف العام يمكنه تقييم ومراجعة جميع الموظفين.',
      },
      {
        headingEn: 'Comprehensive Historical Evaluation Log',
        headingAr: 'جدول سجل التقييمات التاريخي المفصل',
        descEn: 'Filterable table recording reviewer name, scores breakdown, and manager feedback notes.',
        descAr: 'جدول مفصل بأسماء المقيّمين، تفاصيل الدرجات، وملاحظات التقييم مع فلتر البحث بالاسم والشهر.',
      },
    ],
  },
  '/dashboard/settings': {
    titleEn: 'Company Policies & Settings Hub Guide',
    titleAr: 'دليل سياسات وإعدادات الشركة',
    icon: '⚙️',
    items: [
      {
        headingEn: 'Multi-Branch Geofencing',
        headingAr: 'إدارة فروع الشركة والبصمة الجغرافية',
        descEn: 'Configure GPS coordinates and attendance accuracy radiuses for all company locations.',
        descAr: 'تحديد الإحداثيات الجغرافية ونطاقات السماح بالمتر لجميع فروع ومقرات العمل.',
      },
      {
        headingEn: 'Lateness & Advance Rules',
        headingAr: 'قواعد التأخير والسلف المالية',
        descEn: 'Set grace period minutes, deduction formulas, advance ceiling percentages, and eligibility days.',
        descAr: 'ضبط دقائق السماح، شرائح الخصم، الحد الأقصى لنسبة السلفة، ويوم فتح الطلبات.',
      },
      {
        headingEn: 'Setup Wizard Re-trigger',
        headingAr: 'إعادة تشغيل معالج الإعداد الأولي',
        descEn: 'Allows Super Admin to re-run the 5-step onboarding wizard to adjust company presets at any time.',
        descAr: 'يتيح للمشرف العام إعادة تشغيل معالج الإعداد المكون من 5 خطوات لتعديل الإعدادات الأساسية.',
      },
    ],
  },
};

export default function PageGuideModal() {
  const pathname = usePathname();
  const { isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Match current route or default fallback
  const guide =
    GUIDES_BY_ROUTE[pathname] ||
    GUIDES_BY_ROUTE['/dashboard/admin'] || {
      titleEn: 'HumAi System Guide',
      titleAr: 'دليل نظام HumAi الذكي',
      icon: '💡',
      items: [],
    };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        title="Interactive Page Guide"
      >
        <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-500" />
        <span className="hidden sm:inline">
          {isRtl ? 'دليل الصفحة' : 'Page Guide'}
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[88vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-xl">
                  {guide.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      Interactive Help
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {isRtl ? guide.titleAr : guide.titleEn}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide Explanations Cards */}
            <div className="space-y-3">
              {guide.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-500/10 transition-all space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-500 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isRtl ? item.headingAr : item.headingEn}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                    {isRtl ? item.descAr : item.descEn}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-sans">
                HumAi Smart HR Engine • 2026
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
              >
                {isRtl ? 'فهمت، إغلاق الدليل' : 'Got it, Close Guide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
