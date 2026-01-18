import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as teamLeadService from '@/services/teamLead.service';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  CreateObservationRequest,
  UpdateObservationRequest,
  TaskFilters,
  PerformanceFilters,
  GitActivityFilters,
  LinkRepositoryRequest,
  CreateSprintRequest,
  CreateCapacityPlanRequest,
  SkillGapAnalysisRequest,
  CreateGoalRequest,
  CreateFeedbackRequest,
  CreateAnnouncementRequest,
  CreateOneOnOneRequest,
  CreateDecisionRequest,
  CreateMonitoringRuleRequest,
  AcknowledgeAlertRequest,
  ResolveAlertRequest,
  CreateRiskRequest,
  CreateFlagRequest,
  CreateTaskTemplateRequest,
  UpdateProfileRequest,
  UpdateSprintRequest,
  CloseSprintRequest,
  AvailableMember,
  AddTeamMemberRequest,
  UpdateTeamMemberAllocationRequest,
  TeamMembershipResponse,
  PendingTimeEntry,
  RejectTimeEntryRequest,
  BulkApproveTimeEntriesRequest,
  CreateFeedbackRequestData,
  UpdateFeedbackRequestData,
  // Attendance & Leave Types
  LeaveRequestFilters,
  AttendanceFilters,
  ReviewLeaveRequest,
} from '@/api/types';
import { handleError } from '@/utils/errorHandler';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const teamLeadKeys = {
  all: ['team-lead'] as const,

  // Profile
  profile: {
    all: ['team-lead', 'profile'] as const,
  },

  // Team Management
  myTeams: () => ['team-lead', 'my-teams'] as const,
  teamInfo: (teamCode: string) => ['team-lead', 'team-info', teamCode] as const,

  // Dashboard
  dashboard: (teamCode: string) => ['team-lead', 'dashboard', teamCode] as const,

  // Sprints
  sprints: {
    all: ['team-lead', 'sprints'] as const,
    list: (teamCode: string) => ['team-lead', 'sprints', 'list', teamCode] as const,
    dashboard: (sprintCode: string) => ['team-lead', 'sprints', 'dashboard', sprintCode] as const,
  },

  // Team Members
  teamMembers: {
    available: (teamCode: string) => ['team-lead', 'team-members', 'available', teamCode] as const,
  },

  // Time Entries
  timeEntries: {
    pending: (teamCode: string) => ['team-lead', 'time-entries', 'pending', teamCode] as const,
    memberPending: (teamCode: string, userCode: string) => ['team-lead', 'time-entries', 'pending', teamCode, userCode] as const,
  },

  // Tasks
  tasks: {
    all: ['team-lead', 'tasks'] as const,
    list: (teamCode: string, filters?: TaskFilters) => ['team-lead', 'tasks', teamCode, filters] as const,
    detail: (taskCode: string) => ['team-lead', 'tasks', taskCode] as const,
  },

  // Workload
  workload: (teamCode: string) => ['team-lead', 'workload', teamCode] as const,

  // Observations
  observations: {
    all: ['team-lead', 'observations'] as const,
    list: (teamCode: string, userCode: string, params?: { page?: number; limit?: number }) =>
      ['team-lead', 'observations', teamCode, userCode, params] as const,
    detail: (observationCode: string) => ['team-lead', 'observations', observationCode] as const,
  },

  // Performance
  performance: {
    team: (teamCode: string, filters: PerformanceFilters) =>
      ['team-lead', 'performance', 'team', teamCode, filters] as const,
    member: (userCode: string, period?: string) =>
      ['team-lead', 'performance', 'member', userCode, period] as const,
  },

  // Metrics
  metrics: {
    team: (teamCode: string) => ['team-lead', 'metrics', teamCode] as const,
  },

  // Git Activity
  git: {
    activity: (teamCode: string, filters: GitActivityFilters) =>
      ['team-lead', 'git', 'activity', teamCode, filters] as const,
    memberActivity: (teamCode: string, userCode: string, filters: GitActivityFilters) =>
      ['team-lead', 'git', 'member-activity', teamCode, userCode, filters] as const,
  },

  // Alerts
  alerts: (teamCode: string, days?: number) => ['team-lead', 'alerts', teamCode, days] as const,

  // Risks
  risks: (teamCode: string) => ['team-lead', 'risks', teamCode] as const,

  // Flags
  flags: (teamCode: string) => ['team-lead', 'flags', teamCode] as const,

  // Templates
  templates: (teamCode: string) => ['team-lead', 'templates', teamCode] as const,

  // Decisions
  decisions: (teamCode: string) => ['team-lead', 'decisions', teamCode] as const,

  // Feedback Requests
  feedbackRequests: {
    all: ['team-lead', 'feedback-requests'] as const,
    listAll: () => ['team-lead', 'feedback-requests', 'list-all'] as const,
    listByTeam: (teamCode: string) => ['team-lead', 'feedback-requests', 'team', teamCode] as const,
    detail: (requestCode: string) => ['team-lead', 'feedback-requests', requestCode] as const,
    responses: (requestCode: string) => ['team-lead', 'feedback-requests', requestCode, 'responses'] as const,
    summary: (requestCode: string) => ['team-lead', 'feedback-requests', requestCode, 'summary'] as const,
  },

  // Attendance & Leave Management
  leave: {
    requests: (teamCode: string, filters?: LeaveRequestFilters) => ['team-lead', 'leave', 'requests', teamCode, filters] as const,
    pending: (teamCode: string) => ['team-lead', 'leave', 'pending', teamCode] as const,
    calendar: (teamCode: string, month: number, year: number) => ['team-lead', 'leave', 'calendar', teamCode, month, year] as const,
  },
  attendance: {
    today: (teamCode: string) => ['team-lead', 'attendance', 'today', teamCode] as const,
    list: (teamCode: string, filters?: AttendanceFilters) => ['team-lead', 'attendance', 'list', teamCode, filters] as const,
  },
  sessions: {
    active: (teamCode: string) => ['team-lead', 'sessions', 'active', teamCode] as const,
  },
};

