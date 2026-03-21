import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const ADMIN_WALLET_ADDRESS = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { adminWallet, signature, nonce, timestamp, cvId } = body;

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
                "admin_access",
                nonce || "",
                timestamp || 0,
                signature || ""
            );

            if (!isValid) {
                return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
            }
        }

        if (!cvId || isNaN(Number(cvId))) {
            return NextResponse.json({ error: "Invalid CV ID" }, { status: 400 });
        }

        const cardNumber = Number(cvId);

        const { showTestUsers } = body;

        // Fetch user profile
        const { data: profile, error: profileErr } = await supabase
            .from("profiles")
            .select("wallet_address, display_name, professional_role, card_number, is_test")
            .eq("card_number", cardNumber)
            .single();

        if (profileErr || !profile) {
            return NextResponse.json({ error: "Profile not found for this CV ID." }, { status: 404 });
        }

        // 1. Hide Test Users
        if (!showTestUsers && profile.is_test) {
            return NextResponse.json({ error: "Profile not found (Test user excluded)." }, { status: 404 });
        }

        // 2. Hide Invalid/Placeholder profiles (Profile completes when they choose a real name)
        const placeholderNames = ["Direct Debug User", "Smoke Test User"];
        const isPlaceholderName = !profile.display_name || placeholderNames.some(n => profile.display_name.includes(n));
        
        if (isPlaceholderName && !showTestUsers) {
             return NextResponse.json({ error: "Profile is incomplete or invalid." }, { status: 404 });
        }

        // Fetch current verification status
        const { data: verifData } = await supabase
            .from("organization_verifications")
            .select("status, type")
            .eq("wallet_address", profile.wallet_address)
            .maybeSingle();

        return NextResponse.json({ 
            ok: true, 
            data: {
                wallet_address: profile.wallet_address,
                display_name: profile.display_name,
                role: profile.professional_role,
                card_number: profile.card_number,
                verification_status: verifData?.status || "unverified",
                verification_tier: verifData?.type || "None"
            }
        });

    } catch (err) {
        console.error("Admin curated search error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
