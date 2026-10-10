import { parseISO, differenceInMinutes } from 'date-fns';

/**
 * Returns a Date object representing the time in Africa/Cairo timezone.
 */
export function getCairoDate(dateInput: Date | string = new Date()): Date {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const cairoString = d.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
  return new Date(cairoString);
}

/**
 * Returns current Cairo date as 'YYYY-MM-DD'
 */
export function getCairoDateString(dateInput: Date | string = new Date()): string {
  const d = getCairoDate(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current Cairo time as 'HH:mm'
 */
export function getCairoTimeString(dateInput: Date | string = new Date()): string {
  const d = getCairoDate(dateInput);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Returns the payroll month string (YYYY-MM-01) for any given date based on 25th cutoff.
 * Rule: 26th of Month M-1 to 25th of Month M => Payroll Month M
 */
export function getPayrollMonthDate(dateInput: Date | string = getCairoDate()): string {
  const d = getCairoDate(dateInput);
  const day = d.getDate();
  let year = d.getFullYear();
  let month = d.getMonth(); // 0-indexed (0 = Jan)

  if (day >= 26) {
    // Moves to next month's payroll
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  const padMonth = String(month + 1).padStart(2, '0');
  return `${year}-${padMonth}-01`;
}

/**
 * Returns the date range [startStr, endStr] for a given payroll month (YYYY-MM) and cycle start day.
 * - startDay = 1: 1st of month to end of month (e.g. 2026-10-01 to 2026-10-31)
 * - startDay = 26: 26th of previous month to 25th of selected month (e.g. 2026-09-26 to 2026-10-25)
 */
export function getPayrollCycleForMonth(monthStr: string, startDay: number = 1) {
  const parts = monthStr.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);

  if (startDay <= 1) {
    const lastDay = new Date(y, m, 0).getDate();
    return {
      startStr: `${monthStr}-01`,
      endStr: `${monthStr}-${String(lastDay).padStart(2, '0')}`,
      startDay: 1,
      endDay: lastDay,
    };
  }

  // Previous month calculation
  const prevMonthIndex = m - 2; // 0-indexed
  const prevYear = prevMonthIndex < 0 ? y - 1 : y;
  const prevMonthNum = prevMonthIndex < 0 ? 12 : prevMonthIndex + 1;
  const prevMonthStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`;
  const endCycleDay = startDay - 1;

  return {
    startStr: `${prevMonthStr}-${String(startDay).padStart(2, '0')}`,
    endStr: `${monthStr}-${String(endCycleDay).padStart(2, '0')}`,
    startDay,
    endDay: endCycleDay,
  };
}

/**
 * Returns the date range [startDate, endDate] for the active payroll cycle containing the date.
 */
export function getPayrollCycleRange(
  dateInput: Date | string = getCairoDate(),
  customStartDay: number = 26
) {
  // If a 'YYYY-MM' format string is passed directly, delegate to getPayrollCycleForMonth
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}$/.test(dateInput)) {
    const res = getPayrollCycleForMonth(dateInput, customStartDay);
    return {
      startDate: new Date(res.startStr),
      endDate: new Date(res.endStr),
      startStr: res.startStr,
      endStr: res.endStr,
    };
  }

  const d = getCairoDate(dateInput);
  const day = d.getDate();
  const year = d.getFullYear();
  const month = d.getMonth();
  const cutoff = customStartDay > 1 ? customStartDay : 26;

  if (day >= cutoff) {
    // Current cycle started on cutoff of this month, ends on cutoff-1 of next month
    const startDate = new Date(year, month, cutoff);
    const endMonth = month === 11 ? 0 : month + 1;
    const endYear = month === 11 ? year + 1 : year;
    const endDay = cutoff - 1;
    const endDate = new Date(endYear, endMonth, endDay);
    return {
      startDate,
      endDate,
      startStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(cutoff).padStart(2, '0')}`,
      endStr: `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
    };
  } else {
    // Current cycle started on cutoff of previous month, ends on cutoff-1 of this month
    const startMonth = month === 0 ? 11 : month - 1;
    const startYear = month === 0 ? year - 1 : year;
    const endDay = cutoff - 1;
    const startDate = new Date(startYear, startMonth, cutoff);
    const endDate = new Date(year, month, endDay);
    return {
      startDate,
      endDate,
      startStr: `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(cutoff).padStart(2, '0')}`,
      endStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
    };
  }
}

/**
 * Formats duration between check_in and check_out in hours and minutes.
 */
export function calculateWorkingHours(
  checkIn: string,
  checkOut: string | null,
  isMissingCheckout?: boolean
): string {
  if (isMissingCheckout) {
    if (checkOut) {
      const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
      const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
      const diffMins = Math.max(0, differenceInMinutes(end, start));
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hrs}h ${mins}m (Auto)`;
    }
    return 'Missing Check-Out';
  }
  if (!checkOut) {
    const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
    const now = new Date();
    if (differenceInMinutes(now, start) > 20 * 60) {
      return 'Missing Check-Out';
    }
    return 'In Progress';
  }
  const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  const diffMins = Math.max(0, differenceInMinutes(end, start));
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hrs}h ${mins}m`;
}

/**
 * Returns duration between check_in and check_out in total minutes.
 * Includes a safety cap of 14 hours (840 mins) to prevent runaway overtime on missing checkouts.
 */
export function calculateWorkingMinutes(
  checkIn: string,
  checkOut: string | null,
  isMissingCheckout?: boolean
): number {
  if (!checkOut) return 0;
  const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  const rawMins = Math.max(0, differenceInMinutes(end, start));
  return Math.min(rawMins, 14 * 60);
}

/**
 * Returns the planned scheduled shift duration in minutes, supporting overnight / cross-midnight shifts,
 * split shifts (two daily sessions), and break minutes deduction.
 * Example: "22:00" -> "06:00" returns 480 minutes (8 hours).
 */
export function calculateShiftDurationMinutes(
  startTime: string = '08:00',
  endTime: string = '16:00',
  isSplit: boolean = false,
  splitStart2?: string | null,
  splitEnd2?: string | null,
  breakMinutes: number = 0
): number {
  const getSessionMins = (s: string, e: string) => {
    const [startH, startM] = (s || '08:00').split(':').map(Number);
    const [endH, endM] = (e || '16:00').split(':').map(Number);
    const startTotal = (startH * 60) + (startM || 0);
    const endTotal = (endH * 60) + (endM || 0);
    return endTotal >= startTotal ? endTotal - startTotal : (1440 - startTotal) + endTotal;
  };

  let total = getSessionMins(startTime, endTime);
  if (isSplit && splitStart2 && splitEnd2) {
    total += getSessionMins(splitStart2, splitEnd2);
  }
  return Math.max(0, total - (breakMinutes || 0));
}

/**
 * Calculates lateness in minutes for a check-in event against assigned shift hours.
 * Supports overnight shifts crossing midnight (e.g. 22:00 -> 06:00).
 */
export function calculateShiftLatenessMinutes(
  checkInIso: string,
  shiftStartTime: string = '09:00',
  shiftEndTime: string = '17:00'
): number {
  if (!checkInIso) return 0;
  const checkIn = getCairoDate(checkInIso);
  const [startH, startM] = shiftStartTime.split(':').map(Number);
  const [endH] = shiftEndTime.split(':').map(Number);

  const isOvernight = startH > endH;
  const scheduledStart = new Date(checkIn);
  scheduledStart.setHours(startH, startM, 0, 0);

  // If overnight shift and employee checked in during early morning hours after midnight (e.g. 01:00 for a 22:00 shift),
  // the shift anchor began the previous evening.
  if (isOvernight && checkIn.getHours() < endH + 4 && checkIn.getHours() < startH) {
    scheduledStart.setDate(scheduledStart.getDate() - 1);
  }

  const diffMins = differenceInMinutes(checkIn, scheduledStart);
  return Math.max(0, diffMins);
}

export function formatDate(dateString: string): string {
  try {
    const d = parseISO(dateString);
    return d.toLocaleDateString('en-GB', {
      timeZone: 'Africa/Cairo',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string | null): string {
  if (!timeString) return '--:--';
  try {
    const d = parseISO(timeString);
    return d.toLocaleTimeString('en-US', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeString;
  }
}