// ============================================================================
// PROFILE HOOKS
// ============================================================================

/**
 * Get team lead's profile
 */
export const useTeamLeadProfile = () => {
  return useQuery({
    queryKey: teamLeadKeys.profile.all,
    queryFn: teamLeadService.getTeamLeadProfile,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Update team lead's profile mutation
 */
export const useUpdateTeamLeadProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => teamLeadService.updateTeamLeadProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.profile.all });
    },
    onError: handleError,
  });
};

// ============================================================================
// TEAM MANAGEMENT HOOKS
// ============================================================================

/**
 * Get all teams managed by the authenticated team lead
 */
export const useMyTeams = (enabled: boolean = true) => {
  return useQuery({
    queryKey: teamLeadKeys.myTeams(),
    queryFn: () => teamLeadService.getMyTeams(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
};

/**
 * Get specific team information by team code
 */
export const useTeamInfo = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.teamInfo(teamCode),
    queryFn: () => teamLeadService.getTeamInfo(teamCode),
    enabled: !!teamCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

/**
 * Get complete team dashboard
 */
export const useTeamDashboard = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.dashboard(teamCode),
    queryFn: () => teamLeadService.getTeamDashboard(teamCode),
    enabled: !!teamCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ============================================================================
// SPRINT MANAGEMENT HOOKS
// ============================================================================

/**
 * Create sprint mutation
 */
export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSprintRequest) => teamLeadService.createSprint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.sprints.all });
    },
    onError: handleError,
  });
};

/**
 * Get all sprints for a team
 */
export const useTeamSprints = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.sprints.list(teamCode),
    queryFn: () => teamLeadService.getTeamSprints(teamCode),
    enabled: !!teamCode,
  });
};

/**
 * Get sprint dashboard
 */
export const useSprintDashboard = (sprintCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.sprints.dashboard(sprintCode),
    queryFn: () => teamLeadService.getSprintDashboard(sprintCode),
    enabled: !!sprintCode,
  });
};

/**
 * Update sprint mutation
 */
export const useUpdateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sprintCode, data }: { sprintCode: string; data: UpdateSprintRequest }) =>
      teamLeadService.updateSprint(sprintCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.sprints.all });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.sprints.dashboard(variables.sprintCode) });
    },
    onError: handleError,
  });
};

