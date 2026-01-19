// ============================================================================
// USER TYPES - User and profile related types
// ============================================================================

import type { UserRole, UserStatus, PaginationParams, ExtendedPaginationResponse } from './common.types';

// User Types
export interface User {
  id: string;
  user_code: string;
  username?: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  department_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  status: 'pending';
  created_at: string;
  department_id: string | null;
}

// Employee Profile Types
export interface EmployeeProfile {
  id: string;
  user_code: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  department_id?: string;
  created_at?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  username?: string;
}

// Admin Profile Types
export interface AdminProfile {
  id: string;
  user_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  timezone?: string;
  notification_preferences?: {
    email?: boolean;
    in_app?: boolean;
    [key: string]: unknown;
  };
  created_at?: string;
}

export interface UpdateAdminProfileRequest {
  full_name?: string;
  avatar_url?: string;
  timezone?: string;
  notification_preferences?: {
    email?: boolean;
    in_app?: boolean;
    [key: string]: unknown;
  };
}

// Query Parameters Types
export interface UserFilters extends PaginationParams {
  status?: UserStatus;
  role?: UserRole;
  department_id?: string;
}

export interface UsersResponse {
  users: User[];
  pagination: ExtendedPaginationResponse;
}
