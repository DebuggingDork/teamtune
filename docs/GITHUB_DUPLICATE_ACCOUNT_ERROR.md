# GitHub Connection Error: Duplicate GitHub Account

## Issue
**Error Message:** `duplicate key value violates unique constraint "users_github_user_id_key"`

**When it occurs:** When a team member tries to connect their GitHub account in the Member Dashboard.

## What This Means

This error occurs when the GitHub account you're trying to connect is **already linked to another user** in the system. The database has a unique constraint that prevents the same GitHub account from being connected to multiple users.

## Why This Happens

1. **Previous Account:** You may have previously connected this GitHub account to a different user account that was later deleted, but the GitHub link wasn't cleaned up.

2. **Shared Account:** Someone else in your organization is already using this GitHub account (not recommended - each person should have their own GitHub account).

3. **Account Migration:** You're trying to move your GitHub connection from one user account to another.

4. **Database Inconsistency:** There may be orphaned data in the database from a previous user.

## Solutions

### For Team Members:

#### Option 1: Use a Different GitHub Account (Recommended)
- Create a new GitHub account or use a different existing one
- Each person should have their own personal GitHub account
- Connect that account instead

#### Option 2: Contact Your Administrator
Ask your administrator to:
- Check which user account has this GitHub account connected
- Unlink the GitHub account from the other user (if appropriate)
- Clean up any orphaned GitHub connections in the database

### For Administrators:

#### Option 1: Unlink the GitHub Account from the Database
If you have database access, you can manually unlink the GitHub account:

```sql
-- Find which user has this GitHub account
SELECT user_code, full_name, email, github_username, github_user_id 
FROM users 
WHERE github_user_id = '<the_github_user_id>';

-- If you want to unlink it from that user:
UPDATE users 
SET github_user_id = NULL, 
    github_username = NULL, 
    github_avatar_url = NULL,
    github_access_token_encrypted = NULL,
    github_connected_at = NULL,
    github_scopes = NULL
WHERE github_user_id = '<the_github_user_id>';
```

#### Option 2: Backend API Endpoint (Recommended)
The backend should provide an admin endpoint to manage GitHub connections:

```
DELETE /api/admin/users/:userCode/github
```

This would safely disconnect a user's GitHub account and clean up all related data.

#### Option 3: Check for Orphaned Data
Sometimes deleted users leave behind GitHub connections:

```sql
-- Find GitHub connections where the user no longer exists
SELECT github_user_id, github_username 
FROM users 
WHERE github_user_id IS NOT NULL 
AND deleted_at IS NOT NULL;

-- Clean up orphaned connections
UPDATE users 
SET github_user_id = NULL, 
    github_username = NULL 
WHERE deleted_at IS NOT NULL;
```

## Frontend Improvements Made

### 1. Better Error Messages
Updated `GitHubCallbackPage.tsx` to provide user-friendly error messages:

```typescript
if (errorMessage.includes('duplicate key') || errorMessage.includes('users_github_user_id_key')) {
    return 'This GitHub account is already connected to another user in the system. Each GitHub account can only be linked to one user. Please use a different GitHub account or contact your administrator if you believe this is an error.';
}
```

### 2. Actionable Help Section
Added a help box that appears when this error occurs, showing users what they can do:

- Use a different GitHub account
- Contact administrator
- Request cleanup of old connections

## Prevention

### For Organizations:

1. **One Account Per Person:** Ensure each team member has their own GitHub account
2. **Proper Offboarding:** When removing users, clean up their GitHub connections
3. **User Education:** Inform users about the one-to-one relationship between user accounts and GitHub accounts

### For Developers:

1. **Soft Deletes:** When implementing user deletion, ensure GitHub connections are cleaned up
2. **Admin Tools:** Provide admin endpoints to manage GitHub connections
3. **Better Validation:** Check for existing connections before attempting to link
4. **Cascade Deletes:** Consider database triggers or application logic to clean up related data

## Backend Recommendations

### Add Disconnect Endpoint
```typescript
// For employees to disconnect their own GitHub
DELETE /api/employee/github/disconnect

// For admins to disconnect any user's GitHub
DELETE /api/admin/users/:userCode/github/disconnect
```

### Add Connection Check Endpoint
```typescript
// Check if a GitHub account is already connected
GET /api/admin/github/check/:githubUserId
Response: {
  connected: boolean,
  user?: { user_code, full_name, email }
}
```

### Improve Error Handling
The backend should return more specific error codes:

```json
{
  "error": "GITHUB_ACCOUNT_ALREADY_LINKED",
  "message": "This GitHub account is already connected to another user",
  "details": {
    "github_username": "johndoe",
    "linked_to_user": "EMP001" // Only if admin
  }
}
```

## Testing

To test the improved error handling:

1. Connect a GitHub account to User A
2. Try to connect the same GitHub account to User B
3. Verify the user-friendly error message appears
4. Verify the help section with actionable steps is shown
5. Verify users can navigate back or go to dashboard

## Related Files

- `src/pages/GitHubCallbackPage.tsx` - Error handling and display
- `src/hooks/useGithub.ts` - GitHub connection hooks
- `src/services/github.service.ts` - GitHub API service
- `docs/BACKEND_GITHUB_OAUTH_REQUIREMENTS.md` - Backend requirements

## Status

✅ **Frontend Improvements Complete**
- Better error messages
- Actionable help section
- User-friendly guidance

⚠️ **Backend Improvements Needed**
- Add disconnect endpoints
- Add connection check endpoints
- Improve error response format
- Add admin tools for managing connections