/**
 * Close sprint mutation
 */
export const useCloseSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sprintCode, data }: { sprintCode: string; data: CloseSprintRequest }) =>
      teamLeadService.closeSprint(sprintCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.sprints.all });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.sprints.dashboard(variables.sprintCode) });
    },
    onError: handleError,
  });
};

// ============================================================================
// TEAM MEMBER MANAGEMENT HOOKS
// ============================================================================

/**
 * Get available members for a team
 */
export const useAvailableMembers = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.teamMembers.available(teamCode),
    queryFn: () => teamLeadService.getAvailableMembers(teamCode),
    enabled: !!teamCode,
  });
};

/**
 * Add team member mutation
 */
export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: AddTeamMemberRequest }) =>
      teamLeadService.addTeamMember(teamCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.teamInfo(variables.teamCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.teamMembers.available(variables.teamCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.dashboard(variables.teamCode) });
    },
    onError: handleError,
  });
};

/**
 * Remove team member mutation
 */
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamCode, userCode }: { teamCode: string; userCode: string }) =>
      teamLeadService.removeTeamMember(teamCode, userCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.teamInfo(variables.teamCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.teamMembers.available(variables.teamCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.dashboard(variables.teamCode) });
    },
    onError: handleError,
  });
};

/**
 * Update team member allocation mutation
 */
export const useUpdateTeamMemberAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamCode,
      userCode,
      data,
    }: {
      teamCode: string;
      userCode: string;
      data: UpdateTeamMemberAllocationRequest;
    }) => teamLeadService.updateTeamMemberAllocation(teamCode, userCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.teamInfo(variables.teamCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.dashboard(variables.teamCode) });
    },
    onError: handleError,
  });
};

// ============================================================================
// TIME ENTRY APPROVAL HOOKS
// ============================================================================

/**
 * Get all pending time entries for a team
 */
export const usePendingTimeEntries = (teamCode: string, params?: { start_date?: string; end_date?: string }) => {
  return useQuery({
    queryKey: teamLeadKeys.timeEntries.pending(teamCode),
    queryFn: () => teamLeadService.getPendingTimeEntries(teamCode, params),
    enabled: !!teamCode,
  });
};

/**
 * Get pending time entries for a specific member
 */
export const useMemberPendingTimeEntries = (
  teamCode: string,
  userCode: string,
  params?: { start_date?: string; end_date?: string }
) => {
  return useQuery({
    queryKey: teamLeadKeys.timeEntries.memberPending(teamCode, userCode),
    queryFn: () => teamLeadService.getMemberPendingTimeEntries(teamCode, userCode, params),
    enabled: !!teamCode && !!userCode,
  });
};

/**
 * Approve a time entry mutation
 */
export const useApproveTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamCode, timeCode }: { teamCode: string; timeCode: string }) =>
      teamLeadService.approveTimeEntry(teamCode, timeCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.timeEntries.pending(variables.teamCode) });
    },
    onError: handleError,
  });
};

/**
 * Reject a time entry mutation
 */
export const useRejectTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamCode,
      timeCode,
      data,
    }: {
      teamCode: string;
      timeCode: string;
      data: RejectTimeEntryRequest;
    }) => teamLeadService.rejectTimeEntry(teamCode, timeCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.timeEntries.pending(variables.teamCode) });
    },
    onError: handleError,
  });
};

/**
 * Bulk approve time entries mutation
 */
export const useBulkApproveTimeEntries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: BulkApproveTimeEntriesRequest }) =>
      teamLeadService.bulkApproveTimeEntries(teamCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.timeEntries.pending(variables.teamCode) });
    },
    onError: handleError,
  });
};

// ============================================================================
// TASK MANAGEMENT HOOKS
// ============================================================================

/**
 * Get team tasks
 */
export const useTeamTasks = (teamCode: string, filters?: TaskFilters) => {
  return useQuery({
    queryKey: teamLeadKeys.tasks.list(teamCode, filters),
    queryFn: () => teamLeadService.getTeamTasks(teamCode, filters),
    enabled: !!teamCode,
  });
};

/**
 * Get task by code
 */
