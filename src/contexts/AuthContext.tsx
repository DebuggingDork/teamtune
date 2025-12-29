import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/api/types';
import { getToken, setToken, removeToken, getUser, setUser, clearAuth } from '@/utils/storage';
import * as authService from '@/services/auth.service';
import { handleError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        const storedUser = getUser<User>();

        if (token && storedUser) {
          setUserState(storedUser);
        } else if (token) {
          // Token exists but no user, try to get status
          try {
            const status = await authService.checkRegistrationStatus();
            // If status check succeeds, user is authenticated
            // We might need to fetch user profile here if needed
          } catch (error) {
            // Token is invalid, clear it
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login({ email, password });
      
      // Store token and user
      setToken(response.token);
      setUser(response.user);
      setUserState(response.user);
    } catch (error) {
      handleError(error, 'Login failed. Please check your credentials.');
      throw error;
    }
  };

  const logout = async (showToast: boolean = true): Promise<void> => {
    try {
      const token = getToken();
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      clearAuth();
      setUserState(null);
      
      // Show logout confirmation toast only if explicitly requested (not for 401 auto-logout)
      if (showToast) {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      }
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!getToken(),
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

