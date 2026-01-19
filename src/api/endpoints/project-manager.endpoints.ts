// ============================================================================
// PROJECT MANAGER ENDPOINTS - Project manager related endpoints
// ============================================================================

import { e } from './base.endpoints';

export const PROJECT_MANAGER_ENDPOINTS = {
  EMPLOYEES: e('/project-manager/employees'),

  PROFILE: {
    GET: e('/project-manager/profile'),
    UPDATE: e('/project-manager/profile'),
  },

  PROJECTS: {
    LIST: e('/project-manager/projects'),
    CREATE: e('/project-manager/projects'),
    GET: (code: string) => e(`/project-manager/projects/${code}`),
    UPDATE: (code: string) => e(`/project-manager/projects/${code}`),
    UPDATE_STATUS: (code: string) => e(`/project-manager/projects/${code}/status`),
    DELETE: (code: string) => e(`/project-manager/projects/${code}`),
    BULK_DELETE: e('/project-manager/projects/bulk'),
    TEAMS: (code: string) => e(`/project-manager/projects/${code}/teams`),
    MEMBERS: (code: string) => e(`/project-manager/projects/${code}/members`),
    HEALTH: (code: string) => e(`/project-manager/projects/${code}/health`),
    PERFORMANCE: (projectCode: string, teamCode: string) =>
      e(`/project-manager/projects/${projectCode}/teams/${teamCode}/performance`),
  },

  TEAMS: {
    CREATE: (projectCode: string) => e(`/project-manager/projects/${projectCode}/teams`),
    ASSIGN_LEAD: (code: string) => e(`/project-manager/teams/${code}/lead`),
    REMOVE_LEAD: (code: string) => e(`/project-manager/teams/${code}/lead`),
    ADD_MEMBERS: (code: string) => e(`/project-manager/teams/${code}/members`),
    REMOVE_MEMBER: (code: string, userId: string) =>
      e(`/project-manager/teams/${code}/members/${userId}`),
    GET_MEMBERS: (code: string) => e(`/project-manager/teams/${code}/members`),
  },
} as const;
