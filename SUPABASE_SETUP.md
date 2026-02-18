# ChainVolio — Supabase Implementation

## Prerequisites
- Supabase project created
- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 1: Database schema

### A. New project (no existing data)

1. Supabase → **SQL Editor** → **New query**
2. Copy full contents of `lib/supabase/schema.sql`
3. Paste and **Run**

Creates: `wallets` → `profiles` → `receipts` (with FK relations)

### B. Existing project (already have profiles + receipts)

1. Supabase → **SQL Editor** → **New query**
2. Copy full contents of `lib/supabase/migration_add_wallets.sql`
3. Paste and **Run**

Adds `wallets` table, fills it from existing data, and adds FKs.

---

## Step 2: Environment

Ensure `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

---

## Step 3: Run the app

```bash
npm install
npm run dev
```

---

## Database tables

| Table      | Purpose                                      |
|-----------|-----------------------------------------------|
| `wallets` | Registered wallets (on create profile/receipt)|
| `profiles`| User profile (display_name, bio, skills, etc.)|
| `receipts`| Proof of Work records                         |

Flow: **Connect wallet** → **Create profile** (inserts into `wallets` + `profiles`) → **Add receipts** (inserts into `wallets` if needed + `receipts`).

---

## Verification

1. Connect wallet (Phantom)
2. Create profile
3. Add a receipt
4. Supabase → **Table Editor** → check `wallets`, `profiles`, `receipts`
5. Open `/cv/[your_wallet_address]` to see public CV
