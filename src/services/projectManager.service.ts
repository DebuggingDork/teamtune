import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  User,
  PaginationParams,
  ProjectsResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  TeamsResponse,
  Team,
  CreateTeamRequest,
  AssignTeamLeadRequest,
  RemoveTeamLeadRequest,
  AddTeamMembersRequest,
  AddTeamMembersResponse,
  TeamMembersResponse,
  ProjectHealthResponse,
  TeamPerformanceResponse,
} from '@/api/types';

/**
 * Get all employees
 */
export const getEmployees = async (params?: PaginationParams): Promise<{ employees: User[]; pagination: any }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `${ENDPOINTS.PROJECT_MANAGER.EMPLOYEES}?${queryString}` : ENDPOINTS.PROJECT_MANAGER.EMPLOYEES;
  
  const response = await apiClient.get<{ employees: User[]; pagination: any }>(url);
  return response.data;
};

/**
 * Get all projects
 */
export const getProjects = async (params?: PaginationParams): Promise<ProjectsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `${ENDPOINTS.PROJECT_MANAGER.PROJECTS.LIST}?${queryString}` : ENDPOINTS.PROJECT_MANAGER.PROJECTS.LIST;
  
  const response = await apiClient.get<ProjectsResponse>(url);
  return response.data;
};

/**
 * Create a new project
 */
export const createProject = async (data: CreateProjectRequest): Promise<Project> => {
  const response = await apiClient.post<Project>(ENDPOINTS.PROJECT_MANAGER.PROJECTS.CREATE, data);
  return response.data;
};

/**
 * Get project by code
 */
export const getProject = async (code: string): Promise<Project> => {
  const response = await apiClient.get<Project>(ENDPOINTS.PROJECT_MANAGER.PROJECTS.GET(code));
  return response.data;
};

/**
 * Update project
 */
export const updateProject = async (code: string, data: UpdateProjectRequest): Promise<Project> => {
  const response = await apiClient.put<Project>(ENDPOINTS.PROJECT_MANAGER.PROJECTS.UPDATE(code), data);
  return response.data;
};

/**
 * Get teams for a project
 */
export const getProjectTeams = async (code: string, params?: PaginationParams): Promise<TeamsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${ENDPOINTS.PROJECT_MANAGER.PROJECTS.TEAMS(code)}?${queryString}` 
    : ENDPOINTS.PROJECT_MANAGER.PROJECTS.TEAMS(code);
  
  const response = await apiClient.get<TeamsResponse>(url);
  return response.data;
};

/**
 * Create a team
 */
export const createTeam = async (projectCode: string, data: CreateTeamRequest): Promise<Team> => {
  const response = await apiClient.post<Team>(ENDPOINTS.PROJECT_MANAGER.TEAMS.CREATE(projectCode), data);
  return response.data;
};

/**
 * Assign team lead
 */
export const assignTeamLead = async (code: string, data: AssignTeamLeadRequest): Promise<Team> => {
  const response = await apiClient.put<Team>(ENDPOINTS.PROJECT_MANAGER.TEAMS.ASSIGN_LEAD(code), data);
  return response.data;
};

/**
 * Remove team lead
 */
export const removeTeamLead = async (code: string, data: RemoveTeamLeadRequest): Promise<Team> => {
  const response = await apiClient.delete<Team>(ENDPOINTS.PROJECT_MANAGER.TEAMS.REMOVE_LEAD(code), { data });
  return response.data;
};

/**
 * Add team members
 */
export const addTeamMembers = async (code: string, data: AddTeamMembersRequest): Promise<AddTeamMembersResponse> => {
  const response = await apiClient.post<AddTeamMembersResponse>(ENDPOINTS.PROJECT_MANAGER.TEAMS.ADD_MEMBERS(code), data);
  return response.data;
};

/**
 * Remove team member
 */
export const removeTeamMember = async (code: string, userId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.PROJECT_MANAGER.TEAMS.REMOVE_MEMBER(code, userId));
  return response.data;
};

/**
 * Get team members
 */
export const getTeamMembers = async (code: string, params?: PaginationParams): Promise<TeamMembersResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${ENDPOINTS.PROJECT_MANAGER.TEAMS.GET_MEMBERS(code)}?${queryString}` 
    : ENDPOINTS.PROJECT_MANAGER.TEAMS.GET_MEMBERS(code);
  
  const response = await apiClient.get<TeamMembersResponse>(url);
  return response.data;
};

/**
 * Get all project members
 */
export const getProjectMembers = async (code: string): Promise<any> => {
  const response = await apiClient.get(ENDPOINTS.PROJECT_MANAGER.PROJECTS.MEMBERS(code));
  return response.data;
};

/**
 * Get project health metrics
 */
export const getProjectHealth = async (code: string): Promise<ProjectHealthResponse> => {
  const response = await apiClient.get<ProjectHealthResponse>(ENDPOINTS.PROJECT_MANAGER.PROJECTS.HEALTH(code));
  return response.data;
};

/**
 * Get team performance
 */
export const getTeamPerformance = async (
  projectCode: string,
  teamCode: string,
  periodStart: string,
  periodEnd: string
): Promise<TeamPerformanceResponse> => {
  const url = `${ENDPOINTS.PROJECT_MANAGER.PROJECTS.PERFORMANCE(projectCode, teamCode)}?period_start=${periodStart}&period_end=${periodEnd}`;
  const response = await apiClient.get<TeamPerformanceResponse>(url);
  return response.data;
};

