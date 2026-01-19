// ============================================================================
// LEAVE TYPES - Leave management related types
// ============================================================================

import type { PaginationResponse } from './common.types';

// Leave Status Types
export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type HalfDayType = 'first_half' | 'second_half';

// Leave Type
export interface LeaveType {
  id: string;
  code: string;
  name: string;
  description: string;
  default_days_per_year: number;
  is_paid: boolean;
  requires_approval: boolean;
  requires_document: boolean;
  max_consecutive_days: number;
  min_advance_notice_days: number;
  allow_carryover: boolean;
  max_carryover_days: number;
  color_code: string;
  is_active?: boolean;
}

// Leave Balance
export interface LeaveBalanceItem {
  leave_type: {
    code: string;
    name: string;
    color: string;
  };
  total_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  carried_over: number;
}

export interface LeaveBalancesResponse {
  year: number;
  balances: LeaveBalanceItem[];
  summary: {
    total_leaves_available: number;
    total_leaves_used: number;
    total_leaves_pending: number;
  };
}

// Leave Request
export interface SubmitLeaveRequest {
  leave_type_code: string;
  start_date: string;
  end_date: string;
  is_half_day?: boolean;
  half_day_type?: HalfDayType | null;
  reason: string;
  supporting_document_url?: string | null;
}

export interface LeaveRequest {
  request_code: string;
  employee?: {
    user_code: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  leave_type: {
    code: string;
    name: string;
    color: string;
  };
  start_date: string;
  end_date: string;
  total_days: number;
  is_half_day: boolean;
  half_day_type: HalfDayType | null;
  reason: string;
  supporting_document_url: string | null;
  status: LeaveRequestStatus;
  reviewer?: {
    user_code: string;
    full_name: string;
  } | null;
  reviewed_at: string | null;
  reviewer_comments: string | null;
  created_at: string;
  days_until_start?: number;
}

export interface LeaveRequestsResponse {
  requests: LeaveRequest[];
  pagination: PaginationResponse;
}

export interface PendingLeaveRequestsResponse {
  pending_requests: LeaveRequest[];
  count: number;
}

// Team Leave Calendar
export interface LeaveCalendarEntry {
  date: string;
  user_code: string;
  user_name: string;
  leave_type: string;
  leave_type_color: string;
  is_half_day: boolean;
  half_day_type: HalfDayType | null;
}

export interface TeamLeaveCalendarResponse {
  month: number;
  year: number;
  entries: LeaveCalendarEntry[];
  summary: {
    total_leave_days: number;
    employees_on_leave: number;
  };
}

// Holidays
export interface Holiday {
  id: string;
  name: string;
  date: string;
  year: number;
  is_optional: boolean;
  description: string | null;
}

export interface HolidaysResponse {
  year: number;
  holidays: Holiday[];
  total: number;
}

export interface CreateHolidayRequest {
  name: string;
  date: string;
  year: number;
  is_optional?: boolean;
  description?: string;
}

// Admin Leave Types Management
export interface CreateLeaveTypeRequest {
  code: string;
  name: string;
  description: string;
  default_days_per_year: number;
  is_paid?: boolean;
  requires_approval?: boolean;
  requires_document?: boolean;
  max_consecutive_days?: number;
  min_advance_notice_days?: number;
  allow_carryover?: boolean;
  max_carryover_days?: number;
  color_code?: string;
}

export interface UpdateLeaveTypeRequest {
  name?: string;
  description?: string;
  default_days_per_year?: number;
  is_paid?: boolean;
  requires_approval?: boolean;
  requires_document?: boolean;
  max_consecutive_days?: number;
  min_advance_notice_days?: number;
  allow_carryover?: boolean;
  max_carryover_days?: number;
  color_code?: string;
  is_active?: boolean;
}

// Admin Leave Balance Management
export interface InitializeBalancesRequest {
  year: number;
}

export interface AdjustBalanceRequest {
  leave_type_id: string;
  year: number;
  adjustment: number;
  reason: string;
}

// Leave Request Review
export interface ReviewLeaveRequest {
  comments?: string;
}

// Leave Request Filters
export interface LeaveRequestFilters {
  page?: number;
  limit?: number;
  status?: LeaveRequestStatus;
  leave_type_code?: string;
  from_date?: string;
  to_date?: string;
  user_code?: string;
}
