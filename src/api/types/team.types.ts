// ============================================================================
// TEAM TYPES - Team and team member related types
// ============================================================================

import type { UserRole, PaginationResponse } from './common.types';

// Team Types
export interface Team {
  id: string;
  team_code: string;
  project_id: string;
  project_name?: string;
  name: string;
  lead_id: string;
  lead_name?: string;
  capacity_hours_per_sprint: number;
  member_count?: number;
  github_repository?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  name: string;
  lead_id: string;
  capacity_hours_per_sprint: number;
}

export interface TeamsResponse {
  teams: Team[];
  pagination: PaginationResponse;
  project?: {
    project_id: string;
    project_code: string;
    project_name: string;
  };
}

export interface TeamMember {
  user_id: string;
  user_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  allocation_percentage?: number;
  joined_at: string;
  avatar_url?: string | null;
  team_role?: string;
}

export interface TeamMembersResponse {
  members: TeamMember[];
  pagination: PaginationResponse;
  team: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
}

// Team Lead Specific Team Types
export interface TeamLeadTeam extends Team {
  members?: TeamMember[];
}

export interface MyTeamsResponse {
  teams: TeamLeadTeam[];
  total: number;
}

export interface AssignTeamLeadRequest {
  lead_id: string;
}

export interface RemoveTeamLeadRequest {
  new_lead_id: string;
}

export interface AddTeamMembersRequest {
  user_ids: string[];
  allocation_percentage: number;
}

export interface AddTeamMembersResponse {
  message: string;
  added: number;
}

// Team Member Management Types
export interface AvailableMember {
  user_id: string;
  user_code: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role: UserRole;
  department_id?: string;
}

export interface AvailableMembersResponse {
  members: AvailableMember[];
}

export interface AddTeamMemberRequest {
  user_code: string;
  allocation_percentage?: number;
}

export interface UpdateTeamMemberAllocationRequest {
  allocation_percentage: number;
}

export interface TeamMembershipResponse {
  membership_id: string;
  team_id: string;
  user_id: string;
  allocation_percentage: number;
  joined_at: string;
  user_code: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role: UserRole;
}

export interface EmployeeTeamsResponse {
  teams: Array<{
    id: string;
    team_code: string;
    project_id: string;
    project_code: string;
    project_name: string;
    name: string;
    lead_id: string;
    lead_name: string;
    capacity_hours_per_sprint: number;
    github_repository: string | null;
    allocation_percentage: number;
    joined_at: string;
    created_at: string;
  }>;
  pagination: PaginationResponse;
}
