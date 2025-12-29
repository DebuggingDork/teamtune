import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectManagerService from '@/services/projectManager.service';
import type {
  PaginationParams,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTeamRequest,
  AssignTeamLeadRequest,
  RemoveTeamLeadRequest,
  AddTeamMembersRequest,
  PerformanceFilters,
} from '@/api/types';
import { handleError } from '@/utils/errorHandler';

// Query Keys
export const projectManagerKeys = {
  all: ['project-manager'] as const,
  employees: {
    all: ['project-manager', 'employees'] as const,
    list: (params?: PaginationParams) => ['project-manager', 'employees', params] as const,
  },
  projects: {
    all: ['project-manager', 'projects'] as const,
    list: (params?: PaginationParams) => ['project-manager', 'projects', 'list', params] as const,
    detail: (code: string) => ['project-manager', 'projects', code] as const,
    teams: (code: string, params?: PaginationParams) =>
      ['project-manager', 'projects', code, 'teams', params] as const,
    members: (code: string) => ['project-manager', 'projects', code, 'members'] as const,
    health: (code: string) => ['project-manager', 'projects', code, 'health'] as const,
    performance: (projectCode: string, teamCode: string, filters: PerformanceFilters) =>
      ['project-manager', 'projects', projectCode, 'teams', teamCode, 'performance', filters] as const,
  },
  teams: {
    all: ['project-manager', 'teams'] as const,
    members: (code: string, params?: PaginationParams) =>
      ['project-manager', 'teams', code, 'members', params] as const,
  },
};

/**
 * Get employees
 */
export const useEmployees = (params?: PaginationParams) => {
  return useQuery({
    queryKey: projectManagerKeys.employees.list(params),
    queryFn: () => projectManagerService.getEmployees(params),
    staleTime: 30000,
  });
};

/**
 * Get projects
 */
export const useProjects = (params?: PaginationParams) => {
  return useQuery({
    queryKey: projectManagerKeys.projects.list(params),
    queryFn: () => projectManagerService.getProjects(params),
    staleTime: 30000,
  });
};

/**
 * Get project by code
 */
export const useProject = (code: string) => {
  return useQuery({
    queryKey: projectManagerKeys.projects.detail(code),
    queryFn: () => projectManagerService.getProject(code),
    enabled: !!code,
    staleTime: 30000,
  });
};

/**
 * Create project mutation
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectManagerService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.projects.all });
    },
    onError: handleError,
  });
};

/**
 * Update project mutation
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateProjectRequest }) =>
      projectManagerService.updateProject(code, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.projects.detail(variables.code) });
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.projects.all });
    },
    onError: handleError,
  });
};

/**
 * Get project teams
 */
export const useProjectTeams = (code: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: projectManagerKeys.projects.teams(code, params),
    queryFn: () => projectManagerService.getProjectTeams(code, params),
    enabled: !!code,
    staleTime: 30000,
  });
};

/**
 * Create team mutation
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectCode, data }: { projectCode: string; data: CreateTeamRequest }) =>
      projectManagerService.createTeam(projectCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.projects.teams(variables.projectCode) });
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.teams.all });
    },
    onError: handleError,
  });
};

/**
 * Assign team lead mutation
 */
export const useAssignTeamLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: AssignTeamLeadRequest }) =>
      projectManagerService.assignTeamLead(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.projects.all });
    },
    onError: handleError,
  });
};

/**
 * Remove team lead mutation
 */
export const useRemoveTeamLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: RemoveTeamLeadRequest }) =>
      projectManagerService.removeTeamLead(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.projects.all });
    },
    onError: handleError,
  });
};

/**
 * Add team members mutation
 */
export const useAddTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: AddTeamMembersRequest }) =>
      projectManagerService.addTeamMembers(code, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.teams.members(variables.code) });
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.projects.all });
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
    mutationFn: ({ code, userId }: { code: string; userId: string }) =>
      projectManagerService.removeTeamMember(code, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.teams.members(variables.code) });
      queryClient.invalidateQueries({ queryKey: projectManagerKeys.projects.all });
    },
    onError: handleError,
  });
};

/**
 * Get team members
 */
export const useTeamMembers = (code: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: projectManagerKeys.teams.members(code, params),
    queryFn: () => projectManagerService.getTeamMembers(code, params),
    enabled: !!code,
    staleTime: 30000,
  });
};

/**
 * Get project members
 */
export const useProjectMembers = (code: string) => {
  return useQuery({
    queryKey: projectManagerKeys.projects.members(code),
    queryFn: () => projectManagerService.getProjectMembers(code),
    enabled: !!code,
    staleTime: 30000,
  });
};

/**
 * Get project health
 */
export const useProjectHealth = (code: string) => {
  return useQuery({
    queryKey: projectManagerKeys.projects.health(code),
    queryFn: () => projectManagerService.getProjectHealth(code),
    enabled: !!code,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Get team performance
 */
export const useTeamPerformance = (projectCode: string, teamCode: string, filters: PerformanceFilters) => {
  return useQuery({
    queryKey: projectManagerKeys.projects.performance(projectCode, teamCode, filters),
    queryFn: () => projectManagerService.getTeamPerformance(projectCode, teamCode, filters.period_start, filters.period_end),
    enabled: !!projectCode && !!teamCode && !!filters.period_start && !!filters.period_end,
    staleTime: 60000,
  });
};

