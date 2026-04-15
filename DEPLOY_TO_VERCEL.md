# Deploy to Vercel with Neon Database

## Ready to Deploy! ✅

Your AeroShield MVP is now configured with **persistent database storage** via Neon PostgreSQL.

## What You Have

- ✅ **Database Schema**: PostgreSQL `Policy` table with indexes
- ✅ **API Routes**: Create, read, update policies via `/api/policies/*`
- ✅ **Repository Pattern**: Automatic localhost (localStorage) → Vercel (Neon) switching
- ✅ **Build Verification**: `npm run build` passes
- ✅ **Environment Variables**: DATABASE_URL already in `.env.local`

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Neon database integration for persistent policies"
git push origin main
```

### 2. On Vercel Dashboard

1. Go to your AeroShield project
2. Click **Settings** → **Environment Variables**
3. Click **Add**:
   - **Name**: `DATABASE_URL`
   - **Value**: (Copy from your `.env.local`)

   ```
   postgresql://neondb_owner:npg_Aucz37BVWIXN@ep-dry-shadow-a1qsxz6m.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

   - Click **Save**

4. Redeploy:
   - Click **Deployments** tab
   - Click the three-dot menu on the latest commit
   - Click **Redeploy**

### 3. Vercel Will Automatically

- Install dependencies (`npm install` → includes Prisma)
- Apply database migration (creates `Policy` table in Neon)
- Start the app with `DATABASE_URL` set
- Route all policy operations through the database

## Testing After Deployment

1. **Buy a Policy** on your Vercel link
   - Policy stored in **Neon database** ✅
2. **Refresh the page**
   - Policy still there (database, not localStorage) ✅

3. **Logout/Login with different wallet**
   - See only that wallet's policies (database filtering) ✅

4. **Dashboard shows live stats**
   - Total coverage, total payouts, settlement time (from DB) ✅

5. **Trigger payout** (Test Oracle Mode for demo)
   - Policy status updates to "paid" in database ✅

## Why This Works

| Context                   | Storage         | Persistence             |
| ------------------------- | --------------- | ----------------------- |
| `npm run dev` (localhost) | localStorage    | Per browser (demo)      |
| Vercel (production)       | Neon PostgreSQL | ✅ Cross-user, 24/7     |
| Vercel (no DATABASE_URL)  | localStorage    | ❌ Lost on page refresh |

**The key**: When `DATABASE_URL` is set, `DbPolicyRepository` automatically takes over and all writes go to PostgreSQL instead of localStorage.

## Neon Free Tier Limits

- **Storage**: 3 GB (plenty for MVP)
- **Connections**: Unlimited via connection pooling
- **Always-on**: Yes
- **Cost**: **$0** 🎉

## After Recording Your Video

If you want to keep policies permanently:

1. Push code (already done ✅)
2. Set DATABASE_URL on Vercel (3 minutes)
3. Redeploy (2 minutes)
4. Done! All policies persist forever

If you just want to demo locally:

- `npm run dev` works perfectly with localStorage
- No Vercel changes needed
- Demo fallback policies show up automatically

## Support

- **Neon Console**: https://console.neon.tech (manage database)
- **Vercel Dashboard**: https://vercel.com (manage deployment)
- **Prisma Studio**: `npx prisma studio` (view/edit data locally)

---

**You're all set! Deploy whenever you're ready.** 🚀
