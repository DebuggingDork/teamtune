# GitHub OAuth Backend Redirect Configuration

## Issue
After GitHub OAuth authorization, the backend was redirecting to the **backend URL** instead of the **frontend URL**, causing a "Cannot GET /admin/plugins" error.

## Solution
The backend should redirect to the **frontend URL** after processing the OAuth callback.

## Backend Redirect URLs

### For Admin GitHub Connection
After processing the OAuth callback, redirect to:
```
{FRONTEND_URL}/admin/plugins?status=success&message=GitHub%20connected%20successfully
```

**Example:**
```
http://localhost:8080/admin/plugins?status=success
```

### For Employee GitHub Connection
After processing the OAuth callback, redirect to:
```
{FRONTEND_URL}/employee/github?status=success&message=GitHub%20connected%20successfully
```

**Example:**
```
http://localhost:8080/employee/github?status=success
```

## Query Parameters

### Success Response
```
?status=success&message=GitHub%20connected%20successfully
```

### Error Response
```
?status=error&error=Connection%20failed&message=Unable%20to%20connect%20GitHub%20account
```

## Complete OAuth Flow

### 1. User Initiates Connection
**Frontend** → User clicks "Connect GitHub"
```
Redirects to: {BACKEND_URL}/api/admin/plugins/github/connect?token={JWT_TOKEN}
```

### 2. Backend Initiates OAuth
**Backend** → Validates token and redirects to GitHub
```
302 Redirect to: https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&state=xxx
```

### 3. User Authorizes on GitHub
**GitHub** → User authorizes the application
```
Redirects to: {BACKEND_URL}/api/github/oauth/callback?code=xxx&state=xxx
```

### 4. Backend Processes Callback
**Backend** → Exchanges code for token and stores connection
- Exchange OAuth code for access token
- Store GitHub connection in database
- Associate with user (from state or session)

### 5. Backend Redirects to Frontend ⭐ **THIS IS THE KEY STEP**
**Backend** → Redirects to frontend callback page

**For Admin:**
```javascript
// Success
res.redirect(`${FRONTEND_URL}/admin/plugins?status=success&message=GitHub%20connected%20successfully`);

// Error
res.redirect(`${FRONTEND_URL}/admin/plugins?status=error&error=Connection%20failed`);
```

**For Employee:**
```javascript
// Success
res.redirect(`${FRONTEND_URL}/employee/github?status=success&message=GitHub%20connected%20successfully`);

// Error
res.redirect(`${FRONTEND_URL}/employee/github?status=error&error=Connection%20failed`);
```

### 6. Frontend Displays Result
**Frontend** → Shows success/error message and redirects to dashboard
- Displays success or error message
- Auto-redirects to appropriate dashboard after 3 seconds
- User can manually click "Go to Dashboard"

## Environment Variables Required

### Backend
```env
FRONTEND_URL=http://localhost:8080
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://upea.onrender.com/api/github/oauth/callback
```

### Frontend
```env
VITE_API_BASE_URL=https://upea.onrender.com
VITE_TOKEN_STORAGE_KEY=upea_token
```

## Backend Implementation Example

```javascript
// GitHub OAuth callback handler
app.get('/api/github/oauth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code);
    const accessToken = tokenResponse.access_token;
    
    // Get GitHub user info
    const githubUser = await getGitHubUser(accessToken);
    
    // Store connection in database
    await storeGitHubConnection({
      userId: getUserIdFromState(state), // or from session
      githubUsername: githubUser.login,
      githubUserId: githubUser.id,
      accessToken: encryptToken(accessToken),
      avatarUrl: githubUser.avatar_url,
    });
    
    // Determine redirect URL based on user role
    const userRole = getUserRoleFromState(state);
    const redirectPath = userRole === 'admin' 
      ? '/admin/plugins' 
      : '/employee/github';
    
    // ⭐ Redirect to FRONTEND, not backend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    res.redirect(`${frontendUrl}${redirectPath}?status=success&message=GitHub%20connected%20successfully`);
    
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    
    // Redirect to frontend with error
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const redirectPath = '/admin/plugins'; // or determine from state
    res.redirect(`${frontendUrl}${redirectPath}?status=error&error=${encodeURIComponent(error.message)}`);
  }
});
```

## Testing Checklist

- [ ] Backend has `FRONTEND_URL` environment variable set
- [ ] Backend redirects to frontend URL, not backend URL
- [ ] Success redirects include `?status=success` parameter
- [ ] Error redirects include `?status=error&error=...` parameters
- [ ] Frontend callback page displays success message
- [ ] Frontend callback page displays error message
- [ ] Auto-redirect to dashboard works after 3 seconds
- [ ] Manual "Go to Dashboard" button works
- [ ] GitHub connection status is updated in database
- [ ] GitHub connection status is reflected in UI

## Common Issues

### Issue: "Cannot GET /admin/plugins"
**Cause:** Backend is redirecting to backend URL instead of frontend URL
**Solution:** Update backend to use `FRONTEND_URL` environment variable

### Issue: Callback page shows but no status
**Cause:** Backend is not including query parameters
**Solution:** Add `?status=success` or `?status=error` to redirect URL

### Issue: User sees backend URL in browser
**Cause:** Backend redirect URL is incorrect
**Solution:** Verify `FRONTEND_URL` is set correctly in backend environment

## Production Deployment

### Backend Environment
```env
FRONTEND_URL=https://your-frontend-domain.com
GITHUB_CALLBACK_URL=https://your-backend-domain.com/api/github/oauth/callback
```

### Frontend Environment
```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

Make sure these URLs match your actual deployment domains!
