'use client';

import { useState, useEffect } from 'react';

interface CairoTimeState {
  timeStr: string;
  dateStr: string;
  isSynced: boolean;
  rawDate: Date;
}

export function useCairoTime(): CairoTimeState {
  // Offset in milliseconds between client performance clock and server Cairo epoch
  const [offsetMs, setOffsetMs] = useState<number | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [isSynced, setIsSynced] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const syncWithServer = async () => {
      try {
        const clientReqTime = performance.now();
        const res = await fetch('/api/time', { cache: 'no-store' });
        if (!res.ok) throw new Error('Time API failed');
        const data = await res.json();
        const clientResTime = performance.now();
        const roundTripMs = clientResTime - clientReqTime;

        // Estimate server time adjusted for round-trip latency
        const estimatedServerEpoch = data.serverEpoch + roundTripMs / 2;
        const currentPerf = performance.now();
        const computedOffset = estimatedServerEpoch - currentPerf;

        if (isMounted) {
          setOffsetMs(computedOffset);
          setIsSynced(true);
        }
      } catch (e) {
        console.warn('Network time sync fallback to local timezone:', e);
        if (isMounted) {
          setIsSynced(false);
        }
      }
    };

    syncWithServer();

    // Re-sync with server every 10 minutes to prevent clock drift
    const syncInterval = setInterval(syncWithServer, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (offsetMs !== null) {
        setNow(new Date(performance.now() + offsetMs));
      } else {
        setNow(new Date());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [offsetMs]);

  // Format into Cairo time strings
  const cairoTimeFormatter = new Intl.DateTimeFormat('ar-EG', {
    timeZone: 'Africa/Cairo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const cairoDateFormatter = new Intl.DateTimeFormat('ar-EG', {
    timeZone: 'Africa/Cairo',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    timeStr: cairoTimeFormatter.format(now),
    dateStr: cairoDateFormatter.format(now),
    isSynced,
    rawDate: now,
  };
}
