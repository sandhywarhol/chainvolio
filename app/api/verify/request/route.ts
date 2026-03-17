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
            .select("id, status")
            .eq("wallet_address", walletAddress)
            .single();

        if (existing) {
            if (existing.status === "pending") {
                return NextResponse.json({ error: "A verification request is already pending." }, { status: 409 });
            }
            if (existing.status === "verified") {
                return NextResponse.json({ error: "This wallet is already verified." }, { status: 409 });
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
