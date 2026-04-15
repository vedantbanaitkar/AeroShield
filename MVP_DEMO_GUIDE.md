# AeroShield MVP Demo Guide - 5 Minute Video

## Overview

AeroShield is a parametric flight delay insurance platform built on Algorand TestNet. This guide outlines a complete 5-minute demonstration of the product.

## Time Breakdown

### 1. Opening/Problem Statement (0:00 - 0:30)

**Talking Points:**

- Flight delays cost passengers billions in compensation annually
- Current insurance requires manual claims - takes weeks to process
- Solution: Parametric insurance on blockchain
- Automatic payouts when delays occur, no paperwork needed

**Visual:** Show homepage with problem/solution messaging

### 2. Live Product Demo (0:30 - 3:30)

#### Segment A: Buy a Policy (1:00 minutes)

**Location:** localhost:3000/app (or Vercel production link)

**Steps to Demo:**

1. Shows the "Buy Policy" form
2. Flight number field: Enter "AI302" (or demo flight)
3. Coverage selection: Show slider selecting $25 coverage
4. Premium calculation appears automatically: ($25 × 0.05 = $1.25 in ALGO)
5. Click "Buy Policy" button
6. **WALLET CONNECTION MOMENT** (Your differentiator!)
   - Pera wallet QR code appears
   - Scan with mobile Pera wallet (TestNet)
   - Show the approval modal with account selection
   - Approve the transaction
7. Show "Transaction Signing" status indicator
8. Display transaction hash when confirmed

**Key Points:**

- Emphasize zero friction user experience
- Highlight TestNet account connection (shows blockchain integration)
- Show transparent fee structure

#### Segment B: Monitor & Claim (1:00 minutes)

**Location:** Same page, "Monitoring Status" section

**Steps to Demo:**

1. After policy purchase, show policy appears in "Active Policies"
2. Display flight status checking:
   - Flight number: AI302
   - Departure/Arrival times
   - Current delay status
3. Trigger delay scenario:
   - Show "Check Delay" button (or auto-check)
   - Display delay found: "Flight delayed 45 minutes"
   - Show eligibility: "Your coverage ($25) qualifies for payout"
4. Show automatic payout trigger:
   - "Initiating Payout Transaction..."
   - Display payout transaction hash
   - Show "Payout Completed" status
5. **Highlight the magic:** No claims form, no manual verification, instant settlement

**Key Points:**

- This is the automaton advantage (parametric insurance)
- Show transparency of on-chain execution
- Emphasize speed (seconds, not weeks)

#### Segment C: Dashboard & Verification (1:00 minutes)

**Location:** localhost:3000/dashboard (or similar)

**Steps to Demo:**

1. Show policy history dashboard
2. Display completed policy:
   - Original premium paid: $1.25 ALGO
   - Payout received: $25 ALGO
   - Net gain: $23.75 ALGO
3. Show transaction verification:
   - Click "View on Algorand" link
   - Opens Algorand TestNet explorer
   - Show transaction confirmed on-chain
   - Highlight immutability and transparency
4. Show timeline:
   - Policy purchased: [timestamp]
   - Delay detected: [timestamp]
   - Payout processed: [timestamp]
   - All within seconds/minutes

**Key Points:**

- Transparent settlement process
- Blockchain verification available to all
- No intermediaries needed

### 3. Key Differentiators (3:30 - 4:00)

**Talking Points to Emphasize:**

1. **Parametric Insurance**
   - Payout triggered by data (delay), not manual claims
   - No fraud risk - data-driven
2. **Blockchain-Powered**
   - All transactions on Algorand TestNet
   - Transparent, immutable, verifiable by anyone
   - No hidden fees or processes

3. **User-Friendly**
   - Wallet integration (Pera) - no new logins
   - Simple UI - buy policy in 30 seconds
   - Real-time monitoring and instant payouts

4. **Production Ready**
   - Deployed on Vercel (scalable)
   - Connected to real flight data API (AviationStack)
   - Smart contracts on Algorand TestNet
   - Full wallet integration tested

5. **Cost Efficient**
   - Low transaction costs on Algorand
   - Automated = no middlemen
   - Instant settlements

### 4. Technical Stack (4:00 - 4:30)

**Frontend Architecture:**

- Next.js 16.2.3 with Turbopack
- React 19 for UI
- Framer Motion for animations
- Deployed on Vercel

**Blockchain:**

