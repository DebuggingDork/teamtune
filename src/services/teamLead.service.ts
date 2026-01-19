import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints/index';
import type {
  // Existing types
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  TasksResponse,
  Observation,
  CreateObservationRequest,
  UpdateObservationRequest,
  ObservationsResponse,
  TeamPerformanceResponse,
  MemberPerformanceResponse,
  GitMetrics,
  LinkRepositoryRequest,
  LinkRepositoryResponse,
  TeamGitActivityResponse,
  MemberGitActivityResponse,
  TaskFilters,
  PerformanceFilters,
  GitActivityFilters,
  // New Team Lead types
  TeamDashboardResponse,
  Sprint,
  CreateSprintRequest,
  UpdateSprintRequest,
  CloseSprintRequest,
  SprintDashboardResponse,
  TeamWorkloadResponse,
  CreateCapacityPlanRequest,
  CapacityPlanResponse,
  SkillGapAnalysisRequest,
  SkillGapAnalysisResponse,
  MemberPerformanceDashboard,
  CreateGoalRequest,
  PerformanceGoal,
  CreateFeedbackRequest,
  FeedbackRequest,
  CreateAnnouncementRequest,
  Announcement,
  CreateOneOnOneRequest,
  OneOnOne,
  CreateDecisionRequest,
  TeamDecision,
  CreateMonitoringRuleRequest,
  MonitoringRule,
  AlertsResponse,
  AcknowledgeAlertRequest,
  ResolveAlertRequest,
  CreateRiskRequest,
  Risk,
  RisksResponse,
  CreateFlagRequest,
  PerformanceFlag,
  FlagsResponse,
  CreateTaskTemplateRequest,
  TaskTemplate,
  // Team Lead team types
  MyTeamsResponse,
  TeamLeadTeam,
  // Profile types
  EmployeeProfile,
  UpdateProfileRequest,
  // Team Member Management types
  AvailableMember,
  AvailableMembersResponse,
  AddTeamMemberRequest,
  UpdateTeamMemberAllocationRequest,
  TeamMembershipResponse,
  PendingTimeEntry,
  RejectTimeEntryRequest,
  BulkApproveTimeEntriesRequest,
  BulkApproveTimeEntriesResponse,
  // Feedback Request types
  FeedbackRequest as FeedbackRequestType,
  CreateFeedbackRequestData,
  UpdateFeedbackRequestData,
  FeedbackRequestListItem,
  FeedbackResponsesData,
  FeedbackSummary,
  // Attendance & Leave Types
  LeaveRequest,
  LeaveRequestsResponse,
  LeaveRequestFilters,
  PendingLeaveRequestsResponse,
  TeamLeaveCalendarResponse,
  TeamTodayAttendance,
  AttendanceRecordsResponse,
  AttendanceFilters,
  TeamActiveSessionsResponse,
  ReviewLeaveRequest,
} from '@/api/types/index';

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

/**
 * Get team lead's profile
 */
export const getTeamLeadProfile = async (): Promise<EmployeeProfile> => {
  const response = await apiClient.get<EmployeeProfile>(ENDPOINTS.TEAM_LEAD.PROFILE.GET);
  return response.data;
};

/**
 * Update team lead's profile
 */
export const updateTeamLeadProfile = async (data: UpdateProfileRequest): Promise<EmployeeProfile> => {
  const response = await apiClient.put<EmployeeProfile>(ENDPOINTS.TEAM_LEAD.PROFILE.UPDATE, data);
  return response.data;
};

// ============================================================================
// TEAM MANAGEMENT
// ============================================================================

/**
 * Get all teams managed by the authenticated team lead
 */
export const getMyTeams = async (): Promise<MyTeamsResponse> => {
  const response = await apiClient.get<TeamLeadTeam[] | MyTeamsResponse>(ENDPOINTS.TEAM_LEAD.MY_TEAMS);

  // Handle case where API returns array directly instead of wrapped object
  if (Array.isArray(response.data)) {
    return {
      teams: response.data,
      total: response.data.length,
    };
  }

  return response.data;
};

/**
 * Get specific team information by team code
 */