export const useTask = (taskCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.tasks.detail(taskCode),
    queryFn: () => teamLeadService.getTask(taskCode),
    enabled: !!taskCode,
  });
};

/**
 * Create task mutation
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateTaskRequest }) =>
      teamLeadService.createTask(teamCode, data),
    onSuccess: (_, variables) => {
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.tasks.all });
    },
    onError: handleError,
  });
};

/**
 * Update task mutation
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskCode, data }: { taskCode: string; data: UpdateTaskRequest }) =>
      teamLeadService.updateTask(taskCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.tasks.detail(variables.taskCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.tasks.all });
    },
    onError: handleError,
  });
};

/**
 * Delete task mutation
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskCode: string) => teamLeadService.deleteTask(taskCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.tasks.all });
    },
    onError: handleError,
  });
};

/**
 * Assign task mutation
 */
export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskCode, data }: { taskCode: string; data: AssignTaskRequest }) =>
      teamLeadService.assignTask(taskCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.tasks.detail(variables.taskCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.tasks.all });
    },
    onError: handleError,
  });
};

/**
 * Update task status mutation
 */
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskCode, data }: { taskCode: string; data: UpdateTaskStatusRequest }) =>
      teamLeadService.updateTaskStatus(taskCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.tasks.detail(variables.taskCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.tasks.all });
    },
    onError: handleError,
  });
};

// ============================================================================
// WORKLOAD & RESOURCE MANAGEMENT HOOKS
// ============================================================================

/**
 * Get team workload
 */
export const useTeamWorkload = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.workload(teamCode),
    queryFn: () => teamLeadService.getTeamWorkload(teamCode),
    enabled: !!teamCode,
  });
};

/**
 * Create capacity plan mutation
 */
export const useCreateCapacityPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateCapacityPlanRequest }) =>
      teamLeadService.createCapacityPlan(teamCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.workload(variables.teamCode) });
    },
    onError: handleError,
  });
};

/**
 * Perform skill gap analysis mutation
 */
export const useSkillGapAnalysis = () => {
  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: SkillGapAnalysisRequest }) =>
      teamLeadService.performSkillGapAnalysis(teamCode, data),
    onError: handleError,
  });
};

// ============================================================================
// PERFORMANCE MANAGEMENT HOOKS
// ============================================================================

/**
 * Get member performance dashboard
 */
export const useMemberPerformanceDashboard = (
  userCode: string,
  period?: 'current_week' | 'current_month' | 'current_quarter'
) => {
  return useQuery({
    queryKey: teamLeadKeys.performance.member(userCode, period),
    queryFn: () => teamLeadService.getMemberPerformanceDashboard(userCode, period),
    enabled: !!userCode,
  });
};

/**
 * Create performance goal mutation
 */
export const useCreatePerformanceGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userCode, data }: { userCode: string; data: CreateGoalRequest }) =>
      teamLeadService.createPerformanceGoal(userCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.performance.member(variables.userCode) });
    },
    onError: handleError,
  });
};

/**
 * Create feedback request mutation
 */
export const useCreateFeedbackRequest = () => {
  return useMutation({
    mutationFn: ({ userCode, data }: { userCode: string; data: CreateFeedbackRequest }) =>
      teamLeadService.createFeedbackRequest(userCode, data),
    onError: handleError,
  });
};

/**
 * Get team performance
 */
export const useTeamPerformance = (teamCode: string, filters: PerformanceFilters) => {
  return useQuery({
    queryKey: teamLeadKeys.performance.team(teamCode, filters),
    queryFn: () => teamLeadService.getTeamPerformance(teamCode, filters),
    enabled: !!teamCode && !!filters.period_start && !!filters.period_end,
  });
};

// ============================================================================
// OBSERVATION HOOKS
// ============================================================================

/**
 * Create observation mutation
 */
export const useCreateObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamCode,
      userCode,
      data,
    }: {
      teamCode: string;
      userCode: string;
      data: CreateObservationRequest;
    }) => teamLeadService.createObservation(teamCode, userCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamLeadKeys.observations.list(variables.teamCode, variables.userCode),
      });
      // Invalidate team observations to refresh the "All Members" view
      queryClient.invalidateQueries({
        queryKey: ['team-lead', 'observations', 'team', variables.teamCode]
      });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.performance.member(variables.userCode) });
    },
    onError: handleError,
  });
};

