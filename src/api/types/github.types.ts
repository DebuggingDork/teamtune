// ============================================================================
// GITHUB TYPES - GitHub integration related types
// ============================================================================

// Git Activity Types
export interface GitActivity {
  commits: number;
  pull_requests: number;
  code_reviews: number;
  activity_by_date?: Array<{
    date: string;
    commits: number;
    pull_requests: number;
  }>;
}

export interface TeamGitActivityResponse {
  team: {
    team_id: string;
    team_code: string;
    team_name: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  total_commits: number;
  total_pull_requests: number;
  total_code_reviews: number;
  activity_by_member: Array<{
    user_id: string;
    user_code: string;
    user_name: string;
    commits: number;
    pull_requests: number;
    code_reviews: number;
  }>;
}

export interface MemberGitActivityResponse {
  user: {
    user_id: string;
    user_code: string;
    user_name: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  commits: number;
  pull_requests: number;
  code_reviews: number;
  activity_by_date: Array<{
    date: string;
    commits: number;
    pull_requests: number;
  }>;
}

export interface GitMetrics {
  git_activity: {
    commits?: number;
    pull_requests?: number;
    code_reviews?: number;
    total_commits?: number;
    total_pull_requests?: number;
    total_code_reviews?: number;
  };
  tasks: {
    completed: number;
    in_progress?: number;
    total?: number;
  };
}

export interface GitActivityFilters {
  start_date: string;
  end_date: string;
}

// GitHub Integration Types
export interface GitHubConnectResponse {
  auth_url: string;
}

export interface GitHubStatusResponse {
  connected: boolean;
  github_username?: string;
  github_user_id?: string;
  username?: string;
  avatar_url?: string;
  connected_at?: string;
}

export interface LinkRepositoryRequest {
  repository_url: string;
}

export interface LinkRepositoryResponse {
  message: string;
  repository_url: string;
}

// GitHub Permission Types
export type GitHubPermission = 'read' | 'triage' | 'write' | 'maintain' | 'admin';
export type GitHubInvitationStatus = 'pending' | 'accepted' | 'declined';
export type PRState = 'open' | 'closed' | 'merged';
export type ReviewState = 'approved' | 'changes_requested' | 'commented' | 'dismissed' | 'pending';
export type MergeMethod = 'merge' | 'squash' | 'rebase';

export interface RepositoryResponse {
  id: string;
  repository_id: number;
  repository_name: string;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  is_private: boolean;
  default_branch: string;
  html_url: string;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepositoryWithAccessResponse extends RepositoryResponse {
  permission?: GitHubPermission;
  invitation_status?: GitHubInvitationStatus;
}

export interface CollaboratorResponse {
  id: string;
  user_id: string;
  user_code: string;
  full_name: string;
  github_username: string;
  permission: GitHubPermission;
  invitation_status: GitHubInvitationStatus;
  invited_at: string;
  accepted_at: string | null;
}

export interface BranchResponse {
  id: string;
  name: string;
  sha: string;
  is_protected: boolean;
  created_by: string | null;
  created_at: string;
  last_commit_at: string | null;
}

export interface UserBranchResponse extends BranchResponse {
  repository_name: string;
  commits_ahead?: number;
}

export interface PullRequestResponse {
  id: string;
  pr_number: number;
  repository_id: string;
  title: string;
  description: string | null;
  state: PRState;
  author_id: string | null;
  author_github_username: string;
  author_full_name?: string;
  base_branch: string;
  head_branch: string;
  html_url: string;
  draft: boolean;
  mergeable: boolean | null;
  merged: boolean;
  merged_at: string | null;
  merged_by: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewResponse {
  id: string;
  reviewer_id: string | null;
  reviewer_github_username: string;
  reviewer_full_name?: string;
  state: ReviewState;
  body: string | null;
  submitted_at: string;
}

export interface PullRequestWithReviewsResponse extends PullRequestResponse {
  reviews: ReviewResponse[];
  can_merge: boolean;
}

export interface CreateBranchRequest {
  branch_name: string;
  base_branch: string;
}

export interface CreatePRRequest {
  title: string;
  description?: string;
  base_branch: string;
  head_branch: string;
  draft?: boolean;
  reviewers?: string[];
}

export interface RequestReviewRequest {
  reviewers: string[];
}

export interface CreateRepositoryRequest {
  name: string;
  description?: string;
  is_private: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
  org?: string;
}

export interface AddCollaboratorsRequest {
  user_codes: string[];
  permission: GitHubPermission;
}

export interface SubmitReviewRequest {
  state: 'approved' | 'changes_requested' | 'commented';
  body?: string;
}

export interface MergePRRequest {
  merge_method?: MergeMethod;
  commit_title?: string;
  commit_message?: string;
  delete_branch?: boolean;
}
