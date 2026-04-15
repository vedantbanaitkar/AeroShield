# AeroShield Deployment Guide

## Complete Setup for GitHub + Vercel (15 minutes total)

This guide walks you through deploying AeroShield to a public HTTPS domain so you can test with Pera wallet on mobile without network mismatch errors.

---

## Phase 1: GitHub Setup (5 minutes)

### Step 1.1: Create GitHub Repository
1. Go to https://github.com/new
2. Sign in with your GitHub account
3. Fill in the form:
   - **Repository name:** `aeroshield` (or your preference)
   - **Description:** "Parametric flight delay insurance on Algorand TestNet"
   - **Visibility:** Public (Vercel recommends this)
   - Uncheck "Add a README" (we already have one)
4. Click **"Create repository"**
5. **Copy the HTTPS URL** shown (looks like: `https://github.com/YOUR_USERNAME/aeroshield.git`)

### Step 1.2: Connect Local Repo to GitHub

Open PowerShell in `D:\AeroShield` and run:

```powershell
cd d:\AeroShield

# Add GitHub as remote (replace with your URL from Step 1.1)
git remote add origin https://github.com/YOUR_USERNAME/aeroshield.git

# Rename branch to main (GitHub default)
git branch -M main

# Push all code to GitHub
git push -u origin main
```

### Step 1.3: Verify on GitHub

1. Open your GitHub repo: `https://github.com/YOUR_USERNAME/aeroshield`
2. You should see all your files and the commit "Fix Pera wallet network detection..."
3. ✅ GitHub setup complete!

---

## Phase 2: Vercel Deployment (5-10 minutes)

### Step 2.1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub repos
4. Complete signup

### Step 2.2: Import Your Repository

1. After signup, you'll see the dashboard
2. Click **"New Project"** or **"Create"**
3. Under "Import a Git Repository", click your **aeroshield** repo
4. Click **"Import"**

### Step 2.3: Configure Environment Variables

Vercel will show a configuration screen. Under **"Environment Variables"**, add:

```
NEXT_PUBLIC_ALGOD_SERVER = https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGOD_PORT = 443
NEXT_PUBLIC_ALGOD_TOKEN = (leave empty)
NEXT_PUBLIC_NETWORK = testnet
NEXT_PUBLIC_APP_ID = 758806136
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 935fe6c29be4331dc1a8d6e219912149
AVIATIONSTACK_API_KEY = (leave empty for now)
ORACLE_WALLET_MNEMONIC = behave trigger chest various three armor pledge gun spirit humor random saddle ill garment wet scan stairs leader when sport alarm control control world chronic
```

**Make sure each one is marked "Production"** ✓

### Step 2.4: Deploy

1. Click **"Deploy"**
2. Wait 60-90 seconds for build to complete
3. You'll see a success screen with your deployment URL
4. Default URL: `https://aeroshield.vercel.app`

### Step 2.5: Test Your Deployment

**On desktop browser:**
1. Visit your Vercel URL: `https://aeroshield.vercel.app`
2. Click "Connect Wallet" → Should work with Pera extension

**On mobile phone:**
1. Visit the same Vercel URL
2. Click "Connect Wallet" → Pera recognizes TestNet automatically ✓
3. No "Network mismatch" error!

---

## Phase 3: Optional - Custom Domain (10 minutes extra)

### Step 3.1: Buy a Domain (Optional)

Domain registrars:
- **Namecheap:** https://www.namecheap.com (~$5-10/year)
- **GoDaddy:** https://www.godaddy.com
- **Google Domains:** https://domains.google

Search for: `aeroshield.com` or similar

### Step 3.2: Connect to Vercel

1. In Vercel dashboard, go to **Settings → Domains**
2. Click **"Add Domain"**
3. Enter your domain name
4. Follow Vercel's DNS setup instructions
5. DNS updates take 5-10 minutes to propagate

Your app will then be at: `https://yourdomain.com` ✓

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Build failed" | Check environment variables are correct, make sure all required ones are set |
| Vercel can't find repo | Make sure GitHub repo is public and you're logged in with the right account |
| Environment variables not loading | Vercel needs "Redeploy" after adding vars. Click **Redeploy** in dashboard |
| Pera still shows network error | Clear browser cache, restart mobile Pera app, make sure you're visiting HTTPS URL |
| Custom domain not working | Wait 10 minutes for DNS propagation, check Vercel domain settings |

---

## Next Steps After Deployment

✅ You now have:
- **Public HTTPS domain** → Pera recognizes TestNet
- **Production-ready app** → Ready for beta testing
- **Automated deployments** → Push to GitHub → Auto-deploys to Vercel

**When you're ready for smart contracts:**
- Update `/app` page with actual policy purchase flow
- Connect to smart contract endpoints
- Deploy contract to TestNet
- Update `.env.local` with contract App ID

---

## Quick Reference

| Environment | URL | Status |
|-------------|-----|--------|
| **Local Dev** | http://localhost:3000 | Dev server (localhost issues) |
| **ngrok Tunnel** | https://xxxx-xxxx.ngrok.io | Mobile testing (expires in 8 hours) |
| **Vercel Free** | https://aeroshield.vercel.app | **Production TestNet** ✓ |
| **Custom Domain** | https://yourdomain.com | Branded (optional) |

---

**Questions?** Refer to [WALLET_SETUP.md](WALLET_SETUP.md) for wallet connection troubleshooting.
