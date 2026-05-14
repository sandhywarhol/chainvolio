// Backwards-compat re-exports — new code should import directly from
// cvScore.ts or orgTrust.ts instead of this file.
export type { AttestationTierBreakdown } from "./cvScore";
export { computeCVScore }               from "./cvScore";
export type { OrgTrustInput, OrgTrustResult } from "./orgTrust";
export { computeOrgTrust }              from "./orgTrust";

import { computeCVScore, AttestationTierBreakdown } from "./cvScore";
import { computeOrgTrust }                          from "./orgTrust";

// Legacy wrapper — delegates to the correct function based on whether
// orgStats is provided.
export function computeReputation(
    profile: any,
    receipts: any[],
    attestationWeights?: Map<string, number>,
    tierBreakdown?: AttestationTierBreakdown,
    orgStats?: {
        type: string;
        tier: number;
        attestationsGiven: number;
        hiringCollections: number;
    }
) {
    if (orgStats) {
        return computeOrgTrust(profile, orgStats);
    }
    return computeCVScore(profile, receipts, attestationWeights, tierBreakdown);
}
