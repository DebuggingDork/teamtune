import {
  BarChart3,
  Users,
  Settings,
  UserCog,
  FolderKanban,
  Plug,
  CheckSquare,
  Clock,
  TrendingUp,
  MessageSquare,
  Calendar,
  Megaphone,
  Github,
} from "lucide-react";
import { NavItem, UserRole } from "./types";

/**
 * Navigation items configuration for each user role
 * Centralized configuration to prevent duplication
 */
export const navigationConfig: Record<UserRole, NavItem[]> = {
  admin: [
    {
      path: "/dashboard/admin",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      path: "/dashboard/admin/users",
      label: "Users",
      icon: Users,
    },
    {
      path: "/dashboard/admin/roles",
      label: "Roles",
      icon: UserCog,
    },
    {
      path: "/dashboard/admin/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    {
      path: "/dashboard/admin/settings",
      label: "Settings",
      icon: Settings,
    },
    {
      path: "/dashboard/admin/plugins",
      label: "Plugins",
      icon: Plug,
    },
  ],
  member: [
    {
      path: "/dashboard/member",
      label: "Overview",
      icon: BarChart3,
    },
    {
      path: "/dashboard/member/tasks",
      label: "Tasks",
      icon: CheckSquare,
    },
    {
      path: "/dashboard/member/time-tracking",
      label: "Time Tracking",
      icon: Clock,
    },
    {
      path: "/dashboard/member/progress",
      label: "My Progress",
      icon: TrendingUp,
    },
    {
      path: "/dashboard/member/feedback",
      label: "Feedback",
      icon: MessageSquare,
    },
    {
      path: "/dashboard/member/github",
      label: "GitHub",
      icon: Github,
    },
  ],
  "team-lead": [
    {
      path: "/dashboard/team-lead",
      label: "Overview",
      icon: BarChart3,
    },
    {
      path: "/dashboard/team-lead/tasks",
      label: "Tasks",
      icon: CheckSquare,
    },
    {
      path: "/dashboard/team-lead/sprints",
      label: "Sprints",
      icon: Calendar,
    },
    {
      path: "/dashboard/team-lead/time-approval",
      label: "Time Approval",
      icon: Clock,
    },
    {
      path: "/dashboard/team-lead/feedback",
      label: "Feedback",
      icon: MessageSquare,
    },
    {
      path: "/dashboard/team-lead/team",
      label: "Team",
      icon: Users,
    },
    {
      path: "/dashboard/team-lead/communications",
      label: "Communications",
      icon: Megaphone,
    },
    {
      path: "/dashboard/team-lead/profile",
      label: "Profile",
      icon: UserCog,
    },
    {
      path: "/dashboard/team-lead/github",
      label: "GitHub",
      icon: Github,
    },
  ],
  "project-manager": [
    {
      path: "/dashboard/project-manager",
      label: "Overview",
      icon: BarChart3,
    },
    {
      path: "/dashboard/project-manager/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    {
      path: "/dashboard/project-manager/timeline",
      label: "Timeline",
      icon: Calendar,
    },
    {
      path: "/dashboard/project-manager/reports",
      label: "Reports",
      icon: BarChart3,
    },
  ],
};

/**
 * Get navigation items for a specific role
 */
export const getNavItemsForRole = (role: UserRole): NavItem[] => {
  return navigationConfig[role] || [];
};

/**
 * Get profile route for a specific role
 */
export const getProfileRouteForRole = (role: UserRole): string => {
  const profileRoutes: Record<UserRole, string> = {
    admin: "/dashboard/admin/profile",
    member: "/dashboard/member/profile",
    "team-lead": "/dashboard/team-lead/profile",
    "project-manager": "/dashboard/project-manager/profile",
  };
  return profileRoutes[role];
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    admin: "System Administrator",
    member: "Member",
    "team-lead": "Team Lead",
    "project-manager": "Project Manager",
  };
  return displayNames[role];
};
