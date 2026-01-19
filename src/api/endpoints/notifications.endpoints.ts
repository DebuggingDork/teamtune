// ============================================================================
// NOTIFICATION ENDPOINTS - Notification related endpoints
// ============================================================================

import { e } from './base.endpoints';

type NotificationRole = 'employee' | 'team-lead' | 'project-manager' | 'admin';

/**
 * Creates role-specific notification endpoints
 * @param role - The user role
 * @returns Object containing all notification endpoints for that role
 */
export const createNotificationEndpoints = (role: NotificationRole) => ({
  LIST: e(`/${role}/notifications`),
  UNREAD_COUNT: e(`/${role}/notifications/unread-count`),
  GET: (notificationId: string) => e(`/${role}/notifications/${notificationId}`),
  MARK_READ: (notificationId: string) => e(`/${role}/notifications/${notificationId}/read`),
  MARK_ALL_READ: e(`/${role}/notifications/read-all`),
  DELETE: (notificationId: string) => e(`/${role}/notifications/${notificationId}`),
  DELETE_ALL_READ: e(`/${role}/notifications/read`),
});

export const NOTIFICATION_ENDPOINTS = {
  forRole: createNotificationEndpoints,
} as const;
