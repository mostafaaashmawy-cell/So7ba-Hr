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
 * Returns the date range [startDate, endDate] for the active payroll cycle containing the date.
 */
export function getPayrollCycleRange(dateInput: Date | string = getCairoDate()) {
  const d = getCairoDate(dateInput);
  const day = d.getDate();
  const year = d.getFullYear();
  const month = d.getMonth();

  if (day >= 26) {
    // Current cycle started on 26th of this month, ends on 25th of next month
    const startDate = new Date(year, month, 26);
    const endMonth = month === 11 ? 0 : month + 1;
    const endYear = month === 11 ? year + 1 : year;
    const endDate = new Date(endYear, endMonth, 25);
    return {
      startDate,
      endDate,
      startStr: `${year}-${String(month + 1).padStart(2, '0')}-26`,
      endStr: `${endYear}-${String(endMonth + 1).padStart(2, '0')}-25`,
    };
  } else {
    // Current cycle started on 26th of previous month, ends on 25th of this month
    const startMonth = month === 0 ? 11 : month - 1;
    const startYear = month === 0 ? year - 1 : year;
    const startDate = new Date(startYear, startMonth, 26);
    const endDate = new Date(year, month, 25);
    return {
      startDate,
      endDate,
      startStr: `${startYear}-${String(startMonth + 1).padStart(2, '0')}-26`,
      endStr: `${year}-${String(month + 1).padStart(2, '0')}-25`,
    };
  }
}

/**
 * Formats duration between check_in and check_out in hours and minutes.
 */
export function calculateWorkingHours(checkIn: string, checkOut: string | null): string {
  if (!checkOut) return 'In Progress';
  const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  const diffMins = Math.max(0, differenceInMinutes(end, start));
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hrs}h ${mins}m`;
}

/**
 * Returns duration between check_in and check_out in total minutes.
 */
export function calculateWorkingMinutes(checkIn: string, checkOut: string | null): number {
  if (!checkOut) return 0;
  const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  return Math.max(0, differenceInMinutes(end, start));
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
