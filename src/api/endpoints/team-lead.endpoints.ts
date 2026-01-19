// ============================================================================
// TEAM LEAD ENDPOINTS - Team lead related endpoints
// ============================================================================

import { e } from './base.endpoints';

export const TEAM_LEAD_ENDPOINTS = {
  // Profile
  PROFILE: {
    GET: e('/team-lead/profile'),
    UPDATE: e('/team-lead/profile'),
  },

  // Team Management
  MY_TEAMS: e('/team-lead/my-teams'),
  TEAM_INFO: (teamCode: string) => e(`/team-lead/teams/${teamCode}`),

  // Dashboard
  DASHBOARD: (teamCode: string) => e(`/team-lead/teams/${teamCode}/dashboard`),

  // Sprint Management
  SPRINTS: {
    CREATE: e('/team-lead/sprints'),
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/sprints`),
    GET: (sprintCode: string) => e(`/team-lead/sprints/${sprintCode}`),
    UPDATE: (sprintCode: string) => e(`/team-lead/sprints/${sprintCode}`),
    CLOSE: (sprintCode: string) => e(`/team-lead/sprints/${sprintCode}/close`),
    DASHBOARD: (sprintCode: string) => e(`/team-lead/sprints/${sprintCode}/dashboard`),
  },

  // Team Member Management
  TEAM_MEMBERS: {
    AVAILABLE: (teamCode: string) => e(`/team-lead/teams/${teamCode}/available-members`),
    ADD: (teamCode: string) => e(`/team-lead/teams/${teamCode}/members`),
    REMOVE: (teamCode: string, userCode: string) =>
      e(`/team-lead/teams/${teamCode}/members/${userCode}`),
    UPDATE: (teamCode: string, userCode: string) =>
      e(`/team-lead/teams/${teamCode}/members/${userCode}`),
  },

  // Time Entry Approval
  TIME_ENTRIES: {
    LIST_PENDING: (teamCode: string) => e(`/team-lead/teams/${teamCode}/time-entries`),
    MEMBER_PENDING: (teamCode: string, userCode: string) =>
      e(`/team-lead/teams/${teamCode}/members/${userCode}/time-entries`),
    APPROVE: (teamCode: string, timeCode: string) =>
      e(`/team-lead/teams/${teamCode}/time-entries/${timeCode}/approve`),
    REJECT: (teamCode: string, timeCode: string) =>
      e(`/team-lead/teams/${teamCode}/time-entries/${timeCode}/reject`),
    BULK_APPROVE: (teamCode: string) =>
      e(`/team-lead/teams/${teamCode}/time-entries/bulk-approve`),
  },

  // Task Management
  TASKS: {
    CREATE: (teamCode: string) => e(`/team-lead/teams/${teamCode}/tasks`),
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/tasks`),
    GET: (taskCode: string) => e(`/team-lead/tasks/${taskCode}`),
    UPDATE: (taskCode: string) => e(`/team-lead/tasks/${taskCode}`),
    DELETE: (taskCode: string) => e(`/team-lead/tasks/${taskCode}`),
    ASSIGN: (taskCode: string) => e(`/team-lead/tasks/${taskCode}/assign`),
    UPDATE_STATUS: (taskCode: string) => e(`/team-lead/tasks/${taskCode}/status`),
  },

  // Workload & Resource Management
  WORKLOAD: (teamCode: string) => e(`/team-lead/teams/${teamCode}/workload`),
  CAPACITY_PLANS: (teamCode: string) => e(`/team-lead/teams/${teamCode}/capacity-plans`),
  SKILL_GAP_ANALYSIS: (teamCode: string) => e(`/team-lead/teams/${teamCode}/skill-gap-analysis`),

  // Performance Management
  PERFORMANCE: {
    TEAM: (teamCode: string) => e(`/team-lead/teams/${teamCode}/performance`),
    MEMBER: (userCode: string) => e(`/team-lead/members/${userCode}/performance`),
    GOALS: {
      CREATE: (userCode: string) => e(`/team-lead/members/${userCode}/goals`),
      LIST: (userCode: string) => e(`/team-lead/members/${userCode}/goals`),
    },
    FEEDBACK: {
      CREATE: (userCode: string) => e(`/team-lead/members/${userCode}/feedback-requests`),
      LIST: (userCode: string) => e(`/team-lead/members/${userCode}/feedback-requests`),
    },
  },

  // Observations
  OBSERVATIONS: {
    CREATE: (teamCode: string, userCode: string) =>
      e(`/team-lead/teams/${teamCode}/members/${userCode}/observations`),
    LIST: (teamCode: string, userCode: string) =>
      e(`/team-lead/teams/${teamCode}/members/${userCode}/observations`),
    LIST_ALL_TEAM: (teamCode: string) => e(`/team-lead/teams/${teamCode}/observations`),
    GET: (observationCode: string) => e(`/team-lead/observations/${observationCode}`),
    UPDATE: (observationCode: string) => e(`/team-lead/observations/${observationCode}`),
    DELETE: (observationCode: string) => e(`/team-lead/observations/${observationCode}`),
  },

  // Feedback Requests (360-Degree Feedback)
  FEEDBACK_REQUESTS: {
    CREATE: (userCode: string) => e(`/team-lead/members/${userCode}/feedback-requests`),
    LIST_ALL: e('/team-lead/feedback-requests'),
    LIST_BY_TEAM: (teamCode: string) => e(`/team-lead/teams/${teamCode}/feedback-requests`),
    GET: (requestCode: string) => e(`/team-lead/feedback-requests/${requestCode}`),
    UPDATE: (requestCode: string) => e(`/team-lead/feedback-requests/${requestCode}`),
    DELETE: (requestCode: string) => e(`/team-lead/feedback-requests/${requestCode}`),
    GET_RESPONSES: (requestCode: string) =>
      e(`/team-lead/feedback-requests/${requestCode}/responses`),
    GET_SUMMARY: (requestCode: string) =>
      e(`/team-lead/feedback-requests/${requestCode}/summary`),
  },

  // Communication
  ANNOUNCEMENTS: {
    CREATE: (teamCode: string) => e(`/team-lead/teams/${teamCode}/announcements`),
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/announcements`),
  },
  ONE_ON_ONES: {
    CREATE: (userCode: string) => e(`/team-lead/members/${userCode}/one-on-ones`),
    LIST: (userCode: string) => e(`/team-lead/members/${userCode}/one-on-ones`),
  },
  DECISIONS: {
    CREATE: (teamCode: string) => e(`/team-lead/teams/${teamCode}/decisions`),
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/decisions`),
  },

  // Monitoring & Alerts
  MONITORING_RULES: {
    CREATE: (teamCode: string) => e(`/team-lead/teams/${teamCode}/monitoring-rules`),
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/monitoring-rules`),
  },
  ALERTS: {
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/alerts`),
    ACKNOWLEDGE: (alertCode: string) => e(`/team-lead/alerts/${alertCode}/acknowledge`),
    RESOLVE: (alertCode: string) => e(`/team-lead/alerts/${alertCode}/resolve`),
  },

  // Risk Management
  RISKS: {
    CREATE: (teamCode: string) => e(`/team-lead/teams/${teamCode}/risks`),
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/risks`),
  },

  // Performance Flags
  FLAGS: {
    CREATE: (userCode: string) => e(`/team-lead/members/${userCode}/flags`),
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/flags`),
  },

  // Task Templates
  TASK_TEMPLATES: {
    CREATE: (teamCode: string) => e(`/team-lead/teams/${teamCode}/task-templates`),
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/task-templates`),
  },

  // Metrics
  METRICS: {
    TEAM: (teamCode: string) => e(`/team-lead/teams/${teamCode}/metrics`),
  },

  // GitHub Integration
  GITHUB: {
    CONNECT: e('/team-lead/github/connect'),
    DISCONNECT: e('/team-lead/github/disconnect'),
    STATUS: e('/team-lead/github/status'),
    LINK_REPOSITORY: (teamCode: string) => e(`/team-lead/teams/${teamCode}/github/repository`),
    REPOSITORY: (teamCode: string) => e(`/team-lead/teams/${teamCode}/github/repository`),
    COLLABORATORS: (teamCode: string) => e(`/team-lead/teams/${teamCode}/github/collaborators`),
    REMOVE_COLLABORATOR: (teamCode: string, userCode: string) =>
      e(`/team-lead/teams/${teamCode}/github/collaborators/${userCode}`),
    PULL_REQUESTS: (teamCode: string) => e(`/team-lead/teams/${teamCode}/github/pull-requests`),
    PULL_REQUEST_DETAILS: (teamCode: string, prNumber: number) =>
      e(`/team-lead/teams/${teamCode}/github/pull-requests/${prNumber}`),
    SUBMIT_REVIEW: (teamCode: string, prNumber: number) =>
      e(`/team-lead/teams/${teamCode}/github/pull-requests/${prNumber}/review`),
    MERGE_PR: (teamCode: string, prNumber: number) =>
      e(`/team-lead/teams/${teamCode}/github/pull-requests/${prNumber}/merge`),
    GIT_ACTIVITY: (teamCode: string) => e(`/team-lead/teams/${teamCode}/git-activity`),
    MEMBER_GIT_ACTIVITY: (teamCode: string, userCode: string) =>
      e(`/team-lead/teams/${teamCode}/members/${userCode}/git-activity`),
  },

  // Leave Management
  LEAVE: {
    REQUESTS: (teamCode: string) => e(`/team-lead/teams/${teamCode}/leave/requests`),
    PENDING: (teamCode: string) => e(`/team-lead/teams/${teamCode}/leave/requests/pending`),
    APPROVE: (teamCode: string, code: string) =>
      e(`/team-lead/teams/${teamCode}/leave/requests/${code}/approve`),
    REJECT: (teamCode: string, code: string) =>
      e(`/team-lead/teams/${teamCode}/leave/requests/${code}/reject`),
    CALENDAR: (teamCode: string) => e(`/team-lead/teams/${teamCode}/leave/calendar`),
  },

  // Team Attendance
  ATTENDANCE: {
    TODAY: (teamCode: string) => e(`/team-lead/teams/${teamCode}/attendance/today`),
    LIST: (teamCode: string) => e(`/team-lead/teams/${teamCode}/attendance`),
  },

  // Team Sessions
  SESSIONS: {
    ACTIVE: (teamCode: string) => e(`/team-lead/teams/${teamCode}/sessions/active`),
  },
} as const;
