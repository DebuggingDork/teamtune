# GitHub Integration - Frontend Integration Guide

## Overview

This document provides all the information needed for the frontend team to integrate with the GitHub functionality. The backend provides a complete set of APIs for:

- **Team Leads**: Repository creation, collaborator management, PR reviews, and merging
- **Employees**: GitHub account connection, branch creation, PR creation, and re-review requests
- **Real-time Updates**: Webhook-based synchronization (handled automatically by backend)

**Base URL**: `/api`

**Authentication**: All endpoints (except OAuth callback) require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

## Table of Contents

1. [User Roles & Permissions](#user-roles--permissions)
2. [GitHub OAuth Flow](#github-oauth-flow)
3. [Employee Endpoints](#employee-endpoints)
4. [Team Lead Endpoints](#team-lead-endpoints)
5. [Data Types Reference](#data-types-reference)
6. [Error Handling](#error-handling)
7. [User Workflows](#user-workflows)
8. [UI Component Suggestions](#ui-component-suggestions)

---

## User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Employee** | Connect GitHub account, view repositories, create branches, create PRs, request re-reviews |
| **Team Lead** | All employee capabilities + create repositories, manage collaborators, review PRs, merge PRs |

---

## GitHub OAuth Flow

### Connect GitHub Account (Employee)

To connect a GitHub account, redirect the user to the GitHub OAuth authorization URL.

**Step 1: Initiate OAuth**
```
Redirect to: https://github.com/login/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={CALLBACK_URL}&scope=repo,user&state=employee_github_link
```

**Step 2: Handle Callback**
After authorization, GitHub redirects to:
```
GET /api/github/oauth/callback?code={code}&state=employee_github_link
```

The backend handles this automatically and redirects to your frontend with success/error status.

**Frontend Redirect URL** (configure in environment):
- Success: `{FRONTEND_URL}/github/connected?success=true`
- Error: `{FRONTEND_URL}/github/connected?error={error_message}`

---

## Employee Endpoints

### 1. Get GitHub Connection Status

Check if the current user has connected their GitHub account.

```http
GET /api/employee/github/status
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "connected": true,
  "username": "johndoe",
  "avatar_url": "https://avatars.githubusercontent.com/u/123456",
  "connected_at": "2026-01-15T10:30:00Z"
}
```

**Response (Not Connected):**
```json
{
  "connected": false
}
```

---

### 2. Get Accessible Repositories

List all repositories where the user is a collaborator.

```http
GET /api/employee/github/repositories
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "repository_id": 123456789,
    "repository_name": "org/project-alpha",
    "owner": "org",
    "name": "project-alpha",
    "full_name": "org/project-alpha",
    "description": "Project Alpha repository",
    "is_private": true,
    "default_branch": "main",
    "html_url": "https://github.com/org/project-alpha",
    "team_id": "660e8400-e29b-41d4-a716-446655440001",
    "permission": "write",
    "invitation_status": "accepted",
    "created_at": "2026-01-10T08:00:00Z",
    "updated_at": "2026-01-15T12:00:00Z"
  }
]
```

---

### 3. List Branches for Repository

```http
GET /api/employee/github/repositories/:repoId/branches
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `repoId` | UUID | Repository ID (from repositories list) |

**Response 200:**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "main",
    "sha": "abc123def456...",
    "is_protected": true,
    "created_by": null,
    "created_at": "2026-01-10T08:00:00Z",
    "last_commit_at": "2026-01-15T14:30:00Z"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "name": "feature/dashboard",
    "sha": "def456ghi789...",
    "is_protected": false,
    "created_by": "880e8400-e29b-41d4-a716-446655440004",
    "created_at": "2026-01-14T09:00:00Z",
    "last_commit_at": "2026-01-15T16:00:00Z"
  }
]
```

---

### 4. Get My Branches (Across All Repositories)

```http
GET /api/employee/github/my-branches
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "name": "feature/dashboard",
    "sha": "def456ghi789...",
    "is_protected": false,
    "created_by": "880e8400-e29b-41d4-a716-446655440004",
    "created_at": "2026-01-14T09:00:00Z",
    "last_commit_at": "2026-01-15T16:00:00Z",
    "repository_name": "org/project-alpha",
    "commits_ahead": 3
  }
]
```

---

### 5. Create Branch

```http
POST /api/employee/github/repositories/:repoId/branches
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `repoId` | UUID | Repository ID |

**Request Body:**
```json
{
  "branch_name": "feature/new-dashboard",
  "base_branch": "main"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `branch_name` | string | Yes | Name for the new branch |
| `base_branch` | string | Yes | Branch to create from (e.g., "main", "develop") |

**Response 201:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440005",
  "name": "feature/new-dashboard",
  "sha": "abc123...",
  "is_protected": false,
  "created_by": "880e8400-e29b-41d4-a716-446655440004",
  "created_at": "2026-01-16T10:00:00Z",
  "last_commit_at": null
}
```

**Error 400 (Invalid branch name):**
```json
{
  "error": "ValidationError",
  "message": "Branch name cannot contain spaces or special characters",
  "statusCode": 400
}
```

---

### 6. Get My Pull Requests

```http
GET /api/employee/github/pull-requests?state=open
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | string | No | Filter by state: `open`, `closed`, `merged` (default: all) |

**Response 200:**
```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440006",
    "pr_number": 42,
    "repository_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Add dashboard UI components",
    "description": "This PR adds new dashboard components...",
    "state": "open",
    "author_id": "880e8400-e29b-41d4-a716-446655440004",
    "author_github_username": "johndoe",
    "author_full_name": "John Doe",
    "base_branch": "main",
    "head_branch": "feature/dashboard",
    "html_url": "https://github.com/org/project-alpha/pull/42",
    "draft": false,
    "mergeable": true,
    "merged": false,
    "merged_at": null,
    "merged_by": null,
    "closed_at": null,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T14:00:00Z"
  }
]
```

---

### 7. List Pull Requests for Repository

```http
GET /api/employee/github/repositories/:repoId/pull-requests?state=open
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `repoId` | UUID | Repository ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | string | No | Filter: `open`, `closed`, `merged` |

**Response 200:** Same format as "Get My Pull Requests"

---

### 8. Create Pull Request

```http
POST /api/employee/github/repositories/:repoId/pull-requests
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Add dashboard UI components",
  "description": "## Changes\n- Added dashboard layout\n- Added chart components\n\n## Testing\n- Tested on Chrome and Firefox",
  "base_branch": "main",
  "head_branch": "feature/dashboard",
  "draft": false,
  "reviewers": ["team-lead-github-username"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | PR title |
| `description` | string | No | PR description (supports Markdown) |
| `base_branch` | string | Yes | Target branch (e.g., "main") |
| `head_branch` | string | Yes | Source branch with changes |
| `draft` | boolean | No | Create as draft PR (default: false) |
| `reviewers` | string[] | No | GitHub usernames to request review from |

**Response 201:**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440007",
  "pr_number": 43,
  "repository_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Add dashboard UI components",
  "description": "## Changes...",
  "state": "open",
  "author_id": "880e8400-e29b-41d4-a716-446655440004",
  "author_github_username": "johndoe",
  "base_branch": "main",
  "head_branch": "feature/dashboard",
  "html_url": "https://github.com/org/project-alpha/pull/43",
  "draft": false,
  "mergeable": null,
  "merged": false,
  "merged_at": null,
  "merged_by": null,
  "closed_at": null,
  "created_at": "2026-01-16T10:00:00Z",
  "updated_at": "2026-01-16T10:00:00Z"
}
```

---

### 9. Get Pull Request Details

```http
GET /api/employee/github/pull-requests/:prId
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `prId` | UUID | Pull Request ID |

**Response 200:**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440006",
  "pr_number": 42,
  "repository_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Add dashboard UI components",
  "description": "This PR adds...",
  "state": "open",
  "author_id": "880e8400-e29b-41d4-a716-446655440004",
  "author_github_username": "johndoe",
  "author_full_name": "John Doe",
  "base_branch": "main",
  "head_branch": "feature/dashboard",
  "html_url": "https://github.com/org/project-alpha/pull/42",
  "draft": false,
  "mergeable": true,
  "merged": false,
  "merged_at": null,
  "merged_by": null,
  "closed_at": null,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T14:00:00Z",
  "reviews": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440008",
      "reviewer_id": "bb0e8400-e29b-41d4-a716-446655440009",
      "reviewer_github_username": "sarahsmith",
      "reviewer_full_name": "Sarah Smith",
      "state": "changes_requested",
      "body": "Please add unit tests for the chart components.",
      "submitted_at": "2026-01-15T12:00:00Z"
    }
  ],
  "can_merge": false
}
```

---

### 10. Request Re-Review

After making changes based on feedback, request a re-review.

```http
POST /api/employee/github/pull-requests/:prId/request-review
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reviewers": ["sarahsmith"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reviewers` | string[] | Yes | GitHub usernames to request re-review from |

**Response 200:**
```json
{
  "message": "Re-review requested successfully",
  "data": {
    "reviewers": ["sarahsmith"]
  }
}
```

---

## Team Lead Endpoints

### 1. Create Repository for Team

```http
POST /api/team-lead/teams/:teamCode/github/repository
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `teamCode` | string | Team code (e.g., "TEAM001") |

**Request Body:**
```json
{
  "name": "project-alpha",
  "description": "Project Alpha - Team management system",
  "is_private": true,
  "auto_init": true,
  "gitignore_template": "Node",
  "license_template": "mit",
  "org": "your-organization"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Repository name (no spaces) |
| `description` | string | No | Repository description |
| `is_private` | boolean | Yes | Private or public repository |
| `auto_init` | boolean | No | Initialize with README (default: false) |
| `gitignore_template` | string | No | Gitignore template (e.g., "Node", "Python") |
| `license_template` | string | No | License template (e.g., "mit", "apache-2.0") |
| `org` | string | No | GitHub organization name (if creating under org) |

**Response 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "repository_id": 123456789,
  "repository_name": "org/project-alpha",
  "owner": "org",
  "name": "project-alpha",
  "full_name": "org/project-alpha",
  "description": "Project Alpha - Team management system",
  "is_private": true,
  "default_branch": "main",
  "html_url": "https://github.com/org/project-alpha",
  "team_id": "660e8400-e29b-41d4-a716-446655440001",
  "created_at": "2026-01-16T10:00:00Z",
  "updated_at": "2026-01-16T10:00:00Z"
}
```

---

### 2. Get Team Repository

```http
GET /api/team-lead/teams/:teamCode/github/repository
Authorization: Bearer <token>
```

**Response 200:** Same format as Create Repository response

**Response 404 (No repository linked):**
```json
{
  "error": "NotFoundError",
  "message": "No repository linked to this team",
  "statusCode": 404
}
```

---

### 3. Add Collaborators

Add team members as collaborators to the repository.

```http
POST /api/team-lead/teams/:teamCode/github/collaborators
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_codes": ["EMP001", "EMP002", "EMP003"],
  "permission": "write"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_codes` | string[] | Yes | Array of UPEA user codes |
| `permission` | string | Yes | Permission level: `read`, `triage`, `write`, `maintain`, `admin` |

**Permission Levels:**
| Level | Description |
|-------|-------------|
| `read` | Can view and clone repository |
| `triage` | Can manage issues and PRs (no code push) |
| `write` | Can push code and manage PRs |
| `maintain` | Can manage repository settings (no admin) |
| `admin` | Full repository access |

**Response 200:**
```json
{
  "results": [
    {
      "user_code": "EMP001",
      "success": true,
      "collaborator": {
        "id": "cc0e8400-e29b-41d4-a716-446655440010",
        "user_id": "880e8400-e29b-41d4-a716-446655440004",
        "user_code": "EMP001",
        "full_name": "John Doe",
        "github_username": "johndoe",
        "permission": "write",
        "invitation_status": "pending",
        "invited_at": "2026-01-16T10:00:00Z",
        "accepted_at": null
      }
    },
    {
      "user_code": "EMP002",
      "success": false,
      "error": "User has not connected their GitHub account"
    },
    {
      "user_code": "EMP003",
      "success": true,
      "collaborator": {
        "id": "cc0e8400-e29b-41d4-a716-446655440011",
        "user_id": "880e8400-e29b-41d4-a716-446655440005",
        "user_code": "EMP003",
        "full_name": "Jane Smith",
        "github_username": "janesmith",
        "permission": "write",
        "invitation_status": "pending",
        "invited_at": "2026-01-16T10:00:00Z",
        "accepted_at": null
      }
    }
  ]
}
```

---

### 4. List Collaborators

```http
GET /api/team-lead/teams/:teamCode/github/collaborators
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "cc0e8400-e29b-41d4-a716-446655440010",
    "user_id": "880e8400-e29b-41d4-a716-446655440004",
    "user_code": "EMP001",
    "full_name": "John Doe",
    "github_username": "johndoe",
    "permission": "write",
    "invitation_status": "accepted",
    "invited_at": "2026-01-16T10:00:00Z",
    "accepted_at": "2026-01-16T10:30:00Z"
  },
  {
    "id": "cc0e8400-e29b-41d4-a716-446655440011",
    "user_id": "880e8400-e29b-41d4-a716-446655440005",
    "user_code": "EMP003",
    "full_name": "Jane Smith",
    "github_username": "janesmith",
    "permission": "write",
    "invitation_status": "pending",
    "invited_at": "2026-01-16T10:00:00Z",
    "accepted_at": null
  }
]
```

---

### 5. Remove Collaborator

```http
DELETE /api/team-lead/teams/:teamCode/github/collaborators/:userCode
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `teamCode` | string | Team code |
| `userCode` | string | User code to remove |

**Response 200:**
```json
{
  "message": "Collaborator removed successfully"
}
```

---

### 6. List Pull Requests (Team Lead View)

```http
GET /api/team-lead/teams/:teamCode/github/pull-requests?state=open
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | string | No | Filter: `open`, `closed`, `merged` |

**Response 200:**
```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440006",
    "pr_number": 42,
    "repository_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Add dashboard UI components",
    "description": "This PR adds...",
    "state": "open",
    "author_id": "880e8400-e29b-41d4-a716-446655440004",
    "author_github_username": "johndoe",
    "author_full_name": "John Doe",
    "base_branch": "main",
    "head_branch": "feature/dashboard",
    "html_url": "https://github.com/org/project-alpha/pull/42",
    "draft": false,
    "mergeable": true,
    "merged": false,
    "merged_at": null,
    "merged_by": null,
    "closed_at": null,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T14:00:00Z"
  }
]
```

---

### 7. Get Pull Request Details (with Reviews)

```http
GET /api/team-lead/teams/:teamCode/github/pull-requests/:prNumber
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `teamCode` | string | Team code |
| `prNumber` | number | PR number (e.g., 42) |

**Response 200:**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440006",
  "pr_number": 42,
  "repository_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Add dashboard UI components",
  "description": "This PR adds new dashboard components...",
  "state": "open",
  "author_id": "880e8400-e29b-41d4-a716-446655440004",
  "author_github_username": "johndoe",
  "author_full_name": "John Doe",
  "base_branch": "main",
  "head_branch": "feature/dashboard",
  "html_url": "https://github.com/org/project-alpha/pull/42",
  "draft": false,
  "mergeable": true,
  "merged": false,
  "merged_at": null,
  "merged_by": null,
  "closed_at": null,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T14:00:00Z",
  "reviews": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440008",
      "reviewer_id": "bb0e8400-e29b-41d4-a716-446655440009",
      "reviewer_github_username": "sarahsmith",
      "reviewer_full_name": "Sarah Smith",
      "state": "changes_requested",
      "body": "Please add unit tests for the chart components.",
      "submitted_at": "2026-01-15T12:00:00Z"
    }
  ],
  "can_merge": false
}
```

**Note:** `can_merge` is `true` when:
- PR is open
- PR is not a draft
- PR is mergeable (no conflicts)
- At least one approval exists
- No pending "changes_requested" reviews

---

### 8. Submit PR Review

```http
POST /api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/review
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "state": "changes_requested",
  "body": "Good work! Please address the following:\n\n1. Add unit tests for chart components\n2. Fix the mobile breakpoint issue\n3. Extract hardcoded colors to theme variables"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `state` | string | Yes | Review state: `approved`, `changes_requested`, `commented` |
