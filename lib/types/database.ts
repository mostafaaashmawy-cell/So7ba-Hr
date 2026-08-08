export type UserRole = 'employee' | 'manager' | 'super_admin';
export type LeavePermType = 'leave' | 'permission';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  basic_salary: number;
  kpi_unit: string;
  manager_id: string | null;
  created_at?: string;
  updated_at?: string;

  // Employee details registry (V2)
  mobile?: string | null;
  id_number?: string | null;
  id_photo_url?: string | null;
  age?: number | null;
  birth_date?: string | null;
  birth_cert_url?: string | null;
  qualification?: string | null;
  qualification_url?: string | null;
  address?: string | null;
  job_title?: string | null;
  criminal_record_url?: string | null;
  department_id?: string | null;
  payment_method?: string | null;
  tenant_id?: string | null;
  social_insurance?: number | null;
  health_insurance?: number | null;
  contract_type?: string | null;
  probation_period?: number | null;
  contract_end_date?: string | null;
  
  // Relations
  department?: DepartmentRecord | null;
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
