# GitHub OAuth Complete Flow - Testing & Debugging Guide

## 🔴 CURRENT ISSUE
After connecting GitHub via OAuth, the status still shows "Disconnected" instead of "Connected".

## 🔍 ROOT CAUSE ANALYSIS

### Possible Issues:
1. **Backend not saving the connection** - OAuth callback completes but doesn't update database
2. **Frontend not detecting the status** - API returns data but frontend can't read it
3. **Cache not invalidating** - Old data is cached and not refreshing

## ✅ COMPLETE OAUTH FLOW (What SHOULD Happen)

### Step 1: User Clicks "Connect" Button
**Frontend Action:**
```typescript
// In AdminSettings.tsx
const handleConnectPlugin = (pluginId: string) => {
  if (pluginId === 'github') {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://upea.onrender.com';
    const token = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'upea_token');
    
    // Redirect to backend OAuth initiation
    window.location.href = `${apiBase}/api/admin/plugins/github/connect?token=${token}`;
  }
};
```

**What happens:**
- User clicks "Connect" button
- Browser redirects to: `https://upea.onrender.com/api/admin/plugins/github/connect?token=<admin-token>`

### Step 2: Backend Initiates OAuth
**Backend Should Do:**
```python
@app.get("/api/admin/plugins/github/connect")
def connect_github(token: str):
    # 1. Validate admin token
    admin = verify_admin_token(token)
    
    # 2. Store token in session/state for callback
    state = create_secure_state(admin_id=admin.id, token=token)
    
    # 3. Redirect to GitHub OAuth
    github_auth_url = f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&redirect_uri={BACKEND_URL}/api/github/oauth/callback&state={state}&scope=repo,read:user"
    
    return RedirectResponse(github_auth_url)
```

**What happens:**
- Backend validates the admin token
- Creates a secure state parameter
- Redirects user to GitHub authorization page

### Step 3: User Authorizes on GitHub
**GitHub Page:**
- User sees: "Authorize UPEA to access your repositories?"
- User clicks "Authorize"
- GitHub redirects back to: `https://upea.onrender.com/api/github/oauth/callback?code=<auth-code>&state=<state>`

### Step 4: Backend OAuth Callback
**Backend Should Do:**
```python
@app.get("/api/github/oauth/callback")
def github_oauth_callback(code: str, state: str):
    # 1. Verify state parameter
    admin_data = verify_state(state)
    
    # 2. Exchange code for access token
    response = requests.post("https://github.com/login/oauth/access_token", {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code
    })
    access_token = response.json()["access_token"]
    
    # 3. Get GitHub user info
    github_user = requests.get("https://api.github.com/user", 
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()
    
    # 4. ⭐ CRITICAL: Save to database
    plugin = db.query(Plugin).filter(
        Plugin.admin_id == admin_data["admin_id"],
        Plugin.name == "github"
    ).first()
    
    if not plugin:
        plugin = Plugin(
            admin_id=admin_data["admin_id"],
            name="github",
            type="github"
        )
        db.add(plugin)
    
    # ⭐ UPDATE THESE FIELDS
    plugin.access_token = access_token
    plugin.github_user_id = github_user["id"]
    plugin.github_username = github_user["login"]
    plugin.connected_at = datetime.now()
    plugin.is_active = True  # ⭐ IMPORTANT
    plugin.status = "active"  # ⭐ IMPORTANT
    
    db.commit()
    
    # 5. Redirect to frontend callback page
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(
        f"{frontend_url}/admin/plugins?status=success&message=GitHub connected successfully"
    )
```

**⚠️ CRITICAL BACKEND REQUIREMENTS:**
- Must save `access_token` to database
- Must set `is_active = True`
- Must set `status = "active"` or `status = "connected"`
- Must redirect to frontend callback page