| `body` | string | No | Review comment (supports Markdown) |

**Review States:**
| State | Description |
|-------|-------------|
| `approved` | Approve the PR for merging |
| `changes_requested` | Request changes before approval |
| `commented` | Leave a comment without approval/rejection |

**Response 200:**
```json
{
  "message": "Review submitted successfully",
  "data": {
    "review_id": "aa0e8400-e29b-41d4-a716-446655440012",
    "state": "changes_requested"
  }
}
```

---

### 9. Merge Pull Request

```http
POST /api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/merge
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "merge_method": "squash",
  "commit_title": "Add dashboard UI components (#42)",
  "commit_message": "- Added dashboard layout\n- Added chart components\n- Added responsive grid",
  "delete_branch": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `merge_method` | string | No | Merge method: `merge`, `squash`, `rebase` (default: `merge`) |
| `commit_title` | string | No | Custom commit title |
| `commit_message` | string | No | Custom commit message |
| `delete_branch` | boolean | No | Delete source branch after merge (default: false) |

**Merge Methods:**
| Method | Description |
|--------|-------------|
| `merge` | Create a merge commit (preserves all commits) |
| `squash` | Squash all commits into one |
| `rebase` | Rebase commits onto base branch (linear history) |

**Response 200:**
```json
{
  "message": "Pull request merged successfully",
  "data": {
    "merged": true,
    "sha": "abc123def456...",
    "branch_deleted": true
  }
}
```

**Error 400 (Cannot merge):**
```json
{
  "error": "ValidationError",
  "message": "Pull request cannot be merged. Check for conflicts or pending reviews.",
  "statusCode": 400
}
```

---

## Data Types Reference

### Enums

#### Permission Levels
```typescript
type Permission = 'read' | 'triage' | 'write' | 'maintain' | 'admin';
```

#### Invitation Status
```typescript
type InvitationStatus = 'pending' | 'accepted' | 'declined';
```

#### PR State
```typescript
type PRState = 'open' | 'closed' | 'merged';
```

#### Review State
```typescript
type ReviewState = 'approved' | 'changes_requested' | 'commented' | 'dismissed' | 'pending';
```

#### Merge Method
```typescript
type MergeMethod = 'merge' | 'squash' | 'rebase';
```

---

### TypeScript Interfaces

```typescript
// GitHub Connection Status
interface GitHubStatusResponse {
  connected: boolean;
  username?: string;
  avatar_url?: string;
  connected_at?: string; // ISO 8601
}