/**
 * Get member observations
 */
export const useMemberObservations = (
  teamCode: string,
  userCode: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: teamLeadKeys.observations.list(teamCode, userCode, params),
    queryFn: () => teamLeadService.getMemberObservations(teamCode, userCode, params),
    enabled: !!teamCode && !!userCode,
  });
};

/**
 * Get all team observations (all members)
 */
export const useTeamObservations = (
  teamCode: string,
  params?: {
    page?: number;
    limit?: number;
    category?: string;
    rating?: string;
  }
) => {
  return useQuery({
    queryKey: ['team-lead', 'observations', 'team', teamCode, params],
    queryFn: () => teamLeadService.getTeamObservations(teamCode, params),
    enabled: !!teamCode,
  });
};

/**
 * Get observation by code
 */
export const useObservation = (observationCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.observations.detail(observationCode),
    queryFn: () => teamLeadService.getObservation(observationCode),
    enabled: !!observationCode,
  });
};

/**
 * Update observation mutation
 */
export const useUpdateObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ observationCode, data }: { observationCode: string; data: UpdateObservationRequest }) =>
      teamLeadService.updateObservation(observationCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.observations.detail(variables.observationCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.observations.all });
    },
    onError: handleError,
  });
};

/**
 * Delete observation mutation
 */
export const useDeleteObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (observationCode: string) => teamLeadService.deleteObservation(observationCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.observations.all });
    },
    onError: handleError,
  });
};

// ============================================================================
// COMMUNICATION HOOKS
// ============================================================================

/**
 * Create announcement mutation
 */
export const useCreateAnnouncement = () => {
  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateAnnouncementRequest }) =>
      teamLeadService.createAnnouncement(teamCode, data),
    onError: handleError,
  });
};

/**
 * Schedule one-on-one mutation
 */
export const useScheduleOneOnOne = () => {
  return useMutation({
    mutationFn: ({ userCode, data }: { userCode: string; data: CreateOneOnOneRequest }) =>
      teamLeadService.scheduleOneOnOne(userCode, data),
    onError: handleError,
  });
};

/**
 * Get team decisions
 */
export const useTeamDecisions = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.decisions(teamCode),
    queryFn: () => teamLeadService.getTeamDecisions(teamCode),
    enabled: !!teamCode,
  });
};

/**
 * Log team decision mutation
 */
export const useLogTeamDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateDecisionRequest }) =>
      teamLeadService.logTeamDecision(teamCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.decisions(variables.teamCode) });
    },
    onError: handleError,
  });
};

// ============================================================================
// MONITORING & ALERTS HOOKS
// ============================================================================

/**
 * Create monitoring rule mutation
 */
export const useCreateMonitoringRule = () => {
  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateMonitoringRuleRequest }) =>
      teamLeadService.createMonitoringRule(teamCode, data),
    onError: handleError,
  });
};

/**
 * Get recent alerts
 */
export const useRecentAlerts = (teamCode: string, days: number = 7) => {
  return useQuery({
    queryKey: teamLeadKeys.alerts(teamCode, days),
    queryFn: () => teamLeadService.getRecentAlerts(teamCode, days),
    enabled: !!teamCode,
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
};

/**
 * Acknowledge alert mutation
 */
export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertCode, data }: { alertCode: string; data?: AcknowledgeAlertRequest }) =>
      teamLeadService.acknowledgeAlert(alertCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.all });
    },
    onError: handleError,
  });
};

/**
 * Resolve alert mutation
 */
export const useResolveAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertCode, data }: { alertCode: string; data: ResolveAlertRequest }) =>
      teamLeadService.resolveAlert(alertCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.all });
    },
    onError: handleError,
  });
};

// ============================================================================
// RISK MANAGEMENT HOOKS
// ============================================================================

/**
 * Create risk mutation
 */
export const useCreateRisk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateRiskRequest }) =>
      teamLeadService.createRisk(teamCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.risks(variables.teamCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.dashboard(variables.teamCode) });
    },
    onError: handleError,
  });
};

/**
 * Get active risks
 */
