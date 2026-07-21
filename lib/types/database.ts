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
  created_at?: string;
  user?: UserProfile;
}

export interface AdvanceRecord {
  id: string;
  user_id: string;
  amount: number;
  month: string;
  created_at?: string;
  user?: UserProfile;
}

export interface KpiEntryRecord {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  unit: string;
  created_at?: string;
  user?: UserProfile;
}
