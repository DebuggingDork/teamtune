// ============================================================================
// ADMIN ENDPOINTS - Admin related endpoints
// ============================================================================

import { e } from './base.endpoints';

export const ADMIN_ENDPOINTS = {
  USERS: {
    PENDING: e('/admin/users/pending'),
    ALL: e('/admin/users'),
    APPROVE: (id: string) => e(`/admin/users/${id}/approve`),
    REJECT: (id: string) => e(`/admin/users/${id}/reject`),
    BLOCK: (id: string) => e(`/admin/users/${id}/block`),
    UNBLOCK: (id: string) => e(`/admin/users/${id}/unblock`),
    PROMOTE_ADMIN: e('/admin/users/promote-admin'),
    BULK_APPROVE: e('/admin/users/bulk-approve'),
    BULK_REJECT: e('/admin/users/bulk-reject'),
    DELETE: (id: string) => e(`/admin/users/${id}`),
    BULK_DELETE: e('/admin/users/bulk-delete'),
    DEMOTE_PM: (id: string) => e(`/admin/users/${id}/demote-pm`),
    DEMOTE_TL: (id: string) => e(`/admin/users/${id}/demote-tl`),
    MANAGED_PROJECTS: (id: string) => e(`/admin/users/${id}/managed-projects`),
    LED_TEAMS: (id: string) => e(`/admin/users/${id}/led-teams`),
    PROMOTE_PM: (id: string) => e(`/admin/users/${id}/promote-pm`),
    PROMOTE_TL: (id: string) => e(`/admin/users/${id}/promote-tl`),
    CHANGE_ROLE: (id: string) => e(`/admin/users/${id}/role`),
  },

  ROLES: {
    STATS: e('/admin/roles/stats'),
    USERS: (role: string) => e(`/admin/roles/${role}/users`),
  },

  PLUGINS: {
    LIST: e('/admin/plugins'),
    CONNECT_GITHUB: e('/admin/plugins/github/connect'),
    DISCONNECT_GITHUB: e('/admin/plugins/github/disconnect'),
    UPDATE: (pluginId: string) => e(`/admin/plugins/${pluginId}`),
    SYNC: (pluginId: string) => e(`/admin/plugins/${pluginId}/sync`),
  },

  PROFILE: {
    GET: e('/admin/profile'),
    UPDATE: e('/admin/profile'),
  },

  PROJECTS: {
    LIST: e('/admin/projects'),
    GET: (projectId: string) => e(`/admin/projects/${projectId}`),
    STATS: e('/admin/projects/stats'),
  },

  // Leave Types Management
  LEAVE_TYPES: {
    LIST: e('/admin/leave-types'),
    CREATE: e('/admin/leave-types'),
    UPDATE: (id: string) => e(`/admin/leave-types/${id}`),
    DELETE: (id: string) => e(`/admin/leave-types/${id}`),
  },

  // Leave Balance Management
  LEAVE_BALANCES: {
    LIST: e('/admin/leave/balances'),
    INITIALIZE: e('/admin/leave/balances/initialize'),
    ADJUST: (userId: string) => e(`/admin/leave/balances/${userId}`),
  },

  // Holiday Management
  HOLIDAYS: {
    LIST: e('/admin/holidays'),
    CREATE: e('/admin/holidays'),
    DELETE: (id: string) => e(`/admin/holidays/${id}`),
  },

  // Attendance & Leave Reports
  REPORTS: {
    ATTENDANCE: e('/admin/attendance/report'),
    LEAVE: e('/admin/leave/report'),
  },
} as const;
