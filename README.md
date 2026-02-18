# ChainVolio

On-chain CV platform for Web3 talent — Proof of Work Receipt with on-chain timestamp (Solana).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- `/` — Landing page
- `/create-profile` — Create profile (requires wallet connection)
- `/dashboard` — Talent dashboard, add receipts
- `/cv/[wallet]` — Public CV (for recruiters, no login)

## MVP features

- Connect wallet (Phantom, etc.)
- Create profile + Proof of Work receipt
- Self-Declared status
- In-memory data (restart = reset)

## Next steps

- Supabase integration (see `lib/supabase/schema.sql`)
- Solana smart contract (Anchor) for on-chain timestamp
- Deploy to Vercel
