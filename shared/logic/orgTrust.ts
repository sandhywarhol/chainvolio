export interface OrgTrustInput {
    type:               string;  // 'Company / Organization' | 'Community / DAO'
    tier:               number;  // 1–4
    attestationsGiven:  number;  // attestations this org has given to talent
    hiringCollections:  number;  // number of hiring collections created
}

export interface OrgTrustBreakdown {
    base:         number; // tier-based starting score
    attestations: number; // points from giving attestations (max 25)
    hiring:       number; // points from hiring activity (max 15)
    profile:      number; // profile completeness (max 20)
}

export interface OrgTrustResult {
    // Primary metric
    trust_score:          number;
    // Detail
    tier:                 number;
    org_type:             string;
    base_score:           number;
    attestations_given:   number;
    hiring_count:         number;
    profile_completeness: number;
    level:                string;
    activity_status:      string;
    reason:               string;
    breakdown:            OrgTrustBreakdown;
    // API shape compatibility with CV score response
    score:         number;               // = trust_score
    domain_scores: Record<string, number>; // { organization: trust_score }
    domains:       Record<string, number>; // legacy alias
    top_domain:    string;               // "organization"
    confidence:    number;               // always 1.0 for verified orgs
    confidence_label: string;            // always "High"
    attestation_tier_breakdown: null;
}

export function computeOrgTrust(
    profile: any,
    orgStats: OrgTrustInput,
): OrgTrustResult {
    // ── Tier-based base score ─────────────────────────────────────────────
    let baseScore = 40;
    if      (orgStats.tier >= 3)                    baseScore = 70;
    else if (orgStats.tier === 2)                   baseScore = 55;
    else if (orgStats.type?.includes("Genesis"))    baseScore = 60;

    // ── Activity points ───────────────────────────────────────────────────
    const attestationPoints = Math.min(25, orgStats.attestationsGiven  * 2.5);
    const hiringPoints      = Math.min(15, orgStats.hiringCollections  * 5);

    // ── Profile completeness ──────────────────────────────────────────────
    let profilePoints = 0;
    if (profile) {
        if (profile.bio)                                                       profilePoints += 5;
        if (profile.website || profile.twitter || profile.discord || profile.github) profilePoints += 5;
        if (profile.skills)                                                    profilePoints += 5;
        if (profile.avatar_url)                                                profilePoints += 5;
    }

    const trustScore  = Math.min(100, Math.round(baseScore + attestationPoints + hiringPoints + profilePoints));
    const isActive    = orgStats.attestationsGiven > 0 || orgStats.hiringCollections > 0;

    // ── Level ─────────────────────────────────────────────────────────────
    let level = "Verified Network";
    if      (trustScore >= 90) level = "Genesis Authority";
    else if (trustScore >= 75) level = "Trusted Partner";
    else if (trustScore >= 60) level = "Verified Node";

    // ── Reason ────────────────────────────────────────────────────────────
    const parts: string[] = [`Tier ${orgStats.tier} verified organization`];
    if (attestationPoints > 0) parts.push(`${orgStats.attestationsGiven} attestation${orgStats.attestationsGiven !== 1 ? "s" : ""} given`);
    if (hiringPoints      > 0) parts.push(`${orgStats.hiringCollections} hiring collection${orgStats.hiringCollections !== 1 ? "s" : ""}`);
    const reason = parts.join(", ") + ".";

    return {
        trust_score:          trustScore,
        tier:                 orgStats.tier,
        org_type:             orgStats.type,
        base_score:           baseScore,
        attestations_given:   orgStats.attestationsGiven,
        hiring_count:         orgStats.hiringCollections,
        profile_completeness: profilePoints,
        level,
        activity_status:      isActive ? "active" : "inactive",
        reason,
        breakdown: {
            base:         baseScore,
            attestations: Math.round(attestationPoints),
            hiring:       Math.round(hiringPoints),
            profile:      profilePoints,
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
