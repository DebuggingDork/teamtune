import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  PendingUser,
  User,
  UserFilters,
  UsersResponse,
  ApproveUserRequest,
  ApproveUserResponse,
  RejectUserRequest,
  RejectUserResponse,
  PromoteToAdminRequest,
  PromoteToAdminResponse,
  BlockUserResponse,
  UnblockUserResponse,
  BulkApproveUserRequest,
  BulkApproveUserResponse,
  BulkRejectUserRequest,
  BulkRejectUserResponse,
  DeleteUserResponse,
  BulkDeleteUserRequest,
  BulkDeleteUserResponse,
  DemotePMRequest,
  DemotePMResponse,
  DemoteTLRequest,
  DemoteTLResponse,
  ManagedProjectsResponse,
  LedTeamsResponse,
  PromotePMRequest,
  PromotePMResponse,
  PromoteTLRequest,
  PromoteTLResponse,
  ChangeRoleRequest,
  ChangeRoleResponse,
  RoleStatsResponse,
  Plugin,
  UpdatePluginRequest,
  GitHubConnectResponse,
  SyncPluginResponse,
  AdminProfile,
  UpdateAdminProfileRequest,
  AdminProjectsListResponse,
  AdminProjectDetails,
  AdminProjectStatsResponse,
  ProjectStatus,
  // Attendance & Leave Management Types
  LeaveType,
  CreateLeaveTypeRequest,
  UpdateLeaveTypeRequest,
  Holiday,
  HolidaysResponse,
  CreateHolidayRequest,
  InitializeBalancesRequest,
  AdjustBalanceRequest,
  LeaveBalancesResponse,
} from '@/api/types';

/**
 * Get list of pending users
 */
export const getPendingUsers = async (): Promise<PendingUser[]> => {
  const response = await apiClient.get<PendingUser[]>(ENDPOINTS.ADMIN.USERS.PENDING);
  return response.data;
};

/**
 * Get all users with filters and pagination
 */
export const getAllUsers = async (filters?: UserFilters): Promise<UsersResponse> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.department_id) params.append('department_id', filters.department_id);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `${ENDPOINTS.ADMIN.USERS.ALL}?${queryString}` : ENDPOINTS.ADMIN.USERS.ALL;

  const response = await apiClient.get<UsersResponse>(url);
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
 * Block a user
 */
export const blockUser = async (id: string): Promise<BlockUserResponse> => {
  const response = await apiClient.post<BlockUserResponse>(ENDPOINTS.ADMIN.USERS.BLOCK(id));
  return response.data;
};

/**
 * Unblock a user
 */
export const unblockUser = async (id: string): Promise<UnblockUserResponse> => {
  const response = await apiClient.post<UnblockUserResponse>(ENDPOINTS.ADMIN.USERS.UNBLOCK(id));
  return response.data;
};

/**
 * Bulk approve users
 */
export const bulkApproveUsers = async (data: BulkApproveUserRequest): Promise<BulkApproveUserResponse> => {
  const response = await apiClient.post<BulkApproveUserResponse>(ENDPOINTS.ADMIN.USERS.BULK_APPROVE, data);
  return response.data;
};

/**
 * Bulk reject users
 */
export const bulkRejectUsers = async (data: BulkRejectUserRequest): Promise<BulkRejectUserResponse> => {
  const response = await apiClient.post<BulkRejectUserResponse>(ENDPOINTS.ADMIN.USERS.BULK_REJECT, data);
  return response.data;
};

/**
 * Delete a user (hard delete)
 */
export const deleteUser = async (id: string): Promise<DeleteUserResponse> => {
  const response = await apiClient.delete<DeleteUserResponse>(ENDPOINTS.ADMIN.USERS.DELETE(id));
  return response.data;
};

/**
 * Bulk delete users
 */
export const bulkDeleteUsers = async (data: BulkDeleteUserRequest): Promise<BulkDeleteUserResponse> => {
  const response = await apiClient.post<BulkDeleteUserResponse>(ENDPOINTS.ADMIN.USERS.BULK_DELETE, data);
  return response.data;
};

/**
 * Get projects managed by a user
 */
export const getManagedProjects = async (id: string): Promise<ManagedProjectsResponse> => {
  const response = await apiClient.get<ManagedProjectsResponse>(ENDPOINTS.ADMIN.USERS.MANAGED_PROJECTS(id));
  return response.data;
};

/**
 * Get teams led by a user
 */
