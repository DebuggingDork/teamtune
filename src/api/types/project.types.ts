// ============================================================================
// PROJECT TYPES - Project related types
// ============================================================================

import type { ProjectStatus, TaskStatus, PaginationResponse } from './common.types';

// Project Types
export interface Project {
  id: string;
  project_code: string;
  name: string;
  description: string;
  manager_id: string;
  manager_name?: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: PaginationResponse;
}

export interface DeleteProjectResponse {
  message: string;
  project_code: string;
}

export interface BulkDeleteProjectsRequest {
  project_codes: string[];
}

export interface BulkDeleteProjectError {
  project_code: string;
  error: string;
}

export interface BulkDeleteProjectsResponse {
  message: string;
  deleted: string[];
  failed: BulkDeleteProjectError[];
  total_requested: number;
  total_deleted: number;
  total_failed: number;
}

// Project Health Types
export interface ProjectHealthResponse {
  project: {
    project_id: string;
    project_code: string;
    project_name: string;
    status: ProjectStatus;
    start_date: string;
    end_date: string;
  };
  health: {
    overall_status: 'healthy' | 'warning' | 'critical';
    indicators: {
      tasks: {
        total: number;
        completed: number;
        in_progress: number;
        blocked: number;
        completion_rate: number;
        average_completion_days?: number;
        overdue?: number;
      };
      teams: {
        total: number;
        active: number;
        average_performance_score: number;
      };
      resources: {
        total_hours_logged: number;
        total_estimated_hours: number;
        utilization_rate: number;
      };
      risks: {
        blocked_tasks_count: number;
        overdue_tasks_count: number;
        teams_with_low_performance: number;
      };
    };
    teams: Array<{
      team_id: string;
      team_code: string;
      team_name: string;
      performance_score: number;
      tasks_completed: number;
      tasks_total: number;
      health_status: 'healthy' | 'warning' | 'critical';
    }>;
  };
}

// Admin Project Types
export interface AdminProjectManager {
  id: string;
  user_code: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
}

export interface AdminProjectStats {
  team_count: number;
  total_tasks: number;
  completed_tasks: number;
  progress: number;
}

export interface AdminProjectListItem {
  id: string;
  project_code: string;
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  manager: AdminProjectManager;
  stats: AdminProjectStats;
}

export interface AdminProjectsListResponse {
  projects: AdminProjectListItem[];
  pagination: PaginationResponse;
}

export interface AdminProjectTeam {
  id: string;
  team_code: string;
  name: string;
  lead: {
    id: string;
    full_name: string;
  };
  member_count: number;
  total_tasks: number;
  completed_tasks: number;
  progress: number;
}

export interface AdminProjectTaskStats {
  todo: number;
  in_progress: number;
  done: number;
  blocked: number;
  total: number;
}

export interface AdminProjectDays {
  total_days: number;
  days_elapsed: number;
  days_remaining: number;
  is_overdue: boolean;
  time_progress: number;
}

export interface AdminProjectRecentActivity {
  task_code: string;
  title: string;
  status: TaskStatus;
  assigned_to: string;
}

export interface AdminProjectDetails {
  id: string;
  project_code: string;
  name: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  manager: AdminProjectManager;
  teams: AdminProjectTeam[];
  task_stats: AdminProjectTaskStats;
  progress: number;
  days: AdminProjectDays;
  recent_activity?: AdminProjectRecentActivity[];
}

export interface AdminProjectStatsResponse {
  planning: number;
  active: number;
  completed: number;
  cancelled: number;
  on_hold: number;
  total: number;
}

export interface EmployeeProjectsResponse {
  projects: Array<{
    id: string;
    project_code: string;
    name: string;
    description: string;
    status: ProjectStatus;
    start_date: string;
    end_date: string;
  }>;
  pagination: PaginationResponse;
}
