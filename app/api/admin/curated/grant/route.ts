import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const ADMIN_WALLET_ADDRESS = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

const TYPE_TO_TIER: Record<string, number> = {
    "Builder":               1,
    "Public Figure":         2,
    "Community / DAO":       3,
    "Company / Organization": 4,
};

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { adminWallet, signature, nonce, timestamp, walletAddress, tier } = body;

        if (adminWallet !== ADMIN_WALLET_ADDRESS) {
            return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
        }

        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify) {
            if (!signature || !nonce || !timestamp) {
                return NextResponse.json({ error: "Authentication required." }, { status: 401 });
            }

            const { verifySignature } = await import("@/lib/crypto");
            const { isValid, error: sigError } = await verifySignature(
                adminWallet,
                "admin_access" as any,
                nonce || "",
                timestamp || 0,
                signature || ""
            );

            if (!isValid) {
                return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
            }
        }

        if (!walletAddress || !tier) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        const numericTier = TYPE_TO_TIER[tier];
        if (!numericTier) {
            return NextResponse.json({ error: "Invalid verification tier." }, { status: 400 });
        }

        const nowIso = new Date().toISOString();

        // Check if an entry already exists for this wallet
        const { data: existing, error: fetchErr } = await supabase
            .from("organization_verifications")
            .select("id, name")
            .eq("wallet_address", walletAddress)
            .maybeSingle();

        // Need the user's name if they don’t have an org verification entry
        let fallbackName = "Curated Identity";
        if (!existing) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("display_name")
                .eq("wallet_address", walletAddress)
                .maybeSingle();
            if (profile?.display_name) {
                fallbackName = profile.display_name;
            }
        }

        const updateData: any = {
            wallet_address: walletAddress,
            type: tier,
            status: "verified",
            verifier_tier: numericTier,
            approved_at: nowIso,
            reviewed_at: nowIso,
            expires_at: null, // Admin overrides never expire unless specified
            verification_source: "admin_override",
            updated_at: nowIso,
        };

        if (!existing) {
            updateData.name = fallbackName;
        }

        let targetId = existing?.id;

        if (existing) {
            // Update existing verification record
            const { error: updateErr } = await supabase
                .from("organization_verifications")
                .update(updateData)
                .eq("id", existing.id);

            if (updateErr) {
                return NextResponse.json({ error: updateErr.message }, { status: 500 });
            }
        } else {
            // Create new verification record
            const { data: inserted, error: insertErr } = await supabase
                .from("organization_verifications")
                .insert([{
                    ...updateData,
                    created_at: nowIso,
                }])
                .select("id")
                .single();

            if (insertErr) {
                return NextResponse.json({ error: insertErr.message }, { status: 500 });
            }
            targetId = inserted.id;
        }

        // Add an audit log
        await supabase.from("admin_audit_logs").insert({
            organization_id: targetId,
            organization_name: "Curated Override",
            action: "grant_curated_verification",
            admin_wallet: adminWallet,
            notes: `Admin granted Curated Verification (Tier: ${tier}) to ${walletAddress}`,
            timestamp: nowIso,
        });

        return NextResponse.json({ ok: true });

    } catch (err) {
        console.error("Admin curated grant error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
