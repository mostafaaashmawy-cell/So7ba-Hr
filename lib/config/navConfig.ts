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
  CheckSquare,
  ArrowLeftRight,
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

// 5-Domain Enterprise Navigation Architecture
export const NAV_SECTIONS: NavSection[] = [
  // ① Workspace (Role-Scoped Default Landing)
  {
    id: 'workspace',
    titleEn: 'My Workspace',
    titleAr: 'مساحة العمل',
    icon: Briefcase,
    subItems: [
      {
        titleEn: 'My Dashboard',
        titleAr: 'لوحة عملي المباشرة',
        href: '/dashboard/employee',
        icon: UserCheck,
      },
      {
        titleEn: 'Check-In & Timers',
        titleAr: 'تسجيل الحضور ومؤقت الدوام',
        href: '/dashboard/employee#checkin-section',
        icon: Clock,
      },
      {
        titleEn: 'My Leaves & Requests',
        titleAr: 'إجازاتي واستئذاناتي',
        href: '/dashboard/employee#leaves-section',
        icon: Calendar,
      },
      {
        titleEn: 'My Payslips',
        titleAr: 'مفردات راتبي الرسمية',
        href: '/dashboard/payslips',
        icon: Receipt,
      },
      {
        titleEn: 'Operational Targets',
        titleAr: 'أهدافي التشغيلية',
        href: '/dashboard/targets',
        icon: Target,
      },
    ],
  },

  // ② People & Organization [super_admin / manager]
  {
    id: 'people',
    titleEn: 'People & Organization',
    titleAr: 'الأفراد والهيكل الإداري',
    icon: Users,
    roles: ['super_admin', 'manager'],
    subItems: [
      {
        titleEn: 'Employee Directory',
        titleAr: 'دليل وإدارة الموظفين',
        href: '/dashboard/employees',
        icon: Users,
        roles: ['super_admin', 'manager'],
      },
      {
        titleEn: 'Departments & Org',
        titleAr: 'الأقسام والهيكل الإداري',
        href: '/dashboard/departments',
        icon: Building2,
        roles: ['super_admin', 'manager'],
      },
      {
        titleEn: 'Contract Builder & PDF',
        titleAr: 'صانع ومحرر العقود الرسمية',
        href: '/dashboard/contracts',
        icon: FileText,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Shift Management',
        titleAr: 'إدارة الورديات وجداول الدوام',
        href: '/dashboard/shifts',
        icon: ArrowLeftRight,
        roles: ['super_admin', 'manager'],
        featureToggle: 'enable_shifts',
      },
    ],
  },

  // ③ Time & Operations [toggle-gated]
  {
    id: 'operations',
    titleEn: 'Time & Operations',
    titleAr: 'الوقت والعمليات التشغيلية',
    icon: Clock,
    subItems: [
      {
        titleEn: 'Attendance Live Monitor',
        titleAr: 'شاشة الحضور والانصراف الحية',
        href: '/dashboard/attendance',
        icon: Clock,
        roles: ['super_admin', 'manager'],
      },
      {
        titleEn: 'Leave Approvals Ledger',
        titleAr: 'سجل واعتماد الإجازات',
        href: '/dashboard/leaves',
        icon: CheckSquare,
        roles: ['super_admin', 'manager'],
      },
      {
        titleEn: 'Holiday Work & Overtime',
        titleAr: 'تعويضات العطلات والعمل الإضافي',
        href: '/dashboard/manager#holiday-compensation',
        icon: Calendar,
        roles: ['manager', 'super_admin'],
        featureToggle: 'enable_holiday_work_comp',
      },
    ],
  },

  // ④ Payroll & Financials [super_admin / manager]
  {
    id: 'financials',
    titleEn: 'Payroll & Financials',
    titleAr: 'الرواتب والمسيرات المالية',
    icon: FileSpreadsheet,
    roles: ['super_admin', 'manager'],
    subItems: [
      {
        titleEn: 'Payroll Engine',
        titleAr: 'محرك حساب الرواتب',
        href: '/dashboard/payroll',
        icon: DollarSign,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Salary Advances Tracker',
        titleAr: 'متابعة واعتماد السلف',
        href: '/dashboard/payroll#advances',
        icon: Wallet,
        roles: ['super_admin', 'manager'],
        featureToggle: 'enable_advances',
      },
      {
        titleEn: 'Payslip Generator',
        titleAr: 'مولد قسائم المرتبات',
        href: '/dashboard/payslips',
        icon: Receipt,
        roles: ['super_admin'],
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

  // ⑤ Analytics & Admin Hub [super_admin / manager]
  {
    id: 'admin_hub',
    titleEn: 'Analytics & Governance',
    titleAr: 'التحليلات والحوكمة الإدارية',
    icon: ShieldCheck,
    roles: ['super_admin', 'manager'],
    subItems: [
      {
        titleEn: 'Executive Overview',
        titleAr: 'النظرة التنفيذية العامة',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Team Overview',
        titleAr: 'لوحة قيادة الفريق',
        href: '/dashboard/manager',
        icon: Users,
        roles: ['manager'],
      },
      {
        titleEn: 'Performance Reviews',
        titleAr: 'تقييمات الأداء الدورية',
        href: '/dashboard/evaluations',
        icon: Star,
        roles: ['super_admin', 'manager'],
      },
      {
        titleEn: 'System Audit Trail Logs',
        titleAr: 'سجل العمليات والرقابة الأمنية',
        href: '/dashboard/audit-logs',
        icon: ShieldAlert,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Company & Policies',
        titleAr: 'سياسات وإعدادات الشركة',
        href: '/dashboard/settings',
        icon: Sliders,
        roles: ['super_admin'],
      },
    ],
  },
];

// Mobile 5-Slot Thumb-Zone Items (Role Tailored)
export interface MobileNavItem {
  id: string;
  titleEn: string;
  titleAr: string;
  href: string;
  icon: ElementType;
}

export const MOBILE_NAV_BY_ROLE: Record<string, MobileNavItem[]> = {
  employee: [
    { id: 'workspace', titleEn: 'My Workspace', titleAr: 'مساحتي', href: '/dashboard/employee', icon: UserCheck },
    { id: 'checkin', titleEn: 'Check-In', titleAr: 'الحضور', href: '/dashboard/employee#checkin-section', icon: Clock },
    { id: 'leaves', titleEn: 'Leaves', titleAr: 'الإجازات', href: '/dashboard/employee#leaves-section', icon: Calendar },
    { id: 'payslip', titleEn: 'Payslips', titleAr: 'الراتب', href: '/dashboard/payslips', icon: Receipt },
  ],
  manager: [
    { id: 'workspace', titleEn: 'My Workspace', titleAr: 'مساحتي', href: '/dashboard/employee', icon: UserCheck },
    { id: 'team', titleEn: 'Team View', titleAr: 'فريق العمل', href: '/dashboard/manager', icon: Users },
    { id: 'approvals', titleEn: 'Approvals', titleAr: 'الاعتمادات', href: '/dashboard/leaves', icon: CheckSquare },
  ],
  super_admin: [
    { id: 'workspace', titleEn: 'My Workspace', titleAr: 'مساحتي', href: '/dashboard/employee', icon: UserCheck },
    { id: 'team', titleEn: 'Team View', titleAr: 'فريق العمل', href: '/dashboard/manager', icon: Users },
    { id: 'admin', titleEn: 'Super Admin', titleAr: 'لوحة الإدارة', href: '/dashboard/admin', icon: ShieldCheck },
  ],
};