export const getTeamInfo = async (teamCode: string): Promise<TeamLeadTeam> => {
  const response = await apiClient.get<TeamLeadTeam>(ENDPOINTS.TEAM_LEAD.TEAM_INFO(teamCode));
  return response.data;
};

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * Get complete team dashboard
 */
export const getTeamDashboard = async (teamCode: string): Promise<TeamDashboardResponse> => {
  const response = await apiClient.get<TeamDashboardResponse>(ENDPOINTS.TEAM_LEAD.DASHBOARD(teamCode));
  return response.data;
};

// ============================================================================
// SPRINT MANAGEMENT
// ============================================================================

/**
 * Create a new sprint
 */
export const createSprint = async (data: CreateSprintRequest): Promise<Sprint> => {
  const response = await apiClient.post<Sprint>(ENDPOINTS.TEAM_LEAD.SPRINTS.CREATE, data);
  return response.data;
};

/**
 * Get all sprints for a team
 */
export const getTeamSprints = async (teamCode: string): Promise<Sprint[]> => {
  const response = await apiClient.get<Sprint[] | { sprints: Sprint[] }>(ENDPOINTS.TEAM_LEAD.SPRINTS.LIST(teamCode));

  // Handle both array and wrapped response formats
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // If response is an object with sprints property
  if (response.data && typeof response.data === 'object' && 'sprints' in response.data) {
    return response.data.sprints || [];
  }

  // Fallback to empty array if unexpected format
  return [];
};

/**
 * Get a specific sprint by code
 */
export const getSprint = async (sprintCode: string): Promise<Sprint> => {
  const response = await apiClient.get<Sprint>(ENDPOINTS.TEAM_LEAD.SPRINTS.GET(sprintCode));
  return response.data;
};

/**
 * Update sprint details
 */
export const updateSprint = async (sprintCode: string, data: UpdateSprintRequest): Promise<Sprint> => {
  const response = await apiClient.put<Sprint>(ENDPOINTS.TEAM_LEAD.SPRINTS.UPDATE(sprintCode), data);
  return response.data;
};

/**
 * Close a sprint (complete or cancel)
 */
export const closeSprint = async (sprintCode: string, data: CloseSprintRequest): Promise<Sprint> => {
  const response = await apiClient.post<Sprint>(ENDPOINTS.TEAM_LEAD.SPRINTS.CLOSE(sprintCode), data);
  return response.data;
};

/**
 * Get sprint dashboard with metrics and burndown data
 */
export const getSprintDashboard = async (sprintCode: string): Promise<SprintDashboardResponse> => {
  const response = await apiClient.get<SprintDashboardResponse>(
    ENDPOINTS.TEAM_LEAD.SPRINTS.DASHBOARD(sprintCode)
  );
  return response.data;
};

// ============================================================================
// TEAM MEMBER MANAGEMENT
// ============================================================================

/**
 * Get available members who can be added to the team
 */
export const getAvailableMembers = async (teamCode: string): Promise<AvailableMember[]> => {
  const response = await apiClient.get<AvailableMember[] | AvailableMembersResponse>(
    ENDPOINTS.TEAM_LEAD.TEAM_MEMBERS.AVAILABLE(teamCode)
  );
  // Handle both array and wrapped response formats
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.members || [];
};

/**
 * Add a new member to the team
 */
export const addTeamMember = async (
  teamCode: string,
  data: AddTeamMemberRequest
): Promise<TeamMembershipResponse> => {
  const response = await apiClient.post<TeamMembershipResponse>(
    ENDPOINTS.TEAM_LEAD.TEAM_MEMBERS.ADD(teamCode),
    data
  );
  return response.data;
};

/**
 * Remove a member from the team
 */
export const removeTeamMember = async (
  teamCode: string,
  userCode: string
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    ENDPOINTS.TEAM_LEAD.TEAM_MEMBERS.REMOVE(teamCode, userCode)
  );
  return response.data;
};

/**
 * Update a team member's allocation percentage
 */
