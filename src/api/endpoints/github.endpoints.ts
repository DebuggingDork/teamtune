// ============================================================================
// GITHUB ENDPOINTS - GitHub OAuth related endpoints
// ============================================================================

import { e } from './base.endpoints';

export const GITHUB_ENDPOINTS = {
  OAUTH_CALLBACK: e('/github/oauth/callback'),
} as const;
