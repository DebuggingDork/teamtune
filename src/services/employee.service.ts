import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  Task,
  TasksResponse,
  UpdateTaskStatusRequest,
  TimeEntry,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  TimeEntriesResponse,
  EmployeeProfile,
  UpdateProfileRequest,
  EmployeeProjectsResponse,
  EmployeeTeamsResponse,
  MemberPerformanceResponse,
  ObservationsResponse,
  GitMetrics,
  GitHubConnectResponse,
  GitHubStatusResponse,
  MemberGitActivityResponse,
  TaskFilters,
  TimeEntryFilters,
  PerformanceFilters,
  GitActivityFilters,
  // Attendance & Leave Types
  LeaveType,
  LeaveBalancesResponse,
  SubmitLeaveRequest,
  LeaveRequest,
  LeaveRequestsResponse,
  LeaveRequestFilters,
  TodayAttendance,
  AttendanceRecord,
  AttendanceRecordsResponse,
  AttendanceSummary,
  AttendanceFilters,
  CheckInOutRequest,
  Session,
  SessionsResponse,
  CurrentSession,
  SessionSummary,
  SessionFilters,
  HolidaysResponse,
} from '@/api/types';

/**
 * Get my tasks
 */
export const getMyTasks = async (filters?: TaskFilters): Promise<TasksResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.status) queryParams.append('status', filters.status);

  const queryString = queryParams.toString();
  const url = queryString ? `${ENDPOINTS.EMPLOYEE.TASKS.LIST}?${queryString}` : ENDPOINTS.EMPLOYEE.TASKS.LIST;

  const response = await apiClient.get<TasksResponse>(url);
  return response.data;
};

/**
 * Get task by code
 */
export const getMyTask = async (taskCode: string): Promise<Task> => {
  const response = await apiClient.get<Task>(ENDPOINTS.EMPLOYEE.TASKS.GET(taskCode));
  return response.data;
};

/**
 * Update task status
 */
export const updateMyTaskStatus = async (taskCode: string, data: UpdateTaskStatusRequest): Promise<Task> => {
  const response = await apiClient.put<Task>(ENDPOINTS.EMPLOYEE.TASKS.UPDATE_STATUS(taskCode), data);
  return response.data;
};

/**
 * Create time entry
 */
export const createTimeEntry = async (data: CreateTimeEntryRequest): Promise<TimeEntry> => {
  const response = await apiClient.post<TimeEntry>(ENDPOINTS.EMPLOYEE.TIME_ENTRIES.CREATE, data);
  return response.data;
};

/**
 * Get my time entries
 */