export const updateTeamMemberAllocation = async (
  teamCode: string,
  userCode: string,
  data: UpdateTeamMemberAllocationRequest
): Promise<TeamMembershipResponse> => {
  const response = await apiClient.put<TeamMembershipResponse>(
    ENDPOINTS.TEAM_LEAD.TEAM_MEMBERS.UPDATE(teamCode, userCode),
    data
  );
  return response.data;
};

// ============================================================================
// TASK MANAGEMENT
// ============================================================================

/**
 * Create a task
 */
export const createTask = async (teamCode: string, data: CreateTaskRequest): Promise<Task> => {
  const response = await apiClient.post<Task>(ENDPOINTS.TEAM_LEAD.TASKS.CREATE(teamCode), data);
  return response.data;
};

/**
 * Get tasks by team
 */
export const getTeamTasks = async (teamCode: string, filters?: TaskFilters): Promise<TasksResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.status) queryParams.append('status', filters.status);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.TEAM_LEAD.TASKS.LIST(teamCode)}?${queryString}`
    : ENDPOINTS.TEAM_LEAD.TASKS.LIST(teamCode);

  const response = await apiClient.get<TasksResponse>(url);
  return response.data;
};

/**
 * Get task by code
 */
export const getTask = async (taskCode: string): Promise<Task> => {
  const response = await apiClient.get<Task>(ENDPOINTS.TEAM_LEAD.TASKS.GET(taskCode));
  return response.data;
};

/**
 * Update task
 */
export const updateTask = async (taskCode: string, data: UpdateTaskRequest): Promise<Task> => {
  const response = await apiClient.put<Task>(ENDPOINTS.TEAM_LEAD.TASKS.UPDATE(taskCode), data);
  return response.data;
};

/**
 * Delete task
 */
export const deleteTask = async (taskCode: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.TEAM_LEAD.TASKS.DELETE(taskCode));
  return response.data;
};

/**
 * Assign task
 */
export const assignTask = async (taskCode: string, data: AssignTaskRequest): Promise<Task> => {
  const response = await apiClient.put<Task>(ENDPOINTS.TEAM_LEAD.TASKS.ASSIGN(taskCode), data);
  return response.data;
};

/**
 * Update task status
 */
export const updateTaskStatus = async (taskCode: string, data: UpdateTaskStatusRequest): Promise<Task> => {
  const response = await apiClient.put<Task>(ENDPOINTS.TEAM_LEAD.TASKS.UPDATE_STATUS(taskCode), data);
  return response.data;
};

// ============================================================================
// WORKLOAD & RESOURCE MANAGEMENT
// ============================================================================

/**
 * Get team workload analysis
 */
export const getTeamWorkload = async (teamCode: string): Promise<TeamWorkloadResponse> => {
  const response = await apiClient.get<TeamWorkloadResponse>(ENDPOINTS.TEAM_LEAD.WORKLOAD(teamCode));
  return response.data;
};

/**
 * Create capacity plan
 */
export const createCapacityPlan = async (
  teamCode: string,
  data: CreateCapacityPlanRequest
): Promise<CapacityPlanResponse> => {
  const response = await apiClient.post<CapacityPlanResponse>(
    ENDPOINTS.TEAM_LEAD.CAPACITY_PLANS(teamCode),
    data
  );
  return response.data;
};

/**
 * Perform skill gap analysis
 */
export const performSkillGapAnalysis = async (
  teamCode: string,
  data: SkillGapAnalysisRequest
): Promise<SkillGapAnalysisResponse> => {
  const response = await apiClient.post<SkillGapAnalysisResponse>(
    ENDPOINTS.TEAM_LEAD.SKILL_GAP_ANALYSIS(teamCode),
    data
  );
  return response.data;
};

// ============================================================================
// PERFORMANCE MANAGEMENT
// ============================================================================

/**
 * Get member performance dashboard
 */
export const getMemberPerformanceDashboard = async (
  userCode: string,
  period?: 'current_week' | 'current_month' | 'current_quarter'
): Promise<MemberPerformanceDashboard> => {
  const url = period
    ? `${ENDPOINTS.TEAM_LEAD.PERFORMANCE.MEMBER(userCode)}?period=${period}`
    : ENDPOINTS.TEAM_LEAD.PERFORMANCE.MEMBER(userCode);
  const response = await apiClient.get<MemberPerformanceDashboard>(url);
  return response.data;
};

/**
 * Create performance goal
 */
export const createPerformanceGoal = async (
  userCode: string,
  data: CreateGoalRequest
): Promise<PerformanceGoal> => {
  const response = await apiClient.post<PerformanceGoal>(
    ENDPOINTS.TEAM_LEAD.PERFORMANCE.GOALS.CREATE(userCode),
    data
  );
  return response.data;
};

/**
 * Create 360 feedback request
 */
export const createFeedbackRequest = async (
  userCode: string,
  data: CreateFeedbackRequest
): Promise<FeedbackRequest> => {
  const response = await apiClient.post<FeedbackRequest>(
    ENDPOINTS.TEAM_LEAD.PERFORMANCE.FEEDBACK.CREATE(userCode),
    data
  );
  return response.data;
};

/**
 * Get team performance
 */
export const getTeamPerformance = async (
  teamCode: string,
  filters: PerformanceFilters
): Promise<TeamPerformanceResponse> => {
  const url = `${ENDPOINTS.TEAM_LEAD.PERFORMANCE.TEAM(teamCode)}?period_start=${filters.period_start}&period_end=${filters.period_end}`;
  const response = await apiClient.get<TeamPerformanceResponse>(url);
  return response.data;
};

/**
 * Get member performance
 */
export const getMemberPerformance = async (
  teamCode: string,
  userCode: string,
  filters: PerformanceFilters
): Promise<MemberPerformanceResponse> => {
  const url = `${ENDPOINTS.TEAM_LEAD.PERFORMANCE.MEMBER(userCode)}?period_start=${filters.period_start}&period_end=${filters.period_end}`;
  const response = await apiClient.get<MemberPerformanceResponse>(url);
  return response.data;
};

// ============================================================================
// OBSERVATIONS
// ============================================================================

/**
 * Create observation
 */
export const createObservation = async (
  teamCode: string,
  userCode: string,
  data: CreateObservationRequest
): Promise<Observation> => {
  const response = await apiClient.post<Observation>(
    ENDPOINTS.TEAM_LEAD.OBSERVATIONS.CREATE(teamCode, userCode),
    data
  );
  return response.data;
};

/**
 * Get observations by member
 */
export const getMemberObservations = async (
  teamCode: string,
  userCode: string,
  params?: { page?: number; limit?: number }
): Promise<ObservationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.TEAM_LEAD.OBSERVATIONS.LIST(teamCode, userCode)}?${queryString}`
    : ENDPOINTS.TEAM_LEAD.OBSERVATIONS.LIST(teamCode, userCode);

  const response = await apiClient.get<ObservationsResponse>(url);
  return response.data;
};

