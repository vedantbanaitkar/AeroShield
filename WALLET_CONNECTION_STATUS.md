# AeroShield Wallet Connection - Current Status & Next Steps

## Current Setup

**Environment**: Configured for Algorand TestNet
- Network: `testnet` (TestNet API: `testnet-api.algonode.cloud`)
- App ID: `758806136`
- Wallet Mode: `pera-first` (Pera is primary, others as fallback)
- Dev Server: `http://localhost:3000`
- Production: `https://aero-shield-lemon.vercel.app`

## Issue: "Network Mismatch" Error

### Most Likely Cause
Your mobile **Pera wallet doesn't have a TestNet account**. 

When the dApp requests a TestNet connection and your Pera wallet has no TestNet accounts, it shows "Network mismatch" error.

### Solution (CRITICAL)

**Step 1: Create a TestNet Account in Pera**
1. Open Pera wallet app on mobile
2. Tap the **"+" or "Add Account"** button
3. Select **"Create New Account as a Signer"**
4. **IMPORTANT**: Ensure you're creating it on **TestNet** (not MainNet)
   - Look for network selector at top of create screen
   - Choose "TestNet"
5. Complete account creation
6. Back up seed phrase if needed

**Alternative: Toggle Network in Developer Settings**
- If you prefer, you can use one account and toggle between TestNet/MainNet in Pera Settings → Developer Settings
- ⚠️ **Risk**: Easy to forget to toggle, causing "network mismatch" errors
- ✅ **Recommended**: Create a permanent TestNet account instead

**Step 2: Verify Account Exists**
1. In Pera account list, you should now see a TestNet account
2. It should show the network label (TestNet)
3. If using toggle method: Ensure Developer Settings is set to TestNet

**Step 3: Test Connection**
1. On your computer: Open `http://localhost:3000`
2. Click **"Connect Wallet"** button
3. You should see a QR code (Pera connection QR)
4. On mobile Pera: **Scan the QR code**
5. Pera should prompt you to select account → tap your TestNet account
6. **Expected**: Connection succeeds without "Network mismatch" error

## Testing URLs

- **Local Development**: `http://localhost:3000`
  - Dev server running now
  - Use for testing before pushing to production

- **Production**: `https://aero-shield-lemon.vercel.app`
  - Latest code deployed automatically
  - Use for final testing

## Wallet Connection Flow (Pera-First Mode)

```
User clicks "Connect Wallet"
    ↓
dApp checks: NEXT_PUBLIC_CONNECT_MODE = "pera-first"
    ↓
Shows Pera wallet QR code
    ↓
User scans with mobile Pera
    ↓
Pera checks: "Do I have TestNet accounts?"
    ├─ YES → Shows account selection → Connection ✅
    └─ NO → Shows "Network mismatch" error ❌ (THIS IS YOU)
```

## What Changed in Code

1. **Removed unsupported WalletConnect namespace config**: The `optionalNamespaces` configuration wasn't working and was removed
2. **Simplified to basics**: Now uses only `defaultNetwork: NetworkId.TESTNET` in WalletManager
3. **Configuration via env vars**: Network and wallet mode now controlled by environment variables

## Important: TestNet Account Setup Methods

### Method A: Permanent TestNet Account (RECOMMENDED) ✅
- Create a **separate account dedicated to TestNet**
- This account exists only on TestNet
- No toggling needed
- **Best for**: Production testing, avoiding accidental MainNet connections
- **Steps**: 
  1. Toggle to TestNet in Pera Settings → Developer Settings
  2. Create new account → it will be on TestNet
  3. You now have permanent TestNet account

### Method B: Toggle Network in Developer Settings ⚠️
- Use **one account** that can switch between TestNet and MainNet
- Toggle in Pera Settings → Developer Settings → Network
- **Risk**: Easy to forget to toggle, causing "network mismatch" errors
- **Not recommended for**: Production use

**Current Status**: If you toggled to TestNet in developer settings and connection works, make sure to create a permanent TestNet account for reliability.

## Troubleshooting: Common Errors

### Error: "Connect modal is closed by user"
**Type**: `PeraWalletConnectError`

**What it means**: User scanned QR but closed/cancelled the Pera connection modal before approving

