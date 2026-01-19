// ============================================================================
// AUTH TYPES - Authentication related types
// ============================================================================

import type { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  full_name: string;
  department_id?: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

export interface RegistrationStatusResponse {
  status: 'pending' | 'approved' | 'rejected';
  user_code: string | null;
  message: string;
}

export interface LogoutResponse {
  message: string;
}
