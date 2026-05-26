import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
    // 1. Fetch Collection details
    const { data: collection, error: fetchError } = await supabase
        .from("hiring_collections")
        .select("*")
        .eq("slug", params.slug)
        .maybeSingle();

    if (fetchError || !collection) {
        return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // 2. Fetch Owner Profile and Verification in Parallel (Manual Join)
    const { owner_wallet } = collection;
    const [profileRes, verifRes] = await Promise.all([
        supabase.from("profiles").select("avatar_url, display_name, headline, professional_role").eq("wallet_address", owner_wallet).maybeSingle(),
        supabase.from("organization_verifications").select("status, type, expires_at").eq("wallet_address", owner_wallet).maybeSingle()
    ]);

    const owner_profile = profileRes.data;
    const owner_verification = verifRes.data;
    
    // Calculate verified status
    const isExpired = owner_verification?.expires_at ? new Date(owner_verification.expires_at) < new Date() : false;
    const isVerified = owner_verification?.status === 'verified' && !isExpired;
    const verificationTier = isVerified ? owner_verification?.type : null;

    return NextResponse.json({ 
        collection,
        owner_profile: owner_profile ? { 
            ...owner_profile, 
            isVerified, 
            verificationTier,
            verificationStatus: owner_verification?.status || 'unverified'
        } : null
    });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { slug: string } }
) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const signature = searchParams.get("signature");
    const nonce = searchParams.get("nonce");
    const timestamp = searchParams.get("timestamp");

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    try {
        // 1. Get Collection ID & Owner
        const { data: collection, error: fetchError } = await supabase
            .from("hiring_collections")
            .select("id, owner_wallet")
            .eq("slug", slug)
            .single();

        if (fetchError || !collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        // --- Auth: Google session OR wallet signature ---
        const authHeader = request.headers.get("Authorization");
        const isGoogleAuth = authHeader?.startsWith("Bearer ");

        if (isGoogleAuth) {
            const token = authHeader!.replace("Bearer ", "");
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            if (authError || !user) {
                return NextResponse.json({ error: "Invalid session." }, { status: 401 });
            }
            if (collection.owner_wallet !== `gauth:${user.id}`) {
                return NextResponse.json({ error: "Unauthorized. You do not own this collection." }, { status: 403 });
            }
            // No RLS context needed — service role bypasses RLS
        } else {
            const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
            if (!skipVerify && (!wallet || !signature || !nonce || !timestamp)) {
                return NextResponse.json({ error: "Signature required to delete collection." }, { status: 401 });
            }

            const { verifySignature } = await import("@/lib/crypto");
            const { isValid, error: sigError } = await verifySignature(
                wallet || "",
                "update_profile",
                nonce || "",
                timestamp ? parseInt(timestamp) : 0,
                signature || ""
            );

            if (!isValid) {
                return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
            }

            if (collection.owner_wallet !== wallet) {
                return NextResponse.json({ error: "Unauthorized. You do not own this collection." }, { status: 403 });
            }

            await supabase.rpc('set_app_wallet', { wallet_addr: wallet });
        }
        // ----------------------------

        // 2. Delete submissions (if any)
        const { error: subError } = await supabase
            .from("collection_submissions")
            .delete()
            .eq("collection_id", collection.id);

        if (subError) {
            console.error("Error deleting submissions:", subError);
            // Proceeding to try deleting collection anyway, but logging error.
        }

        // 3. Delete the collection
        const { error: deleteError } = await supabase
            .from("hiring_collections")
            .delete()
            .eq("id", collection.id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}
