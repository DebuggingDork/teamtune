import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Bell,
  X,
  Check,
  Trash2,
  CheckCheck,
  Loader2,
  ClipboardList,
  GitPullRequest,
  Users,
  Folder,
  BarChart2,
  Github,
  Settings,
  AlertCircle,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationContext, usePriorityStyles } from "@/contexts/NotificationContext";
import type { Notification, NotificationCategory, NotificationPriority } from "@/api/types/index";
import { formatDistanceToNow } from "date-fns";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'unread' | NotificationCategory;

const FILTER_OPTIONS: { value: FilterType; label: string; icon?: any }[] = [
  { value: 'all', label: 'All', icon: Sparkles },
  { value: 'attendance', label: 'Leave', icon: Calendar },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'team', label: 'Team', icon: Users },
];

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const { getPriorityColor, getPriorityBadgeColor } = usePriorityStyles();

  const {
    unreadCount,
    unreadByCategory,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    handleNotificationClick,
    userRole,
  } = useNotificationContext();

  // Build filters based on selected filter
  const filters = useMemo(() => {
    const baseFilters: { is_read?: boolean; category?: NotificationCategory; limit: number } = {
      limit: 50,
    };

    if (filter === 'unread') {
      baseFilters.is_read = false;
    } else if (filter !== 'all') {
      baseFilters.category = filter as NotificationCategory;
    }

    return baseFilters;
  }, [filter]);

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useNotifications(userRole!, filters);

  const notifications = notificationsData?.notifications ?? [];

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Get category label from notification type
  const getCategoryLabel = (type: string): string => {
    if (type.startsWith('task_')) return 'Task';
    if (type.startsWith('pr_') || type.startsWith('repository_') || type.startsWith('branch_') || type.startsWith('collaborator_')) return 'GitHub';
    if (type.startsWith('team_')) return 'Team';
    if (type.startsWith('project_') || type.startsWith('sprint_')) return 'Project';
    if (type.startsWith('evaluation_')) return 'Evaluation';
    if (type.startsWith('account_') || type.startsWith('system_')) return 'System';
    // Leave & Attendance notifications
    if (type.startsWith('leave_')) return 'Leave';
    if (type === 'late_arrival' || type === 'absent_without_leave') return 'Attendance';
    return 'Info';
  };

  // Get category color
  const getCategoryColor = (type: string): string => {
    if (type.startsWith('task_')) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (type.startsWith('pr_') || type.startsWith('repository_') || type.startsWith('branch_') || type.startsWith('collaborator_')) return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    if (type.startsWith('team_')) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (type.startsWith('project_') || type.startsWith('sprint_')) return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    if (type.startsWith('evaluation_')) return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
    if (type.startsWith('account_') || type.startsWith('system_')) return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    // Leave & Attendance notifications
    if (type === 'leave_approved') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (type === 'leave_rejected') return 'bg-red-500/10 text-red-600 border-red-500/20';
    if (type === 'leave_requested' || type === 'leave_cancelled') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    if (type === 'late_arrival') return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    if (type === 'absent_without_leave') return 'bg-red-500/10 text-red-600 border-red-500/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  // Get icon for notification type
  const getTypeIcon = (type: string) => {
    if (type.startsWith('task_')) return ClipboardList;
    if (type.startsWith('pr_')) return GitPullRequest;
    if (type.startsWith('team_')) return Users;
    if (type.startsWith('project_') || type.startsWith('sprint_')) return Folder;
    if (type.startsWith('evaluation_')) return BarChart2;
    if (type.startsWith('repository_') || type.startsWith('branch_') || type.startsWith('collaborator_')) return Github;
    if (type.startsWith('account_') || type.startsWith('system_')) return Settings;
    // Leave & Attendance notifications
    if (type === 'leave_requested') return Calendar;
    if (type === 'leave_approved') return CheckCircle2;
    if (type === 'leave_rejected') return XCircle;
    if (type === 'leave_cancelled') return Ban;
    if (type === 'late_arrival') return Clock;
    if (type === 'absent_without_leave') return AlertTriangle;
    return Bell;
  };

  // Get priority gradient
  const getPriorityGradient = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'from-red-500/20 via-red-500/10 to-transparent';
      case 'high':
        return 'from-orange-500/20 via-orange-500/10 to-transparent';
      case 'medium':
        return 'from-blue-500/20 via-blue-500/10 to-transparent';
      case 'low':
        return 'from-gray-500/20 via-gray-500/10 to-transparent';
      default:
        return 'from-primary/20 via-primary/10 to-transparent';
    }
  };

  // Format relative time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { today: Notification[]; yesterday: Notification[]; thisWeek: Notification[]; older: Notification[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    notifications.forEach((notification) => {
      const date = new Date(notification.created_at);

      if (date >= today) {
        groups.today.push(notification);
      } else if (date >= yesterday) {
        groups.yesterday.push(notification);
      } else if (date >= weekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  }, [notifications]);

  const renderNotificationItem = (notification: Notification) => {
    const Icon = getTypeIcon(notification.type);
    const gradientClass = getPriorityGradient(notification.priority);

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: -100, scale: 0.9 }}
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "group relative p-4 cursor-pointer transition-all duration-300 overflow-hidden",
          "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent",
          "border-l-4 border-transparent hover:border-primary",
          !notification.is_read && "bg-gradient-to-r from-primary/5 to-transparent border-l-primary/50"
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        {/* Gradient overlay for priority */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          gradientClass
        )} />

        {/* Unread indicator dot */}
        {!notification.is_read && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50"
          />
        )}

        <div className="relative flex items-start gap-3">
          {/* Icon with glassmorphism */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "relative p-3 rounded-xl shrink-0 backdrop-blur-xl border transition-all duration-300",
              notification.is_read
                ? "bg-muted/50 border-muted"
                : "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 shadow-lg shadow-primary/10"
            )}
          >
            <Icon className={cn(
              "h-5 w-5 transition-colors duration-300",
              notification.is_read ? "text-muted-foreground" : "text-primary"
            )} />

            {/* Glow effect */}
            {!notification.is_read && (
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md -z-10" />
            )}
          </motion.div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and Priority Badge */}
            <div className="flex items-start justify-between gap-2">
              <h4 className={cn(
                "text-sm line-clamp-2 transition-colors duration-200",
                !notification.is_read && "font-semibold text-foreground",
                notification.is_read && "text-muted-foreground"
              )}>
                {notification.title}
              </h4>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Category Badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 font-medium border",
                    getCategoryColor(notification.type)
                  )}
                >
                  {getCategoryLabel(notification.type)}
                </Badge>
                {/* Priority Badge */}
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-2 py-0.5 font-medium backdrop-blur-sm border",
                    getPriorityBadgeColor(notification.priority),
                    "shadow-sm"
                  )}
                >
                  {notification.priority}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {notification.message}
            </p>

            {/* Specialized Action for Leave Requests */}
            {notification.type === 'leave_requested' && !notification.is_read && (
              <Button
                size="sm"
                className="w-full mt-2 h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationClick(notification);
                }}
              >
                Review Request
              </Button>
            )}

            {/* Footer with Actor and Time */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {notification.actor && (
                  <>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <span className="font-medium">{notification.actor.full_name}</span>
                    </div>
                    <span className="text-muted-foreground/50">•</span>
                  </>
                )}
                <span className="opacity-75">{formatTime(notification.created_at)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNotificationGroup = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-2">
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
            {title}
            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
              {items.length}
            </Badge>
          </h5>
        </div>
        <AnimatePresence mode="popLayout">
          {items.map(renderNotificationItem)}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel with glassmorphism */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-background/95 backdrop-blur-2xl border-l border-border/50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header with gradient */}
            <div className="relative shrink-0 border-b border-border/50">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-sm"
                  >
                    <Bell className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-9 px-3 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-4 w-4 mr-1.5" />
                      Mark read
                    </Button>
                  )}
                  {notifications.some(n => n.is_read) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deleteAllRead}
                      className="text-xs h-9 px-3 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-lg"
                      title="Delete all read notifications"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Clear read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filters with improved design */}
              <div className="px-5 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {FILTER_OPTIONS.map((option) => {
                    const OptionIcon = option.icon;
                    const isActive = filter === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFilter(option.value)}
                        className={cn(
                          "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                          "border backdrop-blur-sm",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                            : "bg-background/50 text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground hover:border-border"
                        )}
                      >
                        {OptionIcon && (
                          <OptionIcon className={cn(
                            "h-4 w-4 transition-colors",
                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                          )} />
                        )}
                        <span>{option.label}</span>

                        {/* Category specific unread count dot */}
                        {option.value !== 'all' && option.value !== 'unread' && (unreadByCategory as any)[option.value] > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background shadow-sm" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-10 w-10 text-primary" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 mb-4">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Failed to load</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unable to fetch notifications. Please try again.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-64 p-6 text-center"
                >
                  <div className="relative mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                    />
                    <div className="relative p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl border border-primary/20">
                      <Bell className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    {filter === 'unread' ? 'All caught up! 🎉' : 'No notifications'}
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {filter === 'unread'
                      ? "You've read all your notifications. Great job staying on top of things!"
                      : 'You have no notifications yet. Check back later for updates.'}
                  </p>
                </motion.div>
              ) : (
                <div>
                  {renderNotificationGroup('Today', groupedNotifications.today)}
                  {renderNotificationGroup('Yesterday', groupedNotifications.yesterday)}
                  {renderNotificationGroup('This Week', groupedNotifications.thisWeek)}
                  {renderNotificationGroup('Older', groupedNotifications.older)}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )
      }
    </AnimatePresence >
  );
};

export default NotificationPanel;
