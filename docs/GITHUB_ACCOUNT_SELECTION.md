# GitHub Account Selection - Force Account Picker

## Issue
Users are experiencing issues where GitHub OAuth doesn't show the account selection screen. Instead, it automatically uses a cached GitHub session, which may be linked to a different account or cause duplicate key errors.

## Frontend Changes Made

### 1. Updated `GitHubConnectionCard.tsx`

#### Added Force Account Selection Parameter
```typescript
const handleConnect = (forceAccountSelection = false) => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://upea.onrender.com';
    const token = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'upea_token');

    if (!token) {
        console.error('No authentication token found');
        return;
    }

    const roleEndpoint = user?.role === 'team_lead' ? 'team-lead' : 'employee';
    
    // Add force_account_selection parameter
    const forceParam = forceAccountSelection ? '&force_account_selection=true' : '';
    
    window.location.href = `${apiBase}/api/${roleEndpoint}/github/connect?token=${token}${forceParam}`;
};
```

#### Added Two Connection Buttons
1. **"Link GitHub Profile"** - Normal connection (uses cached session if available)
2. **"Choose Different Account"** - Forces GitHub to show account picker

## Backend Requirements

### What Needs to Be Implemented

The backend needs to handle the `force_account_selection` query parameter and add `prompt=select_account` to the GitHub OAuth URL when this parameter is present.

### Employee Endpoint

**Endpoint:** `GET /api/employee/github/connect`

**Query Parameters:**
- `token` (required) - JWT authentication token
- `force_account_selection` (optional) - If `true`, force GitHub account selection

**Current Implementation (Assumed):**
```typescript
// Current
const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo,user&state=employee_github_link`;
```

**Updated Implementation (Required):**
```typescript
// Updated
const forceAccountSelection = req.query.force_account_selection === 'true';
const promptParam = forceAccountSelection ? '&prompt=select_account' : '';

const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo,user&state=employee_github_link${promptParam}`;
```

### Team Lead Endpoint

**Endpoint:** `GET /api/team-lead/github/connect`

**Same changes as employee endpoint:**
```typescript
const forceAccountSelection = req.query.force_account_selection === 'true';
const promptParam = forceAccountSelection ? '&prompt=select_account' : '';

const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo,user&state=team_lead_github_link${promptParam}`;
```

## How GitHub's `prompt` Parameter Works

### Without `prompt=select_account`
- GitHub checks if user is already logged in
- If yes, automatically uses that account
- No account selection screen shown
- Can cause issues if:
  - User wants to use a different account
  - Cached account is already linked to another user
  - User is logged into wrong GitHub account

### With `prompt=select_account`
- GitHub **always** shows the account selection screen
- User can:
  - Choose from logged-in accounts
  - Log in with a different account
  - See which account they're connecting
- Prevents accidental connections to wrong accounts

## Example Backend Implementation

### Node.js/Express Example

```javascript
// routes/employee/github.js
router.get('/github/connect', authenticateToken, async (req, res) => {
    try {
        const { token, force_account_selection } = req.query;
        
        // Verify token and get user info
        const user = await verifyToken(token);
        
        // Build GitHub OAuth URL
        const clientId = process.env.GITHUB_CLIENT_ID;
        const redirectUri = `${process.env.API_BASE_URL}/api/github/oauth/callback`;
        const scope = 'repo,user';
        const state = `employee_github_link_${user.id}`;
        
        // Add prompt parameter if force_account_selection is true
        const promptParam = force_account_selection === 'true' ? '&prompt=select_account' : '';
        
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}${promptParam}`;
        
        // Redirect to GitHub
        res.redirect(githubAuthUrl);
    } catch (error) {
        console.error('GitHub connect error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/github/callback?status=error&error=${encodeURIComponent(error.message)}`);
    }
});
```

### Python/FastAPI Example

```python
@router.get("/github/connect")
async def connect_github(
    token: str,
    force_account_selection: bool = False,
    current_user: User = Depends(get_current_user)
):
    # Build GitHub OAuth URL
    client_id = settings.GITHUB_CLIENT_ID
    redirect_uri = f"{settings.API_BASE_URL}/api/github/oauth/callback"
    scope = "repo,user"
    state = f"employee_github_link_{current_user.id}"
    
    # Add prompt parameter if requested
    prompt_param = "&prompt=select_account" if force_account_selection else ""
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={client_id}"
        f"&redirect_uri={quote(redirect_uri)}"
        f"&scope={scope}"
        f"&state={state}"
        f"{prompt_param}"
    )
    
    return RedirectResponse(url=github_auth_url)
```

## Additional Improvements

### 1. Add Logout from GitHub Option

Add a button to clear GitHub session cookies:

```typescript
const handleLogoutFromGitHub = () => {
    // Open GitHub logout in a popup
    const popup = window.open('https://github.com/logout', 'github-logout', 'width=600,height=400');
    
    // Close popup after 2 seconds
    setTimeout(() => {
        popup?.close();
        alert('Please try connecting again with your desired account.');
    }, 2000);
};
```

### 2. Better Error Messages

When duplicate key error occurs, suggest using "Choose Different Account":

```typescript
if (errorMessage.includes('duplicate key')) {
    return (
        <div>
            <p>This GitHub account is already connected to another user.</p>
            <p className="mt-2">Try clicking "Choose Different Account" to select a different GitHub account.</p>
        </div>
    );
}
```

## Testing

### Test Scenarios

1. **Normal Connection Flow:**
   - Click "Link GitHub Profile"
   - Should use cached GitHub session if available
   - Should redirect to GitHub if not logged in

2. **Force Account Selection:**
   - Click "Choose Different Account"
   - Should **always** show GitHub account picker
   - Should allow selecting different account even if already logged in

3. **Duplicate Account Error:**
   - Try to connect account already linked to another user
   - Should show error with helpful message
   - Should suggest using "Choose Different Account"

4. **Multiple GitHub Accounts:**
   - User logged into multiple GitHub accounts
   - "Choose Different Account" should show all accounts
   - User can select the correct one

## User Instructions

### If You Get "Duplicate Key" Error:

1. **Option 1: Use "Choose Different Account" Button**
   - Click the "Choose Different Account" button
   - GitHub will show all your logged-in accounts
   - Select a different account that isn't already linked

2. **Option 2: Logout from GitHub First**
   - Open https://github.com/logout in a new tab
   - Logout from GitHub
   - Come back and click "Link GitHub Profile"
   - Login with the account you want to use

3. **Option 3: Use Incognito/Private Window**
   - Open the app in an incognito/private browser window
   - Login to the app
   - Click "Link GitHub Profile"
   - You'll be asked to login to GitHub with fresh session

## Status

✅ **Frontend Complete**
- Added `force_account_selection` parameter
- Added "Choose Different Account" button
- Updated connection flow

⚠️ **Backend Required**
- Handle `force_account_selection` query parameter
- Add `prompt=select_account` to GitHub OAuth URL
- Test with multiple GitHub accounts

## Related Files

- `src/components/github/GitHubConnectionCard.tsx` - Connection UI
- `src/pages/GitHubCallbackPage.tsx` - OAuth callback handler
- `docs/GITHUB_DUPLICATE_ACCOUNT_ERROR.md` - Duplicate account error guide
- `docs/BACKEND_GITHUB_OAUTH_REQUIREMENTS.md` - Backend OAuth requirements