export const getLedTeams = async (id: string): Promise<LedTeamsResponse> => {
  const response = await apiClient.get<LedTeamsResponse>(ENDPOINTS.ADMIN.USERS.LED_TEAMS(id));
  return response.data;
};

/**
 * Demote project manager to employee
 */
export const demoteProjectManager = async (id: string, data: DemotePMRequest): Promise<DemotePMResponse> => {
  const response = await apiClient.post<DemotePMResponse>(ENDPOINTS.ADMIN.USERS.DEMOTE_PM(id), data);
  return response.data;
};

/**
 * Demote team lead to employee
 */
export const demoteTeamLead = async (id: string, data: DemoteTLRequest): Promise<DemoteTLResponse> => {
  const response = await apiClient.post<DemoteTLResponse>(ENDPOINTS.ADMIN.USERS.DEMOTE_TL(id), data);
  return response.data;
};

/**
 * Get role statistics
 */
export const getRoleStats = async (): Promise<RoleStatsResponse> => {
  const response = await apiClient.get<RoleStatsResponse>(ENDPOINTS.ADMIN.ROLES.STATS);
  return response.data;
};

/**
 * Get users by role with pagination
 */
export const getUsersByRole = async (role: string, filters?: { page?: number; limit?: number }): Promise<UsersResponse> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `${ENDPOINTS.ADMIN.ROLES.USERS(role)}?${queryString}` : ENDPOINTS.ADMIN.ROLES.USERS(role);

  const response = await apiClient.get<UsersResponse>(url);
  return response.data;
};

/**
 * Promote user to project manager
 */
export const promoteToProjectManager = async (id: string, data?: PromotePMRequest): Promise<PromotePMResponse> => {
  const response = await apiClient.post<PromotePMResponse>(ENDPOINTS.ADMIN.USERS.PROMOTE_PM(id), data || {});
  return response.data;
};

/**
 * Promote user to team lead
 */
export const promoteToTeamLead = async (id: string, data?: PromoteTLRequest): Promise<PromoteTLResponse> => {
  const response = await apiClient.post<PromoteTLResponse>(ENDPOINTS.ADMIN.USERS.PROMOTE_TL(id), data || {});
  return response.data;
};

/**
 * Change user role (generic)
 */
export const changeUserRole = async (id: string, data: ChangeRoleRequest): Promise<ChangeRoleResponse> => {
  const response = await apiClient.put<ChangeRoleResponse>(ENDPOINTS.ADMIN.USERS.CHANGE_ROLE(id), data);
  return response.data;
};

/**
 * Get list of plugins
 */
export const getPlugins = async (): Promise<Plugin[]> => {
  const response = await apiClient.get<{ plugins: Plugin[] } | Plugin[]>(ENDPOINTS.ADMIN.PLUGINS.LIST);
  // Handle both response formats: { plugins: [...] } or [...]
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as { plugins: Plugin[] }).plugins || [];
};

/**
 * Connect GitHub plugin
 */
export const connectGitHubPlugin = async (): Promise<GitHubConnectResponse> => {
  const response = await apiClient.post<GitHubConnectResponse>(ENDPOINTS.ADMIN.PLUGINS.CONNECT_GITHUB);
  return response.data;
};

/**
 * Disconnect GitHub plugin
 */
export const disconnectGitHubPlugin = async (): Promise<{ message: string; plugin: Plugin }> => {
  const response = await apiClient.delete<{ message: string; plugin: Plugin }>(ENDPOINTS.ADMIN.PLUGINS.DISCONNECT_GITHUB);
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

/**
 * Get admin's own profile
 */
export const getAdminProfile = async (): Promise<AdminProfile> => {
  const response = await apiClient.get<AdminProfile>(ENDPOINTS.ADMIN.PROFILE.GET);
  return response.data;
};

/**
 * Update admin's own profile
 */
export const updateAdminProfile = async (data: UpdateAdminProfileRequest): Promise<AdminProfile> => {
  const response = await apiClient.put<AdminProfile>(ENDPOINTS.ADMIN.PROFILE.UPDATE, data);
  return response.data;
};

/**
 * Get all projects with pagination and filters
 */
export const getAdminProjects = async (filters?: {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
}): Promise<AdminProjectsListResponse> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.status) params.append('status', filters.status);

  const queryString = params.toString();
  const url = queryString ? `${ENDPOINTS.ADMIN.PROJECTS.LIST}?${queryString}` : ENDPOINTS.ADMIN.PROJECTS.LIST;

  const response = await apiClient.get<AdminProjectsListResponse>(url);
  return response.data;
};

/**
 * Get project details by ID
 */
