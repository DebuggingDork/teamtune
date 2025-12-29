import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
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
} from '@/api/types';

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
  const url = `${ENDPOINTS.TEAM_LEAD.PERFORMANCE.MEMBER(teamCode, userCode)}?period_start=${filters.period_start}&period_end=${filters.period_end}`;
  const response = await apiClient.get<MemberPerformanceResponse>(url);
  return response.data;
};

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

