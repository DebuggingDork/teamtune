# Quick Fix: GitHub Connection Issues

## Problem
GitHub connection is failing with "duplicate key" error without even asking which account to connect.

## Immediate Workarounds (Use These NOW)

### Option 1: Clear Browser Cache & Cookies (Easiest)

1. **Open Browser DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Go to Application Tab:**
   - Click "Application" tab in DevTools
   - Find "Storage" in the left sidebar

3. **Clear Site Data:**
   - Click "Clear site data" button
   - OR manually delete:
     - Cookies for `localhost:8080`
     - Cookies for `github.com`
     - Local Storage
     - Session Storage

4. **Refresh and Try Again:**
   - Reload the page (`Ctrl+R` or `Cmd+R`)
   - Try connecting GitHub again

### Option 2: Use Incognito/Private Window (Recommended)

1. **Open Incognito Window:**
   - Chrome: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - Firefox: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Edge: `Ctrl+Shift+N`

2. **Login to Your App:**
   - Go to `http://localhost:8080`
   - Login with your credentials

3. **Connect GitHub:**
   - Navigate to GitHub section
   - Click "Link GitHub Profile"
   - You'll be asked to login to GitHub fresh
   - Use the account you want to connect

### Option 3: Logout from GitHub First

1. **Open New Tab:**
   - Go to https://github.com/logout

2. **Logout from GitHub:**
   - Click "Sign out"

3. **Go Back to Your App:**
   - Click "Link GitHub Profile"
   - Login with the GitHub account you want to use

### Option 4: Use Different Browser

1. **Install Different Browser:**
   - If using Chrome, try Firefox or Edge
   - If using Firefox, try Chrome

2. **Open App in New Browser:**
   - Go to `http://localhost:8080`
   - Login to your app
   - Connect GitHub

## What Changed (Frontend)

✅ **Added "Choose Different Account" Button**
- Now you have TWO buttons:
  1. **"Link GitHub Profile"** - Quick connect (may use cached session)
  2. **"Choose Different Account"** - Forces account selection

⚠️ **Backend Update Needed**
- The "Choose Different Account" button sends `force_account_selection=true`
- Backend needs to add `prompt=select_account` to GitHub OAuth URL
- Until backend is updated, use the workarounds above

## For Backend Team

The backend needs to update the GitHub OAuth URL generation:

```typescript
// Check for force_account_selection parameter
const forceAccountSelection = req.query.force_account_selection === 'true';
const promptParam = forceAccountSelection ? '&prompt=select_account' : '';

// Add to GitHub OAuth URL
const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo,user&state=employee_github_link${promptParam}`;
```

See `docs/GITHUB_ACCOUNT_SELECTION.md` for full implementation details.

## Why This Happens

1. **Browser Caching:** Your browser remembers which GitHub account you used last time
2. **GitHub Session:** GitHub keeps you logged in across sessions
3. **Auto-Connect:** Without `prompt=select_account`, GitHub automatically uses the cached account
4. **Duplicate Error:** If that cached account is already linked to another user, you get the error

## Permanent Solution

Once backend is updated with `prompt=select_account` support:
- ✅ "Choose Different Account" will always show GitHub account picker
- ✅ You can select which account to connect
- ✅ No more accidental wrong account connections
- ✅ No more cache-related issues

## Quick Reference

| Issue | Solution |
|-------|----------|
| Duplicate key error | Use incognito window OR clear cookies |
| Wrong account connected | Logout from GitHub first, then reconnect |
| Not redirecting to GitHub | Clear browser cache and try again |
| Want to use different account | Use "Choose Different Account" button (after backend update) |

## Testing Your Fix

1. Clear browser cache/cookies
2. Refresh the page
3. You should now see TWO buttons:
   - "Link GitHub Profile"
   - "Choose Different Account"
4. Try "Choose Different Account" (may not work until backend is updated)
5. If it doesn't work, use incognito window as workaround

## Need Help?

If none of these work:
1. Check browser console for errors (F12 → Console tab)
2. Check if you're using the correct GitHub account
3. Ask admin to check if your GitHub account is already linked to another user
4. Contact backend team to implement the `prompt=select_account` feature

---

**TL;DR:** Use incognito window or clear cookies, then try connecting again. The "Choose Different Account" button will work fully once backend is updated.
