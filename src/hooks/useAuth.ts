import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook to access authentication context
 * Provides user state, login/logout functions, and role checking
 */
export const useAuth = () => {
  return useAuthContext();
};

/**
 * Check if user has a specific role
 */
export const useHasRole = (role: string): boolean => {
  const { hasRole } = useAuthContext();
  return hasRole(role);
};

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
};

