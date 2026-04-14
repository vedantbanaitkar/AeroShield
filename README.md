# AeroShield MVP

Parametric flight-delay insurance MVP for Algorand TestNet.

## Implemented flow

1. User connects an Algorand wallet (WalletConnect, Pera, or Defly).
2. User buys a policy by sending premium to app escrow and app call in one group.
3. Oracle endpoint fetches delay data (real AviationStack or mock mode).
4. If delay is greater than or equal to 120 minutes, payout route calls `triggerPayout` on-chain.
5. UI displays transaction IDs and status progression.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy env template and fill values:

```bash
cp .env.example .env.local
```

Required values:

- `NEXT_PUBLIC_APP_ID`: deployed Algorand app ID for AeroShield contract
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect Cloud project ID
- `ORACLE_WALLET_MNEMONIC`: funded testnet account mnemonic used by trigger API

Optional values:

- `AVIATIONSTACK_API_KEY`: required only when `mock=false` in oracle calls

3. Run local dev server:

```bash
npm run dev
```

4. Open http://localhost:3000

## Demo mode (recommended for judging)

- Keep `Use mock oracle mode` enabled in UI.
- Set simulated delay slider to 150 minutes.
- This guarantees the eligibility condition and payout path every time.

## Real delay mode

- Disable mock mode in UI.
- Ensure `AVIATIONSTACK_API_KEY` is configured.
- Oracle route will fetch current flight data from AviationStack.

## Important note

The frontend currently sends app args in this order for policy purchase:

1. `flightNumber` (string bytes)
2. `coverageAmount` (uint64 microAlgos)

Keep your contract method decoder aligned with this order for successful app calls.
