import { type LucideIcon, BarChart3, Users, UserCog, FolderKanban, Settings, Plug, CheckSquare, Clock, TrendingUp, MessageSquare, Calendar, Megaphone } from "lucide-react";
import { UserRole } from "@/api/types/index";

export interface RouteConfig {
  path: string;
  name: string;
  icon: LucideIcon;
  requireAuth?: boolean;
  requiredRole?: UserRole;
}

/**
 * Dashboard Routes Configuration
 *
 * Centralized route definitions for all user roles.
 * This eliminates hardcoded routes in App.tsx and enables:
 * - Automatic route generation
 * - Consistent navigation across sidebar and mobile menus
 * - Type-safe route access
 */

export const ADMIN_ROUTES: RouteConfig[] = [
  {
    path: "/dashboard/admin",
    name: "Dashboard",
    icon: BarChart3,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/dashboard/admin/users",
    name: "Users",
    icon: Users,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/dashboard/admin/roles",
    name: "Roles",
    icon: UserCog,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/dashboard/admin/projects",
    name: "Projects",
    icon: FolderKanban,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/dashboard/admin/settings",
    name: "Settings",
    icon: Settings,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/dashboard/admin/plugins",
    name: "Plugins",
    icon: Plug,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/dashboard/admin/profile",
    name: "Profile",
    icon: UserCog,
    requireAuth: true,
    requiredRole: "admin",
  },
];

export const MEMBER_ROUTES: RouteConfig[] = [
  {
    path: "/dashboard/member",
    name: "Overview",
    icon: BarChart3,
    requireAuth: true,
    requiredRole: "employee",
  },
  {
    path: "/dashboard/member/tasks",
    name: "Tasks",
    icon: CheckSquare,
    requireAuth: true,
    requiredRole: "employee",
  },
  {
    path: "/dashboard/member/time-tracking",
    name: "Time Tracking",
    icon: Clock,
    requireAuth: true,
    requiredRole: "employee",
  },
  {
    path: "/dashboard/member/progress",
    name: "My Progress",
    icon: TrendingUp,
    requireAuth: true,
    requiredRole: "employee",
  },
  {
    path: "/dashboard/member/feedback",
    name: "Feedback",
    icon: MessageSquare,
    requireAuth: true,
    requiredRole: "employee",
  },
  {
    path: "/dashboard/member/profile",
    name: "Profile",
    icon: UserCog,
    requireAuth: true,
    requiredRole: "employee",
  },
];

export const TEAM_LEAD_ROUTES: RouteConfig[] = [
  {
    path: "/dashboard/team-lead",
    name: "Overview",
    icon: BarChart3,
    requireAuth: true,
    requiredRole: "team_lead",
  },
  {
    path: "/dashboard/team-lead/tasks",
    name: "Tasks",
    icon: CheckSquare,
    requireAuth: true,
    requiredRole: "team_lead",
  },
  {
    path: "/dashboard/team-lead/sprints",
    name: "Sprints",
    icon: Calendar,
    requireAuth: true,
    requiredRole: "team_lead",
  },
  {
    path: "/dashboard/team-lead/time-approval",
    name: "Time Approval",
    icon: Clock,
    requireAuth: true,
    requiredRole: "team_lead",
  },
  {
    path: "/dashboard/team-lead/feedback",
    name: "Feedback",
    icon: MessageSquare,
    requireAuth: true,
    requiredRole: "team_lead",
  },
  {
    path: "/dashboard/team-lead/team",
    name: "Team",
    icon: Users,
    requireAuth: true,
    requiredRole: "team_lead",
  },
  {
    path: "/dashboard/team-lead/communications",
    name: "Communications",
    icon: Megaphone,
    requireAuth: true,
    requiredRole: "team_lead",
  },
  {
    path: "/dashboard/team-lead/profile",
    name: "Profile",
    icon: UserCog,
    requireAuth: true,
    requiredRole: "team_lead",
  },
];

export const PROJECT_MANAGER_ROUTES: RouteConfig[] = [
  {
    path: "/dashboard/project-manager",
    name: "Overview",
    icon: BarChart3,
    requireAuth: true,
    requiredRole: "project_manager",
  },
  {
    path: "/dashboard/project-manager/projects",
    name: "Projects",
    icon: FolderKanban,
    requireAuth: true,
    requiredRole: "project_manager",
  },
  {
    path: "/dashboard/project-manager/timeline",
    name: "Timeline",
    icon: Calendar,
    requireAuth: true,
    requiredRole: "project_manager",
  },
  {
    path: "/dashboard/project-manager/reports",
    name: "Reports",
    icon: BarChart3,
    requireAuth: true,
    requiredRole: "project_manager",
  },
  {
    path: "/dashboard/project-manager/profile",
    name: "Profile",
    icon: UserCog,
    requireAuth: true,
    requiredRole: "project_manager",
  },
];

/**
 * Get routes by user role
 */
export const getRoutesByRole = (role: UserRole | undefined): RouteConfig[] => {
  if (!role) return [];

  const routeMap: Record<UserRole, RouteConfig[]> = {
    admin: ADMIN_ROUTES,
    employee: MEMBER_ROUTES,
    team_lead: TEAM_LEAD_ROUTES,
    project_manager: PROJECT_MANAGER_ROUTES,
  };

  return routeMap[role] || [];
};

/**
 * Get all protected routes (for routing configuration)
 */
export const getAllProtectedRoutes = (): RouteConfig[] => {
  return [
    ...ADMIN_ROUTES,
    ...MEMBER_ROUTES,
    ...TEAM_LEAD_ROUTES,
    ...PROJECT_MANAGER_ROUTES,
  ];
};