export const useActiveRisks = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.risks(teamCode),
    queryFn: () => teamLeadService.getActiveRisks(teamCode),
    enabled: !!teamCode,
  });
};

// ============================================================================
// PERFORMANCE FLAGS HOOKS
// ============================================================================

/**
 * Flag performance issue mutation
 */
export const useFlagPerformanceIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userCode, data }: { userCode: string; data: CreateFlagRequest }) =>
      teamLeadService.flagPerformanceIssue(userCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.performance.member(variables.userCode) });
      queryClient.invalidateQueries({ queryKey: ['team-lead', 'flags'] });
    },
    onError: handleError,
  });
};

/**
 * Get active flags
 */
export const useActiveFlags = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.flags(teamCode),
    queryFn: () => teamLeadService.getActiveFlags(teamCode),
    enabled: !!teamCode,
  });
};

// ============================================================================
// TASK TEMPLATES HOOKS
// ============================================================================

/**
 * Create task template mutation
 */
export const useCreateTaskTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateTaskTemplateRequest }) =>
      teamLeadService.createTaskTemplate(teamCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.templates(variables.teamCode) });
    },
    onError: handleError,
  });
};

/**
 * Get task templates
 */
export const useTaskTemplates = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.templates(teamCode),
    queryFn: () => teamLeadService.getTaskTemplates(teamCode),
    enabled: !!teamCode,
  });
};

// ============================================================================
// METRICS & GIT ACTIVITY HOOKS
// ============================================================================

/**
 * Get team metrics
 */
export const useTeamMetrics = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.metrics.team(teamCode),
    queryFn: () => teamLeadService.getTeamMetrics(teamCode),
    enabled: !!teamCode,
  });
};

/**
 * Link repository mutation
 */
export const useLinkRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: LinkRepositoryRequest }) =>
      teamLeadService.linkRepository(teamCode, data),
    onSuccess: (_, variables) => {
      // Invalidate metrics to update git activity
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.metrics.team(variables.teamCode) });

      // Invalidate teams query to update repository display
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.teams });

      // Invalidate team info to update repository in team overview
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.teamInfo(variables.teamCode) });
    },
    onError: handleError,
  });
};

/**
 * Get team git activity
 */
export const useTeamGitActivity = (teamCode: string, filters: GitActivityFilters) => {
  return useQuery({
    queryKey: teamLeadKeys.git.activity(teamCode, filters),
    queryFn: () => teamLeadService.getTeamGitActivity(teamCode, filters),
    enabled: !!teamCode && !!filters.start_date && !!filters.end_date,
  });
};

/**
 * Get member git activity
 */
export const useMemberGitActivity = (teamCode: string, userCode: string, filters: GitActivityFilters) => {
  return useQuery({
    queryKey: teamLeadKeys.git.memberActivity(teamCode, userCode, filters),
    queryFn: () => teamLeadService.getMemberGitActivity(teamCode, userCode, filters),
    enabled: !!teamCode && !!userCode && !!filters.start_date && !!filters.end_date,
  });
};

// ============================================================================
// FEEDBACK REQUESTS HOOKS (360-Degree Feedback)
// ============================================================================

/**
 * Create a new feedback request for a team member
 */
export const useCreateFeedbackRequestForMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userCode, data }: { userCode: string; data: CreateFeedbackRequestData }) =>
      teamLeadService.createFeedbackRequestForMember(userCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.feedbackRequests.all });
    },
    onError: handleError,
  });
};

/**
 * Get all feedback requests created by the team lead
 */
export const useAllFeedbackRequests = () => {
  return useQuery({
    queryKey: teamLeadKeys.feedbackRequests.listAll(),
    queryFn: () => teamLeadService.getAllFeedbackRequests(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get all feedback requests for members of a specific team
 */
export const useTeamFeedbackRequests = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.feedbackRequests.listByTeam(teamCode),
    queryFn: () => teamLeadService.getTeamFeedbackRequests(teamCode),
    enabled: !!teamCode,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get details of a specific feedback request
 */
export const useFeedbackRequest = (requestCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.feedbackRequests.detail(requestCode),
    queryFn: () => teamLeadService.getFeedbackRequest(requestCode),
    enabled: !!requestCode,
  });
};

/**
 * Update an existing feedback request
 */
export const useUpdateFeedbackRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestCode, data }: { requestCode: string; data: UpdateFeedbackRequestData }) =>
      teamLeadService.updateFeedbackRequest(requestCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.feedbackRequests.detail(variables.requestCode) });
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.feedbackRequests.all });
    },
    onError: handleError,
  });
};