/**
 * Get all observations for a team (all members)
 */
export const getTeamObservations = async (
  teamCode: string,
  params?: {
    page?: number;
    limit?: number;
    category?: string;
    rating?: string;
  }
): Promise<ObservationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.rating) queryParams.append('rating', params.rating);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.TEAM_LEAD.OBSERVATIONS.LIST_ALL_TEAM(teamCode)}?${queryString}`
    : ENDPOINTS.TEAM_LEAD.OBSERVATIONS.LIST_ALL_TEAM(teamCode);

  const response = await apiClient.get<ObservationsResponse>(url);
  return response.data;
};

/**
 * Get observation by code
 */
export const getObservation = async (observationCode: string): Promise<Observation> => {
  const response = await apiClient.get<Observation>(ENDPOINTS.TEAM_LEAD.OBSERVATIONS.GET(observationCode));
  return response.data;
};

/**
 * Update observation
 */
export const updateObservation = async (
  observationCode: string,
  data: UpdateObservationRequest
): Promise<Observation> => {
  const response = await apiClient.put<Observation>(ENDPOINTS.TEAM_LEAD.OBSERVATIONS.UPDATE(observationCode), data);
  return response.data;
};

/**
 * Delete observation
 */
export const deleteObservation = async (observationCode: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.TEAM_LEAD.OBSERVATIONS.DELETE(observationCode));
  return response.data;
};

// ============================================================================
// COMMUNICATION
// ============================================================================

/**
 * Create team announcement
 */
export const createAnnouncement = async (
  teamCode: string,
  data: CreateAnnouncementRequest
): Promise<Announcement> => {
  const response = await apiClient.post<Announcement>(
    ENDPOINTS.TEAM_LEAD.ANNOUNCEMENTS.CREATE(teamCode),
    data
  );
  return response.data;
};

/**
 * Schedule one-on-one
 */
export const scheduleOneOnOne = async (
  userCode: string,
  data: CreateOneOnOneRequest
): Promise<OneOnOne> => {
  const response = await apiClient.post<OneOnOne>(
    ENDPOINTS.TEAM_LEAD.ONE_ON_ONES.CREATE(userCode),
    data
  );
  return response.data;
};

/**
 * Log team decision
 */
export const logTeamDecision = async (
  teamCode: string,
  data: CreateDecisionRequest
): Promise<TeamDecision> => {
  const response = await apiClient.post<TeamDecision>(
    ENDPOINTS.TEAM_LEAD.DECISIONS.CREATE(teamCode),
    data
  );
  return response.data;
};

/**
 * Get team decisions
 */
export const getTeamDecisions = async (teamCode: string): Promise<TeamDecision[]> => {
  const response = await apiClient.get<TeamDecision[] | { decisions: TeamDecision[] }>(
    ENDPOINTS.TEAM_LEAD.DECISIONS.LIST(teamCode)
  );

  // Handle both array and wrapped response formats
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // If response is an object with decisions property
  if (response.data && typeof response.data === 'object' && 'decisions' in response.data) {
    return response.data.decisions || [];
  }

  // Fallback to empty array if unexpected format
  return [];
};

// ============================================================================
// MONITORING & ALERTS
// ============================================================================

/**
 * Create monitoring rule
 */
export const createMonitoringRule = async (
  teamCode: string,
  data: CreateMonitoringRuleRequest
): Promise<MonitoringRule> => {
  const response = await apiClient.post<MonitoringRule>(
    ENDPOINTS.TEAM_LEAD.MONITORING_RULES.CREATE(teamCode),
    data
  );
  return response.data;
};

/**
 * Get recent alerts
 */
export const getRecentAlerts = async (teamCode: string, days: number = 7): Promise<AlertsResponse> => {
  const url = `${ENDPOINTS.TEAM_LEAD.ALERTS.LIST(teamCode)}?days=${days}`;
  const response = await apiClient.get<AlertsResponse>(url);
  return response.data;
};

/**
 * Acknowledge alert
 */
export const acknowledgeAlert = async (
  alertCode: string,
  data?: AcknowledgeAlertRequest
): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(
    ENDPOINTS.TEAM_LEAD.ALERTS.ACKNOWLEDGE(alertCode),
    data || {}
  );
  return response.data;
};

/**
 * Resolve alert
 */
export const resolveAlert = async (
  alertCode: string,
  data: ResolveAlertRequest
): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(
    ENDPOINTS.TEAM_LEAD.ALERTS.RESOLVE(alertCode),
    data
  );
  return response.data;
};

// ============================================================================
// RISK MANAGEMENT
// ============================================================================

/**
 * Create team risk
 */
export const createRisk = async (teamCode: string, data: CreateRiskRequest): Promise<Risk> => {
  const response = await apiClient.post<Risk>(ENDPOINTS.TEAM_LEAD.RISKS.CREATE(teamCode), data);
  return response.data;
};

/**
 * Get active risks
 */
export const getActiveRisks = async (teamCode: string): Promise<RisksResponse> => {
  const response = await apiClient.get<RisksResponse>(ENDPOINTS.TEAM_LEAD.RISKS.LIST(teamCode));
  return response.data;
};

// ============================================================================
// PERFORMANCE FLAGS
// ============================================================================

/**
 * Flag performance issue
 */
export const flagPerformanceIssue = async (
  userCode: string,
  data: CreateFlagRequest
): Promise<PerformanceFlag> => {
  const response = await apiClient.post<PerformanceFlag>(
    ENDPOINTS.TEAM_LEAD.FLAGS.CREATE(userCode),
    data
  );
  return response.data;
};

/**
 * Get active flags
 */
export const getActiveFlags = async (teamCode: string): Promise<FlagsResponse> => {
  const response = await apiClient.get<FlagsResponse>(ENDPOINTS.TEAM_LEAD.FLAGS.LIST(teamCode));
  return response.data;
};

// ============================================================================
// TASK TEMPLATES
// ============================================================================

/**
 * Create task template
 */
export const createTaskTemplate = async (
  teamCode: string,
  data: CreateTaskTemplateRequest
): Promise<TaskTemplate> => {
  const response = await apiClient.post<TaskTemplate>(
    ENDPOINTS.TEAM_LEAD.TASK_TEMPLATES.CREATE(teamCode),
    data
  );
  return response.data;
};

/**
 * Get task templates
 */
export const getTaskTemplates = async (teamCode: string): Promise<TaskTemplate[]> => {
  const response = await apiClient.get<TaskTemplate[]>(ENDPOINTS.TEAM_LEAD.TASK_TEMPLATES.LIST(teamCode));
  return response.data;
};

// ============================================================================
// METRICS & GIT ACTIVITY
// ============================================================================

/**
 * Get team metrics
 */
export const getTeamMetrics = async (teamCode: string): Promise<GitMetrics> => {
  const response = await apiClient.get<GitMetrics>(ENDPOINTS.TEAM_LEAD.METRICS.TEAM(teamCode));
  return response.data;
};

/**
 * Link repository to team
 */
export const linkRepository = async (teamCode: string, data: LinkRepositoryRequest): Promise<LinkRepositoryResponse> => {
  const response = await apiClient.post<LinkRepositoryResponse>(
    ENDPOINTS.TEAM_LEAD.GITHUB.LINK_REPOSITORY(teamCode),
    data
  );
  return response.data;
};

/**
 * Get team git activity
 */
export const getTeamGitActivity = async (teamCode: string, filters: GitActivityFilters): Promise<TeamGitActivityResponse> => {
  const url = `${ENDPOINTS.TEAM_LEAD.GITHUB.GIT_ACTIVITY(teamCode)}?start_date=${filters.start_date}&end_date=${filters.end_date}`;
  const response = await apiClient.get<TeamGitActivityResponse>(url);
  return response.data;
};

/**
 * Get member git activity
 */
export const getMemberGitActivity = async (
  teamCode: string,
  userCode: string,
  filters: GitActivityFilters
): Promise<MemberGitActivityResponse> => {
  const url = `${ENDPOINTS.TEAM_LEAD.GITHUB.MEMBER_GIT_ACTIVITY(teamCode, userCode)}?start_date=${filters.start_date}&end_date=${filters.end_date}`;
  const response = await apiClient.get<MemberGitActivityResponse>(url);
  return response.data;
};

// ============================================================================
// TIME ENTRY APPROVAL
// ============================================================================

/**
 * Get all pending time entries for a team
 */
export const getPendingTimeEntries = async (
  teamCode: string,
  params?: { start_date?: string; end_date?: string }
): Promise<PendingTimeEntry[]> => {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.TEAM_LEAD.TIME_ENTRIES.LIST_PENDING(teamCode)}?${queryString}`
    : ENDPOINTS.TEAM_LEAD.TIME_ENTRIES.LIST_PENDING(teamCode);

  const response = await apiClient.get<PendingTimeEntry[]>(url);
  return response.data;
};

