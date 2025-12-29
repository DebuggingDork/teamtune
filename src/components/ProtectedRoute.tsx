import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/api/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

/**
 * ProtectedRoute component that checks authentication and role-based access
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/auth',
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if required
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to appropriate dashboard based on user role
    const roleDashboardMap: Record<UserRole, string> = {
      admin: '/dashboard/admin',
      project_manager: '/dashboard/project-manager',
      team_lead: '/dashboard/team-lead',
      employee: '/dashboard/member',
    };

    const userDashboard = user?.role ? roleDashboardMap[user.role] : '/dashboard/member';
    return <Navigate to={userDashboard} replace />;
  }

  return <>{children}</>;
};