export const getMyTimeEntries = async (filters?: TimeEntryFilters): Promise<TimeEntriesResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.start_date) queryParams.append('start_date', filters.start_date);
  if (filters?.end_date) queryParams.append('end_date', filters.end_date);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.EMPLOYEE.TIME_ENTRIES.LIST}?${queryString}`
    : ENDPOINTS.EMPLOYEE.TIME_ENTRIES.LIST;

  const response = await apiClient.get<TimeEntriesResponse>(url);
  return response.data;
};

/**
 * Get time entry by code
 */
export const getMyTimeEntry = async (timeCode: string): Promise<TimeEntry> => {
  const response = await apiClient.get<TimeEntry>(ENDPOINTS.EMPLOYEE.TIME_ENTRIES.GET(timeCode));
  return response.data;
};

/**
 * Update time entry
 */
export const updateMyTimeEntry = async (timeCode: string, data: UpdateTimeEntryRequest): Promise<TimeEntry> => {
  const response = await apiClient.put<TimeEntry>(ENDPOINTS.EMPLOYEE.TIME_ENTRIES.UPDATE(timeCode), data);
  return response.data;
};

/**
 * Delete time entry
 */
export const deleteMyTimeEntry = async (timeCode: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.EMPLOYEE.TIME_ENTRIES.DELETE(timeCode));
  return response.data;
};

/**
 * Get my profile
 */
export const getMyProfile = async (): Promise<EmployeeProfile> => {
  const response = await apiClient.get<EmployeeProfile>(ENDPOINTS.EMPLOYEE.PROFILE.GET);
  return response.data;
};

/**
 * Update my profile
 */
export const updateMyProfile = async (data: UpdateProfileRequest): Promise<EmployeeProfile> => {
  const response = await apiClient.put<EmployeeProfile>(ENDPOINTS.EMPLOYEE.PROFILE.UPDATE, data);
  return response.data;
};

/**
 * Get my teams
 * NOTE: This function calls /api/employee/teams and should ONLY be used by employees.
 * Admin dashboard and other roles should NOT use this endpoint.
 */
export const getMyTeams = async (params?: { page?: number; limit?: number }): Promise<EmployeeTeamsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `${ENDPOINTS.EMPLOYEE.TEAMS}?${queryString}` : ENDPOINTS.EMPLOYEE.TEAMS;

  const response = await apiClient.get<EmployeeTeamsResponse>(url);
  return response.data;
};

/**
 * Get my projects
 */
export const getMyProjects = async (params?: { page?: number; limit?: number }): Promise<EmployeeProjectsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `${ENDPOINTS.EMPLOYEE.PROJECTS}?${queryString}` : ENDPOINTS.EMPLOYEE.PROJECTS;

  const response = await apiClient.get<EmployeeProjectsResponse>(url);
  return response.data;
};

/**
 * Get my performance
 */
export const getMyPerformance = async (filters: PerformanceFilters): Promise<MemberPerformanceResponse> => {
  const url = `${ENDPOINTS.EMPLOYEE.PERFORMANCE}?period_start=${filters.period_start}&period_end=${filters.period_end}`;
  const response = await apiClient.get<MemberPerformanceResponse>(url);
  return response.data;
};

/**
 * Get my observations
 */
export const getMyObservations = async (params?: { page?: number; limit?: number }): Promise<ObservationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `${ENDPOINTS.EMPLOYEE.OBSERVATIONS}?${queryString}` : ENDPOINTS.EMPLOYEE.OBSERVATIONS;

  const response = await apiClient.get<ObservationsResponse>(url);
  return response.data;
};

/**
 * Get my metrics
 */
export const getMyMetrics = async (): Promise<GitMetrics> => {
  const response = await apiClient.get<GitMetrics>(ENDPOINTS.EMPLOYEE.METRICS);
  return response.data;
};

/**
 * Connect GitHub
 */
export const connectGitHub = async (): Promise<GitHubConnectResponse> => {
  const response = await apiClient.post<GitHubConnectResponse>(ENDPOINTS.EMPLOYEE.GITHUB.CONNECT);
  return response.data;
};

/**
 * Disconnect GitHub
 */
export const disconnectGitHub = async (): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.EMPLOYEE.GITHUB.DISCONNECT);
  return response.data;
};

/**
 * Get GitHub status
 */
export const getGitHubStatus = async (): Promise<GitHubStatusResponse> => {
  const response = await apiClient.get<GitHubStatusResponse>(ENDPOINTS.EMPLOYEE.GITHUB.STATUS);
  return response.data;
};

/**
 * Get my git activity
 */
export const getMyGitActivity = async (filters: GitActivityFilters): Promise<MemberGitActivityResponse> => {
  const url = `${ENDPOINTS.EMPLOYEE.GIT_ACTIVITY}?start_date=${filters.start_date}&end_date=${filters.end_date}`;
  const response = await apiClient.get<MemberGitActivityResponse>(url);
  return response.data;
};

// ============================================================================
// LEAVE MANAGEMENT
// ============================================================================

/**
 * Get all leave types
 */
export const getLeaveTypes = async (): Promise<LeaveType[]> => {
  const response = await apiClient.get<LeaveType[]>(ENDPOINTS.EMPLOYEE.LEAVE.TYPES);
  return response.data;
};

/**
 * Get leave balances for current or specific year
 */
export const getLeaveBalances = async (year?: number): Promise<LeaveBalancesResponse> => {
  const url = year
    ? ENDPOINTS.EMPLOYEE.LEAVE.BALANCES_BY_YEAR(year)
    : ENDPOINTS.EMPLOYEE.LEAVE.BALANCES;
  const response = await apiClient.get<LeaveBalancesResponse>(url);
  return response.data;
};

/**
 * Submit a new leave request
 */
export const submitLeaveRequest = async (data: SubmitLeaveRequest): Promise<LeaveRequest> => {
  const response = await apiClient.post<LeaveRequest>(ENDPOINTS.EMPLOYEE.LEAVE.REQUESTS.CREATE, data);
  return response.data;
};

/**
 * Get my leave requests with optional filters
 */
export const getMyLeaveRequests = async (filters?: LeaveRequestFilters): Promise<LeaveRequestsResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.leave_type_code) queryParams.append('leave_type_code', filters.leave_type_code);
  if (filters?.from_date) queryParams.append('from_date', filters.from_date);
  if (filters?.to_date) queryParams.append('to_date', filters.to_date);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.EMPLOYEE.LEAVE.REQUESTS.LIST}?${queryString}`
    : ENDPOINTS.EMPLOYEE.LEAVE.REQUESTS.LIST;

  const response = await apiClient.get<LeaveRequestsResponse>(url);
  return response.data;
};

