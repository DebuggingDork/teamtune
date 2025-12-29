import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as teamLeadService from '@/services/teamLead.service';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  TaskFilters,
  CreateObservationRequest,
  UpdateObservationRequest,
  PerformanceFilters,
  GitActivityFilters,
  LinkRepositoryRequest,
} from '@/api/types';
import { handleError } from '@/utils/errorHandler';

// Query Keys
export const teamLeadKeys = {
  all: ['team-lead'] as const,
  tasks: {
    all: ['team-lead', 'tasks'] as const,
    list: (teamCode: string, filters?: TaskFilters) => ['team-lead', 'tasks', teamCode, filters] as const,
    detail: (taskCode: string) => ['team-lead', 'tasks', taskCode] as const,
  },
  observations: {
    all: ['team-lead', 'observations'] as const,
    list: (teamCode: string, userCode: string, params?: { page?: number; limit?: number }) =>
      ['team-lead', 'observations', teamCode, userCode, params] as const,
    detail: (observationCode: string) => ['team-lead', 'observations', observationCode] as const,
  },
  performance: {
    team: (teamCode: string, filters: PerformanceFilters) =>
      ['team-lead', 'performance', 'team', teamCode, filters] as const,
    member: (teamCode: string, userCode: string, filters: PerformanceFilters) =>
      ['team-lead', 'performance', 'member', teamCode, userCode, filters] as const,
  },
  metrics: {
    team: (teamCode: string) => ['team-lead', 'metrics', 'team', teamCode] as const,
  },
  git: {
    activity: (teamCode: string, filters: GitActivityFilters) =>
      ['team-lead', 'git', 'activity', teamCode, filters] as const,
    memberActivity: (teamCode: string, userCode: string, filters: GitActivityFilters) =>
      ['team-lead', 'git', 'activity', teamCode, userCode, filters] as const,
  },
};

/**
 * Get team tasks
 */
export const useTeamTasks = (teamCode: string, filters?: TaskFilters) => {
  return useQuery({
    queryKey: teamLeadKeys.tasks.list(teamCode, filters),
    queryFn: () => teamLeadService.getTeamTasks(teamCode, filters),
    enabled: !!teamCode,
    staleTime: 30000,
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
    staleTime: 30000,
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
      queryClient.invalidateQueries({ queryKey: teamLeadKeys.performance.all });
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
    staleTime: 30000,
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
    staleTime: 30000,
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

/**
 * Get team performance
 */
export const useTeamPerformance = (teamCode: string, filters: PerformanceFilters) => {
  return useQuery({
    queryKey: teamLeadKeys.performance.team(teamCode, filters),
    queryFn: () => teamLeadService.getTeamPerformance(teamCode, filters),
    enabled: !!teamCode && !!filters.period_start && !!filters.period_end,
    staleTime: 60000,
  });
};

/**
 * Get member performance
 */
export const useMemberPerformance = (teamCode: string, userCode: string, filters: PerformanceFilters) => {
  return useQuery({
    queryKey: teamLeadKeys.performance.member(teamCode, userCode, filters),
    queryFn: () => teamLeadService.getMemberPerformance(teamCode, userCode, filters),
    enabled: !!teamCode && !!userCode && !!filters.period_start && !!filters.period_end,
    staleTime: 60000,
  });
};

/**
 * Get team metrics
 */
export const useTeamMetrics = (teamCode: string) => {
  return useQuery({
    queryKey: teamLeadKeys.metrics.team(teamCode),
    queryFn: () => teamLeadService.getTeamMetrics(teamCode),
    enabled: !!teamCode,
    staleTime: 60000,
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
    staleTime: 60000,
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
    staleTime: 60000,
  });
};

