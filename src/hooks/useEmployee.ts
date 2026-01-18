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
  // Attendance & Leave Types
  LeaveRequestFilters,
  AttendanceFilters,
  SessionFilters,
  SubmitLeaveRequest,
  CheckInOutRequest,
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
  // Attendance & Leave Keys
  leave: {
    types: ['employee', 'leave', 'types'] as const,
    balances: (year?: number) => ['employee', 'leave', 'balances', year] as const,
    requests: (filters?: LeaveRequestFilters) => ['employee', 'leave', 'requests', filters] as const,
    request: (code: string) => ['employee', 'leave', 'requests', code] as const,
  },
  attendance: {
    today: ['employee', 'attendance', 'today'] as const,
    list: (filters?: AttendanceFilters) => ['employee', 'attendance', 'list', filters] as const,
    summary: (month: number, year: number) => ['employee', 'attendance', 'summary', month, year] as const,
  },
  sessions: {
    list: (filters?: SessionFilters) => ['employee', 'sessions', 'list', filters] as const,
    current: ['employee', 'sessions', 'current'] as const,
    summary: (month: number, year: number) => ['employee', 'sessions', 'summary', month, year] as const,
  },
  holidays: (year?: number) => ['employee', 'holidays', year] as const,
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
 * NOTE: This hook calls /api/employee/teams and should ONLY be used by employees.
 * Admin dashboard and other roles should NOT use this hook.
 */
export const useMyTeams = (params?: { page?: number; limit?: number }, enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeKeys.teams.list(params),
    queryFn: () => employeeService.getMyTeams(params),
    staleTime: 30000,
    enabled,
    retry: (failureCount, error: any) => {
      // Don't retry on 403 Forbidden errors
      if (error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
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

// ============================================================================
// LEAVE MANAGEMENT HOOKS
// ============================================================================

/**
 * Get all leave types
 */
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: employeeKeys.leave.types,
    queryFn: employeeService.getLeaveTypes,
    staleTime: 300000, // 5 minutes - leave types rarely change
  });
};

/**
 * Get leave balances for current or specific year
 */
export const useLeaveBalances = (year?: number) => {
  return useQuery({
    queryKey: employeeKeys.leave.balances(year),
    queryFn: () => employeeService.getLeaveBalances(year),
    staleTime: 60000,
  });
};

/**
 * Get my leave requests
 */
export const useMyLeaveRequests = (filters?: LeaveRequestFilters) => {
  return useQuery({
    queryKey: employeeKeys.leave.requests(filters),
    queryFn: () => employeeService.getMyLeaveRequests(filters),
    staleTime: 30000,
  });
};

/**
 * Get a specific leave request by code
 */
export const useLeaveRequest = (code: string) => {
  return useQuery({
    queryKey: employeeKeys.leave.request(code),
    queryFn: () => employeeService.getLeaveRequest(code),
    enabled: !!code,
    staleTime: 30000,
  });
};

/**
 * Submit a new leave request
 */
export const useSubmitLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitLeaveRequest) => employeeService.submitLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'leave'] });
    },
    onError: handleError,
  });
};

/**
 * Cancel a leave request
 */
export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => employeeService.cancelLeaveRequest(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'leave'] });
    },
    onError: handleError,
  });
};

// ============================================================================
// ATTENDANCE HOOKS
// ============================================================================

/**
 * Get today's attendance status
 */
export const useTodayAttendance = () => {
  return useQuery({
    queryKey: employeeKeys.attendance.today,
    queryFn: employeeService.getTodayAttendance,
    staleTime: 10000, // 10 seconds - refresh often for real-time status
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Check in for the day
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: CheckInOutRequest) => employeeService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.attendance.today });
      queryClient.invalidateQueries({ queryKey: ['employee', 'attendance'] });
    },
    onError: handleError,
  });
};

/**
 * Check out for the day
 */
export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: CheckInOutRequest) => employeeService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.attendance.today });
      queryClient.invalidateQueries({ queryKey: ['employee', 'attendance'] });
    },
    onError: handleError,
  });
};

/**
 * Get attendance records with filters
 */
export const useMyAttendance = (filters?: AttendanceFilters) => {
  return useQuery({
    queryKey: employeeKeys.attendance.list(filters),
    queryFn: () => employeeService.getMyAttendance(filters),
    staleTime: 30000,
  });
};

/**
 * Get attendance summary for a specific month
 */
export const useAttendanceSummary = (month: number, year: number) => {
  return useQuery({
    queryKey: employeeKeys.attendance.summary(month, year),
    queryFn: () => employeeService.getAttendanceSummary(month, year),
    enabled: month > 0 && year > 0,
    staleTime: 60000,
  });
};

// ============================================================================
// SESSIONS HOOKS
// ============================================================================

/**
 * Get my sessions with filters
 */
export const useMySessions = (filters?: SessionFilters) => {
  return useQuery({
    queryKey: employeeKeys.sessions.list(filters),
    queryFn: () => employeeService.getMySessions(filters),
    staleTime: 30000,
  });
};

/**
 * Get current active session
 */
export const useCurrentSession = () => {
  return useQuery({
    queryKey: employeeKeys.sessions.current,
    queryFn: employeeService.getCurrentSession,
    staleTime: 10000,
    refetchInterval: 60000,
  });
};

/**
 * Get session summary for a specific month
 */
export const useSessionSummary = (month: number, year: number) => {
  return useQuery({
    queryKey: employeeKeys.sessions.summary(month, year),
    queryFn: () => employeeService.getSessionSummary(month, year),
    enabled: month > 0 && year > 0,
    staleTime: 60000,
  });
};

// ============================================================================
// HOLIDAYS HOOKS
// ============================================================================

/**
 * Get holidays for a specific year
 */
export const useHolidays = (year?: number) => {
  return useQuery({
    queryKey: employeeKeys.holidays(year),
    queryFn: () => employeeService.getHolidays(year),
    staleTime: 300000, // 5 minutes - holidays don't change often
  });
};

