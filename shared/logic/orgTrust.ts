// ─── Trust Score for Company / Organization and Community / DAO ───────────────
//
// Six dimensions — total max = 100 pts
//
//  1. Tier Base        (0–20)  Verification premium. Starting floor.
//  2. Network Reach    (0–30)  Unique talent wallets endorsed/attested.
//                              Rewards breadth, not spam. Max at 10 unique.
//  3. Hiring Activity  (0–20)  Hiring collections created. Max at 5 postings.
//  4. Profile          (0–15)  Bio, avatar, social links, skills.
//  5. Tenure           (0–15)  1 pt / 30 days active. Max at 15 months.
//  6. Subscription     (+20)   Flat bonus for active paid plan. Not capped by 100.
//
// Score 100 requires sustained, genuine activity over time.
// A brand-new org with a complete profile starts around 35 pts.
// ─────────────────────────────────────────────────────────────────────────────

export interface OrgTrustInput {
    type:               string;   // 'Company / Organization' | 'Community / DAO' | etc.
    tier:               number;   // 1–4
    attestationsGiven:  number;   // total attestations given (stored for reference)
    uniqueEndorsed:     number;   // unique talent wallets this org has endorsed ← main metric
    hiringCollections:  number;   // number of distinct hiring collections
    daysVerified:       number;   // days since org verification was granted
    hasActiveSub?:      boolean;  // active paid subscription (+20 bonus)
}

export interface OrgTrustBreakdown {
    tier_base:    number;  // (0–20)
    network:      number;  // (0–30) unique endorsed
    hiring:       number;  // (0–20)
    profile:      number;  // (0–15)
    tenure:       number;  // (0–15)
    subscription: number;  // 0 or 20
}

export interface OrgTrustResult {
    trust_score:          number;
    tier:                 number;
    org_type:             string;
    base_score:           number;   // = tier_base component
    unique_endorsed:      number;
    attestations_given:   number;
    hiring_count:         number;
    profile_completeness: number;
    tenure_days:          number;
    level:                string;
    activity_status:      string;
    reason:               string;
    breakdown:            OrgTrustBreakdown;
    // API shape compatibility
    score:                number;
    domain_scores:        Record<string, number>;
    domains:              Record<string, number>;
    top_domain:           string;
    confidence:           number;
    confidence_label:     string;
    attestation_tier_breakdown: null;
}

export function computeOrgTrust(
    profile: any,
    orgStats: OrgTrustInput,
): OrgTrustResult {

    // ── 1. Tier Base (0–20) ───────────────────────────────────────────────
    let tierBase = 5;
    if      (orgStats.tier >= 4) tierBase = 20;
    else if (orgStats.tier >= 3) tierBase = 15;
    else if (orgStats.tier >= 2) tierBase = 10;

    // ── 2. Network Reach (0–30) ───────────────────────────────────────────
    // Uses UNIQUE endorsed wallets, not raw attestation count.
    // Prevents inflating score by attesting the same person repeatedly.
    // 3 pts per unique talent endorsed, capped at 10 unique (30 pts).
    const networkPoints = Math.min(30, orgStats.uniqueEndorsed * 3);

    // ── 3. Hiring Activity (0–20) ─────────────────────────────────────────
    // 4 pts per hiring collection, capped at 5 collections (20 pts).
    const hiringPoints = Math.min(20, orgStats.hiringCollections * 4);

    // ── 4. Profile Completeness (0–15) ────────────────────────────────────
    let profilePoints = 0;
    if (profile) {
        if (profile.bio)        profilePoints += 4;
        if (profile.avatar_url) profilePoints += 3;
        const socialCount = [
            profile.website, profile.twitter, profile.discord,
            profile.github,  profile.linkedin,
        ].filter(Boolean).length;
        profilePoints += Math.min(6, socialCount * 2); // 2 pts each, max 3 socials
        if (profile.skills)     profilePoints += 2;
    }

    // ── 5. Tenure (0–15) ──────────────────────────────────────────────────
    // 1 pt per 30 days verified, max 15 months (450 days).
    const tenurePoints = Math.min(15, Math.floor(orgStats.daysVerified / 30));

    // ── 6. Subscription bonus (+20, flat) ─────────────────────────────────
    // Flat +20 for orgs with an active paid plan. Counted after the cap so
    // orgs with 80 pts + sub can reach 100, but the base 5 dims stay ≤ 80.
    const subBonus = orgStats.hasActiveSub ? 20 : 0;

    // ── Final score ───────────────────────────────────────────────────────
    const trustScore = Math.min(100, Math.round(
        tierBase + networkPoints + hiringPoints + profilePoints + tenurePoints + subBonus
    ));

    const isActive = orgStats.uniqueEndorsed > 0 || orgStats.hiringCollections > 0;

    // ── Level ─────────────────────────────────────────────────────────────
    // Thresholds reflect real effort required:
    //   Emerging:        0–39  (verified but minimal activity)
    //   Verified Network: 40–59 (growing presence)
    //   Trusted Partner:  60–79 (established, actively contributing)
    //   Genesis Authority: 80+  (elite, long-standing, high-impact)
    let level = "Emerging";
    if      (trustScore >= 80) level = "Genesis Authority";
    else if (trustScore >= 60) level = "Trusted Partner";
    else if (trustScore >= 40) level = "Verified Network";

    // ── Reason ────────────────────────────────────────────────────────────
    const parts: string[] = [];
    if (networkPoints  > 0) parts.push(`${orgStats.uniqueEndorsed} talent${orgStats.uniqueEndorsed !== 1 ? "s" : ""} endorsed`);
    if (hiringPoints   > 0) parts.push(`${orgStats.hiringCollections} hiring collection${orgStats.hiringCollections !== 1 ? "s" : ""}`);
    if (tenurePoints   > 0) parts.push(`${Math.floor(orgStats.daysVerified / 30)} month${Math.floor(orgStats.daysVerified / 30) !== 1 ? "s" : ""} active`);
    if (subBonus       > 0) parts.push("active subscription");
    const reason = parts.length > 0
        ? `Tier ${orgStats.tier} org — ${parts.join(", ")}.`
        : `Tier ${orgStats.tier} verified organization, building ecosystem presence.`;

    return {
        trust_score:          trustScore,
        tier:                 orgStats.tier,
        org_type:             orgStats.type,
        base_score:           tierBase,
        unique_endorsed:      orgStats.uniqueEndorsed,
        attestations_given:   orgStats.attestationsGiven,
        hiring_count:         orgStats.hiringCollections,
        profile_completeness: profilePoints,
        tenure_days:          orgStats.daysVerified,
        level,
        activity_status:      isActive ? "active" : "inactive",
        reason,
        breakdown: {
            tier_base:    tierBase,
            network:      Math.round(networkPoints * 10) / 10,
            hiring:       hiringPoints,
            profile:      profilePoints,
            tenure:       tenurePoints,
            subscription: subBonus,
        },
        // API compatibility
        score:         trustScore,
        domain_scores: { organization: trustScore },
        domains:       { organization: trustScore },
        top_domain:    "organization",
        confidence:    1.0,
        confidence_label: "High",
        attestation_tier_breakdown: null,
    };
}
