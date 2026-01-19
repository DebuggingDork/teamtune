// ============================================================================
// ATTENDANCE TYPES - Attendance and session tracking types
// ============================================================================

import type { PaginationResponse } from './common.types';
import type { HalfDayType } from './leave.types';

// Attendance Status
export type AttendanceStatus = 'present' | 'absent' | 'on_leave' | 'wfh' | 'holiday' | 'half_day';
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

// Today Attendance
export interface TodayAttendance {
  date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  worked_hours: number | null;
  is_late: boolean;
  late_minutes: number;
}

// Attendance Record
export interface AttendanceRecord {
  id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  worked_hours: number | null;
  status: AttendanceStatus;
  is_late: boolean;
  late_minutes: number;
  is_early_departure: boolean;
  early_departure_minutes: number;
  notes: string | null;
  leave_type: string | null;
}

export interface AttendanceRecordsResponse {
  records: AttendanceRecord[];
  pagination: PaginationResponse;
}

export interface AttendanceSummary {
  month: number;
  year: number;
  working_days: number;
  summary: {
    present: number;
    absent: number;
    on_leave: number;
    wfh: number;
    holidays: number;
    half_day: number;
  };
  punctuality: {
    on_time: number;
    late_arrivals: number;
    average_late_minutes: number;
  };
  hours: {
    expected: number;
    worked: number;
    overtime: number;
  };
}

export interface CheckInOutRequest {
  notes?: string;
}

// Team Attendance
export interface TeamMemberAttendance {
  user_code: string;
  full_name: string;
  check_in_time?: string;
  is_late?: boolean;
  leave_type?: string;
  avatar_url?: string;
}

export interface TeamTodayAttendance {
  date: string;
  present: {
    count: number;
    members: TeamMemberAttendance[];
  };
  absent: {
    count: number;
    members: TeamMemberAttendance[];
  };
  on_leave: {
    count: number;
    members: TeamMemberAttendance[];
  };
  wfh: {
    count: number;
    members: TeamMemberAttendance[];
  };
}

// Sessions
export interface Session {
  login_code: string;
  login_at: string;
  logout_at: string | null;
  session_duration_minutes: number | null;
  device_type: DeviceType;
  ip_address: string;
  is_active: boolean;
  user_code?: string;
  user_name?: string;
}

export interface SessionsResponse {
  sessions: Session[];
  pagination: PaginationResponse;
}

export interface CurrentSession {
  login_code: string;
  login_at: string;
  device_type: DeviceType;
  ip_address: string;
  duration_minutes: number;
}

export interface SessionSummary {
  month: number;
  year: number;
  total_sessions: number;
  total_hours: number;
  average_session_hours: number;
  by_device: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

export interface TeamActiveSessionsResponse {
  active_sessions: Session[];
  count: number;
}

// Attendance Filters
export interface AttendanceFilters {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
  status?: AttendanceStatus;
  is_late?: boolean;
}

export interface SessionFilters {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
  is_active?: boolean;
}
