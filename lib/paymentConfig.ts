/**
 * ─── Payment Configuration ──────────────────────────────────────────────────
 *
 * PAYMENT_MODE=SOL_TEST   → ultra-low SOL amounts for mainnet testing
 * PAYMENT_MODE=USDC_PROD  → real USDC amounts for production
 *
 * Set in .env.local (client needs NEXT_PUBLIC_ prefix; server reads process.env directly)
 */

export type PaymentMode = "SOL_TEST" | "USDC_PROD";

/** Read on the server (API routes). */
export const SERVER_PAYMENT_MODE: PaymentMode =
    (process.env.PAYMENT_MODE as PaymentMode) || "USDC_PROD";

/** Read on the client (components). Must be exposed via NEXT_PUBLIC_ prefix. */
export const CLIENT_PAYMENT_MODE: PaymentMode =
    (process.env.NEXT_PUBLIC_PAYMENT_MODE as PaymentMode) || "USDC_PROD";

export const IS_SOL_TEST = CLIENT_PAYMENT_MODE === "SOL_TEST";

// ─── Treasury ──────────────────────────────────────────────────────────────
export const TREASURY_WALLET = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

// ─── SOL test amounts (in SOL, not lamports) ───────────────────────────────
/** Lamports per SOL */
export const LAMPORTS_PER_SOL = 1_000_000_000;

export const SOL_TEST_PRICES: Record<string, { monthly?: number; yearly?: number; oneTime?: number }> = {
    Builder:   { oneTime: 0.0001 },
    Community: { monthly: 0.0001, yearly: 0.0002 },
    Company:   { monthly: 0.0001, yearly: 0.0002 },
};

/** Returns the SOL amount (not lamports) for a given tier + billing cycle. */
export function getSolTestPrice(tier: string, billingCycle?: "monthly" | "yearly" | null): number {
    const prices = SOL_TEST_PRICES[tier];
    if (!prices) return 0;
    if (billingCycle === "yearly")  return prices.yearly  ?? 0;
    if (billingCycle === "monthly") return prices.monthly ?? 0;
    return prices.oneTime ?? 0;
}

/** Returns the lamport amount for a given tier + billing cycle. */
export function getSolTestLamports(tier: string, billingCycle?: "monthly" | "yearly" | null): number {
    return Math.round(getSolTestPrice(tier, billingCycle) * LAMPORTS_PER_SOL);
}

// ─── USDC prod amounts (in base units, 6 decimals) ─────────────────────────
export const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_MINT_DEVNET  = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
export const USDC_DECIMALS     = 6;

export const USDC_PROD_PRICES: Record<string, { monthly?: bigint; yearly?: bigint; oneTime?: bigint }> = {
    Builder:   { oneTime: BigInt("10000000")  },   // 10 USDC
    Community: { monthly: BigInt("30000000"),  yearly: BigInt("300000000")  },  // 30 / 300 USDC
    Company:   { monthly: BigInt("100000000"), yearly: BigInt("1000000000") },  // 100 / 1000 USDC
};

export const USDC_PROD_DISPLAY: Record<string, { monthly?: number; yearly?: number; oneTime?: number }> = {
    Builder:   { oneTime: 10 },
    Community: { monthly: 30,  yearly: 300  },
    Company:   { monthly: 100, yearly: 1000 },
};
export const ATTESTATION_QUOTAS: Record<string, number> = {
    "Builder":               10,
    "Public Figure":         20,
    "Community / DAO":       40,
    "Company / Organization": 80,
    "unverified":           0, // Or whatever limit for free users
};

export function getAttestationQuota(tier: string): number {
    const t = tier.toLowerCase();
    if (t.includes("builder")) return 10;
    if (t.includes("figure") || t.includes("public")) return 20;
    if (t.includes("community") || t.includes("dao")) return 40;
    if (t.includes("company") || t.includes("organization") || t.includes("org")) return 80;
    return 0; // default for unverified or unknown
}


/**
 * Returns the official display label for a verification tier.
 * Maps DB types/tiers to the "Verified X" format.
 */
export function getVerificationLabel(type?: string): string {
    const t = (type || "").toLowerCase();
    if (t.includes("builder")) return "Verified Builder";
    if (t.includes("figure") || t.includes("public")) return "Verified Public Figure";
    if (t.includes("community") || t.includes("dao")) return "Verified Community";
    if (t.includes("company") || t.includes("organization") || t.includes("org")) return "Verified Organization";
    return "Verified Entity";
}

