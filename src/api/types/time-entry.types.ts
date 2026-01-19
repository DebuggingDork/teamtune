// ============================================================================
// TIME ENTRY TYPES - Time tracking related types
// ============================================================================

import type { PaginationParams, PaginationResponse } from './common.types';

// Time Entry Types
export interface TimeEntry {
  id: string;
  time_code: string;
  task_id: string;
  task_code: string;
  task_title: string;
  user_id: string;
  work_date: string;
  hours: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeEntryRequest {
  task_code: string;
  work_date: string;
  hours: number;
  description: string;
}

export interface UpdateTimeEntryRequest {
  work_date?: string;
  hours?: number;
  description?: string;
}

export interface TimeEntriesResponse {
  time_entries: TimeEntry[];
  pagination: PaginationResponse;
}

export interface TimeEntryFilters extends PaginationParams {
  start_date?: string;
  end_date?: string;
}

// Time Entry Approval Types
export type TimeEntryApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PendingTimeEntry extends TimeEntry {
  approval_status: TimeEntryApprovalStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  user?: {
    user_id: string;
    user_code: string;
    full_name: string;
    email: string;
  };
  task?: {
    task_id: string;
    task_code: string;
    title: string;
  };
}

export interface RejectTimeEntryRequest {
  rejection_reason: string;
}

export interface BulkApproveTimeEntriesRequest {
  time_codes: string[];
}

export interface BulkApproveTimeEntriesResponse {
  approved: number;
}
