import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { id } = params;

    // Fetch attestation with receipt details joined
    const { data: attestation, error } = await supabase
        .from("attestations")
        .select(`
            id,
            receipt_id,
            attester_wallet,
            attester_name,
            attester_role,
            attester_org,
            attester_email,
            attestation_type,
            confidence_level,
            comment,
            tx_signature,
            memo_issued_at,
            content_hash,
            classification,
            memo_v2,
            is_external,
            created_at
        `)
        .eq("id", id)
        .single();

    if (error || !attestation) {
        return NextResponse.json({ error: "Memo not found" }, { status: 404 });
    }

    // Fetch linked receipt
    const { data: receipt } = await supabase
        .from("receipts")
        .select("id, role, org, description, start_date, end_date, wallet_address")
        .eq("id", attestation.receipt_id)
        .single();

    // Fetch attester verification status
    const { data: verification } = await supabase
        .from("organization_verifications")
        .select("status, verifier_tier")
        .eq("wallet_address", attestation.attester_wallet)
        .eq("status", "verified")
        .single();

    // Fetch attester profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("wallet_address", attestation.attester_wallet)
        .single();

    return NextResponse.json({
        attestation,
        receipt: receipt || null,
        attester_verification: verification || null,
        attester_profile: profile || null,
    });
}
