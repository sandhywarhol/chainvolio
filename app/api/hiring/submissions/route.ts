import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { headers } from "next/headers";
import crypto from "crypto";

const errorResponse = (code: string, message: string, status: number = 400) => {
    return NextResponse.json({
        ok: false,
        error: { code, message }
    }, { status });
};

// Simple IP Hashing for privacy-preserving rate limits
function getIpHash() {
    const forward = headers().get("x-forwarded-for");
    const ip = forward ? forward.split(",")[0] : "127.0.0.1";
    return crypto.createHash("sha256").update(ip).digest("hex");
}

export async function POST(request: Request) {
    if (!supabase) {
        return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);
    }

    try {
        const body = await request.json();
        const { collectionSlug, walletAddress, primarySignal, roleStrength, signature, nonce, timestamp } = body;
        const cleanSignature = signature?.replace(/\s/g, '');

        if (!collectionSlug || !walletAddress) {
            return errorResponse("ERR_INVALID_REQUEST", "slug and wallet required", 400);
        }

        const ipHash = getIpHash();

        // 1. Find collection ID & Filters (Do this early for signature context)
        const { data: collection, error: colError } = await supabase
            .from("hiring_collections")
            .select("id, eligibility_filters, slug")
            .eq("slug", collectionSlug)
            .single();

        if (colError || !collection) {
            return errorResponse("ERR_COLLECTION_NOT_FOUND", "The hiring collection does not exist", 404);
        }

        // --- 2. Advanced Rate Limiting (IP + Wallet Hybrid) ---
        // Check for existing submissions in the last 1 minute (Wallet)
        const { count: recentWalletSubmissions } = await supabase
            .from("collection_submissions")
            .select("*", { count: "exact", head: true })
            .eq("candidate_wallet", walletAddress)
            .gt("submitted_at", new Date(Date.now() - 60000).toISOString());

        if (recentWalletSubmissions && recentWalletSubmissions > 0) {
            return errorResponse("ERR_RATE_LIMIT", "Please wait a moment before trying again.", 429);
        }

        // IP-based limit: Max 20 submissions per 24h per IP
        // (This assumes we have logged attempts or just check total submissions if we trust the hash)
        // For now, let's just log this attempt in the dedicated table if it exists
        try {
            await supabase.from("submission_activity_logs").insert({
                ip_hash: ipHash,
                wallet_address: walletAddress,
                action: "apply_job"
            });

            // Verification of IP limit
            const { count: ipCount } = await supabase
                .from("submission_activity_logs")
                .select("*", { count: "exact", head: true })
                .eq("ip_hash", ipHash)
                .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            if (ipCount && ipCount > 20) {
                return errorResponse("ERR_RATE_LIMIT_IP", "Daily submission limit reached for this connection.", 429);
            }
        } catch (auditErr) {
            console.warn("Audit logging failed, continuing...", auditErr);
        }

        // --- 3. Signature Verification (with Context) ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify && (!cleanSignature || !nonce || !timestamp)) {
            return errorResponse("ERR_SIGNATURE_REQUIRED", "Signature required to apply.", 401);
        }

        const { verifySignature } = await import("@/lib/crypto");
        const { isValid, error: sigError } = await verifySignature(
            walletAddress,
            "apply_job",
            nonce || "",
            timestamp || 0,
            cleanSignature || "",
            collectionSlug // Hardening: Signature is now bound to THIS collection
        );

        if (!isValid) {
            return errorResponse("ERR_SIGNATURE_CONTEXT", sigError || "Signature verification failed.", 401);
        }

        // Set transaction context for RLS parity
        await supabase.rpc('set_app_wallet', { wallet_addr: walletAddress });

        // 4. Fetch Deep Candidate Data for Snapshot
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("wallet_address", walletAddress)
            .single();

        const { data: receipts } = await supabase
            .from("receipts")
            .select("role, org, description, start_date, end_date, work_type, status, evidence_links, impact")
            .eq("wallet_address", walletAddress)
            .order("start_date", { ascending: false });

        const { data: portfolio } = await supabase
            .from("portfolio_items")
            .select("title, description, image_url, thumbnail_url")
            .eq("wallet_address", walletAddress);

        const receiptList = receipts || [];
        const portfolioList = portfolio || [];
        const attestedCount = receiptList.filter((r: any) => r.status === "Attested").length;

        // 5. Enforce Eligibility Filters (Server-Side)
        const filters = collection.eligibility_filters || {};

        if (filters.minReceiptsThreshold && receiptList.length < (filters.minReceiptsThreshold)) {
            return errorResponse("ERR_ELIGIBILITY_HISTORY", `This position requires at least ${filters.minReceiptsThreshold} work records.`, 403);
        }

        if (filters.verifiedOnly && attestedCount < 1) {
            return errorResponse("ERR_ELIGIBILITY_ATTESTATION", "This position requires at least one verified (attested) work record.", 403);
        }

        // 6. Compute Dynamic Snapshot Tags
        const tags: string[] = [];
        if (receiptList.length >= 10) tags.push("Experienced Professional");
        else if (receiptList.length >= 5) tags.push("Strong On-chain History");

        if (attestedCount >= 3) tags.push("Top-Tier Verified");
        else if (attestedCount >= 1) tags.push("Verified Contributor");

        // 7. Insert submission with Deep Snapshot
        const { error: subError } = await supabase
            .from("collection_submissions")
            .insert({
                collection_id: collection.id,
                candidate_wallet: walletAddress,
                primary_signal: primarySignal || "Not specified",
                role_strength: roleStrength || "Not specified",
                snapshot_data: {
                    profile: {
                        name: profile?.display_name || "Anonymous",
                        avatar: profile?.avatar_url || null,
                        bio: profile?.bio || "",
                        skills: profile?.skills || ""
                    },
                    experience: receiptList,
                    portfolio: portfolioList,
                    tags: tags,
                    stats: {
                        receipts: receiptList.length,
                        attested: attestedCount,
                        portfolio: portfolioList.length
                    }
                }
            });

        if (subError) {
            if (subError.code === "23505") {
                return errorResponse("ERR_DUPLICATE_SUBMISSION", "You have already applied to this collection.", 409);
            }
            console.error("Submission Error:", subError);
            return errorResponse("ERR_DATABASE_ERROR", subError.message, 500);
        }

        // 8. Mark source receipts as 'Submitted' (Locked for Talent)
        // This ensures the candidate cannot edit the history they just shared.
        await supabase
            .from("receipts")
            .update({ status: "Submitted" })
            .eq("wallet_address", walletAddress)
            .in("status", ["Draft", "Self-Declared", "Candidate Claim", null]);

        return NextResponse.json({ ok: true, message: "Application submitted successfully" });
    } catch (err: any) {
        console.error("Submission catch block:", err);
        return errorResponse("ERR_SERVER_ERROR", err.message || "Server Error", 500);
    }
}
