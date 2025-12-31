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
  redirectTo = '/auth/login',
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

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('ProtectedRoute check:', {
      isAuthenticated,
      userRole: user?.role,
      requiredRole,
      hasRequiredRole: requiredRole ? hasRole(requiredRole) : true,
    });
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace state={{ from: window.location.pathname }} />;
  }

  // Check role-based access if required
  if (requiredRole) {
    const userHasRole = hasRole(requiredRole);
    
    if (!userHasRole) {
      // Redirect to appropriate dashboard based on user role
      const roleDashboardMap: Record<UserRole, string> = {
        admin: '/dashboard/admin',
        project_manager: '/dashboard/project-manager',
        team_lead: '/dashboard/team-lead',
        employee: '/dashboard/member',
      };

      const userDashboard = user?.role ? roleDashboardMap[user.role] : '/dashboard/member';
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Role mismatch - redirecting:', {
          userRole: user.role,
          requiredRole,
          redirectingTo: userDashboard,
        });
      }
      
      return <Navigate to={userDashboard} replace state={{ from: window.location.pathname }} />;
    }
  }

  return <>{children}</>;
};