/**
 * Get pending time entries for a specific team member
 */
export const getMemberPendingTimeEntries = async (
  teamCode: string,
  userCode: string,
  params?: { start_date?: string; end_date?: string }
): Promise<PendingTimeEntry[]> => {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.TEAM_LEAD.TIME_ENTRIES.MEMBER_PENDING(teamCode, userCode)}?${queryString}`
    : ENDPOINTS.TEAM_LEAD.TIME_ENTRIES.MEMBER_PENDING(teamCode, userCode);

  const response = await apiClient.get<PendingTimeEntry[]>(url);
  return response.data;
};

/**
 * Approve a time entry
 */
export const approveTimeEntry = async (
  teamCode: string,
  timeCode: string
): Promise<PendingTimeEntry> => {
  const response = await apiClient.put<PendingTimeEntry>(
    ENDPOINTS.TEAM_LEAD.TIME_ENTRIES.APPROVE(teamCode, timeCode)
  );
  return response.data;
};

/**
 * Reject a time entry
 */
export const rejectTimeEntry = async (
  teamCode: string,
  timeCode: string,
  data: RejectTimeEntryRequest
): Promise<PendingTimeEntry> => {
  const response = await apiClient.put<PendingTimeEntry>(
    ENDPOINTS.TEAM_LEAD.TIME_ENTRIES.REJECT(teamCode, timeCode),
    data
  );
  return response.data;
};

/**
 * Bulk approve time entries
 */
export const bulkApproveTimeEntries = async (
  teamCode: string,
  data: BulkApproveTimeEntriesRequest
): Promise<BulkApproveTimeEntriesResponse> => {
  const response = await apiClient.post<BulkApproveTimeEntriesResponse>(
    ENDPOINTS.TEAM_LEAD.TIME_ENTRIES.BULK_APPROVE(teamCode),
    data
  );
  return response.data;
};

// ============================================================================
// FEEDBACK REQUESTS (360-Degree Feedback)
// ============================================================================

/**
 * Create a new feedback request for a team member
 */
export const createFeedbackRequestForMember = async (
  userCode: string,
  data: CreateFeedbackRequestData
): Promise<FeedbackRequestType> => {
  const response = await apiClient.post<FeedbackRequestType>(
    ENDPOINTS.TEAM_LEAD.FEEDBACK_REQUESTS.CREATE(userCode),
    data
  );
  return response.data;
};

/**
 * Get all feedback requests created by the team lead
 */
export const getAllFeedbackRequests = async (): Promise<FeedbackRequestListItem[]> => {
  const response = await apiClient.get<FeedbackRequestListItem[]>(
    ENDPOINTS.TEAM_LEAD.FEEDBACK_REQUESTS.LIST_ALL
  );
  return response.data;
};

/**
 * Get all feedback requests for members of a specific team
 */
export const getTeamFeedbackRequests = async (teamCode: string): Promise<FeedbackRequestListItem[]> => {
  const response = await apiClient.get<FeedbackRequestListItem[]>(
    ENDPOINTS.TEAM_LEAD.FEEDBACK_REQUESTS.LIST_BY_TEAM(teamCode)
  );
  return response.data;
};

/**
 * Get details of a specific feedback request
 */
export const getFeedbackRequest = async (requestCode: string): Promise<FeedbackRequestType> => {
  const response = await apiClient.get<FeedbackRequestType>(
    ENDPOINTS.TEAM_LEAD.FEEDBACK_REQUESTS.GET(requestCode)
  );
  return response.data;
};

/**
 * Update an existing feedback request
 */
export const updateFeedbackRequest = async (
  requestCode: string,
  data: UpdateFeedbackRequestData
): Promise<FeedbackRequestType> => {
  const response = await apiClient.put<FeedbackRequestType>(
    ENDPOINTS.TEAM_LEAD.FEEDBACK_REQUESTS.UPDATE(requestCode),
    data
  );
  return response.data;
};

/**
 * Delete/cancel a feedback request
 */
export const deleteFeedbackRequest = async (requestCode: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    ENDPOINTS.TEAM_LEAD.FEEDBACK_REQUESTS.DELETE(requestCode)
  );
  return response.data;
};

/**
 * Get all submitted responses for a feedback request
 */
export const getFeedbackResponses = async (requestCode: string): Promise<FeedbackResponsesData> => {
  const response = await apiClient.get<FeedbackResponsesData>(
    ENDPOINTS.TEAM_LEAD.FEEDBACK_REQUESTS.GET_RESPONSES(requestCode)
  );
  return response.data;
};

/**
 * Get aggregated summary of all feedback responses
 */
export const getFeedbackSummary = async (requestCode: string): Promise<FeedbackSummary> => {
  const response = await apiClient.get<FeedbackSummary>(
    ENDPOINTS.TEAM_LEAD.FEEDBACK_REQUESTS.GET_SUMMARY(requestCode)
  );
  return response.data;
};

// ============================================================================
// TEAM LEAVE MANAGEMENT
// ============================================================================

/**
 * Get team leave requests with optional filters
 */
export const getTeamLeaveRequests = async (
  teamCode: string,
  filters?: LeaveRequestFilters
): Promise<LeaveRequestsResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.user_code) queryParams.append('user_code', filters.user_code);
  if (filters?.leave_type_code) queryParams.append('leave_type_code', filters.leave_type_code);
  if (filters?.from_date) queryParams.append('from_date', filters.from_date);
  if (filters?.to_date) queryParams.append('to_date', filters.to_date);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.TEAM_LEAD.LEAVE.REQUESTS(teamCode)}?${queryString}`
    : ENDPOINTS.TEAM_LEAD.LEAVE.REQUESTS(teamCode);

  const response = await apiClient.get<LeaveRequestsResponse>(url);
  return response.data;
};

