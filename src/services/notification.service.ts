import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints/index';
import type {
  Notification,
  NotificationFilters,
  NotificationsResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadRequest,
  MarkAllAsReadResponse,
  DeleteAllReadResponse,
  UserRole,
} from '@/api/types/index';

// Map UserRole to API role path
type ApiRole = 'employee' | 'team-lead' | 'project-manager' | 'admin';

const roleToApiRole = (role: UserRole): ApiRole => {
  const roleMap: Record<UserRole, ApiRole> = {
    employee: 'employee',
    team_lead: 'team-lead',
    project_manager: 'project-manager',
    admin: 'admin',
  };
  return roleMap[role];
};

// Get notification endpoints for a specific role
const getEndpoints = (role: UserRole) => {
  return ENDPOINTS.NOTIFICATIONS.forRole(roleToApiRole(role));
};

// Build query string from filters
const buildQueryString = (filters?: NotificationFilters): string => {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.is_read !== undefined) params.append('is_read', filters.is_read.toString());
  if (filters.type) params.append('type', filters.type);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.category) params.append('category', filters.category);
  if (filters.from_date) params.append('from_date', filters.from_date);
  if (filters.to_date) params.append('to_date', filters.to_date);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Fetch notifications with optional filters
 */
export const getNotifications = async (
  role: UserRole,
  filters?: NotificationFilters
): Promise<NotificationsResponse> => {
  const endpoints = getEndpoints(role);
  const queryString = buildQueryString(filters);
  const response = await apiClient.get<NotificationsResponse>(`${endpoints.LIST}${queryString}`);
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (role: UserRole): Promise<UnreadCountResponse> => {
  const endpoints = getEndpoints(role);
  const response = await apiClient.get<UnreadCountResponse>(endpoints.UNREAD_COUNT);
  return response.data;
};

/**
 * Get a single notification by ID
 */
export const getNotification = async (
  role: UserRole,
  notificationId: string
): Promise<Notification> => {
  const endpoints = getEndpoints(role);
  const response = await apiClient.get<Notification>(endpoints.GET(notificationId));
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (
  role: UserRole,
  notificationId: string
): Promise<MarkAsReadResponse> => {
  const endpoints = getEndpoints(role);
  const response = await apiClient.put<MarkAsReadResponse>(endpoints.MARK_READ(notificationId));
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  role: UserRole,
  request?: MarkAllAsReadRequest
): Promise<MarkAllAsReadResponse> => {
  const endpoints = getEndpoints(role);
  const response = await apiClient.put<MarkAllAsReadResponse>(
    endpoints.MARK_ALL_READ,
    request || {}
  );
  return response.data;
};

/**
 * Delete a single notification
 */
export const deleteNotification = async (
  role: UserRole,
  notificationId: string
): Promise<void> => {
  const endpoints = getEndpoints(role);
  await apiClient.delete(endpoints.DELETE(notificationId));
};

/**
 * Delete all read notifications
 */
export const deleteAllRead = async (role: UserRole): Promise<DeleteAllReadResponse> => {
  const endpoints = getEndpoints(role);
  const response = await apiClient.delete<DeleteAllReadResponse>(endpoints.DELETE_ALL_READ);
  return response.data;
};
