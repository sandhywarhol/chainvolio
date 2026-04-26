import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { verifySignature } from "@/lib/crypto";
import { corsJson, handleOptions } from "@/lib/cors";
import crypto from "crypto";

export async function OPTIONS() {
    return handleOptions();
}

export async function POST(request: Request) {
    try {
        if (!supabaseServer) {
            return corsJson({ error: "Database connection error" }, { status: 500 });
        }

        const body = await request.json();
        const { wallet, signature, nonce, timestamp, name } = body;

        if (!wallet || !signature || !nonce || !timestamp) {
            return corsJson(
                { error: "wallet, signature, nonce, and timestamp are required. Connect your wallet to generate a key." },
                { status: 401 }
            );
        }

        // Verify wallet ownership via Solana signature
        const { isValid, error: sigError } = await verifySignature(
            wallet,
            "generate_api_key",
            nonce,
            timestamp,
            signature
        );

        if (!isValid) {
            return corsJson({ error: sigError || "Signature verification failed." }, { status: 401 });
        }

        // Return existing key for this wallet (idempotent)
        const { data: existing } = await supabaseServer
            .from("api_keys")
            .select("key, name, usage_count, usage_limit, created_at")
            .eq("wallet_address", wallet)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existing) {
            return corsJson({
                success: true,
                key: existing.key,
                api_key: existing.key,
                name: existing.name,
                usage_count: existing.usage_count || 0,
                usage_limit: existing.usage_limit || 1000,
                existing: true,
            });
        }

        // Generate new key
        const generated_key = `cv_${crypto.randomBytes(24).toString("hex")}`;
        const keyName = (name && typeof name === "string" && name.trim()) ? name.trim() : "Developer Key";

        const { error: insertError } = await supabaseServer
            .from("api_keys")
            .insert({
                key: generated_key,
                name: keyName,
                wallet_address: wallet,
                usage_count: 0,
                usage_limit: 1000,
                created_at: new Date().toISOString(),
            });

        if (insertError) {
            console.error("API key insert error:", insertError);
            return corsJson({ error: "Failed to save API key." }, { status: 500 });
        }

        return corsJson({
            success: true,
            key: generated_key,
            api_key: generated_key,
            name: keyName,
            usage_count: 0,
            usage_limit: 1000,
            existing: false,
        });

    } catch (err: any) {
        console.error("API key generation error:", err);
        return corsJson({ error: "Failed to generate API key." }, { status: 500 });
    }
}
