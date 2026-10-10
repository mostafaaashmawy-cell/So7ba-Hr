'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, TenantSettings } from '@/lib/types/database';
import {
  FileText,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Download,
  DollarSign,
  Plus,
  Wallet,
  Calendar,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  Clock,
  ShieldCheck,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useTenantSettings } from '@/lib/context/SettingsContext';
import HumAiLogo from '@/components/common/HumAiLogo';
import { logAuditAction } from '@/lib/utils/auditLogger';
import { useRouter } from 'next/navigation';
import {
  calculateWorkingMinutes,
  calculateShiftLatenessMinutes,
  getCairoDateString,
  getPayrollCycleForMonth,
} from '@/lib/utils/dateUtils';

interface FinancialAdjustment {
  id: string;
  user_id: string;
  type: 'bonus' | 'penalty';
  amount: number;
  date: string;
  status: 'pending' | 'dept_approved' | 'approved' | 'rejected';
  notes: string;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  user?: { full_name: string };
}

interface AdvanceRequest {
  id: string;
  user_id: string;
  amount: number;
  month: string;
  status: 'pending' | 'approved' | 'rejected';
  user?: { full_name: string };
}

interface PayslipData {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  jobTitle: string;
  basicSalary: number;
  isProrated?: boolean;
  proratedDays?: number;
  cycleStartDate: string;
  cycleEndDate: string;
  cycleStartDay: number;
  commissionRate: number;
  commission: number; // Current month earned
  carriedDeferredCommission: number; // Carried from previous month
  commissionTotal: number; // Current earned + carried
  commissionPaid: number; // Paid this month
  commissionDeferred: number; // Deferred to next month
  totalSales: number;
  bonuses: number;
  overtime: number;
  nightShiftAllowance: number;
  penalties: number;
  advances: number;
  latenessDeductions: number;
  incomeTax: number;
  socialInsurance: number;
  healthInsurance: number;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  month: string;
  paymentStatus: 'paid' | 'unpaid' | string;
  paymentMethod: string;
  paidAt?: string | null;
  paidBy?: string | null;
  employeeAccountInfo?: string | null;
}