/**
 * Get pending leave requests for the team
 */
export const getPendingLeaveRequests = async (
  teamCode: string
): Promise<PendingLeaveRequestsResponse> => {
  const response = await apiClient.get<PendingLeaveRequestsResponse>(
    ENDPOINTS.TEAM_LEAD.LEAVE.PENDING(teamCode)
  );
  return response.data;
};

/**
 * Approve a leave request
 */
export const approveLeaveRequest = async (
  teamCode: string,
  requestCode: string,
  data?: ReviewLeaveRequest
): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(
    ENDPOINTS.TEAM_LEAD.LEAVE.APPROVE(teamCode, requestCode),
    data || {}
  );
  return response.data;
};

/**
 * Reject a leave request
 */
export const rejectLeaveRequest = async (
  teamCode: string,
  requestCode: string,
  data: ReviewLeaveRequest
): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(
    ENDPOINTS.TEAM_LEAD.LEAVE.REJECT(teamCode, requestCode),
    data
  );
  return response.data;
};

/**
 * Get team leave calendar for a specific month
 */
export const getTeamLeaveCalendar = async (
  teamCode: string,
  month: number,
  year: number
): Promise<TeamLeaveCalendarResponse> => {
  const url = `${ENDPOINTS.TEAM_LEAD.LEAVE.CALENDAR(teamCode)}?month=${month}&year=${year}`;
  const response = await apiClient.get<TeamLeaveCalendarResponse>(url);
  return response.data;
};

