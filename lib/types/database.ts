export type UserRole = 'employee' | 'manager' | 'super_admin';
export type LeavePermType = 'leave' | 'permission';

export interface BranchLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters
}

export interface ShiftRecord {
  id: string;
  tenant_id: string;
  name: string;
  start_time: string; // e.g. "08:00"
  end_time: string;   // e.g. "16:00"
  created_at?: string;
}

export interface ShiftSwapRequestRecord {
  id: string;
  tenant_id: string;
  requester_id: string;
  target_user_id: string;
  requested_date: string;
  requester_shift_id?: string | null;
  target_shift_id?: string | null;
  status: 'pending_admin' | 'approved' | 'rejected';
  notes?: string | null;
  created_at?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  requester?: UserProfile;
  target_user?: UserProfile;
  requester_shift?: ShiftRecord | null;
  target_shift?: ShiftRecord | null;
}

export interface SystemAuditLogRecord {
  id: string;
  tenant_id: string;
  actor_id: string;
  action_type: string;
  entity_name: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  created_at?: string;
  actor?: UserProfile;
}

export interface TenantSettings {
  tenant_id: string;
  industry?: string;
  branches?: BranchLocation[];
  enable_advances: boolean;
  enable_commissions: boolean;
  enable_insurances: boolean;
  enable_shifts: boolean;
  enable_holiday_work_comp?: boolean;
  
  // Overtime Engine
  enable_overtime?: boolean;
  overtime_rate_multiplier?: number; // e.g. 1.5, 2.0
  overtime_calculation_mode?: 'multiplier' | 'fixed_rate';
  overtime_fixed_rate?: number; // e.g. 50 EGP/hour

  work_start_time?: string; // e.g. "09:00"
  work_end_time?: string;   // e.g. "17:00"
  work_days?: string[];     // e.g. ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
  grace_period_mins?: number; // e.g. 15
  lateness_mode?: 'tiered' | 'percentage_per_minute';
  minute_deduction_rate?: number; // e.g. 0.005 (0.5% per minute)
  max_advance_percentage?: number; // e.g. 50 (%)
  advance_eligibility_day?: number; // e.g. 15 (after 15th of the month)
  lateness_policy?: {
    thresholds: Array<{ mins: number; deduction: number }>;
  };
  geofencing_lat?: number | null;
  geofencing_lng?: number | null;
  geofencing_radius?: number;
}

export type PayoutMethod = 'bank_transfer' | 'instapay' | 'e_wallet' | 'cash';
export type MilitaryStatus = 'completed' | 'exempted' | 'postponed' | 'not_applicable';

export interface UserProfile {
  id: string;
  full_name: string;
  full_name_ar?: string | null;
  full_name_en?: string | null;
  role: UserRole;
  basic_salary: number;
  kpi_unit: string;
  manager_id: string | null;
  created_at?: string;
  updated_at?: string;

  // Personal & Identity (MENA / Egyptian HR)
  mobile?: string | null;
  national_id?: string | null;
  id_number?: string | null;
  id_expiry_date?: string | null;
  id_photo_url?: string | null;
  national_id_front_url?: string | null;
  national_id_back_url?: string | null;
  age?: number | null;
  birth_date?: string | null;
  birth_cert_url?: string | null;
  qualification?: string | null;
  qualification_url?: string | null;
  graduation_cert_url?: string | null;
  address?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  military_status?: MilitaryStatus | string | null;
  military_cert_url?: string | null;

  // Employment & Contracts
  job_title?: string | null;
  department_id?: string | null;
  hire_date?: string | null;
  contract_type?: string | null;
  probation_period?: number | null;
  probation_end_date?: string | null;
  contract_end_date?: string | null;
  criminal_record_url?: string | null;
  tenant_id?: string | null;

  // Financials & Payout Channels
  commission_rate?: number | null;
  social_insurance?: number | null;
  health_insurance?: number | null;
  insurance_number?: string | null;
  insurance_print_url?: string | null;
  payment_method?: string | null;
  payout_method?: PayoutMethod | string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  iban?: string | null;
  wallet_phone_number?: string | null;
  instapay_handle?: string | null;

  // Remote & Flexible Work
  is_remote?: boolean | null;
  is_flexible?: boolean | null;
  required_daily_hours?: number | null;
  shift_id?: string | null;

  // Working Hours Granularity
  custom_schedule_enabled?: boolean | null;
  custom_start_time?: string | null;
  custom_end_time?: string | null;
  custom_work_days?: string[] | null;
  branch_id?: string | null;
  
  // Relations
  department?: DepartmentRecord | null;
  manager?: UserProfile | null;
  shift?: ShiftRecord | null;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time: string | null;
  lat: number | null;
  lng: number | null;
  date: string;
  created_at?: string;
  user?: UserProfile;
}

export interface LeavePermissionRecord {
  id: string;
  user_id: string;
  type: LeavePermType;
  date: string;
  status: string;
  timeframe?: string | null;
  excuse_time?: string | null;
  created_at?: string;
  user?: UserProfile;
}

export interface KpiEntryRecord {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  unit: string;
  notes?: string | null;
  created_at?: string;
  user?: UserProfile;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  created_at?: string;
}

export interface HolidayWorkRecord {
  id: string;
  user_id: string;
  working_date: string;
  notes: string | null;
  created_by?: string | null;
  created_at?: string;
  user?: UserProfile;
}

export interface EvaluationRecord {
  id: string;
  tenant_id: string;
  user_id: string;
  evaluated_by?: string | null;
  month: string;
  star_punctuality: number;
  star_quality: number;
  star_problem_solving: number;
  star_communication: number;
  notes?: string | null;
  created_at?: string;
  user?: UserProfile;
  reviewer?: UserProfile;
}

export interface AdvanceRecord {
  id: string;
  tenant_id: string;
  user_id: string;
  amount: number;
  month: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
  created_at?: string;
  user?: UserProfile;
}
