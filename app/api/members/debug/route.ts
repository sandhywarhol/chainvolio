import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

// GET /api/members/debug?builderWallet=xxx&recruiterWallet=xxx&testInsert=1
export async function GET(request: Request) {
    if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const builderWallet = searchParams.get("builderWallet");
    const recruiterWallet = searchParams.get("recruiterWallet");
    const testInsert = searchParams.get("testInsert");

    const result: Record<string, any> = {};

    // 1. Check invitations for builder
    if (builderWallet) {
        const { data: invites, error: ie } = await supabase
            .from("member_invitations")
            .select("*")
            .eq("builder_wallet", builderWallet)
            .order("created_at", { ascending: false });
        result.invitations = { data: invites, error: ie };

        // 2. Check builder exists in profiles
        const { data: profile, error: pe } = await supabase
            .from("profiles")
            .select("wallet_address, display_name, card_number")
            .eq("wallet_address", builderWallet)
            .maybeSingle();
        result.builderProfile = { data: profile, error: pe };
    }

    // 3. Check invitations sent by recruiter
    if (recruiterWallet) {
        const { data: sent, error: se } = await supabase
            .from("member_invitations")
            .select("*")
            .eq("recruiter_wallet", recruiterWallet)
            .order("created_at", { ascending: false });
        result.sentInvitations = { data: sent, error: se };

        const { data: members, error: me } = await supabase
            .from("company_members")
            .select("*")
            .eq("recruiter_wallet", recruiterWallet);
        result.members = { data: members, error: me };

        // 4. Check recruiter wallet exists in profiles (for wallet users)
        const { data: recProfile, error: rpe } = await supabase
            .from("profiles")
            .select("wallet_address, display_name, card_number")
            .eq("wallet_address", recruiterWallet)
            .maybeSingle();
        result.recruiterProfile = { data: recProfile, error: rpe };
    }

    // 5. Check hiring_collections for recruiter wallet
    if (recruiterWallet) {
        const { data: hirings, error: he } = await supabase
            .from("hiring_collections")
            .select("id, title, slug, owner_wallet, created_at")
            .eq("owner_wallet", recruiterWallet);
        result.recruiterHirings = { data: hirings, count: hirings?.length ?? 0, error: he };

        // Also check shared-hirings API flow for builder
        if (builderWallet) {
            const { data: memberships } = await supabase
                .from("company_members")
                .select("recruiter_wallet, company_name, role")
                .eq("builder_wallet", builderWallet)
                .eq("status", "active");
            result.builderMemberships = memberships;

            const ownerWallets = (memberships ?? []).map((m: any) => m.recruiter_wallet);
            if (ownerWallets.length > 0) {
                const { data: sharedHirings, error: she } = await supabase
                    .from("hiring_collections")
                    .select("id, title, slug, owner_wallet")
                    .in("owner_wallet", ownerWallets);
                result.sharedHirings = { ownerWallets, data: sharedHirings, error: she };
            } else {
                result.sharedHirings = { ownerWallets: [], data: [], note: "No active memberships found" };
            }
        }
    }

    // 6. Test insert a dummy invitation (if testInsert=1 and both wallets provided)
    if (testInsert === "1" && builderWallet && recruiterWallet) {
        const { data: inserted, error: insertError } = await supabase
            .from("member_invitations")
            .insert({
                recruiter_wallet: recruiterWallet,
                recruiter_company: "DEBUG TEST",
                lookup_value: builderWallet,
                lookup_type: "wallet",
                builder_wallet: builderWallet,
                role: "member",
                status: "pending",
            })
            .select()
            .single();

        result.testInsert = { data: inserted, error: insertError };

        // Cleanup test record
        if (inserted?.id) {
            await supabase.from("member_invitations").delete().eq("id", inserted.id);
            result.testInsert.cleaned = true;
        }
    }

    return NextResponse.json({ ok: true, ...result });
}
