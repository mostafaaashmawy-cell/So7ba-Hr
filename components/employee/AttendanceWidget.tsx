'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, LogOut as LogOutIcon, AlertCircle, RefreshCw, ListCollapse } from 'lucide-react';
import { AttendanceRecord, TenantSettings, BranchLocation } from '@/lib/types/database';
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
  const [geoLocating, setGeoLocating] = useState(false);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
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

  // Fetch current geolocation and tenant settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('tenant_settings').select('*').maybeSingle();
      if (data) {
        setTenantSettings(data as TenantSettings);
      }
    };
    fetchSettings();

    if ('geolocation' in navigator) {
      setGeoLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGeoLocating(false);
        },
        (err) => {
          console.warn('Geolocation warning:', err.message);
          setGeoLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    setErrorMsg(null);

    let currentLat = coords.lat;
    let currentLng = coords.lng;

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

    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        check_in_time: nowIso,
        lat: currentLat,
        lng: currentLng,
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
  const calculateTotalWorkingHours = () => {
    let totalMins = 0;
    sessions.forEach((s) => {
      const start = new Date(s.check_in_time);
      const end = s.check_out_time ? new Date(s.check_out_time) : new Date();
      const diff = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
      totalMins += diff;
    });
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="cleariq-card p-6 cleariq-card-hover relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{t('attendance')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl ? 'تسجيل الحضور والإنصراف المتعدد وساعات العمل' : 'Multi-session check-in tracking'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isCheckedIn ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-emerald" /> {t('duty')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {isRtl ? 'خارج العمل' : 'Not Active'}
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Calculated Duration */}
      <div className="mb-6 p-4 rounded-xl bg-sky-950/20 border border-sky-500/20 text-center">
        <span className="text-xs text-sky-300 font-medium block">{t('totalWorked')}</span>
        <span className="text-3xl font-extrabold text-white font-sans">
          {calculateTotalWorkingHours()}
        </span>
      </div>

      {/* Geolocation info banner */}
      <div className="mb-6 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-400" />
          <span>
            {coords.lat && coords.lng
              ? `${t('gpsCaptured')}: (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
              : geoLocating
              ? t('acquiringGps')
              : t('gpsEnabled')}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {isCheckedIn ? (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <LogOutIcon className="w-4 h-4" />
            )}
            {t('checkOut')}
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full gradient-btn py-3 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            {t('checkIn')}
          </button>
        )}
      </div>

      {/* Sessions List */}
      {sessions.length > 0 && (
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <ListCollapse className="w-3.5 h-3.5 text-sky-400" /> {isRtl ? 'جلسات عمل اليوم' : "Today's Work Sessions"}
          </h4>
          <div className="space-y-2">
            {sessions.map((s, idx) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {isRtl ? `فترة #${sessions.length - idx}` : `Session #${sessions.length - idx}`}
                </span>
                <div className="flex gap-4">
                  <span className="text-emerald-400">{formatTime(s.check_in_time)}</span>
                  <span className="text-slate-500 dark:text-slate-400">→</span>
                  <span className="text-rose-400">{s.check_out_time ? formatTime(s.check_out_time) : '--:--'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
