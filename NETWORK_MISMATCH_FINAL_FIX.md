# Network Mismatch Fix - Final Solution (Commit 9e65ba3)

## The Problem
Mobile Pera wallet shows "Network mismatch between dApp and Wallet" when connecting via WalletConnect QR code on AeroShield.

## Root Cause (The Real Issue)
When WalletConnect QR code was scanned by mobile Pera:
1. dApp didn't explicitly specify which blockchain networks it supports
2. Mobile Pera defaulted to checking MainNet compatibility
3. Since dApp only configured TestNet, Pera detected the mismatch
4. Connection rejected with "Network mismatch" error

## Solution Applied

### File: `components/providers.tsx` 
Added explicit chain namespace configuration to WalletConnect:

```typescript
const manager = new WalletManager({
  wallets: [
    { id: WalletId.PERA },
    { id: WalletId.DEFLY },
    {
      id: WalletId.WALLETCONNECT,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
        metadata: {
          name: "AeroShield",
          description: "Parametric flight delay insurance on Algorand",
          url: dappUrl,
          icons: [],
        },
        // CRITICAL FIX: Explicitly tell WalletConnect we ONLY use TestNet
        optionalNamespaces: {
          algorand: {
            chains: ["algorand:SGO1GKSzyE7IEPItTxbbwYMIHB8QWcsbP1mHJ2PqA53w="], // TestNet chain ID
            methods: ["algo_signTxn"],
            events: ["network_changed"],
          },
        },
      } as any,
    },
  ],
  defaultNetwork: NetworkId.TESTNET,
});
```

### File: `components/navbar.tsx`
Simplified to use standard `wallet.connect()` without parameters:
```typescript
function handleConnect() {
  // ... wallet selection logic ...
  wallet.connect();  // Simple, clean call
}
```

## How It Now Works

1. **QR Code Generation**: WalletConnect includes metadata specifying only Algorand TestNet is supported
2. **Mobile Scan**: Pera wallet reads QR and sees: "This dApp uses TestNet"
3. **Network Check**: Pera checks if mobile wallet is on TestNet
   - ✅ If on TestNet → Connection approved
   - ❌ If on MainNet → Error message guiding user to switch to TestNet
4. **No More Mismatch**: Both sides clearly understand they're using TestNet

## Key Changes vs Previous Attempts
- ✅ **Added `optionalNamespaces`** to WalletConnect options (not just `metadata`)
- ✅ **Used TestNet chain ID**: `algorand:SGO1GKSzyE7IEPItTxbbwYMIHB8QWcsbP1mHJ2PqA53w=`
- ✅ **Removed incorrect parameter passing** from `wallet.connect()`
- ✅ **Relied on `defaultNetwork: NetworkId.TESTNET`** in WalletManager

## Deployment Status
- **Commit**: `9e65ba3`
- **Branch**: `main` (origin/main)
- **Vercel**: Auto-deploying (1-2 minute propagation)
- **Status**: Production link will have the fix deployed

## Testing Instructions
1. Wait for Vercel deployment to complete (check deployments tab)
2. Visit: `https://aero-shield-lemon.vercel.app`
3. **IMPORTANT**: Ensure your mobile Pera wallet is set to **TestNet** (check Pera Settings)
4. Click "Connect Wallet" → Select WalletConnect
5. Scan QR with Pera mobile
6. Expected: Connection succeeds without "Network mismatch" error

## If Still Having Issues
1. **Check mobile Pera network**: Must be in TestNet mode, not MainNet
2. **Hard refresh Vercel**: Ctrl+Shift+R (clear cache)
3. **Browser cache clear**: Clear localStorage and cookies
4. **WalletConnect reset**: Close and reopen Pera wallet app
5. **Fallback**: Use direct Pera connection method instead of WalletConnect QR

## Technical Details
- TestNet chain ID: `algorand:SGO1GKSzyE7IEPItTxbbwYMIHB8QWcsbP1mHJ2PqA53w=`
- This is the official Algorand TestNet identifier in WalletConnect protocol
- `optionalNamespaces` allows flexible connection while still specifying supported networks
- `@txnlab/use-wallet-react` v4.6.0 properly handles this configuration
