'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  Target,
  FileSpreadsheet,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  FileText,
  TrendingUp,
  Star,
  MapPin,
  Sparkles,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
} from 'lucide-react';
import { UserProfile } from '@/lib/types/database';
import { useLanguage } from '@/lib/context/LanguageContext';

interface AppSidebarProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  titleEn: string;
  titleAr: string;
  icon: React.ElementType;
  href?: string;
  roles?: string[];
  subItems?: {
    titleEn: string;
    titleAr: string;
    href: string;
    icon?: React.ElementType;
  }[];
}

export default function AppSidebar({ user, isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { isRtl } = useLanguage();

  const isSuperAdmin = user?.role === 'super_admin';
  const isManager = user?.role === 'manager' || isSuperAdmin;

  // Track expanded accordion sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: true,
    company: true,
    employees: true,
    attendance: false,
    performance: true,
    payroll: false,
    workspace: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      titleEn: 'Dashboard / Home',
      titleAr: 'الرئيسية والمؤشرات',
      icon: LayoutDashboard,
      subItems: [
        {
          titleEn: isSuperAdmin ? 'Admin Overview' : isManager ? 'Team Dashboard' : 'My Overview',
          titleAr: isSuperAdmin ? 'لوحة تحكم المشرف' : isManager ? 'لوحة تحكم الفريق' : 'نظرة عامة',
          href: isSuperAdmin
            ? '/dashboard/admin'
            : isManager
            ? '/dashboard/manager'
            : '/dashboard/employee',
          icon: LayoutDashboard,
        },
        {
          titleEn: 'Operational Targets',
          titleAr: 'لوحة الأهداف التشغيلية',
          href: '/dashboard/targets',
          icon: Target,
        },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            id: 'company',
            titleEn: 'Company & Settings',
            titleAr: 'إعدادات وسياسات الشركة',
            icon: Building2,
            roles: ['super_admin'],
            subItems: [
              {
                titleEn: 'Policies & Settings Hub',
                titleAr: 'مركز السياسات والإعدادات',
                href: '/dashboard/settings',
                icon: Sliders,
              },
              {
                titleEn: 'Setup Wizard Re-run',
                titleAr: 'معالج الإعداد الأولي',
                href: '/onboarding',
                icon: Sparkles,
              },
            ],
          },
        ]
      : []),
    {
      id: 'employees',
      titleEn: 'Employees & Contracts',
      titleAr: 'الموظفين والعقود',
      icon: Users,
      subItems: [
        ...(isSuperAdmin
          ? [
              {
                titleEn: 'Employee Directory',
                titleAr: 'سجل وإدارة الموظفين',
                href: '/dashboard/admin',
                icon: Users,
              },
            ]
          : []),
        {
          titleEn: 'Contract Master & PDF',
          titleAr: 'صانع ومحرر العقود',
          href: '/dashboard/contracts',
          icon: FileText,
        },
      ],
    },
    {
      id: 'attendance',
      titleEn: 'Attendance & Operations',
      titleAr: 'الحضور والعمليات',
      icon: Clock,
      subItems: [
        {
          titleEn: 'Daily Check-In & Geo',
          titleAr: 'تسجيل الحضور والبصمة',
          href: '/dashboard/employee',
          icon: MapPin,
        },
        {
          titleEn: 'Leaves & Permissions',
          titleAr: 'الإجازات والأذونات الساعية',
          href: '/dashboard/employee',
          icon: Calendar,
        },
        ...(isManager
          ? [
              {
                titleEn: 'Holiday Work Comp',
                titleAr: 'تعويضات العمل بالعطلات',
                href: '/dashboard/manager',
                icon: Clock,
              },
            ]
          : []),
      ],
    },
    {
      id: 'performance',
      titleEn: 'Performance & Sales',
      titleAr: 'الأداء والتقييم والمبيعات',
      icon: Target,
      subItems: [
        {
          titleEn: 'Target & Tasks Board',
          titleAr: 'لوحة متابعة الأهداف',
          href: '/dashboard/targets',
          icon: Target,
        },
        {
          titleEn: 'Performance Reviews',
          titleAr: 'تقييمات الأداء وسجل الدرجات',
          href: '/dashboard/evaluations',
          icon: Star,
        },
        {
          titleEn: 'Sales & Commissions',
          titleAr: 'سجل المبيعات والعمولات',
          href: '/dashboard/sales',
          icon: TrendingUp,
        },
      ],
    },
    {
      id: 'payroll',
      titleEn: 'Payroll & Financials',
      titleAr: 'الرواتب والمسيرات المالية',
      icon: FileSpreadsheet,
      subItems: [
        {
          titleEn: 'Monthly Payroll Engine',
          titleAr: 'محرك حساب الرواتب',
          href: '/dashboard/payroll',
          icon: DollarSign,
        },
        {
          titleEn: 'Salary Advance Engine',
          titleAr: 'طلبات السلف المالية',
          href: '/dashboard/employee',
          icon: Briefcase,
        },
      ],
    },
    {
      id: 'workspace',
      titleEn: 'My Workspace',
      titleAr: 'مساحة عملي المباشرة',
      icon: Briefcase,
      subItems: [
        {
          titleEn: 'Attendance & Timers',
          titleAr: 'تسجيل الدخول ومؤقت الدوام',
          href: '/dashboard/employee',
          icon: Clock,
        },
        {
          titleEn: 'My Leaves & Requests',
          titleAr: 'طلبات الإجازات والسلف',
          href: '/dashboard/employee',
          icon: Calendar,
        },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 ${
          isRtl ? 'right-0' : 'left-0'
        } z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out shadow-xs ${
          isOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-xl shadow-sm shadow-blue-500/25">
              H
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                HumAi
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-sans">
                  SaaS
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Smart Operations
              </div>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-xs font-sans pr-2">
          {menuItems.map((section) => {
            const isExpanded = expandedSections[section.id];
            const SectionIcon = section.icon;

            return (
              <div key={section.id} className="space-y-1">
                {/* Section Header Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <SectionIcon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{isRtl ? section.titleAr : section.titleEn}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Sub-Items List */}
                {isExpanded && section.subItems && (
                  <div className="space-y-0.5 pl-6 pr-2 py-0.5 border-l-2 border-slate-100 ml-4">
                    {section.subItems.map((sub) => {
                      const SubIcon = sub.icon || Layers;
                      const isActive = pathname === sub.href;

                      return (
                        <Link
                          key={sub.titleEn + sub.href}
                          href={sub.href}
                          onClick={() => {
                            if (onClose && window.innerWidth < 1024) onClose();
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {isRtl ? sub.titleAr : sub.titleEn}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Card at Bottom of Sidebar */}
        {user && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user.full_name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                  {user.job_title || user.role}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
