'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Building, Settings, MapPin, Clock, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Form States
  const [companyName, setCompanyName] = useState('');
  const [enableAdvances, setEnableAdvances] = useState(true);
  const [enableCommissions, setEnableCommissions] = useState(true);
  const [enableInsurances, setEnableInsurances] = useState(true);
  const [enableShifts, setEnableShifts] = useState(true);
  
  // Geofencing
  const [geoLat, setGeoLat] = useState<string>('');
  const [geoLng, setGeoLng] = useState<string>('');
  const [geoRadius, setGeoRadius] = useState<number>(100); // meters

  // Lateness Policy thresholds
  const [late15, setLate15] = useState<number>(0.25);
  const [late30, setLate30] = useState<number>(0.5);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // Check if profile already has tenant_id
      const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (profile && profile.tenant_id) {
        router.push('/dashboard/employee');
      } else {
        setChecking(false);
      }
    };
    checkUser();
  }, []);

  const handleNext = () => {
    if (step === 1 && !companyName.trim()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!userId || !companyName.trim()) return;

    setLoading(true);
    try {
      // 1. Create Tenant
      const { data: tenant, error: tenantErr } = await supabase
        .from('tenants')
        .insert({ name: companyName.trim() })
        .select()
        .single();

      if (tenantErr) throw tenantErr;

      // 2. Create Tenant Settings
      const lateness_policy = {
        thresholds: [
          { mins: 15, deduction: Number(late15) },
          { mins: 30, deduction: Number(late30) }
        ]
      };

      const { error: settingsErr } = await supabase
        .from('tenant_settings')
        .insert({
          tenant_id: tenant.id,
          enable_advances: enableAdvances,
          enable_commissions: enableCommissions,
          enable_insurances: enableInsurances,
          enable_shifts: enableShifts,
          lateness_policy,
          geofencing_lat: geoLat ? Number(geoLat) : null,
          geofencing_lng: geoLng ? Number(geoLng) : null,
          geofencing_radius: Number(geoRadius)
        });

      if (settingsErr) throw settingsErr;

      // 3. Link User Profile to Tenant
      const { error: userErr } = await supabase
        .from('users')
        .update({ tenant_id: tenant.id, role: 'super_admin' }) // The first onboarded user becomes Super Admin
        .eq('id', userId);

      if (userErr) throw userErr;

      router.push('/dashboard/employee');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Setup wizard failed');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setGeoLat(pos.coords.latitude.toString());
        setGeoLng(pos.coords.longitude.toString());
      }, (err) => {
        alert(err.message);
      });
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-sky-400 mr-2" />
        Checking profile onboarding status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="max-w-md w-full bg-gray-950 border border-gray-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        {/* Glow background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-lg shadow-sky-500/10">
            S
          </div>
          <h2 className="text-2xl font-black text-white">Simply HR System</h2>
          <p className="text-xs text-gray-400 mt-1">Tenant Onboarding & Setup Wizard</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-900 pb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s ? 'bg-sky-500 text-white font-sans' : 'bg-gray-900 border border-gray-800 text-gray-500 font-sans'
              }`}>
                {s}
              </span>
              {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-sky-500' : 'bg-gray-900'}`} />}
            </div>
          ))}
        </div>

        {/* STEP 1: Company Profile */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-400" /> Company Profile Details
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Company / Organization Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Simply Logistics"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!companyName.trim()}
              className="w-full gradient-btn py-2.5 rounded-xl font-bold text-sm text-white mt-4 flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
            >
              Configure Features <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Functional Module Toggles */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-400" /> Functional Modules Config
            </h3>
            <p className="text-xs text-gray-400">Enable or disable HR operational features. Disabled components will be hidden from employees.</p>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">Financial Advances</span>
                  <span className="text-[10px] text-gray-500">Track and automatically deduct salary loans.</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAdvances}
                  onChange={(e) => setEnableAdvances(e.target.checked)}
                  className="rounded border-gray-800 bg-gray-950 text-sky-500 focus:ring-sky-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">Sales & Commissions</span>
                  <span className="text-[10px] text-gray-500">Log client sales and calculate payouts.</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableCommissions}
                  onChange={(e) => setEnableCommissions(e.target.checked)}
                  className="rounded border-gray-800 bg-gray-950 text-sky-500 focus:ring-sky-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">Social & Health Insurances</span>
                  <span className="text-[10px] text-gray-500">Fixed deductions on employee salary slips.</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableInsurances}
                  onChange={(e) => setEnableInsurances(e.target.checked)}
                  className="rounded border-gray-800 bg-gray-950 text-sky-500 focus:ring-sky-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-gray-200 block">Multiple Daily Check-ins</span>
                  <span className="text-[10px] text-gray-500">Allow multiple work sessions per day.</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableShifts}
                  onChange={(e) => setEnableShifts(e.target.checked)}
                  className="rounded border-gray-800 bg-gray-950 text-sky-500 focus:ring-sky-500"
                />
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-900 border border-gray-800 py-2.5 rounded-xl font-semibold text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 gradient-btn py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1 shadow-lg"
              >
                Geofencing <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Geofencing Setup */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" /> Geofencing Check-in Guard
            </h3>
            <p className="text-xs text-gray-400">Configure coordinates and approved radius. Leave coordinates empty to disable geofence protection.</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Latitude</label>
                <input
                  type="text"
                  value={geoLat}
                  onChange={(e) => setGeoLat(e.target.value)}
                  placeholder="30.0444"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Longitude</label>
                <input
                  type="text"
                  value={geoLng}
                  onChange={(e) => setGeoLng(e.target.value)}
                  placeholder="31.2357"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Deduction Radius (meters)</label>
              <input
                type="number"
                value={geoRadius}
                onChange={(e) => setGeoRadius(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full bg-sky-500/10 border border-sky-500/20 text-sky-400 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" /> Detect Current GPS Location
            </button>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-900 border border-gray-800 py-2.5 rounded-xl font-semibold text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 gradient-btn py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1 shadow-lg"
              >
                Lateness Policy <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Lateness Policy */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200 font-sans">
            <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" /> Lateness Policy Rules
            </h3>
            <p className="text-xs text-gray-400">Set daily salary or leave deductions based on check-in arrival delays:</p>
            
            <div className="grid grid-cols-2 gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Delay &gt; 15 mins</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.05"
                    value={late15}
                    onChange={(e) => setLate15(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">day</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Delay &gt; 30 mins</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.05"
                    value={late30}
                    onChange={(e) => setLate30(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">day</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-900 border border-gray-800 py-2.5 rounded-xl font-semibold text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 gradient-btn py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
