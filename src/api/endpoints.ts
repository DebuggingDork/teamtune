const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://upea.onrender.com';
const API_PREFIX = '/api';

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE}${API_PREFIX}/auth/register`,
    LOGIN: `${API_BASE}${API_PREFIX}/auth/login`,
    LOGOUT: `${API_BASE}${API_PREFIX}/auth/logout`,
    STATUS: `${API_BASE}${API_PREFIX}/auth/status`,
  },

  // Admin
  ADMIN: {
    USERS: {
      PENDING: `${API_BASE}${API_PREFIX}/admin/users/pending`,
      ALL: `${API_BASE}${API_PREFIX}/admin/users`,
      APPROVE: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/approve`,
      REJECT: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/reject`,
      PROMOTE_ADMIN: `${API_BASE}${API_PREFIX}/admin/users/promote-admin`,
    },
    PLUGINS: {
      LIST: `${API_BASE}${API_PREFIX}/admin/plugins`,
      CONNECT_GITHUB: `${API_BASE}${API_PREFIX}/admin/plugins/github/connect`,
      UPDATE: (pluginId: string) => `${API_BASE}${API_PREFIX}/admin/plugins/${pluginId}`,
      SYNC: (pluginId: string) => `${API_BASE}${API_PREFIX}/admin/plugins/${pluginId}/sync`,
    },
  },

  // Project Manager
  PROJECT_MANAGER: {
    EMPLOYEES: `${API_BASE}${API_PREFIX}/project-manager/employees`,
    PROJECTS: {
      LIST: `${API_BASE}${API_PREFIX}/project-manager/projects`,
      CREATE: `${API_BASE}${API_PREFIX}/project-manager/projects`,
      GET: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/projects/${code}`,
      UPDATE: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/projects/${code}`,
      TEAMS: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/projects/${code}/teams`,
      MEMBERS: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/projects/${code}/members`,
      HEALTH: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/projects/${code}/health`,
      PERFORMANCE: (projectCode: string, teamCode: string) =>
        `${API_BASE}${API_PREFIX}/project-manager/projects/${projectCode}/teams/${teamCode}/performance`,
    },
    TEAMS: {
      CREATE: (projectCode: string) => `${API_BASE}${API_PREFIX}/project-manager/projects/${projectCode}/teams`,
      ASSIGN_LEAD: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/teams/${code}/lead`,
      REMOVE_LEAD: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/teams/${code}/lead`,
      ADD_MEMBERS: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/teams/${code}/members`,
      REMOVE_MEMBER: (code: string, userId: string) =>
        `${API_BASE}${API_PREFIX}/project-manager/teams/${code}/members/${userId}`,
      GET_MEMBERS: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/teams/${code}/members`,
    },
  },

  // Team Lead
  TEAM_LEAD: {
    TASKS: {
      CREATE: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/tasks`,
      LIST: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/tasks`,
      GET: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}`,
      UPDATE: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}`,
      DELETE: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}`,
      ASSIGN: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}/assign`,
      UPDATE_STATUS: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}/status`,
    },
    OBSERVATIONS: {
      CREATE: (teamCode: string, userCode: string) =>
        `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/members/${userCode}/observations`,
      LIST: (teamCode: string, userCode: string) =>
        `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/members/${userCode}/observations`,
      GET: (observationCode: string) => `${API_BASE}${API_PREFIX}/team-lead/observations/${observationCode}`,
      UPDATE: (observationCode: string) => `${API_BASE}${API_PREFIX}/team-lead/observations/${observationCode}`,
      DELETE: (observationCode: string) => `${API_BASE}${API_PREFIX}/team-lead/observations/${observationCode}`,
    },
    PERFORMANCE: {
      TEAM: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/performance`,
      MEMBER: (teamCode: string, userCode: string) =>
        `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/members/${userCode}/performance`,
    },
    METRICS: {
      TEAM: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/metrics`,
    },
    GITHUB: {
      LINK_REPOSITORY: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/github/repository`,
      GIT_ACTIVITY: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/git-activity`,
      MEMBER_GIT_ACTIVITY: (teamCode: string, userCode: string) =>
        `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/members/${userCode}/git-activity`,
    },
  },

  // Employee
  EMPLOYEE: {
    TASKS: {
      LIST: `${API_BASE}${API_PREFIX}/employee/tasks`,
      GET: (taskCode: string) => `${API_BASE}${API_PREFIX}/employee/tasks/${taskCode}`,
      UPDATE_STATUS: (taskCode: string) => `${API_BASE}${API_PREFIX}/employee/tasks/${taskCode}/status`,
    },
    TIME_ENTRIES: {
      CREATE: `${API_BASE}${API_PREFIX}/employee/time-entries`,
      LIST: `${API_BASE}${API_PREFIX}/employee/time-entries`,
      GET: (timeCode: string) => `${API_BASE}${API_PREFIX}/employee/time-entries/${timeCode}`,
      UPDATE: (timeCode: string) => `${API_BASE}${API_PREFIX}/employee/time-entries/${timeCode}`,
      DELETE: (timeCode: string) => `${API_BASE}${API_PREFIX}/employee/time-entries/${timeCode}`,
    },
    PROFILE: {
      GET: `${API_BASE}${API_PREFIX}/employee/profile`,
      UPDATE: `${API_BASE}${API_PREFIX}/employee/profile`,
    },
    TEAMS: `${API_BASE}${API_PREFIX}/employee/teams`,
    PROJECTS: `${API_BASE}${API_PREFIX}/employee/projects`,
    PERFORMANCE: `${API_BASE}${API_PREFIX}/employee/performance`,
    OBSERVATIONS: `${API_BASE}${API_PREFIX}/employee/observations`,
    METRICS: `${API_BASE}${API_PREFIX}/employee/metrics`,
    GITHUB: {
      CONNECT: `${API_BASE}${API_PREFIX}/employee/github/connect`,
      DISCONNECT: `${API_BASE}${API_PREFIX}/employee/github/disconnect`,
      STATUS: `${API_BASE}${API_PREFIX}/employee/github/status`,
    },
    GIT_ACTIVITY: `${API_BASE}${API_PREFIX}/employee/git-activity`,
  },

  // GitHub OAuth
  GITHUB: {
    OAUTH_CALLBACK: `${API_BASE}${API_PREFIX}/github/oauth/callback`,
  },
} as const;

