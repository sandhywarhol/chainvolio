import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { computeOrgTrust } from "@/shared/logic/orgTrust";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

const CATEGORY_SKILLS: Record<string, string[]> = {
    video:       ["video editing", "motion", "animation", "video production", "videography", "daVinci", "premiere", "after effects"],
    design:      ["ui/ux", "figma", "branding", "graphic design", "illustration", "product design", "ui", "ux", "visual design"],
    development: ["rust", "solidity", "react", "typescript", "smart contract", "defi", "blockchain", "web3", "frontend", "backend", "full stack", "mobile", "javascript", "python", "go", "anchor"],
    writing:     ["content writing", "copywriting", "technical writing", "documentation", "blog", "writing", "content"],
    community:   ["community", "discord", "social media", "twitter", "ambassador", "community management", "ops"],
    ai:          ["ai", "machine learning", "prompt engineering", "ml", "data science", "gpt", "llm", "artificial intelligence"],
};

const ORG_TYPES = ["Company / Organization", "Community / DAO"];

function isOrgVerif(v: any): boolean {
    if (!v) return false;
    const expired = v.expires_at ? new Date(v.expires_at) < new Date() : false;
    return ORG_TYPES.includes(v.type) && !expired;
}

export async function GET(req: NextRequest) {
    if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const page          = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit         = 8;
    const search        = (searchParams.get("search") || "").trim();
    const category      = (searchParams.get("category") || "all").toLowerCase();
    const workType      = searchParams.get("workType") || "";
    const minScore      = parseInt(searchParams.get("minScore") || "0");
    const maxScore      = parseInt(searchParams.get("maxScore") || "100");
    const sort          = searchParams.get("sort") || "score_desc";
    const location      = (searchParams.get("location") || "").trim();
    const availableOnly = searchParams.get("availableOnly") === "true";
    const verifiedOnly  = searchParams.get("verifiedOnly")  === "true";

    try {
        // ── 1. Fetch profiles ──────────────────────────────────────────────────
        let profileQuery = supabase.from("profiles").select("*");

        if (search)   profileQuery = profileQuery.or(`display_name.ilike.%${search}%,skills.ilike.%${search}%,professional_role.ilike.%${search}%`);
        if (workType) profileQuery = profileQuery.contains("work_preference", [workType]);
        if (location) profileQuery = profileQuery.ilike("country", `%${location}%`);

        const { data: rawProfiles, error: profileError } = await profileQuery;
        if (profileError) throw profileError;
        if (!rawProfiles?.length) return NextResponse.json({ talents: [], organizations: [], total: 0, page, totalPages: 0 });

        // ── 2. Category filter (JS-side) ───────────────────────────────────────
        let profiles = rawProfiles;
        if (category !== "all" && CATEGORY_SKILLS[category]) {
            const keywords = CATEGORY_SKILLS[category];
            profiles = profiles.filter((p) => {
                const s = (p.skills || "").toLowerCase();
                return keywords.some((kw) => s.includes(kw.toLowerCase()));
            });
        }
        if (!profiles.length) return NextResponse.json({ talents: [], organizations: [], total: 0, page, totalPages: 0 });

        const wallets = profiles.map((p) => p.wallet_address);

        // ── 3. Individual CV scores (scores table) ─────────────────────────────
        const { data: cvScoreRows } = await supabase
            .from("scores")
            .select("wallet_address, total_score, level, activity_status")
            .in("wallet_address", wallets);

        const cvScoreMap = new Map((cvScoreRows || []).map((s) => [s.wallet_address, s]));

        // ── 4. Org verifications ───────────────────────────────────────────────
        const { data: verifications } = await supabase
            .from("organization_verifications")
            .select("wallet_address, status, verifier_tier, type, expires_at, created_at")
            .in("wallet_address", wallets)
            .eq("status", "verified");

        const verifMap = new Map((verifications || []).map((v) => [v.wallet_address, v]));

        // ── 4.5. Stored org trust scores (canonical source) ───────────────────
        const orgWallets = (verifications || []).map((v) => v.wallet_address);
        const orgScoreMap = new Map<string, { trust_score: number; level: string; activity_status: string }>();
        if (orgWallets.length) {
            const { data: orgScoreRows } = await supabase
                .from("organization_scores")
                .select("wallet_address, trust_score, level, activity_status")
                .in("wallet_address", orgWallets);
            for (const s of orgScoreRows || []) orgScoreMap.set(s.wallet_address, s);
        }

        // ── 4.6. Subscription status (for live fallback + Google-login orgs) ──
        const subActiveMap = new Map<string, boolean>();
        if (orgWallets.length) {
            const { data: subRows } = await supabase
                .from("org_accounts")
                .select("wallet_address, subscription_status, plan_name, current_period_end")
                .in("wallet_address", orgWallets);
            const now = new Date();
            for (const s of subRows || []) {
                subActiveMap.set(s.wallet_address, !!(
                    s.subscription_status !== "canceled" &&
                    s.plan_name && s.plan_name !== "free" &&
                    (!s.current_period_end || new Date(s.current_period_end) > now)
                ));
            }
        }

        // ── 5. Receipt counts (for individual stats) ───────────────────────────
        const { data: receiptRows } = await supabase
            .from("receipts")
            .select("wallet_address, id")
            .in("wallet_address", wallets);

        const receiptCountMap = new Map<string, number>();
        for (const r of receiptRows || []) {
            receiptCountMap.set(r.wallet_address, (receiptCountMap.get(r.wallet_address) || 0) + 1);
        }

        // ── 6. Attested receipt counts ─────────────────────────────────────────
        const receiptIds = (receiptRows || []).map((r) => r.id);
        let attestedReceiptIds = new Set<string>();
        if (receiptIds.length) {
            const { data: attestRows } = await supabase
                .from("attestations")
                .select("receipt_id")
                .in("receipt_id", receiptIds);
            attestedReceiptIds = new Set((attestRows || []).map((a) => a.receipt_id));
        }

        const attestedCountMap = new Map<string, number>();
        for (const r of receiptRows || []) {
            if (attestedReceiptIds.has(r.id)) {
                attestedCountMap.set(r.wallet_address, (attestedCountMap.get(r.wallet_address) || 0) + 1);
            }
        }

        // ── 7. Org activity data (attestations given + hiring) ─────────────────
        const { data: hiringRows } = await supabase
            .from("hiring_collections")
            .select("owner_wallet")
            .in("owner_wallet", wallets);

        const hiringCountMap = new Map<string, number>();
        for (const h of hiringRows || []) {
            hiringCountMap.set(h.owner_wallet, (hiringCountMap.get(h.owner_wallet) || 0) + 1);
        }

        const { data: attGivenRows } = await supabase
            .from("attestations")
            .select("attester_wallet, receipt_id")
            .in("attester_wallet", wallets);

        const attestationsGivenMap = new Map<string, number>();
        const attesterReceiptMap   = new Map<string, string[]>();
        for (const a of attGivenRows || []) {
            attestationsGivenMap.set(a.attester_wallet, (attestationsGivenMap.get(a.attester_wallet) || 0) + 1);
            const rIds = attesterReceiptMap.get(a.attester_wallet) || [];
            rIds.push(a.receipt_id);
            attesterReceiptMap.set(a.attester_wallet, rIds);
        }

        // Endorsed count (unique talent wallets this org has attested)
        const allAttestedIds = Array.from(new Set((attGivenRows || []).map(a => a.receipt_id)));
        const receiptWalletMap = new Map<string, string>();
        if (allAttestedIds.length > 0) {
            const { data: recWalletRows } = await supabase
                .from("receipts")
                .select("id, wallet_address")
                .in("id", allAttestedIds);
            for (const r of recWalletRows || []) receiptWalletMap.set(r.id, r.wallet_address);
        }

        const endorsedCountMap = new Map<string, number>();
        for (const [attester, rIds] of attesterReceiptMap.entries()) {
            const unique = new Set<string>();
            for (const rid of rIds) { const w = receiptWalletMap.get(rid); if (w) unique.add(w); }
            endorsedCountMap.set(attester, unique.size);
        }

        // ── 8. Merge & score correctly per entity type ─────────────────────────
        let allEntries = profiles
            .filter((p) => p.is_test !== true)
            .map((p) => {
                const verif      = verifMap.get(p.wallet_address);
                const isOrgCard  = !!verif && isOrgVerif(verif);
                const receipts   = receiptCountMap.get(p.wallet_address) || 0;
                const attested   = attestedCountMap.get(p.wallet_address) || 0;
                const skills     = (p.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean);

                let totalScore: number;
                let displayLevel: string;
                let activityStatus: string;

                if (isOrgCard) {
                    // ── Org: read stored score; compute live only as fallback ───
                    const stored = orgScoreMap.get(p.wallet_address);
                    if (stored) {
                        totalScore     = stored.trust_score;
                        displayLevel   = stored.level;
                        activityStatus = stored.activity_status || "active";
                    } else {
                        const daysVerified = verif!.created_at
                            ? Math.floor((Date.now() - new Date(verif!.created_at).getTime()) / (1000 * 60 * 60 * 24))
                            : 0;
                        const orgResult = computeOrgTrust(p, {
                            type:              verif!.type,
                            tier:              verif!.verifier_tier || 0,
                            attestationsGiven: attestationsGivenMap.get(p.wallet_address) || 0,
                            uniqueEndorsed:    endorsedCountMap.get(p.wallet_address) || 0,
                            hiringCollections: hiringCountMap.get(p.wallet_address) || 0,
                            daysVerified,
                            hasActiveSub:      subActiveMap.get(p.wallet_address) || false,
                        });
                        totalScore     = orgResult.trust_score;
                        displayLevel   = orgResult.level;
                        activityStatus = orgResult.activity_status;
                    }
                } else {
                    // ── Individual: read CV Score from scores table ────────────
                    const cv       = cvScoreMap.get(p.wallet_address);
                    totalScore     = cv?.total_score    ?? 0;
                    displayLevel   = cv?.level          ?? "Beginner";
                    activityStatus = cv?.activity_status ?? "active";
                }

                const successRate = receipts > 0 ? Math.round((attested / receipts) * 100) : 0;

                // Status badge
                let status: "available" | "top_rated" | "featured" | null = null;
                if      (totalScore >= 90)                                       status = "top_rated";
                else if (totalScore >= 75)                                       status = "featured";
                else if (activityStatus === "active" || receipts > 0 ||
                         (attestationsGivenMap.get(p.wallet_address) || 0) > 0) status = "available";

                return {
                    walletAddress:          p.wallet_address,
                    authUid:                undefined as string | undefined,
                    displayName:            p.display_name || "Anonymous",
                    bio:                    p.bio,
                    skills,
                    workPreference:         p.work_preference || [],
                    avatarUrl:              p.avatar_url,
                    role:                   p.professional_role,
                    organization:           p.organization,
                    cardNumber:             p.card_number,
                    country:                p.country,
                    createdAt:              p.created_at,
                    totalScore,
                    trustScore:             isOrgCard ? totalScore : undefined,
                    level:                  displayLevel,
                    isVerified:             !!verif && (!verif.expires_at || new Date(verif.expires_at) > new Date()),
                    verifierTier:           verif?.verifier_tier ?? 0,
                    verificationType:       verif?.type ?? null,
                    receiptCount:           receipts,
                    successRate,
                    status,
                    github:                 p.github   || undefined,
                    twitter:                p.twitter  || undefined,
                    linkedin:               p.linkedin || undefined,
                    website:                p.website  || undefined,
                    // Org-specific stats (used in org cards)
                    endorsedCount:          endorsedCountMap.get(p.wallet_address) || 0,
                    hiringCount:            hiringCountMap.get(p.wallet_address)    || 0,
                    attestationsGivenCount: attestationsGivenMap.get(p.wallet_address) || 0,
                    isOrg:                  isOrgCard,
                };
            });

        // ── 8.5. Google-login orgs (org_accounts, not in profiles) ────────────
        // Only added when no category filter is active (these accounts have no
        // skills data, so they'd match no category keyword).
        if (category === "all") {
            const { data: googleOrgRows } = await supabase
                .from("org_accounts")
                .select("auth_uid, org_name, org_type, bio, avatar_url, website, subscription_status, plan_name, current_period_end, created_at, wallet_address")
                .eq("onboarding_complete", true);

            const profileWalletSet = new Set(wallets);
            const googleOrgs = (googleOrgRows || []).filter(
                (g) => !g.wallet_address || !profileWalletSet.has(g.wallet_address)
            );

            if (googleOrgs.length) {
                // Fetch verifications for those with a wallet address
                const gWallets = googleOrgs.map((g) => g.wallet_address).filter(Boolean) as string[];
                const gVerifMap = new Map<string, any>();
                if (gWallets.length) {
                    const { data: gVerifs } = await supabase
                        .from("organization_verifications")
                        .select("wallet_address, status, verifier_tier, type, expires_at, created_at")
                        .in("wallet_address", gWallets)
                        .eq("status", "verified");
                    for (const v of gVerifs || []) gVerifMap.set(v.wallet_address, v);
                }

                const now = new Date();
                for (const g of googleOrgs) {
                    const verif         = g.wallet_address ? gVerifMap.get(g.wallet_address) : null;
                    const validVerif    = verif && (!verif.expires_at || new Date(verif.expires_at) > now);
                    const tier          = validVerif ? (verif.verifier_tier || 0) : 0;
                    const daysVerified  = validVerif && verif.created_at
                        ? Math.floor((Date.now() - new Date(verif.created_at).getTime()) / 86400000)
                        : Math.floor((Date.now() - new Date(g.created_at).getTime()) / 86400000);
                    const orgType       = validVerif
                        ? verif.type
                        : (g.org_type === "company" ? "Company / Organization" : "Community / DAO");
                    const hasActiveSub  = !!(
                        g.subscription_status !== "canceled" &&
                        g.plan_name && g.plan_name !== "free" &&
                        (!g.current_period_end || new Date(g.current_period_end) > now)
                    );

                    const orgResult = computeOrgTrust(
                        { bio: g.bio, avatar_url: g.avatar_url, website: g.website },
                        { type: orgType, tier, attestationsGiven: 0, uniqueEndorsed: 0, hiringCollections: 0, daysVerified, hasActiveSub }
                    );

                    let status: "available" | "top_rated" | "featured" | null = null;
                    if      (orgResult.trust_score >= 90) status = "top_rated";
                    else if (orgResult.trust_score >= 75) status = "featured";
                    else if (hasActiveSub)                status = "available";

                    allEntries.push({
                        walletAddress:          g.wallet_address || `gauth:${g.auth_uid}`,
                        authUid:                g.auth_uid,
                        displayName:            g.org_name || "Anonymous Organization",
                        bio:                    g.bio,
                        skills:                 [],
                        workPreference:         [],
                        avatarUrl:              g.avatar_url,
                        role:                   orgType,
                        organization:           g.org_name,
                        cardNumber:             null,
                        country:                null,
                        createdAt:              g.created_at,
                        totalScore:             orgResult.trust_score,
                        trustScore:             orgResult.trust_score,
                        level:                  orgResult.level,
                        isVerified:             !!validVerif,
                        verifierTier:           tier,
                        verificationType:       orgType,
                        receiptCount:           0,
                        successRate:            0,
                        status,
                        github:                 undefined,
                        twitter:                undefined,
                        linkedin:               undefined,
                        website:                g.website || undefined,
                        endorsedCount:          0,
                        hiringCount:            0,
                        attestationsGivenCount: 0,
                        isOrg:                  true,
                    });
                }
            }
        }

        // ── 9. Filters ─────────────────────────────────────────────────────────
        if (minScore > 0 || maxScore < 100) {
            allEntries = allEntries.filter((t) => t.totalScore >= minScore && t.totalScore <= maxScore);
        }
        if (availableOnly) allEntries = allEntries.filter((t) => t.receiptCount > 0 || t.status === "available");
        if (verifiedOnly)  allEntries = allEntries.filter((t) => t.verifierTier > 0);

        // ── 10. Sort ───────────────────────────────────────────────────────────
        const defaultSort = (a: any, b: any) => {
            // Avatar → skills → score
            const aAvatar = !!a.avatarUrl, bAvatar = !!b.avatarUrl;
            if (aAvatar !== bAvatar) return aAvatar ? -1 : 1;
            const aSkills = a.skills.length > 0, bSkills = b.skills.length > 0;
            if (aSkills !== bSkills) return aSkills ? -1 : 1;
            return b.totalScore - a.totalScore;
        };

        // ── 11. Split first, then sort each group independently ───────────────
        // Splitting before sorting guarantees that org cards never displace
        // individual cards in the ordering (they share the same avatar/skills
        // priority criteria and would otherwise interleave).
        const individuals   = allEntries.filter((t) => !t.isOrg);
        const organizations = allEntries.filter((t) =>  t.isOrg);

        const sortFn =
            sort === "score_asc" ? (a: any, b: any) => a.totalScore - b.totalScore :
            sort === "newest"    ? (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() :
            defaultSort; // score_desc + default → avatar → skills → score desc

        individuals.sort(sortFn);
        organizations.sort(sortFn);

        // 4 individuals + 4 organizations per page (totals 8 cards)
        const halfLimit   = Math.floor(limit / 2);
        const offset      = (page - 1) * halfLimit;

        const paginatedIndividuals   = individuals.slice(offset, offset + halfLimit);
        const paginatedOrganizations = organizations.slice(offset, offset + halfLimit);

        const total      = individuals.length + organizations.length;
        const totalPages = Math.max(
            Math.ceil(individuals.length   / halfLimit),
            Math.ceil(organizations.length / halfLimit)
        );

        return NextResponse.json({ talents: paginatedIndividuals, organizations: paginatedOrganizations, total, page, totalPages });

    } catch (err: any) {
        console.error("[explore-talent]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
