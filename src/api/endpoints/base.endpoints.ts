// ============================================================================
// BASE ENDPOINTS - API base configuration and helper functions
// ============================================================================

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://upea.onrender.com';
export const API_PREFIX = '/api';

/**
 * Helper function to create endpoint URLs
 * @param path - The API path (e.g., '/auth/login')
 * @returns The full endpoint URL
 */
export const createEndpoint = (path: string): string => `${API_BASE}${API_PREFIX}${path}`;

/**
 * Helper function to create parameterized endpoint URLs
 * @param path - The API path template (e.g., '/users/:id')
 * @returns A function that takes the parameter and returns the full URL
 */
export const createParamEndpoint = <T extends string>(
  pathFn: (param: T) => string
): ((param: T) => string) => {
  return (param: T) => `${API_BASE}${API_PREFIX}${pathFn(param)}`;
};

// Shorthand for createEndpoint
export const e = createEndpoint;
