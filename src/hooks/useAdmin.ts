import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from '@/services/admin.service';
import type {
  PendingUser,
  User,
  UserFilters,
  UsersResponse,
  ApproveUserRequest,
  RejectUserRequest,
  PromoteToAdminRequest,
  BulkApproveUserRequest,
  BulkRejectUserRequest,
  BulkDeleteUserRequest,
  DemotePMRequest,
  DemoteTLRequest,
  PromotePMRequest,
  PromoteTLRequest,
  ChangeRoleRequest,
  UpdatePluginRequest,
  UpdateAdminProfileRequest,
} from '@/api/types';
import { handleError } from '@/utils/errorHandler';

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  users: {
    all: ['admin', 'users'] as const,
    pending: ['admin', 'users', 'pending'] as const,
    list: (filters?: UserFilters) => ['admin', 'users', 'list', filters] as const,
  },
  plugins: {
    all: ['admin', 'plugins'] as const,
    list: ['admin', 'plugins', 'list'] as const,
  },
  profile: {
    all: ['admin', 'profile'] as const,
  },
};

/**
 * Get pending users
 */
export const usePendingUsers = () => {
  return useQuery({
    queryKey: adminKeys.users.pending,
    queryFn: adminService.getPendingUsers,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get all users with filters and pagination
 */
export const useAllUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: adminKeys.users.list(filters),
    queryFn: () => adminService.getAllUsers(filters),
    staleTime: 30000,
  });
};

/**
 * Approve user mutation
 */
export const useApproveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveUserRequest }) =>
      adminService.approveUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Reject user mutation
 */
export const useRejectUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectUserRequest }) =>
      adminService.rejectUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Promote to admin mutation
 */
export const usePromoteToAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PromoteToAdminRequest) => adminService.promoteToAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Block user mutation
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.blockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Unblock user mutation
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Bulk approve users mutation
 */
export const useBulkApproveUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkApproveUserRequest) => adminService.bulkApproveUsers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Bulk reject users mutation
 */
export const useBulkRejectUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkRejectUserRequest) => adminService.bulkRejectUsers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Delete user mutation
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Bulk delete users mutation
 */
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkDeleteUserRequest) => adminService.bulkDeleteUsers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Get managed projects query
 */
export const useManagedProjects = (userId: string) => {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'managed-projects'],
    queryFn: () => adminService.getManagedProjects(userId),
    enabled: !!userId,
    staleTime: 30000,
  });
};

/**
 * Get led teams query
 */
export const useLedTeams = (userId: string) => {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'led-teams'],
    queryFn: () => adminService.getLedTeams(userId),
    enabled: !!userId,
    staleTime: 30000,
  });
};

/**
 * Demote project manager mutation
 */
export const useDemoteProjectManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DemotePMRequest }) =>
      adminService.demoteProjectManager(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Demote team lead mutation
 */
export const useDemoteTeamLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DemoteTLRequest }) =>
      adminService.demoteTeamLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
    onError: handleError,
  });
};

/**
 * Get role statistics query
 */
export const useRoleStats = () => {
  return useQuery({
    queryKey: ['admin', 'roles', 'stats'],
    queryFn: adminService.getRoleStats,
    staleTime: 30000,
  });
};

/**
 * Get users by role query
 */
export const useUsersByRole = (role: string, filters?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin', 'roles', role, 'users', filters],
    queryFn: () => adminService.getUsersByRole(role, filters),
    enabled: !!role,
    staleTime: 30000,
  });
};

/**
 * Promote to project manager mutation
 */
export const usePromoteToProjectManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: PromotePMRequest }) =>
      adminService.promoteToProjectManager(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
    onError: handleError,
  });
};

/**
 * Promote to team lead mutation
 */
export const usePromoteToTeamLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: PromoteTLRequest }) =>
      adminService.promoteToTeamLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
    onError: handleError,
  });
};

/**
 * Change user role mutation
 */
export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeRoleRequest }) =>
      adminService.changeUserRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
    onError: handleError,
  });
};

/**
 * Get plugins
 */
export const usePlugins = () => {
  return useQuery({
    queryKey: adminKeys.plugins.list,
    queryFn: adminService.getPlugins,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Connect GitHub plugin mutation
 */
export const useConnectGitHubPlugin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.connectGitHubPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plugins.all });
    },
    onError: handleError,
  });
};

/**
 * Update plugin mutation
 */
export const useUpdatePlugin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pluginId, data }: { pluginId: string; data: UpdatePluginRequest }) =>
      adminService.updatePlugin(pluginId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plugins.all });
    },
    onError: handleError,
  });
};

/**
 * Sync plugin mutation
 */
export const useSyncPlugin = () => {
  return useMutation({
    mutationFn: adminService.syncPlugin,
    onError: handleError,
  });
};

/**
 * Get admin's own profile
 */
export const useAdminProfile = () => {
  return useQuery({
    queryKey: adminKeys.profile.all,
    queryFn: adminService.getAdminProfile,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Update admin's own profile mutation
 */
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAdminProfileRequest) => adminService.updateAdminProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.profile.all });
    },
    onError: handleError,
  });
};