### Step 5: Frontend Callback Page
**Frontend Action:**
```typescript
// In GitHubCallbackPage.tsx
useEffect(() => {
  if (status === 'success') {
    // ⭐ Invalidate query cache
    queryClient.invalidateQueries({ queryKey: adminKeys.plugins.all });
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      navigate('/dashboard/admin/settings');
    }, 3000);
  }
}, [status]);
```

**What happens:**
- Shows success message
- Invalidates plugin cache
- Redirects to Admin Settings after 3 seconds

### Step 6: Admin Settings Refetches Data
**Frontend Action:**
```typescript
// In AdminSettings.tsx
useEffect(() => {
  refetchPlugins(); // Fetch latest plugin data
}, []);

// Check plugin status
const githubPlugin = (plugins || []).find((p: any) => 
  p.type === 'github' || p.name === 'github' || p.id === 'github'
);

const status = githubPlugin?.status || githubPlugin?.is_active ? 'active' : 'disconnected';
```

**What should happen:**
- Fetches fresh plugin data from API
- Finds GitHub plugin in array
- Checks `status` or `is_active` field
- Shows "Connected" badge and "Disconnect" button

## 🧪 DEBUGGING STEPS

### 1. Check Browser Console
Open Developer Tools (F12) and check for:
```javascript
// Should see these logs:
GitHub Plugin: {id: "...", name: "github", is_active: true, status: "active", ...}
All Plugins: [{...github plugin...}, {...other plugins...}]
```

### 2. Check Network Tab
**Request to check:**
```
GET /api/admin/plugins
```

**Expected Response:**
```json
{
  "plugins": [
    {
      "id": "some-id",
      "name": "github",
      "type": "github",
      "is_active": true,
      "status": "active",
      "github_username": "your-username",
      "connected_at": "2026-01-17T02:00:00Z"
    }
  ]
}
```

**If you see `is_active: false` or `status: "disconnected"`:**
→ Backend is NOT saving the connection properly!

### 3. Check Backend Logs
Look for errors in backend OAuth callback:
- Token exchange failed?
- Database save failed?
- Missing environment variables?

## 🔧 FIXES NEEDED

### If Backend is NOT Saving Connection:

**Backend team needs to:**
1. Verify OAuth callback is receiving the code
2. Verify token exchange with GitHub is working
3. **Ensure database is being updated with:**
   - `access_token`
   - `is_active = True`
   - `status = "active"`
   - `github_user_id`
   - `github_username`
   - `connected_at`

### If Frontend is NOT Detecting Status:

**Check what property names the API uses:**
```typescript
// Current code checks:
p.type === 'github' || p.name === 'github' || p.id === 'github'

// And checks status:
githubPlugin?.status || githubPlugin?.is_active
```

**If API uses different names, update the code accordingly.**

## 📋 TESTING CHECKLIST

### Before Testing:
- [ ] Backend OAuth callback implemented
- [ ] Backend saves to database correctly
- [ ] Frontend callback page exists
- [ ] Query invalidation is working

### Test Flow:
1. [ ] Navigate to Admin Settings → Integrations
2. [ ] GitHub shows "Disconnected" status
3. [ ] Click "Connect" button
4. [ ] Redirected to GitHub authorization page
5. [ ] Click "Authorize" on GitHub
6. [ ] Redirected back to frontend callback page
7. [ ] See success message
8. [ ] Automatically redirected to Admin Settings
9. [ ] **GitHub now shows "Connected" status** ✅
10. [ ] **Button now shows "Disconnect"** ✅

### If Test Fails:
1. Open browser console
2. Check the logs for `GitHub Plugin:` and `All Plugins:`
3. Share the output
4. Check Network tab for `/api/admin/plugins` response
5. Share the response

## 🎯 NEXT STEPS

1. **Test the complete flow** following the checklist above
2. **Check browser console** for the debug logs
3. **Check Network tab** for the API response
4. **Share the results** so we can identify exactly where it's failing

The issue is most likely that the backend is not properly saving the connection to the database after the OAuth callback completes.
