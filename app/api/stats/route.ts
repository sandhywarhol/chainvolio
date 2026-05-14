import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    try {
        // 1. Total Talents
        const { count: talentsCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        // 2. Verified Talents (Only Company & Community)
        const { count: verifiedCount } = await supabase
            .from("organization_verifications")
            .select("*", { count: "exact", head: true })
            .eq("status", "verified")
            .in("type", ["Company / Organization", "Community / DAO"]);

        // 3. Total Opportunities (Hiring Collections)
        const { count: opportunitiesCount } = await supabase
            .from("hiring_collections")
            .select("*", { count: "exact", head: true });

        // 4. Countries (Distinct)
        const { data: countriesData } = await supabase
            .from("profiles")
            .select("country");
        
        const uniqueCountries = new Set(
            (countriesData || [])
                .map(p => p.country)
                .filter(Boolean)
        );

        // 5. Sample Team Avatars (Only Company & Community)
        const { data: verifiedWallets } = await supabase
            .from("organization_verifications")
            .select("wallet_address")
            .eq("status", "verified")
            .in("type", ["Company / Organization", "Community / DAO"])
            .limit(10);

        const wallets = (verifiedWallets || []).map(v => v.wallet_address);
        
        let teamAvatars: string[] = [];
        if (wallets.length > 0) {
            const { data: avatars } = await supabase
                .from("profiles")
                .select("avatar_url")
                .in("wallet_address", wallets)
                .not("avatar_url", "is", null)
                .limit(5);
            
            teamAvatars = (avatars || []).map(a => a.avatar_url);
        }

        // 6. Verified Proofs of Work
        const { count: verifiedProofsCount } = await supabase
            .from("receipts")
            .select("*", { count: "exact", head: true })
            .in("status", ["Attested", "Verified", "verified"]);

        // ─── 7. Verified Organization Specific Stats ──────────────────────────
        // Only count stats for wallets that are actually verified as Company/DAO
        const { data: verifiedOrgs } = await supabase
            .from("organization_verifications")
            .select("wallet_address")
            .eq("status", "verified")
            .in("type", ["Company / Organization", "Community / DAO"]);
        
        const orgWallets = (verifiedOrgs || []).map(v => v.wallet_address);
        let orgOpportunities = 0;
        let orgAttestations = 0;
        let orgEndorsed = 0;

        if (orgWallets.length > 0) {
            // Sum of opportunities
            const { count: oppCount } = await supabase
                .from("hiring_collections")
                .select("*", { count: "exact", head: true })
                .in("owner_wallet", orgWallets);
            orgOpportunities = oppCount || 0;

            // Sum of attestations given
            const { count: attCount } = await supabase
                .from("attestations")
                .select("*", { count: "exact", head: true })
                .in("attester_wallet", orgWallets);
            orgAttestations = attCount || 0;

            // Sum of unique endorsed talents
            const { data: endorsedData } = await supabase
                .from("attestations")
                .select("receipt_id")
                .in("attester_wallet", orgWallets);
            
            const rIds = (endorsedData || []).map(d => d.receipt_id);
            if (rIds.length > 0) {
                const { data: recs } = await supabase
                    .from("receipts")
                    .select("wallet_address")
                    .in("id", rIds);
                orgEndorsed = new Set((recs || []).map(r => r.wallet_address)).size;
            }
        }

        // 8. Total Skills (Unique across all profiles)
        const { data: skillsData } = await supabase
            .from("profiles")
            .select("skills");
        
        const uniqueSkills = new Set(
            (skillsData || [])
                .flatMap(p => p.skills || [])
                .filter(Boolean)
        );

        return NextResponse.json({
            talents: talentsCount || 0,
            verified: verifiedCount || 0,
            opportunities: orgOpportunities || 0, // Using org-specific count
            countries: uniqueCountries.size || 0,
            teamAvatars,
            verifiedProofs: orgAttestations || 0, // Using org-specific count
            endorsedTalents: orgEndorsed || 0,     // Using org-specific count
            skills: uniqueSkills.size || 0
        });
    } catch (err) {
        console.error("[stats-api]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
