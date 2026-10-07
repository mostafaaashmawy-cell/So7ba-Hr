'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Building,
  Settings,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  ShieldCheck,
  DollarSign,
  Lock,
  Mail,
  User,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { BranchLocation } from '@/lib/types/database';
import HumAiLogo from '@/components/common/HumAiLogo';
import { useLanguage } from '@/lib/context/LanguageContext';
import { logAuditAction } from '@/lib/utils/auditLogger';

const INDUSTRIES = [
  'Organization',
  'Real Estate',
  'Retail',
  'Healthcare & Medical',
  'Education',
  'Consulting',
  'Manufacturing',
  'Travel',
  'Agency',
  'Food & Beverage',
  'Others',
];

const DAYS_OF_WEEK = [
  { key: 'Sunday', label: 'Sunday / الأحد' },
  { key: 'Monday', label: 'Monday / الاثنين' },
  { key: 'Tuesday', label: 'Tuesday / الثلاثاء' },
  { key: 'Wednesday', label: 'Wednesday / الأربعاء' },
  { key: 'Thursday', label: 'Thursday / الخميس' },
  { key: 'Friday', label: 'Friday / الجمعة' },
  { key: 'Saturday', label: 'Saturday / السبت' },
];

function parseGoogleMapsUrl(input: string): { lat: number; lng: number } | null {
  if (!input) return null;
  const trimmed = input.trim();

  // 1. Direct coordinates: "30.0444, 31.2357"
  const directMatch = trimmed.match(/^([-+]?\d{1,3}\.\d+)[,\s]+([-+]?\d{1,3}\.\d+)$/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 2. URL containing @lat,lng e.g. https://www.google.com/maps/@30.0444,31.2357,17z
  const atMatch = trimmed.match(/@([-+]?\d{1,3}\.\d+),([-+]?\d{1,3}\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 3. URL containing q=lat,lng or ll=lat,lng or destination=lat,lng
  const queryMatch = trimmed.match(/[?&](?:q|ll|destination|query)=([-+]?\d{1,3}\.\d+)[,%2C\s]+([-+]?\d{1,3}\.\d+)/i);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 4. URL containing /place/lat,lng or search/lat,lng
  const placeMatch = trimmed.match(/\/(?:place|search)\/([-+]?\d{1,3}\.\d+)[,%2C\s]+([-+]?\d{1,3}\.\d+)/i);
  if (placeMatch) {
    const lat = parseFloat(placeMatch[1]);
    const lng = parseFloat(placeMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  return null;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { language, setLanguage, isRtl } = useLanguage();

  const token = searchParams.get('token');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Token Validation State
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [needAccount, setNeedAccount] = useState(false);
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(null);
  const [sessionConfirmed, setSessionConfirmed] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Step 1: Company Profile & Industry
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Organization');

  // Step 2: Feature Toggles & Policies
  const [enableShifts, setEnableShifts] = useState(true);
  const [enableAdvances, setEnableAdvances] = useState(true);
  const [enableCommissions, setEnableCommissions] = useState(true);
  const [enableInsurances, setEnableInsurances] = useState(true);
  const [enableHolidayComp, setEnableHolidayComp] = useState(true);
  const [enableIncomeTax, setEnableIncomeTax] = useState(false);
  const [leaveApprovalMode, setLeaveApprovalMode] = useState<'auto_approve' | 'hierarchical'>('auto_approve');

  // Step 3: Default Company Schedule
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('17:00');
  const [workDays, setWorkDays] = useState<string[]>([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
  ]);

  // Step 4: Multi-Branch Geofencing
  const [branches, setBranches] = useState<BranchLocation[]>([
    { id: '1', name: 'Main Branch / الفرع الرئيسي', lat: 30.0444, lng: 31.2357, radius: 150, map_url: '' },
  ]);
  const [resolvingMapIndex, setResolvingMapIndex] = useState<number | null>(null);

  // Step 5: Lateness Policy, Overtime & Advance Rules
  const [gracePeriodMins, setGracePeriodMins] = useState<number>(15);
  const [latenessMode, setLatenessMode] = useState<'tiered' | 'percentage_per_minute'>('tiered');
  const [lateTier1Mins, setLateTier1Mins] = useState<number>(15);
  const [lateTier1Deduction, setLateTier1Deduction] = useState<number>(0.25);
  const [lateTier2Mins, setLateTier2Mins] = useState<number>(30);
  const [lateTier2Deduction, setLateTier2Deduction] = useState<number>(0.5);
  const [lateTier3Mins, setLateTier3Mins] = useState<number>(60);
  const [lateTier3Deduction, setLateTier3Deduction] = useState<number>(1.0);
  const [minuteDeductionRate, setMinuteDeductionRate] = useState<number>(0.005); // 0.5% per min

  // Overtime Engine
  const [enableOvertime, setEnableOvertime] = useState(true);
  const [overtimeMode, setOvertimeMode] = useState<'multiplier' | 'fixed_rate'>('multiplier');
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);
  const [overtimeFixedRate, setOvertimeFixedRate] = useState<number>(50);

  // Advance Rules
  const [maxAdvancePercentage, setMaxAdvancePercentage] = useState<number>(50);
  const [advanceEligibilityDay, setAdvanceEligibilityDay] = useState<number>(15);
  const [maxMonthlyTenantAdvanceBudget, setMaxMonthlyTenantAdvanceBudget] = useState<number>(0);

  const [existingTenantId, setExistingTenantId] = useState<string | null>(null);

  useEffect(() => {
    const initOnboarding = async () => {
      // 1. Check if token is provided
      if (token) {
        const { data: tokenRes, error: tokenErr } = await supabase.rpc('validate_activation_token', {
          p_token: token,
        });

        if (tokenErr || !tokenRes || !tokenRes.valid) {
          setTokenValid(false);
          setTokenError(tokenRes?.error || tokenErr?.message || 'Invalid or expired activation link');
          setChecking(false);
          return;
        }

        setTokenValid(true);
        if (tokenRes.company_name) setCompanyName(tokenRes.company_name);
        if (tokenRes.email) setAdminEmail(tokenRes.email);

        // Check if user is already logged in
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          setActiveUserEmail(user.email || null);
          setSessionConfirmed(false);
          setNeedAccount(false);
        } else {
          setNeedAccount(true);
          setSessionConfirmed(true);
        }
        setChecking(false);
        return;
      }

      // 2. No token: check if user is an existing Super Admin re-configuring
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTokenValid(false);
        setTokenError('An activation token is required to register a new organization on HumAi.');
        setChecking(false);
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile && profile.tenant_id) {
        if (profile.role !== 'super_admin') {
          router.push('/dashboard/employee');
          return;
        }

        // Prefill existing settings for Super Admin re-trigger
        setExistingTenantId(profile.tenant_id);
        setTokenValid(true);

        const { data: tenant } = await supabase
          .from('tenants')
          .select('name')
          .eq('id', profile.tenant_id)
          .single();
        if (tenant) setCompanyName(tenant.name || '');

        const { data: settings } = await supabase
          .from('tenant_settings')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .single();

        if (settings) {
          if (settings.industry) setIndustry(settings.industry);
          if (settings.branches && settings.branches.length > 0) setBranches(settings.branches);
          if (settings.work_start_time) setWorkStartTime(settings.work_start_time);
          if (settings.work_end_time) setWorkEndTime(settings.work_end_time);
          if (settings.work_days) setWorkDays(settings.work_days);
          if (settings.grace_period_mins !== undefined) setGracePeriodMins(settings.grace_period_mins);
          if (settings.lateness_mode) setLatenessMode(settings.lateness_mode);
          if (settings.minute_deduction_rate !== undefined) setMinuteDeductionRate(settings.minute_deduction_rate);
          if (settings.max_advance_percentage !== undefined) setMaxAdvancePercentage(settings.max_advance_percentage);
          if (settings.advance_eligibility_day !== undefined) setAdvanceEligibilityDay(settings.advance_eligibility_day);
          if (settings.max_monthly_tenant_advance_budget !== undefined)
            setMaxMonthlyTenantAdvanceBudget(settings.max_monthly_tenant_advance_budget);

          if (settings.enable_shifts !== undefined) setEnableShifts(settings.enable_shifts);
          if (settings.enable_advances !== undefined) setEnableAdvances(settings.enable_advances);
          if (settings.enable_commissions !== undefined) setEnableCommissions(settings.enable_commissions);
          if (settings.enable_insurances !== undefined) setEnableInsurances(settings.enable_insurances);
          if (settings.enable_holiday_work_comp !== undefined) setEnableHolidayComp(settings.enable_holiday_work_comp);
          if (settings.enable_income_tax !== undefined) setEnableIncomeTax(settings.enable_income_tax);
          if (settings.leave_approval_mode) setLeaveApprovalMode(settings.leave_approval_mode as 'auto_approve' | 'hierarchical');

          if (settings.enable_overtime !== undefined) setEnableOvertime(settings.enable_overtime);
          if (settings.overtime_rate_multiplier !== undefined) setOvertimeMultiplier(settings.overtime_rate_multiplier);
          if (settings.overtime_calculation_mode) setOvertimeMode(settings.overtime_calculation_mode);
          if (settings.overtime_fixed_rate !== undefined) setOvertimeFixedRate(settings.overtime_fixed_rate);

          // Tiered late deduction rules
          const thresholds = settings.late_thresholds || settings.lateness_policy?.thresholds;
          if (thresholds && thresholds.length > 0) {
            if (thresholds[0]) {
              setLateTier1Mins(thresholds[0].mins || 15);
              setLateTier1Deduction(thresholds[0].deduction ?? 0.25);
            }
            if (thresholds[1]) {
              setLateTier2Mins(thresholds[1].mins || 30);
              setLateTier2Deduction(thresholds[1].deduction ?? 0.5);
            }
            if (thresholds[2]) {
              setLateTier3Mins(thresholds[2].mins || 60);
              setLateTier3Deduction(thresholds[2].deduction ?? 1.0);
            }
          }
        }
      } else {
        // User is logged in but has no tenant and provided no token
        setTokenValid(false);
        setTokenError('An activation token is required to register a new organization.');
      }
      setChecking(false);
    };

    initOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: adminEmail.trim(),
        password: adminPassword,
        options: {
          data: {
            full_name: adminName.trim(),
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Account registration failed');

      setUserId(data.user.id);
      setNeedAccount(false);
      setStep(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create Super Admin account';
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    if (workDays.includes(day)) {
      setWorkDays(workDays.filter((d) => d !== day));
    } else {
      setWorkDays([...workDays, day]);
    }
  };

  const addBranch = () => {
    const newId = (branches.length + 1).toString();
    setBranches([
      ...branches,
      { id: newId, name: `Branch ${newId}`, lat: 30.0444, lng: 31.2357, radius: 150, map_url: '' },
    ]);
  };

  const removeBranch = (index: number) => {
    if (branches.length <= 1) return;
    setBranches(branches.filter((_, i) => i !== index));
  };

  const updateBranch = (index: number, field: keyof BranchLocation, value: string | number) => {
    const updated = [...branches];
    updated[index] = { ...updated[index], [field]: value };
    setBranches(updated);
  };

  const handleBranchGoogleMapsUrlChange = async (idx: number, inputUrl: string) => {
    const trimmed = inputUrl.trim();
    const next = [...branches];
    next[idx] = { ...next[idx], map_url: inputUrl };
    setBranches(next);

    if (!trimmed) return;

    // Check synchronous regex first
    const direct = parseGoogleMapsUrl(trimmed);
    if (direct) {
      const updated = [...branches];
      updated[idx] = { ...updated[idx], map_url: trimmed, lat: direct.lat, lng: direct.lng };
      setBranches(updated);
      return;
    }

    if (!trimmed.startsWith('http')) return;

    setResolvingMapIndex(idx);
    try {
      const res = await fetch('/api/resolve-maps-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (data.success && data.lat && data.lng) {
        setBranches((prev) => {
          const list = [...prev];
          if (list[idx]) {
            list[idx] = {
              ...list[idx],
              map_url: trimmed,
              lat: data.lat,
              lng: data.lng,
            };
          }
          return list;
        });
      }
    } catch (e) {
      console.error('Failed to resolve maps link:', e);
    } finally {
      setResolvingMapIndex(null);
    }
  };

  const captureCurrentLocation = (index: number) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateBranch(index, 'lat', pos.coords.latitude);
          updateBranch(index, 'lng', pos.coords.longitude);
        },
        (err) => {
          alert('Location error: ' + err.message);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleNext = () => {
    if (step === 1 && !companyName.trim()) {
      alert(isRtl ? 'يرجى إدخال اسم المؤسسة / الشركة' : 'Please enter your company name');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!userId || !companyName.trim()) return;

    setLoading(true);
    try {
      const lateness_policy = {
        thresholds: [
          { mins: Number(lateTier1Mins || 15), deduction: Number(lateTier1Deduction ?? 0.25) },
          { mins: Number(lateTier2Mins || 30), deduction: Number(lateTier2Deduction ?? 0.5) },
          { mins: Number(lateTier3Mins || 60), deduction: Number(lateTier3Deduction ?? 1.0) },
        ],
      };
      const late_thresholds = [
        { mins: Number(lateTier1Mins || 15), deduction: Number(lateTier1Deduction ?? 0.25) },
        { mins: Number(lateTier2Mins || 30), deduction: Number(lateTier2Deduction ?? 0.5) },
        { mins: Number(lateTier3Mins || 60), deduction: Number(lateTier3Deduction ?? 1.0) },
      ];

      const primaryBranch = branches[0];

      const settingsPayload = {
        industry: industry || 'Organization',
        branches: branches || [],
        work_start_time: workStartTime || '09:00',
        work_end_time: workEndTime || '17:00',
        work_days: workDays || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        grace_period_mins: Number(gracePeriodMins || 15),
        lateness_mode: latenessMode || 'tiered',
        minute_deduction_rate: Number(minuteDeductionRate || 0.005),
        max_advance_percentage: Number(maxAdvancePercentage || 50),
        advance_eligibility_day: Number(advanceEligibilityDay || 15),
        max_monthly_tenant_advance_budget: Number(maxMonthlyTenantAdvanceBudget || 0),
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
        leave_approval_mode: leaveApprovalMode || 'auto_approve',
        geofencing_lat: primaryBranch ? Number(primaryBranch.lat) : null,
        geofencing_lng: primaryBranch ? Number(primaryBranch.lng) : null,
        geofencing_radius: primaryBranch ? Number(primaryBranch.radius || 150) : 150,
        lateness_policy,
        late_thresholds,
        updated_at: new Date().toISOString(),
      };

      if (token) {
        // First-time setup with valid activation token
        const { data: claimData, error: claimErr } = await supabase.rpc('claim_activation_token', {
          p_token: token,
          p_user_id: userId,
          p_company_name: companyName.trim(),
        });

        if (claimErr) throw claimErr;
        if (!claimData || !claimData.success) {
          throw new Error(claimData?.error || 'Failed to claim activation token');
        }

        const newTenantId = claimData.tenant_id;

        const { error: settingsErr } = await supabase
          .from('tenant_settings')
          .upsert({
            tenant_id: newTenantId,
            ...settingsPayload,
          }, { onConflict: 'tenant_id' });

        if (settingsErr) throw settingsErr;

        // Log to audit trail
        await logAuditAction(supabase, {
          tenant_id: newTenantId,
          actor_id: userId,
          action_type: 'ONBOARDING_INITIALIZE_TENANT',
          target_entity: 'tenant_settings',
          details: { company_name: companyName.trim(), industry },
        });

        router.push('/dashboard/admin');
        router.refresh();
      } else if (existingTenantId) {
        // Re-run Wizard: Update existing tenant and settings
        await supabase
          .from('tenants')
          .update({ name: companyName.trim() })
          .eq('id', existingTenantId);

        const { error: settingsErr } = await supabase
          .from('tenant_settings')
          .upsert({
            tenant_id: existingTenantId,
            ...settingsPayload,
          }, { onConflict: 'tenant_id' });

        if (settingsErr) throw settingsErr;

        // Log to audit trail
        await logAuditAction(supabase, {
          tenant_id: existingTenantId,
          actor_id: userId,
          action_type: 'ONBOARDING_UPDATE_SETTINGS',
          target_entity: 'tenant_settings',
          details: { company_name: companyName.trim(), industry },
        });

        router.push('/dashboard/admin');
        router.refresh();
      } else {
        throw new Error('Missing activation token or company tenant ID');
      }
    } catch (err: unknown) {
      console.error('Setup wizard error:', err);
      const errMsg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : typeof err === 'string'
              ? err
              : JSON.stringify(err) || 'Setup wizard failed';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-500 mr-2" />
        {isRtl ? 'جاري التحقق من حالة حساب التفعيل...' : 'Checking profile onboarding status...'}
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md cleariq-card p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
              {isRtl ? 'رابط التفعيل غير صالح أو منتهي' : 'Invalid Activation Link'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {tokenError ||
                (isRtl
                  ? 'رابط التفعيل هذا غير صالح، منتهي الصلاحية، أو تم استخدامه بالفعل مسبقاً.'
                  : 'This activation link is invalid, expired, or has already been used. Please contact HumAi Support to request a new onboarding invitation.')}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full px-6 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isRtl ? 'العودة لصفحة تسجيل الدخول' : 'Return to Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (token && activeUserEmail && !sessionConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md cleariq-card p-8 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <HumAiLogo variant="horizontal" size="sm" showTagline />
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
              {isRtl ? 'تم اكتشاف جلسة نشطة مسبقاً' : 'Active Account Detected'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'أنت مسجل الدخول حالياً في هذا المتصفح بحساب:'
                : 'You are currently signed in on this browser as:'}
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {activeUserEmail}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              {isRtl
                ? `هل تريد استخدام هذا الحساب ليكون هو المدير العام (Super Admin) لشركة "${companyName || 'الشركة الجديدة'}"، أم تسجيل الخروج وإنشاء حساب جديد مخصص للشركة؟`
                : `Would you like to use this account as the Super Admin for "${companyName || 'the new organization'}", or sign out and create a dedicated new account?`}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSessionConfirmed(true);
                setNeedAccount(false);
                setStep(1);
              }}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20"
            >
              {isRtl ? 'المتابعة بهذا الحساب كمدير عام' : 'Continue with This Account'}
            </button>

            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                setActiveUserEmail(null);
                setUserId(null);
                setSessionConfirmed(true);
                setNeedAccount(true);
                setStep(0);
              }}
              className="w-full py-2.5 px-4 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {isRtl ? 'تسجيل الخروج وإنشاء حساب جديد (بريد وباسورد جديد)' : 'Sign Out & Create a New Admin Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (needAccount) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md cleariq-card p-8 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <HumAiLogo variant="horizontal" size="sm" showTagline />
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              {isRtl ? 'إنشاء حساب المدير العام (Super Admin)' : 'Create Super Admin Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl ? (
                <>مرحباً بك في <span className="font-bold text-slate-900 dark:text-white">{companyName || 'HumAi'}</span>. قم بإنشاء بيانات حساب المدير العام الرئيسي للبدء.</>
              ) : (
                <>Welcome to <span className="font-bold text-slate-900 dark:text-white">{companyName || 'HumAi'}</span>. Set up your master Super Admin credentials to begin.</>
              )}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'الاسم الكامل *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={isRtl ? 'مثال: مصطفى عشماوي' : 'e.g. Mostafa Ashmawy'}
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'البريد الإلكتروني للعمل *' : 'Work Email *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@company.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'كلمة المرور الرئيسية *' : 'Master Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder={isRtl ? '6 خانات على الأقل' : 'Minimum 6 characters'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 py-3 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {isRtl ? 'إنشاء حساب المدير العام والمتابعة' : 'Create Super Admin & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 flex flex-col justify-center items-center p-4">
      {/* Progress Bar & Header */}
      <div className="w-full max-w-2xl cleariq-card p-6 sm:p-10 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <HumAiLogo variant="horizontal" size="sm" showTagline />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
              <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-bold">
                {isRtl ? `الخطوة ${step} من 5` : `Step ${step} of 5`}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Company Profile & Industry */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-500" />
                {isRtl ? 'ملف الشركة ونشاط العمل' : 'Company Profile & Industry'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isRtl
                  ? 'حدد اسم بيئة العمل لمؤسستك ونشاطها لتخصيص محرك HumAi بما يلائمها.'
                  : 'Name your company workspace and select your industry sector to tailor HumAi.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'اسم الشركة / المنظمة *' : 'Company / Organization Name *'}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? 'مثال: شركة صحبة وعيلة' : 'e.g. Acme Corporation Ltd'}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'مجال ونشاط الشركة *' : 'Industry Sector *'}
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Modules & Operational Toggles */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                {isRtl ? 'تفعيل الأنظمة التشغيلية وسياسات الاعتماد' : 'Operational Modules & Policy Toggles'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isRtl
                  ? 'اختر الوحدات والأنظمة المفعلة في بيئة العمل الخاصة بشركتك.'
                  : 'Enable or disable operational modules tailored to your company needs.'}
              </p>
            </div>

            <div className="space-y-3">
              {/* Leave & Permission Approval Mode */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">
                    {isRtl ? 'سياسة اعتماد الإجازات والأذونات' : 'Leave & Permission Approval Policy'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl
                      ? 'اختر آلية معالجة طلبات الإجازات والأذونات المقدمة من الموظفين'
                      : 'Choose how employee leave & permission requests are approved.'}
                  </div>
                </div>
                <select
                  value={leaveApprovalMode}
                  onChange={(e) => setLeaveApprovalMode(e.target.value as 'auto_approve' | 'hierarchical')}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="auto_approve">
                    {isRtl
                      ? 'موافقة فورية تلقائية (Instant Automatic Approval) - بدون مراجعة المدير'
                      : 'Instant Automatic Approval (Direct Deduction)'}
                  </option>
                  <option value="hierarchical">
                    {isRtl
                      ? 'موافقات هرمية متعددة المستويات (Hierarchical Approvals) - تتطلب موافقة المدير والأدمن'
                      : 'Hierarchical Approvals (Requires Manager / Admin Approval)'}
                  </option>
                </select>
              </div>

              {/* Shifts System */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">
                    {isRtl ? 'نظام الورديات المتعددة (Shifts System)' : 'Shifts System'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl ? 'تفعيل الورديات المرنة والمتعددة وتناوب الشفتات' : 'Enable flexible and multiple shifts per department'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableShifts}
                  onChange={(e) => setEnableShifts(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Salary Advances */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">
                    {isRtl ? 'نظام السلف الشهرية (Salary Advances)' : 'Salary Advances'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl ? 'السماح للموظفين بطلب سلف نقدية بحدود مخصصة' : 'Allow employees to request monthly salary advances'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableAdvances}
                  onChange={(e) => setEnableAdvances(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Sales & Commissions */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">
                    {isRtl ? 'محرك المبيعات والعمولات (Commissions Engine)' : 'Sales & Commissions Engine'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl ? 'تتبع مبيعات الموظفين واحتساب العمولات آلياً بالمرتبات' : 'Track client sales achievements and payroll commissions'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableCommissions}
                  onChange={(e) => setEnableCommissions(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Insurances */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">
                    {isRtl ? 'التأمينات الاجتماعية والصحية (Insurances)' : 'Social & Health Insurance Deductions'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl ? 'تضمين اشتراكات التأمينات الاجتماعية والصحية في مسير الرواتب' : 'Include insurance contributions in payroll calculations'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableInsurances}
                  onChange={(e) => setEnableInsurances(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Holiday Work Comp */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">
                    {isRtl ? 'تعويضات العمل في الإجازات الرسمية (Holiday Work)' : 'Holiday Work Compensation'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl ? 'صرف تعويضات مالية أو أيام راحة إضافية عند العمل في العطلات الرسمية' : 'Compensate employees for official public holidays'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableHolidayComp}
                  onChange={(e) => setEnableHolidayComp(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Income Tax */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">
                    {isRtl ? 'ضريبة كسب العمل (Income Tax Law)' : 'Egyptian Income Tax Law'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl ? 'تطبيق شرائح ضريبة كسب العمل المصرية آلياً على المرتبات' : 'Apply Egyptian income tax bracket deductions on payslips'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableIncomeTax}
                  onChange={(e) => setEnableIncomeTax(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Default Company Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                {isRtl ? 'مواعيد العمل وأيام الأسبوع الرسمية' : 'Default Company Schedule'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isRtl
                  ? 'حدد أوقات الدوام الرسمي وساعات العمل القياسية وأيام العمل النشطة للمؤسسة.'
                  : 'Configure company-wide standard working hours and active working days of the week.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isRtl ? 'موعد بدء الوردية (Start Time)' : 'Shift Start Time'}
                  </label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isRtl ? 'موعد انتهاء الوردية (End Time)' : 'Shift End Time'}
                  </label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isRtl ? 'أيام العمل الرسمية النشطة' : 'Active Working Days'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = workDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-500'
                        }`}
                      >
                        <span>{day.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Multi-Branch Geofencing */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  {isRtl ? 'الفروع الجغرافية وحظر الموقع GPS' : 'Multi-Branch Geofencing'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl
                    ? 'حدد فروع العمل مع دعم إضافة رابط Google Maps لاستخراج الإحداثيات الدقيقة تلقائياً.'
                    : 'Define approved branch locations & accuracy radiuses for employee attendance.'}
                </p>
              </div>
              <button
                type="button"
                onClick={addBranch}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> {isRtl ? 'إضافة فرع' : 'Add Branch'}
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {branches.map((branch, idx) => (
                <div
                  key={branch.id || idx}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                      {isRtl ? `الفرع #${idx + 1}` : `Branch #${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => captureCurrentLocation(idx)}
                        className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-emerald-500 underline cursor-pointer"
                      >
                        {isRtl ? 'تحديد موقعي الحالي GPS' : 'Pin Current Location'}
                      </button>
                      {branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBranch(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isRtl ? 'اسم الفرع' : 'Branch Name'}
                    </label>
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) => updateBranch(idx, 'name', e.target.value)}
                      placeholder={isRtl ? 'مثال: الفرع الرئيسي / فرع مدينة نصر' : 'e.g. Cairo HQ / Nasr City Branch'}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Google Maps Link Field with Auto-Resolver */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        {isRtl ? 'رابط موقع خرائط جوجل (Google Maps Link)' : 'Google Maps Location Link'}
                      </label>
                      {branch.lat && branch.lng ? (
                        <a
                          href={`https://www.google.com/maps?q=${branch.lat},${branch.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                        >
                          {isRtl ? 'عرض على الخريطة' : 'View on Google Maps'}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={branch.map_url || ''}
                        onChange={(e) => handleBranchGoogleMapsUrlChange(idx, e.target.value)}
                        placeholder={
                          isRtl
                            ? 'الصق رابط خرائط جوجل هنا (مثل: Share > Copy Link)...'
                            : 'Paste Google Maps link (e.g. from Share > Copy Link)...'
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-sans"
                      />
                      {resolvingMapIndex === idx && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-blue-500">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span className="text-[10px]">{isRtl ? 'جاري الاستخراج...' : 'Resolving...'}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      {isRtl
                        ? 'افتح خرائط Google، اختر موقع الفرع، اضغط مشاركة ثم نسخ الرابط والصقه هنا'
                        : 'Open Google Maps, select branch, tap Share > Copy Link and paste here to resolve accurate coordinates.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                        {isRtl ? 'خط العرض (Latitude)' : 'Latitude'}
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={branch.lat}
                        onChange={(e) => updateBranch(idx, 'lat', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                        {isRtl ? 'خط الطول (Longitude)' : 'Longitude'}
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={branch.lng}
                        onChange={(e) => updateBranch(idx, 'lng', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                        {isRtl ? 'نطاق السماح (بالمتر)' : 'Radius (Meters)'}
                      </label>
                      <input
                        type="number"
                        value={branch.radius}
                        onChange={(e) => updateBranch(idx, 'radius', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Policy Engines, Overtime & Advance Rules */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                {isRtl ? 'محركات التأخير والإضافي وقواعد السلف' : 'Lateness Engine, Overtime & Advance Rules'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isRtl
                  ? 'تحكم كامل في دقائق وشرائح الخصم، ساعات العمل الإضافية، وسقف السلف الشهرية.'
                  : 'Configure tiered lateness deduction slots, overtime policies, and advance limits.'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Lateness Policy Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  {isRtl ? 'محرك سياسات التأخير (Lateness Policy)' : 'Lateness Policy Engine'}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isRtl ? 'فترة السماح (بالدقائق)' : 'Grace Period (Minutes)'}
                    </label>
                    <input
                      type="number"
                      value={gracePeriodMins}
                      onChange={(e) => setGracePeriodMins(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isRtl ? 'طريقة احتساب الخصم' : 'Deduction Mode'}
                    </label>
                    <select
                      value={latenessMode}
                      onChange={(e) =>
                        setLatenessMode(e.target.value as 'tiered' | 'percentage_per_minute')
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      <option value="tiered">
                        {isRtl ? 'خصم شرائحي (Tiered Deductions) - تحكم كامل' : 'Tiered Deductions (Full Slot Control)'}
                      </option>
                      <option value="percentage_per_minute">
                        {isRtl ? 'نسبة مئوية لكل دقيقة (Exact % per Min)' : 'Exact Minute % (Custom Rate)'}
                      </option>
                    </select>
                  </div>
                </div>

                {latenessMode === 'tiered' ? (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {isRtl
                        ? 'قواعد الخصم الشرائحي (تحكم كامل في دقائق وأيام الخصم لكل شريحة):'
                        : 'Custom Tiered Deduction Rules (Full Control on Minutes & Days):'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Tier 1 */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          {isRtl ? 'الشريحة الأولى (Slot 1)' : 'Tier 1'}
                        </span>
                        <div>
                          <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                            {isRtl ? 'التأخير بعد (دقائق)' : 'Delay After (Mins)'}
                          </label>
                          <input
                            type="number"
                            value={lateTier1Mins}
                            onChange={(e) => setLateTier1Mins(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                            {isRtl ? 'قيمة الخصم (أيام عمل)' : 'Deduction (Work Days)'}
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            value={lateTier1Deduction}
                            onChange={(e) => setLateTier1Deduction(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-sans"
                          />
                        </div>
                      </div>

                      {/* Tier 2 */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                          {isRtl ? 'الشريحة الثانية (Slot 2)' : 'Tier 2'}
                        </span>
                        <div>
                          <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                            {isRtl ? 'التأخير بعد (دقائق)' : 'Delay After (Mins)'}
                          </label>
                          <input
                            type="number"
                            value={lateTier2Mins}
                            onChange={(e) => setLateTier2Mins(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                            {isRtl ? 'قيمة الخصم (أيام عمل)' : 'Deduction (Work Days)'}
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            value={lateTier2Deduction}
                            onChange={(e) => setLateTier2Deduction(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-sans"
                          />
                        </div>
                      </div>

                      {/* Tier 3 */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                          {isRtl ? 'الشريحة الثالثة (Slot 3)' : 'Tier 3'}
                        </span>
                        <div>
                          <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                            {isRtl ? 'التأخير بعد (دقائق)' : 'Delay After (Mins)'}
                          </label>
                          <input
                            type="number"
                            value={lateTier3Mins}
                            onChange={(e) => setLateTier3Mins(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                            {isRtl ? 'قيمة الخصم (أيام عمل)' : 'Deduction (Work Days)'}
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            value={lateTier3Deduction}
                            onChange={(e) => setLateTier3Deduction(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isRtl ? 'نسبة الخصم لكل دقيقة تأخير (% من الأجر اليومي)' : 'Minute Deduction Rate (% of Daily Wage)'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.001"
                        value={minuteDeductionRate}
                        onChange={(e) => setMinuteDeductionRate(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                        ({(minuteDeductionRate * 100).toFixed(2)}%/min)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Overtime Engine Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {isRtl ? 'محرك العمل الإضافي (Overtime Engine)' : 'Overtime Calculation Engine'}
                  </div>
                  <input
                    type="checkbox"
                    checked={enableOvertime}
                    onChange={(e) => setEnableOvertime(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {enableOvertime && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isRtl ? 'طريقة احتساب الإضافي' : 'Calculation Mode'}
                      </label>
                      <select
                        value={overtimeMode}
                        onChange={(e) => setOvertimeMode(e.target.value as 'multiplier' | 'fixed_rate')}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                      >
                        <option value="multiplier">
                          {isRtl ? 'مضاعف لأجر الساعة (مثال 1.5x)' : 'Hourly Rate Multiplier (e.g. 1.5x)'}
                        </option>
                        <option value="fixed_rate">
                          {isRtl ? 'مبلغ ثابت لكل ساعة إضافية (EGP)' : 'Fixed EGP Amount per Hour'}
                        </option>
                      </select>
                    </div>

                    <div>
                      {overtimeMode === 'multiplier' ? (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {isRtl ? 'مضاعف الساعة (Multiplier)' : 'Hour Multiplier'}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={overtimeMultiplier}
                            onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {isRtl ? 'المبلغ الثابت للساعة (EGP)' : 'Fixed Rate per Hour (EGP)'}
                          </label>
                          <input
                            type="number"
                            value={overtimeFixedRate}
                            onChange={(e) => setOvertimeFixedRate(Number(e.target.value))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Salary Advance Engine Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  {isRtl ? 'قواعد السلف النقدية (Salary Advance Rules)' : 'Salary Advance Engine Rules'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isRtl ? 'الحد الأقصى (% من الراتب)' : 'Max Advance Cap (% of Salary)'}
                    </label>
                    <input
                      type="number"
                      value={maxAdvancePercentage}
                      onChange={(e) => setMaxAdvancePercentage(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isRtl ? 'مثال: 50% كحد أقصى' : 'e.g. Max 50%'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isRtl ? 'يوم بدء إتاحة السلفة' : 'Eligibility Day of Month'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={advanceEligibilityDay}
                      onChange={(e) => setAdvanceEligibilityDay(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isRtl ? 'متاح بدءاً من يوم 15' : 'Available after day 15'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isRtl ? 'سقف ميزانية السلف الشهرية' : 'Monthly Advance Budget'}
                    </label>
                    <input
                      type="number"
                      value={maxMonthlyTenantAdvanceBudget}
                      onChange={(e) => setMaxMonthlyTenantAdvanceBudget(Number(e.target.value))}
                      placeholder="0 = Unlimited"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isRtl ? '0 = بدون حد أقصى (EGP)' : '0 = Unlimited (EGP)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/80">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {isRtl ? 'السابق' : 'Back'}
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isRtl ? 'المتابعة' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleComplete}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isRtl ? 'إطلاق بيئة عمل HumAi' : 'Launch HumAi Workspace'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500 mr-2" />
          Loading workspace setup...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
