import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { walletAddress, tier, profileName, website, socials } = body;

        if (!walletAddress || !tier) {
            return NextResponse.json({ error: "walletAddress and tier are required" }, { status: 400 });
        }

        // Map tier ID → a display type string stored in the DB
        const TIER_TYPE_MAP: Record<string, string> = {
            Builder:   "Builder",
            Figure:    "Public Figure",
            Community: "Community / DAO",
            Company:   "Company / Organization",
        };

        const type = TIER_TYPE_MAP[tier];
        if (!type) {
            return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }

        // Check if a request already exists for this wallet
        const { data: existing } = await supabase
            .from("organization_verifications")
            .select("id, status, type, verification_source")
            .eq("wallet_address", walletAddress)
            .maybeSingle();

        if (existing) {
            if (existing.status === "pending") {
                return NextResponse.json({ error: "A verification request is already pending." }, { status: 409 });
            }

            // Hierarchical check to prevent downgrades or redundant requests
            // Basic hierarchy: Builder(1) < Public Figure(2) < Community(3) < Company(4)
            const TIER_RANK: Record<string, number> = { "Builder": 1, "Public Figure": 2, "Community / DAO": 3, "Company / Organization": 4 };
            const currentRank = TIER_RANK[existing.type] || 0;
            const targetRank = TIER_RANK[type] || 0;

            if (existing.status === "verified") {
                if (targetRank <= currentRank) {
                    return NextResponse.json({ error: `You are already verified as ${existing.type}. Please apply for a higher tier to upgrade.` }, { status: 400 });
                }

                // ALLOW UPGRADE: Store in pending_upgrade columns to preserve current status
                const { error: upgradeError } = await supabase
                    .from("organization_verifications")
                    .update({
                        pending_upgrade_type: type,
                        pending_upgrade_status: "pending",
                        name: profileName || walletAddress,
                        website: website || null,
                        social_link: socials || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", existing.id);

                if (upgradeError) return NextResponse.json({ error: upgradeError.message }, { status: 500 });
                return NextResponse.json({ ok: true, upgrade: true });
            }

            // Rejected → allow resubmission by updating the existing row
            const { error: updateError } = await supabase
                .from("organization_verifications")
                .update({
                    type,
                    name: profileName || walletAddress,
                    website: website || null,
                    social_link: socials || null,
                    status: "pending",
                    rejection_reason: null,
                    reviewed_at: null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id);

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }

            return NextResponse.json({ ok: true, resubmitted: true });
        }

        // No existing record → create new
        const { error: insertError } = await supabase
            .from("organization_verifications")
            .insert({
                wallet_address: walletAddress,
                name: profileName || walletAddress,
                type,
                website: website || null,
                social_link: socials || null,
                status: "pending",
            });

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Verify request error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
