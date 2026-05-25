import { supabaseServer as supabase } from "@/lib/supabase/server";

export type SiteStats = {
    talents: number;
    verified: number;
    opportunities: number;
    countries: number;
    teamAvatars: string[];
    verifiedProofs: number;
    endorsedTalents: number;
    skills: number;
};

export async function fetchSiteStats(): Promise<SiteStats> {
    const fallback: SiteStats = {
        talents: 0, verified: 0, opportunities: 0, countries: 0,
        teamAvatars: [], verifiedProofs: 0, endorsedTalents: 0, skills: 0,
    };

    if (!supabase) return fallback;

    try {
        const [
            { count: talentsCount },
            { count: verifiedCount },
            { count: opportunitiesCount },
            { data: countriesData },
            { data: verifiedWallets },
            { count: verifiedProofsCount },
            { data: skillsData },
        ] = await Promise.all([
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("organization_verifications").select("*", { count: "exact", head: true })
                .eq("status", "verified").in("type", ["Company / Organization", "Community / DAO"]),
            supabase.from("hiring_collections").select("*", { count: "exact", head: true }),
            supabase.from("profiles").select("country"),
            supabase.from("organization_verifications").select("wallet_address")
                .eq("status", "verified").in("type", ["Company / Organization", "Community / DAO"]).limit(10),
            supabase.from("receipts").select("*", { count: "exact", head: true })
                .in("status", ["Attested", "Verified", "verified"]),
            supabase.from("profiles").select("skills"),
        ]);

        const uniqueCountries = new Set(
            (countriesData || []).map(p => p.country).filter(Boolean)
        );
        const uniqueSkills = new Set(
            (skillsData || []).flatMap(p => p.skills || []).filter(Boolean)
        );

        const orgWallets = (verifiedWallets || []).map(v => v.wallet_address);

        let teamAvatars: string[] = [];
        let orgOpportunities = 0;
        let orgAttestations = 0;
        let orgEndorsed = 0;

        if (orgWallets.length > 0) {
            const [
                { data: avatars },
                { count: oppCount },
                { count: attCount },
                { data: endorsedData },
            ] = await Promise.all([
                supabase.from("profiles").select("avatar_url")
                    .in("wallet_address", orgWallets).not("avatar_url", "is", null).limit(5),
                supabase.from("hiring_collections").select("*", { count: "exact", head: true })
                    .in("owner_wallet", orgWallets),
                supabase.from("attestations").select("*", { count: "exact", head: true })
                    .in("attester_wallet", orgWallets),
                supabase.from("attestations").select("receipt_id")
                    .in("attester_wallet", orgWallets),
            ]);

            teamAvatars = (avatars || []).map(a => a.avatar_url);
            orgOpportunities = oppCount || 0;
            orgAttestations = attCount || 0;

            const rIds = (endorsedData || []).map(d => d.receipt_id);
            if (rIds.length > 0) {
                const { data: recs } = await supabase
                    .from("receipts").select("wallet_address").in("id", rIds);
                orgEndorsed = new Set((recs || []).map(r => r.wallet_address)).size;
            }
        }

        return {
            talents: talentsCount || 0,
            verified: verifiedCount || 0,
            opportunities: orgOpportunities,
            countries: uniqueCountries.size,
            teamAvatars,
            verifiedProofs: orgAttestations,
            endorsedTalents: orgEndorsed,
            skills: uniqueSkills.size,
        };
    } catch (err) {
        console.error("[fetchSiteStats]", err);
        return fallback;
    }
}
