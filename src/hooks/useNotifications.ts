import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationService from '@/services/notification.service';
import type {
  NotificationFilters,
  MarkAllAsReadRequest,
  UserRole,
} from '@/api/types/index';
import { handleError } from '@/utils/errorHandler';

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (role: UserRole, filters?: NotificationFilters) =>
    ['notifications', role, 'list', filters] as const,
  unreadCount: (role: UserRole) => ['notifications', role, 'unread-count'] as const,
  detail: (role: UserRole, id: string) => ['notifications', role, id] as const,
};

/**
 * Get notifications list
 */
export const useNotifications = (role: UserRole, filters?: NotificationFilters) => {
  return useQuery({
    queryKey: notificationKeys.list(role, filters),
    queryFn: () => notificationService.getNotifications(role, filters),
    staleTime: 30000,
    enabled: !!role,
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
  });
};

/**
 * Get unread notifications count
 */
export const useUnreadCount = (role: UserRole) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(role),
    queryFn: () => notificationService.getUnreadCount(role),
    staleTime: 30000,
    enabled: !!role,
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

/**
 * Get single notification
 */
export const useNotification = (role: UserRole, notificationId: string) => {
  return useQuery({
    queryKey: notificationKeys.detail(role, notificationId),
    queryFn: () => notificationService.getNotification(role, notificationId),
    staleTime: 30000,
    enabled: !!role && !!notificationId,
  });
};

/**
 * Mark notification as read
 */
export const useMarkAsRead = (role: UserRole) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(role, notificationId),
    onSuccess: (_, notificationId) => {
      // Invalidate ALL notification list queries (regardless of filters)
      queryClient.invalidateQueries({ queryKey: ['notifications', role, 'list'] });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(role) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(role, notificationId) });
    },
    onError: handleError,
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllAsRead = (role: UserRole) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request?: MarkAllAsReadRequest) =>
      notificationService.markAllAsRead(role, request),
    onSuccess: () => {
      // Invalidate ALL notification queries (regardless of filters)
      queryClient.invalidateQueries({ queryKey: ['notifications', role, 'list'] });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(role) });
    },
    onError: handleError,
  });
};

/**
 * Delete notification
 */
export const useDeleteNotification = (role: UserRole) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(role, notificationId),
    onSuccess: (_, notificationId) => {
      // Invalidate ALL notification list queries (regardless of filters)
      queryClient.invalidateQueries({ queryKey: ['notifications', role, 'list'] });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(role) });
      // Remove the specific notification from cache
      queryClient.removeQueries({ queryKey: notificationKeys.detail(role, notificationId) });
    },
    onError: handleError,
  });
};

/**
 * Delete all read notifications
 */
export const useDeleteAllRead = (role: UserRole) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.deleteAllRead(role),
    onSuccess: () => {
      // Invalidate ALL notification queries (regardless of filters)
      queryClient.invalidateQueries({ queryKey: ['notifications', role, 'list'] });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(role) });
    },
    onError: handleError,
  });
};
