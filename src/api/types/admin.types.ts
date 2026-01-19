// ============================================================================
// ADMIN TYPES - Admin operations related types
// ============================================================================

import type { UserRole, UserStatus, PluginStatus } from './common.types';
import type { Project } from './project.types';
import type { Team } from './team.types';

// User Approval Types
export interface ApproveUserRequest {
  role: UserRole;
  department_id?: string;
}

export interface ApproveUserResponse {
  message: string;
  user: {
    id: string;
    user_code: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
}

export interface RejectUserRequest {
  reason?: string;
}

export interface RejectUserResponse {
  message: string;
}

export interface PromoteToAdminRequest {
  user_id: string;
  admin_code: string;
}

export interface PromoteToAdminResponse {
  message: string;
}

export interface BlockUserResponse {
  message: string;
  user: {
    id: string;
    user_code: string;
    email: string;
    status: UserStatus;
  };
}

export interface UnblockUserResponse {
  message: string;
  user: {
    id: string;
    user_code: string;
    email: string;
    status: UserStatus;
  };
}

// Bulk Operations Types
export interface BulkApproveUserRequest {
  user_ids: string[];
  role?: UserRole;
  department_id?: string;
}

export interface BulkApproveUserError {
  user_id: string;
  error: string;
}

export interface BulkApproveUserResponse {
  message: string;
  approved: string[];
  failed: BulkApproveUserError[];
  total_requested: number;
  total_approved: number;
  total_failed: number;
}

export interface BulkRejectUserRequest {
  user_ids: string[];
  reason?: string;
}

export interface BulkRejectUserError {
  user_id: string;
  error: string;
}

export interface BulkRejectUserResponse {
  message: string;
  rejected: string[];
  failed: BulkRejectUserError[];
  total_requested: number;
  total_rejected: number;
  total_failed: number;
}

export interface DeleteUserResponse {
  message: string;
  user_id: string;
}

export interface BulkDeleteUserRequest {
  user_ids: string[];
}

export interface BulkDeleteUserError {
  user_id: string;
  error: string;
}

export interface BulkDeleteUserResponse {
  message: string;
  deleted: string[];
  failed: BulkDeleteUserError[];
  total_requested: number;
  total_deleted: number;
  total_failed: number;
}

// Role Management Types
export interface DemotePMRequest {
  replacement_manager_id: string;
}

export interface DemotePMResponse {
  message: string;
  user_id: string;
  new_role: UserRole;
  projects_reassigned: number;
}

export interface DemoteTLRequest {
  replacement_lead_id: string;
}

export interface DemoteTLResponse {
  message: string;
  user_id: string;
  new_role: UserRole;
  teams_reassigned: number;
}

export interface ManagedProjectsResponse {
  user_id: string;
  user_name: string;
  projects: Project[];
  total: number;
}

export interface LedTeamsResponse {
  user_id: string;
  user_name: string;
  teams: Team[];
  total: number;
}

export interface RoleStatsResponse {
  by_role: {
    [key in UserRole]: {
      total: number;
      active: number;
      blocked: number;
      pending: number;
    };
  };
  totals: {
    total: number;
    active: number;
    blocked: number;
    pending: number;
  };
}

export interface PromotePMRequest {
  department_id?: string;
}

export interface PromotePMResponse {
  message: string;
  user_id: string;
  new_role: UserRole;
}

export interface PromoteTLRequest {
  team_id?: string;
}

export interface PromoteTLResponse {
  message: string;
  user_id: string;
  new_role: UserRole;
}

export interface ChangeRoleRequest {
  role: UserRole;
  replacement_id?: string;
}

export interface ChangeRoleResponse {
  message: string;
  user_id: string;
  old_role: UserRole;
  new_role: UserRole;
}

// Plugin Types
export interface Plugin {
  id: string;
  name: string;
  type: string;
  status: PluginStatus;
  config: Record<string, unknown>;
}

export interface UpdatePluginRequest {
  config?: Record<string, unknown>;
  status?: PluginStatus;
}

export interface SyncPluginResponse {
  message: string;
}
