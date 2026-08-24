'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import {
  UserProfile,
  TenantSettings,
  BranchLocation,
  ShiftRecord,
  ShiftSwapRequestRecord,
} from '@/lib/types/database';
import {
  Settings,
  MapPin,
  Clock,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  Sparkles,
  Sliders,
  ArrowLeftRight,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { logAuditAction } from '@/lib/utils/auditLogger';
import Link from 'next/link';

const DAYS_OF_WEEK = [
  { key: 'Sunday', label: 'Sunday / الأحد' },
  { key: 'Monday', label: 'Monday / الاثنين' },
  { key: 'Tuesday', label: 'Tuesday / الثلاثاء' },
  { key: 'Wednesday', label: 'Wednesday / الأربعاء' },
  { key: 'Thursday', label: 'Thursday / الخميس' },
  { key: 'Friday', label: 'Friday / الجمعة' },
  { key: 'Saturday', label: 'Saturday / السبت' },
];

export default function SettingsHubPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isRtl } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Settings State
  const [activeTab, setActiveTab] = useState<
    'schedule' | 'shifts' | 'overtime' | 'geofence' | 'lateness' | 'advances' | 'toggles'
  >('schedule');

  // Company Industry
  const [industry, setIndustry] = useState('Organization');

  // Schedule
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('17:00');
  const [workDays, setWorkDays] = useState<string[]>([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
  ]);

  // Shifts Engine
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('08:00');
  const [newShiftEnd, setNewShiftEnd] = useState('16:00');
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequestRecord[]>([]);

  // Overtime Engine
  const [enableOvertime, setEnableOvertime] = useState(true);
  const [overtimeMode, setOvertimeMode] = useState<'multiplier' | 'fixed_rate'>('multiplier');
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);
  const [overtimeFixedRate, setOvertimeFixedRate] = useState<number>(50);

  // Multi-Branch Geofencing
  const [branches, setBranches] = useState<BranchLocation[]>([
    { id: '1', name: 'Main Branch', lat: 30.0444, lng: 31.2357, radius: 150 },
  ]);

  // Lateness Engine
  const [gracePeriodMins, setGracePeriodMins] = useState<number>(15);
  const [latenessMode, setLatenessMode] = useState<'tiered' | 'percentage_per_minute'>('tiered');
  const [late15, setLate15] = useState<number>(0.25);
  const [late30, setLate30] = useState<number>(0.5);
  const [late60, setLate60] = useState<number>(1.0);
  const [minuteDeductionRate, setMinuteDeductionRate] = useState<number>(0.005);

  // Salary Advance
  const [maxAdvancePercentage, setMaxAdvancePercentage] = useState<number>(50);
  const [advanceEligibilityDay, setAdvanceEligibilityDay] = useState<number>(15);

  // Feature Toggles
  const [enableShifts, setEnableShifts] = useState(true);
  const [enableAdvances, setEnableAdvances] = useState(true);
  const [enableCommissions, setEnableCommissions] = useState(true);
  const [enableInsurances, setEnableInsurances] = useState(true);
  const [enableHolidayComp, setEnableHolidayComp] = useState(true);
  const [enableIncomeTax, setEnableIncomeTax] = useState(false);

  // Load User & Tenant Settings
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

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

        // Fetch Tenant Settings
        const { data: settings } = await supabase
          .from('tenant_settings')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .maybeSingle();

        if (settings) {
          const s = settings as TenantSettings;
          if (s.industry) setIndustry(s.industry);
          if (s.work_start_time) setWorkStartTime(s.work_start_time);
          if (s.work_end_time) setWorkEndTime(s.work_end_time);
          if (s.work_days) setWorkDays(s.work_days);
          if (s.branches && s.branches.length > 0) setBranches(s.branches);
          if (s.grace_period_mins !== undefined) setGracePeriodMins(s.grace_period_mins);
          if (s.lateness_mode) setLatenessMode(s.lateness_mode);
          if (s.minute_deduction_rate !== undefined)
            setMinuteDeductionRate(s.minute_deduction_rate);
          if (s.max_advance_percentage !== undefined)
            setMaxAdvancePercentage(s.max_advance_percentage);
          if (s.advance_eligibility_day !== undefined)
            setAdvanceEligibilityDay(s.advance_eligibility_day);

          if (s.enable_shifts !== undefined) setEnableShifts(s.enable_shifts);
          if (s.enable_advances !== undefined) setEnableAdvances(s.enable_advances);
          if (s.enable_commissions !== undefined) setEnableCommissions(s.enable_commissions);
          if (s.enable_insurances !== undefined) setEnableInsurances(s.enable_insurances);
          if (s.enable_holiday_work_comp !== undefined)
            setEnableHolidayComp(s.enable_holiday_work_comp);
          if (s.enable_income_tax !== undefined)
            setEnableIncomeTax(s.enable_income_tax);

          if (s.enable_overtime !== undefined) setEnableOvertime(s.enable_overtime);
          if (s.overtime_rate_multiplier !== undefined)
            setOvertimeMultiplier(s.overtime_rate_multiplier);
          if (s.overtime_calculation_mode) setOvertimeMode(s.overtime_calculation_mode);
          if (s.overtime_fixed_rate !== undefined) setOvertimeFixedRate(s.overtime_fixed_rate);

          if (s.lateness_policy?.thresholds) {
            s.lateness_policy.thresholds.forEach((t) => {
              if (t.mins === 15) setLate15(t.deduction);
              if (t.mins === 30) setLate30(t.deduction);
              if (t.mins === 60) setLate60(t.deduction);
            });
          }
        }

        // Fetch Shifts
        const { data: shiftsData } = await supabase
          .from('shifts')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('start_time');

        if (shiftsData) setShifts(shiftsData as ShiftRecord[]);

        // Fetch Pending Shift Swap Requests
        const { data: swapData } = await supabase
          .from('shift_swap_requests')
          .select('*, requester:users!shift_swap_requests_requester_id_fkey(full_name), target_user:users!shift_swap_requests_target_user_id_fkey(full_name)')
          .eq('tenant_id', profile.tenant_id)
          .order('created_at', { ascending: false });

        if (swapData) setSwapRequests(swapData as ShiftSwapRequestRecord[]);
      }
      setLoading(false);
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDay = (day: string) => {
    if (workDays.includes(day)) {
      setWorkDays(workDays.filter((d) => d !== day));
    } else {
      setWorkDays([...workDays, day]);
    }
  };

  const addBranch = () => {
    const newId = String(Date.now());
    setBranches([
      ...branches,
      { id: newId, name: `Branch #${branches.length + 1}`, lat: 30.0444, lng: 31.2357, radius: 150 },
    ]);
  };

  const removeBranch = (idx: number) => {
    if (branches.length === 1) return;
    setBranches(branches.filter((_, i) => i !== idx));
  };

  const updateBranch = (idx: number, field: keyof BranchLocation, value: string | number) => {
    const next = [...branches];
    next[idx] = { ...next[idx], [field]: value };
    setBranches(next);
  };

  // Add Shift
  const handleAddShift = async () => {
    if (!newShiftName.trim() || !currentUser?.tenant_id) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          tenant_id: currentUser.tenant_id,
          name: newShiftName.trim(),
          start_time: newShiftStart,
          end_time: newShiftEnd,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setShifts([...shifts, data as ShiftRecord]);
        setNewShiftName('');
        setMsg({ text: isRtl ? 'تمت إضافة الوردية بنجاح!' : 'Shift schedule created!', error: false });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to add shift';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  // Delete Shift
  const handleDeleteShift = async (id: string) => {
    if (!confirm(isRtl ? 'هل تريد حذف هذه الوردية؟' : 'Delete this shift?')) return;
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (!error) {
      setShifts(shifts.filter((s) => s.id !== id));
      setMsg({ text: isRtl ? 'تم حذف الوردية بنجاح.' : 'Shift deleted.', error: false });
    }
  };

  // Approve / Reject Shift Swap
  const handleReviewSwap = async (id: string, status: 'approved' | 'rejected') => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({
          status,
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // If approved, swap user shift assignments
      const swapReq = swapRequests.find((s) => s.id === id);
      if (status === 'approved' && swapReq) {
        logAuditAction(supabase, {
          tenant_id: currentUser.tenant_id!,
          actor_id: currentUser.id,
          action_type: 'APPROVE_SHIFT_SWAP',
          entity_name: 'shift_swap_requests',
          entity_id: id,
          details: {
            requester_id: swapReq.requester_id,
            target_user_id: swapReq.target_user_id,
            requested_date: swapReq.requested_date,
          },
        });
      }

      setSwapRequests(
        swapRequests.map((s) => (s.id === id ? { ...s, status, reviewed_by: currentUser.id } : s))
      );

      setMsg({
        text: status === 'approved' ? 'Shift swap approved!' : 'Shift swap rejected.',
        error: false,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Action failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  // Save Settings Hub
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.tenant_id) return;

    setSaving(true);
    setMsg(null);

    const primaryBranch = branches && branches.length > 0 ? branches[0] : null;

    const payload = {
      tenant_id: currentUser.tenant_id,
      industry: industry || 'Organization',
      work_start_time: workStartTime,
      work_end_time: workEndTime,
      work_days: workDays,
      branches: branches || [],
      grace_period_mins: Number(gracePeriodMins || 15),
      lateness_mode: latenessMode || 'tiered',
      minute_deduction_rate: Number(minuteDeductionRate || 0.005),
      max_advance_percentage: Number(maxAdvancePercentage || 50),
      advance_eligibility_day: Number(advanceEligibilityDay || 15),
      enable_shifts: Boolean(enableShifts),
      enable_advances: Boolean(enableAdvances),
      enable_commissions: Boolean(enableCommissions),
      enable_insurances: Boolean(enableInsurances),
      enable_holiday_work_comp: Boolean(enableHolidayComp),
      enable_income_tax: Boolean(enableIncomeTax),
      enable_overtime: Boolean(enableOvertime),
      overtime_rate_multiplier: Number(overtimeMultiplier || 1.5),
      overtime_calculation_mode: overtimeMode || 'multiplier',
      overtime_fixed_rate: Number(overtimeFixedRate || 50),
      geofencing_lat: primaryBranch ? Number(primaryBranch.lat) : null,
      geofencing_lng: primaryBranch ? Number(primaryBranch.lng) : null,
      geofencing_radius: primaryBranch ? Number(primaryBranch.radius || 200) : 200,
      lateness_policy: {
        thresholds: [
          { mins: 15, deduction: Number(late15 || 0.25) },
          { mins: 30, deduction: Number(late30 || 0.5) },
          { mins: 60, deduction: Number(late60 || 1.0) },
        ],
      },
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('tenant_settings')
        .upsert(payload, { onConflict: 'tenant_id' });

      if (error) throw error;

      // Log to audit trail
      await logAuditAction(supabase, {
        tenant_id: currentUser.tenant_id,
        actor_id: currentUser.id,
        action_type: 'UPDATE_COMPANY_POLICIES',
        target_entity: 'tenant_settings',
        details: payload,
      });

      setMsg({
        text: isRtl ? 'تم حفظ إعدادات وسياسات الشركة بنجاح!' : 'Company policies and rules saved successfully!',
        error: false,
      });
    } catch (err: unknown) {
      console.error('Settings save error:', err);
      let errMsg = 'Save failed';
      if (err instanceof Error) {
        errMsg = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errMsg = String((err as { message: unknown }).message);
      }
      setMsg({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg) flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
        Loading settings hub...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={currentUser} activeRoleView="super_admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Header Title with Setup Wizard Re-trigger Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-xs">
              <Sliders className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white">
                {isRtl ? 'لوحة سياسات وإعدادات الشركة' : 'Company Policies & Operations Settings'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isRtl
                  ? 'إدارة الورديات، ساعات العمل، النطاق الجغرافي، وحسابات التأخير والعمل الإضافي'
                  : 'Manage Shifts, Working Hours, Multi-Branch GPS, Lateness, and Overtime Engines'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isRtl ? 'إعادة تشغيل معالج الإعداد' : 'Re-run Setup Wizard'}</span>
            </Link>
          </div>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
              msg.error
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span className="font-bold">{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Top Horizontal Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" /> {isRtl ? 'ساعات وأيام العمل' : 'Working Hours'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shifts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'shifts'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" /> {isRtl ? 'نظام الورديات والتبديل' : 'Shifts & Swaps'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overtime')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'overtime'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> {isRtl ? 'العمل الإضافي (Overtime)' : 'Overtime Engine'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('geofence')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'geofence'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <MapPin className="w-4 h-4" /> {isRtl ? 'الفروع والنطاق الجغرافي' : 'Multi-Branch GPS'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lateness')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'lateness'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> {isRtl ? 'سياسة التأخير والخصم' : 'Lateness Engine'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('advances')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'advances'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <DollarSign className="w-4 h-4" /> {isRtl ? 'سلف المرتبات' : 'Salary Advances'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('toggles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'toggles'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" /> {isRtl ? 'تفعيل وحدات النظام' : 'Feature Toggles'}
            </button>
          </div>

          {/* TAB 1: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  {isRtl ? 'ساعات العمل وأيام الأسبوع الرسمية' : 'Official Working Hours & Days'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl ? 'تحديد مواعيد الحضور والانصراف الافتراضية' : 'Set standard shifts and operating days.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'موعد بدء العمل الافتراضي' : 'Work Start Time'}
                  </label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'موعد نهاية العمل الافتراضي' : 'Work End Time'}
                  </label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'أيام العمل الرسمية في الأسبوع' : 'Official Operating Days'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = workDays.includes(day.key);
                    return (
                      <button
                        type="button"
                        key={day.key}
                        onClick={() => toggleDay(day.key)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{day.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIFTS SYSTEM & SWAP APPROVALS */}
          {activeTab === 'shifts' && (
            <div className="space-y-6">
              {/* Shift Definitions */}
              <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
                    {isRtl ? 'إعداد ورديات العمل المتعددة (Multi-Shift Schedules)' : 'Multi-Shift Schedule Definition'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isRtl
                      ? 'تحديد الورديات (صباحية، مسائية، ليلية) لتقييم الحضور بناءً على ساعات كل وردية'
                      : 'Define distinct shifts (Morning, Evening, Night) to evaluate lateness by employee shift.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isRtl ? 'اسم الوردية' : 'Shift Name'}
                    </label>
                    <input
                      type="text"
                      value={newShiftName}
                      onChange={(e) => setNewShiftName(e.target.value)}
                      placeholder="e.g. Morning Shift (وردية صباحية)"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isRtl ? 'وقت البدء' : 'Start Time'}
                    </label>
                    <input
                      type="time"
                      value={newShiftStart}
                      onChange={(e) => setNewShiftStart(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isRtl ? 'وقت الانتهاء' : 'End Time'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={newShiftEnd}
                        onChange={(e) => setNewShiftEnd(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                      />
                      <button
                        type="button"
                        onClick={handleAddShift}
                        disabled={saving}
                        className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {shifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-extrabold text-slate-950 dark:text-white block">
                          {shift.name}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                          {shift.start_time} — {shift.end_time}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteShift(shift.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shift Swap Requests Management */}
              <div className="cleariq-card p-6 cleariq-card-hover space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    {isRtl ? 'طلبات تبديل الورديات الواردة' : 'Shift Swap Proposals & Approvals'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isRtl
                      ? 'مراجعة واعتماد طلبات التبديل بين الموظفين'
                      : 'Review and approve/reject shift swap requests submitted by employees.'}
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-3">{isRtl ? 'التاريخ' : 'Date'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'الموظف الطالب' : 'Requester'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'الموظف البديل' : 'Target'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'الحالة' : 'Status'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'ملاحظات' : 'Notes'}</th>
                        <th className="py-2.5 px-3 text-center">{isRtl ? 'الإجراء' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {swapRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                            {isRtl ? 'لا توجد طلبات تبديل ورديات حالياً' : 'No shift swap requests found.'}
                          </td>
                        </tr>
                      ) : (
                        swapRequests.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                            <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-slate-100">
                              {s.requested_date}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-950 dark:text-white">
                              {s.requester?.full_name || 'Requester'}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-950 dark:text-white">
                              {s.target_user?.full_name || 'Target'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : s.status === 'rejected'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                              {s.notes || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {s.status === 'pending_admin' && (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleReviewSwap(s.id, 'approved')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReviewSwap(s.id, 'rejected')}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OVERTIME ENGINE */}
          {activeTab === 'overtime' && (
            <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  {isRtl ? 'محرك وسياسات العمل الإضافي (Overtime Engine)' : 'Overtime Policy & Calculation Engine'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl
                    ? 'احتساب ساعات العمل الإضافية وإضافتها تلقائياً لكشوف المرتبات'
                    : 'Calculate excess working hours and automatically add overtime payouts into Payslips.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {isRtl ? 'تفعيل نظام العمل الإضافي (Enable Overtime)' : 'Enable Overtime Calculations'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isRtl ? 'حساب ساعات العمل الإضافية آلياً' : 'Automatically compute overtime beyond shift hours.'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableOvertime}
                  onChange={(e) => setEnableOvertime(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {enableOvertime && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRtl ? 'طريقة احتساب العمل الإضافي' : 'Overtime Calculation Mode'}
                    </label>
                    <select
                      value={overtimeMode}
                      onChange={(e) => setOvertimeMode(e.target.value as 'multiplier' | 'fixed_rate')}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white cursor-pointer"
                    >
                      <option value="multiplier">{isRtl ? 'مضاعف أجر الساعة (Multiplier Rate)' : 'Hourly Wage Multiplier (e.g. 1.5x, 2.0x)'}</option>
                      <option value="fixed_rate">{isRtl ? 'مبلغ ثابت لكل ساعة إضافية' : 'Fixed EGP Amount per Overtime Hour'}</option>
                    </select>
                  </div>

                  {overtimeMode === 'multiplier' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isRtl ? 'مضاعف الساعة (Multiplier)' : 'Rate Multiplier (e.g. 1.5 for 150%)'}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={overtimeMultiplier}
                        onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isRtl ? 'المبلغ الثابت لكل ساعة (EGP)' : 'Fixed Rate per Overtime Hour (EGP)'}
                      </label>
                      <input
                        type="number"
                        value={overtimeFixedRate}
                        onChange={(e) => setOvertimeFixedRate(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MULTI-BRANCH GEOFENCING */}
          {activeTab === 'geofence' && (
            <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    {isRtl ? 'إعدادات الفروع والنطاق الجغرافي (Multi-Branch GPS)' : 'Multi-Branch Geofencing Parameters'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isRtl ? 'تحديد إحداثيات ونصف قطر الفروع المعتمدة' : 'Define authorized workplace coordinates and radius.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addBranch}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {isRtl ? 'إضافة فرع' : 'Add Branch'}
                </button>
              </div>

              <div className="space-y-4">
                {branches.map((branch, idx) => (
                  <div
                    key={branch.id || idx}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Branch #{idx + 1}
                      </span>
                      {branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBranch(idx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                        >
                          Remove Branch
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          value={branch.name}
                          onChange={(e) => updateBranch(idx, 'name', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Latitude (خط العرض)
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={branch.lat}
                          onChange={(e) => updateBranch(idx, 'lat', Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Longitude (خط الطول)
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={branch.lng}
                          onChange={(e) => updateBranch(idx, 'lng', Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Radius (متر)
                        </label>
                        <input
                          type="number"
                          value={branch.radius}
                          onChange={(e) => updateBranch(idx, 'radius', Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LATENESS ENGINE */}
          {activeTab === 'lateness' && (
            <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  {isRtl ? 'محرك وسياسات التأخير والخصم' : 'Lateness Engine & Deduction Rules'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl ? 'تحديد فترة السماح وطريقة الخصم الآلي' : 'Set grace period and automated penalty formulas.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'فترة السماح بالدقائق (Grace Period)' : 'Grace Period (Minutes)'}
                  </label>
                  <input
                    type="number"
                    value={gracePeriodMins}
                    onChange={(e) => setGracePeriodMins(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'طريقة احتساب الخصم' : 'Lateness Calculation Mode'}
                  </label>
                  <select
                    value={latenessMode}
                    onChange={(e) => setLatenessMode(e.target.value as 'tiered' | 'percentage_per_minute')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white cursor-pointer"
                  >
                    <option value="tiered">{isRtl ? 'شرائح تصاعدية (Tiered Deductions)' : 'Tiered Deductions'}</option>
                    <option value="percentage_per_minute">{isRtl ? 'نسبة مئوية لكل دقيقة (Per-Minute %)' : 'Percentage Per Minute'}</option>
                  </select>
                </div>
              </div>

              {latenessMode === 'tiered' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      15 Mins Late (Deduction Days)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={late15}
                      onChange={(e) => setLate15(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      30 Mins Late (Deduction Days)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={late30}
                      onChange={(e) => setLate30(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      60 Mins Late (Deduction Days)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={late60}
                      onChange={(e) => setLate60(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Minute Deduction Rate (e.g. 0.005 = 0.5% per minute)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={minuteDeductionRate}
                    onChange={(e) => setMinuteDeductionRate(Number(e.target.value))}
                    className="w-full max-w-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SALARY ADVANCE */}
          {activeTab === 'advances' && (
            <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  {isRtl ? 'معايير وسياسات سلف المرتبات' : 'Salary Advance Parameters'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl ? 'الحد الأقصى للسلفة وتاريخ الاستحقاق' : 'Configure borrowing thresholds and eligibility dates.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'الحد الأقصى للسلفة (% من الراتب)' : 'Max Advance Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    value={maxAdvancePercentage}
                    onChange={(e) => setMaxAdvancePercentage(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'يوم بدء استحقاق السلفة في الشهر' : 'Eligibility Day of Month (e.g. 15th)'}
                  </label>
                  <input
                    type="number"
                    value={advanceEligibilityDay}
                    onChange={(e) => setAdvanceEligibilityDay(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 dark:text-white font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FEATURE TOGGLES */}
          {activeTab === 'toggles' && (
            <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  {isRtl ? 'التحكم في وحدات ونوافذ النظام (Feature Toggles)' : 'Enterprise Feature Activation Toggles'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl
                    ? 'إخفاء أو إظهار الوحدات في كامل التطبيق بناءً على احتياج الشركة'
                    : 'Toggle modules on/off dynamically across all sidebars, hubs, and calculations.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Shifts System</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Multi-shift schedules and shift swaps</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableShifts}
                    onChange={(e) => setEnableShifts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Salary Advances</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Allow borrowing and payroll deduction</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAdvances}
                    onChange={(e) => setEnableAdvances(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Sales & Commissions</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Sales logging and commission tracking</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCommissions}
                    onChange={(e) => setEnableCommissions(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Insurances Engine</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Social and health insurance deductions</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableInsurances}
                    onChange={(e) => setEnableInsurances(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Holiday Work Compensations</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Additional leave balance for holiday shifts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableHolidayComp}
                    onChange={(e) => setEnableHolidayComp(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Income Tax Engine</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Deduct customized income tax percentage per employee</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableIncomeTax}
                    onChange={(e) => setEnableIncomeTax(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="gradient-btn px-8 py-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{saving ? (isRtl ? 'جاري الحفظ...' : 'Saving Policies...') : (isRtl ? 'حفظ السياسات والإعدادات' : 'Save Company Policies')}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
