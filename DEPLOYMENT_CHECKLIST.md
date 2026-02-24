# ChainVolio Deployment Guide: Production (chainvolio.xyz)

This guide provides the exact technical steps to deploy ChainVolio to Vercel and Supabase. Follow these steps sequentially to ensure a successful "fail-closed" production launch.

---

## 1. Environment Configuration (Vercel)
Set these variables in the **Vercel Dashboard** under `Settings > Environment Variables`. Use the **Production** scope only.

| Variable Name | Value / Purpose |
|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret Key**: Used for server-side mutations. |
| `SUPABASE_JWT_SECRET` | Used for verifying Supabase auth tokens. |
| `NEXT_PUBLIC_APP_URL` | `https://chainvolio.xyz` |
| `SKIP_SIG_VERIFY` | `false` (Must be false to enforce cryptographic security). |

---

## 2. Frontend Deployment (Vercel)
1. **Connect Repository**: Link your GitHub/GitLab repository to Vercel.
2. **Framework Preset**: Select `Next.js`.
3. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. **Domains**: Add `chainvolio.xyz` in the **Domains** tab. Ensure DNS is pointing to Vercel's nameservers/A-records.

---

## 3. Database Integrity Verification (Supabase)
Run these checks in the **Supabase SQL Editor** to ensure the production database is ready.

### A. RLS Enforcement (Mandatory)
```sql
-- Ensure all production tables have RLS enabled
SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT relrowsecurity;
-- Expected Result: 0 rows (All tables must have RLS active)
```

### B. Core Tables & Functions (Mandatory)
Confirm existence of:
- `profiles`, `cv_snapshots`, `hiring_collections`, `wallets`.
- RPC function: `set_app_wallet(wallet_addr text)`.
- Triggers on `cv_snapshots` preventing `UPDATE/DELETE`.

---

## 4. Pre-Deployment Simulation (Local/Staging)
Verify these flows locally using production-like settings (`SKIP_SIG_VERIFY=false`).

| Flow | Test Action | Expected Result |
|:---|:---|:---|
| **Identity** | Create profile with wallet. | Wallet signature is verified; profile saved in DB. |
| **Integrity** | Try to edit an attested work record. | API/Database rejects the update. |
| **Privacy** | Try to read `profiles` as `anon` role. | Returns 401/403 or empty array. |
| **Hiring** | Submit CV to a collection link. | `cv_snapshots` entry created with full data. |

---

## 5. Production Smoke Tests (chainvolio.xyz)
Perform these immediately after the Vercel deployment completes.

1. **Onboarding**: Connect wallet, navigate to `/profile`. Create a test profile.
2. **Verification**: Add a proof entry and verify it appears with the correct status badge.
3. **Hiring**: Generate a hiring link. Open it in an **Incognito** window. Connect a different wallet and apply.
4. **Recruiter View**: Log in as the recruiter and verify the snapshot is identical to the submission.

---

## 6. Rollback & Recovery
In the event of a catastrophic production failure:

### A. Frontend Rollback (Vercel)
1. Navigate to the **Deployments** tab.
2. Find the last successful deployment (green checkmark).
3. Click the three dots (...) and select **Redeploy** or **Promote to Production**.

### B. Database Rollback (Supabase)
1. **Schema Reversion**: If a migration broke RLS, execute your `SECURE_LOCKDOWN_REVERT.sql` script.
2. **Point-in-Time Recovery**: If data corruption occurred, use the Supabase **Backup** tab to restore to the last hourly snapshot (Pro/Enterprise tier only).

---

## 7. Deployment Checklist Summary
- [ ] Vercel ENV variables set and double-checked.
- [ ] `SKIP_SIG_VERIFY` is strictly `false`.
- [ ] DNS for `chainvolio.xyz` is active.
- [ ] Supabase RLS policies are live for all tables.
- [ ] Immutability triggers verified on `cv_snapshots`.
- [ ] Smoke tests passed on live domain.
