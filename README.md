# ChainVolio

> **Trust layer for Web3.** Verifiable professional identity backed by on-chain attestations.

[![Live](https://img.shields.io/badge/Live-chainvolio.xyz-6EE7B7?style=flat-square&logo=vercel)](https://www.chainvolio.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Built on Solana](https://img.shields.io/badge/Built%20on-Solana-9945FF?style=flat-square&logo=solana)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

---

## What is ChainVolio?

ChainVolio is a **verifiable professional identity platform** built on Solana.
It replaces unverifiable resumes and informal Web3 hiring (DMs, emails, PDFs)
with cryptographically signed proof of work — attested by real organizations,
anchored on-chain, and shareable with a single link.

**The problem:** Web3 hiring runs on unverifiable claims. Anyone can write anything.
**The solution:** On-chain attestations. Signed by wallets. Locked forever.

> "ChainVolio doesn't replace LinkedIn. It adds cryptographic proof to your
>  existing presence — anywhere you already share your work."
> — Sandhy Warhol, Founder

---

## Live Demo

**Production:** https://www.chainvolio.xyz

| What to explore | URL |
|---|---|
| Public talent directory | /explore-talent |
| Example public CV | /cv/[wallet-address] |
| Create a hiring collection | /hiring/create |
| Blog & guides | /blog |

---

## Features (Live in Production)

### For Talent (Builders, Creators, Developers)
- **On-chain Proof of Work** — Every contribution recorded with wallet signature
- **Third-party Attestations** — Organizations co-sign your work. Once attested, records are permanently locked. No one can alter or revoke them.
- **CV Score** — Algorithmic trust score based on attestation depth and history
- **Public CV** — One shareable link. Works in LinkedIn bio, Twitter/X, email, DM
- **Upload evidence** — Attach files, links, or documents to each proof entry
- **Verified Credentials** — Identity layer: Civic Pass, GitHub sync, on-chain activity

### For Organizations & Recruiters
- **Org Dashboard** — Dedicated dashboard for verified organizations with hiring pipeline, endorsement stats, and org verification flow
- **Hiring Collections** — Create a shareable hiring link for a specific role with custom evaluation criteria (on-chain history, GitHub code, DAO governance)
- **Immutable Snapshots** — When a candidate applies, their full CV is snapshotted. The snapshot never changes even if the talent updates their profile later.
- **Eligibility Filters** — Require verified profiles only, active wallet, specific skills
- **Org Attestation** — Issue attestations to talent as a verified organization
- **Explore Talent** — Browse 36+ verified builders with CV scores and skill tags

### Trust & Security
- **Ed25519 signatures** via Solana for all critical actions
- **Replay protection** — Each signed action is valid only once within a time window
- **Database-level immutability** — Triggers prevent UPDATE/DELETE on attested records
- **Row-Level Security (RLS)** — Recruiters cannot see each other's data, enforced at DB
- **Non-custodial** — Private keys never touch the platform
- **SPL Memo** — Attestation hash anchored to Solana mainnet

---

## How It Works

```
Talent connects wallet (Phantom / Solflare)
        ↓
Adds Proof of Work entries (role, org, contribution, evidence)
        ↓
Requests attestation from collaborator or organization
        ↓
Attestor signs with wallet → SPL Memo anchored on Solana → record locked
        ↓
Talent shares one link → recruiters verify instantly, no calls needed
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Blockchain | Solana · SPL Memo Program · @solana/web3.js · @solana/wallet-adapter |
| Wallets | Phantom, Solflare (Wallet Standard) |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Non-custodial wallet signature (Talent) · Supabase OAuth (Org) |
| Storage | Supabase Storage (avatars, proof documents) |
| Deployment | Vercel (Edge Runtime) |
| Signing | Ed25519 via TweetNaCl · bs58 encoding |

---

## Architecture & Security

For full technical details, read [PLATFORM_REPORT.md](PLATFORM_REPORT.md).
For deployment instructions, read [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).

**Core security invariants:**
1. Attested records can never be modified or deleted (DB trigger enforcement)
2. CV snapshots are immutable the moment a candidate applies to a hiring collection
3. All permissions validated server-side — frontend can be compromised, DB cannot
4. Replay attacks prevented via nonce + timestamp window per signed action

---

## Local Development

**Prerequisites:** Node.js 18+, npm, Phantom or Solflare browser extension

```bash
git clone https://github.com/sandhywarhol/chainvolio.git
cd chainvolio
npm install
cp .env.example .env.local   # Fill in your Supabase and RPC credentials
npm run dev
```

Open http://localhost:3000 and connect your Phantom or Solflare wallet.

**Required environment variables** (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (server-side only)
- `NEXT_PUBLIC_SOLANA_RPC` — Solana RPC endpoint (public, browser-facing)
- `SOLANA_RPC` — Solana RPC endpoint (private, server-side API routes)
- `NEXT_PUBLIC_APP_URL` — http://localhost:3000 for local dev
- `SKIP_SIG_VERIFY` — Set to `true` for local testing without wallet signing

---

## Project Structure

```
chainvolio/
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks (useWalletConnect, etc.)
├── lib/              # Supabase client, auth, utilities
├── types/            # TypeScript type definitions
├── PLATFORM_REPORT.md     # Full technical & security architecture
└── DEPLOYMENT_CHECKLIST.md # Production deployment guide
```

---

## Roadmap

- [ ] Google OAuth for organizations — recruiter onboarding without wallet requirement
- [ ] Subscription model — fiat payments for org/recruiter tiers via Stripe
- [ ] Mobile-first experience — React Native or PWA
- [ ] API access — public API for third-party CV verification integrations
- [ ] Multi-chain — cross-chain attestation support

---

## Contributing

ChainVolio is built in public. Issues, feedback, and PRs are welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
For security issues, see [SECURITY.md](SECURITY.md).

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by [@sandhywarhol](https://github.com/sandhywarhol) and [@Baraka](https://github.com/Baraka-sudo-star)
Supported by [Superteam Indonesia](https://id.superteam.fun)
