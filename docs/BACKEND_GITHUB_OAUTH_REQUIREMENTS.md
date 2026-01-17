# Backend GitHub OAuth Requirements

## Critical: Database Update After OAuth Callback

### Problem
The frontend is showing "Disconnected" status even after successful GitHub OAuth because the backend is NOT properly updating the database.

### Required Backend Changes

#### 1. OAuth Callback Endpoint
**Endpoint**: `GET /api/github/oauth/callback`

**What it MUST do:**
```python
@app.get("/api/github/oauth/callback")
async def github_oauth_callback(code: str, state: str):
    # 1. Verify state parameter
    admin_data = verify_state(state)
    
    # 2. Exchange code for access token
    response = requests.post("https://github.com/login/oauth/access_token", {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "accept": "application/json"
    })
    access_token = response.json()["access_token"]
    
    # 3. Get GitHub user info
    github_user = requests.get("https://api.github.com/user", 
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()
    
    # 4. ⭐ CRITICAL: Update database
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
    
    # ⭐⭐⭐ THESE FIELDS ARE CRITICAL ⭐⭐⭐
    plugin.access_token = access_token
    plugin.github_user_id = str(github_user["id"])
    plugin.github_username = github_user["login"]
    plugin.connected_at = datetime.now()
    plugin.is_active = True  # ⭐ MUST BE TRUE
    plugin.status = "active"  # ⭐ MUST BE "active" or "connected"
    
    db.commit()
    db.refresh(plugin)
    
    # 5. Redirect to frontend callback
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(
        f"{frontend_url}/admin/plugins?status=success&message=GitHub connected successfully"
    )
```

#### 2. GET /api/admin/plugins Endpoint
**Must return:**
```json
{
  "plugins": [
    {
      "id": "plugin-uuid",
      "name": "github",
      "type": "github",
      "is_active": true,
      "status": "active",
      "access_token": "gho_xxxxx",
      "github_user_id": "12345",
      "github_username": "username",
      "connected_at": "2026-01-17T02:00:00Z",
      "config": {}
    }
  ]
}
```

**Critical Fields:**
- `is_active`: MUST be `true` when connected
- `status`: MUST be `"active"` or `"connected"` when connected
- `github_username`: Should contain the GitHub username
- `connected_at`: Should contain the connection timestamp

### Frontend Detection Logic

The frontend checks these fields to determine if GitHub is connected:
```typescript
const isConnected = 
  githubPlugin?.is_active === true ||
  githubPlugin?.status === 'active' ||
  githubPlugin?.status === 'connected' ||
  (githubPlugin?.connected_at != null && githubPlugin?.connected_at !== '') ||
  (githubPlugin?.access_token != null && githubPlugin?.access_token !== '') ||
  (githubPlugin?.github_username != null && githubPlugin?.github_username !== '');
```

**At minimum, ONE of these must be true:**
- `is_active === true`
- `status === "active"` or `status === "connected"`
- `connected_at` is not null/empty
- `access_token` is not null/empty
- `github_username` is not null/empty

### Testing Checklist

#### Backend Team Must Verify:
- [ ] OAuth callback receives the `code` parameter
- [ ] Token exchange with GitHub succeeds
- [ ] GitHub user info is retrieved successfully
- [ ] Database is updated with ALL required fields
- [ ] `is_active` is set to `true`
- [ ] `status` is set to `"active"` or `"connected"`
- [ ] `access_token` is saved (encrypted if possible)
- [ ] `github_user_id` is saved
- [ ] `github_username` is saved
- [ ] `connected_at` timestamp is saved
- [ ] Database commit succeeds
- [ ] Redirect to frontend callback page works
- [ ] GET /api/admin/plugins returns the updated plugin data

#### Test the Complete Flow:
1. Admin clicks "Connect" in frontend
2. Backend redirects to GitHub OAuth
3. User authorizes on GitHub
4. GitHub redirects to backend callback
5. Backend exchanges code for token ✅
6. Backend saves to database ✅
7. Backend redirects to frontend callback ✅
8. Frontend shows success message ✅
9. Frontend polls for status update ✅
10. GET /api/admin/plugins returns `is_active: true` ✅
11. Frontend shows "Connected" status ✅
12. Frontend shows "Disconnect" button ✅

### Common Issues

#### Issue 1: Database Not Updating
**Symptom**: OAuth completes but status stays "Disconnected"
**Fix**: Check database logs, ensure commit() is called

#### Issue 2: Wrong Status Value
**Symptom**: Plugin exists but status is wrong
**Fix**: Ensure `status = "active"` not `status = "disconnected"`

#### Issue 3: is_active Not Set
**Symptom**: Plugin exists but is_active is false/null
**Fix**: Explicitly set `is_active = True`

#### Issue 4: Fields Not Saved
**Symptom**: Some fields are null in database
**Fix**: Check that all fields are set before commit()

### Environment Variables Required

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:5173  # or production URL
```

### Database Schema

```sql
CREATE TABLE plugins (
    id UUID PRIMARY KEY,
    admin_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'disconnected',
    access_token TEXT,
    github_user_id VARCHAR(50),
    github_username VARCHAR(100),
    connected_at TIMESTAMP,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Disconnect Endpoint

**Endpoint**: `DELETE /api/admin/plugins/github/disconnect`

**Must do:**
```python
@app.delete("/api/admin/plugins/github/disconnect")
async def disconnect_github(admin: Admin = Depends(get_current_admin)):
    plugin = db.query(Plugin).filter(
        Plugin.admin_id == admin.id,
        Plugin.name == "github"
    ).first()
    
    if not plugin:
        raise HTTPException(status_code=404, detail="GitHub plugin not found")
    
    # Clear sensitive data
    plugin.access_token = None
    plugin.github_user_id = None
    plugin.github_username = None
    plugin.connected_at = None
    
    # Set status to disconnected
    plugin.is_active = False
    plugin.status = "disconnected"
    
    db.commit()
    db.refresh(plugin)
    
    return {
        "message": "GitHub plugin disconnected successfully",
        "plugin": {
            "id": str(plugin.id),
            "name": plugin.name,
            "is_active": plugin.is_active,
            "status": plugin.status
        }
    }
```

## Summary

**The backend MUST:**
1. ✅ Save `is_active = true` after OAuth
2. ✅ Save `status = "active"` after OAuth
3. ✅ Save `github_username` after OAuth
4. ✅ Save `connected_at` timestamp after OAuth
5. ✅ Return these fields in GET /api/admin/plugins
6. ✅ Redirect to frontend callback page after OAuth

**If ANY of these are missing, the frontend will show "Disconnected"!**
