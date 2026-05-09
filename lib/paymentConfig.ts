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
    Community: { monthly: BigInt("4990000"),  yearly: BigInt("49900000")  },  // 4.99 / 49.90 USDC
    Company:   { monthly: BigInt("9990000"),  yearly: BigInt("99900000")  },  // 9.99 / 99.90 USDC
};

export const USDC_PROD_DISPLAY: Record<string, { monthly?: number; yearly?: number; oneTime?: number }> = {
    Community: { monthly: 4.99, yearly: 49.90 },
    Company:   { monthly: 9.99, yearly: 99.90 },
};


/**
 * Canonical tier normalizer - all tier comparisons in this file MUST go through this.
 * Accepts raw DB type strings and returns a lowercase normalized version.
 */
export function normalizeTier(tier?: string): string {
    return (tier || "").toLowerCase().trim();
}

/**
 * Monthly attestation quota by verification tier.
 * This is the SINGLE SOURCE OF TRUTH for all quota decisions.
 * Growth-mode quotas: unverified=2, builder=5, public figure=10, community/dao=20, company/org=40
 */
export function getAttestationQuota(tier?: string): number {
    const t = normalizeTier(tier);
    if (t.includes("builder")) return 5;
    if (t.includes("figure") || t.includes("public")) return 10;
    if (t.includes("community") || t.includes("dao")) return 20;
    if (t.includes("company") || t.includes("organization") || t.includes("org")) return 40;
    return 2; // default for unverified or unknown - always safe fallback
}


/**
 * Returns the official display label for a verification tier.
 * Maps DB types/tiers to the "Verified X" format.
 */
/**
 * Returns the official display label for a verification tier.
 * Maps DB types/tiers to the human-readable "Verified X" format.
 */
export function getVerificationLabel(type?: string): string {
    const t = normalizeTier(type);
    if (t.includes("builder")) return "Builder";
    if (t.includes("figure") || t.includes("public")) return "Public";
    if (t.includes("community") || t.includes("dao")) return "Community / DAO";
    if (t.includes("company") || t.includes("organization") || t.includes("org")) return "Company / Org";
    if (t === "unverified" || t === "") return "Regular";
    return "Verified";
}

export interface BadgeStyle {
    color: string;
    iconText: string;
    border: string;
    bgBase: string;
    hex: string;
    bars: number;
    icon: boolean;
    tierLabel: string;
}

/**
 * Returns Tailwind CSS color classes and metadata for a verification tier.
 */
/**
 * Returns Tailwind CSS color classes and metadata for a verification tier.
 */
export function getBadgeStyles(verificationType?: string): BadgeStyle {
    const type = normalizeTier(verificationType);

    if (type.includes("public") || type.includes("figure")) return {
        color: "text-rose-200/80 bg-rose-500/5 border-rose-500/20",
        iconText: "text-rose-300",
        border: "border-rose-500/30",
        bgBase: "bg-rose-400",
        hex: "#fda4af", // rose-300
        bars: 3,
        icon: true,
        tierLabel: "Public",
    };
    if (type.includes("community") || type.includes("dao")) return {
        color: "text-blue-200/80 bg-blue-500/5 border-blue-500/20",
        iconText: "text-blue-300",
        border: "border-blue-500/30",
        bgBase: "bg-blue-400",
        hex: "#93c5fd", // blue-300
        bars: 4,
        icon: true,
        tierLabel: "Community / DAO",
    };
    if (type.includes("company") || type.includes("organization") || type.includes("org")) return {
        color: "text-amber-200/80 bg-amber-500/5 border-amber-500/20",
        iconText: "text-amber-300",
        border: "border-amber-500/30",
        bgBase: "bg-amber-400",
        hex: "#fcd34d", // amber-300
        bars: 5,
        icon: true,
        tierLabel: "Company / Org",
    };
    if (type.includes("builder")) return {
        color: "text-emerald-200/80 bg-emerald-500/5 border-emerald-500/20",
        iconText: "text-emerald-300",
        border: "border-emerald-500/30",
        bgBase: "bg-emerald-400",
        hex: "#6ee7b7", // emerald-300
        bars: 2,
        icon: true,
        tierLabel: "Builder",
    };

    // Default / Unverified → Regular (1 strip, slate color)
    return {
        color: "text-slate-400 bg-slate-500/5 border-slate-500/20",
        iconText: "text-slate-400",
        border: "border-slate-500/30",
        bgBase: "bg-slate-500",
        hex: "#94a3b8",
        bars: 1,
        icon: false,
        tierLabel: "Regular",
    };
}


/** Returns true if the tier/type is authorized for recruiter features (community/DAO or company/org). */
export function isRecruiterTier(tier?: string): boolean {
    const t = normalizeTier(tier);
    return t.includes("company") || t.includes("organization") || t.includes("org") || t.includes("community") || t.includes("dao");
}

/**
 * Returns the maximum number of hiring collections a tier can create.
 * This is the SINGLE SOURCE OF TRUTH for all hiring limit decisions.
 * Growth-mode limits:
 *   null  = unlimited (Community/DAO, Company/Org)
 *   10    = Public Figure
 *   5     = Builder
 *   2     = Unverified
 */
export function getHiringLimit(tier?: string): number | null {
    const t = normalizeTier(tier);
    if (t.includes("company") || t.includes("organization") || t.includes("org")) return null;
    if (t.includes("community") || t.includes("dao")) return null;
    if (t.includes("figure") || t.includes("public")) return 10;
    if (t.includes("builder")) return 5;
    return 2; // unverified - safest fallback
}

