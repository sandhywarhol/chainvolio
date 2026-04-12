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
    Community: { monthly: BigInt("29000000"),  yearly: BigInt("290000000")  },  // 29 / 290 USDC
    Company:   { monthly: BigInt("99000000"), yearly: BigInt("990000000") },  // 99 / 990 USDC
};

export const USDC_PROD_DISPLAY: Record<string, { monthly?: number; yearly?: number; oneTime?: number }> = {
    Builder:   { oneTime: 10 },
    Community: { monthly: 29,  yearly: 290  },
    Company:   { monthly: 99,  yearly: 990  },
};
export const ATTESTATION_QUOTAS: Record<string, number> = {
    "Builder":               10,
    "Public Figure":         20,
    "Community / DAO":       40,
    "Company / Organization": 80,
    "unverified":           0, // Or whatever limit for free users
};

export function getAttestationQuota(tier: string): number {
    const t = (tier || "").toLowerCase();
    if (t.includes("builder")) return 10;
    if (t.includes("figure") || t.includes("public")) return 20;
    if (t.includes("community") || t.includes("dao")) return 40;
    if (t.includes("company") || t.includes("organization") || t.includes("org")) return 80;
    if (t === "unverified" || t === "") return 5; 
    return 0; // default for unknown
}


/**
 * Returns the official display label for a verification tier.
 * Maps DB types/tiers to the "Verified X" format.
 */
export function getVerificationLabel(type?: string): string {
    const t = (type || "").toLowerCase();
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
export function getBadgeStyles(verificationType?: string): BadgeStyle {
    const type = (verificationType || "").toLowerCase();

    if (type.includes("public") || type.includes("figure")) return {
        color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
        iconText: "text-pink-400",
        border: "border-pink-500/50",
        bgBase: "bg-pink-500",
        hex: "#ec4899",
        bars: 2,
        icon: true,
        tierLabel: "Public",
    };
    if (type.includes("community") || type.includes("dao")) return {
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        iconText: "text-blue-400",
        border: "border-blue-500/50",
        bgBase: "bg-blue-500",
        hex: "#3b82f6",
        bars: 3,
        icon: true,
        tierLabel: "Community / DAO",
    };
    if (type.includes("company") || type.includes("organization") || type.includes("org")) return {
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        iconText: "text-amber-400",
        border: "border-amber-500/50",
        bgBase: "bg-amber-500",
        hex: "#f59e0b",
        bars: 4,
        icon: true,
        tierLabel: "Company / Org",
    };
    if (type.includes("builder")) return {
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        iconText: "text-emerald-400",
        border: "border-emerald-500/50",
        bgBase: "bg-emerald-500",
        hex: "#10b981",
        bars: 1,
        icon: true,
        tierLabel: "Builder",
    };
    
    // Default / Unverified → Regular (Slate/Gray)
    return {
        color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
        iconText: "text-slate-400",
        border: "border-slate-500/50",
        bgBase: "bg-slate-500",
        hex: "#94a3b8",
        bars: 0,
        icon: false,
        tierLabel: "Regular",
    };
}


/** Returns true if the tier/type is authorized for recruiter features. */
export function isRecruiterTier(tier?: string): boolean {
    const t = (tier || "").toLowerCase();
    return t.includes("company") || t.includes("organization") || t.includes("org") || t.includes("community") || t.includes("dao");
}
