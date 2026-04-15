# Neon Database Setup Guide for AeroShield

## Quick Start (Already Configured!)

✅ **DATABASE_URL is already set in `.env.local`**
✅ **Prisma schema is set up** at `prisma/schema.prisma`
✅ **API routes are ready** at `/api/policies/*`
✅ **Migration is prepared** in `prisma/migrations/init/`

## What Changed

The project now has **automatic database persistence**:

1. **Locally** (with `npm run dev`): Uses localStorage (current client-side state)
2. **On Vercel**: Uses Neon PostgreSQL (persistent across users)

No UI changes needed! The repository pattern automatically switches backends.

## How It Works

- `lib/policies.ts` includes both `LocalStoragePolicyRepository` and `DbPolicyRepository`
- `DbPolicyRepository` calls API routes at `/api/policies/*`
- API routes (`/api/policies/create`, `/update`, `/list`) talk to Neon via Prisma ORM
- When `DATABASE_URL` is set, the app uses the database; otherwise, localStorage

## Next Steps

### Local Development

```bash
npm run dev
```

Works with localStorage. Great for testing locally.

### Deploy to Vercel

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Add Neon database integration"
   git push
   ```

2. **On Vercel Dashboard**:
   - Go to your project settings
   - Add Environment Variable:
     - **Name**: `DATABASE_URL`
     - **Value**: (Already in `.env.local`, copy it)
     ```
     postgresql://neondb_owner:npg_Aucz37BVWIXN@ep-dry-shadow-a1qsxz6m.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
   - Click "Deploy"

3. **Vercel will**:
   - Run `npm install`
   - Create tables via migration
   - Start the app with DATABASE_URL set
   - All policies now persist in Neon ✅

## Architecture

```
Buy Flow:
  User → Frontend → POST /api/policies/create → Neon → ✅ Policy saved

Dashboard:
  User → Frontend → POST /api/policies/list → Neon → ✅ Policies displayed

Trigger/Payout:
  Oracle → PATCH /api/policies/update → Neon → ✅ Status updated
```

## Database Schema

The `Policy` table stores:

- `id`: Unique policy identifier
- `walletAddress`: Algorand wallet address
- `productId`: "flight", "weather", or "cargo"
- `coverage`: Coverage amount (in microAlgos/USDC)
- `premium`: Premium paid
- `buyTxId`: Transaction ID for policy creation
- `payoutTxId`: Transaction ID for payout (if paid)
- `status`: "active" or "paid"
- `delayMinutes`: Detected delay for flight policies
- `createdAt`, `updatedAt`: Timestamps

## Pricing

**Neon Free Tier**:

- 3 GB storage
- Always-on micro compute
- **$0/month** ✅

**When you pay**:

- Scaling beyond 3 GB
- Upgrading to dedicated compute

For MVP, free tier is perfect!

## Files Changed

- `.env.local`: Added `DATABASE_URL`
- `package.json`: Added `@prisma/client` and `prisma`
- `prisma/schema.prisma`: Created PostgreSQL schema
- `lib/db.ts`: Created Prisma singleton client
- `lib/policies.ts`: Added `DbPolicyRepository` implementation
- `app/api/policies/create/route.ts`: POST endpoint for creation
- `app/api/policies/list/route.ts`: POST endpoint for listing
- `app/api/policies/update/route.ts`: PATCH endpoint for updates
- `prisma/migrations/init/`: Initial migration SQL

## Troubleshooting

### "DATABASE_URL not found"

Make sure it's in `.env.local` and the app is restarted.

### "Can't reach database server"

- Check Neon dashboard: Is the project running?
- Check connection string: Is it copied correctly?
- Check Vercel logs: Are env vars set?

### "Policies still using localStorage on Vercel"

- Did you push code to GitHub?
- Did you redeploy on Vercel?
- Did you set DATABASE_URL in Vercel settings?

## Support

- **Neon Docs**: https://neon.tech/docs
- **Prisma Docs**: https://prisma.io/docs
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
