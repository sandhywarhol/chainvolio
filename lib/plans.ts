export type PlanName = "free" | "community" | "company" | "enterprise";

export type PlanLimits = {
    collections: number | null; // null = unlimited
    candidates: number | null;
};

export const PLANS: Record<PlanName, {
    displayName: string;
    limits: PlanLimits;
    features: string[];
}> = {
    free: {
        displayName: "Free",
        limits: { collections: 1, candidates: 10 },
        features: [
            "1 hiring post per month",
            "10 saved candidates",
            "Basic candidate browsing",
            "2 attestations / month",
        ],
    },
    community: {
        displayName: "Verified Community",
        limits: { collections: null, candidates: null },
        features: [
            "Unlimited hiring posts per month",
            "✓ Verified Community badge",
            "30 attestations / month",
            "Jobs listed as Trusted Community Opportunity",
            "Candidates can verify your community is legit",
        ],
    },
    company: {
        displayName: "Verified Company",
        limits: { collections: null, candidates: null },
        features: [
            "Unlimited hiring posts per month",
            "✓ Verified Company badge",
            "60 attestations / month",
            "Jobs appear as verified institutional hiring sources",
            '"Institutional Trust" signal visible to every candidate',
        ],
    },
    enterprise: {
        displayName: "Enterprise",
        limits: { collections: null, candidates: null },
        features: [
            "Everything in Verified Company",
            "White-label options",
            "Custom SLA",
            "Dedicated account manager",
            "Custom integrations",
        ],
    },
};

export function getEffectiveLimits(plan: PlanName, _isOrgVerified: boolean): PlanLimits {
    return PLANS[plan]?.limits ?? PLANS.free.limits;
}

export function getPlanBadgeStyle(plan: PlanName): { text: string; className: string; verified: boolean } {
    switch (plan) {
        case "community":
            return { text: "✓ Verified Community", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", verified: true };
        case "company":
            return { text: "✓ Verified Company", className: "bg-amber-500/15 text-amber-400 border-amber-500/30", verified: true };
        case "enterprise":
            return { text: "✓ Enterprise", className: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30", verified: true };
        default:
            return { text: "Free Tier", className: "bg-slate-700/40 text-slate-400 border-slate-600/40", verified: false };
    }
}
