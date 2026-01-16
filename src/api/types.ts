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
  allocation_percentage?: number;
  joined_at: string;
  avatar_url?: string | null;
  team_role?: string;
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

// Team Lead Specific Team Types
export interface TeamLeadTeam extends Team {
  members?: TeamMember[];
}

export interface MyTeamsResponse {
  teams: TeamLeadTeam[];
  total: number;
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

export interface BlockUserResponse {
  message: string;
  user: {
    id: string;
    user_code: string;
    email: string;
    status: UserStatus;
  };
}

export interface UnblockUserResponse {
  message: string;
  user: {
    id: string;
    user_code: string;
    email: string;
    status: UserStatus;
  };
}

export interface BulkApproveUserRequest {
  user_ids: string[];
  role?: UserRole;
  department_id?: string;
}

export interface BulkApproveUserError {
  user_id: string;
  error: string;
}

export interface BulkApproveUserResponse {
  message: string;
  approved: string[];
  failed: BulkApproveUserError[];
  total_requested: number;
  total_approved: number;
  total_failed: number;
}

export interface BulkRejectUserRequest {
  user_ids: string[];
  reason?: string;
}

export interface BulkRejectUserError {
  user_id: string;
  error: string;
}

export interface BulkRejectUserResponse {
  message: string;
  rejected: string[];
  failed: BulkRejectUserError[];
  total_requested: number;
  total_rejected: number;
  total_failed: number;
}

export interface DeleteUserResponse {
  message: string;
  user_id: string;
}

export interface BulkDeleteUserRequest {
  user_ids: string[];
}

export interface BulkDeleteUserError {
  user_id: string;
  error: string;
}

export interface BulkDeleteUserResponse {
  message: string;
  deleted: string[];
  failed: BulkDeleteUserError[];
  total_requested: number;
  total_deleted: number;
  total_failed: number;
}

export interface DemotePMRequest {
  replacement_manager_id: string;
}

export interface DemotePMResponse {
  message: string;
  user_id: string;
  new_role: UserRole;
  projects_reassigned: number;
}

export interface DemoteTLRequest {
  replacement_lead_id: string;
}

export interface DemoteTLResponse {
  message: string;
  user_id: string;
  new_role: UserRole;
  teams_reassigned: number;
}

export interface ManagedProjectsResponse {
  user_id: string;
  user_name: string;
  projects: Project[];
  total: number;
}

export interface LedTeamsResponse {
  user_id: string;
  user_name: string;
  teams: Team[];
  total: number;
}

export interface RoleStatsResponse {
  by_role: {
    [key in UserRole]: {
      total: number;
      active: number;
      blocked: number;
      pending: number;
    };
  };
  totals: {
    total: number;
    active: number;
    blocked: number;
    pending: number;
  };
}

export interface PromotePMRequest {
  department_id?: string;
}

export interface PromotePMResponse {
  message: string;
  user_id: string;
  new_role: UserRole;
}

export interface PromoteTLRequest {
  team_id?: string;
}

export interface PromoteTLResponse {
  message: string;
  user_id: string;
  new_role: UserRole;
}

export interface ChangeRoleRequest {
  role: UserRole;
  replacement_id?: string;
}

export interface ChangeRoleResponse {
  message: string;
  user_id: string;
  old_role: UserRole;
  new_role: UserRole;
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
  created_at?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  username?: string;
}

// Admin Profile Types
export interface AdminProfile {
  id: string;
  user_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  timezone?: string;
  notification_preferences?: {
    email?: boolean;
    in_app?: boolean;
    [key: string]: any;
  };
  created_at?: string;
}

export interface UpdateAdminProfileRequest {
  full_name?: string;
  avatar_url?: string;
  timezone?: string;
  notification_preferences?: {
    email?: boolean;
    in_app?: boolean;
    [key: string]: any;
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

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
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

// ============================================================================
// TEAM LEAD DASHBOARD TYPES (From Integration Documentation)
// ============================================================================

// Team Dashboard Types
export type TeamHealthStatus = 'good' | 'at_risk' | 'critical';
export type WorkloadStatus = 'underutilized' | 'normal' | 'optimal' | 'overloaded' | 'critical';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type RiskCategory = 'technical' | 'operational' | 'resource' | 'schedule' | 'quality' | 'external';
export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskStatus = 'identified' | 'mitigating' | 'monitoring' | 'resolved';
export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export type FlagType = 'performance_decline' | 'quality_issues' | 'attendance_issues' | 'collaboration_problems' | 'skill_gap' | 'overload' | 'disengagement';
export type FlagStatus = 'active' | 'investigating' | 'action_plan' | 'monitoring' | 'resolved';
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';
export type GoalCategory = 'learning' | 'performance' | 'technical' | 'leadership';
export type GoalStatus = 'active' | 'completed' | 'cancelled';
export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface TeamHealthMetrics {
  score: number;
  status: TeamHealthStatus;
  factors: string[];
}

export interface QuickStats {
  active_sprints: number;
  active_tasks: number;
  overdue_tasks: number;
  blocked_tasks: number;
  active_alerts: number;
  high_risk_items: number;
}

export interface DashboardTeamMember {
  user_id: string;
  user_code: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  team_role: string;
  current_workload: WorkloadStatus;
  active_flags: number;
}

export interface Sprint {
  id: string;
  sprint_code: string;
  project_id?: string;
  team_id?: string;
  name: string;
  description?: string;
  sprint_number?: number;
  status: SprintStatus;
  start_date: string;
  end_date: string;
  capacity_hours?: number;
  committed_hours?: number;
  goals?: string[];
  success_criteria?: string[];
  velocity?: number | null;
  created_at?: string;
}

export interface Alert {
  id: string;
  alert_code: string;
  rule_id?: string;
  title: string;
  message?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggered_at: string;
  triggered_by_entity_type?: string;
  triggered_by_entity_id?: string;
  context_data?: Record<string, any>;
  acknowledged_at?: string;
  resolved_at?: string;
}

export interface Risk {
  id: string;
  risk_code: string;
  team_id?: string;
  title: string;
  description?: string;
  risk_category: RiskCategory;
  probability?: number;
  impact: RiskImpact;
  risk_score: number;
  current_status: RiskStatus;
  owner_id?: string;
  mitigation_plan?: string;
  mitigation_actions?: Array<{
    action: string;
    due_date: string;
    status: string;
  }>;
  contingency_plan?: string;
  identified_date?: string;
  target_resolution_date?: string;
  next_review_date?: string;
  created_at?: string;
}

export interface Milestone {
  id: string;
  milestone_code: string;
  title: string;
  target_date: string;
  status: string;
  description?: string;
}

export interface ActionItem {
  type: string;
  priority: string;
  title: string;
  action: string;
  entity_id: string;
}

export interface TeamDashboardResponse {
  team: {
    id: string;
    team_code: string;
    name: string;
    member_count: number;
  };
  team_health: TeamHealthMetrics;
  quick_stats: QuickStats;
  team_members: DashboardTeamMember[];
  active_sprints: Sprint[];
  recent_alerts: Alert[];
  active_risks: Risk[];
  upcoming_milestones: Milestone[];
  action_items: ActionItem[];
}

// Sprint Management Types
export interface CreateSprintRequest {
  project_id: string;
  team_id: string;
  name: string;
  description?: string;
  sprint_number: number;
  start_date: string;
  end_date: string;
  capacity_hours: number;
  goals?: string[];
  success_criteria?: string[];
}

export interface SprintMetrics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  blocked_tasks: number;
  total_story_points: number;
  completed_story_points: number;
  progress_percentage: number;
  velocity: number | null;
  days_remaining: number;
}

export interface BurndownData {
  ideal_line: number[];
  actual_line: number[];
  scope_changes: Array<{
    date: string;
    change: number;
    reason: string;
  }>;
}

export interface SprintDashboardResponse {
  sprint: Sprint;
  metrics: SprintMetrics;
  burndown_data: BurndownData;
  tasks: {
    completed: Task[];
    in_progress: Task[];
    blocked: Task[];
  };
}

// Workload Management Types
export interface MemberWorkload {
  total_assigned_hours: number;
  total_estimated_hours: number;
  active_tasks_count: number;
  overdue_tasks_count: number;
  blocked_tasks_count: number;
  workload_percentage: number;
  utilization_percentage: number;
  status: WorkloadStatus;
}

export interface MemberAvailability {
  availability_percentage: number;
  availability_type: string;
}

export interface MemberSkill {
  skill_name: string;
  proficiency_level: number;
}

export interface TeamWorkloadMember {
  member: {
    user_id: string;
    user_code: string;
    full_name: string;
    email: string;
    team_role: string;
  };
  workload: MemberWorkload;
  availability: MemberAvailability;
  skills: MemberSkill[];
}

export interface TeamWorkloadResponse {
  team_metrics: {
    total_capacity: number;
    average_utilization: number;
    overloaded_count: number;
    underutilized_count: number;
  };
  member_workloads: TeamWorkloadMember[];
  recommendations: string[];
}

export interface CreateCapacityPlanRequest {
  period_start: string;
  period_end: string;
  period_type: string;
  total_capacity_hours: number;
  member_allocations: Array<{
    user_id: string;
    allocated_hours: number;
    allocation_percentage: number;
  }>;
  external_resources?: any[];
  notes?: string;
}

export interface CapacityPlanResponse {
  id: string;
  team_id: string;
  period_start: string;
  period_end: string;
  period_type: string;
  total_capacity_hours: number;
  allocated_hours: number;
  member_allocations: any[];
  created_at: string;
}

export interface SkillGapAnalysisRequest {
  required_skills: Array<{
    skill: string;
    required_level: number;
    required_members: number;
  }>;
}

export interface SkillGapAnalysisResponse {
  id: string;
  team_id: string;
  analysis_date: string;
  analysis_period: string;
  required_skills: any[];
  current_skills: Record<string, { avg_level: number; member_count: number }>;
  skill_gaps: Array<{
    skill: string;
    gap: number;
    priority: string;
  }>;
  recommendations: string[];
}

// Performance Management Types
export interface PerformanceGoal {
  id: string;
  goal_code: string;
  user_id?: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority?: string;
  period_start?: string;
  period_end: string;
  target_metrics?: Array<{
    metric: string;
    target: number;
  }>;
  milestones?: Array<{
    title: string;
    due_date: string;
    completed?: boolean;
  }>;
  progress_percentage: number;
  status: GoalStatus;
  created_at?: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  category: GoalCategory;
  priority?: string;
  period_start?: string;
  period_end: string;
  target_metrics?: Array<{
    metric: string;
    target: number;
  }>;
  milestones?: Array<{
    title: string;
    due_date: string;
  }>;
}

export interface PerformanceSummary {
  overall_score: number;
  tier: string;
  trend_direction: TrendDirection;
  risk_level: string;
}

export interface PerformanceTrends {
  velocity_trend: number;
  quality_trend: number;
  overall_direction: TrendDirection;
  risk_level: string;
}

export interface MemberPerformanceDashboard {
  user: {
    id: string;
    user_code: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  performance_summary: PerformanceSummary;
  goals: {
    active: PerformanceGoal[];
    completed: PerformanceGoal[];
    completion_rate: number;
  };
  metrics: Array<{
    metric_date: string;
    tasks_completed: number;
    tasks_on_time: number;
    story_points_completed: number;
    code_review_participation: number;
    pr_reviews_given: number;
  }>;
  trends: PerformanceTrends;
  flags: any[];
  recent_observations: Observation[];
  recommendations: string[];
}

// FeedbackRequestLegacy moved - see FeedbackRequest interface below for the unified version

export interface CreateFeedbackRequest {
  title: string;
  description?: string;
  feedback_type: string;
  reviewers: Array<{
    user_id: string;
    relationship: string;
  }>;
  questions: Array<{
    question: string;
    type: string;
  }>;
  anonymous: boolean;
  deadline: string;
}

// Communication Types
export interface Announcement {
  id: string;
  announcement_code: string;
  team_id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  channels: string[];
  target_audience: string;
  is_pinned: boolean;
  expires_at?: string;
  read_by: string[];
  acknowledged_by: string[];
  created_at: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  priority: AnnouncementPriority;
  channels: string[];
  target_audience: string;
  is_pinned?: boolean;
  expires_at?: string;
}

export interface OneOnOne {
  id: string;
  session_code: string;
  manager_id: string;
  employee_id: string;
  scheduled_date: string;
  duration_minutes: number;
  agenda: string[];
  status: string;
  notes?: string;
  action_items?: string[];
  created_at: string;
}

export interface CreateOneOnOneRequest {
  scheduled_date: string;
  duration_minutes: number;
  agenda: string[];
}

export interface TeamDecision {
  id: string;
  decision_code: string;
  team_id: string;
  title: string;
  description?: string;
  decision_type: string;
  context?: string;
  options_considered?: Array<{
    option: string;
    pros: string[];
    cons: string[];
  }>;
  decision_made: string;
  rationale?: string;
  decision_makers?: string[];
  stakeholders?: string[];
  implementation_date?: string;
  created_at: string;
}

export interface CreateDecisionRequest {
  title: string;
  description?: string;
  decision_type: string;
  context?: string;
  options_considered?: Array<{
    option: string;
    pros: string[];
    cons: string[];
  }>;
  decision_made: string;
  rationale?: string;
  decision_makers?: string[];
  stakeholders?: string[];
  implementation_date?: string;
}

// Monitoring & Alerts Types
export interface MonitoringRule {
  id: string;
  rule_code: string;
  team_id: string;
  name: string;
  description?: string;
  rule_type: string;
  condition_sql?: string;
  trigger_frequency: string;
  severity: AlertSeverity;
  notification_channels: string[];
  notify_roles?: string[];
  auto_actions?: Array<{
    action: string;
    params: Record<string, any>;
  }>;
  is_active: boolean;
  created_at: string;
}

export interface CreateMonitoringRuleRequest {
  name: string;
  description?: string;
  rule_type: string;
  condition_sql?: string;
  trigger_frequency: string;
  severity: AlertSeverity;
  notification_channels: string[];
  notify_roles?: string[];
  auto_actions?: Array<{
    action: string;
    params: Record<string, any>;
  }>;
}

export interface AlertsResponse {
  alerts: Alert[];
  summary: {
    total: number;
    by_severity: Record<AlertSeverity, number>;
    by_status: Record<AlertStatus, number>;
  };
}

export interface AcknowledgeAlertRequest {
  notes?: string;
}

export interface ResolveAlertRequest {
  resolution_notes: string;
}

// Risk Management Types
export interface CreateRiskRequest {
  title: string;
  description?: string;
  risk_category: RiskCategory;
  probability: number;
  impact: RiskImpact;
  owner_id?: string;
  mitigation_plan?: string;
  mitigation_actions?: Array<{
    action: string;
    due_date: string;
    status: string;
  }>;
  contingency_plan?: string;
  target_resolution_date?: string;
}

export interface RisksResponse {
  risks: Risk[];
  summary: {
    total: number;
    by_category: Record<string, number>;
    high_risk_count: number;
    average_risk_score: number;
  };
}

// Performance Flags Types
export interface PerformanceFlag {
  id: string;
  flag_code: string;
  user_id: string;
  team_id: string;
  flag_type: FlagType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  evidence?: string[];
  metrics_data?: Record<string, any>;
  flagged_by: string;
  flagged_date: string;
  status: FlagStatus;
  action_plan?: string;
  escalation_level: number;
  created_at: string;
}

export interface CreateFlagRequest {
  flag_type: FlagType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  evidence?: string[];
  metrics_data?: Record<string, any>;
  action_plan?: string;
  target_resolution_date?: string;
}

export interface FlagsResponse {
  flags: PerformanceFlag[];
  summary?: {
    total: number;
    by_type: Record<FlagType, number>;
    by_severity: Record<AlertSeverity, number>;
  };
}

// Task Template Types
export interface TaskTemplate {
  id: string;
  template_code: string;
  team_id: string;
  name: string;
  category: string;
  title_pattern: string;
  description_pattern: string;
  default_task_type?: string;
  default_complexity?: string;
  default_estimated_hours?: number;
  default_priority?: number;
  subtask_templates?: Array<{
    title: string;
    estimated_hours: number;
  }>;
  default_acceptance_criteria?: string[];
  default_tags?: string[];
  created_at: string;
}

export interface CreateTaskTemplateRequest {
  name: string;
  category: string;
  title_pattern: string;
  description_pattern: string;
  default_task_type?: string;
  default_complexity?: string;
  default_estimated_hours?: number;
  default_priority?: number;
  subtask_templates?: Array<{
    title: string;
    estimated_hours: number;
  }>;
  default_acceptance_criteria?: string[];
  default_tags?: string[];
}

// ============================================================================
// SPRINT UPDATE/CLOSE TYPES
// ============================================================================

export interface UpdateSprintRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  capacity_hours?: number;
  committed_hours?: number;
  goals?: string[];
  success_criteria?: string[];
  status?: SprintStatus;
}

export interface CloseSprintRequest {
  action: 'complete' | 'cancel';
  notes?: string;
}

// ============================================================================
// TEAM MEMBER MANAGEMENT TYPES
// ============================================================================

export interface AvailableMember {
  user_id: string;
  user_code: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role: UserRole;
  department_id?: string;
}

export interface AvailableMembersResponse {
  members: AvailableMember[];
}

export interface AddTeamMemberRequest {
  user_code: string;
  allocation_percentage?: number;
}

export interface UpdateTeamMemberAllocationRequest {
  allocation_percentage: number;
}

export interface TeamMembershipResponse {
  membership_id: string;
  team_id: string;
  user_id: string;
  allocation_percentage: number;
  joined_at: string;
  user_code: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role: UserRole;
}

// ============================================================================
// TIME ENTRY APPROVAL TYPES
// ============================================================================

export type TimeEntryApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PendingTimeEntry extends TimeEntry {
  approval_status: TimeEntryApprovalStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  user?: {
    user_id: string;
    user_code: string;
    full_name: string;
    email: string;
  };
  task?: {
    task_id: string;
    task_code: string;
    title: string;
  };
}

export interface RejectTimeEntryRequest {
  rejection_reason: string;
}

export interface BulkApproveTimeEntriesRequest {
  time_codes: string[];
}

export interface BulkApproveTimeEntriesResponse {
  approved: number;
}

// ============================================================================
// FEEDBACK REQUEST TYPES (360-Degree Feedback)
// ============================================================================

export type FeedbackType = '360' | 'peer' | 'upward' | 'self' | 'customer';
export type FeedbackStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type ReviewerRelationship = 'peer' | 'direct_report' | 'manager' | 'customer' | 'other';
export type ReviewerStatus = 'pending' | 'completed' | 'declined';
export type QuestionType = 'rating' | 'text' | 'multiple_choice';

export interface FeedbackReviewer {
  user_id: string;
  user_name?: string;
  user_code?: string;
  relationship: ReviewerRelationship;
  status: ReviewerStatus;
}

export interface FeedbackQuestion {
  id: number;
  text: string;
  type: QuestionType;
  scale?: number; // For rating questions (e.g., 1-5, 1-10)
  options?: string[]; // For multiple_choice questions
}

export interface FeedbackRequest {
  id: string;
  request_code: string;
  subject_user_id: string;
  subject_name?: string;
  subject_user_code?: string;
  requested_by: string;
  requested_by_name?: string;
  title: string;
  description: string;
  feedback_type: FeedbackType;
  reviewers: FeedbackReviewer[];
  questions: FeedbackQuestion[];
  anonymous: boolean;
  deadline: string;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackRequestData {
  title: string;
  description: string;
  feedback_type: FeedbackType;
  reviewers: {
    user_id: string;
    relationship: ReviewerRelationship;
    status: ReviewerStatus;
  }[];
  questions: FeedbackQuestion[];
  anonymous: boolean;
  deadline: string;
}

export interface UpdateFeedbackRequestData {
  title?: string;
  description?: string;
  reviewers?: {
    user_id: string;
    relationship: ReviewerRelationship;
    status: ReviewerStatus;
  }[];
  questions?: FeedbackQuestion[];
  anonymous?: boolean;
  deadline?: string;
  status?: FeedbackStatus;
}

export interface FeedbackRequestListItem {
  id: string;
  request_code: string;
  subject_user_id: string;
  subject_name: string;
  subject_user_code: string;
  title: string;
  feedback_type: FeedbackType;
  status: FeedbackStatus;
  deadline: string;
  created_at: string;
  total_reviewers?: number;
  completed_responses?: number;
}

export interface FeedbackResponse {
  id: string;
  reviewer_id?: string; // Hidden for anonymous feedback
  reviewer_name?: string;
  reviewer_user_code?: string;
  responses: {
    [questionId: string]: {
      rating?: number;
      text?: string;
    };
  };
  overall_rating?: number;
  submitted_at: string;
}

export interface FeedbackResponsesData {
  responses: FeedbackResponse[];
  total: number;
  anonymous: boolean;
}

export interface QuestionSummary {
  question: string;
  ratings: number[];
  avgRating: number;
  textResponses: string[];
}

export interface FeedbackSummary {
  request_code: string;
  title: string;
  status: FeedbackStatus;
  deadline: string;
  anonymous: boolean;
  total_reviewers: number;
  completed_responses: number;
  pending_reviewers: number;
  completion_rate: number;
  average_overall_rating: number;
  question_summaries: QuestionSummary[];
}


