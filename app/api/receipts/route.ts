import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      walletAddress,
      role,
      org,
      description,
      startDate,
      endDate,
      workType,
      compensationType,
      evidenceHash,
      evidenceLinks,
      impact,
      portfolioImages,
    } = body;

    // 1. Ensure wallet exists
    await supabase.from("wallets").upsert(
      {
        wallet_address: walletAddress,
        last_connected_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    );

    // 2. Insert receipt
    const { error } = await supabase.from("receipts").insert({
      wallet_address: walletAddress,
      role,
      org,
      description,
      start_date: startDate,
      end_date: endDate,
      work_type: workType || "Full-time",
      compensation_type: compensationType || null,
      evidence_hash: evidenceHash || null,
      evidence_links: evidenceLinks || [],
      impact: impact || [],
      portfolio_images: portfolioImages || [],
      status: "Self-Declared",
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    // 1. Fetch Receipts
    const { data: receiptsData, error: receiptsError } = await supabase
      .from("receipts")
      .select("*")
      .eq("wallet_address", wallet)
      .order("created_at", { ascending: false });

    if (receiptsError) {
      console.error("Supabase error fetching receipts:", receiptsError);
      return NextResponse.json({ error: receiptsError.message }, { status: 500 });
    }

    const receiptsList = receiptsData || [];
    if (receiptsList.length === 0) return NextResponse.json([]);

    const receiptIds = receiptsList.map((r: any) => r.id);

    // 2. Fetch Attestations separately to be robust against schema differences
    let finalAttestations: any[] = [];
    try {
      const { data: attestationsData, error: attestationsError } = await supabase
        .from("attestations")
        .select(`
          receipt_id,
          attester_wallet,
          created_at,
          signature,
          comment,
          attester_name,
          attester_role,
          attester_org,
          attestation_type,
          confidence_level
        `)
        .in("receipt_id", receiptIds);

      if (attestationsError) {
        console.warn("Full attestation fetch failed, falling back to basic info:", attestationsError.message);
        const { data: basicAttestations } = await supabase
          .from("attestations")
          .select("receipt_id, attester_wallet, created_at, signature, comment")
          .in("receipt_id", receiptIds);

        if (basicAttestations) {
          finalAttestations = basicAttestations;
        }
      } else {
        finalAttestations = attestationsData || [];
      }
    } catch (e) {
      console.warn("Attestations table might be missing or broken:", e);
    }

    const attestationsMap = finalAttestations.reduce((acc: any, a: any) => {
      if (!acc[a.receipt_id]) acc[a.receipt_id] = [];
      acc[a.receipt_id].push(a);
      return acc;
    }, {});

    // 3. Fetch Attester Profiles
    const attesterWallets = Array.from(new Set(
      finalAttestations.map((a: any) => a.attester_wallet)
    )).filter(Boolean);

    let profileMap: Record<string, any> = {};
    if (attesterWallets.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("wallet_address, display_name, bio, avatar_url")
        .in("wallet_address", attesterWallets);

      if (profileData) {
        profileMap = profileData.reduce((acc: any, p: any) => {
          acc[p.wallet_address] = p;
          return acc;
        }, {});
      }
    }

    const result = receiptsList.map((r: any) => {
      const attestation = attestationsMap[r.id]?.[0];
      const profile = attestation ? profileMap[attestation.attester_wallet] : null;

      return {
        id: r.id,
        role: r.role,
        org: r.org,
        description: r.description,
        startDate: r.start_date,
        endDate: r.end_date,
        workType: r.work_type,
        compensationType: r.compensation_type,
        evidenceHash: r.evidence_hash,
        evidenceLinks: r.evidence_links || [],
        impact: r.impact || [],
        portfolioImages: r.portfolio_images || [],
        status: attestation ? "Attested" : r.status,
        attesterWallet: attestation?.attester_wallet || null,
        attesterName: attestation?.attester_name || profile?.display_name || "Anonymous Verifier",
        attesterRole: attestation?.attester_role || profile?.bio || "Community Member",
        attesterOrg: attestation?.attester_org || null,
        attestationType: attestation?.attestation_type || "Direct Verification",
        confidence: attestation?.confidence_level || null,
        attesterAvatar: profile?.avatar_url || null,
        attesterAt: attestation?.created_at || null,
        attesterSignature: attestation?.signature || null,
        createdAt: r.created_at,
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Critical API Error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
