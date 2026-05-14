import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    try {
    // 1. Fetch Receipts with UUID-linked relations (Updates & Attestations)
    // These work because they share formal UUID foreign keys
    const { data: receiptsData, error: fetchError } = await supabase
      .from("receipts")
      .select(`
        *,
        receipt_updates (*),
        attestations (*)
      `)
      .eq("wallet_address", wallet)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Receipts fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!receiptsData || receiptsData.length === 0) {
      return NextResponse.json({ receipts: [], updates: [], attestations: [] });
    }

    // 2. Batch Fetch Attester Identities (Manual Join for non-FK relations)
    const attesterWallets = Array.from(new Set(
        receiptsData.flatMap(r => (r.attestations || []).map((a: any) => a.attester_wallet))
    )).filter(Boolean);

    let profileMap: Record<string, any> = {};
    let verificationMap: Record<string, any> = {};

    if (attesterWallets.length > 0) {
        const [profilesRes, verificationsRes] = await Promise.all([
            supabase.from("profiles").select("wallet_address, display_name, bio, avatar_url, headline, professional_role, organization").in("wallet_address", attesterWallets),
            supabase.from("organization_verifications").select("wallet_address, status, verifier_tier, type, expires_at").in("wallet_address", attesterWallets)
        ]);

        profilesRes.data?.forEach(p => { profileMap[p.wallet_address] = p; });
        verificationsRes.data?.forEach(v => { verificationMap[v.wallet_address] = v; });
    }

    // 3. Aggregate & Assemble Response Structure
    const allUpdates: any[] = [];
    const allAttestations: any[] = [];
    const now = new Date();

    const receipts = receiptsData.map((r: any) => {
      // Enrich attestations with profiles and verifications
      const enrichedAttestations = (r.attestations || []).map((a: any) => {
        const enriched = {
          ...a,
          attester_profile: profileMap[a.attester_wallet] || null,
          attester_verification: verificationMap[a.attester_wallet] || null
        };
        allAttestations.push(enriched);
        return enriched;
      });

      if (r.receipt_updates) {
        allUpdates.push(...r.receipt_updates);
      }

      // Maintain legacy flattening for the response items
      const attestation = enrichedAttestations?.[0];
      const profile = attestation?.attester_profile;
      const orgData = attestation?.attester_verification;
      const isHiring = attestation?.attestation_type === "Hiring Proof" || r.description?.includes("Official Verified Hiring Proof");

      // Verification Logic
      const isExpired = orgData?.expires_at ? new Date(orgData.expires_at) < now : false;
      const isAttesterVerified = orgData?.status === 'verified' && !isExpired;

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
        attesterAvatar: profile?.avatar_url || null,
        attesterName: attesterName,
        attesterRole: profile?.professional_role || profile?.headline || attestation?.attester_role || (isHiring ? "Hiring Lead" : null),
        attesterOrg: profile?.organization || attestation?.attester_org || null,
        attestationType: attestation?.attestation_type || (isHiring ? "Hiring Proof" : "Direct Verification"),
        isOfficial: isAttesterVerified,
        isAttesterVerified: isAttesterVerified,
        verificationTier: isAttesterVerified ? orgData?.type : null,
        attesterVerificationType: isAttesterVerified ? orgData?.type : null,
        attestationId: attestation?.id || null,
        txSignature: attestation?.tx_signature || null,
        attesterAt: attestation?.memo_issued_at || attestation?.created_at || null,
        confidence: attestation?.confidence_level || "Confirmed",
        attesterComment: attestation?.comment || null,
        updates: r.receipt_updates || [],
        attestations: enrichedAttestations
      };
    });

    return NextResponse.json({
      receipts,
      updates: allUpdates,
      attestations: allAttestations
    });
    } catch (err: any) {
        console.error("Receipts API Error:", err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

function isValidHttpUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function validateReceiptBody(body: any): string | null {
    const { role, org, description, startDate, endDate, evidenceLinks, impact } = body;
    if (role && role.trim().length > 100) return "Role must be 100 characters or fewer.";
    if (org && org.trim().length > 100) return "Organization name must be 100 characters or fewer.";
    if (description && description.trim().length > 1000) return "Description must be 1000 characters or fewer.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) return "End date cannot be before start date.";
    if (Array.isArray(evidenceLinks)) {
        for (const link of evidenceLinks) {
            if (link?.url && !isValidHttpUrl(link.url)) {
                return `Invalid URL: "${link.url}". Only http and https links are allowed.`;
            }
        }
    }
    return null;
}

function sanitizeReceiptBody(body: any) {
    return {
        role: body.role?.trim() || null,
        org: body.org?.trim() || null,
        description: body.description?.trim() || null,
        evidenceLinks: (body.evidenceLinks || []).filter((l: any) => l?.url?.trim()),
        impact: (body.impact || []).map((i: string) => i?.trim()).filter(Boolean),
    };
}

export async function POST(request: Request) {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    try {
        const body = await request.json();
        const { walletAddress, startDate, endDate, workType, compensationType, portfolioImages, isExternal, signature, nonce, timestamp } = body;

        if (!walletAddress) {
            return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
        }

        const validationError = validateReceiptBody(body);
        if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

        const { role, org, description, evidenceLinks, impact } = sanitizeReceiptBody(body);

        // --- Signature Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify && (!signature || !nonce || !timestamp)) {
            return NextResponse.json({ error: "Signature required to save progress." }, { status: 401 });
        }

        const { verifySignature } = await import("@/lib/crypto");
        const { isValid, error: sigError } = await verifySignature(
            walletAddress,
            "submit_work",
            nonce || "",
            timestamp || 0,
            signature || ""
        );

        if (!isValid) return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
        // ----------------------------

        // Set trans context for RLS
        await supabase.rpc('set_app_wallet', { wallet_addr: walletAddress });

        const { data, error } = await supabase.from("receipts").insert({
            wallet_address: walletAddress,
            role,
            org,
            description,
            start_date: startDate,
            end_date: endDate,
            work_type: workType,
            compensation_type: compensationType || null,
            evidence_links: evidenceLinks,
            impact,
            portfolio_images: portfolioImages || [],
            status: 'Submitted'
        }).select().single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const { calculateScore } = await import("@/lib/score");
        const { syncUserStatus } = await import("@/lib/sync");
        calculateScore(walletAddress).catch(console.error);
        syncUserStatus(walletAddress).catch(console.error);

        return NextResponse.json({ ok: true, receipt: data });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    try {
        const body = await request.json();
        const { id, walletAddress, startDate, endDate, workType, compensationType, portfolioImages, signature, nonce, timestamp } = body;

        if (!id || !walletAddress) return NextResponse.json({ error: "id and walletAddress are required" }, { status: 400 });

        const validationError = validateReceiptBody(body);
        if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

        const { role, org, description, evidenceLinks, impact } = sanitizeReceiptBody(body);

        // --- Signature Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify && (!signature || !nonce || !timestamp)) {
            return NextResponse.json({ error: "Signature required to update progress." }, { status: 401 });
        }

        const { verifySignature } = await import("@/lib/crypto");
        const { isValid, error: sigError } = await verifySignature(
            walletAddress,
            "update_work",
            nonce || "",
            timestamp || 0,
            signature || ""
        );

        if (!isValid) return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
        // ----------------------------

        // Set trans context for RLS
        await supabase.rpc('set_app_wallet', { wallet_addr: walletAddress });

        const { data, error } = await supabase.from("receipts").update({
            role,
            org,
            description,
            start_date: startDate,
            end_date: endDate,
            work_type: workType,
            compensation_type: compensationType || null,
            evidence_links: evidenceLinks,
            impact,
            portfolio_images: portfolioImages || [],
            updated_at: new Date().toISOString()
        }).eq("id", id).eq("wallet_address", walletAddress).select().single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const { calculateScore } = await import("@/lib/score");
        const { syncUserStatus } = await import("@/lib/sync");
        calculateScore(walletAddress).catch(console.error);
        syncUserStatus(walletAddress).catch(console.error);

        return NextResponse.json({ ok: true, receipt: data });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
