'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import {
  UserProfile,
  TenantSettings,
  BranchLocation,
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
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
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
  const [activeTab, setActiveTab] = useState<'schedule' | 'geofence' | 'lateness' | 'advances' | 'toggles'>('schedule');

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

          if (s.lateness_policy?.thresholds) {
            s.lateness_policy.thresholds.forEach((t) => {
              if (t.mins === 15) setLate15(t.deduction);
              if (t.mins === 30) setLate30(t.deduction);
              if (t.mins === 60) setLate60(t.deduction);
            });
          }
        }
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
        (err) => alert('Location error: ' + err.message),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSaveSettings = async () => {
    if (!currentUser || !currentUser.tenant_id) return;

    setSaving(true);
    setMsg(null);

    const lateness_policy = {
      thresholds: [
        { mins: 15, deduction: Number(late15) },
        { mins: 30, deduction: Number(late30) },
        { mins: 60, deduction: Number(late60) },
      ],
    };

    const primaryBranch = branches[0];

    try {
      const { error } = await supabase
        .from('tenant_settings')
        .update({
          branches,
          work_start_time: workStartTime,
          work_end_time: workEndTime,
          work_days: workDays,
          grace_period_mins: Number(gracePeriodMins),
          lateness_mode: latenessMode,
          minute_deduction_rate: Number(minuteDeductionRate),
          max_advance_percentage: Number(maxAdvancePercentage),
          advance_eligibility_day: Number(advanceEligibilityDay),
          enable_shifts: enableShifts,
          enable_advances: enableAdvances,
          enable_commissions: enableCommissions,
          enable_insurances: enableInsurances,
          enable_holiday_work_comp: enableHolidayComp,
          lateness_policy,
          geofencing_lat: primaryBranch ? Number(primaryBranch.lat) : null,
          geofencing_lng: primaryBranch ? Number(primaryBranch.lng) : null,
          geofencing_radius: primaryBranch ? Number(primaryBranch.radius) : 150,
        })
        .eq('tenant_id', currentUser.tenant_id);

      if (error) throw error;

      setMsg({
        text: isRtl ? 'تم حفظ وتطبيق السياسات بنجاح!' : 'Company policies saved and applied successfully!',
        error: false,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Save failed';
      setMsg({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
        Loading HumAi policies hub...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans pb-16 md:pb-8">
      <Navbar user={currentUser} activeRoleView="super_admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Administration Portal
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-6 h-6 text-blue-600" />
              {isRtl ? 'مركز سياسات وإعدادات الشركة' : 'Company Policies & Settings Hub'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl
                ? 'إدارة مواعيد العمل، الفروع الجغرافية، قواعد التأخير، والسلف المالية'
                : 'Manage working hours, geofenced branches, lateness rules, and advance limits'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/onboarding"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              {isRtl ? 'إعادة تشغيل معالج الإعداد' : 'Re-run Setup Wizard'}
            </Link>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveSettings}
              className="gradient-btn flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isRtl ? 'حفظ السياسات' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Alert Notification */}
        {msg && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
              msg.error
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {msg.error ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Settings Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            ⏰ {isRtl ? 'ساعات وأيام العمل' : 'Work Schedule'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('geofence')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'geofence'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            📍 {isRtl ? 'الفروع والبصمة الجغرافية' : 'Branches & Geofence'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lateness')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'lateness'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            🛡️ {isRtl ? 'محرك خصومات التأخير' : 'Lateness Rules'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('advances')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'advances'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            💵 {isRtl ? 'قواعد السلف المالية' : 'Salary Advances'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('toggles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'toggles'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            ⚙️ {isRtl ? 'تفعيل وتعطيل الموديولات' : 'Feature Switches'}
          </button>
        </div>

        {/* TAB 1: Work Schedule */}
        {activeTab === 'schedule' && (
          <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {isRtl ? 'المواعيد وساعات العمل الرسمية للشركة' : 'Official Company Working Schedule'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl
                  ? 'تحدد هذه المواعيد وقت الحضور الافتراضي لكافة الموظفين ما لم يتم تخصيص وردية خاصة'
                  : 'Defines the standard start and end times for all employees across the workspace'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isRtl ? 'وقت بدء الوردية' : 'Default Start Time'}
                </label>
                <input
                  type="time"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isRtl ? 'وقت نهاية الوردية' : 'Default End Time'}
                </label>
                <input
                  type="time"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                {isRtl ? 'أيام العمل الرسمية المعتمدة' : 'Active Working Days of the Week'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = workDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span>{day.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Multi-Branch Geofencing */}
        {activeTab === 'geofence' && (
          <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {isRtl ? 'فروع الشركة والبصمة الجغرافية' : 'Multi-Branch Geofence Locations'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRtl
                    ? 'يتم التحقق من قرب الموظف من أي فرع من هذه الفروع المعتمدة أثناء تسجيل الحضور'
                    : 'Attendance is validated against all configured branch radiuses during check-in'}
                </p>
              </div>
              <button
                type="button"
                onClick={addBranch}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> {isRtl ? 'إضافة فرع' : 'Add Branch'}
              </button>
            </div>

            <div className="space-y-4">
              {branches.map((branch, idx) => (
                <div
                  key={branch.id || idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                      Branch #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => captureCurrentLocation(idx)}
                        className="text-[11px] text-blue-600 hover:underline font-bold"
                      >
                        Pin Current Location
                      </button>
                      {branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBranch(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) => updateBranch(idx, 'name', e.target.value)}
                      placeholder="e.g. Cairo HQ / Nasr City Branch"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={branch.lat}
                        onChange={(e) => updateBranch(idx, 'lat', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={branch.lng}
                        onChange={(e) => updateBranch(idx, 'lng', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Radius (Meters)</label>
                      <input
                        type="number"
                        value={branch.radius}
                        onChange={(e) => updateBranch(idx, 'radius', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Lateness Rules */}
        {activeTab === 'lateness' && (
          <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                {isRtl ? 'محرك وقواعد خصومات التأخير' : 'Lateness Deduction Engine Rules'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl
                  ? 'يتم تطبيق هذه القواعد آلياً في مسير الرواتب الشهري لحساب خصم التأخيرات'
                  : 'Automated policy applied when generating monthly payslips based on check-in timestamps'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isRtl ? 'فترة السماح (بالدقائق)' : 'Grace Period (Minutes)'}
                </label>
                <input
                  type="number"
                  value={gracePeriodMins}
                  onChange={(e) => setGracePeriodMins(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isRtl ? 'نظام الخصم' : 'Deduction Mode'}
                </label>
                <select
                  value={latenessMode}
                  onChange={(e) =>
                    setLatenessMode(e.target.value as 'tiered' | 'percentage_per_minute')
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="tiered">Tiered Intervals (15m, 30m, 60m+)</option>
                  <option value="percentage_per_minute">Exact Minute % Rate</option>
                </select>
              </div>
            </div>

            {latenessMode === 'tiered' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 max-w-xl">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    15 Mins Delay
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={late15}
                    onChange={(e) => setLate15(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-sans"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">e.g. 0.25 day</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    30 Mins Delay
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={late30}
                    onChange={(e) => setLate30(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-sans"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">e.g. 0.50 day</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    60+ Mins Delay
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={late60}
                    onChange={(e) => setLate60(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-sans"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">e.g. 1.00 day</span>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 max-w-sm">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minute Deduction Rate (% of Daily Wage)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.001"
                    value={minuteDeductionRate}
                    onChange={(e) => setMinuteDeductionRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-sans"
                  />
                  <span className="text-xs text-slate-500 font-sans whitespace-nowrap">
                    ({(minuteDeductionRate * 100).toFixed(2)}%/min)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Salary Advances */}
        {activeTab === 'advances' && (
          <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                {isRtl ? 'قواعد ومعايير السلف الشهرية' : 'Monthly Salary Advance Parameters'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl
                  ? 'تحدد أقصى نسبة سلفة يمكن للموظف طلبها وتاريخ فتح استقبال الطلبات شهرياً'
                  : 'Sets maximum loan ceilings and monthly unlock dates for employee advance requests'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'الحد الأقصى للسلفة (% من الراتب الأساسي)' : 'Max Advance Cap (% of Basic Salary)'}
                </label>
                <input
                  type="number"
                  value={maxAdvancePercentage}
                  onChange={(e) => setMaxAdvancePercentage(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">e.g. 50%</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'يوم فتح استقبال الطلبات من كل شهر' : 'Eligibility Start Day of Month'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={advanceEligibilityDay}
                  onChange={(e) => setAdvanceEligibilityDay(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">e.g. Available after day 15</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Feature Switches */}
        {activeTab === 'toggles' && (
          <div className="cleariq-card p-6 cleariq-card-hover space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                {isRtl ? 'المفاتيح العامة لتفعيل وتعطيل الموديولات' : 'Tenant Global Feature Switches'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl
                  ? 'التحكم في تشغيل أو إخفاء موديولات النظام بالكامل'
                  : 'Enable or disable operational modules across your company tenant'}
              </p>
            </div>

            <div className="space-y-3 max-w-xl">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Holiday Work Compensation System
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Allow managers to log extra leave balance for weekend & holiday shifts
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableHolidayComp}
                  onChange={(e) => setEnableHolidayComp(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Shifts System</div>
                  <div className="text-[10px] text-slate-500">
                    Enable flexible and multi-shift schedules per employee
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableShifts}
                  onChange={(e) => setEnableShifts(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Monthly Salary Advances</div>
                  <div className="text-[10px] text-slate-500">
                    Allow employees to submit monthly loan requests
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableAdvances}
                  onChange={(e) => setEnableAdvances(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Sales & Commissions Engine</div>
                  <div className="text-[10px] text-slate-500">
                    Track client deals and commission percentages
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableCommissions}
                  onChange={(e) => setEnableCommissions(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Insurance Contributions</div>
                  <div className="text-[10px] text-slate-500">
                    Include social and health insurance deductions in payroll
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableInsurances}
                  onChange={(e) => setEnableInsurances(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
