import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const { collectionSlug, walletAddress, primarySignal, roleStrength } = await request.json();

        if (!collectionSlug || !walletAddress) {
            return NextResponse.json({ error: "slug and wallet required" }, { status: 400 });
        }

        // 1. Find collection ID & Filters
        const { data: collection, error: colError } = await supabase
            .from("hiring_collections")
            .select("id, eligibility_filters")
            .eq("slug", collectionSlug)
            .single();

        if (colError || !collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        // 2. Fetch receipts for auto-tagging
        const { data: receipts } = await supabase
            .from("receipts")
            .select("role, evidence_links, status")
            .eq("wallet_address", walletAddress);

        const receiptList = receipts || [];
        const attestedCount = receiptList.filter((r: any) => r.status === "Attested").length;

        // Feature 4: Enforce Eligibility Filters
        const filters = collection.eligibility_filters || {};

        if (filters.minTransactions && receiptList.length < 5) {
            return NextResponse.json({ error: "Eligibility: Active wallet history required (5+ receipts)" }, { status: 403 });
        }

        if (filters.verifiedOnly && attestedCount < 1) {
            return NextResponse.json({ error: "Eligibility: Verified proof of work required" }, { status: 403 });
        }

        // 3. Compute Auto-Tags & Snapshot
        const tags: string[] = [];

        if (receiptList.length >= 5) tags.push("Strong On-chain History");
        if (attestedCount >= 1) tags.push("Verified Contributor");

        const hasCode = receiptList.some((r: any) =>
            JSON.stringify(r.evidence_links).toLowerCase().includes("github") ||
            r.role.toLowerCase().includes("engineer") ||
            r.role.toLowerCase().includes("developer")
        );
        if (hasCode) tags.push("Code-heavy");

        const hasGovernance = receiptList.some((r: any) =>
            r.role.toLowerCase().includes("dao") ||
            r.role.toLowerCase().includes("governance") ||
            (r.org && r.org.toLowerCase().includes("dao"))
        );
        if (hasGovernance) tags.push("Governance-focused");

        const hasCreative = receiptList.some((r: any) =>
            r.role.toLowerCase().includes("design") ||
            r.role.toLowerCase().includes("artist") ||
            JSON.stringify(r.evidence_links).toLowerCase().includes("figma")
        );
        if (hasCreative) tags.push("Creative-native");

        if (receiptList.length < 2 && tags.length === 0) tags.push("Low activity / New");

        // 4. Insert submission
        const { error: subError } = await supabase
            .from("collection_submissions")
            .insert({
                collection_id: collection.id,
                candidate_wallet: walletAddress,
                primary_signal: primarySignal || "Not specified",
                role_strength: roleStrength || "Not specified",
                snapshot_data: {
                    tags: tags,
                    stats: {
                        receipts: receiptList.length,
                        attested: attestedCount
                    }
                }
            });

        if (subError && subError.code !== "23505") { // Ignore unique constraint error (duplicate submission)
            console.error("Supabase error:", subError);
            return NextResponse.json({ error: subError.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, message: "CV submitted successfully" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}
