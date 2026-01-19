// ============================================================================
// NOTIFICATION TYPES - Notification related types
// ============================================================================

import type { PaginationParams, PaginationResponse } from './common.types';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType =
  // Task notifications
  | 'task_assigned'
  | 'task_completed'
  | 'task_blocked'
  | 'task_overdue'
  | 'task_status_changed'
  | 'task_comment'
  // Team notifications
  | 'team_added'
  | 'team_removed'
  | 'team_role_changed'
  // Project notifications
  | 'project_created'
  | 'project_updated'
  | 'sprint_started'
  | 'sprint_ended'
  // Evaluation notifications
  | 'evaluation_available'
  | 'evaluation_acknowledged'
  // GitHub notifications
  | 'pr_review_requested'
  | 'pr_changes_requested'
  | 'pr_approved'
  | 'pr_merged'
  | 'pr_closed'
  | 'pr_comment_added'
  | 'pr_ready_for_review'
  | 'repository_access_granted'
  | 'repository_access_revoked'
  | 'branch_created'
  | 'branch_deleted'
  | 'collaborator_invited'
  | 'collaborator_added'
  // System notifications
  | 'account_approved'
  | 'account_blocked'
  | 'account_unblocked'
  | 'system_announcement'
  | 'mention'
  | 'comment'
  // Leave & Attendance notifications
  | 'leave_requested'
  | 'leave_approved'
  | 'leave_rejected'
  | 'leave_cancelled'
  | 'late_arrival'
  | 'absent_without_leave';

export type NotificationCategory =
  | 'task'
  | 'team'
  | 'project'
  | 'evaluation'
  | 'github'
  | 'system'
  | 'attendance';

export interface NotificationActor {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  action_url: string | null;
  actor: NotificationActor | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationFilters extends PaginationParams {
  is_read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  from_date?: string;
  to_date?: string;
}

export interface NotificationSummary {
  total_unread: number;
  by_priority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: PaginationResponse;
  summary: NotificationSummary;
}

export interface UnreadCountResponse {
  unread_count: number;
  by_priority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  by_category: {
    task: number;
    team: number;
    project: number;
    evaluation: number;
    github: number;
    system: number;
    attendance: number;
  };
}

export interface MarkAsReadResponse {
  id: string;
  is_read: boolean;
  read_at: string;
}

export interface MarkAllAsReadRequest {
  type?: NotificationType;
  before?: string;
}

export interface MarkAllAsReadResponse {
  marked_count: number;
}

export interface DeleteAllReadResponse {
  deleted_count: number;
}
