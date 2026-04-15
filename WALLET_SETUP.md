# Wallet Connection Guide

## Network Mismatch Error Solution

If you see **"Signing Error: Network mismatch between dApp and Wallet"**, your Pera wallet is on a different network than the dApp expects.

## What Changed (Fixed Today)

✅ **Connect button now tries Pera first** - Changed from always using WalletConnect to prioritizing the native Pera wallet  
✅ **TestNet explicitly configured** - Wallet manager set to `NetworkId.TESTNET`  
✅ **Algod server pointing to TestNet** - Using `testnet-api.algonode.cloud`

## The Real Issue

**localhost cannot be identified as TestNet by Pera's security system.**

When Pera scans a WalletConnect QR code from `http://localhost:3000`, it cannot determine whether the development server is on TestNet or MainNet. As a safety measure, it defaults to **MainNet**, which causes the network mismatch error.

## Solutions (Choose One)

### ✅ Solution 1: Use ngrok for Public HTTPS Tunnel (RECOMMENDED - 5 minutes)

This is the fastest way to test mobile wallet connections.

**Step-by-step:**

1. Visit https://ngrok.com/download and download ngrok for Windows
2. Extract the `ngrok.exe` file to your AeroShield directory:
   ```
   D:\AeroShield\ngrok.exe
   ```
3. Open PowerShell in the AeroShield directory and run:
   ```powershell
   .\ngrok.exe http 3000
   ```
4. You'll see output like:
   ```
   Forwarding     https://abc1234-5678.ngrok.io -> http://localhost:3000
   ```
5. **On your phone:** Visit that HTTPS URL (e.g., `https://abc1234-5678.ngrok.io`)
6. Click "Connect Wallet"
7. Pera will now correctly detect TestNet and work properly

**Why this works:** ngrok creates a real public HTTPS domain, which Pera can verify.

---

### ✅ Solution 2: Use Pera Browser Extension (Desktop Testing - WORKS GREAT)

**Setup (one-time, 5 minutes):**

1. **Install extension:**
   - Chrome: https://chrome.google.com/webstore → search "Pera Wallet" → Add to Browser
   - Firefox: https://addons.mozilla.org → search "Pera Wallet" → Add to Firefox

2. **Create/Import TestNet account:**
   - Click Pera icon in toolbar
   - Create new wallet OR import existing (paste mnemonic)
   - Select **TestNet** mode (critical!)

**Testing (every time):**

1. Open http://localhost:3000 in the **same browser** with Pera extension
2. Click "Connect Wallet" button
3. Pera extension popup appears → approve connection
4. You're connected! No network mismatch errors

**Why this works:** Extension runs directly in browser context, no QR code scanning or network detection needed.

**Note:** Desktop testing only (mobile requires ngrok Option A)

---

### Solution 3: Check Pera App Settings (Quick Check)

Before trying other solutions:

1. Open Pera mobile app
2. Go to **Settings → Network**
3. Ensure **TestNet** is selected (not MainNet)
4. Go back to the dApp and try connecting again

---

### Solution 4: Deploy to a Real Domain (Production)

For permanent mobile testing:

1. Deploy the app to a domain with HTTPS
2. Use domain name pattern like `testnet.yourdomain.com` or `aeroshield-testnet.vercel.app`
3. Pera will recognize TestNet from the domain name

This is the long-term solution but requires infrastructure setup.

---

## Current App Configuration

Your app is **correctly configured** for TestNet everywhere:

- ✅ `.env.local` → `NEXT_PUBLIC_NETWORK=testnet`
- ✅ `.env.local` → `NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud`
- ✅ `components/providers.tsx` → `defaultNetwork: NetworkId.TESTNET`
- ✅ `components/navbar.tsx` → Connect button tries Pera first, then WalletConnect

## Testing Checklist

- [ ] Dev server is running (`npm run dev` shows "✓ Ready")
- [ ] Pera app wallet is switched to TestNet
- [ ] Using ngrok tunnel (if testing on mobile)
- [ ] Visiting HTTPS URL (ngrok requires HTTPS)
- [ ] Using "Connect Wallet" button to initiate connection

## Troubleshooting

| Problem                     | Solution                                        |
| --------------------------- | ----------------------------------------------- |
| "Network mismatch" error    | Use ngrok public URL instead of localhost       |
| Pera app won't open         | Make sure you're on HTTPS (ngrok provides this) |
| Connection hangs            | Restart Pera app and try again                  |
| "dApp connected to MainNet" | Check Pera app settings, switch to TestNet      |
| "Unknown error"             | Clear browser cache and Pera app cache          |

## Technical Details

- **dApp Network Detection:** Uses WalletConnect v2 bridge
- **Wallet Heuristics:** Pera determines network by domain patterns
- **localhost Limitation:** IP addresses/localhost default to MainNet for security
- **Fallback Order:** Pera → Defly → WalletConnect

## Need Help?

If ngrok doesn't work or you prefer not to use it, let me know and we can:

1. Deploy to Vercel (quick and free)
2. Set up a local development domain (hosts file method)
3. Use a different testing approach