/**
 * Get a specific leave request by code
 */
export const getLeaveRequest = async (code: string): Promise<LeaveRequest> => {
  const response = await apiClient.get<LeaveRequest>(ENDPOINTS.EMPLOYEE.LEAVE.REQUESTS.GET(code));
  return response.data;
};

/**
 * Cancel a pending leave request
 */
export const cancelLeaveRequest = async (code: string): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(ENDPOINTS.EMPLOYEE.LEAVE.REQUESTS.CANCEL(code));
  return response.data;
};

// ============================================================================
// ATTENDANCE MANAGEMENT
// ============================================================================

/**
 * Get today's attendance status
 */
export const getTodayAttendance = async (): Promise<TodayAttendance> => {
  const response = await apiClient.get<TodayAttendance>(ENDPOINTS.EMPLOYEE.ATTENDANCE.TODAY);
  return response.data;
};

/**
 * Check in for the day
 */
export const checkIn = async (data?: CheckInOutRequest): Promise<TodayAttendance> => {
  const response = await apiClient.post<TodayAttendance>(ENDPOINTS.EMPLOYEE.ATTENDANCE.CHECK_IN, data || {});
  return response.data;
};

/**
 * Check out for the day
 */
export const checkOut = async (data?: CheckInOutRequest): Promise<TodayAttendance> => {
  const response = await apiClient.post<TodayAttendance>(ENDPOINTS.EMPLOYEE.ATTENDANCE.CHECK_OUT, data || {});
  return response.data;
};

/**
 * Get attendance records with optional filters
 */
export const getMyAttendance = async (filters?: AttendanceFilters): Promise<AttendanceRecordsResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.from_date) queryParams.append('from_date', filters.from_date);
  if (filters?.to_date) queryParams.append('to_date', filters.to_date);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.is_late !== undefined) queryParams.append('is_late', filters.is_late.toString());

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.EMPLOYEE.ATTENDANCE.LIST}?${queryString}`
    : ENDPOINTS.EMPLOYEE.ATTENDANCE.LIST;

  const response = await apiClient.get<AttendanceRecordsResponse>(url);
  return response.data;
};

/**
 * Get attendance summary for a specific month
 */
export const getAttendanceSummary = async (month: number, year: number): Promise<AttendanceSummary> => {
  const url = `${ENDPOINTS.EMPLOYEE.ATTENDANCE.SUMMARY}?month=${month}&year=${year}`;
  const response = await apiClient.get<AttendanceSummary>(url);
  return response.data;
};

// ============================================================================
// SESSIONS MANAGEMENT
// ============================================================================

/**
 * Get my login sessions with optional filters
 */
export const getMySessions = async (filters?: SessionFilters): Promise<SessionsResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.from_date) queryParams.append('from_date', filters.from_date);
  if (filters?.to_date) queryParams.append('to_date', filters.to_date);
  if (filters?.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ENDPOINTS.EMPLOYEE.SESSIONS.LIST}?${queryString}`
    : ENDPOINTS.EMPLOYEE.SESSIONS.LIST;

  const response = await apiClient.get<SessionsResponse>(url);
  return response.data;
};

/**
 * Get current active session
 */
export const getCurrentSession = async (): Promise<CurrentSession> => {
  const response = await apiClient.get<CurrentSession>(ENDPOINTS.EMPLOYEE.SESSIONS.CURRENT);
  return response.data;
};

/**
 * Get session summary for a specific month
 */
export const getSessionSummary = async (month: number, year: number): Promise<SessionSummary> => {
  const url = `${ENDPOINTS.EMPLOYEE.SESSIONS.SUMMARY}?month=${month}&year=${year}`;
  const response = await apiClient.get<SessionSummary>(url);
  return response.data;
};

// ============================================================================
// HOLIDAYS
// ============================================================================

/**
 * Get holidays for a specific year
 */
export const getHolidays = async (year?: number): Promise<HolidaysResponse> => {
  const currentYear = year || new Date().getFullYear();
  const url = `${ENDPOINTS.EMPLOYEE.HOLIDAYS}?year=${currentYear}`;
  const response = await apiClient.get<HolidaysResponse>(url);
  return response.data;
};