// ============================================================================
// TEAM ATTENDANCE MANAGEMENT
// ============================================================================

/**
 * Get team's today attendance overview
 */
export const getTeamTodayAttendance = async (
  teamCode: string
): Promise<TeamTodayAttendance> => {
  const response = await apiClient.get<TeamTodayAttendance>(
    ENDPOINTS.TEAM_LEAD.ATTENDANCE.TODAY(teamCode)
  );
  return response.data;
};

/**
 * Get team attendance records with optional filters
 */
export const getTeamAttendance = async (
  teamCode: string,
  filters?: AttendanceFilters
): Promise<AttendanceRecordsResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.from_date) queryParams.append('from_date', filters.from_date);
  if (filters?.to_date) queryParams.append('to_date', filters.to_date);
  if (filters?.status) queryParams.append('status', filters.status);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.TEAM_LEAD.ATTENDANCE.LIST(teamCode)}?${queryString}`
    : ENDPOINTS.TEAM_LEAD.ATTENDANCE.LIST(teamCode);

  const response = await apiClient.get<AttendanceRecordsResponse>(url);
  return response.data;
};

/**
 * Get team's active sessions
 */
export const getTeamActiveSessions = async (
  teamCode: string
): Promise<TeamActiveSessionsResponse> => {
  const response = await apiClient.get<TeamActiveSessionsResponse>(
    ENDPOINTS.TEAM_LEAD.SESSIONS.ACTIVE(teamCode)
  );
  return response.data;
};

