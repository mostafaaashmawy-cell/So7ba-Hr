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
  Sparkles,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  ShieldCheck,
  Settings,
  ToggleLeft,
  UserCheck,
  FileBadge,
  Wallet,
  Receipt,
} from 'lucide-react';
import type { ElementType } from 'react';

export interface NavSubItem {
  titleEn: string;
  titleAr: string;
  href: string;
  icon: ElementType;
  roles?: string[];
}

export interface NavSection {
  id: string;
  titleEn: string;
  titleAr: string;
  icon: ElementType;
  roles?: string[];
  subItems: NavSubItem[];
}

// Returns the contextual sub-items to show when inside a given "domain"
// The active domain is derived from the current pathname
export function getActiveDomain(pathname: string): string {
  if (pathname.startsWith('/dashboard/settings') || pathname === '/onboarding') return 'company';
  if (
    pathname.startsWith('/dashboard/targets') ||
    pathname.startsWith('/dashboard/evaluations') ||
    pathname.startsWith('/dashboard/sales')
  )
    return 'performance';
  if (pathname.startsWith('/dashboard/payroll')) return 'payroll';
  if (pathname.startsWith('/dashboard/employee')) return 'workspace';
  if (
    pathname.startsWith('/dashboard/admin') ||
    pathname.startsWith('/dashboard/contracts') ||
    pathname.startsWith('/dashboard/manager')
  )
    return 'operations';
  return 'dashboard';
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboard',
    titleEn: 'Dashboard / Home',
    titleAr: 'الرئيسية والمؤشرات',
    icon: LayoutDashboard,
    subItems: [
      {
        titleEn: 'Executive Overview',
        titleAr: 'لوحة المؤشرات التنفيذية',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Team Dashboard',
        titleAr: 'لوحة تحكم الفريق',
        href: '/dashboard/manager',
        icon: Users,
        roles: ['manager'],
      },
      {
        titleEn: 'My Overview',
        titleAr: 'نظرة عامة',
        href: '/dashboard/employee',
        icon: UserCheck,
        roles: ['employee'],
      },
    ],
  },
  {
    id: 'company',
    titleEn: 'Company & Settings',
    titleAr: 'إعدادات وسياسات الشركة',
    icon: Building2,
    roles: ['super_admin'],
    subItems: [
      {
        titleEn: 'Setup Wizard',
        titleAr: 'معالج الإعداد الأولي',
        href: '/onboarding',
        icon: Sparkles,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Policies & Hours',
        titleAr: 'السياسات وساعات العمل',
        href: '/dashboard/settings',
        icon: Sliders,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Geofencing & Branches',
        titleAr: 'الفروع والبصمة الجغرافية',
        href: '/dashboard/settings',
        icon: MapPin,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Deduction Rules',
        titleAr: 'قواعد الخصومات والتأخير',
        href: '/dashboard/settings',
        icon: ShieldCheck,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Feature Toggles',
        titleAr: 'تفعيل وتعطيل الموديولات',
        href: '/dashboard/settings',
        icon: ToggleLeft,
        roles: ['super_admin'],
      },
    ],
  },
  {
    id: 'operations',
    titleEn: 'Employees & Contracts',
    titleAr: 'الموظفين والعقود',
    icon: Users,
    subItems: [
      {
        titleEn: 'Employee Directory',
        titleAr: 'سجل وإدارة الموظفين',
        href: '/dashboard/admin',
        icon: Users,
        roles: ['super_admin'],
      },
      {
        titleEn: 'Contract Builder & PDF',
        titleAr: 'صانع ومحرر العقود',
        href: '/dashboard/contracts',
        icon: FileText,
      },
      {
        titleEn: 'Team Overview',
        titleAr: 'نظرة عامة على الفريق',
        href: '/dashboard/manager',
        icon: Users,
        roles: ['manager', 'super_admin'],
      },
      {
        titleEn: 'Holiday Work Comp',
        titleAr: 'تعويضات العمل بالعطلات',
        href: '/dashboard/manager',
        icon: Calendar,
        roles: ['manager', 'super_admin'],
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
        titleEn: 'KPI Logs',
        titleAr: 'سجلات مؤشرات الأداء',
        href: '/dashboard/targets',
        icon: Layers,
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
        href: '/dashboard/payroll',
        icon: Wallet,
        roles: ['super_admin', 'manager'],
      },
      {
        titleEn: 'Payslip Generator',
        titleAr: 'مولد مفردات المرتبات',
        href: '/dashboard/payroll',
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
        href: '/dashboard/employee',
        icon: Clock,
      },
      {
        titleEn: 'My Leaves & Requests',
        titleAr: 'إجازاتي وطلباتي',
        href: '/dashboard/employee',
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
        href: '/dashboard/payroll',
        icon: FileBadge,
      },
    ],
  },
];

// GLOBAL top-level fast-switch anchors
export const GLOBAL_NAV_ANCHORS = [
  { id: 'dashboard', titleEn: 'Home', titleAr: 'الرئيسية', icon: LayoutDashboard },
  { id: 'workspace', titleEn: 'Workspace', titleAr: 'مساحتي', icon: Briefcase },
  { id: 'performance', titleEn: 'Performance', titleAr: 'الأداء', icon: Target },
  { id: 'operations', titleEn: 'Operations', titleAr: 'العمليات', icon: Users },
  { id: 'company', titleEn: 'Admin', titleAr: 'الإدارة', icon: Settings },
  { id: 'payroll', titleEn: 'Payroll', titleAr: 'الرواتب', icon: DollarSign },
];
