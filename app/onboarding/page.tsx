'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Building, Settings, MapPin, Clock, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw, Plus, Trash2, ShieldCheck, DollarSign, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { BranchLocation } from '@/lib/types/database';
import HumAiLogo from '@/components/common/HumAiLogo';

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

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const token = searchParams.get('token');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Token Validation State
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [needAccount, setNeedAccount] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Step 1: Company Profile & Industry
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Organization');

  // Step 2: Feature Toggles
  const [enableShifts, setEnableShifts] = useState(true);
  const [enableAdvances, setEnableAdvances] = useState(true);
  const [enableCommissions, setEnableCommissions] = useState(true);
  const [enableInsurances, setEnableInsurances] = useState(true);

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
    { id: '1', name: 'Main Branch / الفرع الرئيسي', lat: 30.0444, lng: 31.2357, radius: 150 },
  ]);

  // Step 5: Lateness Policy & Advance Rules
  const [gracePeriodMins, setGracePeriodMins] = useState<number>(15);
  const [latenessMode, setLatenessMode] = useState<'tiered' | 'percentage_per_minute'>('tiered');
  const [late15, setLate15] = useState<number>(0.25);
  const [late30, setLate30] = useState<number>(0.5);
  const [late60, setLate60] = useState<number>(1.0);
  const [minuteDeductionRate, setMinuteDeductionRate] = useState<number>(0.005); // 0.5% per min
  const [maxAdvancePercentage, setMaxAdvancePercentage] = useState<number>(50);
  const [advanceEligibilityDay, setAdvanceEligibilityDay] = useState<number>(15);

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
          setNeedAccount(false);
        } else {
          setNeedAccount(true);
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
          if (settings.enable_shifts !== undefined) setEnableShifts(settings.enable_shifts);
          if (settings.enable_advances !== undefined) setEnableAdvances(settings.enable_advances);
          if (settings.enable_commissions !== undefined) setEnableCommissions(settings.enable_commissions);
          if (settings.enable_insurances !== undefined) setEnableInsurances(settings.enable_insurances);
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
      { id: newId, name: `Branch ${newId}`, lat: 30.0444, lng: 31.2357, radius: 150 },
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
      alert('Please enter your company name');
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
          { mins: 15, deduction: Number(late15) },
          { mins: 30, deduction: Number(late30) },
          { mins: 60, deduction: Number(late60) },
        ],
      };

      const primaryBranch = branches[0];

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

        const { error: settingsErr } = await supabase.from('tenant_settings').upsert({
          tenant_id: newTenantId,
          industry,
          branches,
          enable_advances: enableAdvances,
          enable_commissions: enableCommissions,
          enable_insurances: enableInsurances,
          enable_shifts: enableShifts,
          work_start_time: workStartTime,
          work_end_time: workEndTime,
          work_days: workDays,
          grace_period_mins: Number(gracePeriodMins),
          lateness_mode: latenessMode,
          minute_deduction_rate: Number(minuteDeductionRate),
          max_advance_percentage: Number(maxAdvancePercentage),
          advance_eligibility_day: Number(advanceEligibilityDay),
          lateness_policy,
          geofencing_lat: primaryBranch ? Number(primaryBranch.lat) : null,
          geofencing_lng: primaryBranch ? Number(primaryBranch.lng) : null,
          geofencing_radius: primaryBranch ? Number(primaryBranch.radius) : 150,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'tenant_id' });

        if (settingsErr) throw settingsErr;

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
            industry,
            branches,
            enable_advances: enableAdvances,
            enable_commissions: enableCommissions,
            enable_insurances: enableInsurances,
            enable_shifts: enableShifts,
            work_start_time: workStartTime,
            work_end_time: workEndTime,
            work_days: workDays,
            grace_period_mins: Number(gracePeriodMins),
            lateness_mode: latenessMode,
            minute_deduction_rate: Number(minuteDeductionRate),
            max_advance_percentage: Number(maxAdvancePercentage),
            advance_eligibility_day: Number(advanceEligibilityDay),
            lateness_policy,
            geofencing_lat: primaryBranch ? Number(primaryBranch.lat) : null,
            geofencing_lng: primaryBranch ? Number(primaryBranch.lng) : null,
            geofencing_radius: primaryBranch ? Number(primaryBranch.radius) : 150,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'tenant_id' });

        if (settingsErr) throw settingsErr;

        router.push('/dashboard/admin');
        router.refresh();
      } else {
        throw new Error('Missing activation token or company tenant ID');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Setup wizard failed';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };


  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-500 mr-2" />
        Checking profile onboarding status...
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
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Invalid Activation Link</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {tokenError ||
                'This activation link is invalid, expired, or has already been used. Please contact HumAi Support or your account representative to request a new onboarding invitation.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full px-6 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Return to Sign In
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
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <HumAiLogo variant="horizontal" size="md" showTagline />
            </div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Create Super Admin Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Welcome to <span className="font-bold text-slate-900 dark:text-white">{companyName || 'HumAi'}</span>. Set up your master Super Admin credentials to begin.
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
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mostafa Ashmawy"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email *
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
                Master Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
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
              Create Super Admin & Continue
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <HumAiLogo variant="horizontal" size="sm" showTagline />
            </div>
            <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-bold">Step {step} of 5</span>
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
                Company Profile & Industry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Name your company workspace and select your industry sector to tailor HumAi.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Industry Sector *
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

        {/* STEP 2: Feature & Shifts Toggles */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                Modules & Shift System Toggles
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enable or disable operational modules tailored to your company needs.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">Shifts System</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enable flexible and multiple shifts per department
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableShifts}
                  onChange={(e) => setEnableShifts(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">Salary Advances</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Allow employees to request monthly salary loans
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableAdvances}
                  onChange={(e) => setEnableAdvances(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">Sales & Commissions Engine</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Track client sales achievements and payroll commissions
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableCommissions}
                  onChange={(e) => setEnableCommissions(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-950 dark:text-slate-100">
                    Social & Health Insurance Deductions
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Include insurance contributions in payroll calculations
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableInsurances}
                  onChange={(e) => setEnableInsurances(e.target.checked)}
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
                Default Company Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure company-wide standard working hours and active working days of the week.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Shift Start Time
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
                    Shift End Time
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
                  Active Working Days
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = workDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500'
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
                  Multi-Branch Geofencing
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Define approved branch locations & accuracy radiuses for employee attendance.
                </p>
              </div>
              <button
                type="button"
                onClick={addBranch}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-emerald-600 dark:text-emerald-400 border border-sky-500/30 rounded-xl text-xs font-bold transition-all"
              >
                <Plus className="w-4 h-4" /> Add Branch
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {branches.map((branch, idx) => (
                <div
                  key={branch.id || idx}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                      Branch #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => captureCurrentLocation(idx)}
                        className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline"
                      >
                        Pin Current Location
                      </button>
                      {branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBranch(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) => updateBranch(idx, 'name', e.target.value)}
                      placeholder="e.g. Cairo HQ / Nasr City Branch"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={branch.lat}
                        onChange={(e) => updateBranch(idx, 'lat', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={branch.lng}
                        onChange={(e) => updateBranch(idx, 'lng', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">Radius (Meters)</label>
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

        {/* STEP 5: Policy Engines & Advance Rules */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Lateness Engine & Salary Advance Rules
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure deduction modes, grace periods, and advance ceilings.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  Lateness Policy
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Grace Period (Minutes)
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
                      Deduction Mode
                    </label>
                    <select
                      value={latenessMode}
                      onChange={(e) =>
                        setLatenessMode(e.target.value as 'tiered' | 'percentage_per_minute')
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      <option value="tiered">Tiered Intervals (15m, 30m, 60m+)</option>
                      <option value="percentage_per_minute">Exact Minute % (Custom Rate)</option>
                    </select>
                  </div>
                </div>

                {latenessMode === 'tiered' ? (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">15 Mins Delay</label>
                      <input
                        type="number"
                        step="0.05"
                        value={late15}
                        onChange={(e) => setLate15(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">e.g. 0.25 day</span>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">30 Mins Delay</label>
                      <input
                        type="number"
                        step="0.05"
                        value={late30}
                        onChange={(e) => setLate30(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">e.g. 0.50 day</span>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">60+ Mins Delay</label>
                      <input
                        type="number"
                        step="0.05"
                        value={late60}
                        onChange={(e) => setLate60(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">e.g. 1.00 day</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Minute Deduction Rate (% of Daily Wage)
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

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Salary Advance Engine Rules
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Max Advance Cap (% of Basic Salary)
                    </label>
                    <input
                      type="number"
                      value={maxAdvancePercentage}
                      onChange={(e) => setMaxAdvancePercentage(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">e.g. Max 50%</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Eligibility Start Day of Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={advanceEligibilityDay}
                      onChange={(e) => setAdvanceEligibilityDay(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-sans"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">e.g. Available after day 15</span>
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
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
              Launch HumAi Workspace
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