export const getAdminProjectDetails = async (projectId: string): Promise<AdminProjectDetails> => {
  const response = await apiClient.get<AdminProjectDetails>(ENDPOINTS.ADMIN.PROJECTS.GET(projectId));
  return response.data;
};

/**
 * Get project statistics
 */
export const getAdminProjectStats = async (): Promise<AdminProjectStatsResponse> => {
  const response = await apiClient.get<AdminProjectStatsResponse>(ENDPOINTS.ADMIN.PROJECTS.STATS);
  return response.data;
};

// ============================================================================
// LEAVE TYPES MANAGEMENT
// ============================================================================

/**
 * Get all leave types (including inactive if specified)
 */
export const getAdminLeaveTypes = async (includeInactive?: boolean): Promise<LeaveType[]> => {
  const url = includeInactive
    ? `${ENDPOINTS.ADMIN.LEAVE_TYPES.LIST}?include_inactive=true`
    : ENDPOINTS.ADMIN.LEAVE_TYPES.LIST;
  const response = await apiClient.get<LeaveType[]>(url);
  return response.data;
};

/**
 * Create a new leave type
 */
export const createLeaveType = async (data: CreateLeaveTypeRequest): Promise<LeaveType> => {
  const response = await apiClient.post<LeaveType>(ENDPOINTS.ADMIN.LEAVE_TYPES.CREATE, data);
  return response.data;
};

/**
 * Update an existing leave type
 */
export const updateLeaveType = async (id: string, data: UpdateLeaveTypeRequest): Promise<LeaveType> => {
  const response = await apiClient.put<LeaveType>(ENDPOINTS.ADMIN.LEAVE_TYPES.UPDATE(id), data);
  return response.data;
};

/**
 * Deactivate a leave type
 */
export const deactivateLeaveType = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.ADMIN.LEAVE_TYPES.DELETE(id));
  return response.data;
};

// ============================================================================
// LEAVE BALANCE MANAGEMENT
// ============================================================================

/**
 * Initialize leave balances for a year
 */
export const initializeLeaveBalances = async (data: InitializeBalancesRequest): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(ENDPOINTS.ADMIN.LEAVE_BALANCES.INITIALIZE, data);
  return response.data;
};

/**
 * Adjust a user's leave balance
 */
export const adjustLeaveBalance = async (userId: string, data: AdjustBalanceRequest): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(ENDPOINTS.ADMIN.LEAVE_BALANCES.ADJUST(userId), data);
  return response.data;
};

/**
 * Get all leave balances for a year
 */
export const getAllLeaveBalances = async (year?: number): Promise<LeaveBalancesResponse[]> => {
  const currentYear = year || new Date().getFullYear();
  const url = `${ENDPOINTS.ADMIN.LEAVE_BALANCES.LIST}?year=${currentYear}`;
  const response = await apiClient.get<LeaveBalancesResponse[]>(url);
  return response.data;
};

// ============================================================================
// HOLIDAY MANAGEMENT
// ============================================================================

/**
 * Get all holidays for a year
 */
export const getAdminHolidays = async (year?: number): Promise<HolidaysResponse> => {
  const currentYear = year || new Date().getFullYear();
  const url = `${ENDPOINTS.ADMIN.HOLIDAYS.LIST}?year=${currentYear}`;
  const response = await apiClient.get<HolidaysResponse>(url);
  return response.data;
};

/**
 * Create a new holiday
 */
export const createHoliday = async (data: CreateHolidayRequest): Promise<Holiday> => {
  const response = await apiClient.post<Holiday>(ENDPOINTS.ADMIN.HOLIDAYS.CREATE, data);
  return response.data;
};

/**
 * Delete a holiday
 */
export const deleteHoliday = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.ADMIN.HOLIDAYS.DELETE(id));
  return response.data;
};

// ============================================================================
// REPORTS
// ============================================================================

/**
 * Get attendance report
 */
export const getAttendanceReport = async (fromDate: string, toDate: string): Promise<unknown> => {
  const url = `${ENDPOINTS.ADMIN.REPORTS.ATTENDANCE}?from_date=${fromDate}&to_date=${toDate}`;
  const response = await apiClient.get<unknown>(url);
  return response.data;
};

/**
 * Get leave report
 */
export const getLeaveReport = async (year?: number): Promise<unknown> => {
  const currentYear = year || new Date().getFullYear();
  const url = `${ENDPOINTS.ADMIN.REPORTS.LEAVE}?year=${currentYear}`;
  const response = await apiClient.get<unknown>(url);
  return response.data;
};

