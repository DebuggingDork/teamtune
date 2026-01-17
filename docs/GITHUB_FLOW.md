# GitHub Integration Implementation Document

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Feature Requirements](#feature-requirements)
4. [User Workflows](#user-workflows)
5. [Database Schema Changes](#database-schema-changes)
6. [GitHub API Requirements](#github-api-requirements)
7. [Backend Architecture](#backend-architecture)
8. [Frontend Components](#frontend-components)
9. [Security Considerations](#security-considerations)
10. [Implementation Phases](#implementation-phases)
11. [Recommendations & Improvements](#recommendations--improvements)

---

## Executive Summary

This document outlines the implementation plan for a comprehensive GitHub integration that enables:
- **Team Leads** to create repositories and manage collaborators
- **Team Members** to connect their GitHub accounts, create branches, raise PRs, and receive feedback
- **Visual Git Graph** for easy tracking of repository activity
- **One-click operations** for common Git workflows (branch creation, PR raising)
- **Real-time notifications** for PR reviews and feedback

**Timeline Estimation:** 4-6 weeks for full implementation across all phases

---

## Current State Analysis

### What Already Exists ✅

1. **GitHub OAuth Flow**
   - `GitHubOAuthService` handles authorization and token exchange
   - Unified callback supporting both admin and employee flows
   - Employees can connect GitHub accounts (`github_user_id`, `github_username` stored)

2. **GitHub API Integration**
   - `GitHubAPIService` fetches commits and pull requests
   - Repository validation
   - Pagination support

3. **Data Storage**
   - `plugin_sources` table stores GitHub configuration (tokens, webhooks)
   - `plugin_data` table stores commits, PRs, and other events
   - `users` table has `github_user_id` and `github_username` fields
   - `teams` table has `github_repository` field

4. **Notification System**
   - Notification model supports multiple types
   - Email service stub ready for integration
   - User notification preferences stored

5. **User Roles**
   - Admin, Team Lead, Project Manager, Employee roles
   - Policy-based authorization

### What's Missing ❌

1. **Repository Management**
   - No repository creation via GitHub API
   - No collaborator management
   - No repository settings management

2. **Branch Operations**
   - No branch creation from UI
   - No branch listing
   - No branch protection rules

3. **Pull Request Workflow**
   - No PR creation from UI
   - No PR review/approval workflow
   - No PR comment system
   - No change request handling

4. **Git Graph Visualization**
   - No commit graph endpoint
   - No branch visualization data
   - No merge/rebase history tracking

5. **Notifications**
   - No GitHub webhook handling for real-time events
   - No PR-specific notifications (review requested, changes requested, approved, merged)

6. **Team Member View**
   - No dashboard showing repository access
   - No view of assigned PRs for review
   - No PR status tracking

---

## Feature Requirements

### FR1: Team Lead - Repository Creation
- Create new GitHub repository via UI button
- Set repository visibility (public/private)
- Initialize with README, .gitignore, LICENSE
- Auto-link repository to team in database

### FR2: Team Lead - Collaborator Management
- View current collaborators
- Add team members as collaborators (read/write/admin permissions)
- Remove collaborators
- View invitation status (pending/accepted)
- Sync collaborator status from GitHub

### FR3: Team Member - GitHub Connection
- One-click "Connect GitHub" button
- OAuth flow with proper scopes
- Display connection status with GitHub avatar
- Show linked username
- Disconnect/reconnect option

### FR4: Team Member - Repository Access View
- Dashboard showing all repositories where member is collaborator
- Repository details (name, description, visibility, role)
- Quick links to GitHub repository

### FR5: Team Member - Branch Management
- View all branches in repository
- Create new branch from base branch (main/develop)
- Branch naming conventions enforcement
- Visual indication of current user's branches

### FR6: Team Member - Pull Request Creation
- One-click "Raise Pull Request" button
- Select source and target branches
- Auto-fill PR title and description from recent commits
- Add reviewers (team lead auto-added)
- Add labels
- Submit PR to GitHub

### FR7: Team Lead - Pull Request Review
- View all open PRs for team repositories
- Filter by repository, author, status
- Click to review on GitHub (or inline if feasible)
- Request changes with comments
- Approve PR
- Merge PR (merge commit, squash, rebase)

### FR8: Team Member - PR Feedback Handling
- Receive notification when changes requested
- View reviewer comments
- Update code and push changes
- Re-request review after fixes

### FR9: Git Graph Visualization
- Visual representation of commit history
- Show branches, merges, and PRs
- Color-coded by author
- Interactive (click to view commit details)
- Filter by date range, author, branch

### FR10: Notifications & Webhooks
- Real-time notifications via GitHub webhooks
- Events: PR created, review requested, changes requested, approved, merged, closed
- Push notifications to team lead and reviewers
- Email notifications (optional, based on preferences)

---

## User Workflows

### Workflow 1: Team Lead Creates Repository & Adds Team

```
┌─────────────────────────────────────────────────────────────┐
│ Team Lead Dashboard                                         │
│                                                             │
│ Team: Alpha Squad                                          │
│ [+ Create Repository]                                       │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Create Repository Form                                      │
│                                                             │
│ Repository Name: alpha-squad-project                        │
│ Description: Project management system                      │
│ Visibility: ○ Public  ● Private                            │
│ Initialize: ☑ README  ☑ .gitignore (Node)  ☐ LICENSE       │
│                                                             │
│ [Cancel]  [Create Repository]                               │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Repository Created Successfully!                            │
│                                                             │
│ Repository: alpha-squad-project                             │
│ URL: github.com/org/alpha-squad-project                     │
│                                                             │
│ Add Team Members as Collaborators:                          │
│                                                             │
│ ☑ John Doe (@johndoe) - Write Access                       │
│ ☑ Jane Smith (@janesmith) - Write Access                   │
│ ☑ Bob Wilson (@bobwilson) - Read Access                    │
│                                                             │
│ [Add Collaborators]                                         │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Collaborators Added!                                        │
│                                                             │
│ Invitations sent to:                                        │
│ - John Doe (Pending)                                       │
│ - Jane Smith (Pending)                                     │
│ - Bob Wilson (Pending)                                     │
│                                                             │
│ Team members will receive email invitations from GitHub     │
└─────────────────────────────────────────────────────────────┘
```

### Workflow 2: Team Member Connects GitHub & Views Access

```
┌─────────────────────────────────────────────────────────────┐
│ Team Member Profile                                         │
│                                                             │
│ Integrations:                                               │
│                                                             │
│ GitHub:  [Connect GitHub Account]                          │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ GitHub OAuth (github.com)                                   │
│                                                             │
│ Authorize UPEA to access your GitHub account?              │
│                                                             │
│ This will allow UPEA to:                                   │
│ - Read your profile                                        │
│ - Access your repositories                                 │
│ - Create branches and pull requests on your behalf         │
│                                                             │
│ [Cancel]  [Authorize UPEA]                                  │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Team Member Profile                                         │
│                                                             │
│ Integrations:                                               │
│                                                             │
│ GitHub: ✓ Connected as @johndoe                            │
│         [Disconnect]                                        │
│                                                             │
│ Repository Access:                                          │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ alpha-squad-project (Write)                           │  │
│ │ Team: Alpha Squad                                     │  │
│ │ Status: Active Collaborator                           │  │
│ │ [View on GitHub] [Manage Branches] [View PRs]         │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Workflow 3: Team Member Creates Branch & Raises PR

```
┌─────────────────────────────────────────────────────────────┐
│ Repository: alpha-squad-project                             │
│                                                             │
│ Branches:                                                   │
│ ● main (default)                                           │
│ ● develop                                                   │
│ ● feature/user-auth (by @janesmith)                        │
│                                                             │
│ [+ Create Branch]                                           │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Create New Branch                                           │
│                                                             │
│ Branch Name: feature/dashboard-ui                           │
│ Base Branch: ▼ develop                                      │
│                                                             │
│ [Cancel]  [Create Branch]                                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Branch Created! ✓                                           │
│                                                             │
│ feature/dashboard-ui has been created from develop          │
│                                                             │
│ Next steps:                                                 │
│ 1. Clone repository or pull latest changes                 │
│ 2. Checkout feature/dashboard-ui                           │
│ 3. Make your changes and commit                             │
│ 4. Push to GitHub                                           │
│ 5. Come back here to raise a Pull Request                  │
│                                                             │
│ Git Commands:                                               │
│ git pull origin develop                                     │
│ git checkout feature/dashboard-ui                           │
│                                                             │
│ [Got it]                                                    │
└─────────────────────────────────────────────────────────────┘

// After working in IDE and pushing code...

┌─────────────────────────────────────────────────────────────┐
│ Repository: alpha-squad-project                             │
│                                                             │
│ Your Branches:                                              │
│ ● feature/dashboard-ui (2 commits ahead of develop)        │
│   Last commit: "Add dashboard layout" (2 hours ago)        │
│                                                             │
│   [Raise Pull Request]                                      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Create Pull Request                                         │
│                                                             │
│ Title: Add dashboard UI components                          │
│                                                             │
│ Description:                                                │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ - Created dashboard layout component               │   │
│ │ - Added responsive grid system                     │   │
│ │ - Integrated chart library                         │   │
│ │                                                     │   │
│ │ Commits:                                            │   │
│ │ - Add dashboard layout                              │   │
│ │ - Add chart components                              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Source: feature/dashboard-ui → Target: develop              │
│                                                             │
│ Reviewers: ☑ Sarah (Team Lead) ☐ Jane Smith                │
│                                                             │
│ Labels: enhancement, ui                                     │
│                                                             │
│ [Cancel]  [Create Pull Request]                             │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Pull Request Created! 🎉                                    │
│                                                             │
│ PR #42: Add dashboard UI components                         │
│                                                             │
│ Status: Open                                                │
│ Reviewers: Sarah (Team Lead) - Review Requested             │
│                                                             │
│ Notification sent to Sarah                                  │
│                                                             │
│ [View on GitHub]  [View PR Details]                         │
└─────────────────────────────────────────────────────────────┘
```

### Workflow 4: Team Lead Reviews PR & Requests Changes

```
┌─────────────────────────────────────────────────────────────┐
│ Team Lead Notification                                      │
│                                                             │
│ 🔔 John Doe requested your review on PR #42                │
│    "Add dashboard UI components"                            │
│    alpha-squad-project                                      │
│                                                             │
│    [View Pull Request]                                      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Pull Request #42: Add dashboard UI components               │
│                                                             │
│ Author: John Doe (@johndoe)                                │
│ feature/dashboard-ui → develop                              │
│ Status: ⏳ Review Requested                                │
│                                                             │
│ Files Changed: 8 files (+342 -15 lines)                    │
│ Commits: 2                                                  │
│                                                             │
│ [View Diff on GitHub]  [Request Changes]  [Approve]        │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Request Changes                                             │
│                                                             │
│ Feedback for John Doe:                                      │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Good work on the dashboard layout! A few issues:    │   │
│ │                                                     │   │
│ │ 1. Please add unit tests for chart components      │   │
│ │ 2. The mobile breakpoint needs adjustment          │   │
│ │ 3. Extract hardcoded colors to theme variables     │   │
│ │                                                     │   │
│ │ Please address these and re-request review.        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Cancel]  [Submit Review]                                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Changes Requested ✓                                         │
│                                                             │
│ Feedback sent to John Doe                                   │
│ PR #42 status updated to "Changes Requested"               │
└─────────────────────────────────────────────────────────────┘
```

### Workflow 5: Team Member Fixes Issues & Re-requests Review

```
┌─────────────────────────────────────────────────────────────┐
│ Team Member Notification                                    │
│                                                             │
│ 🔴 Sarah requested changes on PR #42                        │
│    "Add dashboard UI components"                            │
│                                                             │
│    Changes requested:                                       │
│    1. Please add unit tests for chart components           │
│    2. The mobile breakpoint needs adjustment                │
│    3. Extract hardcoded colors to theme variables           │
│                                                             │
│    [View Pull Request]                                      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Pull Request #42: Add dashboard UI components               │
│                                                             │
│ Status: 🔴 Changes Requested by Sarah                      │
│                                                             │
│ Review Comments:                                            │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Good work on the dashboard layout! A few issues:    │   │
│ │                                                     │   │
│ │ 1. Please add unit tests for chart components      │   │
│ │ 2. The mobile breakpoint needs adjustment          │   │
│ │ 3. Extract hardcoded colors to theme variables     │   │
│ │                                                     │   │
│ │ Please address these and re-request review.        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Actions:                                                    │
│ - Fix the issues in your IDE                               │
│ - Commit and push changes                                  │
│ - Click "Re-request Review" below                          │
│                                                             │
│ [Re-request Review]  [View on GitHub]                       │
└─────────────────────────────────────────────────────────────┘

// After fixing and pushing...

┌─────────────────────────────────────────────────────────────┐
│ Pull Request #42: Add dashboard UI components               │
│                                                             │
│ Status: 🔴 Changes Requested by Sarah                      │
│                                                             │
│ Recent Activity:                                            │
│ - You pushed 2 new commits                                 │
│   • Add unit tests for chart components                    │
│   • Extract colors to theme variables                      │
│                                                             │
│ [Re-request Review from Sarah]                              │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Review Re-requested! ✓                                      │
│                                                             │
│ Status: ⏳ Review Requested                                │
│ Sarah has been notified                                     │
└─────────────────────────────────────────────────────────────┘
```

### Workflow 6: Team Lead Approves & Merges PR

```
┌─────────────────────────────────────────────────────────────┐
│ Team Lead Notification                                      │
│                                                             │
│ 🔔 John Doe re-requested your review on PR #42             │
│    "Add dashboard UI components"                            │
│    2 new commits pushed                                     │
│                                                             │
│    [View Pull Request]                                      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Pull Request #42: Add dashboard UI components               │
│                                                             │
│ Status: ⏳ Review Requested                                │
│                                                             │
│ New Changes:                                                │
│ - Add unit tests for chart components                      │
│ - Extract colors to theme variables                        │
│ - Fix mobile breakpoints                                   │
│                                                             │
│ All requested changes have been addressed ✓                │
│                                                             │
│ [View Diff]  [Request More Changes]  [Approve & Merge]     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Approve & Merge Pull Request                                │
│                                                             │
│ Merge Method:                                               │
│ ● Merge Commit - All commits preserved                     │
│ ○ Squash & Merge - Single commit                          │
│ ○ Rebase & Merge - Linear history                         │
│                                                             │
│ Approval Comment (optional):                                │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Great work addressing the feedback! LGTM 👍         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ☑ Delete branch after merge                                │
│                                                             │
│ [Cancel]  [Approve & Merge]                                 │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Pull Request Merged! 🎉                                     │
│                                                             │
│ PR #42 has been successfully merged into develop            │
│                                                             │
│ - Branch feature/dashboard-ui has been deleted             │
│ - John Doe has been notified                               │
│ - Team activity log updated                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### New Tables

#### 1. `github_repositories`
Tracks repositories managed through UPEA.

```sql
CREATE TABLE github_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id BIGINT NOT NULL UNIQUE, -- GitHub repository ID
    repository_name VARCHAR(255) NOT NULL, -- owner/repo format
    owner VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT true,
    default_branch VARCHAR(100) DEFAULT 'main',
    html_url TEXT NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_team_id (team_id),
    INDEX idx_repository_id (repository_id)
);
```

#### 2. `github_collaborators`
Tracks collaborator invitations and access levels.

```sql
CREATE TABLE github_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    github_username VARCHAR(255) NOT NULL,
    permission VARCHAR(20) NOT NULL, -- read, write, admin
    invitation_status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,

    UNIQUE(repository_id, user_id),
    INDEX idx_repository_id (repository_id),
    INDEX idx_user_id (user_id),
    INDEX idx_invitation_status (invitation_status)
);
```

#### 3. `github_branches`
Tracks branches in repositories (cached for performance).

```sql
CREATE TABLE github_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sha VARCHAR(40) NOT NULL,
    is_protected BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_commit_at TIMESTAMP,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(repository_id, name),
    INDEX idx_repository_id (repository_id),
    INDEX idx_created_by (created_by)
);
```

#### 4. `github_pull_requests`
Tracks pull requests (synced from GitHub).

```sql
CREATE TABLE github_pull_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_number INTEGER NOT NULL,
    repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
    github_pr_id BIGINT NOT NULL UNIQUE, -- GitHub PR ID
    title VARCHAR(500) NOT NULL,
    description TEXT,
    state VARCHAR(20) NOT NULL, -- open, closed, merged
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_github_username VARCHAR(255) NOT NULL,
    base_branch VARCHAR(255) NOT NULL,
    head_branch VARCHAR(255) NOT NULL,
    html_url TEXT NOT NULL,
    draft BOOLEAN DEFAULT false,
    mergeable BOOLEAN,
    merged BOOLEAN DEFAULT false,
    merged_at TIMESTAMP,
    merged_by VARCHAR(255),
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(repository_id, pr_number),
    INDEX idx_repository_id (repository_id),
    INDEX idx_author_id (author_id),
    INDEX idx_state (state),
    INDEX idx_github_pr_id (github_pr_id)
);
```

#### 5. `github_pr_reviews`
Tracks PR reviews and approvals.

```sql
CREATE TABLE github_pr_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID REFERENCES github_pull_requests(id) ON DELETE CASCADE,
    github_review_id BIGINT NOT NULL UNIQUE, -- GitHub review ID
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_github_username VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL, -- approved, changes_requested, commented, pending
    body TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_pr_id (pr_id),
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_state (state)
);
```

#### 6. `github_webhooks`
Tracks webhook configurations for repositories.

```sql
CREATE TABLE github_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
    webhook_id BIGINT NOT NULL UNIQUE, -- GitHub webhook ID
    webhook_url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL, -- Webhook secret for verification
    events TEXT[] NOT NULL, -- Array of subscribed events
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_triggered_at TIMESTAMP,

    INDEX idx_repository_id (repository_id),
    INDEX idx_webhook_id (webhook_id)
);
```

### Modified Tables

#### `users` table
Already has `github_user_id` and `github_username`. Add additional fields:

```sql
ALTER TABLE users ADD COLUMN github_avatar_url TEXT;
ALTER TABLE users ADD COLUMN github_access_token_encrypted TEXT;
ALTER TABLE users ADD COLUMN github_connected_at TIMESTAMP;
ALTER TABLE users ADD COLUMN github_scopes TEXT[]; -- Granted OAuth scopes
```

#### `notifications` table
Add new notification types:

```sql
-- Update notification_type enum or add to validation
-- New types:
-- - pr_review_requested
-- - pr_changes_requested
-- - pr_approved
-- - pr_merged
-- - pr_closed
-- - pr_comment_added
-- - repository_access_granted
-- - branch_created
```

---

## GitHub API Requirements

### Authentication
- **OAuth App** or **GitHub App** (Recommended: GitHub App for better security)
- **Scopes required:**
  - `repo` - Full repository access
  - `read:user` - User profile
  - `user:email` - User email
  - `admin:repo_hook` - Webhook management
  - `read:org` - Organization membership (if applicable)

### API Endpoints to Use

#### 1. Repository Management
```
POST /orgs/{org}/repos
GET /repos/{owner}/{repo}
DELETE /repos/{owner}/{repo}
PATCH /repos/{owner}/{repo}
GET /user/repos
```

#### 2. Collaborator Management
```
PUT /repos/{owner}/{repo}/collaborators/{username}
GET /repos/{owner}/{repo}/collaborators
GET /repos/{owner}/{repo}/invitations
DELETE /repos/{owner}/{repo}/collaborators/{username}
```

#### 3. Branch Operations
```
GET /repos/{owner}/{repo}/branches
GET /repos/{owner}/{repo}/branches/{branch}
POST /repos/{owner}/{repo}/git/refs (create branch)
DELETE /repos/{owner}/{repo}/git/refs/heads/{branch}
```

#### 4. Pull Request Operations
```
GET /repos/{owner}/{repo}/pulls
GET /repos/{owner}/{repo}/pulls/{pr_number}
POST /repos/{owner}/{repo}/pulls (create PR)
PATCH /repos/{owner}/{repo}/pulls/{pr_number}
PUT /repos/{owner}/{repo}/pulls/{pr_number}/merge
GET /repos/{owner}/{repo}/pulls/{pr_number}/files
```

#### 5. PR Reviews
```
GET /repos/{owner}/{repo}/pulls/{pr_number}/reviews
POST /repos/{owner}/{repo}/pulls/{pr_number}/reviews
PUT /repos/{owner}/{repo}/pulls/{pr_number}/reviews/{review_id}
POST /repos/{owner}/{repo}/pulls/{pr_number}/requested_reviewers
DELETE /repos/{owner}/{repo}/pulls/{pr_number}/requested_reviewers
```

#### 6. Commits & History
```
GET /repos/{owner}/{repo}/commits
GET /repos/{owner}/{repo}/commits/{ref}
GET /repos/{owner}/{repo}/compare/{base}...{head}
```

#### 7. Webhooks
```
POST /repos/{owner}/{repo}/hooks
GET /repos/{owner}/{repo}/hooks
GET /repos/{owner}/{repo}/hooks/{hook_id}
PATCH /repos/{owner}/{repo}/hooks/{hook_id}
DELETE /repos/{owner}/{repo}/hooks/{hook_id}
POST /repos/{owner}/{repo}/hooks/{hook_id}/tests
```

#### 8. Git Graph Data
```
GET /repos/{owner}/{repo}/commits (with pagination)
GET /repos/{owner}/{repo}/git/refs
GET /repos/{owner}/{repo}/branches
GET /repos/{owner}/{repo}/pulls (for merge commits)
```

### Rate Limiting
- **Authenticated:** 5,000 requests per hour
- **Search API:** 30 requests per minute
- **GraphQL API:** 5,000 points per hour (alternative for complex queries)

**Strategy:** Cache frequently accessed data (branches, collaborators, commit history) in database.

---

## Backend Architecture

### Service Layer Structure

```
src/services/github/
├── github-oauth.service.ts (existing, enhance)
├── github-api.service.ts (existing, expand)
├── github-repository.service.ts (new)
├── github-branch.service.ts (new)
├── github-pr.service.ts (new)
├── github-webhook.service.ts (new)
├── github-sync.service.ts (existing, enhance)
└── github-graph.service.ts (new)
```

#### 1. GitHubRepositoryService
```typescript
class GitHubRepositoryService {
  async createRepository(config: CreateRepositoryConfig): Promise<Repository>
  async addCollaborator(repo: string, username: string, permission: string): Promise<void>
  async removeCollaborator(repo: string, username: string): Promise<void>
  async listCollaborators(repo: string): Promise<Collaborator[]>
  async syncCollaborators(repositoryId: string): Promise<void>
  async getRepositoryDetails(owner: string, repo: string): Promise<Repository>
}
```

#### 2. GitHubBranchService
```typescript
class GitHubBranchService {
  async listBranches(repo: string): Promise<Branch[]>
  async createBranch(repo: string, branchName: string, baseBranch: string): Promise<Branch>
  async deleteBranch(repo: string, branchName: string): Promise<void>
  async getBranchProtection(repo: string, branch: string): Promise<Protection>
  async syncBranches(repositoryId: string): Promise<void>
}
```

#### 3. GitHubPRService
```typescript
class GitHubPRService {
  async createPullRequest(config: CreatePRConfig): Promise<PullRequest>
  async listPullRequests(repo: string, state?: string): Promise<PullRequest[]>
  async getPullRequest(repo: string, prNumber: number): Promise<PullRequest>
  async updatePullRequest(repo: string, prNumber: number, updates: Partial<PullRequest>): Promise<PullRequest>
  async mergePullRequest(repo: string, prNumber: number, method: MergeMethod): Promise<void>
  async requestReview(repo: string, prNumber: number, reviewers: string[]): Promise<void>
  async submitReview(repo: string, prNumber: number, review: ReviewConfig): Promise<Review>
  async syncPullRequests(repositoryId: string): Promise<void>
}
```

#### 4. GitHubWebhookService
```typescript
class GitHubWebhookService {
  async createWebhook(repo: string, events: string[]): Promise<Webhook>
  async deleteWebhook(repo: string, webhookId: number): Promise<void>
  async handleWebhookEvent(event: string, payload: any): Promise<void>
  async verifyWebhookSignature(signature: string, payload: string): Promise<boolean>
}
```

#### 5. GitHubGraphService
```typescript
class GitHubGraphService {
  async getCommitGraph(repo: string, options: GraphOptions): Promise<GraphData>
  async getBranchesWithCommits(repo: string): Promise<BranchCommitMap>
  async getPRsWithMergeHistory(repo: string): Promise<PRMergeHistory[]>
}
```

### Handler Structure

```
src/handlers/github/
├── github.handler.ts (existing, enhance)
├── github-repository.handler.ts (new)
├── github-branch.handler.ts (new)
├── github-pr.handler.ts (new)
└── github-webhook.handler.ts (new)
```

### Repository Layer

```
src/repositories/github/
├── github-repository.repository.ts (new)
├── github-collaborator.repository.ts (new)
├── github-branch.repository.ts (new)
├── github-pr.repository.ts (new)
├── github-pr-review.repository.ts (new)
└── github-webhook.repository.ts (new)
```

### API Endpoints

#### Team Lead Endpoints

```
POST   /api/team-lead/teams/:teamCode/github/repository
       - Create GitHub repository for team
       - Body: { name, description, isPrivate, initWithReadme, gitignoreTemplate, license }

GET    /api/team-lead/teams/:teamCode/github/repository
       - Get repository details for team

DELETE /api/team-lead/teams/:teamCode/github/repository
       - Unlink/delete repository

POST   /api/team-lead/teams/:teamCode/github/collaborators
       - Add team members as collaborators
       - Body: { userCodes: string[], permission: 'read'|'write'|'admin' }

GET    /api/team-lead/teams/:teamCode/github/collaborators
       - List all collaborators with status

DELETE /api/team-lead/teams/:teamCode/github/collaborators/:userCode
       - Remove collaborator

GET    /api/team-lead/teams/:teamCode/github/pull-requests
       - List all PRs for team repositories
       - Query: ?state=open|closed|merged&author=userCode

GET    /api/team-lead/teams/:teamCode/github/pull-requests/:prNumber
       - Get PR details

POST   /api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/review
       - Submit review (approve, request changes, comment)
       - Body: { state: 'approved'|'changes_requested'|'commented', body: string }

POST   /api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/merge
       - Merge PR
       - Body: { mergeMethod: 'merge'|'squash'|'rebase', deleteBranch: boolean }

GET    /api/team-lead/teams/:teamCode/github/graph
       - Get git graph visualization data
       - Query: ?branch=main&since=2024-01-01&until=2024-12-31
```

#### Team Member Endpoints

```
POST   /api/employee/github/connect
       - Initiate GitHub OAuth flow
       - Returns authorization URL

GET    /api/employee/github/status
       - Check GitHub connection status
       - Returns: { connected: boolean, username: string, avatar: string }

DELETE /api/employee/github/disconnect
       - Disconnect GitHub account

GET    /api/employee/github/repositories
       - List repositories where member is collaborator
       - Returns repositories with access level

GET    /api/employee/github/repositories/:repoId/branches
       - List branches in repository

POST   /api/employee/github/repositories/:repoId/branches
       - Create new branch
       - Body: { branchName: string, baseBranch: string }

GET    /api/employee/github/repositories/:repoId/pull-requests
       - List member's PRs (created by them)

POST   /api/employee/github/repositories/:repoId/pull-requests
       - Create pull request
       - Body: { title, description, baseBranch, headBranch, reviewers: string[], labels: string[] }

GET    /api/employee/github/pull-requests/:prId
       - Get PR details with reviews

POST   /api/employee/github/pull-requests/:prId/request-review
       - Re-request review after fixes

GET    /api/employee/github/graph/:repoId
       - Get git graph for repository
```

#### Webhook Endpoint

```
POST   /api/webhooks/github
       - GitHub webhook receiver
       - Handles: pull_request, pull_request_review, push, create, delete events
       - No auth required (verified via webhook secret)
```

### Webhook Event Handling

**Subscribed Events:**
- `pull_request` - PR opened, closed, reopened, edited, merged
- `pull_request_review` - Review submitted, edited, dismissed
- `pull_request_review_comment` - Comment added on PR
- `push` - Code pushed to repository
- `create` - Branch/tag created
- `delete` - Branch/tag deleted
- `member` - Collaborator added/removed

**Event Processing:**
1. Verify webhook signature
2. Parse event type and payload
3. Update database (pull_requests, pr_reviews, branches tables)
4. Create notifications for relevant users
5. Update plugin_data for activity tracking

---

## Frontend Components

### Component Structure

```
frontend/src/components/github/
├── GitHubConnection.tsx          - OAuth connection component
├── RepositoryCard.tsx            - Display repository info
├── RepositoryList.tsx            - List of repositories
├── CreateRepositoryModal.tsx     - Modal for creating repo
├── BranchList.tsx                - Display branches
├── CreateBranchModal.tsx         - Modal for creating branch
├── PullRequestCard.tsx           - Display PR info
├── PullRequestList.tsx           - List of PRs
├── CreatePullRequestModal.tsx    - Modal for creating PR
├── PullRequestReview.tsx         - PR review interface
├── CollaboratorList.tsx          - Display collaborators
├── AddCollaboratorModal.tsx      - Modal for adding collaborators
├── GitGraph.tsx                  - Git graph visualization
└── GitHubNotification.tsx        - PR notification component
```

### Key UI Features

#### 1. Connection Status Badge
```tsx
<GitHubConnection>
  {connected ? (
    <div className="connected-badge">
      <img src={avatar} alt={username} />
      <span>@{username}</span>
      <button>Disconnect</button>
    </div>
  ) : (
    <button onClick={connectGitHub}>Connect GitHub</button>
  )}
</GitHubConnection>
```

#### 2. Repository Dashboard (Team Lead)
```tsx
<RepositoryDashboard teamCode={teamCode}>
  {!repository ? (
    <CreateRepositoryButton onClick={openModal} />
  ) : (
    <>
      <RepositoryCard repository={repository} />
      <CollaboratorList collaborators={collaborators} />
      <PullRequestList prs={prs} onReview={handleReview} />
      <GitGraph data={graphData} />
    </>
  )}
</RepositoryDashboard>
```

#### 3. Branch Management (Team Member)
```tsx
<BranchManagement repoId={repoId}>
  <BranchList branches={branches} />
  <CreateBranchButton onClick={openBranchModal} />

  {myBranches.map(branch => (
    <BranchCard key={branch.id}>
      <h4>{branch.name}</h4>
      <p>{branch.commitsAhead} commits ahead</p>
      {branch.commitsAhead > 0 && (
        <RaisePRButton branch={branch} onClick={openPRModal} />
      )}
    </BranchCard>
  ))}
</BranchManagement>
```

#### 4. Pull Request Review Interface (Team Lead)
```tsx
<PullRequestReview pr={pr}>
  <PRHeader pr={pr} />
  <PRDescription description={pr.description} />
  <FileChanges files={pr.files} />

  <ReviewActions>
    <Button onClick={viewOnGitHub}>View Diff on GitHub</Button>
    <Button onClick={() => submitReview('commented')}>Comment</Button>
    <Button onClick={() => submitReview('changes_requested')} variant="warning">
      Request Changes
    </Button>
    <Button onClick={() => submitReview('approved')} variant="success">
      Approve & Merge
    </Button>
  </ReviewActions>

  <ReviewForm visible={reviewFormOpen}>
    <TextArea placeholder="Review comments..." />
    <MergeMethodSelect options={['merge', 'squash', 'rebase']} />
    <Checkbox label="Delete branch after merge" />
    <Button type="submit">Submit Review</Button>
  </ReviewForm>
</PullRequestReview>
```

#### 5. Git Graph Visualization
```tsx
<GitGraph data={graphData}>
  {/* Using react-git-graph or custom D3.js visualization */}
  <Graph
    commits={commits}
    branches={branches}
    merges={merges}
    authors={authors}
    onCommitClick={handleCommitClick}
    onBranchClick={handleBranchClick}
    colorScheme={colorByAuthor}
    timeRange={timeRange}
  />

  <GraphFilters>
    <Select label="Branch" options={branches} />
    <DateRangePicker onChange={setTimeRange} />
    <AuthorFilter authors={authors} />
  </GraphFilters>
</GitGraph>
```

### Recommended Libraries

1. **Git Graph Visualization:**
   - `react-git-graph` - Pre-built git graph component
   - `@visx/visx` - Low-level visualization primitives
   - `d3-dag` - DAG layout algorithms
   - Custom D3.js implementation for full control

2. **Code Diff Display:**
   - `react-diff-viewer` - Side-by-side diff viewer
   - `monaco-editor` - VS Code editor for inline code viewing

3. **Markdown Rendering:**
   - `react-markdown` - Render PR descriptions

4. **Notifications:**
   - `react-hot-toast` - Toast notifications
   - Existing notification system in UPEA

---

## Security Considerations

### 1. Token Storage
- **Never store GitHub tokens in plain text**
- Use encryption (existing `EncryptionUtil` in codebase)
- Store admin/team-lead tokens in `plugin_sources.config` (encrypted)
- Store member tokens in `users.github_access_token_encrypted`

### 2. Webhook Verification
- Validate webhook signature using `X-Hub-Signature-256` header
- Use HMAC SHA256 with webhook secret
- Reject unverified webhook requests

### 3. OAuth Security
- Use `state` parameter to prevent CSRF attacks
- Validate `state` on callback
- Use secure, short-lived authorization codes

### 4. Permission Checks
- Verify user has access to repository before operations
- Check team membership before allowing repository access
- Validate collaborator status from GitHub API, not just database

### 5. Rate Limiting
- Implement rate limiting on webhook endpoint (prevent abuse)
- Cache GitHub API responses to reduce API calls
- Use conditional requests (`If-Modified-Since`, `ETag`)

### 6. Input Validation
- Sanitize branch names (no special chars, max length)
- Validate repository names (GitHub naming rules)
- Sanitize PR titles and descriptions (prevent XSS)

### 7. RBAC Enforcement
- Team leads can only manage their team's repositories
- Employees can only access repositories where they're collaborators
- Admins have full access (audit purposes)

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Set up database, OAuth flow, and basic repository management

**Tasks:**
1. Create database migrations for new tables
2. Enhance `GitHubOAuthService` to support repository scopes
3. Update `users` table with new GitHub fields
4. Create `GitHubRepositoryService` with create/list methods
5. Create `GitHubRepositoryHandler` with endpoints:
   - POST `/api/team-lead/teams/:teamCode/github/repository`
   - GET `/api/team-lead/teams/:teamCode/github/repository`
6. Create repositories: `GithubRepositoryRepository`, `GithubCollaboratorRepository`
7. Frontend: `CreateRepositoryModal`, `RepositoryCard`
8. Test repository creation flow end-to-end

**Deliverables:**
- Team leads can create GitHub repositories via UI
- Repositories are linked to teams in database
- Team leads can view repository details

---

### Phase 2: Collaborator Management (Week 2-3)
**Goal:** Add team members as collaborators

**Tasks:**
1. Implement `addCollaborator()`, `listCollaborators()` in `GitHubRepositoryService`
2. Create endpoints:
   - POST `/api/team-lead/teams/:teamCode/github/collaborators`
   - GET `/api/team-lead/teams/:teamCode/github/collaborators`
   - DELETE `/api/team-lead/teams/:teamCode/github/collaborators/:userCode`
3. Employee GitHub connection enhancement:
   - Update `/api/employee/github/connect` to request full repo scopes
   - Add `/api/employee/github/status` endpoint
4. Sync collaborator status (invitation accepted/pending)
5. Frontend: `AddCollaboratorModal`, `CollaboratorList`
6. Notifications: "You've been added to repository X"
7. Test collaborator flow: invite → accept → access

**Deliverables:**
- Team leads can add/remove collaborators
- Team members can see repository access on their dashboard
- Invitation status tracking

---

### Phase 3: Branch Management (Week 3-4)
**Goal:** Enable branch creation from UI

**Tasks:**
1. Create `GitHubBranchService`:
   - `listBranches()`
   - `createBranch()`
   - `syncBranches()`
2. Create `GithubBranchRepository` with CRUD operations
3. Create endpoints:
   - GET `/api/employee/github/repositories/:repoId/branches`
   - POST `/api/employee/github/repositories/:repoId/branches`
4. Frontend: `BranchList`, `CreateBranchModal`
5. Branch naming validation (enforce conventions like `feature/`, `bugfix/`)
6. Display user's active branches
7. Test branch creation and sync

**Deliverables:**
- Team members can create branches via UI
- Branch list displays all branches with metadata
- User's branches are highlighted

---

### Phase 4: Pull Request Creation (Week 4-5)
**Goal:** Enable PR creation and listing

**Tasks:**
1. Create `GitHubPRService`:
   - `createPullRequest()`
   - `listPullRequests()`
   - `getPullRequest()`
2. Create `GithubPRRepository` and `GithubPRReviewRepository`
3. Create endpoints:
   - POST `/api/employee/github/repositories/:repoId/pull-requests`
   - GET `/api/employee/github/pull-requests`
   - GET `/api/team-lead/teams/:teamCode/github/pull-requests`
4. Auto-fill PR description from commit messages
5. Frontend: `CreatePullRequestModal`, `PullRequestList`, `PullRequestCard`
6. Notification: "PR created, review requested from Team Lead"
7. Test PR creation flow

**Deliverables:**
- Team members can raise PRs via one-click button
- PRs are listed for both members and team leads
- Notifications sent to reviewers

---

### Phase 5: PR Review Workflow (Week 5-6)
**Goal:** Enable team leads to review, approve, and merge PRs

**Tasks:**
1. Enhance `GitHubPRService`:
   - `submitReview()`
   - `requestReview()`
   - `mergePullRequest()`
2. Create endpoints:
   - POST `/api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/review`
   - POST `/api/team-lead/teams/:teamCode/github/pull-requests/:prNumber/merge`
   - POST `/api/employee/github/pull-requests/:prId/request-review`
3. Frontend: `PullRequestReview` component with review actions
4. Notifications:
   - "Changes requested on your PR"
   - "Your PR was approved"
   - "Your PR was merged"
5. Test full review cycle: create → review → request changes → fix → approve → merge

**Deliverables:**
- Team leads can approve, request changes, and merge PRs
- Team members receive feedback notifications
- PR status updates in real-time

---

### Phase 6: Webhooks & Real-time Updates (Week 6-7)
**Goal:** Set up GitHub webhooks for real-time synchronization

**Tasks:**
1. Create `GitHubWebhookService`:
   - `createWebhook()`
   - `handleWebhookEvent()`
   - `verifyWebhookSignature()`
2. Create webhook handler endpoint:
   - POST `/api/webhooks/github`
3. Implement webhook event processors:
   - `pull_request` events
   - `pull_request_review` events
   - `push` events
   - `create`/`delete` events (branches)
4. Auto-create webhook when repository is created
5. Update database on webhook events
6. Trigger notifications on webhook events
7. Test webhook flow with ngrok/production URL

**Deliverables:**
- GitHub events automatically sync to UPEA database
- Real-time notifications for PR events
- No need for manual sync

---

### Phase 7: Git Graph Visualization (Week 7-8)
**Goal:** Provide visual git graph like IDE

**Tasks:**
1. Create `GitHubGraphService`:
   - `getCommitGraph()`
   - `getBranchesWithCommits()`
   - `getPRsWithMergeHistory()`
2. Fetch commit history with parent relationships
3. Create endpoints:
   - GET `/api/team-lead/teams/:teamCode/github/graph`
   - GET `/api/employee/github/graph/:repoId`
4. Frontend: `GitGraph` component using D3.js or library
5. Features:
   - Color-coded by author
   - Interactive commit details
   - Branch visualization
   - Merge commit highlighting
6. Filters: date range, author, branch
7. Test with complex merge history

**Deliverables:**
- Interactive git graph on team lead dashboard
- Team members can view repository graph
- Filters for customization

---

### Phase 8: Polish & Optimization (Week 8+)
**Goal:** Improve UX, performance, and edge cases

**Tasks:**
1. Implement caching strategy for GitHub API calls
2. Add loading states and optimistic UI updates
3. Error handling and user-friendly messages
4. Add search and filters to PR list
5. PR templates (auto-fill description)
6. Branch protection rules UI
7. Activity feed (timeline of repo events)
8. Performance monitoring for API calls
9. Documentation and training materials
10. E2E testing with Playwright/Cypress

**Deliverables:**
- Polished, production-ready UI
- Fast, responsive interactions
- Comprehensive error handling
- Complete documentation

---

## Recommendations & Improvements

### 1. Use GitHub App Instead of OAuth App
**Benefit:** Better security, granular permissions, higher rate limits

**Changes:**
- Create GitHub App in organization settings
- Install app on organization/repositories
- Use installation access tokens (expire after 1 hour)
- Refresh tokens automatically

### 2. Implement Repository Templates
**Feature:** Pre-configured repository templates for common project types

**Benefit:**
- Consistent project structure
- Include CI/CD workflows, linting, testing setup
- Faster onboarding

### 3. PR Templates & Auto-fill
**Feature:** Template for PR descriptions with checklist

**Example:**
```markdown
## Summary
[Brief description]

## Changes
- [ ] Feature implementation
- [ ] Tests added
- [ ] Documentation updated

## Screenshots (if applicable)

## Related Issues
Closes #123
```

### 4. Code Review Inline Comments (Future Enhancement)
**Feature:** Allow inline code comments within UPEA UI

**Benefit:** Reviewers don't need to leave UPEA
**Challenge:** Complex implementation, requires Monaco editor integration

### 5. CI/CD Status Integration
**Feature:** Show GitHub Actions workflow status on PRs

**Benefit:** Reviewers can see if tests passed before merging
**Implementation:** Subscribe to `check_suite` and `workflow_run` webhook events

### 6. Protected Branches
**Feature:** UI to configure branch protection rules

**Example:**
- Require PR reviews before merge
- Require status checks to pass
- Require linear history

### 7. Merge Conflict Detection
**Feature:** Warn users if PR has merge conflicts

**Implementation:** Check `mergeable` field from GitHub API

### 8. Activity Timeline
**Feature:** Unified timeline showing all repository activity

**Benefit:** Easy tracking of who did what and when
**Display:** Commits, PRs, reviews, merges, branches created/deleted

### 9. GitHub Insights Dashboard
**Feature:** Analytics dashboard with metrics

**Metrics:**
- PR merge time (average, median)
- Review turnaround time
- Commits per day/week
- Most active contributors
- PR acceptance rate

### 10. Draft PRs
**Feature:** Support draft pull requests

**Benefit:** Team members can get early feedback without formal review request

### 11. Auto-assign Reviewers
**Feature:** Automatically assign reviewers based on CODEOWNERS or team lead

**Implementation:** Use GitHub's `CODEOWNERS` file or default to team lead

### 12. PR Size Warnings
**Feature:** Warn users if PR is too large (> 500 lines)

**Benefit:** Encourages smaller, more reviewable PRs

### 13. Repository Settings Management
**Feature:** Configure repository settings from UPEA

**Settings:**
- Default branch
- Visibility (public/private)
- Features (Issues, Wiki, Projects)
- Allow merge commit, squash, rebase

### 14. Multi-Repository Support
**Feature:** Team can manage multiple repositories

**Benefit:** Teams working on microservices or multiple projects

### 15. Notification Preferences
**Feature:** Granular control over GitHub notifications

**Options:**
- Email, in-app, or both
- Notify on: PR created, review requested, changes requested, approved, merged
- Quiet hours

---

## Migration Plan for Existing Data

If there's existing GitHub data (commits, PRs) in `plugin_data` table:

1. **Backfill `github_pull_requests` table:**
   - Query `plugin_data` where `entity_type = 'pr'`
   - Parse JSON data and insert into `github_pull_requests`

2. **Backfill `github_repositories` table:**
   - Extract repository info from `teams.github_repository`
   - Fetch details from GitHub API
   - Insert into `github_repositories`

3. **Sync collaborators:**
   - For each repository, call GitHub API to get collaborators
   - Match with UPEA users via `github_user_id`
   - Insert into `github_collaborators`

---

## Testing Strategy

### Unit Tests
- Test each service method in isolation
- Mock GitHub API responses
- Test error handling (rate limits, auth failures)

### Integration Tests
- Test full flows: create repo → add collaborators → create branch → create PR → review → merge
- Use GitHub API sandbox or test organization

### E2E Tests
- Playwright/Cypress tests for UI workflows
- Test OAuth flow, repository creation, PR creation
- Test notification delivery

### Webhook Testing
- Use ngrok for local webhook testing
- Simulate webhook events with GitHub API
- Test signature verification

---

## Risks & Mitigation

### Risk 1: GitHub API Rate Limiting
**Mitigation:**
- Implement aggressive caching
- Use conditional requests (ETags)
- Use GitHub GraphQL API for complex queries
- Consider GitHub App for higher rate limits (15,000/hour)

### Risk 2: OAuth Token Expiration
**Mitigation:**
- Use refresh tokens (if GitHub App)
- Detect 401 errors and prompt re-authentication
- Store token expiration time

### Risk 3: Webhook Delivery Failures
**Mitigation:**
- GitHub retries webhooks automatically
- Implement idempotent event processing
- Log failed events for manual retry

### Risk 4: Sync Lag Between GitHub and UPEA
**Mitigation:**
- Webhooks provide real-time updates
- Fallback: periodic sync job (every 15 minutes)
- Show sync status to users

### Risk 5: Large PRs with Many Files
**Mitigation:**
- Limit file diff display (e.g., first 20 files)
- Link to GitHub for full diff
- Warn users about large PRs

### Risk 6: User Confusion (Git vs UPEA)
**Mitigation:**
- Clear documentation and onboarding
- Tooltips and help text
- Training videos

---

## Conclusion

This implementation plan provides a comprehensive roadmap for integrating GitHub into UPEA with a user-friendly, button-driven interface. The phased approach allows for incremental development and testing, ensuring each feature is solid before moving to the next.

**Key Success Factors:**
1. **Simplicity** - One-click operations for common tasks
2. **Visibility** - Clear status indicators and notifications
3. **Integration** - Seamless sync between GitHub and UPEA
4. **Security** - Proper token handling and permission checks
5. **Performance** - Caching and rate limit management

**Next Steps:**
1. Review and approve this plan
2. Prioritize features (if needed, reduce scope for MVP)
3. Set up GitHub App or OAuth App
4. Begin Phase 1 implementation
5. Iterate based on user feedback

---

**Document Version:** 1.0
**Last Updated:** 2026-01-16
**Author:** Claude Sonnet 4.5
**Status:** Draft - Pending Review
