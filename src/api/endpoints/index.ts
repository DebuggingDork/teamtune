// ============================================================================
// API ENDPOINTS - Central export file for all API endpoints
// ============================================================================

export * from './base.endpoints';
export { AUTH_ENDPOINTS } from './auth.endpoints';
export { ADMIN_ENDPOINTS } from './admin.endpoints';
export { PROJECT_MANAGER_ENDPOINTS } from './project-manager.endpoints';
export { TEAM_LEAD_ENDPOINTS } from './team-lead.endpoints';
export { EMPLOYEE_ENDPOINTS } from './employee.endpoints';
export { GITHUB_ENDPOINTS } from './github.endpoints';
export { NOTIFICATION_ENDPOINTS, createNotificationEndpoints } from './notifications.endpoints';

// Combined ENDPOINTS object for backward compatibility
import { AUTH_ENDPOINTS } from './auth.endpoints';
import { ADMIN_ENDPOINTS } from './admin.endpoints';
import { PROJECT_MANAGER_ENDPOINTS } from './project-manager.endpoints';
import { TEAM_LEAD_ENDPOINTS } from './team-lead.endpoints';
import { EMPLOYEE_ENDPOINTS } from './employee.endpoints';
import { GITHUB_ENDPOINTS } from './github.endpoints';
import { NOTIFICATION_ENDPOINTS } from './notifications.endpoints';

export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  PROJECT_MANAGER: PROJECT_MANAGER_ENDPOINTS,
  TEAM_LEAD: TEAM_LEAD_ENDPOINTS,
  EMPLOYEE: EMPLOYEE_ENDPOINTS,
  GITHUB: GITHUB_ENDPOINTS,
  NOTIFICATIONS: NOTIFICATION_ENDPOINTS,
} as const;
