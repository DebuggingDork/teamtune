// Base Types
export type UserRole = 'admin' | 'project_manager' | 'team_lead' | 'employee';
export type UserStatus = 'pending' | 'active' | 'blocked' | 'inactive';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'done' | 'cancelled';
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
export type ObservationCategory = 'technical' | 'communication' | 'leadership' | 'delivery' | 'quality' | 'collaboration';
export type ObservationRating = 'positive' | 'neutral' | 'negative';
export type PerformanceTier = 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
export type PluginStatus = 'connected' | 'active' | 'inactive' | 'disconnected';

// User Types
export interface User {
  id: string;
  user_code: string;
  username?: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  department_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  status: 'pending';
  created_at: string;
  department_id: string | null;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  full_name: string;
  department_id?: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

export interface RegistrationStatusResponse {
  status: 'pending' | 'approved' | 'rejected';
  user_code: string | null;
  message: string;
}

export interface LogoutResponse {
  message: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

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

// Team Types
export interface Team {
  id: string;
  team_code: string;
  project_id: string;
  project_name?: string;
  name: string;
  lead_id: string;
  lead_name?: string;
  capacity_hours_per_sprint: number;
  member_count?: number;
  github_repository?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  name: string;
  lead_id: string;
  capacity_hours_per_sprint: number;
}

export interface TeamsResponse {
  teams: Team[];
  pagination: PaginationResponse;
  project?: {
    project_id: string;
    project_code: string;
    project_name: string;
  };
}

export interface TeamMember {
  user_id: string;
  user_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  allocation_percentage: number;
  joined_at: string;
}

export interface TeamMembersResponse {
  members: TeamMember[];
  pagination: PaginationResponse;
  team: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
}

export interface AssignTeamLeadRequest {
  lead_id: string;
}

export interface RemoveTeamLeadRequest {
  new_lead_id: string;
}

export interface AddTeamMembersRequest {
  user_ids: string[];
  allocation_percentage: number;
}

export interface AddTeamMembersResponse {
  message: string;
  added: number;
}

// Task Types
export interface Task {
  id: string;
  task_code: string;
  team_id: string;
  team_code: string;
  team_name: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_to_name: string;
  created_by: string;
  created_by_name: string;
  status: TaskStatus;
  priority: number;
  estimated_hours: number;
  actual_hours: number;
  due_date: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  assigned_to: string;
  priority: number;
  estimated_hours: number;
  due_date: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: number;
  estimated_hours?: number;
  due_date?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface AssignTaskRequest {
  assigned_to: string;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: PaginationResponse;
  team?: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
}

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

// Observation Types
export interface Observation {
  id: string;
  observation_code: string;
  user_id: string;
  user_code: string;
  user_name: string;
  evaluator_id: string;
  evaluator_name: string;
  evaluator_role?: string;
  related_task_id?: string;
  related_task_code?: string;
  related_task_title?: string;
  category: ObservationCategory;
  rating: ObservationRating;
  note: string;
  observation_date: string;
  created_at: string;
}

export interface CreateObservationRequest {
  category: ObservationCategory;
  rating: ObservationRating;
  note: string;
  related_task_id?: string;
  observation_date: string;
}

export interface UpdateObservationRequest {
  category?: ObservationCategory;
  rating?: ObservationRating;
  note?: string;
}

export interface ObservationsResponse {
  observations: Observation[];
  pagination: PaginationResponse;
  member?: {
    user_id: string;
    user_code: string;
    user_name: string;
  };
  team?: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
  summary?: {
    total: number;
    by_category: Record<ObservationCategory, number>;
    by_rating: Record<ObservationRating, number>;
  };
}

// Performance Types
export interface TaskMetrics {
  total: number;
  completed: number;
  in_progress: number;
  blocked: number;
  completion_rate: number;
  average_completion_days?: number;
  overdue?: number;
}

export interface TimeTrackingMetrics {
  total_hours_logged: number;
  total_estimated_hours?: number;
  variance_percentage?: number;
  average_hours_per_task?: number;
  average_hours_per_day?: number;
}

export interface ObservationMetrics {
  total: number;
  by_category: Record<ObservationCategory, number>;
  by_rating: Record<ObservationRating, number>;
}

export interface EvaluationMetrics {
  finalized_count?: number;
  average_score?: number;
  tier_distribution?: Record<PerformanceTier, number>;
}

export interface PerformanceMetrics {
  tasks: TaskMetrics;
  time_tracking: TimeTrackingMetrics;
  observations: ObservationMetrics;
  evaluations?: EvaluationMetrics;
}

export interface MemberPerformanceSummary {
  user_id: string;
  user_code: string;
  user_name: string;
  tasks_completed?: number;
  tasks_total?: number;
  performance_score: number;
  tier?: PerformanceTier;
}

export interface TeamPerformanceResponse {
  team: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: PerformanceMetrics;
  members?: MemberPerformanceSummary[];
  members_summary?: {
    total_members: number;
    active_members: number;
    average_performance_score: number;
  };
}

export interface MemberPerformanceResponse {
  user: {
    user_id: string;
    user_code: string;
    user_name: string;
  };
  team?: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: PerformanceMetrics;
  summary: {
    performance_score: number;
    tier: PerformanceTier;
  };
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
      tasks: TaskMetrics;
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

// Git Activity Types
export interface GitActivity {
  commits: number;
  pull_requests: number;
  code_reviews: number;
  activity_by_date?: Array<{
    date: string;
    commits: number;
    pull_requests: number;
  }>;
}

export interface TeamGitActivityResponse {
  team: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  total_commits: number;
  total_pull_requests: number;
  total_code_reviews: number;
  activity_by_member: Array<{
    user_id: string;
    user_code: string;
    user_name: string;
    commits: number;
    pull_requests: number;
    code_reviews: number;
  }>;
}

export interface MemberGitActivityResponse {
  user: {
    user_id: string;
    user_code: string;
    user_name: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  commits: number;
  pull_requests: number;
  code_reviews: number;
  activity_by_date: Array<{
    date: string;
    commits: number;
    pull_requests: number;
  }>;
}

export interface GitMetrics {
  git_activity: {
    commits?: number;
    pull_requests?: number;
    code_reviews?: number;
    total_commits?: number;
    total_pull_requests?: number;
    total_code_reviews?: number;
  };
  tasks: {
    completed: number;
    in_progress?: number;
    total?: number;
  };
}

// GitHub Integration Types
export interface GitHubConnectResponse {
  auth_url: string;
}

export interface GitHubStatusResponse {
  connected: boolean;
  github_username?: string;
  github_user_id?: string;
}

export interface LinkRepositoryRequest {
  repository_url: string;
}

export interface LinkRepositoryResponse {
  message: string;
  repository_url: string;
}

// Plugin Types
export interface Plugin {
  id: string;
  name: string;
  type: string;
  status: PluginStatus;
  config: Record<string, unknown>;
}

export interface UpdatePluginRequest {
  config?: Record<string, unknown>;
  status?: PluginStatus;
}

export interface SyncPluginResponse {
  message: string;
}

// Admin Types
export interface ApproveUserRequest {
  role: UserRole;
  department_id?: string;
}

export interface ApproveUserResponse {
  message: string;
  user: {
    id: string;
    user_code: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
}

export interface RejectUserRequest {
  reason?: string;
}

export interface RejectUserResponse {
  message: string;
}

export interface PromoteToAdminRequest {
  user_id: string;
  admin_code: string;
}

export interface PromoteToAdminResponse {
  message: string;
}

// Employee Types
export interface EmployeeProfile {
  id: string;
  user_code: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  department_id?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  username?: string;
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

export interface EmployeeTeamsResponse {
  teams: Array<{
    id: string;
    team_code: string;
    project_id: string;
    project_code: string;
    project_name: string;
    name: string;
    lead_id: string;
    lead_name: string;
    capacity_hours_per_sprint: number;
    github_repository: string | null;
    allocation_percentage: number;
    joined_at: string;
    created_at: string;
  }>;
  pagination: PaginationResponse;
}

// API Error Types
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Query Parameters Types
export interface UserFilters extends PaginationParams {
  status?: UserStatus;
  role?: UserRole;
  department_id?: string;
}

export interface TaskFilters extends PaginationParams {
  status?: TaskStatus;
}

export interface TimeEntryFilters extends PaginationParams {
  start_date?: string;
  end_date?: string;
}

export interface PerformanceFilters {
  period_start: string;
  period_end: string;
}

export interface GitActivityFilters {
  start_date: string;
  end_date: string;
}