// Repository
interface RepositoryResponse {
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

interface RepositoryWithAccessResponse extends RepositoryResponse {
  permission?: Permission;
  invitation_status?: InvitationStatus;
}

// Collaborator
interface CollaboratorResponse {
  id: string;
  user_id: string;
  user_code: string;
  full_name: string;
  github_username: string;
  permission: Permission;
  invitation_status: InvitationStatus;
  invited_at: string;
  accepted_at: string | null;
}

// Branch
interface BranchResponse {
  id: string;
  name: string;
  sha: string;
  is_protected: boolean;
  created_by: string | null;
  created_at: string;
  last_commit_at: string | null;
}

interface UserBranchResponse extends BranchResponse {
  repository_name: string;
  commits_ahead?: number;
}

// Pull Request
interface PullRequestResponse {
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

interface PullRequestWithReviewsResponse extends PullRequestResponse {
  reviews: ReviewResponse[];
  can_merge: boolean;
}

// Review
interface ReviewResponse {
  id: string;
  reviewer_id: string | null;
  reviewer_github_username: string;
  reviewer_full_name?: string;
  state: ReviewState;
  body: string | null;
  submitted_at: string;
}

// Generic Responses
interface SuccessResponse {
  message: string;
  data?: any;
}

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
```

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | `ValidationError` | Invalid request data |
| 401 | `UnauthorizedError` | Missing or invalid authentication |
| 403 | `ForbiddenError` | User doesn't have permission |
| 404 | `NotFoundError` | Resource not found |
| 409 | `ConflictError` | Resource already exists |
| 500 | `InternalServerError` | Server error |

### Common Error Scenarios

**GitHub Not Connected:**
```json
{
  "error": "ValidationError",
  "message": "User has not connected their GitHub account",
  "statusCode": 400
}
```

**No Repository Access:**
```json
{
  "error": "ForbiddenError",
  "message": "User does not have access to this repository",
  "statusCode": 403
}
```

**Branch Already Exists:**
```json
{
  "error": "ConflictError",
  "message": "Branch 'feature/dashboard' already exists",
  "statusCode": 409
}
```

**PR Has Conflicts:**
```json
{
  "error": "ValidationError",
  "message": "Pull request has merge conflicts. Please resolve conflicts first.",
  "statusCode": 400
}
```

---

## User Workflows

### Workflow 1: Employee Connects GitHub

```
1. User clicks "Connect GitHub" button
2. Frontend redirects to GitHub OAuth URL
3. User authorizes on GitHub
4. GitHub redirects to backend callback
5. Backend stores GitHub credentials
6. Backend redirects to frontend success page
7. Frontend calls GET /api/employee/github/status to confirm
```

### Workflow 2: Team Lead Creates Repository & Adds Team

```
1. Team Lead navigates to team settings
2. Clicks "Create Repository"
3. Fills form (name, description, visibility)
4. POST /api/team-lead/teams/:teamCode/github/repository
5. Repository created, UI shows success
6. Team Lead clicks "Add Collaborators"
7. Selects team members from list
8. POST /api/team-lead/teams/:teamCode/github/collaborators
9. Shows results (success/failure per user)
10. Team members receive GitHub invitation emails
```

### Workflow 3: Employee Creates Branch & PR

```
1. Employee views repository list
   GET /api/employee/github/repositories
2. Selects repository, views branches
   GET /api/employee/github/repositories/:repoId/branches
3. Clicks "Create Branch"
4. Enters branch name, selects base branch
   POST /api/employee/github/repositories/:repoId/branches
5. Branch created, employee works in IDE
6. After pushing code, clicks "Create Pull Request"
7. Fills PR form (title, description, reviewers)
   POST /api/employee/github/repositories/:repoId/pull-requests
8. PR created, team lead notified
```

### Workflow 4: Team Lead Reviews & Merges PR

```
1. Team Lead views open PRs
   GET /api/team-lead/teams/:teamCode/github/pull-requests?state=open
2. Clicks on PR to view details
   GET /api/team-lead/teams/:teamCode/github/pull-requests/:prNumber
3. Reviews code on GitHub (link provided)
4. Submits review (approve/request changes)
   POST /api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/review
5. If approved, clicks "Merge"
   POST /api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/merge
6. PR merged, employee notified
```

### Workflow 5: Employee Handles Change Requests

```
1. Employee receives notification of changes requested
2. Views PR details
   GET /api/employee/github/pull-requests/:prId
3. Sees reviewer comments
4. Makes changes in IDE, pushes code
5. Clicks "Request Re-Review"
   POST /api/employee/github/pull-requests/:prId/request-review
6. Team Lead notified of re-review request
```

---

## UI Component Suggestions

### 1. GitHub Connection Card (Employee Profile)

```
┌─────────────────────────────────────────────────┐
│ GitHub Integration                              │
│                                                 │
│ [If not connected]                              │
│ ┌─────────────────────────────────────────────┐│
│ │ 🔗 Connect your GitHub account to create    ││
│ │    branches and pull requests               ││
│ │                                             ││
│ │    [Connect GitHub]                         ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ [If connected]                                  │
│ ┌─────────────────────────────────────────────┐│
│ │ ✓ Connected as @johndoe                     ││
│ │   [Avatar] John Doe                         ││
│ │   Connected: Jan 15, 2026                   ││
│ │                                             ││
│ │   [Disconnect]                              ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### 2. Repository List (Employee Dashboard)

```
┌─────────────────────────────────────────────────┐
│ My Repositories                                 │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 📁 org/project-alpha                        ││
│ │    Private • Write Access • ✓ Active        ││
│ │    Team: Alpha Squad                        ││
│ │                                             ││
│ │    [View Branches] [View PRs] [GitHub ↗]   ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 📁 org/project-beta                         ││
│ │    Private • Read Access • ⏳ Pending       ││
│ │    Team: Beta Squad                         ││
│ │                                             ││
│ │    [Accept Invitation]                      ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### 3. Branch Management (Employee)

```
┌─────────────────────────────────────────────────┐
│ Branches - org/project-alpha                    │
│                                                 │
│ [+ Create Branch]                               │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 🔒 main (default, protected)                ││
│ │    Last commit: 2 hours ago                 ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 🌿 feature/dashboard (your branch)          ││
│ │    3 commits ahead of main                  ││
│ │    Last commit: 30 minutes ago              ││
│ │                                             ││
│ │    [Create PR]                              ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 🌿 feature/auth (by @janesmith)             ││
│ │    Last commit: 1 day ago                   ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### 4. Pull Request List (Team Lead)

```
┌─────────────────────────────────────────────────┐
│ Pull Requests - Alpha Squad                     │
│                                                 │
│ [Open (3)] [Closed] [Merged]                    │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ #42 Add dashboard UI components             ││
│ │ 🔴 Changes Requested                        ││
│ │ @johndoe → main                             ││
│ │ Updated: 2 hours ago                        ││
│ │                                             ││
│ │ [View Details]                              ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ #43 Fix authentication bug                  ││
│ │ ⏳ Review Requested                         ││
│ │ @janesmith → main                           ││
│ │ Updated: 1 hour ago                         ││
│ │                                             ││
│ │ [Review Now]                                ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### 5. PR Review Modal (Team Lead)

```
┌─────────────────────────────────────────────────┐
│ Review PR #42: Add dashboard UI components      │
│                                                 │
│ Author: John Doe (@johndoe)                     │
│ Branch: feature/dashboard → main                │
│ Files: 8 changed (+342 -15)                     │
│                                                 │
│ [View on GitHub ↗]                              │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Your Review:                                    │
│ ┌─────────────────────────────────────────────┐│
│ │ Great work! A few suggestions:              ││
│ │                                             ││
│ │ 1. Add unit tests for chart components     ││
│ │ 2. Fix mobile breakpoint                   ││
│ │                                             ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ○ Comment   ○ Approve   ● Request Changes       │
│                                                 │
│ [Cancel]                    [Submit Review]     │
└─────────────────────────────────────────────────┘
```

### 6. Collaborator Management (Team Lead)

```
┌─────────────────────────────────────────────────┐
│ Collaborators - org/project-alpha               │
│                                                 │
│ [+ Add Collaborators]                           │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ [Avatar] John Doe                           ││
│ │ @johndoe • EMP001                           ││
│ │ Permission: Write • ✓ Accepted              ││
│ │                                             ││
│ │ [Change Permission ▼] [Remove]              ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ [Avatar] Jane Smith                         ││
│ │ @janesmith • EMP003                         ││
│ │ Permission: Write • ⏳ Pending              ││
│ │                                             ││
│ │ [Resend Invitation] [Remove]                ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

---

## API Endpoint Summary

### Employee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employee/github/status` | Get GitHub connection status |
| GET | `/api/employee/github/repositories` | List accessible repositories |
| GET | `/api/employee/github/repositories/:repoId/branches` | List branches |
| GET | `/api/employee/github/my-branches` | Get user's branches |
| POST | `/api/employee/github/repositories/:repoId/branches` | Create branch |
| GET | `/api/employee/github/pull-requests` | Get user's PRs |
| GET | `/api/employee/github/repositories/:repoId/pull-requests` | List repo PRs |
| POST | `/api/employee/github/repositories/:repoId/pull-requests` | Create PR |
| GET | `/api/employee/github/pull-requests/:prId` | Get PR details |
| POST | `/api/employee/github/pull-requests/:prId/request-review` | Request re-review |

### Team Lead Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/team-lead/teams/:teamCode/github/repository` | Create repository |
| GET | `/api/team-lead/teams/:teamCode/github/repository` | Get repository |
| POST | `/api/team-lead/teams/:teamCode/github/collaborators` | Add collaborators |
| GET | `/api/team-lead/teams/:teamCode/github/collaborators` | List collaborators |
| DELETE | `/api/team-lead/teams/:teamCode/github/collaborators/:userCode` | Remove collaborator |
| GET | `/api/team-lead/teams/:teamCode/github/pull-requests` | List PRs |
| GET | `/api/team-lead/teams/:teamCode/github/pull-requests/:prNumber` | Get PR details |
| POST | `/api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/review` | Submit review |
| POST | `/api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/merge` | Merge PR |

---

## Environment Variables (Frontend)

```env
# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_REDIRECT_URI=https://your-api.com/api/github/oauth/callback

# API Base URL
VITE_API_BASE_URL=https://your-api.com/api
```

---

## Notes for Frontend Team

1. **Authentication**: All endpoints require JWT token except OAuth callback
2. **Dates**: All dates are in ISO 8601 format (e.g., "2026-01-16T10:00:00Z")
3. **UUIDs**: All IDs are UUIDs (e.g., "550e8400-e29b-41d4-a716-446655440000")
4. **Pagination**: Currently not implemented - all results returned
5. **Real-time Updates**: Webhooks update data automatically - poll or use WebSocket for real-time UI
6. **GitHub Links**: Use `html_url` fields to link to GitHub pages
7. **Error Handling**: Always handle error responses gracefully

---

**Document Version:** 1.0
**Last Updated:** January 16, 2026
**Backend Status:** Complete ✅
**Ready for Frontend Integration:** Yes
