import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  Target,
  FileSpreadsheet,
  Briefcase,
  FileText,
  TrendingUp,
  Star,
  MapPin,
  Sliders,
  DollarSign,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  ToggleLeft,
  UserCheck,
  FileBadge,
  Wallet,
  Receipt,
} from 'lucide-react';
import type { ElementType } from 'react';
import { TenantSettings } from '@/lib/types/database';

export interface NavSubItem {
  titleEn: string;
  titleAr: string;
  href: string;
  icon: ElementType;
  roles?: string[];
  featureToggle?: keyof TenantSettings | string;
}

export interface NavSection {
  id: string;
  titleEn: string;
  titleAr: string;
  icon: ElementType;
  href?: string;
  roles?: string[];
  featureToggle?: keyof TenantSettings | string;
  subItems?: NavSubItem[];
}

// Predictable, static, non-duplicating sidebar structure with feature toggle bindings
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboards',
    titleEn: 'Command Hubs',
    titleAr: 'مراكز القيادة',
    icon: LayoutDashboard,
    subItems: [
      {
        titleEn: 'Executive Overview',
        titleAr: 'نظرة تنفيذية عامة',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Team Overview',
        titleAr: 'لوحة تحكم الفريق',
        href: '/dashboard/manager',
        icon: Users,
        roles: ['manager'],
      },
      {
        titleEn: 'My Workspace',
        titleAr: 'مساحة العمل',
        href: '/dashboard/employee',
        icon: UserCheck,
        roles: ['employee'],
      },
    ],
  },
  {
    id: 'company',
    titleEn: 'Company & Policies',
    titleAr: 'سياسات وإعدادات الشركة',
    icon: Building2,
    href: '/dashboard/settings',
    roles: ['super_admin'],
    subItems: [],
  },
  {
    id: 'operations',
    titleEn: 'Employees & Operations',
    titleAr: 'الموظفين والعمليات',
    icon: Users,
    subItems: [
      {
        titleEn: 'Employee Directory',
        titleAr: 'سجل وإدارة الموظفين',
        href: '/dashboard/employees',
        icon: Users,
        roles: ['super_admin', 'manager'],
      },
      {
        titleEn: 'Contract Builder & PDF',
        titleAr: 'صانع ومحرر العقود',
        href: '/dashboard/contracts',
        icon: FileText,
      },
      {
        titleEn: 'System Audit Logs',
        titleAr: 'سجل العمليات والرقابة',
        href: '/dashboard/audit-logs',
        icon: ShieldAlert,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Holiday Compensation',
        titleAr: 'تعويضات العمل بالعطلات',
        href: '/dashboard/manager#holiday-compensation',
        icon: Calendar,
        roles: ['manager', 'super_admin'],
        featureToggle: 'enable_holiday_work_comp',
      },
    ],
  },
  {
    id: 'performance',
    titleEn: 'Performance & Sales',
    titleAr: 'الأداء والتقييم والمبيعات',
    icon: Target,
    subItems: [
      {
        titleEn: 'Targets Board',
        titleAr: 'لوحة متابعة الأهداف',
        href: '/dashboard/targets',
        icon: Target,
      },
      {
        titleEn: 'Monthly Reviews',
        titleAr: 'تقييمات الأداء الشهرية',
        href: '/dashboard/evaluations',
        icon: Star,
      },
      {
        titleEn: 'Sales & Commissions',
        titleAr: 'سجل المبيعات والعمولات',
        href: '/dashboard/sales',
        icon: TrendingUp,
        featureToggle: 'enable_commissions',
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
        titleEn: 'Payroll Engine',
        titleAr: 'محرك حساب الرواتب',
        href: '/dashboard/payroll',
        icon: DollarSign,
        roles: ['super_admin', 'manager'],
      },
      {
        titleEn: 'Advances Tracker',
        titleAr: 'متابعة السلف المالية',
        href: '/dashboard/payroll#advances',
        icon: Wallet,
        roles: ['super_admin', 'manager'],
        featureToggle: 'enable_advances',
      },
      {
        titleEn: 'Payslip Generator',
        titleAr: 'مولد مفردات المرتبات',
        href: '/dashboard/payslips',
        icon: Receipt,
        roles: ['super_admin'],
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
        titleEn: 'Check-In & Timers',
        titleAr: 'تسجيل الدخول ومؤقت الدوام',
        href: '/dashboard/employee#checkin-section',
        icon: Clock,
      },
      {
        titleEn: 'My Leaves & Requests',
        titleAr: 'إجازاتي وطلباتي',
        href: '/dashboard/employee#leaves-section',
        icon: Calendar,
      },
      {
        titleEn: 'My Assigned Targets',
        titleAr: 'أهدافي المسندة',
        href: '/dashboard/targets',
        icon: Target,
      },
      {
        titleEn: 'My Payslips',
        titleAr: 'مفردات راتبي',
        href: '/dashboard/payslips',
        icon: FileBadge,
      },
    ],
  },
];

// Mobile pinned core 3 anchors
export const MOBILE_CORE_ANCHORS = [
  { id: 'workspace', titleEn: 'Workspace', titleAr: 'مساحتي', href: '/dashboard/employee', icon: Briefcase },
  { id: 'team', titleEn: 'Team View', titleAr: 'الفريق', href: '/dashboard/manager', icon: Users, roles: ['manager', 'super_admin'] },
  { id: 'admin', titleEn: 'Super Admin', titleAr: 'المشرف', href: '/dashboard/admin', icon: ShieldCheck, roles: ['super_admin'] },
];
