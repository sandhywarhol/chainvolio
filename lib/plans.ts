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
            "1 hiring collection",
            "10 saved candidates",
            "Basic candidate browsing",
            "Shortlist candidates",
        ],
    },
    community: {
        displayName: "Community / DAO",
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

export function getEffectiveLimits(plan: PlanName, _isOrgVerified: boolean): PlanLimits {
    return PLANS[plan]?.limits ?? PLANS.free.limits;
}

export function getPlanBadgeStyle(plan: PlanName): { text: string; className: string } {
    switch (plan) {
        case "community":  return { text: "Community",  className: "bg-teal-500/10 text-teal-400 border-teal-500/20" };
        case "company":    return { text: "Company",    className: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
        case "enterprise": return { text: "Enterprise", className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
        default:           return { text: "Free",       className: "bg-slate-700/50 text-slate-400 border-slate-600/50" };
    }
}
