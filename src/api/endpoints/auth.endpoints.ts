// ============================================================================
// AUTH ENDPOINTS - Authentication related endpoints
// ============================================================================

import { e } from './base.endpoints';

export const AUTH_ENDPOINTS = {
  REGISTER: e('/auth/register'),
  LOGIN: e('/auth/login'),
  LOGOUT: e('/auth/logout'),
  STATUS: e('/auth/status'),
} as const;
