import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
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
      signature,
      nonce,
      timestamp
    } = body;

    // --- Signature Verification ---
    const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
    if (!skipVerify && (!signature || !nonce || !timestamp)) {
      return NextResponse.json({ error: "Signature required for this action." }, { status: 401 });
    }

    const { verifySignature } = await import("@/lib/crypto");
    const { isValid, error: sigError } = await verifySignature(
      walletAddress,
      "submit_work",
      nonce || "",
      timestamp || 0,
      signature || ""
    );

    if (!isValid) {
      return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
    }

    // Set transaction context for RLS
    await supabase.rpc('set_app_wallet', { wallet_addr: walletAddress });

    // 1. Ensure wallet exists
    await supabase.from("wallets").upsert(
      { wallet_address: walletAddress, last_connected_at: new Date().toISOString() },
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
      status: "Submitted",
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

const errorResponse = (code: string, message: string, status: number = 400) => {
  return NextResponse.json({
    ok: false,
    error: { code, message }
  }, { status });
};

export async function PATCH(request: Request) {
  if (!supabase) {
    return errorResponse("ERR_CONFIG_ERROR", "Supabase not configured", 503);
  }

  try {
    const body = await request.json();
    const { id, walletAddress, signature, nonce, timestamp } = body;

    if (!id) {
      return errorResponse("ERR_INVALID_REQUEST", "Receipt ID is required", 400);
    }

    if (!walletAddress) {
      return errorResponse("ERR_INVALID_REQUEST", "Wallet address is required", 400);
    }

    // --- Signature Verification ---
    const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
    if (!skipVerify && (!signature || !nonce || !timestamp)) {
      return errorResponse("ERR_SIGNATURE_REQUIRED", "Cryptographic signature is required for updates", 401);
    }

    const { verifySignature } = await import("@/lib/crypto");
    const { isValid, error: sigError } = await verifySignature(
      walletAddress,
      "update_work",
      nonce || "",
      timestamp || 0,
      signature || ""
    );

    if (!isValid) {
      return errorResponse("ERR_SIGNATURE_CONTEXT", sigError || "Signature verification failed", 401);
    }

    // 1. Ownership & State Check
    const { data: existing, error: fetchError } = await supabase
      .from("receipts")
      .select("wallet_address, status")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return errorResponse("ERR_RECORD_NOT_FOUND", "The specified work record could not be found", 404);
    }

    // Authorization: Must be the owner
    if (existing.wallet_address !== walletAddress) {
      return errorResponse("ERR_UNAUTHORIZED_OWNER", "Unauthorized: You do not own this record", 403);
    }

    // Semantic Check: Block if already Attested/Locked/Submitted (Frontend UX optimization)
    if (["Attested", "Locked", "Submitted"].includes(existing.status)) {
      return errorResponse("ERR_IMMUTABLE_RECORD", `Cannot edit a record that is already ${existing.status.toLowerCase()}`, 403);
    }

    // 2. Prepare Partial Update
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    const allowedFields: Record<string, string> = {
      role: 'role',
      org: 'org',
      description: 'description',
      startDate: 'start_date',
      endDate: 'end_date',
      workType: 'work_type',
      compensationType: 'compensation_type',
      evidenceLinks: 'evidence_links',
      impact: 'impact',
      portfolioImages: 'portfolio_images',
      status: 'status'
    };

    Object.entries(allowedFields).forEach(([bodyKey, dbKey]) => {
      if (body[bodyKey] !== undefined) {
        updateData[dbKey] = body[bodyKey];
      }
    });

    // 3. Execute Update
    await supabase.rpc('set_app_wallet', { wallet_addr: walletAddress });

    const { error: updateError } = await supabase
      .from("receipts")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      // Map Postgres trigger violations (P0001) to semantic codes
      if (updateError.code === 'P0001') {
        const msg = updateError.message.toLowerCase();
        if (msg.includes("attested") || msg.includes("locked")) {
          return errorResponse("ERR_IMMUTABLE_RECORD", updateError.message, 403);
        }
        if (msg.includes("revert") || msg.includes("state")) {
          return errorResponse("ERR_INVALID_STATE_TRANSITION", updateError.message, 403);
        }
        return errorResponse("ERR_DATABASE_RULE_VIOLATION", updateError.message, 403);
      }
      return errorResponse("ERR_DATABASE_ERROR", updateError.message, 500);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PATCH Receipts Error:", err);
    return errorResponse("ERR_SERVER_ERROR", err.message || "An unexpected error occurred", 500);
  }
}

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    // 1. Fetch Receipts (Historical data is preserved as we use SELECT *)
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

    // Fetch Updates
    let updatesMap: Record<string, any[]> = {};
    try {
      const { data: updatesData, error: updatesError } = await supabase
        .from("receipt_updates")
        .select("*")
        .in("receipt_id", receiptIds)
        .order("created_at", { ascending: false });

      if (!updatesError && updatesData) {
        updatesData.forEach((u: any) => {
          if (!updatesMap[u.receipt_id]) updatesMap[u.receipt_id] = [];
          updatesMap[u.receipt_id].push(u);
        });
      }
    } catch (e) {
      console.warn("Updates fetch failed:", e);
    }

    // 2. Fetch Attestations
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
          confidence_level,
          tx_signature,
          id,
          is_external
        `)
        .in("receipt_id", receiptIds);

      if (attestationsError) {
        const { data: basicAttestations } = await supabase
          .from("attestations")
          .select("receipt_id, attester_wallet, created_at, signature, comment, is_external")
          .in("receipt_id", receiptIds);

        if (basicAttestations) finalAttestations = basicAttestations;
      } else {
        finalAttestations = attestationsData || [];
      }
    } catch (e) {
      console.warn("Attestations fetch failed:", e);
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
        .select("wallet_address, display_name, bio, avatar_url, headline, role, organization")
        .in("wallet_address", attesterWallets);

      if (profileData) {
        profileMap = profileData.reduce((acc: any, p: any) => {
          acc[p.wallet_address] = p;
          return acc;
        }, {});
      }
    }

    // 4. Fetch Organization Verification Status & Tiers
    let verifiedOrgWallets = new Set<string>();
    let verifierTiers: Record<string, number> = {};
    if (attesterWallets.length > 0) {
      const { data: orgData } = await supabase
        .from("organization_verifications")
        .select("wallet_address, verifier_tier")
        .in("wallet_address", attesterWallets)
        .eq("status", "verified");

      if (orgData) {
        orgData.forEach(o => {
          verifiedOrgWallets.add(o.wallet_address);
          verifierTiers[o.wallet_address] = o.verifier_tier || 1;
        });
      }
    }

    const result = receiptsList.map((r: any) => {
      const attestation = attestationsMap[r.id]?.[0];
      const profile = attestation ? profileMap[attestation.attester_wallet] : null;
      const updates = updatesMap[r.id] || [];
      const isHiring = attestation?.attestation_type === "Hiring Proof" || r.description?.includes("Official Verified Hiring Proof");
      
      // Identity Resolution Priority
      let attesterName = profile?.display_name;
      if (!attesterName && attestation?.attester_name && !["Anonymous", "Verified Recruiter"].includes(attestation.attester_name)) {
        attesterName = attestation.attester_name;
      }
      if (!attesterName) {
        attesterName = profile?.organization || attestation?.attester_org;
      }
      if (!attesterName) {
        attesterName = isHiring ? "Verified Recruiter" : "Anonymous";
      }

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
        attesterName: attesterName,
        attesterRole: profile?.headline || attestation?.attester_role || (isHiring ? "Hiring Lead" : null),
        attesterOrg: profile?.organization || attestation?.attester_org || null,
        isExternal: r.is_external,
        attestationType: attestation?.attestation_type || 
          (isHiring ? "Hiring Proof" : "Direct Verification"),
        confidence: attestation?.confidence_level || (isHiring ? "Confirmed" : null),
        attesterAvatar: profile?.avatar_url || null,
        attesterAt: attestation?.created_at || null,
        isAttesterVerified: attestation ? verifiedOrgWallets.has(attestation.attester_wallet) : false,
        attesterTier: attestation ? (verifierTiers[attestation.attester_wallet] || 1) : 1,
        attesterSignature: attestation?.signature || null,
        txSignature: attestation?.tx_signature || r.tx_signature || null,
        attestationId: attestation?.id || null,
        attesterComment: attestation?.comment || null,
        createdAt: r.created_at,
        updates: updates.map((u: any) => ({
          id: u.id,
          message: u.message,
          evidence_link: u.evidence_link,
          evidence_picture: u.evidence_picture,
          createdAt: u.created_at
        })),
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Critical API Error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
