import { DOMAIN_MAP } from "../constants/scoring";

export interface AttestationTierBreakdown {
    company:    number;
    community:  number;
    figure:     number;
    builder:    number;
    unverified: number;
}

export interface CVScoreBreakdown {
    experience:   number;
    verification: number;
    consistency:  number;
    skill:        number;
    activity:     number;
}

export interface CVScoreResult {
    score:                    number;
    domain_scores:            Record<string, number>;
    domains:                  Record<string, number>; // legacy alias
    top_domain:               string;
    level:                    string;
    activity_status:          string;
    confidence:               number;
    confidence_label:         string;
    trust_score:              number;
    reason:                   string;
    breakdown:                CVScoreBreakdown;
    attestation_tier_breakdown: AttestationTierBreakdown | null;
}

export function computeCVScore(
    profile: any,
    receipts: any[],
    attestationWeights?: Map<string, number>,
    tierBreakdown?: AttestationTierBreakdown,
): CVScoreResult {
    let experience   = 0;
    let verification = 0;
    let consistency  = 0;
    let skill        = 0;
    let activity     = 0;

    if (receipts && receipts.length > 0) {
        // ── Experience ────────────────────────────────────────────────────────
        let expScore = 0;
        receipts.forEach((r: any) => {
            const role = (r.role || "").toLowerCase();
            if (
                role.includes("lead")    || role.includes("senior") ||
                role.includes("founder") || role.includes("head")   ||
                role.includes("chief")
            ) {
                expScore += 30;
            } else {
                expScore += 15;
            }
        });
        experience = Math.min(100, expScore);

        // ── Verification — weighted by attester tier ───────────────────────
        if (attestationWeights && attestationWeights.size > 0) {
            // Scale weight 12→30 to multiplier 1.0→2.5
            const scaleWeight = (w: number) => 1.0 + ((w - 12) / 18) * 1.5;
            let weightedCount = 0;
            receipts.forEach((r: any) => {
                const w = attestationWeights.get(r.id);
                if (w !== undefined) weightedCount += scaleWeight(w);
            });
            verification = Math.round((Math.min(weightedCount, receipts.length) / receipts.length) * 100);
        } else {
            const verified = receipts.filter((r: any) =>
                r.status === "Attested"  ||
                r.status === "Verified"  ||
                r.status === "verified"  ||
                r.attestation_type === "Hiring Proof" ||
                r.tx_signature
            ).length;
            verification = Math.round((verified / receipts.length) * 100);
        }

        // ── Consistency — total months of work ────────────────────────────
        let totalMonths = 0;
        receipts.forEach((r: any) => {
            if (r.start_date || r.startDate) {
                const start = new Date(r.start_date || r.startDate);
                const end   = r.end_date || r.endDate ? new Date(r.end_date || r.endDate) : new Date();
                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    const m = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                    totalMonths += Math.max(1, m);
                }
            }
        });
        consistency = Math.min(100, Math.floor(totalMonths * 4));

        // ── Activity — on-chain receipts ──────────────────────────────────
        // TODO: Split into behavioral (off-chain) vs on-chain activity later
        const txCount = receipts.filter((r: any) => r.tx_signature).length;
        activity = Math.min(100, txCount * 25);
    }

    // ── Skill ─────────────────────────────────────────────────────────────
    if (profile && profile.skills) {
        const skillList = profile.skills.split(",");
        skill = Math.min(100, skillList.length * 20);
    }

    const rawScore = Math.round(
        0.30 * experience  +
        0.25 * verification +
        0.15 * consistency +
        0.15 * skill       +
        0.15 * activity
    );

    // ── Domain Scoring ────────────────────────────────────────────────────
    let domain_scores: Record<string, number> = {};
    if (profile && profile.skills) {
        const userSkills = profile.skills.split(",").map((s: string) => s.trim().toLowerCase());

        for (const [domain, keywords] of Object.entries(DOMAIN_MAP)) {
            const matchedSkills = userSkills.filter((s: string) => keywords.some(k => s.includes(k)));
            if (matchedSkills.length === 0) continue;

            const domainReceipts = (receipts || []).filter((r: any) => {
                const roleText = (r.role        || "").toLowerCase();
                const descText = (r.description || "").toLowerCase();
                return keywords.some(k => roleText.includes(k) || descText.includes(k));
            });

            let domainExpScore = 0;
            domainReceipts.forEach((r: any) => {
                const role = (r.role || "").toLowerCase();
                if (role.includes("lead") || role.includes("senior") || role.includes("founder") ||
                    role.includes("head") || role.includes("chief")) {
                    domainExpScore += 30;
                } else {
                    domainExpScore += 15;
                }
            });
            const domainExperience  = Math.min(100, domainExpScore);
            const domainSkillLevel  = Math.min(100, matchedSkills.length * 25);
            let   domainVerification = verification;

            if (domainReceipts.length > 0) {
                const verifiedDomain = domainReceipts.filter((r: any) =>
                    r.status === "Attested" || r.attestation_type === "Hiring Proof" || r.tx_signature
                ).length;
                domainVerification = Math.round((verifiedDomain / domainReceipts.length) * 100);
            }

            domain_scores[domain] = Math.round(
                0.40 * domainExperience +
                0.35 * domainSkillLevel +
                0.25 * domainVerification
            );
        }
    }

    // ── Confidence & multipliers ──────────────────────────────────────────
    const total_contributions   = receipts ? receipts.length : 0;
    let   verified_contributions = 0;
    let   verification_ratio    = 0;

    if (total_contributions > 0 && receipts) {
        verified_contributions = receipts.filter((r: any) =>
            r.status === "Attested"  ||
            r.status === "Verified"  ||
            r.status === "verified"  ||
            r.attestation_type === "Hiring Proof" ||
            r.tx_signature
        ).length;
        verification_ratio = verified_contributions / total_contributions;
    }

    const verification_multiplier = total_contributions === 0 ? 0.5 : 0.5 + (verification_ratio * 0.5);
    const data_factor  = Math.min(total_contributions / 5, 1);
    const confidence   = total_contributions === 0 ? 0 : Math.round((verification_ratio * data_factor) * 100) / 100;
    const trust_score  = Math.round(rawScore * confidence * 10) / 10;
    let   finalScore   = Math.round(rawScore * verification_multiplier);

    for (const domain in domain_scores) {
        domain_scores[domain] = Math.round(domain_scores[domain] * verification_multiplier);
    }

    // ── Activity decay ────────────────────────────────────────────────────
    let lastActivity = profile?.updated_at || profile?.created_at || new Date().toISOString();
    let latestTime   = new Date(lastActivity).getTime();

    if (receipts && receipts.length > 0) {
        receipts.forEach((r: any) => {
            const rTime = new Date(r.updated_at || r.created_at || r.startDate).getTime();
            if (!isNaN(rTime) && rTime > latestTime) latestTime = rTime;
        });
    }

    const daysInactive = Math.floor((Date.now() - latestTime) / (1000 * 60 * 60 * 24));
    let   activity_status = "active";
    let   decayFactor     = 1.0;

    if (daysInactive > 180) {
        decayFactor   = 0.8;
        activity_status = "dormant";
    } else if (daysInactive > 90) {
        decayFactor   = 0.9;
        activity_status = "inactive";
    }

    if (decayFactor < 1.0) {
        finalScore = Math.round(finalScore * decayFactor);
        for (const domain in domain_scores) {
            domain_scores[domain] = Math.round(domain_scores[domain] * decayFactor);
        }
    }

    // ── Level ─────────────────────────────────────────────────────────────
    let level = "Beginner";
    if      (finalScore >= 80) level = "Elite";
    else if (finalScore >= 60) level = "Advanced";
    else if (finalScore >= 40) level = "Intermediate";

    // ── Top domain ────────────────────────────────────────────────────────
    const entries    = Object.entries(domain_scores);
    const top_domain = entries.length > 0 ? entries.sort((a, b) => b[1] - a[1])[0][0] : "general";

    let confidence_label = "Low";
    if      (confidence >= 0.7) confidence_label = "High";
    else if (confidence >= 0.4) confidence_label = "Medium";

    // ── Reason ────────────────────────────────────────────────────────────
    const reasons: string[] = [];
    if (verification >= 70) reasons.push("high verified contributions");
    if (consistency  >= 70) reasons.push("consistent activity");
    if (experience   >= 70) reasons.push("strong industry experience");
    if (skill        >= 70) reasons.push("diverse validated skills");

    const reason = reasons.length > 0
        ? "Based on " + reasons.slice(0, -1).join(", ") + (reasons.length > 1 ? " and " : "") + reasons.slice(-1)
        : "Building profile reputation";

    return {
        score:   finalScore,
        domain_scores,
        domains: domain_scores,
        top_domain,
        level,
        activity_status,
        confidence,
        confidence_label,
        trust_score,
        reason,
        breakdown: { experience, verification, consistency, skill, activity },
        attestation_tier_breakdown: tierBreakdown ?? null,
    };
}