- Algorand TestNet network
- Smart contracts (TypeScript/Teal)
- algosdk v3.5.2 for transactions

**Integrations:**

- Pera Wallet (@perawallet/connect) - user authentication
- Defly Wallet (@blockshake/defly-connect) - fallback
- WalletConnect v2 - alternative
- AviationStack API - real flight data

**Data Flow:**

1. User buys policy → Frontend sends to smart contract
2. Oracle monitors flight delays
3. Delay detected → Trigger endpoint calls smart contract
4. Smart contract executes payout automatically
5. Results displayed on dashboard

### 5. Call to Action (4:30 - 5:00)

**Talking Points:**

- "AeroShield is live on Algorand TestNet"
- "Try it yourself at [vercel-link]"
- "TestNet faucet available for ALGOs"
- "Source code on GitHub: vedantbanaitkar/AeroShield"

**Visual Ending:**

- Show GitHub repository
- Display Vercel deployment link
- End screen with contact info

---

## Demo Checklist

### Pre-Recording Setup

- [ ] Dev server running (`npm run dev`) on localhost:3000
- [ ] Pera wallet installed on mobile and set to **TestNet**
- [ ] Have test ALGO tokens in account (or use TestNet faucet)
- [ ] Ensure stable WiFi connection
- [ ] Close unnecessary browser tabs (keep dev tools closed)
- [ ] Record at 1920x1080 resolution minimum
- [ ] Test screen recording software first

### During Recording

- [ ] Start with clean browser state (no cached connections)
- [ ] Speak clearly about what's happening
- [ ] Point out wallet integration as key differentiator
- [ ] Highlight transaction hashes (show blockchain isn't magic, it's real)
- [ ] Don't rush through policy purchase flow
- [ ] Allow 2-3 seconds for each transaction to complete
- [ ] Show confirmation screens fully

### Common Issues & Solutions

- **Wallet connection timeout:** Refresh page and retry, or reconnect wallet
- **API delay checking taking time:** This is realistic - show it's calling real API
- **Payout not appearing:** May need to wait few seconds or refresh dashboard
- **Transaction hash not showing:** Likely still confirming - wait or check Algorand explorer

---

## Optional Enhancements

### Add More Polish

1. **Multiple flight scenarios**
   - Demonstrate with 2-3 different flight numbers
   - Show varying coverage amounts

2. **Real flight data**
   - If available, show actual flight delays from AviationStack
   - If using mock data, clearly state it's for demo purposes

3. **Dashboard insights**
   - Show statistics: payouts issued, total coverage, etc.
   - Display user profile with connected wallet address

4. **Educational moments**
   - Zoom in on transaction hash
   - Explain what parametric means
   - Show how premium is calculated

### Editing Tips

- Speed up form filling (2x speed)
- Speed up transaction confirmation waits (1.5x)
- Add text overlays for key metrics
- Add arrows/highlights to important UI elements
- Include background music (copyright-free)
- Fade between sections

---

## Success Metrics

**After demo, viewers should understand:**

1. ✅ What problem AeroShield solves
2. ✅ How to buy a flight insurance policy
3. ✅ How automatic payouts work
4. ✅ Why blockchain/Algorand matters
5. ✅ That product is real and working

**What makes this MVP compelling:**

- 🎯 Complete end-to-end flow (buy → monitor → payout)
- 🎯 Working wallet integration (not many projects have this)
- 🎯 Real blockchain transactions (Algorand TestNet)
- 🎯 Polished, animated UI
- 🎯 Solves real problem (flight delay insurance)

---

## Recording Command Reference

### Start Dev Server

```bash
cd d:\AeroShield
npm run dev
# Runs on http://localhost:3000
```

### Production Testing

```
https://aero-shield-lemon.vercel.app
```

### Key Pages to Show

- Home: `http://localhost:3000/` (problem/solution)
- App: `http://localhost:3000/app` (buy policy, monitor)
- Dashboard: `http://localhost:3000/dashboard` (history)
- Docs: `http://localhost:3000/docs` (technical info)

---

## Additional Resources

- **Algorand TestNet Faucet:** https://dispenser.testnet.algorand.network/
- **Algorand Explorer:** https://testnet.explorer.perawallet.app/
- **GitHub:** https://github.com/vedantbanaitkar/AeroShield
- **Vercel Deployment:** https://aero-shield-lemon.vercel.app

---

**Last Updated:** April 15, 2026
**Status:** Ready for MVP Submission
