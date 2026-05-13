import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

// Skill keywords per category tab
const CATEGORY_SKILLS: Record<string, string[]> = {
    video: ["video editing", "motion", "animation", "video production", "videography", "daVinci", "premiere", "after effects"],
    design: ["ui/ux", "figma", "branding", "graphic design", "illustration", "product design", "ui", "ux", "visual design"],
    development: ["rust", "solidity", "react", "typescript", "smart contract", "defi", "blockchain", "web3", "frontend", "backend", "full stack", "mobile", "javascript", "python", "go", "anchor"],
    writing: ["content writing", "copywriting", "technical writing", "documentation", "blog", "writing", "content"],
    community: ["community", "discord", "social media", "twitter", "ambassador", "community management", "ops"],
    ai: ["ai", "machine learning", "prompt engineering", "ml", "data science", "gpt", "llm", "artificial intelligence"],
};

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
    // Future filters (accepted now, wired when UI is ready)
    const location      = (searchParams.get("location") || "").trim();
    const ecosystem     = (searchParams.get("ecosystem") || "").trim();
    const availableOnly = searchParams.get("availableOnly") === "true";
    const verifiedOnly  = searchParams.get("verifiedOnly")  === "true";

    try {
        // ── 1. Fetch profiles matching search / workType filters ──────────────
        let profileQuery = supabase
            .from("profiles")
            .select("wallet_address, display_name, bio, skills, work_preference, avatar_url, professional_role, organization, card_number, country, created_at")
            .is("is_test", null);          // exclude test accounts

        if (search) {
            profileQuery = profileQuery.or(
                `display_name.ilike.%${search}%,skills.ilike.%${search}%,professional_role.ilike.%${search}%`
            );
        }

        if (workType) {
            profileQuery = profileQuery.contains("work_preference", [workType]);
        }

        if (location) {
            profileQuery = profileQuery.ilike("country", `%${location}%`);
        }

        const { data: rawProfiles, error: profileError } = await profileQuery;
        if (profileError) throw profileError;
        if (!rawProfiles?.length) {
            return NextResponse.json({ talents: [], total: 0, page, totalPages: 0 });
        }

        // ── 2. Category skill filter (JS-side on skills string) ───────────────
        let profiles = rawProfiles;
        if (category !== "all" && CATEGORY_SKILLS[category]) {
            const keywords = CATEGORY_SKILLS[category];
            profiles = profiles.filter((p) => {
                const s = (p.skills || "").toLowerCase();
                return keywords.some((kw) => s.includes(kw.toLowerCase()));
            });
        }
        if (!profiles.length) {
            return NextResponse.json({ talents: [], total: 0, page, totalPages: 0 });
        }

        const wallets = profiles.map((p) => p.wallet_address);

        // ── 3. Fetch scores for those wallets ─────────────────────────────────
        const { data: scores } = await supabase
            .from("scores")
            .select("wallet_address, total_score, level, activity_status")
            .in("wallet_address", wallets);

        const scoreMap = new Map(
            (scores || []).map((s) => [s.wallet_address, s])
        );

        // ── 4. Fetch org verifications ────────────────────────────────────────
        const { data: verifications } = await supabase
            .from("organization_verifications")
            .select("wallet_address, status, verifier_tier, type, expires_at")
            .in("wallet_address", wallets)
            .eq("status", "verified");

        const verifMap = new Map(
            (verifications || []).map((v) => {
                const expired = v.expires_at ? new Date(v.expires_at) < new Date() : false;
                return [v.wallet_address, { ...v, isExpired: expired }];
            })
        );

        // ── 5. Fetch receipt counts per wallet ────────────────────────────────
        const { data: receiptRows } = await supabase
            .from("receipts")
            .select("wallet_address, id")
            .in("wallet_address", wallets);

        const receiptCountMap = new Map<string, number>();
        for (const r of receiptRows || []) {
            receiptCountMap.set(r.wallet_address, (receiptCountMap.get(r.wallet_address) || 0) + 1);
        }

        // ── 6. Fetch attested receipt counts ──────────────────────────────────
        const receiptIds = (receiptRows || []).map((r) => r.id);
        let attestedReceiptIds = new Set<string>();
        if (receiptIds.length) {
            const { data: attestRows } = await supabase
                .from("attestations")
                .select("receipt_id")
                .in("receipt_id", receiptIds);
            attestedReceiptIds = new Set((attestRows || []).map((a) => a.receipt_id));
        }

        // Build attested count per wallet (receipts that have ≥1 attestation)
        const attestedCountMap = new Map<string, number>();
        if (receiptRows) {
            for (const r of receiptRows) {
                if (attestedReceiptIds.has(r.id)) {
                    attestedCountMap.set(r.wallet_address, (attestedCountMap.get(r.wallet_address) || 0) + 1);
                }
            }
        }

        // ── 7. Merge & enrich ─────────────────────────────────────────────────
        let talents = profiles.map((p) => {
            const scoreData = scoreMap.get(p.wallet_address);
            const verif     = verifMap.get(p.wallet_address);
            const totalScore = scoreData?.total_score ?? 0;
            const receipts  = receiptCountMap.get(p.wallet_address) || 0;
            const attested  = attestedCountMap.get(p.wallet_address) || 0;
            const successRate = receipts > 0 ? Math.round((attested / receipts) * 100) : 0;

            const isVerified = !!verif && !verif.isExpired;
            const verifierTier = verif?.verifier_tier ?? 0;
            const verificationType = verif?.type ?? null;

            const skills = (p.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean);

            // Compute status badge
            let status: "available" | "top_rated" | "featured" | null = null;
            const activityStatus = (scoreData?.activity_status || "").toLowerCase();
            if (totalScore >= 90)       status = "top_rated";
            else if (totalScore >= 75)  status = "featured";
            else if (activityStatus === "active" || receipts > 0) status = "available";

            return {
                walletAddress: p.wallet_address,
                displayName: p.display_name || "Anonymous",
                bio: p.bio,
                skills,
                workPreference: p.work_preference || [],
                avatarUrl: p.avatar_url,
                role: p.professional_role,
                organization: p.organization,
                cardNumber: p.card_number,
                country: p.country,
                createdAt: p.created_at,
                // Score
                totalScore,
                level: scoreData?.level ?? "Beginner",
                // Verification
                isVerified,
                verifierTier,
                verificationType,
                // Stats
                receiptCount: receipts,
                successRate,
                // Badge
                status,
            };
        });

        // ── 8. Score-range filter ─────────────────────────────────────────────
        if (minScore > 0 || maxScore < 100) {
            talents = talents.filter((t) => t.totalScore >= minScore && t.totalScore <= maxScore);
        }

        // ── 8b. Availability / verification filters ───────────────────────────
        if (availableOnly) {
            talents = talents.filter((t) => t.receiptCount > 0 || t.status === "available");
        }
        if (verifiedOnly) {
            talents = talents.filter((t) => t.isVerified);
        }

        // ── 9. Sort ───────────────────────────────────────────────────────────
        if (sort === "score_asc") {
            talents.sort((a, b) => a.totalScore - b.totalScore);
        } else if (sort === "newest") {
            talents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            // score_desc (default)
            talents.sort((a, b) => b.totalScore - a.totalScore);
        }

        // ── 10. Paginate ──────────────────────────────────────────────────────
        const total      = talents.length;
        const totalPages = Math.ceil(total / limit);
        const offset     = (page - 1) * limit;
        const paginated  = talents.slice(offset, offset + limit);

        return NextResponse.json({ talents: paginated, total, page, totalPages });

    } catch (err: any) {
        console.error("[explore-talent]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
