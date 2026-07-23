import { parseISO, differenceInMinutes } from 'date-fns';

/**
 * Returns the current date shifted to Africa/Cairo timezone.
 */
export function getCairoDate(dateInput: Date | string = new Date()): Date {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const cairoString = d.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
  return new Date(cairoString);
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
    return { startDate, endDate };
  } else {
    // Current cycle started on 26th of previous month, ends on 25th of this month
    const startMonth = month === 0 ? 11 : month - 1;
    const startYear = month === 0 ? year - 1 : year;
    const startDate = new Date(startYear, startMonth, 26);
    const endDate = new Date(year, month, 25);
    return { startDate, endDate };
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
