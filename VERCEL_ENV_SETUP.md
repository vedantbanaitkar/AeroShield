# Vercel Environment Variable Setup - REQUIRED

## Issue
WalletConnect rejects connections with `Unauthorized: origin not allowed (3000)` because the metadata URL doesn't match the actual domain.

## Action Required in Vercel Dashboard

Go to: https://vercel.com/vedantbanaitkar/aeroshield/settings/environment-variables

### Add This Environment Variable:
```
Name: NEXT_PUBLIC_DAPP_URL
Value: https://aero-shield-lemon.vercel.app
Environment: Production, Preview, Development
```

**IMPORTANT**: 
- Use the production domain (not the branch preview URL)
- Select ALL three environments (Production, Preview, Development)
- Save and trigger a redeploy

### Steps:
1. Visit Vercel project settings
2. Click "Environment Variables"
3. Click "Add New"
4. Fill in:
   - **Name**: `NEXT_PUBLIC_DAPP_URL`
   - **Value**: `https://aero-shield-lemon.vercel.app`
   - **Environment**: Check Production, Preview, Development
5. Click "Save"
6. Go to Deployments tab and click "Redeploy" on the latest commit
7. Wait for deployment to complete

### After Setup:
- Visit `https://aero-shield-lemon.vercel.app`
- Click "Connect Wallet"
- WalletConnect QR should appear (no origin errors)

## Backup: Whitelist Additional Domains
If you need to test on branch preview URLs, also add them to WalletConnect Cloud:
1. Go to https://cloud.walletconnect.com/
2. Find project ID: `935fe6c29be4331dc1a8d6e219912149`
3. Settings → Redirect Domains
4. Add: `https://aero-shield-git-main-vedantbanaitkars-projects.vercel.app`
5. Wait 5-10 minutes for propagation
