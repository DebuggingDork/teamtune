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
    dashboard: (sprintCode: string) => ['team-lead', 'sprints', 'dashboard', sprintCode] as const,
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
 * Get sprint dashboard
 */
export const useSprintDashboard = (sprintCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.sprints.dashboard(sprintCode),
    queryFn: () => teamLeadService.getSprintDashboard(sprintCode),
    enabled: !!sprintCode,
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
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.tasks.list(variables.teamCode) });
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
 * Log team decision mutation
 */
export const useLogTeamDecision = () => {
  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateDecisionRequest }) =>
      teamLeadService.logTeamDecision(teamCode, data),
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
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.flags });
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
  return useMutation({
    mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateTaskTemplateRequest }) =>
      teamLeadService.createTaskTemplate(teamCode, data),
    onError: handleError,
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
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.metrics.team(variables.teamCode) });
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
