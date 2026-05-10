export type StripePlanName = "free" | "community" | "company" | "enterprise";

export type PlanLimits = {
    collections: number | null;   // null = unlimited
    candidates: number | null;
};

export const STRIPE_PLANS: Record<StripePlanName, {
    displayName: string;
    price: number | null;
    priceIdEnvKey: string | null;
    limits: PlanLimits;
    features: string[];
}> = {
    free: {
        displayName: "Free",
        price: 0,
        priceIdEnvKey: null,
        limits: { collections: 1, candidates: 10 },
        features: [
            "1 hiring collection",
            "10 saved candidates",
            "Basic candidate browsing",
            "Shortlist candidates",
        ],
    },
    community: {
        displayName: "Community / DAO",
        price: 4.99,
        priceIdEnvKey: "STRIPE_PRICE_COMMUNITY",
        limits: { collections: null, candidates: null },
        features: [
            "Unlimited hiring collections",
            "Verified Community Identity badge",
            "20 recognized attestations / month",
            "Jobs listed as Trusted Community Opportunity",
            "Candidates can verify your community is legit",
        ],
    },
    company: {
        displayName: "Company / Org",
        price: 9.99,
        priceIdEnvKey: "STRIPE_PRICE_COMPANY",
        limits: { collections: null, candidates: null },
        features: [
            "Unlimited hiring collections",
            "Verified Organization Badge for maximum institutional trust",
            "40 attestations / month",
            "Jobs appear as verified institutional hiring sources",
            '"Institutional Trust" signal visible to every candidate',
        ],
    },
    enterprise: {
        displayName: "Enterprise",
        price: null,
        priceIdEnvKey: null,
        limits: { collections: null, candidates: null },
        features: [
            "Everything in Company / Org",
            "White-label options",
            "Custom SLA",
            "Dedicated account manager",
            "Custom integrations",
        ],
    },
};

export function getPriceId(plan: StripePlanName): string | null {
    const envKey = STRIPE_PLANS[plan]?.priceIdEnvKey;
    if (!envKey) return null;
    return process.env[envKey] ?? null;
}

export function getPlanFromPriceId(priceId: string): StripePlanName {
    for (const [plan, def] of Object.entries(STRIPE_PLANS)) {
        if (def.priceIdEnvKey && process.env[def.priceIdEnvKey] === priceId) {
            return plan as StripePlanName;
        }
    }
    return "free";
}

export function getEffectiveLimits(plan: StripePlanName, _isOrgVerified: boolean): PlanLimits {
    return STRIPE_PLANS[plan]?.limits ?? STRIPE_PLANS.free.limits;
}

export function getPlanBadgeStyle(plan: StripePlanName): { text: string; className: string } {
    switch (plan) {
        case "community": return { text: "Community", className: "bg-teal-500/10 text-teal-400 border-teal-500/20" };
        case "company":   return { text: "Company", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
        case "enterprise": return { text: "Enterprise", className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
        default:          return { text: "Free", className: "bg-slate-700/50 text-slate-400 border-slate-600/50" };
    }
}
