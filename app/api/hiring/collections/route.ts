import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const errorResponse = (code: string, message: string, status: number = 400) => {
    return NextResponse.json({
        ok: false,
        error: { code, message }
    }, { status });
};

export async function POST(request: Request) {
    if (!supabase) {
        return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);
    }

    try {
        const body = await request.json();
        const { title, description, ownerWallet, filters, signature, nonce, timestamp, ...metadata } = body;

        if (!title || !ownerWallet) {
            return errorResponse("ERR_INVALID_REQUEST", "Title and ownerWallet are required", 400);
        }

        // --- Signature Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify && (!signature || !nonce || !timestamp)) {
            return errorResponse("ERR_SIGNATURE_REQUIRED", "Signature required to create a collection.", 401);
        }

        const { verifySignature } = await import("@/lib/crypto");
        const { isValid, error: sigError } = await verifySignature(
            ownerWallet,
            "create_collection",
            nonce || "",
            timestamp || 0,
            signature || ""
        );

        if (!isValid) {
            return errorResponse("ERR_SIGNATURE_CONTEXT", sigError || "Signature verification failed.", 401);
        }

        // Set transaction context for RLS
        await supabase.rpc('set_app_wallet', { wallet_addr: ownerWallet });

        // Generate a clean slug
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const randomHash = Math.random().toString(36).substring(2, 7);
        const slug = `${baseSlug}-${randomHash}`;

        const { data, error } = await supabase
            .from("hiring_collections")
            .insert({
                title,
                description,
                slug,
                owner_wallet: ownerWallet,
                metadata: metadata,
                eligibility_filters: filters || {}
            })
            .select()
            .single();

        if (error) {
            console.error("Collection Creation Error:", error);
            return errorResponse("ERR_DATABASE_ERROR", error.message, 500);
        }

        return NextResponse.json({ ok: true, data });
    } catch (err: any) {
        console.error("Critical API Error:", err);
        return errorResponse("ERR_SERVER_ERROR", err.message || "Server Error", 500);
    }
}
