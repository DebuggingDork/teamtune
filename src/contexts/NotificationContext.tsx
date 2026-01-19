import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useDeleteAllRead } from '@/hooks/useNotifications';
import type { Notification, UserRole, NotificationPriority } from '@/api/types/index';
import { toast } from '@/hooks/use-toast';

interface NotificationContextType {
  // Panel state
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  // Unread count state
  unreadCount: number;
  unreadByPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  unreadByCategory: {
    task: number;
    team: number;
    project: number;
    evaluation: number;
    github: number;
    system: number;
    attendance: number;
  };
  isLoadingCount: boolean;
  refetchUnreadCount: () => void;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;

  // Navigation helper
  handleNotificationClick: (notification: Notification) => void;

  // Role
  userRole: UserRole | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Get user role - need to handle the case where user might not be authenticated
  const userRole = user?.role || null;

  // Fetch unread count with polling (only when authenticated and has role)
  const {
    data: unreadData,
    isLoading: isLoadingCount,
    refetch: refetchUnreadCount,
  } = useUnreadCount(userRole as UserRole);

  // Mutations
  const markAsReadMutation = useMarkAsRead(userRole as UserRole);
  const markAllAsReadMutation = useMarkAllAsRead(userRole as UserRole);
  const deleteNotificationMutation = useDeleteNotification(userRole as UserRole);
  const deleteAllReadMutation = useDeleteAllRead(userRole as UserRole);

  // Panel controls
  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);
  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userRole) return;
      await markAsReadMutation.mutateAsync(notificationId);
    },
    [userRole, markAsReadMutation]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userRole) return;
    const result = await markAllAsReadMutation.mutateAsync();
    toast({
      title: 'Notifications marked as read',
      description: `${result.marked_count} notification${result.marked_count !== 1 ? 's' : ''} marked as read.`,
    });
  }, [userRole, markAllAsReadMutation]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!userRole) return;
      await deleteNotificationMutation.mutateAsync(notificationId);
    },
    [userRole, deleteNotificationMutation]
  );

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    if (!userRole) return;
    const result = await deleteAllReadMutation.mutateAsync();
    toast({
      title: 'Read notifications deleted',
      description: `${result.deleted_count} notification${result.deleted_count !== 1 ? 's' : ''} deleted.`,
    });
  }, [userRole, deleteAllReadMutation]);

  const navigate = useNavigate();

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      // Mark as read if not already
      if (!notification.is_read) {
        markAsRead(notification.id);
      }

      // Navigate to action URL if available
      if (notification.action_url) {
        // Map backend URLs to frontend routes if needed
        let targetUrl = notification.action_url;

        // Handle team-lead routes defined in backend guide but nested in /dashboard in frontend
        if (targetUrl.startsWith('/team-lead/') && !targetUrl.startsWith('/dashboard/')) {
          targetUrl = `/dashboard${targetUrl}`;
        }
        if (targetUrl.startsWith('/employee/') && !targetUrl.startsWith('/dashboard/member/')) {
          targetUrl = `/dashboard/member${targetUrl.replace('/employee/', '/')}`;
        }

        // Use router for SPA navigation
        navigate(targetUrl);
      }

      // Close the panel
      closePanel();
    },
    [markAsRead, closePanel, navigate]
  );

  const value: NotificationContextType = {
    isOpen,
    openPanel,
    closePanel,
    togglePanel,
    unreadCount: unreadData?.unread_count ?? 0,
    unreadByPriority: unreadData?.by_priority ?? { urgent: 0, high: 0, medium: 0, low: 0 },
    unreadByCategory: unreadData?.by_category ?? { task: 0, team: 0, project: 0, evaluation: 0, github: 0, system: 0, attendance: 0 },
    isLoadingCount,
    refetchUnreadCount: () => {
      if (isAuthenticated && userRole) {
        refetchUnreadCount();
      }
    },
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    handleNotificationClick,
    userRole,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

// Helper hook to get priority color classes
export const usePriorityStyles = () => {
  const getPriorityColor = (priority: NotificationPriority): string => {
    const colors: Record<NotificationPriority, string> = {
      urgent: 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500',
      high: 'bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500',
      medium: 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500',
      low: 'bg-gray-100 dark:bg-gray-800/50 border-l-4 border-gray-400',
    };
    return colors[priority];
  };

  const getPriorityBadgeColor = (priority: NotificationPriority): string => {
    const colors: Record<NotificationPriority, string> = {
      urgent: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-blue-500 text-white',
      low: 'bg-gray-500 text-white',
    };
    return colors[priority];
  };

  return { getPriorityColor, getPriorityBadgeColor };
};

// Helper hook to get notification type icon
export const useNotificationIcons = () => {
  const getTypeIcon = (type: string): string => {
    if (type.startsWith('task_')) return 'clipboard-list';
    if (type.startsWith('pr_')) return 'git-pull-request';
    if (type.startsWith('team_')) return 'users';
    if (type.startsWith('project_') || type.startsWith('sprint_')) return 'folder';
    if (type.startsWith('evaluation_')) return 'bar-chart-2';
    if (type.startsWith('repository_') || type.startsWith('branch_') || type.startsWith('collaborator_')) return 'github';
    if (type.startsWith('account_') || type.startsWith('system_')) return 'settings';
    return 'bell';
  };

  return { getTypeIcon };
};
