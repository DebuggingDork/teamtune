// ============================================================================
// EMPLOYEE ENDPOINTS - Employee related endpoints
// ============================================================================

import { e } from './base.endpoints';

export const EMPLOYEE_ENDPOINTS = {
  TASKS: {
    LIST: e('/employee/tasks'),
    GET: (taskCode: string) => e(`/employee/tasks/${taskCode}`),
    UPDATE_STATUS: (taskCode: string) => e(`/employee/tasks/${taskCode}/status`),
  },

  TIME_ENTRIES: {
    CREATE: e('/employee/time-entries'),
    LIST: e('/employee/time-entries'),
    GET: (timeCode: string) => e(`/employee/time-entries/${timeCode}`),
    UPDATE: (timeCode: string) => e(`/employee/time-entries/${timeCode}`),
    DELETE: (timeCode: string) => e(`/employee/time-entries/${timeCode}`),
  },

  PROFILE: {
    GET: e('/employee/profile'),
    UPDATE: e('/employee/profile'),
  },

  // NOTE: This endpoint should ONLY be used by employees, never in admin dashboard or other roles
  TEAMS: e('/employee/teams'),
  PROJECTS: e('/employee/projects'),
  PERFORMANCE: e('/employee/performance'),
  OBSERVATIONS: e('/employee/observations'),
  METRICS: e('/employee/metrics'),

  GITHUB: {
    CONNECT: e('/employee/github/connect'),
    DISCONNECT: e('/employee/github/disconnect'),
    STATUS: e('/employee/github/status'),
    REPOSITORIES: e('/employee/github/repositories'),
    REPO_BRANCHES: (repoId: string) => e(`/employee/github/repositories/${repoId}/branches`),
    MY_BRANCHES: e('/employee/github/my-branches'),
    PULL_REQUESTS: e('/employee/github/pull-requests'),
    REPO_PULL_REQUESTS: (repoId: string) =>
      e(`/employee/github/repositories/${repoId}/pull-requests`),
    PULL_REQUEST_DETAILS: (prId: string) => e(`/employee/github/pull-requests/${prId}`),
    REQUEST_REVIEW: (prId: string) => e(`/employee/github/pull-requests/${prId}/request-review`),
  },

  GIT_ACTIVITY: e('/employee/git-activity'),

  // Leave Management
  LEAVE: {
    TYPES: e('/employee/leave/types'),
    BALANCES: e('/employee/leave/balances'),
    BALANCES_BY_YEAR: (year: number) => e(`/employee/leave/balances/${year}`),
    REQUESTS: {
      LIST: e('/employee/leave/requests'),
      CREATE: e('/employee/leave/requests'),
      GET: (code: string) => e(`/employee/leave/requests/${code}`),
      CANCEL: (code: string) => e(`/employee/leave/requests/${code}/cancel`),
    },
  },

  // Attendance
  ATTENDANCE: {
    TODAY: e('/employee/attendance/today'),
    CHECK_IN: e('/employee/attendance/check-in'),
    CHECK_OUT: e('/employee/attendance/check-out'),
    LIST: e('/employee/attendance'),
    SUMMARY: e('/employee/attendance/summary'),
  },

  // Sessions
  SESSIONS: {
    LIST: e('/employee/sessions'),
    CURRENT: e('/employee/sessions/current'),
    SUMMARY: e('/employee/sessions/summary'),
  },

  // Holidays
  HOLIDAYS: e('/employee/holidays'),
} as const;