**Solution - Complete Connection Steps**:
1. Click "Connect Wallet" on dApp → QR code appears
2. Open Pera → Tap camera/scan icon
3. Scan QR code (wait 2-3 seconds for it to process)
4. Pera shows: "Connect to AeroShield?" popup
5. **IMPORTANT**: Tap **CONFIRM/APPROVE** button (don't close it!)
6. Wait for Pera to complete → Modal closes automatically
7. Should see connected account on dApp ✅

**Common Mistakes to Avoid**:
- ❌ Scanning QR then immediately closing Pera
- ❌ Not tapping the confirm/approve button
- ❌ Closing the QR modal on desktop too early
- ❌ Having TestNet toggle OFF when connecting
- ❌ Switching apps during connection

**Correct Flow**:
```
Scan QR → Wait for prompt → Tap CONFIRM → Let complete → Success ✅
```

---

### Issue: Connection Works Locally but Production Shows Different Error

1. **Create TestNet account in Pera** (if you haven't already)
2. **Test on localhost** (`http://localhost:3000`)
   - Connect Wallet → Scan QR → Select TestNet account
3. **If it works locally**: Test on production (`https://aero-shield-lemon.vercel.app`)
4. **Report back**:
   - Does it work after creating TestNet account?
   - Any new errors in browser console?
   - Can you successfully select and connect a TestNet account?

## Fallback Options (If Pera TestNet Still Fails)

### Option A: Use Defly Wallet Instead
```bash
# In .env.local, change:
NEXT_PUBLIC_CONNECT_MODE=defly-first
# Then refresh and try connecting with Defly wallet
```

### Option B: Use ngrok Tunnel (Bypass Localhost)
```bash
# Run ngrok tunnel:
ngrok http 3000

# Use the ngrok URL in your mobile browser instead of localhost
# This avoids localhost network issues
```
**Note**: ngrok URLs are temporary and change on restart. Not suitable for WalletConnect whitelisting.

### Option C: Enable WalletConnect on Vercel Production (OPTIONAL)

Since Pera is now working, WalletConnect is optional. But if you want to support it on production:

**Step 1**: Set in Vercel Dashboard
- Go to Settings → Environment Variables
- Add: `NEXT_PUBLIC_DAPP_URL=https://aero-shield-lemon.vercel.app`
- Set for: Production, Preview, Development

**Step 2**: Whitelist Domain in WalletConnect Cloud
1. Visit: https://cloud.walletconnect.com/
2. Sign in
3. Find your project (ID: `935fe6c29be4331dc1a8d6e219912149`)
4. Go to **Settings** → **Redirect Domains** (or **Whitelisted Origins**)
5. Add: `https://aero-shield-lemon.vercel.app`
6. Save and wait 5-10 minutes

**Step 3**: Enable WalletConnect-First Mode (Optional)
```bash
# In Vercel environment variables, add:
NEXT_PUBLIC_CONNECT_MODE=walletconnect-first

# Or test locally first by changing .env.local:
NEXT_PUBLIC_CONNECT_MODE=walletconnect-first
```

**Step 4**: Test on Production
- Visit: `https://aero-shield-lemon.vercel.app`
- Click "Connect Wallet"
- Should show WalletConnect QR code (no "Unauthorized: origin not allowed" error)
- Scan with mobile Pera and connect

### Option D: Wait for Direct Pera Integration
We can also explore if there's an issue with how use-wallet-react is handling TestNet requests, but the TestNet account requirement is the most likely issue.

## Documentation Files Created

- `NETWORK_MISMATCH_DIAGNOSTIC.md` - Full troubleshooting guide
- `NETWORK_MISMATCH_FINAL_FIX.md` - Technical explanation
- `VERCEL_ENV_SETUP.md` - Vercel environment setup
- `WALLETCONNECT_FIX.md` - WalletConnect configuration guide

## Summary of What Works

✅ dApp correctly configured for TestNet
✅ WalletManager using TestNet network
✅ Pera wallet integration **WORKING** ✅
✅ Dev server running and serving correctly
✅ Production deployment on Vercel ready
✅ Mobile Pera wallet connection confirmed working with TestNet account

---

## Current Status: PERA WALLET WORKING ✅

**Confirmed Working**:
- Direct Pera wallet connection via QR code works
- Mobile TestNet account automatically selected
- No "Network mismatch" error with proper TestNet account
- Both localhost and production-ready

**Next Options**:
1. **Keep current setup**: Pera-first mode is reliable and working
2. **Add WalletConnect**: Optional - requires whitelisting domain in WalletConnect Cloud (see below)
