import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RegistrationStatusResponse,
  LogoutResponse,
} from '@/api/types';

/**
 * Register a new employee
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  // Ensure email and password are properly trimmed and formatted
  // Remove any leading/trailing quotes that might have been accidentally included
  let cleanedPassword = data.password.trim();
  
  // Remove surrounding quotes if present (handles cases where quotes are part of the input)
  if (
    (cleanedPassword.startsWith('"') && cleanedPassword.endsWith('"')) ||
    (cleanedPassword.startsWith("'") && cleanedPassword.endsWith("'"))
  ) {
    cleanedPassword = cleanedPassword.slice(1, -1);
  }
  
  const loginData: LoginRequest = {
    email: data.email.trim(),
    password: cleanedPassword,
  };
  
  const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, loginData);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>(ENDPOINTS.AUTH.LOGOUT);
  return response.data;
};

/**
 * Check registration status
 */
export const checkRegistrationStatus = async (): Promise<RegistrationStatusResponse> => {
  const response = await apiClient.get<RegistrationStatusResponse>(ENDPOINTS.AUTH.STATUS);
  return response.data;
};

