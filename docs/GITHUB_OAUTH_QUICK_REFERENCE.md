# GitHub OAuth Implementation - Quick Reference

## Admin GitHub Connect

```typescript
const handleConnectPlugin = (pluginId: string) => {
  if (pluginId === 'github') {
    // OAuth flows require direct browser redirect, not AJAX calls
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://upea.onrender.com';
    const token = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'upea_token');
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect GitHub.",
        variant: "destructive",
      });
      return;
    }
    
    // Pass token as query parameter for backend authentication
    window.location.href = `${apiBase}/api/admin/plugins/github/connect?token=${token}`;
  }
};
```

## Employee GitHub Connect

```typescript
const handleConnect = () => {
  // OAuth flows require direct browser redirect, not AJAX calls
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://upea.onrender.com';
  const token = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'upea_token');
  
  if (!token) {
    console.error('No authentication token found');
    return;
  }
  
  // Pass token as query parameter for backend authentication
  window.location.href = `${apiBase}/api/employee/github/connect?token=${token}`;
};
```

## Key Points

### ✅ DO
- Use `window.location.href` for browser redirect
- Pass authentication token as query parameter `?token=xxx`
- Retrieve token from localStorage using the configured storage key
- Validate token exists before redirecting
- Handle missing token gracefully with user feedback

### ❌ DON'T
- Use `fetch()`, `axios`, or any AJAX calls
- Forget to include the authentication token
- Use mutation hooks or loading states
- Try to handle the OAuth flow client-side

## Environment Variables

Make sure these are configured in your `.env` file:

```env
VITE_API_BASE_URL=https://upea.onrender.com
VITE_TOKEN_STORAGE_KEY=upea_token
```

## Backend Expectations

The backend endpoints should:

1. **Receive**: GET request with `?token=xxx` query parameter
2. **Validate**: The JWT token for authentication
3. **Respond**: 302 redirect to GitHub OAuth authorization URL
4. **Include**: State parameter for security (optional but recommended)

Example backend redirect:
```
Location: https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&state=xxx
```

## OAuth Callback Flow

After user authorizes on GitHub:

1. GitHub redirects to: `{API_BASE}/api/github/oauth/callback?code=xxx&state=xxx`
2. Backend exchanges code for access token
3. Backend stores GitHub connection in database
4. Backend redirects to frontend success page

## Testing Checklist

- [ ] Token is correctly retrieved from localStorage
- [ ] Token is appended to the URL as query parameter
- [ ] Browser redirects to backend endpoint (no CORS errors)
- [ ] Backend redirects to GitHub OAuth page
- [ ] After authorization, user is redirected back to the app
- [ ] GitHub connection status is updated in the UI

## Troubleshooting

### Issue: "Authentication Required" error
**Solution**: User is not logged in. Ensure user has a valid token in localStorage.

### Issue: CORS error
**Solution**: You're using fetch/axios instead of window.location.href. Use direct redirect.

### Issue: Token not found
**Solution**: Check that VITE_TOKEN_STORAGE_KEY matches the key used in your auth system.

### Issue: Infinite redirect loop
**Solution**: Backend might not be handling the token correctly. Check backend logs.
