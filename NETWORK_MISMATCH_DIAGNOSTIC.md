# Network Mismatch Error - Diagnostic Guide

## Symptoms
- Mobile Pera wallet shows "Network mismatch between dApp and Wallet"
- Occurs on both localhost and Vercel production
- Happens even with TestNet mode enabled in Pera

## Root Cause Analysis

The "network mismatch" error in Pera wallet means one of the following:

### 1. **Missing TestNet Accounts in Mobile Pera** ⚠️ MOST LIKELY
Pera wallet manages accounts per network. When you connect to AeroShield:
- dApp requests: "Connect to Algorand TestNet"
- Pera checks: "Do I have any TestNet accounts?"
- **If NO TestNet accounts exist** → "Network mismatch" error

**Solution**: Create or import a TestNet account in your mobile Pera wallet

**Steps**:
1. Open Pera wallet app on mobile
2. Look for "Add Account" or "+" button
3. Select "Create New Account"
4. Make sure it's created on **TestNet** (check network selector)
5. Return to AeroShield and try connecting

### 2. **MainNet-Only Account**
If your Pera account is only on MainNet:
- dApp needs: TestNet
- Your account is: MainNet only
- Result: Network mismatch

**Solution**: Create a separate TestNet account

### 3. **Pera App Not Updated**
Older Pera app versions may not properly support TestNet selection.

**Solution**: Update Pera wallet to latest version from app store

## How to Verify

### Check if you have TestNet accounts:
1. Open Pera wallet
2. Look at the account list
3. There should be a network indicator (TestNet or MainNet)
4. You need at least ONE account on TestNet

### Verify dApp is requesting TestNet:
1. Open AeroShield on browser
2. Open Developer Tools (F12)
3. Go to Console
4. Look for WalletConnect or wallet initialization messages
5. Should show: "network: testnet" or "defaultNetwork: TESTNET"

### Check browser console for errors:
If there are JavaScript errors, they'll show in the Console tab.

## Current Configuration

**localhost (.env.local)**:
```
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_DAPP_URL=http://localhost:3000
NEXT_PUBLIC_CONNECT_MODE=pera-first
```

**Vercel production**: 
Check Vercel dashboard for:
- `NEXT_PUBLIC_NETWORK=testnet`
- `NEXT_PUBLIC_DAPP_URL=https://aero-shield-lemon.vercel.app`

## Testing Sequence

1. **Verify you have a TestNet account in Pera mobile**
   - Open Pera → Check accounts list
   - Create new account if needed

2. **Test on localhost** (`http://localhost:3000`):
   - Click "Connect Wallet"
   - Select Pera (pera-first mode enabled)
   - See if QR appears

3. **Scan QR with mobile Pera**:
   - Should prompt to select account
   - Should NOT show "network mismatch"

4. **If still failing**: Check browser console for specific error messages

## Technical Details

- **Pera SDK**: `@perawallet/connect` v1.5.2
- **Use-Wallet**: `@txnlab/use-wallet-react` v4.6.0
- **TestNet Network ID**: `testnet`
- **dApp URL metadata**: Used by WalletConnect bridge to verify origin

## If Problem Persists

1. **Clear all caches**:
   - Browser cache
   - LocalStorage
   - Pera app cache (reinstall if necessary)

2. **Try Defly wallet instead**:
   - Switch NEXT_PUBLIC_CONNECT_MODE to defly-first
   - See if Defly connection works

3. **Check network connectivity**:
   - Ensure TestNet API is reachable: `https://testnet-api.algonode.cloud`
   - Try from different network/wifi

4. **Fallback**: Use ngrok tunnel instead of localhost/Vercel

## Next Steps

Please test and report:
1. Do you have TestNet accounts in mobile Pera? (Yes/No)
2. Can you see the wallet connection QR code on localhost?
3. What exact error message appears on mobile Pera?
4. Any errors in browser console?
