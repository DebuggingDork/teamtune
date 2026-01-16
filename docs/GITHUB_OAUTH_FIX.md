# GitHub OAuth Integration Fix

## Problem
The GitHub OAuth connect buttons were making XHR/fetch requests to the backend, which caused **CORS errors** when the backend tried to redirect to GitHub's OAuth authorization page.

### Root Cause
OAuth authorization flows **require a browser redirect**, not an AJAX call. GitHub's OAuth endpoint (`github.com/login/oauth/authorize`) doesn't allow cross-origin requests, so any attempt to call it via `fetch()` or `axios` results in a CORS error.

## Solution
Changed the implementation from **AJAX mutations** to **direct browser redirects**.

### Before (Wrong Implementation)
```typescript
// ❌ This causes CORS error
const handleConnect = () => {
  connectMutation.mutate(undefined, {
    onSuccess: (data) => {
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    }
  });
};
```

### After (Correct Implementation)
```typescript
// ✅ Direct browser redirect with authentication token
const handleConnect = () => {
  // OAuth flows require direct browser redirect, not AJAX calls
  // This prevents CORS errors when redirecting to GitHub's OAuth page
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
  window.location.href = `${apiBase}/api/employee/github/connect?token=${token}`;
};
```

## Files Modified

### 1. Admin Settings (`src/components/admin/AdminSettings.tsx`)
- **Removed**: `useConnectGitHubPlugin` hook and mutation
- **Updated**: `handleConnectPlugin` to use direct redirect
- **Removed**: Loading state for GitHub connection button

### 2. Employee GitHub Connection (`src/components/github/GitHubConnectionCard.tsx`)
- **Removed**: `useConnectGitHub` hook and mutation
- **Updated**: `handleConnect` to use direct redirect
- **Removed**: Loading state for connect button

### 3. Admin Service (`src/services/admin.service.ts`)
- **Updated**: `getPlugins` function to handle both array and object response formats
- **Note**: `connectGitHubPlugin` service function is now unused (can be removed in cleanup)

## OAuth Flow (How it Works Now)

1. **User clicks "Connect GitHub"** → Browser navigates to backend endpoint with authentication token
   - Admin: `{API_BASE}/api/admin/plugins/github/connect?token={JWT_TOKEN}`
   - Employee: `{API_BASE}/api/employee/github/connect?token={JWT_TOKEN}`

2. **Backend validates token and responds with 302 redirect** to GitHub OAuth page
   - Example: `https://github.com/login/oauth/authorize?client_id=...&state=...`

3. **Browser follows redirect to GitHub** (user authorizes the app)

4. **GitHub redirects back to backend callback URL**
   - Example: `{API_BASE}/api/github/oauth/callback?code=...&state=...`

5. **Backend processes the OAuth code** and redirects to frontend success/error page

## Important Notes

- ✅ **DO NOT** use `fetch()`, `axios`, or any AJAX for OAuth initiation
- ✅ The button should trigger a **full page navigation**
- ✅ **Authentication token must be passed** as a query parameter `?token=xxx`
- ✅ Handle the callback redirect on your success/error pages
- ✅ The backend endpoint should return a **302 redirect**, not JSON
- ✅ Token is retrieved from localStorage using the configured storage key

## Alternative Implementations (Not Used)

### Option 2: Form Submission (if POST is required)
```typescript
const connectGitHub = () => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `${API_BASE_URL}/api/admin/plugins/github/connect`;
  document.body.appendChild(form);
  form.submit();
};
```

### Option 3: Open in Popup Window
```typescript
const connectGitHub = () => {
  window.open(
    `${API_BASE_URL}/api/admin/plugins/github/connect`,
    'github-oauth',
    'width=600,height=700'
  );
};
```

## Testing

To test the fix:

1. Navigate to Admin Settings or Employee Dashboard
2. Click "Connect GitHub" button
3. Browser should redirect to GitHub OAuth page (no CORS errors)
4. After authorization, GitHub redirects back to the backend callback
5. Backend processes and redirects to frontend success page

## Cleanup Recommendations

The following functions are now unused and can be removed:

- `src/services/admin.service.ts` → `connectGitHubPlugin()`
- `src/services/github.service.ts` → `connectGitHub()`
- `src/hooks/useAdmin.ts` → `useConnectGitHubPlugin()`
- `src/hooks/useGithub.ts` → `useConnectGitHub()`

However, they are left in place for now in case they're needed for other purposes or future refactoring.