/**
 * Delete/cancel a feedback request
 */
export const useDeleteFeedbackRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestCode: string) => teamLeadService.deleteFeedbackRequest(requestCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.feedbackRequests.all });
    },
    onError: handleError,
  });
};

/**
 * Get all submitted responses for a feedback request
 */
export const useFeedbackResponses = (requestCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.feedbackRequests.responses(requestCode),
    queryFn: () => teamLeadService.getFeedbackResponses(requestCode),
    enabled: !!requestCode,
  });
};

/**
 * Get aggregated summary of all feedback responses
 */
export const useFeedbackSummary = (requestCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.feedbackRequests.summary(requestCode),
    queryFn: () => teamLeadService.getFeedbackSummary(requestCode),
    enabled: !!requestCode,
  });
};

// ============================================================================
// TEAM LEAVE MANAGEMENT HOOKS
// ============================================================================

/**
 * Get team leave requests with optional filters
 */
export const useTeamLeaveRequests = (teamCode: string, filters?: LeaveRequestFilters) => {
  return useQuery({
    queryKey: teamLeadKeys.leave.requests(teamCode, filters),
    queryFn: () => teamLeadService.getTeamLeaveRequests(teamCode, filters),
    enabled: !!teamCode,
    staleTime: 30000,
  });
};

/**
 * Get pending leave requests for the team
 */
export const usePendingLeaveRequests = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.leave.pending(teamCode),
    queryFn: () => teamLeadService.getPendingLeaveRequests(teamCode),
    enabled: !!teamCode,
    staleTime: 30000,
  });
};

/**
 * Approve a leave request
 */
export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamCode,
      requestCode,
      data,
    }: {
      teamCode: string;
      requestCode: string;
      data?: ReviewLeaveRequest;
    }) => teamLeadService.approveLeaveRequest(teamCode, requestCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-lead', 'leave'] });
    },
    onError: handleError,
  });
};

/**
 * Reject a leave request
 */
export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamCode,
      requestCode,
      data,
    }: {
      teamCode: string;
      requestCode: string;
      data: ReviewLeaveRequest;
    }) => teamLeadService.rejectLeaveRequest(teamCode, requestCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-lead', 'leave'] });
    },
    onError: handleError,
  });
};

/**
 * Get team leave calendar for a specific month
 */
export const useTeamLeaveCalendar = (teamCode: string, month: number, year: number) => {
  return useQuery({
    queryKey: teamLeadKeys.leave.calendar(teamCode, month, year),
    queryFn: () => teamLeadService.getTeamLeaveCalendar(teamCode, month, year),
    enabled: !!teamCode && month > 0 && year > 0,
    staleTime: 60000,
  });
};

// ============================================================================
// TEAM ATTENDANCE HOOKS
// ============================================================================

/**
 * Get team's today attendance overview
 */
export const useTeamTodayAttendance = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.attendance.today(teamCode),
    queryFn: () => teamLeadService.getTeamTodayAttendance(teamCode),
    enabled: !!teamCode,
    staleTime: 30000,
    refetchInterval: 60000, // Auto-refresh every minute
  });
};

/**
 * Get team attendance records with optional filters
 */
export const useTeamAttendance = (teamCode: string, filters?: AttendanceFilters) => {
  return useQuery({
    queryKey: teamLeadKeys.attendance.list(teamCode, filters),
    queryFn: () => teamLeadService.getTeamAttendance(teamCode, filters),
    enabled: !!teamCode,
    staleTime: 30000,
  });
};

/**
 * Get team's active sessions
 */
export const useTeamActiveSessions = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.sessions.active(teamCode),
    queryFn: () => teamLeadService.getTeamActiveSessions(teamCode),
    enabled: !!teamCode,
    staleTime: 30000,
    refetchInterval: 60000, // Auto-refresh every minute
  });
};

