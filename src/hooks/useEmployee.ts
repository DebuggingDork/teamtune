import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as employeeService from '@/services/employee.service';
import type {
  TaskFilters,
  UpdateTaskStatusRequest,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  TimeEntryFilters,
  UpdateProfileRequest,
  PerformanceFilters,
  GitActivityFilters,
} from '@/api/types';
import { handleError } from '@/utils/errorHandler';

// Query Keys
export const employeeKeys = {
  all: ['employee'] as const,
  tasks: {
    all: ['employee', 'tasks'] as const,
    list: (filters?: TaskFilters) => ['employee', 'tasks', filters] as const,
    detail: (taskCode: string) => ['employee', 'tasks', taskCode] as const,
  },
  timeEntries: {
    all: ['employee', 'time-entries'] as const,
    list: (filters?: TimeEntryFilters) => ['employee', 'time-entries', filters] as const,
    detail: (timeCode: string) => ['employee', 'time-entries', timeCode] as const,
  },
  profile: {
    all: ['employee', 'profile'] as const,
  },
  teams: {
    all: ['employee', 'teams'] as const,
    list: (params?: { page?: number; limit?: number }) => ['employee', 'teams', params] as const,
  },
  projects: {
    all: ['employee', 'projects'] as const,
    list: (params?: { page?: number; limit?: number }) => ['employee', 'projects', params] as const,
  },
  performance: {
    all: ['employee', 'performance'] as const,
    detail: (filters: PerformanceFilters) => ['employee', 'performance', filters] as const,
  },
  observations: {
    all: ['employee', 'observations'] as const,
    list: (params?: { page?: number; limit?: number }) => ['employee', 'observations', params] as const,
  },
  metrics: {
    all: ['employee', 'metrics'] as const,
  },
  github: {
    status: ['employee', 'github', 'status'] as const,
  },
  gitActivity: {
    all: ['employee', 'git-activity'] as const,
    detail: (filters: GitActivityFilters) => ['employee', 'git-activity', filters] as const,
  },
};

/**
 * Get my tasks
 */
export const useMyTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: employeeKeys.tasks.list(filters),
    queryFn: () => employeeService.getMyTasks(filters),
    staleTime: 30000,
  });
};

/**
 * Get my task by code
 */
export const useMyTask = (taskCode: string) => {
  return useQuery({
    queryKey: employeeKeys.tasks.detail(taskCode),
    queryFn: () => employeeService.getMyTask(taskCode),
    enabled: !!taskCode,
    staleTime: 30000,
  });
};

/**
 * Update task status mutation
 */
export const useUpdateMyTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskCode, data }: { taskCode: string; data: UpdateTaskStatusRequest }) =>
      employeeService.updateMyTaskStatus(taskCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.tasks.detail(variables.taskCode) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.tasks.all });
    },
    onError: handleError,
  });
};

/**
 * Create time entry mutation
 */
export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeEntryRequest) => employeeService.createTimeEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.timeEntries.all });
    },
    onError: handleError,
  });
};

/**
 * Get my time entries
 */
export const useMyTimeEntries = (filters?: TimeEntryFilters) => {
  return useQuery({
    queryKey: employeeKeys.timeEntries.list(filters),
    queryFn: () => employeeService.getMyTimeEntries(filters),
    staleTime: 30000,
  });
};

/**
 * Get my time entry by code
 */
export const useMyTimeEntry = (timeCode: string) => {
  return useQuery({
    queryKey: employeeKeys.timeEntries.detail(timeCode),
    queryFn: () => employeeService.getMyTimeEntry(timeCode),
    enabled: !!timeCode,
    staleTime: 30000,
  });
};

/**
 * Update time entry mutation
 */
export const useUpdateMyTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ timeCode, data }: { timeCode: string; data: UpdateTimeEntryRequest }) =>
      employeeService.updateMyTimeEntry(timeCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.timeEntries.detail(variables.timeCode) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.timeEntries.all });
    },
    onError: handleError,
  });
};

/**
 * Delete time entry mutation
 */
export const useDeleteMyTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timeCode: string) => employeeService.deleteMyTimeEntry(timeCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.timeEntries.all });
    },
    onError: handleError,
  });
};

/**
 * Get my profile
 */
export const useMyProfile = () => {
  return useQuery({
    queryKey: employeeKeys.profile.all,
    queryFn: employeeService.getMyProfile,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Update my profile mutation
 */
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => employeeService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.profile.all });
    },
    onError: handleError,
  });
};

/**
 * Get my teams
 */
export const useMyTeams = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: employeeKeys.teams.list(params),
    queryFn: () => employeeService.getMyTeams(params),
    staleTime: 30000,
  });
};

/**
 * Get my projects
 */
export const useMyProjects = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: employeeKeys.projects.list(params),
    queryFn: () => employeeService.getMyProjects(params),
    staleTime: 30000,
  });
};

/**
 * Get my performance
 */
export const useMyPerformance = (filters: PerformanceFilters) => {
  return useQuery({
    queryKey: employeeKeys.performance.detail(filters),
    queryFn: () => employeeService.getMyPerformance(filters),
    enabled: !!filters.period_start && !!filters.period_end,
    staleTime: 60000,
  });
};

/**
 * Get my observations
 */
export const useMyObservations = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: employeeKeys.observations.list(params),
    queryFn: () => employeeService.getMyObservations(params),
    staleTime: 30000,
  });
};

/**
 * Get my metrics
 */
export const useMyMetrics = () => {
  return useQuery({
    queryKey: employeeKeys.metrics.all,
    queryFn: employeeService.getMyMetrics,
    staleTime: 60000,
  });
};

/**
 * Connect GitHub mutation
 */
export const useConnectGitHub = () => {
  return useMutation({
    mutationFn: employeeService.connectGitHub,
    onError: handleError,
  });
};

/**
 * Disconnect GitHub mutation
 */
export const useDisconnectGitHub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeService.disconnectGitHub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.github.status });
      queryClient.invalidateQueries({ queryKey: employeeKeys.gitActivity.all });
    },
    onError: handleError,
  });
};

/**
 * Get GitHub status
 */
export const useGitHubStatus = () => {
  return useQuery({
    queryKey: employeeKeys.github.status,
    queryFn: employeeService.getGitHubStatus,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Get my git activity
 */
export const useMyGitActivity = (filters: GitActivityFilters) => {
  return useQuery({
    queryKey: employeeKeys.gitActivity.detail(filters),
    queryFn: () => employeeService.getMyGitActivity(filters),
    enabled: !!filters.start_date && !!filters.end_date,
    staleTime: 60000,
  });
};

