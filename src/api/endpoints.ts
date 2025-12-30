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
      BLOCK: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/block`,
      UNBLOCK: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/unblock`,
      PROMOTE_ADMIN: `${API_BASE}${API_PREFIX}/admin/users/promote-admin`,
      BULK_APPROVE: `${API_BASE}${API_PREFIX}/admin/users/bulk-approve`,
      BULK_REJECT: `${API_BASE}${API_PREFIX}/admin/users/bulk-reject`,
      DELETE: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}`,
      BULK_DELETE: `${API_BASE}${API_PREFIX}/admin/users/bulk-delete`,
      DEMOTE_PM: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/demote-pm`,
      DEMOTE_TL: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/demote-tl`,
      MANAGED_PROJECTS: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/managed-projects`,
      LED_TEAMS: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/led-teams`,
      PROMOTE_PM: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/promote-pm`,
      PROMOTE_TL: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/promote-tl`,
      CHANGE_ROLE: (id: string) => `${API_BASE}${API_PREFIX}/admin/users/${id}/role`,
    },
    ROLES: {
      STATS: `${API_BASE}${API_PREFIX}/admin/roles/stats`,
      USERS: (role: string) => `${API_BASE}${API_PREFIX}/admin/roles/${role}/users`,
    },
    PLUGINS: {
      LIST: `${API_BASE}${API_PREFIX}/admin/plugins`,
      CONNECT_GITHUB: `${API_BASE}${API_PREFIX}/admin/plugins/github/connect`,
      UPDATE: (pluginId: string) => `${API_BASE}${API_PREFIX}/admin/plugins/${pluginId}`,
      SYNC: (pluginId: string) => `${API_BASE}${API_PREFIX}/admin/plugins/${pluginId}/sync`,
    },
    PROFILE: {
      GET: `${API_BASE}${API_PREFIX}/admin/profile`,
      UPDATE: `${API_BASE}${API_PREFIX}/admin/profile`,
    },
    PROJECTS: {
      LIST: `${API_BASE}${API_PREFIX}/admin/projects`,
      GET: (projectId: string) => `${API_BASE}${API_PREFIX}/admin/projects/${projectId}`,
      STATS: `${API_BASE}${API_PREFIX}/admin/projects/stats`,
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
      UPDATE_STATUS: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/projects/${code}/status`,
      DELETE: (code: string) => `${API_BASE}${API_PREFIX}/project-manager/projects/${code}`,
      BULK_DELETE: `${API_BASE}${API_PREFIX}/project-manager/projects/bulk`,
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
    // Team Management
    MY_TEAMS: `${API_BASE}${API_PREFIX}/team-lead/my-teams`,
    TEAM_INFO: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}`,

    // Dashboard
    DASHBOARD: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/dashboard`,

    // Sprint Management
    SPRINTS: {
      CREATE: `${API_BASE}${API_PREFIX}/team-lead/sprints`,
      DASHBOARD: (sprintCode: string) => `${API_BASE}${API_PREFIX}/team-lead/sprints/${sprintCode}/dashboard`,
    },

    // Task Management
    TASKS: {
      CREATE: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/tasks`,
      LIST: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/tasks`,
      GET: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}`,
      UPDATE: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}`,
      DELETE: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}`,
      ASSIGN: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}/assign`,
      UPDATE_STATUS: (taskCode: string) => `${API_BASE}${API_PREFIX}/team-lead/tasks/${taskCode}/status`,
    },

    // Workload & Resource Management
    WORKLOAD: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/workload`,
    CAPACITY_PLANS: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/capacity-plans`,
    SKILL_GAP_ANALYSIS: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/skill-gap-analysis`,

    // Performance Management
    PERFORMANCE: {
      TEAM: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/performance`,
      MEMBER: (userCode: string) => `${API_BASE}${API_PREFIX}/team-lead/members/${userCode}/performance`,
      GOALS: {
        CREATE: (userCode: string) => `${API_BASE}${API_PREFIX}/team-lead/members/${userCode}/goals`,
        LIST: (userCode: string) => `${API_BASE}${API_PREFIX}/team-lead/members/${userCode}/goals`,
      },
      FEEDBACK: {
        CREATE: (userCode: string) => `${API_BASE}${API_PREFIX}/team-lead/members/${userCode}/feedback-requests`,
        LIST: (userCode: string) => `${API_BASE}${API_PREFIX}/team-lead/members/${userCode}/feedback-requests`,
      },
    },

    // Observations
    OBSERVATIONS: {
      CREATE: (teamCode: string, userCode: string) =>
        `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/members/${userCode}/observations`,
      LIST: (teamCode: string, userCode: string) =>
        `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/members/${userCode}/observations`,
      GET: (observationCode: string) => `${API_BASE}${API_PREFIX}/team-lead/observations/${observationCode}`,
      UPDATE: (observationCode: string) => `${API_BASE}${API_PREFIX}/team-lead/observations/${observationCode}`,
      DELETE: (observationCode: string) => `${API_BASE}${API_PREFIX}/team-lead/observations/${observationCode}`,
    },

    // Communication
    ANNOUNCEMENTS: {
      CREATE: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/announcements`,
      LIST: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/announcements`,
    },
    ONE_ON_ONES: {
      CREATE: (userCode: string) => `${API_BASE}${API_PREFIX}/team-lead/members/${userCode}/one-on-ones`,
      LIST: (userCode: string) => `${API_BASE}${API_PREFIX}/team-lead/members/${userCode}/one-on-ones`,
    },
    DECISIONS: {
      CREATE: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/decisions`,
      LIST: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/decisions`,
    },

    // Monitoring & Alerts
    MONITORING_RULES: {
      CREATE: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/monitoring-rules`,
      LIST: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/monitoring-rules`,
    },
    ALERTS: {
      LIST: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/alerts`,
      ACKNOWLEDGE: (alertCode: string) => `${API_BASE}${API_PREFIX}/team-lead/alerts/${alertCode}/acknowledge`,
      RESOLVE: (alertCode: string) => `${API_BASE}${API_PREFIX}/team-lead/alerts/${alertCode}/resolve`,
    },

    // Risk Management
    RISKS: {
      CREATE: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/risks`,
      LIST: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/risks`,
    },

    // Performance Flags
    FLAGS: {
      CREATE: (userCode: string) => `${API_BASE}${API_PREFIX}/team-lead/members/${userCode}/flags`,
      LIST: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/flags`,
    },

    // Task Templates
    TASK_TEMPLATES: {
      CREATE: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/task-templates`,
      LIST: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/task-templates`,
    },

    // Metrics
    METRICS: {
      TEAM: (teamCode: string) => `${API_BASE}${API_PREFIX}/team-lead/teams/${teamCode}/metrics`,
    },

    // GitHub Integration
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
    // NOTE: This endpoint should ONLY be used by employees, never in admin dashboard or other roles
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

