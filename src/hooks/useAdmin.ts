import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from '@/services/admin.service';
import type {
  PendingUser,
  User,
  UserFilters,
  ApproveUserRequest,
  RejectUserRequest,
  PromoteToAdminRequest,
  UpdatePluginRequest,
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
 * Get all users with filters
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

