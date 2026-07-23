'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle2, LogOut as LogOutIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { AttendanceRecord } from '@/lib/types/database';
import { calculateWorkingHours, formatTime } from '@/lib/utils/dateUtils';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/context/LanguageContext';

interface AttendanceWidgetProps {
  userId: string;
  initialAttendance: AttendanceRecord | null;
}

export default function AttendanceWidget({ userId, initialAttendance }: AttendanceWidgetProps) {
  const { t, isRtl } = useLanguage();
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(initialAttendance);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [geoLocating, setGeoLocating] = useState(false);
  const supabase = createClient();

  // Fetch current geolocation on mount
  useEffect(() => {
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
      setAttendance(data as AttendanceRecord);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!attendance) return;
    setLoading(true);
    setErrorMsg(null);

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out_time: nowIso,
      })
      .eq('id', attendance.id)
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setAttendance(data as AttendanceRecord);
    }
    setLoading(false);
  };

  const isCheckedIn = !!attendance && !attendance.check_out_time;
  const isShiftCompleted = !!attendance && !!attendance.check_out_time;

  return (
    <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{t('attendance')}</h3>
            <p className="text-xs text-gray-400">{t('attendanceDesc')}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isCheckedIn && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-emerald" /> {t('duty')}
            </span>
          )}
          {isShiftCompleted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('completed')}
            </span>
          )}
          {!attendance && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 border border-gray-700">
              {t('notCheckedIn')}
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Details grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
            {t('checkInTime')}
          </span>
          <span className="text-base font-bold text-gray-100">
            {attendance ? formatTime(attendance.check_in_time) : '--:--'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
            {t('checkOutTime')}
          </span>
          <span className="text-base font-bold text-gray-100">
            {attendance?.check_out_time ? formatTime(attendance.check_out_time) : '--:--'}
          </span>
        </div>
      </div>

      {/* Geolocation info banner */}
      <div className="mb-6 px-3.5 py-2.5 rounded-xl bg-gray-900/50 border border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-400" />
          <span>
            {coords.lat && coords.lng
              ? `${t('gpsCaptured')}: (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
              : geoLocating
              ? t('acquiringGps')
              : t('gpsEnabled')}
          </span>
        </div>
      </div>

      {/* Calculated Duration */}
      {attendance && (
        <div className="mb-6 p-3.5 rounded-xl bg-purple-900/20 border border-purple-500/20 text-center">
          <span className="text-xs text-purple-300 font-medium block">{t('totalWorked')}</span>
          <span className="text-2xl font-extrabold text-white font-sans">
            {calculateWorkingHours(attendance.check_in_time, attendance.check_out_time)}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div>
        {!attendance && (
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

        {isCheckedIn && (
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
        )}

        {isShiftCompleted && (
          <div className="text-center py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            {isRtl ? 'تم إنهاء وردية اليوم بنجاح!' : 'Shift completed for today!'}
          </div>
        )}
      </div>
    </div>
  );
}
