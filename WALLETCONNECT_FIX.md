# WalletConnect Origin Rejection Fix

## Problem
When clicking "Connect Wallet" on Vercel, WalletConnect throws:
```
WebSocket connection closed abnormally with code: 3000 (Unauthorized: origin not allowed)
```

## Root Cause
You're accessing a Vercel **Git branch preview URL** (`aero-shield-git-main-vedantbanaitkars-projects.vercel.app`), but:
1. The metadata URL in code defaults to `aero-shield-lemon.vercel.app` (production domain)
2. WalletConnect only allows origins that are whitelisted in the WalletConnect Cloud dashboard
3. The branch preview domain is NOT whitelisted, so the bridge rejects it

## Solution

### Option 1: Use Production Domain (Recommended)
Visit only: `https://aero-shield-lemon.vercel.app`
- Reason: This is the whitelisted production domain
- Set in Vercel: `NEXT_PUBLIC_DAPP_URL=https://aero-shield-lemon.vercel.app`
- **Status**: Already configured if you set it earlier

### Option 2: Whitelist Branch Preview URLs (For Testing)
To test on branch preview URLs, you must whitelist them in WalletConnect Cloud:

1. Go to [WalletConnect Cloud Dashboard](https://cloud.walletconnect.com/)
2. Sign in with your WalletConnect credentials
3. Find your project (Project ID: `935fe6c29be4331dc1a8d6e219912149`)
4. Go to **Settings** → **Redirect Domains** (or **Whitelisted Origins**)
5. Add both URLs:
   - `https://aero-shield-lemon.vercel.app`
   - `https://aero-shield-git-main-vedantbanaitkars-projects.vercel.app`
6. Save and wait 5-10 minutes for changes to propagate
7. Refresh your branch preview URL and test again

### Option 3: Quick Fix for Local Dev + Production
Ensure `.env.local` has:
```
NEXT_PUBLIC_DAPP_URL=https://aero-shield-lemon.vercel.app
```

And in Vercel environment variables, set:
```
NEXT_PUBLIC_DAPP_URL=https://aero-shield-lemon.vercel.app
```

This makes the metadata URL match the production domain where WalletConnect is whitelisted.

## Verification
After fix:
1. Visit `https://aero-shield-lemon.vercel.app`
2. Click "Connect Wallet"
3. Should NOT see "Unauthorized: origin not allowed" errors
4. WalletConnect QR code should appear

## If Still Failing
- Check WalletConnect Cloud dashboard to confirm domain is whitelisted
- Clear browser cache and localStorage
- Try incognito/private window
- Check Vercel deployment logs for env var values
