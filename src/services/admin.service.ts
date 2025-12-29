import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  PendingUser,
  User,
  UserFilters,
  ApproveUserRequest,
  ApproveUserResponse,
  RejectUserRequest,
  RejectUserResponse,
  PromoteToAdminRequest,
  PromoteToAdminResponse,
  Plugin,
  UpdatePluginRequest,
  GitHubConnectResponse,
  SyncPluginResponse,
} from '@/api/types';

/**
 * Get list of pending users
 */
export const getPendingUsers = async (): Promise<PendingUser[]> => {
  const response = await apiClient.get<PendingUser[]>(ENDPOINTS.ADMIN.USERS.PENDING);
  return response.data;
};

/**
 * Get all users with filters
 */
export const getAllUsers = async (filters?: UserFilters): Promise<User[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.department_id) params.append('department_id', filters.department_id);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `${ENDPOINTS.ADMIN.USERS.ALL}?${queryString}` : ENDPOINTS.ADMIN.USERS.ALL;
  
  const response = await apiClient.get<User[]>(url);
  return response.data;
};

/**
 * Approve a user
 */
export const approveUser = async (id: string, data: ApproveUserRequest): Promise<ApproveUserResponse> => {
  const response = await apiClient.post<ApproveUserResponse>(ENDPOINTS.ADMIN.USERS.APPROVE(id), data);
  return response.data;
};

/**
 * Reject a user
 */
export const rejectUser = async (id: string, data: RejectUserRequest): Promise<RejectUserResponse> => {
  const response = await apiClient.post<RejectUserResponse>(ENDPOINTS.ADMIN.USERS.REJECT(id), data);
  return response.data;
};

/**
 * Promote user to admin
 */
export const promoteToAdmin = async (data: PromoteToAdminRequest): Promise<PromoteToAdminResponse> => {
  const response = await apiClient.post<PromoteToAdminResponse>(ENDPOINTS.ADMIN.USERS.PROMOTE_ADMIN, data);
  return response.data;
};

/**
 * Get list of plugins
 */
export const getPlugins = async (): Promise<Plugin[]> => {
  const response = await apiClient.get<Plugin[]>(ENDPOINTS.ADMIN.PLUGINS.LIST);
  return response.data;
};

/**
 * Connect GitHub plugin
 */
export const connectGitHubPlugin = async (): Promise<GitHubConnectResponse> => {
  const response = await apiClient.post<GitHubConnectResponse>(ENDPOINTS.ADMIN.PLUGINS.CONNECT_GITHUB);
  return response.data;
};

/**
 * Update plugin
 */
export const updatePlugin = async (pluginId: string, data: UpdatePluginRequest): Promise<Plugin> => {
  const response = await apiClient.put<Plugin>(ENDPOINTS.ADMIN.PLUGINS.UPDATE(pluginId), data);
  return response.data;
};

/**
 * Sync plugin
 */
export const syncPlugin = async (pluginId: string): Promise<SyncPluginResponse> => {
  const response = await apiClient.post<SyncPluginResponse>(ENDPOINTS.ADMIN.PLUGINS.SYNC(pluginId));
  return response.data;
};