export default function PayrollPage() {
  const router = useRouter();
  const { isRtl } = useLanguage();
  const supabase = createClient();
  const { settings: globalSettings, isFeatureEnabled } = useTenantSettings();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  // Payroll Calculation States
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    getCairoDateString().substring(0, 7) // 'YYYY-MM'
  );

  // Lists
  const [adjustments, setAdjustments] = useState<FinancialAdjustment[]>([]);
  const [advances, setAdvances] = useState<AdvanceRequest[]>([]);

  // Adjustment Form State with explicit employee selector
  const [adjEmployee, setAdjEmployee] = useState<string>('');
  const [adjType, setAdjType] = useState<'bonus' | 'penalty'>('bonus');
  const [adjAmount, setAdjAmount] = useState<number | ''>('');
  const [adjNotes, setAdjNotes] = useState<string>('');

  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Payslip compiled states
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [showPayslip, setShowPayslip] = useState(false);
  const [customPartialCommission, setCustomPartialCommission] = useState<number | ''>('');

  const enableAdvances = isFeatureEnabled('enable_advances');
  const enableCommissions = isFeatureEnabled('enable_commissions');
  const enableInsurances = isFeatureEnabled('enable_insurances');
  const enableOvertime = isFeatureEnabled('enable_overtime');

  const loadData = async () => {
    setLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    // Profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      if (profile.role !== 'super_admin') {
        router.push('/dashboard/employee');
        return;
      }
      setCurrentUser(profile as UserProfile);

      // Load all employees in tenant with shifts and departments
      const { data: users } = await supabase
        .from('users')
        .select('*, department:departments(name), shift:shifts(*)')
        .eq('tenant_id', profile.tenant_id);

      if (users) {
        setEmployees(users as UserProfile[]);
        if (users.length > 0) {
          setSelectedEmployee(users[0].id);
          setAdjEmployee(users[0].id);
        }
      }

      // Load Adjustments in Tenant with explicit foreign key
      const { data: adj, error: adjErr } = await supabase
        .from('financial_adjustments')
        .select('*, user:users!user_id(full_name)')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (adjErr) {
        console.error('Error fetching adjustments:', adjErr.message);
      }
      if (adj) setAdjustments(adj as FinancialAdjustment[]);

      // Load Advances in Tenant
      const { data: adv, error: advErr } = await supabase
        .from('advances')
        .select('*, user:users!user_id(full_name)')
        .eq('tenant_id', profile.tenant_id)
        .order('month', { ascending: false });

      if (advErr) {
        console.error('Error fetching advances:', advErr.message);
      }
      if (adv) setAdvances(adv as AdvanceRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !adjAmount || !adjEmployee) return;

    setSubmitting(true);
    setMsg(null);

    const finalStatus = currentUser.role === 'super_admin' ? 'approved' : 'pending';

    try {
      const { error } = await supabase.from('financial_adjustments').insert({
        tenant_id: currentUser.tenant_id,
        user_id: adjEmployee,
        type: adjType,
        status: finalStatus,
        amount: Number(adjAmount ?? 0),
        date: `${selectedMonth}-01`,
        month: `${selectedMonth}-01`,
        notes: adjNotes.trim() || null,
        description: adjNotes.trim() || null,
      });

      if (error) throw error;

      setMsg({
        text:
          finalStatus === 'approved'
            ? isRtl
              ? 'تم تسجيل وتسوية التعديل المالي بنجاح!'
              : 'Adjustment successfully executed!'
            : isRtl
            ? 'تم إرسال التعديل المالي وهو بانتظار موافقة المشرف العام!'
            : 'Adjustment submitted and pending admin approval!',
        error: false,
      });
      setAdjAmount('');
      setAdjNotes('');

      if (currentUser?.tenant_id) {
        logAuditAction(supabase, {
          tenant_id: currentUser.tenant_id,
          actor_id: currentUser.id,
          action_type: adjType === 'bonus' ? 'ADD_BONUS_ADJUSTMENT' : 'ADD_PENALTY_ADJUSTMENT',
          entity_name: 'financial_adjustments',
          details: {
            user_id: adjEmployee,
            type: adjType,
            amount: Number(adjAmount ?? 0),
            month: selectedMonth,
            notes: adjNotes.trim(),
            status: finalStatus,
          },
        });
      }

      await loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Action failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusAdjustment = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionId(id);
    try {
      const { error } = await supabase
        .from('financial_adjustments')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('tenant_id', currentUser?.tenant_id ?? '');

      if (error) throw error;
      setAdjustments(adjustments.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));

      if (currentUser?.tenant_id) {
        logAuditAction(supabase, {
          tenant_id: currentUser.tenant_id,
          actor_id: currentUser.id,
          action_type: newStatus === 'approved' ? 'APPROVE_ADJUSTMENT' : 'REJECT_ADJUSTMENT',
          entity_name: 'financial_adjustments',
          entity_id: id,
          details: { status: newStatus },
        });
      }
      await loadData();
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Action failed';
      setMsg({ text: errMsg, error: true });
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const handleStatusAdvance = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionId(id);
    try {
      const { error } = await supabase
        .from('advances')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('tenant_id', currentUser?.tenant_id ?? '');

      if (error) throw error;
      setAdvances(advances.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));

      if (currentUser?.tenant_id) {
        logAuditAction(supabase, {
          tenant_id: currentUser.tenant_id,
          actor_id: currentUser.id,
          action_type: newStatus === 'approved' ? 'APPROVE_ADVANCE' : 'REJECT_ADVANCE',
          entity_name: 'advances',
          entity_id: id,
          details: { status: newStatus },
        });
      }
      await loadData();
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Action failed';
      setMsg({ text: errMsg, error: true });
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  // Compile Payslip
  const compilePayslip = async () => {
    if (!selectedEmployee || !selectedMonth || !currentUser) return;
    setLoading(true);

    try {
      const emp = employees.find((e) => e.id === selectedEmployee);
      if (!emp) throw new Error('Employee record missing');

      // 0. Load Tenant Settings & Financial Cycle Cutoff Day
      const { data: tenantSettings } = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('tenant_id', currentUser.tenant_id)
        .maybeSingle();

      const settings: TenantSettings | null =
        (tenantSettings as TenantSettings) || globalSettings;

      const cycleCutoff = Number(settings?.payroll_cycle_start_day || 1);
      const { startStr, endStr } = getPayrollCycleForMonth(selectedMonth, cycleCutoff);

      // Check for saved payroll record for this employee and month
      const { data: existingRecord } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('tenant_id', currentUser.tenant_id)
        .eq('user_id', emp.id)
        .eq('month', selectedMonth)
        .maybeSingle();

      // Check previous month for carried deferred commission
      const [yNum, mNum] = selectedMonth.split('-').map(Number);
      const prevMonthIndex = mNum - 2;
      const prevYear = prevMonthIndex < 0 ? yNum - 1 : yNum;
      const prevMonthNum = prevMonthIndex < 0 ? 12 : prevMonthIndex + 1;
      const prevMonthStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`;

      const { data: prevRecord } = await supabase
        .from('payroll_records')
        .select('commission_deferred')
        .eq('tenant_id', currentUser.tenant_id)
        .eq('user_id', emp.id)
        .eq('month', prevMonthStr)
        .maybeSingle();

      const carriedDeferredCommission = Number(prevRecord?.commission_deferred || 0);

      // 1. Fetch Verified Sales from sales_logs with tenant_id and financial cycle date filters
      let totalSales = 0;
      let empCommissionRate = 0;
      let commission = 0;

      if (settings?.enable_commissions !== false) {
        const { data: sales } = await supabase
          .from('sales_logs')
          .select('amount, commission_rate, commission_earned')
          .eq('tenant_id', currentUser.tenant_id)
          .eq('user_id', emp.id)
          .eq('status', 'approved')
          .gte('date', startStr)
          .lte('date', endStr);

        totalSales = sales
          ? sales.reduce((acc, curr) => acc + Number(curr.amount ?? 0), 0)
          : 0;

        empCommissionRate = Number(emp.commission_rate ?? 5);
        commission = totalSales * (empCommissionRate / 100);
      }

      // 2. Fetch Adjustments (Approved Bonuses & Penalties)
      const { data: userAdj } = await supabase
        .from('financial_adjustments')
        .select('amount, type, status')
        .eq('tenant_id', currentUser.tenant_id)
        .eq('user_id', emp.id)
        .eq('status', 'approved')
        .gte('month', startStr)
        .lte('month', endStr);

      let bonuses = 0;
      let penalties = 0;
      if (userAdj) {
        userAdj.forEach((a) => {
          if (a.type === 'bonus' || a.type === 'holiday_comp') {
            bonuses += Number(a.amount ?? 0);
          }
          if (a.type === 'deduction' || (a.type as string) === 'penalty') {
            penalties += Number(a.amount ?? 0);
          }
        });
      }

      // 3. Fetch Automatically Approved Advances
      let totalAdvances = 0;
      if (settings?.enable_advances !== false) {
        const { data: userAdv } = await supabase
          .from('advances')
          .select('amount')
          .eq('tenant_id', currentUser.tenant_id)
          .eq('user_id', emp.id)
          .eq('month', startStr)
          .eq('status', 'approved');

        totalAdvances = userAdv
          ? userAdv.reduce((acc, curr) => acc + Number(curr.amount ?? 0), 0)
          : 0;
      }

      // 4. Fetch Attendance & Compute Lateness / Work Shortage
      const { data: checkins } = await supabase
        .from('attendance')
        .select('*')
        .eq('tenant_id', currentUser.tenant_id)
        .eq('user_id', emp.id)
        .gte('date', startStr)
        .lte('date', endStr);

      const fullBasicSalary = Number(emp.basic_salary ?? 0);
      let empBasicSalary = fullBasicSalary;
      let isProrated = false;
      let proratedDays = lastDay;

      // Mid-Month Hire Proration (e.g. joined after start of month)
      if (emp.hire_date && emp.hire_date > startStr) {
        const hireD = new Date(emp.hire_date);
        const activeDays = Math.max(1, lastDay - hireD.getDate() + 1);
        empBasicSalary = Math.round((activeDays / lastDay) * fullBasicSalary);
        isProrated = true;
        proratedDays = activeDays;
      } else if (emp.contract_end_date && emp.contract_end_date < endStr && emp.contract_end_date >= startStr) {
        const endD = new Date(emp.contract_end_date);
        const activeDays = Math.max(1, endD.getDate());
        empBasicSalary = Math.round((activeDays / lastDay) * fullBasicSalary);
        isProrated = true;
        proratedDays = activeDays;
      }

      const dailyRate = fullBasicSalary > 0 ? fullBasicSalary / 30 : 0;
      const requiredHours = Number(emp.required_daily_hours ?? 8);
      const hourlyRate = dailyRate > 0 && requiredHours > 0 ? dailyRate / requiredHours : 0;

      let latenessDeductions = 0;
      const gracePeriod = Number(settings?.grace_period_mins ?? 15);
      const latenessMode = settings?.lateness_mode || 'tiered';

      if (checkins && checkins.length > 0 && dailyRate > 0) {
        if (emp.is_flexible) {
          // Flexible Work: evaluate accumulated session hours against required_daily_hours
          checkins.forEach((c) => {
            if (c.check_in_time && c.check_out_time) {
              const workedMinutes = calculateWorkingMinutes(c.check_in_time, c.check_out_time);
              const requiredMinutes = requiredHours * 60;
              if (workedMinutes < requiredMinutes) {
                const shortageMins = requiredMinutes - workedMinutes;
                if (shortageMins > gracePeriod) {
                  const shortageHours = shortageMins / 60;
                  latenessDeductions += shortageHours * hourlyRate;
                }
              }
            }
          });
        } else {
          // Shift-based / Fixed Schedule with overnight crossing midnight support
          let shiftStartStr = '09:00';
          let shiftEndStr = '17:00';

          if (emp.custom_schedule_enabled && emp.custom_start_time) {
            shiftStartStr = emp.custom_start_time;
            shiftEndStr = emp.custom_end_time || '17:00';
          } else if (emp.shift?.start_time) {
            shiftStartStr = emp.shift.start_time;
            shiftEndStr = emp.shift.end_time || '17:00';
          } else if (settings?.work_start_time) {
            shiftStartStr = settings.work_start_time;
            shiftEndStr = settings.work_end_time || '17:00';
          }

          checkins.forEach((c) => {
            if (c.check_in_time) {
              const delayMins = calculateShiftLatenessMinutes(
                c.check_in_time,
                shiftStartStr,
                shiftEndStr
              );

              if (delayMins > gracePeriod) {
                if (latenessMode === 'percentage_per_minute') {
                  const extraMins = delayMins - gracePeriod;
                  const rate = Number(settings?.minute_deduction_rate ?? 0.005);
                  const deductionPct = Math.min(1.0, extraMins * rate);
                  latenessDeductions += deductionPct * dailyRate;
                } else if (settings?.lateness_policy?.thresholds) {
                  let maxDeductionPct = 0;
                  settings.lateness_policy.thresholds.forEach(
                    (rule: { mins: number; deduction: number }) => {
                      if (delayMins >= rule.mins) {
                        maxDeductionPct = Math.max(maxDeductionPct, rule.deduction);
                      }
                    }
                  );
                  latenessDeductions += maxDeductionPct * dailyRate;
                }
              }
            }
          });
        }
      }

      latenessDeductions = Math.round(latenessDeductions);

      // 5. Calculate Overtime if enabled
      let overtimePay = 0;
      if (settings?.enable_overtime !== false && checkins && hourlyRate > 0) {
        checkins.forEach((c) => {
          // Sessions where checkout was forgotten (auto-closed) do not qualify for unverified overtime
          if (c.check_in_time && c.check_out_time && !c.is_missing_checkout) {
            const workedHours = calculateWorkingMinutes(c.check_in_time, c.check_out_time) / 60;
            if (workedHours > requiredHours) {
              const extraHours = Math.min(workedHours - requiredHours, 6); // Max 6 hours overtime per shift statutory limit
              if (settings?.overtime_calculation_mode === 'fixed_rate') {
                overtimePay += extraHours * (Number(settings?.overtime_fixed_rate) || 50);
              } else {
                const multiplier = Number(settings?.overtime_rate_multiplier ?? 1.5);
                overtimePay += extraHours * hourlyRate * multiplier;
              }
            }
          }
        });
      }
      overtimePay = Math.round(overtimePay);

      // 6. Night Shift Allowance if assigned to a night shift
      let nightShiftAllowance = 0;
      if (emp.shift?.night_shift_allowance && Number(emp.shift.night_shift_allowance) > 0) {
        nightShiftAllowance = Math.round(Number(emp.shift.night_shift_allowance));
      }

      // 7. Insurance deductions with enable_insurances guard
      let socialIns = 0;
      let healthIns = 0;
      if (settings?.enable_insurances !== false) {
        socialIns = Number(emp.social_insurance ?? 0);
        healthIns = Number(emp.health_insurance ?? 0);
      }

      // 8. Commission Totals & Deferred Carryover
      const earnedCommission = Math.round(commission);
      const commissionTotal = earnedCommission + carriedDeferredCommission;
      let commissionPaid = commissionTotal;
      let commissionDeferred = 0;

      if (existingRecord) {
        if (existingRecord.commission_paid !== null && existingRecord.commission_paid !== undefined) {
          commissionPaid = Number(existingRecord.commission_paid);
          commissionDeferred = Number(existingRecord.commission_deferred ?? (commissionTotal - commissionPaid));
        }
      }

      // Compute Employee Payout Account info string
      let accountInfo: string | null = null;
      if (emp.iban) {
        accountInfo = `IBAN: ${emp.iban}`;
      } else if (emp.bank_account_number) {
        accountInfo = `${emp.bank_name || 'Bank'}: ${emp.bank_account_number}`;
      } else if (emp.instapay_handle) {
        accountInfo = `InstaPay: ${emp.instapay_handle}`;
      } else if (emp.wallet_phone_number) {
        accountInfo = `Wallet: ${emp.wallet_phone_number}`;
      } else if (emp.fawry_mobile_number) {
        accountInfo = `Fawry: ${emp.fawry_mobile_number}`;
      }

      // 9. Income Tax deduction with enable_income_tax guard and per-employee rate
      let incomeTax = 0;
      const grossEarnings = empBasicSalary + commissionPaid + bonuses + overtimePay + nightShiftAllowance;
      if (settings?.enable_income_tax !== false && Number(emp.income_tax_rate ?? 0) > 0) {
        const taxableBase = Math.max(0, grossEarnings - socialIns);
        incomeTax = Math.round(taxableBase * (Number(emp.income_tax_rate) / 100));
      }

      // Final calculations without NaN propagation
      const totalDeductions =
        penalties + totalAdvances + latenessDeductions + socialIns + healthIns + incomeTax;
      const netPay = Math.max(0, grossEarnings - totalDeductions);

      setPayslipData({
        employeeId: emp.id,
        employeeName: emp.full_name,
        departmentName:
          ((emp as unknown) as { department?: { name?: string } }).department?.name ||
          'Operations',
        jobTitle: emp.job_title || 'Staff',
        basicSalary: empBasicSalary,
        isProrated,
        proratedDays,
        cycleStartDate: startStr,
        cycleEndDate: endStr,
        cycleStartDay: cycleCutoff,
        commissionRate: empCommissionRate,
        commission: earnedCommission,
        carriedDeferredCommission,
        commissionTotal,
        commissionPaid,
        commissionDeferred,
        totalSales: Math.round(totalSales),
        bonuses: Math.round(bonuses),
        overtime: overtimePay,
        nightShiftAllowance,
        penalties: Math.round(penalties),
        advances: Math.round(totalAdvances),
        latenessDeductions,
        incomeTax,
        socialInsurance: Math.round(socialIns),
        healthInsurance: Math.round(healthIns),
        grossEarnings: Math.round(grossEarnings),
        totalDeductions: Math.round(totalDeductions),
        netPay: Math.round(netPay),
        month: selectedMonth,
        paymentStatus: existingRecord?.payment_status || 'unpaid',
        paymentMethod: existingRecord?.payment_method || emp.payment_method || emp.payout_method || 'bank_transfer',
        paidAt: existingRecord?.paid_at || null,
        paidBy: existingRecord?.paid_by || null,
        employeeAccountInfo: accountInfo,
      });

      setCustomPartialCommission(commissionPaid);
      setShowPayslip(true);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Payslip compilation failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaymentStatus = async (newStatus: 'paid' | 'unpaid') => {
    if (!payslipData || !currentUser?.tenant_id) return;
    setSubmitting(true);
    setMsg(null);

    try {
      const isPaid = newStatus === 'paid';
      const paidTimestamp = isPaid ? (payslipData.paidAt || new Date().toISOString()) : null;
      const payingUser = isPaid ? currentUser.id : null;

      const payload = {
        tenant_id: currentUser.tenant_id,
        user_id: payslipData.employeeId,
        month: payslipData.month,
        cycle_start_date: payslipData.cycleStartDate,
        cycle_end_date: payslipData.cycleEndDate,
        basic_salary: payslipData.basicSalary,
        gross_earnings: payslipData.grossEarnings,
        total_deductions: payslipData.totalDeductions,
        net_salary: payslipData.netPay,
        payment_status: newStatus,
        payment_method: payslipData.paymentMethod,
        paid_at: paidTimestamp,
        paid_by: payingUser,
        commission_total: payslipData.commissionTotal,
        commission_paid: payslipData.commissionPaid,
        commission_deferred: payslipData.commissionDeferred,
        details: payslipData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('payroll_records')
        .upsert(payload, { onConflict: 'tenant_id,user_id,month' });

      if (error) throw error;

      setPayslipData({
        ...payslipData,
        paymentStatus: newStatus,
        paidAt: paidTimestamp,
        paidBy: payingUser,
      });

      logAuditAction(supabase, {
        tenant_id: currentUser.tenant_id,
        actor_id: currentUser.id,
        action_type: isPaid ? 'MARK_PAYROLL_PAID' : 'MARK_PAYROLL_UNPAID',
        entity_name: 'payroll_records',
        details: {
          employee: payslipData.employeeName,
          month: payslipData.month,
          amount: payslipData.netPay,
          payment_method: payslipData.paymentMethod,
        },
      });

      setMsg({
        text: isPaid
          ? (isRtl ? 'تم تأكيد صرف ودفع المرتب للموظف بنجاح وتوثيق العملية في سجلات الشركة!' : 'Salary marked as paid successfully!')
          : (isRtl ? 'تم إلغاء حالة الدفع بنجاح.' : 'Payment status reverted to unpaid.'),
        error: false,
      });
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Failed to update payment status';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustCommission = async (paidAmount: number) => {
    if (!payslipData) return;
    const safePaid = Math.max(0, Math.min(payslipData.commissionTotal, Math.round(paidAmount)));
    const safeDeferred = Math.max(0, payslipData.commissionTotal - safePaid);

    // Recalculate gross and net take-home
    const newGross = payslipData.basicSalary + safePaid + payslipData.bonuses + payslipData.overtime + payslipData.nightShiftAllowance;
    const newNet = Math.max(0, newGross - payslipData.totalDeductions);

    const updated = {
      ...payslipData,
      commissionPaid: safePaid,
      commissionDeferred: safeDeferred,
      grossEarnings: newGross,
      netPay: newNet,
    };
    setPayslipData(updated);

    // If already saved to payroll_records, sync it silently
    if (currentUser?.tenant_id) {
      try {
        await supabase
          .from('payroll_records')
          .upsert({
            tenant_id: currentUser.tenant_id,
            user_id: payslipData.employeeId,
            month: payslipData.month,
            cycle_start_date: payslipData.cycleStartDate,
            cycle_end_date: payslipData.cycleEndDate,
            basic_salary: payslipData.basicSalary,
            gross_earnings: newGross,
            total_deductions: payslipData.totalDeductions,
            net_salary: newNet,
            payment_status: payslipData.paymentStatus,
            payment_method: payslipData.paymentMethod,
            commission_total: payslipData.commissionTotal,
            commission_paid: safePaid,
            commission_deferred: safeDeferred,
            details: updated,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'tenant_id,user_id,month' });
      } catch (err) {
        console.warn('Sync commission deferral:', err);
      }
    }
  };

  const handleChangePaymentMethod = async (newMethod: string) => {
    if (!payslipData) return;
    const updated = { ...payslipData, paymentMethod: newMethod };
    setPayslipData(updated);

    if (currentUser?.tenant_id) {
      try {
        await supabase
          .from('payroll_records')
          .upsert({
            tenant_id: currentUser.tenant_id,
            user_id: payslipData.employeeId,
            month: payslipData.month,
            cycle_start_date: payslipData.cycleStartDate,
            cycle_end_date: payslipData.cycleEndDate,
            basic_salary: payslipData.basicSalary,
            gross_earnings: payslipData.grossEarnings,
            total_deductions: payslipData.totalDeductions,
            net_salary: payslipData.netPay,
            payment_status: payslipData.paymentStatus,
            payment_method: newMethod,
            commission_total: payslipData.commissionTotal,
            commission_paid: payslipData.commissionPaid,
            commission_deferred: payslipData.commissionDeferred,
            details: updated,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'tenant_id,user_id,month' });
      } catch (err) {
        console.warn('Sync payment method:', err);
      }
    }
  };

  const handlePrint = () => window.print();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg) flex items-center justify-center text-slate-400 text-xs font-bold">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
        Loading payroll engine...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar user={currentUser} activeRoleView={isSuperAdmin ? 'super_admin' : 'manager'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6 print:bg-white print:text-black print:p-0">
        {/* Printable payslip modal view */}
        {showPayslip && payslipData && (
          <div className="cleariq-card p-6 cleariq-card-hover space-y-6 print:border-none print:shadow-none print:bg-white print:text-black print:p-0">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
                {isRtl ? 'مفردات الراتب المعتمدة' : 'Official Generated Payslip'}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="gradient-btn px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />{' '}
                  {isRtl ? 'طباعة / حفظ PDF' : 'Download / Print Payslip'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayslip(false)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isRtl ? 'إغلاق' : 'Close Payslip'}
                </button>
              </div>
            </div>

            {/* Printing Payslip layout */}
            <div className="space-y-6 p-4 print:p-0 font-sans">
              <div className="flex justify-between items-center border-b-2 border-slate-950 pb-4 mb-4">
                <div>
                  <HumAiLogo variant="horizontal" size="md" showTagline />
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">
                    Official Monthly Payslip Documentation
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">
                    {isRtl ? 'شهر الاستحقاق' : 'Payroll Month'}
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 print:text-black font-sans">
                    {payslipData.month}
                  </span>
                </div>
              </div>

              {/* Financial Cutoff Cycle Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-sans print:border-black print:bg-transparent">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 print:text-black" />
                  <span className="font-bold text-slate-700 dark:text-slate-300 print:text-black">
                    {isRtl ? 'الدورة المالية المعتمدة:' : 'Financial Cutoff Cycle:'}
                  </span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300 print:text-black">
                    {payslipData.cycleStartDate} {isRtl ? 'إلى' : 'to'} {payslipData.cycleEndDate}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 print:text-black">
                  {payslipData.cycleStartDay === 1
                    ? (isRtl ? 'دورة تقويمية كاملة (1 إلى نهاية الشهر)' : 'Full Calendar Month (1st to End)')
                    : (isRtl ? `دورة مقفلة يوم ${payslipData.cycleStartDay} (من ${payslipData.cycleStartDay} السابق إلى ${payslipData.cycleStartDay - 1} الحالي)` : `Cutoff Cycle (Day ${payslipData.cycleStartDay} to ${payslipData.cycleStartDay - 1})`)}
                </div>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3 border-b border-slate-200 dark:border-slate-800 print:border-black font-sans text-xs">
                <div>
                  <span className="font-bold text-slate-500 block">
                    {isRtl ? 'اسم الموظف:' : 'Employee:'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-950 dark:text-white print:text-black">
                    {payslipData.employeeName}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">
                    {isRtl ? 'المسمى الوظيفي:' : 'Job Title:'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 print:text-black">
                    {payslipData.jobTitle}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">
                    {isRtl ? 'القسم الإداري:' : 'Department:'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 print:text-black">
                    {payslipData.departmentName}
                  </span>
                </div>
              </div>

              {/* Employee Payout Method & Channel Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans print:border-black print:bg-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">{isRtl ? 'طريقة صرف واستلام الراتب:' : 'Payout Channel & Details:'}</span>
                    <span className="font-extrabold text-slate-950 dark:text-white capitalize">
                      {payslipData.paymentMethod === 'bank_transfer' ? (isRtl ? 'تحويل بنكي' : 'Bank Transfer')
                        : payslipData.paymentMethod === 'instapay' ? 'InstaPay'
                        : payslipData.paymentMethod === 'vodafone_cash' || payslipData.paymentMethod === 'e_wallet' ? (isRtl ? 'محفظة إلكترونية / فودافون كاش' : 'E-Wallet')
                        : payslipData.paymentMethod === 'cash' ? (isRtl ? 'نقداً / كاش' : 'Cash')
                        : payslipData.paymentMethod === 'fawry' ? 'Fawry'
                        : payslipData.paymentMethod === 'cheque' ? (isRtl ? 'شيك مصرفي' : 'Cheque')
                        : payslipData.paymentMethod}
                    </span>
                    {payslipData.employeeAccountInfo && (
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-sans block mt-0.5">
                        {payslipData.employeeAccountInfo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin Quick Payout Method Selector */}
                <div className="flex items-center gap-2 print:hidden">
                  <span className="text-slate-400 text-[11px]">{isRtl ? 'تغيير طريقة الصرف:' : 'Change Method:'}</span>
                  <select
                    value={payslipData.paymentMethod}
                    onChange={(e) => handleChangePaymentMethod(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
                  >
                    <option value="bank_transfer">{isRtl ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                    <option value="instapay">InstaPay</option>
                    <option value="vodafone_cash">{isRtl ? 'فودافون كاش / محفظة' : 'Vodafone Cash / Wallet'}</option>
                    <option value="cash">{isRtl ? 'كاش / نقداً' : 'Cash'}</option>
                    <option value="cheque">{isRtl ? 'شيك مصرفي' : 'Cheque'}</option>
                    <option value="fawry">Fawry</option>
                  </select>
                </div>
              </div>

              {/* Financial Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                {/* Earnings */}
                <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40 print:border-black print:bg-transparent">
                  <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 print:text-black border-b border-slate-200 dark:border-slate-700 pb-1.5 uppercase">
                    {isRtl ? 'الاستحقاقات والإضافات (+)' : 'Earnings (+)'}
                  </h4>
                  <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span>{isRtl ? 'الراتب الأساسي:' : 'Basic Salary:'}</span>
                      {payslipData.isProrated && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          {isRtl ? `معدل (${payslipData.proratedDays} يوم)` : `Prorated (${payslipData.proratedDays}d)`}
                        </span>
                      )}
                    </span>
                    <span className="font-bold font-sans">
                      {payslipData.basicSalary.toLocaleString()} EGP
                    </span>
                  </div>
                  {enableCommissions && (
                    <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                      <span>
                        {isRtl
                          ? `العمولات (${payslipData.commissionRate}%):`
                          : `Commissions (${payslipData.commissionRate}%):`}
                      </span>
                      <span className="font-bold font-sans">
                        {payslipData.commission.toLocaleString()} EGP
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                    <span>{isRtl ? 'المكافآت المعتمدة:' : 'Approved Bonuses:'}</span>
                    <span className="font-bold font-sans text-emerald-600 dark:text-emerald-400">
                      {payslipData.bonuses.toLocaleString()} EGP
                    </span>
                  </div>
                  {enableOvertime && payslipData.overtime > 0 && (
                    <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                      <span>{isRtl ? 'العمل الإضافي (Overtime):' : 'Approved Overtime:'}</span>
                      <span className="font-bold font-sans text-emerald-600 dark:text-emerald-400">
                        {payslipData.overtime.toLocaleString()} EGP
                      </span>
                    </div>
                  )}
                  {payslipData.nightShiftAllowance > 0 && (
                    <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                      <span>{isRtl ? 'بدل وردية ليلية:' : 'Night Shift Allowance:'}</span>
                      <span className="font-bold font-sans text-purple-600 dark:text-purple-400">
                        +{payslipData.nightShiftAllowance.toLocaleString()} EGP
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-extrabold pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white print:text-black">
                    <span>{isRtl ? 'إجمالي الاستحقاقات:' : 'Gross Earnings:'}</span>
                    <span className="font-sans">
                      {payslipData.grossEarnings.toLocaleString()} EGP
                    </span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40 print:border-black print:bg-transparent">
                  <h4 className="text-xs font-extrabold text-rose-600 print:text-black border-b border-slate-200 dark:border-slate-700 pb-1.5 uppercase">
                    {isRtl ? 'الاستقطاعات والخصومات (-)' : 'Deductions (-)'}
                  </h4>
                  {enableAdvances && (
                    <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                      <span>{isRtl ? 'السلف المسحوبة:' : 'Advances Deducted:'}</span>
                      <span className="font-bold font-sans">
                        {payslipData.advances.toLocaleString()} EGP
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                    <span>{isRtl ? 'الجزاءات والخصومات:' : 'Penalties:'}</span>
                    <span className="font-bold font-sans text-rose-600 dark:text-rose-400">
                      {payslipData.penalties.toLocaleString()} EGP
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                    <span>{isRtl ? 'خصم التأخير التلقائي:' : 'Lateness Deductions:'}</span>
                    <span className="font-bold font-sans">
                      {payslipData.latenessDeductions.toLocaleString()} EGP
                    </span>
                  </div>
                  {payslipData.incomeTax > 0 && (
                    <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                      <span>{isRtl ? 'ضريبة كسب العمل:' : 'Income Tax:'}</span>
                      <span className="font-bold font-sans text-rose-600 dark:text-rose-400">
                        {payslipData.incomeTax.toLocaleString()} EGP
                      </span>
                    </div>
                  )}
                  {enableInsurances && (
                    <>
                      <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                        <span>{isRtl ? 'التأمين الاجتماعي:' : 'Social Insurance:'}</span>
                        <span className="font-bold font-sans">
                          {payslipData.socialInsurance.toLocaleString()} EGP
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200">
                        <span>{isRtl ? 'التأمين الصحي:' : 'Health Insurance:'}</span>
                        <span className="font-bold font-sans">
                          {payslipData.healthInsurance.toLocaleString()} EGP
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-xs font-extrabold pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white print:text-black">
                    <span>{isRtl ? 'إجمالي الاستقطاعات:' : 'Total Deductions:'}</span>
                    <span className="font-sans">
                      {payslipData.totalDeductions.toLocaleString()} EGP
                    </span>
                  </div>
                </div>
              </div>

              {/* Net pay summary panel */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center font-sans print:border-black print:bg-transparent">
                <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  {isRtl ? 'صافي الراتب المستحق للصرف' : 'Net Take-Home Pay'}
                </span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 print:text-black font-sans">
                  {payslipData.netPay.toLocaleString()} EGP
                </span>
              </div>

              {/* Commission Disbursement & Deferral Controls */}
              {enableCommissions && payslipData.commissionTotal > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3 font-sans print:border-black print:bg-transparent">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 dark:border-amber-800/40 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 print:text-black" />
                        <h4 className="text-xs font-extrabold text-amber-950 dark:text-amber-200 print:text-black">
                          {isRtl ? 'إدارة صرف وتأجيل العمولة (العمولة المؤجلة)' : 'Commission Payout & Deferral'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                        {isRtl
                          ? 'يمكنك صرف العمولة بالكامل، تأجيلها للشهر القادم، أو صرف جزء وتأجيل المتبقي تلقائياً.'
                          : 'Choose to disburse full commission, defer to next month, or split and carry forward remainder.'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-bold">
                        {isRtl ? 'إجمالي العمولة المتاحة' : 'Total Available Commission'}
                      </span>
                      <span className="text-sm font-black text-amber-900 dark:text-amber-100 font-sans">
                        {payslipData.commissionTotal.toLocaleString()} EGP
                      </span>
                      {payslipData.carriedDeferredCommission > 0 && (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">
                          {isRtl
                            ? `(تشمل ${payslipData.carriedDeferredCommission.toLocaleString()} ج.م مرحّلة من الشهر السابق)`
                            : `(includes ${payslipData.carriedDeferredCommission.toLocaleString()} EGP carried over)`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary badges */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 print:border-black">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {isRtl ? 'المصروف الآن مع الراتب:' : 'Paid with this salary:'}
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
                        {payslipData.commissionPaid.toLocaleString()} EGP
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 print:border-black">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {isRtl ? 'العمولة المؤجلة للشهر القادم:' : 'Deferred to next cycle:'}
                      </span>
                      <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-sans">
                        {payslipData.commissionDeferred.toLocaleString()} EGP
                      </span>
                    </div>
                  </div>

                  {/* Admin action buttons */}
                  <div className="space-y-2 pt-1 print:hidden">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      {isRtl ? 'خيارات الصرف السريع:' : 'Quick Actions:'}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleAdjustCommission(payslipData.commissionTotal);
                          setCustomPartialCommission(payslipData.commissionTotal);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {isRtl ? 'صرف كامل العمولة هذا الشهر' : 'Pay Full Commission'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAdjustCommission(0);
                          setCustomPartialCommission(0);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {isRtl ? 'تأجيل كامل العمولة للشهر القادم' : 'Defer All to Next Month'}
                      </button>
                    </div>

                    {/* Custom partial disbursement */}
                    <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/30">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                        {isRtl ? 'صرف جزء محدد:' : 'Custom Partial Payout:'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={payslipData.commissionTotal}
                        placeholder={isRtl ? 'المبلغ المراد صرفه' : 'Amount to pay'}
                        value={customPartialCommission !== '' ? customPartialCommission : payslipData.commissionPaid}
                        onChange={(e) => setCustomPartialCommission(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-32 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold font-sans text-slate-950 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customPartialCommission !== '') {
                            handleAdjustCommission(Number(customPartialCommission));
                          }
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      >
                        {isRtl ? 'تطبيق التوزيع' : 'Apply Split'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Salary Disbursement & Confirmation Card */}
              <div
                className={`p-4 rounded-2xl border transition-all font-sans print:border-black print:bg-transparent ${
                  payslipData.paymentStatus === 'paid'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        payslipData.paymentStatus === 'paid'
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-950 dark:text-white">
                          {isRtl ? 'حالة اعتماد وصرف الراتب:' : 'Salary Disbursement Status:'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            payslipData.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          }`}
                        >
                          {payslipData.paymentStatus === 'paid'
                            ? (isRtl ? 'تم الدفع والصرف للموظف' : 'Paid & Disbursed')
                            : (isRtl ? 'قيد المراجعة / لم يتم الدفع بعد' : 'Pending Payment')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {payslipData.paymentStatus === 'paid'
                          ? (isRtl
                              ? `تم توثيق صرف الراتب (${payslipData.netPay.toLocaleString()} ج.م) عبر ${payslipData.paymentMethod} ${payslipData.paidAt ? `بتاريخ ${new Date(payslipData.paidAt).toLocaleDateString('ar-EG')}` : ''}`
                              : `Recorded paid via ${payslipData.paymentMethod} ${payslipData.paidAt ? `on ${new Date(payslipData.paidAt).toLocaleDateString()}` : ''}`)
                          : (isRtl
                              ? 'اضغط أدناه لتوثيق أن الشركة قامت بتحويل وصرف الراتب للموظف لهذا الشهر.'
                              : 'Click below to confirm that salary has been officially disbursed to employee.')}
                      </p>
                    </div>
                  </div>

                  {/* Payment toggle buttons */}
                  <div className="print:hidden">
                    {payslipData.paymentStatus === 'paid' ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleTogglePaymentStatus('unpaid')}
                        className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${submitting ? 'animate-spin' : ''}`} />
                        {isRtl ? 'إلغاء التأكيد / إعادة إلى معلق' : 'Revert to Unpaid'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleTogglePaymentStatus('paid')}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                      >
                        <CheckCircle2 className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
                        {isRtl ? 'تأكيد دفع وصرف المرتب للموظف' : 'Mark as Paid & Disbursed'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showPayslip && (
          <div className="space-y-6 print:hidden">
            {/* Top Config Engine Card */}
            <div id="payslips" className="cleariq-card p-6 cleariq-card-hover space-y-4 scroll-mt-24">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  {isRtl ? 'محرك احتساب الرواتب والمفردات الشهرية' : 'Payroll Engine & Payslip Generator'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl
                    ? 'احتساب صافي الراتب، استقطاع السلف والتأخير آلياً، واحتساب العمولات المسجلة في ملف الموظف'
                    : 'Calculate net payouts, auto-deduct lateness & advances, and apply individual commission rates'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                    {isRtl ? 'اختر الموظف' : 'Select Employee'}
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-950 focus:outline-none cursor-pointer"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.full_name} ({e.job_title || 'Staff'} - Comm:{' '}
                        {e.commission_rate ?? 5}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                    {isRtl ? 'شهر الاستحقاق' : 'Payroll Month'}
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-950 focus:outline-none font-sans"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={compilePayslip}
                className="w-full gradient-btn py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{isRtl ? 'احتساب وعرض مفردات المرتب' : 'Calculate & View Net Payslip'}</span>
              </button>
            </div>

            {/* Adjustments Logging grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form: Bonus & Penalty Adjustments with explicit employee picker */}
              <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">
                    {isRtl ? 'تسجيل المكافآت والجزاءات المالية' : 'Log Financial Adjustments (Bonus / Penalty)'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl
                      ? 'حدد الموظف المستهدف ونوع التعديل المالي والمبلغ والسبب.'
                      : 'Pick the exact employee, adjustment category, amount, and reason.'}
                  </p>
                </div>

                {msg && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                      msg.error
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {msg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="font-medium">{msg.text}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAdjustment} className="space-y-4">
                  {/* Explicit Employee Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                      {isRtl ? 'الموظف المستهدف:' : 'Target Employee:'}
                    </label>
                    <select
                      value={adjEmployee}
                      onChange={(e) => setAdjEmployee(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 focus:outline-none cursor-pointer"
                    >
                      <option value="">{isRtl ? 'اختر الموظف...' : 'Select target employee...'}</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.full_name} ({e.job_title || 'Employee'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                        {isRtl ? 'نوع التعديل:' : 'Adjustment Type:'}
                      </label>
                      <select
                        value={adjType}
                        onChange={(e) => setAdjType(e.target.value as 'bonus' | 'penalty')}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 focus:outline-none cursor-pointer"
                      >
                        <option value="bonus">{isRtl ? 'مكافأة (+)' : 'Bonus (+)'}</option>
                        <option value="penalty">{isRtl ? 'جزاء / خصم (-)' : 'Penalty (-)'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                        {isRtl ? 'المبلغ (ج.م):' : 'Amount (EGP):'}
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 500"
                        value={adjAmount}
                        onChange={(e) =>
                          setAdjAmount(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 focus:outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
                      {isRtl ? 'سبب التعديل / الملاحظات:' : 'Reason / Notes:'}
                    </label>
                    <input
                      type="text"
                      placeholder={isRtl ? 'اكتب سبب التعديل...' : 'Reason for adjustment...'}
                      value={adjNotes}
                      onChange={(e) => setAdjNotes(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !adjAmount || !adjEmployee}
                    className="w-full gradient-btn py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? 'تسجيل التعديل المالي' : 'Submit Adjustment'}</span>
                  </button>
                </form>
              </div>

              {/* Adjustments & Advances Verification Table */}
              <div id="advances" className="cleariq-card p-6 cleariq-card-hover space-y-4 max-h-[520px] overflow-y-auto pr-1 scroll-mt-24">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">
                    {isRtl ? 'سجل السلف والتعديلات المالية' : 'Adjustments & Advances Ledger'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl
                      ? 'مراجعة وتأكيد طلبات السلف والتعديلات المالية.'
                      : 'Audit and approve pending loans and financial modifications.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                    {isRtl ? 'التعديلات المالية (مكافآت وجزاءات)' : 'Adjustments (Bonuses & Penalties)'}
                  </h4>
                  {adjustments.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                      {isRtl ? 'لا توجد تعديلات مالية مسجلة بعد' : 'No financial adjustments logged yet.'}
                    </div>
                  ) : (
                    adjustments.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs font-sans"
                    >
                      <div>
                        <div className="font-bold text-slate-950 dark:text-white">
                          {a.user?.full_name || 'Employee'} -{' '}
                          <span
                            className={
                              a.type === 'bonus'
                                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                                : 'text-rose-600 dark:text-rose-400 font-extrabold'
                            }
                          >
                            {a.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {a.notes || 'No reason'} ({a.date})
                        </div>
                        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
                          {Number(a.amount ?? 0).toLocaleString()} EGP
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSuperAdmin && (a.status === 'pending' || a.status === 'dept_approved') ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusAdjustment(a.id, 'approved')}
                              disabled={actionId === a.id}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg cursor-pointer"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusAdjustment(a.id, 'rejected')}
                              disabled={actionId === a.id}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg cursor-pointer"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              a.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : a.status === 'dept_approved'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400'
                                : a.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            {a.status === 'dept_approved' ? 'Dept Approved' : a.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                  )}

                  {enableAdvances && (
                    <>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        {isRtl
                          ? 'طلبات السلف المالية (مقدمة من الموظف)'
                          : 'Employee Salary Advance Requests'}
                      </h4>
                      {advances.map((a) => (
                        <div
                          key={a.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs font-sans"
                        >
                          <div>
                            <div className="font-bold text-slate-950 dark:text-white">
                              {a.user?.full_name || 'Employee'}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Month: {a.month?.substring(0, 7)}
                            </div>
                            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
                              {Number(a.amount ?? 0).toLocaleString()} EGP
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSuperAdmin && a.status === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStatusAdvance(a.id, 'approved')}
                                  disabled={actionId === a.id}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg cursor-pointer"
                                  title="Approve"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusAdvance(a.id, 'rejected')}
                                  disabled={actionId === a.id}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg cursor-pointer"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  a.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                                }`}
                              >
                                {a.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {advances.length === 0 && (
                        <div className="text-center py-3 text-xs text-slate-400">
                          {isRtl ? 'لا توجد طلبات سلف مسجلة.' : 'No advance requests found.'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
