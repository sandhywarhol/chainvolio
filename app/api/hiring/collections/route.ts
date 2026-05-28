import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { isRecruiterTier, getHiringLimit, TREASURY_WALLET, RETAIL_JOB_POST_USDC, RETAIL_JOB_POST_USDC_DISPLAY, USDC_MINT_MAINNET } from "@/lib/paymentConfig";

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
        const authUid = searchParams.get("auth_uid");

        if (!wallet && !authUid) {
            return errorResponse("ERR_INVALID_REQUEST", "Wallet or auth_uid is required", 400);
        }

        const isGoogleAuthUser = !!authUid || (wallet?.startsWith("gauth:") ?? false);
        const effectiveWallet = authUid ? `gauth:${authUid}` : wallet!;

        if (isGoogleAuthUser) {
            const authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return errorResponse("ERR_UNAUTHORIZED", "Missing authorization header", 401);
            }
            const token = authHeader.split(" ")[1];
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            if (authError || !user) {
                return errorResponse("ERR_UNAUTHORIZED", "Invalid token", 401);
            }
            if (effectiveWallet !== `gauth:${user.id}`) {
                 return errorResponse("ERR_FORBIDDEN", "Forbidden access", 403);
            }
        } else {
            const signature = searchParams.get("signature");
            const nonce = searchParams.get("nonce");
            const timestamp = searchParams.get("timestamp");

            const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
            if (!skipVerify && (!signature || !nonce || !timestamp)) {
                return errorResponse("ERR_SIGNATURE_REQUIRED", "Signature required to view collections.", 401);
            }

            if (!skipVerify) {
                const { verifySignature } = await import("@/lib/crypto");
                const { isValid, error: sigError } = await verifySignature(
                    effectiveWallet,
                    "view_dashboard",
                    nonce || "",
                    parseInt(timestamp || "0", 10),
                    signature || ""
                );

                if (!isValid) {
                    return errorResponse("ERR_SIGNATURE_CONTEXT", sigError || "Signature verification failed.", 401);
                }
            }
        }

        const { data, error } = await supabase
            .from("hiring_collections")
            .select("*")
            .eq("owner_wallet", effectiveWallet)
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
        const { title, description, ownerWallet, filters, signature, nonce, timestamp, auth_uid, ...metadata } = body;

        if (!title?.trim() || !ownerWallet) {
            return errorResponse("ERR_INVALID_REQUEST", "Title and ownerWallet are required", 400);
        }
        if (title.trim().length < 5) {
            return errorResponse("ERR_INVALID_REQUEST", "Title must be at least 5 characters.", 400);
        }

        // --- Signature Verification ---
        // Google-auth users (ownerWallet = "gauth:<auth_uid>") skip signature — no wallet to sign with.
        const isGoogleAuthUser = ownerWallet.startsWith("gauth:");
        if (!isGoogleAuthUser) {
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
        }

        const now = new Date();
        let isGoogleOrgActive = false;
        let verificationTier = "unverified";
        // Plan type for Google users who have an org plan but inactive subscription.
        // Used to give them 2 free posts (vs 1 for non-org Google users).
        let googleInactiveOrgPlan = "";

        if (isGoogleAuthUser) {
            // --- Google-user tier: check org_accounts by auth_uid ---
            const uid = auth_uid || ownerWallet.replace("gauth:", "");
            const { data: gaOrgData } = await supabase
                .from("org_accounts")
                .select("plan_name, subscription_status, current_period_end")
                .eq("auth_uid", uid)
                .maybeSingle();

            const gaPeriodExpired = gaOrgData?.current_period_end
                ? new Date(gaOrgData.current_period_end) < now : false;
            isGoogleOrgActive = !!(
                gaOrgData?.subscription_status === "active" &&
                !gaPeriodExpired &&
                gaOrgData?.plan_name &&
                gaOrgData.plan_name !== "free"
            );
            // Capture plan name for unsubscribed org detection below
            if (!isGoogleOrgActive) googleInactiveOrgPlan = gaOrgData?.plan_name || "";
            // Google-only users are capped at unverified tier unless they have an active subscription
            verificationTier = "unverified";
        } else {
            // --- Wallet-user tier: check organization_verifications ---
            const { data: orgData } = await supabase
                .from("organization_verifications")
                .select("status, type, expires_at")
                .eq("wallet_address", ownerWallet)
                .maybeSingle();

            const expiresAtDate = orgData?.expires_at ? new Date(orgData.expires_at) : null;
            const isExpired = expiresAtDate ? now > expiresAtDate : false;
            const isVerified = orgData?.status === "verified" && !isExpired;
            verificationTier = isVerified ? (orgData?.type || "unverified") : "unverified";

            // --- Google org subscription check (wallet linked to a paid org_account) ---
            const { data: googleOrgData } = await supabase
                .from("org_accounts")
                .select("plan_name, subscription_status, current_period_end")
                .eq("wallet_address", ownerWallet)
                .maybeSingle();

            const googlePeriodExpired = googleOrgData?.current_period_end
                ? new Date(googleOrgData.current_period_end) < now : false;
            isGoogleOrgActive = !!(
                googleOrgData?.subscription_status === "active" &&
                !googlePeriodExpired &&
                googleOrgData?.plan_name &&
                googleOrgData.plan_name !== "free"
            );
        }

        // Determine effective limit:
        //   - Active Google subscription → unlimited
        //   - Google user with org-type plan (company/community) but inactive → 2 free
        //   - Everything else → tier-based (company/dao wallet = null, builder/public/unverified = 1)
        const isGoogleUnsubscribedOrg = !isGoogleOrgActive && !!googleInactiveOrgPlan && (
            googleInactiveOrgPlan.toLowerCase().includes("company") ||
            googleInactiveOrgPlan.toLowerCase().includes("org") ||
            googleInactiveOrgPlan.toLowerCase().includes("community") ||
            googleInactiveOrgPlan.toLowerCase().includes("dao")
        );
        const effectiveHiringLimit = isGoogleOrgActive ? null
            : isGoogleUnsubscribedOrg ? 2
            : getHiringLimit(verificationTier);
        console.log(`[hiring-api] wallet=${ownerWallet} tier=${verificationTier} googleOrg=${isGoogleOrgActive} limit=${effectiveHiringLimit}`);

        // ─── Hiring limit check + on-chain payment gate ───────────────────────
        let isPaidJobPost = false;

        if (effectiveHiringLimit !== null) {
            const { count: existingCount } = await supabase
                .from("hiring_collections")
                .select("*", { count: "exact", head: true })
                .eq("owner_wallet", ownerWallet);

            const used = existingCount ?? 0;
            console.log(`[hiring-api] collections used=${used} limit=${effectiveHiringLimit}`);

            if (used >= effectiveHiringLimit!) {
                const xPaymentTxSig = body.x_payment_txsig as string | undefined;

                if (!xPaymentTxSig) {
                    // ── First request: return 402 with static payment details ──
                    return new NextResponse(
                        JSON.stringify({
                            ok: false,
                            error: {
                                code: "ERR_PAYMENT_REQUIRED",
                                message: `Free job post limit reached. Pay $${RETAIL_JOB_POST_USDC_DISPLAY} USDC to post additional jobs.`,
                                paymentDetails: {
                                    asset: USDC_MINT_MAINNET,
                                    payTo: TREASURY_WALLET,
                                    amount: RETAIL_JOB_POST_USDC,
                                    network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
                                },
                            },
                        }),
                        { status: 402, headers: { "Content-Type": "application/json" } }
                    );
                }

                // ── Retry with tx signature: verify on Solana RPC ──────────────
                try {
                    const { Connection } = await import("@solana/web3.js");
                    const rpcUrl = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
                    const conn = new Connection(rpcUrl, "confirmed");

                    const tx = await conn.getParsedTransaction(xPaymentTxSig, {
                        maxSupportedTransactionVersion: 0,
                        commitment: "confirmed",
                    });

                    if (!tx || tx.meta?.err !== null) {
                        return errorResponse("ERR_PAYMENT_INVALID", "Transaction not found or failed on-chain.", 402);
                    }

                    // Verify treasury received the required USDC amount
                    const treasuryPost = tx.meta?.postTokenBalances?.find(b =>
                        b.owner === TREASURY_WALLET && b.mint === USDC_MINT_MAINNET
                    );
                    const treasuryPre = tx.meta?.preTokenBalances?.find(b =>
                        b.owner === TREASURY_WALLET && b.mint === USDC_MINT_MAINNET
                    );

                    const postAmt = parseInt(treasuryPost?.uiTokenAmount.amount ?? "0");
                    const preAmt = parseInt(treasuryPre?.uiTokenAmount.amount ?? "0");
                    const received = postAmt - preAmt;
                    const required = parseInt(RETAIL_JOB_POST_USDC);

                    console.log(`[hiring-api][payment] txsig=${xPaymentTxSig} received=${received} required=${required}`);

                    if (received < required) {
                        return errorResponse(
                            "ERR_PAYMENT_INSUFFICIENT",
                            `Insufficient payment: received ${received} base units, required ${required}.`,
                            402
                        );
                    }

                    isPaidJobPost = true;
                } catch (verifyErr: any) {
                    console.error("[hiring-api][payment] verification error:", verifyErr);
                    return errorResponse("ERR_PAYMENT_VERIFY_ERROR", "Unable to verify payment. Please try again.", 402);
                }
            }
        }

        // Normalize + validate URL fields in metadata.
        // Client already normalizes, but we re-normalize server-side as a safety net.
        const urlFieldNames: { key: string; isTwitter?: boolean }[] = [
            { key: "websiteUrl" },
            { key: "twitterUrl", isTwitter: true },
            { key: "linkedinUrl" },
            { key: "discordUrl" },
            { key: "telegramUrl" },
        ];
        for (const { key, isTwitter } of urlFieldNames) {
            const raw: string = (metadata[key] ?? "").trim();
            if (!raw) continue;

            let normalized = raw;
            if (isTwitter) {
                const handle = raw.replace(/^@/, "").replace(/^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\//, "").split("?")[0].split("/")[0].trim();
                normalized = handle ? `https://x.com/${handle}` : raw;
            } else if (!/^https?:\/\//i.test(raw)) {
                normalized = `https://${raw}`;
            }

            try {
                const parsed = new URL(normalized);
                if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                    return errorResponse("ERR_INVALID_REQUEST", `${key} must use http or https.`, 400);
                }
            } catch {
                return errorResponse("ERR_INVALID_REQUEST", `${key} is not a valid URL.`, 400);
            }

            metadata[key] = normalized; // store the normalized version
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
            updatedMetadata.verificationTier = "google_paid";
        } else if (!isGoogleAuthUser && isRecruiterTier(verificationTier)) {
            updatedMetadata.isTrusted = true;
            updatedMetadata.verificationTier = verificationTier;
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
                eligibility_filters: filters || {},
                is_paid_job_post: isPaidJobPost,
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
