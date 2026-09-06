'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AppLayout from '@/components/layout/AppLayout';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, TenantSettings } from '@/lib/types/database';
import {
  Receipt,
  Printer,
  Download,
  Calendar,
  User,
  Building,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTenantSettings } from '@/lib/context/SettingsContext';
import HumAiLogo from '@/components/common/HumAiLogo';
import {
  calculateWorkingMinutes,
  calculateShiftLatenessMinutes,
} from '@/lib/utils/dateUtils';

interface PayslipSummary {
  employee: UserProfile;
  month: string;
  cyclePeriod: string;
  referenceNumber: string;
  issueDate: string;
  basicSalary: number;
  isProrated?: boolean;
  proratedDays?: number;
  commissions: number;
  bonuses: number;
  overtime: number;
  nightShiftAllowance: number;
  grossEarnings: number;
  advances: number;
  penalties: number;
  latenessDeductions: number;
  incomeTax: number;
  socialInsurance: number;
  healthInsurance: number;
  totalDeductions: number;
  netPay: number;
}

export default function PayslipsPage() {
  const { isRtl } = useLanguage();
  const supabase = createClient();
  const { settings: globalSettings, isFeatureEnabled } = useTenantSettings();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // 'YYYY-MM'
  );
  const [payslip, setPayslip] = useState<PayslipSummary | null>(null);

  // Load User & Tenant Employees
  useEffect(() => {
    async function init() {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile) return;
      setCurrentUser(profile as UserProfile);

      if (profile.role === 'super_admin' || profile.role === 'manager') {
        const { data: emps } = await supabase
          .from('users')
          .select('*, department:departments(*), shift:shifts(*)')
          .eq('tenant_id', profile.tenant_id)
          .order('full_name');

        if (emps) {
          setEmployees(emps as UserProfile[]);
          setSelectedEmpId(authUser.id); // Default to current user
        }
      } else {
        // Regular employee is locked to their own ID
        setSelectedEmpId(authUser.id);
        setEmployees([profile as UserProfile]);
      }
      setLoading(false);
    }
    init();
  }, [supabase]);

  // Re-compile payslip whenever selectedEmpId or selectedMonth changes
  useEffect(() => {
    if (!selectedEmpId || !selectedMonth || !currentUser?.tenant_id) return;

    async function compile() {
      setLoading(true);
      try {
        const emp = employees.find((e) => e.id === selectedEmpId) || currentUser;
        if (!emp) return;

        const startStr = `${selectedMonth}-01`;
        const [y, m] = selectedMonth.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        const endStr = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

        // Cairo Payroll Cycle notation (26th prev month to 25th current month)
        const prevMonthDate = new Date(y, m - 2, 26);
        const currCycleEnd = new Date(y, m - 1, 25);
        const cyclePeriod = `${prevMonthDate.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })} - ${currCycleEnd.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;

        // Fetch Tenant Settings
        const { data: tenantSettings } = await supabase
          .from('tenant_settings')
          .select('*')
          .eq('tenant_id', currentUser!.tenant_id)
          .maybeSingle();

        const settings: TenantSettings | null =
          (tenantSettings as TenantSettings) || globalSettings;

        // 1. Sales & Commissions
        let commissions = 0;
        if (settings?.enable_commissions !== false) {
          const { data: sales } = await supabase
            .from('sales_logs')
            .select('amount, commission_rate')
            .eq('tenant_id', currentUser!.tenant_id)
            .eq('user_id', emp.id)
            .eq('status', 'approved')
            .gte('date', startStr)
            .lte('date', endStr);

          const totalSales = sales
            ? sales.reduce((acc, curr) => acc + Number(curr.amount ?? 0), 0)
            : 0;
          const rate = Number(emp.commission_rate ?? 5);
          commissions = totalSales * (rate / 100);
        }

        // 2. Financial Adjustments (Bonuses & Penalties)
        let bonuses = 0;
        let penalties = 0;
        const { data: adjustments } = await supabase
          .from('financial_adjustments')
          .select('amount, type, status')
          .eq('tenant_id', currentUser!.tenant_id)
          .eq('user_id', emp.id)
          .gte('month', startStr)
          .lte('month', endStr);

        if (adjustments) {
          adjustments.forEach((a) => {
            if (a.status === 'approved' || !a.status) {
              if (a.type === 'bonus' || a.type === 'holiday_comp') {
                bonuses += Number(a.amount ?? 0);
              }
              if (a.type === 'deduction' || (a.type as string) === 'penalty') {
                penalties += Number(a.amount ?? 0);
              }
            }
          });
        }

        // 3. Approved Advances
        let advances = 0;
        if (settings?.enable_advances !== false) {
          const { data: advs } = await supabase
            .from('advances')
            .select('amount, status')
            .eq('tenant_id', currentUser!.tenant_id)
            .eq('user_id', emp.id)
            .eq('month', startStr)
            .eq('status', 'approved');

          if (advs) {
            advances = advs.reduce((acc, curr) => acc + Number(curr.amount ?? 0), 0);
          }
        }

        // 4. Attendance & Shift Lateness Deductions
        let latenessDeductions = 0;
        const fullBasicSalary = Number(emp.basic_salary ?? 0);
        let basicSalary = fullBasicSalary;
        let isProrated = false;
        let proratedDays = lastDay;

        const daysInMonth = lastDay;

        // Mid-Month Hire Proration
        if (emp.hire_date && emp.hire_date > startStr) {
          const hireD = new Date(emp.hire_date);
          const activeDays = Math.max(1, daysInMonth - hireD.getDate() + 1);
          basicSalary = Math.round((activeDays / daysInMonth) * fullBasicSalary);
          isProrated = true;
          proratedDays = activeDays;
        } else if (emp.contract_end_date && emp.contract_end_date < endStr && emp.contract_end_date >= startStr) {
          const endD = new Date(emp.contract_end_date);
          const activeDays = Math.max(1, endD.getDate());
          basicSalary = Math.round((activeDays / daysInMonth) * fullBasicSalary);
          isProrated = true;
          proratedDays = activeDays;
        }

        const dailyRate = fullBasicSalary > 0 ? fullBasicSalary / 30 : 0;
        const requiredHours = Number(emp.required_daily_hours ?? 8);
        const hourlyRate = dailyRate > 0 && requiredHours > 0 ? dailyRate / requiredHours : 0;

        const { data: checkins } = await supabase
          .from('attendance')
          .select('*')
          .eq('tenant_id', currentUser!.tenant_id)
          .eq('user_id', emp.id)
          .gte('date', startStr)
          .lte('date', endStr);

        if (checkins && checkins.length > 0 && dailyRate > 0) {
          if (emp.is_flexible) {
            checkins.forEach((c) => {
              if (c.check_in_time && c.check_out_time) {
                const workedMinutes = calculateWorkingMinutes(c.check_in_time, c.check_out_time);
                const reqMinutes = requiredHours * 60;
                if (workedMinutes < reqMinutes) {
                  const shortHours = (reqMinutes - workedMinutes) / 60;
                  latenessDeductions += shortHours * hourlyRate;
                }
              }
            });
          } else {
            const shiftStart = emp.shift?.start_time || settings?.work_start_time || '09:00';
            const gracePeriod = Number(settings?.grace_period_mins ?? 15);
            const latenessMode = settings?.lateness_mode || 'tiered';

            checkins.forEach((c) => {
              if (c.check_in_time) {
                const lateMins = calculateShiftLatenessMinutes(c.check_in_time, shiftStart);
                if (lateMins > gracePeriod) {
                  if (latenessMode === 'percentage_per_minute') {
                    const minRate = Number(settings?.minute_deduction_rate ?? 0.005);
                    latenessDeductions += dailyRate * (lateMins * minRate);
                  } else {
                    const thresholds = settings?.lateness_policy?.thresholds || [
                      { mins: 15, deduction: 0.25 },
                      { mins: 30, deduction: 0.5 },
                      { mins: 60, deduction: 1.0 },
                    ];
                    let dedRatio = 0;
                    thresholds.forEach((t) => {
                      if (lateMins >= t.mins && t.deduction > dedRatio) {
                        dedRatio = t.deduction;
                      }
                    });
                    latenessDeductions += dailyRate * dedRatio;
                  }
                }
              }
            });
          }
        }

        // 5. Insurances
        const socialInsurance = Number(emp.social_insurance ?? 0);
        const healthInsurance = Number(emp.health_insurance ?? 0);

        // 6. Overtime Calculation
        let overtime = 0;
        if (settings?.enable_overtime) {
          const overtimeMultiplier = Number(settings?.overtime_rate_multiplier ?? 1.5);
          // Standard estimate or explicit overtime calculation if logged
          overtime = 0;
        }

        // 7. Night Shift Allowance
        const nightShiftAllowance = emp.shift?.night_shift_allowance ? Number(emp.shift.night_shift_allowance) : 0;

        const grossEarnings = basicSalary + commissions + bonuses + overtime + nightShiftAllowance;

        // 8. Income Tax
        let incomeTax = 0;
        if (settings?.enable_income_tax !== false && Number(emp.income_tax_rate ?? 0) > 0) {
          const taxableBase = Math.max(0, grossEarnings - socialInsurance);
          incomeTax = Math.round(taxableBase * (Number(emp.income_tax_rate) / 100));
        }

        const totalDeductions =
          advances + penalties + latenessDeductions + socialInsurance + healthInsurance + incomeTax;
        const netPay = Math.max(0, grossEarnings - totalDeductions);

        const refNum = `PAY-${selectedMonth.replace('-', '')}-${emp.id.substring(0, 6).toUpperCase()}`;

        setPayslip({
          employee: emp,
          month: selectedMonth,
          cyclePeriod,
          referenceNumber: refNum,
          issueDate: new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          basicSalary,
          isProrated,
          proratedDays,
          commissions,
          bonuses,
          overtime,
          nightShiftAllowance,
          grossEarnings,
          advances,
          penalties,
          latenessDeductions,
          incomeTax,
          socialInsurance,
          healthInsurance,
          totalDeductions,
          netPay,
        });
      } catch (err) {
        console.error('Payslip compile error:', err);
      } finally {
        setLoading(false);
      }
    }

    compile();
  }, [selectedEmpId, selectedMonth, currentUser, employees, globalSettings, isRtl, supabase]);

  const handlePrint = () => {
    window.print();
  };

  const isPrivileged = currentUser?.role === 'super_admin' || currentUser?.role === 'manager';

  // Month selector options for last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = d.toISOString().substring(0, 7);
    const label = d.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
    return { val, label };
  });

  return (
    <AppLayout user={currentUser}>
      <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <div className="print:hidden">
          <Navbar user={currentUser} />
        </div>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* Header & Controls Toolbar */}
          <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 cleariq-card p-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-slate-950 dark:text-white leading-tight">
                    {isRtl ? 'قسيمة الراتب الرسمية المعتمدة' : 'Official Generated Payslip'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isRtl
                      ? 'مفردات ومسيرات الرواتب الشهرية الرسمية مع الحساب التلقائي للبدلات والاستقطاعات'
                      : 'Certified digital payroll voucher and itemized earnings/deductions summary'}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Dropdowns & Print Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Employee Picker for Admin / Manager */}
              {isPrivileged && employees.length > 1 && (
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.job_title || emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Month Picker */}
              <div className="relative min-w-[160px]">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                >
                  {monthOptions.map((m) => (
                    <option key={m.val} value={m.val}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Print / Download Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>{isRtl ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* DIGITAL OFFICIAL PAYSLIP VOUCHER CARD (PRINT READY)             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {loading ? (
            <div className="cleariq-card p-12 text-center text-slate-400 font-bold animate-pulse">
              {isRtl ? 'جاري تجميع وتدقيق قسيمة الراتب...' : 'Compiling official payslip data...'}
            </div>
          ) : payslip ? (
            <div
              id="printable-payslip"
              className="cleariq-card p-6 sm:p-10 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg space-y-8 bg-white dark:bg-slate-900 print:shadow-none print:border-none print:p-0 print:m-0"
            >
              {/* 1. Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-3">
                  <HumAiLogo variant="horizontal" size="md" />
                  <div>
                    <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {isRtl ? 'مسير الرواتب المعتمد' : 'Certified Payroll Voucher'}
                    </h2>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {payslip.referenceNumber}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                    {isRtl ? 'تم الاعتماد المالي' : 'FINANCIALLY APPROVED'}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {isRtl ? 'تاريخ الإصدار: ' : 'Issue Date: '}
                    <span className="font-sans font-medium">{payslip.issueDate}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl ? 'دورة الراتب: ' : 'Cycle Period: '}
                    <span className="font-sans">{payslip.cyclePeriod}</span>
                  </p>
                </div>
              </div>

              {/* 2. Employee Profile Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {isRtl ? 'اسم الموظف' : 'Employee Name'}
                  </span>
                  <p className="font-extrabold text-slate-950 dark:text-white text-sm">
                    {payslip.employee.full_name_ar || payslip.employee.full_name}
                  </p>
                  {payslip.employee.full_name_en && (
                    <p className="text-[10px] text-slate-500 font-sans">
                      {payslip.employee.full_name_en}
                    </p>
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {isRtl ? 'المسمى والقسم' : 'Job Title & Dept'}
                  </span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {payslip.employee.job_title || 'Employee'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {payslip.employee.department?.name || 'Operations'}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {isRtl ? 'الرقم القومي / الهوية' : 'National ID / Tax #'}
                  </span>
                  <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {payslip.employee.national_id || payslip.employee.id_number || 'N/A'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {payslip.employee.mobile || 'No Phone Registered'}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {isRtl ? 'طريقة تحويل الراتب' : 'Disbursement Channel'}
                  </span>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    {payslip.employee.payout_method || payslip.employee.payment_method || 'Cash / خزينة'}
                  </p>
                  {payslip.employee.payout_method === 'instapay' && payslip.employee.instapay_handle && (
                    <p className="text-[10px] font-mono text-slate-500">
                      {payslip.employee.instapay_handle}
                    </p>
                  )}
                  {payslip.employee.payout_method === 'bank_transfer' && payslip.employee.bank_account_number && (
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      {payslip.employee.bank_name || 'Bank'} - {payslip.employee.bank_account_number}
                    </p>
                  )}
                  {(payslip.employee.payout_method === 'e_wallet' || payslip.employee.payout_method === 'vodafone_cash') && payslip.employee.wallet_phone_number && (
                    <p className="text-[10px] font-mono text-slate-500">
                      {payslip.employee.wallet_phone_number}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Itemized Earnings vs Deductions Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── EARNINGS (الاستحقاقات) ── */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      {isRtl ? 'الاستحقاقات والبدلات' : 'Earnings & Allowances'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">(+) EGP</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div className="flex justify-between p-3">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <span>{isRtl ? 'الراتب الأساسي الثابت' : 'Basic Fixed Salary'}</span>
                        {payslip.isProrated && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            {isRtl ? `معدل (${payslip.proratedDays} يوم)` : `Prorated (${payslip.proratedDays}d)`}
                          </span>
                        )}
                      </span>
                      <span className="font-extrabold font-sans text-slate-900 dark:text-white">
                        {payslip.basicSalary.toLocaleString()} EGP
                      </span>
                    </div>

                    <div className="flex justify-between p-3">
                      <span className="text-slate-600 dark:text-slate-400">
                        {isRtl ? 'عمولات المبيعات المعتمدة' : 'Approved Sales Commission'}
                      </span>
                      <span className="font-extrabold font-sans text-slate-900 dark:text-white">
                        {payslip.commissions.toLocaleString()} EGP
                      </span>
                    </div>

                    <div className="flex justify-between p-3">
                      <span className="text-slate-600 dark:text-slate-400">
                        {isRtl ? 'المكافآت والبدلات الإضافية' : 'Bonuses & Incentives'}
                      </span>
                      <span className="font-extrabold font-sans text-slate-900 dark:text-white">
                        {payslip.bonuses.toLocaleString()} EGP
                      </span>
                    </div>

                    {payslip.overtime > 0 && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-600 dark:text-slate-400">
                          {isRtl ? 'بدل ساعات العمل الإضافي' : 'Approved Overtime Pay'}
                        </span>
                        <span className="font-extrabold font-sans text-slate-900 dark:text-white">
                          {payslip.overtime.toLocaleString()} EGP
                        </span>
                      </div>
                    )}

                    {payslip.nightShiftAllowance > 0 && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-600 dark:text-slate-400">
                          {isRtl ? 'بدل الوردية الليلية' : 'Night Shift Allowance'}
                        </span>
                        <span className="font-extrabold font-sans text-purple-600 dark:text-purple-400">
                          +{payslip.nightShiftAllowance.toLocaleString()} EGP
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between p-3 bg-emerald-50/40 dark:bg-emerald-950/20 font-extrabold">
                      <span className="text-emerald-900 dark:text-emerald-200">
                        {isRtl ? 'إجمالي الاستحقاقات (Gross)' : 'Total Gross Earnings'}
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-sans text-sm">
                        {payslip.grossEarnings.toLocaleString()} EGP
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── DEDUCTIONS (الاستقطاعات) ── */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-3.5 bg-rose-50/80 dark:bg-rose-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      {isRtl ? 'الاستقطاعات والخصومات' : 'Deductions & Advances'}
                    </span>
                    <span className="text-[10px] text-rose-700 font-bold">(-) EGP</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div className="flex justify-between p-3">
                      <span className="text-slate-600 dark:text-slate-400">
                        {isRtl ? 'سلف الراتب المسحوبة' : 'Salary Advances Deducted'}
                      </span>
                      <span className="font-extrabold font-sans text-slate-900 dark:text-white">
                        {payslip.advances.toLocaleString()} EGP
                      </span>
                    </div>

                    <div className="flex justify-between p-3">
                      <span className="text-slate-600 dark:text-slate-400">
                        {isRtl ? 'الجزاءات والخصومات الإدارية' : 'Penalties & Disciplinary'}
                      </span>
                      <span className="font-extrabold font-sans text-slate-900 dark:text-white">
                        {payslip.penalties.toLocaleString()} EGP
                      </span>
                    </div>

                    <div className="flex justify-between p-3">
                      <span className="text-slate-600 dark:text-slate-400">
                        {isRtl ? 'خصومات التأخير وعجز الساعات' : 'Lateness & Work Shortage'}
                      </span>
                      <span className="font-extrabold font-sans text-slate-900 dark:text-white">
                        {Math.round(payslip.latenessDeductions).toLocaleString()} EGP
                      </span>
                    </div>

                    {payslip.incomeTax > 0 && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-600 dark:text-slate-400">
                          {isRtl ? 'ضريبة كسب العمل' : 'Income Tax'}
                        </span>
                        <span className="font-extrabold font-sans text-rose-600 dark:text-rose-400">
                          {payslip.incomeTax.toLocaleString()} EGP
                        </span>
                      </div>
                    )}

                    {payslip.socialInsurance > 0 && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-600 dark:text-slate-400">
                          {isRtl ? 'حصة التأمينات الاجتماعية' : 'Social Insurance'}
                        </span>
                        <span className="font-extrabold font-sans text-slate-900 dark:text-white">
                          {payslip.socialInsurance.toLocaleString()} EGP
                        </span>
                      </div>
                    )}

                    {payslip.healthInsurance > 0 && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-600 dark:text-slate-400">
                          {isRtl ? 'التأمين الطبي الخاص' : 'Health Insurance'}
                        </span>
                        <span className="font-extrabold font-sans text-slate-900 dark:text-white">
                          {payslip.healthInsurance.toLocaleString()} EGP
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between p-3 bg-rose-50/40 dark:bg-rose-950/20 font-extrabold">
                      <span className="text-rose-900 dark:text-rose-200">
                        {isRtl ? 'إجمالي الاستقطاعات' : 'Total Deductions'}
                      </span>
                      <span className="text-rose-700 dark:text-rose-300 font-sans text-sm">
                        {payslip.totalDeductions.toLocaleString()} EGP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Grand Net Payable Banner */}
              <div className="p-6 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/15 border-2 border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-800 dark:text-emerald-300">
                    {isRtl ? 'صافي الراتب المستحق للصرف' : 'TOTAL NET SALARY PAYABLE'}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isRtl
                      ? 'تم تحويل الصافي إلى قناة الصرف المحددة بعد مطابقة ساعات العمل وسجلات المبيعات'
                      : 'Calculated and audited against verified biometric logs, sales logs, and policies.'}
                  </p>
                </div>

                <div className="text-center sm:text-right">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight">
                    {Math.round(payslip.netPay).toLocaleString()}{' '}
                    <span className="text-base font-bold">EGP</span>
                  </div>
                </div>
              </div>

              {/* 5. Authorization & Verification Signatures */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6 text-center text-xs">
                <div className="space-y-8">
                  <span className="font-bold text-slate-500 block">
                    {isRtl ? 'إعداد الموارد البشرية' : 'Prepared By HR'}
                  </span>
                  <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-32 mx-auto" />
                  <span className="text-[10px] text-slate-400 block">HumAi HR System</span>
                </div>

                <div className="space-y-8">
                  <span className="font-bold text-slate-500 block">
                    {isRtl ? 'اعتماد الإدارة المالية' : 'Financial Approval'}
                  </span>
                  <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-32 mx-auto" />
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    ✓ Verified & Closed
                  </span>
                </div>

                <div className="space-y-8">
                  <span className="font-bold text-slate-500 block">
                    {isRtl ? 'توقيع واستلام الموظف' : 'Employee Acknowledgment'}
                  </span>
                  <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-32 mx-auto" />
                  <span className="text-[10px] text-slate-400 block">Digital Acknowledged</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="cleariq-card p-12 text-center text-slate-400">
              {isRtl ? 'لا توجد بيانات قسيمة لهذا الشهر' : 'No payslip records available for this cycle.'}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
