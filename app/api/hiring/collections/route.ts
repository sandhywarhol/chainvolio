import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { isRecruiterTier, getHiringLimit } from "@/lib/paymentConfig";

const errorResponse = (code: string, message: string, status: number = 400) => {
    return NextResponse.json({
        ok: false,
        error: { code, message }
    }, { status });
};

export async function GET(request: Request) {
    if (!supabase) {
        return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);
    }

    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get("wallet");

        if (!wallet) {
            return errorResponse("ERR_INVALID_REQUEST", "Wallet is required", 400);
        }

        const { data, error } = await supabase
            .from("hiring_collections")
            .select("*")
            .eq("owner_wallet", wallet)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Collection Fetch Error:", error);
            return errorResponse("ERR_DATABASE_ERROR", error.message, 500);
        }

        return NextResponse.json({ ok: true, data });
    } catch (err: any) {
        console.error("Critical API Error:", err);
        return errorResponse("ERR_SERVER_ERROR", err.message || "Server Error", 500);
    }
}

export async function POST(request: Request) {
    if (!supabase) {
        return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);
    }

    try {
        const body = await request.json();
        const { title, description, ownerWallet, filters, signature, nonce, timestamp, ...metadata } = body;

        if (!title?.trim() || !ownerWallet) {
            return errorResponse("ERR_INVALID_REQUEST", "Title and ownerWallet are required", 400);
        }
        if (title.trim().length < 5) {
            return errorResponse("ERR_INVALID_REQUEST", "Title must be at least 5 characters.", 400);
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

        // --- Tier Resolution ---
        const { data: orgData } = await supabase
            .from("organization_verifications")
            .select("status, type, expires_at")
            .eq("wallet_address", ownerWallet)
            .maybeSingle();

        const now = new Date();
        const expiresAtDate = orgData?.expires_at ? new Date(orgData.expires_at) : null;
        const isExpired = expiresAtDate ? now > expiresAtDate : false;
        const isVerified = orgData?.status === "verified" && !isExpired;
        const verificationTier = isVerified ? (orgData?.type || "unverified") : "unverified";

        // --- Google org subscription check (wallet linked to a paid org_account) ---
        const { data: googleOrgData } = await supabase
            .from("org_accounts")
            .select("plan_name, subscription_status, current_period_end")
            .eq("wallet_address", ownerWallet)
            .maybeSingle();

        const googlePeriodExpired = googleOrgData?.current_period_end
            ? new Date(googleOrgData.current_period_end) < now : false;
        const isGoogleOrgActive = !!(
            googleOrgData?.subscription_status === "active" &&
            !googlePeriodExpired &&
            googleOrgData?.plan_name &&
            googleOrgData.plan_name !== "free"
        );

        // Active Google subscription unlocks unlimited hiring (same as verified wallet orgs)
        const effectiveHiringLimit = isGoogleOrgActive ? null : getHiringLimit(verificationTier);
        console.log(`[hiring-api] wallet=${ownerWallet} tier=${verificationTier} googleOrg=${isGoogleOrgActive} limit=${effectiveHiringLimit}`);

        // Capped tiers (non-unlimited): check existing collection count
        if (effectiveHiringLimit !== null) {
            const { count: existingCount } = await supabase
                .from("hiring_collections")
                .select("*", { count: "exact", head: true })
                .eq("owner_wallet", ownerWallet);

            const used = existingCount ?? 0;
            console.log(`[hiring-api] collections used=${used} limit=${effectiveHiringLimit}`);

            if (used >= effectiveHiringLimit!) {
                return errorResponse(
                    "ERR_HIRING_LIMIT_REACHED",
                    "You've reached your hiring limit. Upgrade for unlimited access.",
                    403
                );
            }
        }

        // Validate URL fields in metadata
        const urlFieldNames = ["websiteUrl", "twitterUrl", "linkedinUrl", "discordUrl", "telegramUrl"];
        for (const field of urlFieldNames) {
            const val = metadata[field]?.trim();
            if (val) {
                try {
                    const parsed = new URL(val);
                    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                        return errorResponse("ERR_INVALID_REQUEST", `${field} must use http or https.`, 400);
                    }
                } catch {
                    return errorResponse("ERR_INVALID_REQUEST", `${field} is not a valid URL.`, 400);
                }
            }
        }

        // Set transaction context for RLS
        await supabase.rpc('set_app_wallet', { wallet_addr: ownerWallet });

        // Generate a clean slug
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const randomHash = Math.random().toString(36).substring(2, 10);
        const slug = `${baseSlug}-${randomHash}`;

        // --- Trusted Hiring Signal Logic (Benefit System) ---
        const updatedMetadata = { ...metadata };
        if (isGoogleOrgActive) {
            updatedMetadata.isTrusted = true;
            updatedMetadata.verificationTier = googleOrgData!.plan_name;
        } else if (isVerified && isRecruiterTier(orgData?.type)) {
            updatedMetadata.isTrusted = true;
            updatedMetadata.verificationTier = orgData.type;
        } else {
            updatedMetadata.isTrusted = false;
        }

        const { data, error } = await supabase
            .from("hiring_collections")
            .insert({
                title,
                description,
                slug,
                owner_wallet: ownerWallet,
                metadata: updatedMetadata,
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
