'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  LogOut as LogOutIcon,
  AlertCircle,
  RefreshCw,
  Globe,
} from 'lucide-react';
import {
  AttendanceRecord,
  TenantSettings,
  BranchLocation,
  UserProfile,
} from '@/lib/types/database';
import { formatTime } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';

interface AttendanceWidgetProps {
  userId: string;
  initialAttendance: AttendanceRecord[];
}

export default function AttendanceWidget({ userId, initialAttendance }: AttendanceWidgetProps) {
  const { t, isRtl } = useLanguage();
  const [sessions, setSessions] = useState<AttendanceRecord[]>(initialAttendance);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const supabase = createClient();

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  }

  // Fetch current geolocation, tenant settings, and user profile on mount
  useEffect(() => {
    const fetchInitial = async () => {
      // 1. Fetch Tenant Settings
      const { data: settings } = await supabase.from('tenant_settings').select('*').maybeSingle();
      if (settings) {
        setTenantSettings(settings as TenantSettings);
      }

      // 2. Fetch User Profile with Shift
      const { data: profile } = await supabase
        .from('users')
        .select('*, shift:shifts(*)')
        .eq('id', userId)
        .single();
      if (profile) {
        setUserProfile(profile as UserProfile);
      }
    };

    fetchInitial();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation warning:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCheckIn = async () => {
    setLoading(true);
    setErrorMsg(null);

    let currentLat = coords.lat;
    let currentLng = coords.lng;

    // Check if user is Remote / Anywhere
    const isRemote = !!userProfile?.is_remote;

    if (!isRemote) {
      // Try to get fresh location if missing
      if (!currentLat && 'geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          currentLat = position.coords.latitude;
          currentLng = position.coords.longitude;
        } catch (e) {
          console.warn('Could not acquire location during check-in', e);
        }
      }

      // Multi-Branch Geofencing validation check
      const activeBranches: BranchLocation[] =
        tenantSettings?.branches && tenantSettings.branches.length > 0
          ? tenantSettings.branches
          : tenantSettings?.geofencing_lat && tenantSettings?.geofencing_lng
          ? [
              {
                id: 'main',
                name: 'Main Office',
                lat: Number(tenantSettings.geofencing_lat),
                lng: Number(tenantSettings.geofencing_lng),
                radius: Number(tenantSettings.geofencing_radius) || 150,
              },
            ]
          : [];

      let matchedBranch: BranchLocation | null = null;

      if (activeBranches.length > 0) {
        if (!currentLat || !currentLng) {
          setErrorMsg(
            isRtl
              ? 'عذراً، يجب السماح بمشاركة الموقع الجغرافي لتسجيل الحضور!'
              : 'GPS coordinates are required to check in. Please enable location services!'
          );
          setLoading(false);
          return;
        }

        let minDistance = Infinity;
        let closestBranchName = '';

        for (const branch of activeBranches) {
          const d = getDistance(currentLat, currentLng, Number(branch.lat), Number(branch.lng));
          if (d < minDistance) {
            minDistance = d;
            closestBranchName = branch.name;
          }
          if (d <= Number(branch.radius)) {
            matchedBranch = branch;
            break;
          }
        }

        if (!matchedBranch) {
          setErrorMsg(
            isRtl
              ? `أنت خارج نطاق فروع العمل المعتمدة! أقرب فرع: ${closestBranchName} (المسافة: ${Math.round(minDistance)} متر)`
              : `Outside approved branches! Nearest branch: ${closestBranchName} (Distance: ${Math.round(minDistance)}m)`
          );
          setLoading(false);
          return;
        }
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        check_in_time: nowIso,
        lat: currentLat || 0,
        lng: currentLng || 0,
        date: todayStr,
      })
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setSessions([data as AttendanceRecord, ...sessions]);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    const latestSession = sessions[0];
    if (!latestSession || latestSession.check_out_time) return;

    setLoading(true);
    setErrorMsg(null);

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out_time: nowIso,
      })
      .eq('id', latestSession.id)
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setSessions(sessions.map((s) => (s.id === latestSession.id ? (data as AttendanceRecord) : s)));
    }
    setLoading(false);
  };

  const latestSession = sessions[0] || null;
  const isCheckedIn = !!latestSession && !latestSession.check_out_time;

  // Calculate total working hours across all sessions today
  const calculateTotalWorkingMinutes = () => {
    let totalMins = 0;
    sessions.forEach((s) => {
      const start = new Date(s.check_in_time);
      const end = s.check_out_time ? new Date(s.check_out_time) : new Date();
      const diff = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
      totalMins += diff;
    });
    return totalMins;
  };

  const totalMinutes = calculateTotalWorkingMinutes();
  const totalHoursStr = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  return (
    <div className="cleariq-card p-6 cleariq-card-hover relative overflow-hidden space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white">
              {t('attendance')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl ? 'تسجيل الحضور والإنصراف وساعات العمل المعتمدة' : 'Multi-session check-in & work logs'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {userProfile?.is_remote && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
              <Globe className="w-3 h-3" /> {isRtl ? 'عمل عن بعد' : 'Remote Mode'}
            </span>
          )}

          {userProfile?.shift && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              ⏰ {userProfile.shift.name} ({userProfile.shift.start_time} - {userProfile.shift.end_time})
            </span>
          )}

          {isCheckedIn ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-emerald" /> {t('duty')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {isRtl ? 'خارج العمل' : 'Not Active'}
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Stats / Flexible Schedule Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {isRtl ? 'إجمالي ساعات العمل اليوم' : 'Total Accumulated Hours Today'}
          </span>
          <span className="text-2xl font-extrabold text-slate-950 dark:text-white font-sans">
            {totalHoursStr}
          </span>
          {userProfile?.is_flexible && (
            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
              Target: {userProfile.required_daily_hours || 8}h ({Math.min(100, Math.round((totalMinutes / ((userProfile.required_daily_hours || 8) * 60)) * 100))}% completed)
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {isRtl ? 'حالة الجلسة الحالية' : 'Current Session Status'}
          </span>
          {isCheckedIn ? (
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {isRtl ? 'تم تسجيل الحضور منذ ' : 'Checked-in since '}{formatTime(latestSession.check_in_time)}
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl ? 'لا توجد جلسة عمل نشطة حالياً' : 'No active session currently running.'}
            </div>
          )}
        </div>
      </div>

      {/* Check-In / Check-Out Buttons */}
      <div className="flex gap-3">
        {!isCheckedIn ? (
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={loading}
            className="flex-1 gradient-btn py-3.5 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            <span>{loading ? (isRtl ? 'جاري الفحص والتسجيل...' : 'Verifying & Checking In...') : (isRtl ? 'تسجيل حضور الآن (Check-In)' : 'Punch In (Check-In)')}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCheckOut}
            disabled={loading}
            className="flex-1 bg-rose-600 hover:bg-rose-700 py-3.5 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogOutIcon className="w-4 h-4" />}
            <span>{loading ? (isRtl ? 'جاري التسجيل...' : 'Checking Out...') : (isRtl ? 'تسجيل إنصراف (Check-Out)' : 'Punch Out (Check-Out)')}</span>
          </button>
        )}
      </div>

      {/* Sessions History List */}
      {sessions.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {isRtl ? 'جلسات اليوم المسجلة' : "Today's Attendance Logs"}
          </span>
          <div className="space-y-1.5">
            {sessions.map((s, idx) => (
              <div
                key={s.id || idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Session #{sessions.length - idx}</span>
                  <span className="text-slate-500 font-sans">{formatTime(s.check_in_time)}</span>
                  <span>→</span>
                  <span className="text-slate-500 font-sans">{s.check_out_time ? formatTime(s.check_out_time) : (isRtl ? 'مستمر...' : 'In Progress...')}</span>
                </div>
                {s.check_out_time && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                    {Math.floor(Math.max(0, (new Date(s.check_out_time).getTime() - new Date(s.check_in_time).getTime()) / 60000) / 60)}h{' '}
                    {Math.max(0, Math.floor((new Date(s.check_out_time).getTime() - new Date(s.check_in_time).getTime()) / 60000) % 60)}m
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
