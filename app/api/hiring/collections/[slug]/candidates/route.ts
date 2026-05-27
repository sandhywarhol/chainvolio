import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const signature = searchParams.get("signature");
    const nonce = searchParams.get("nonce");
    const timestamp = searchParams.get("timestamp");

    // Explicit headers to prevent caching
    const headers = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    };

    try {
        const { slug } = params;

        // 1. Get collection details
        const { data: collection, error: colError } = await supabase
            .from("hiring_collections")
            .select("id, slug, owner_wallet, title, metadata, eligibility_filters, created_at")
            .eq("slug", slug)
            .single();

        if (colError || !collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        // --- Auth Verification: Google session OR wallet signature ---
        const authHeader = request.headers.get("Authorization");
        const isGoogleAuth = authHeader?.startsWith("Bearer ");

        if (isGoogleAuth) {
            const token = authHeader!.replace("Bearer ", "");
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            if (authError || !user) {
                return NextResponse.json({ error: "Invalid session." }, { status: 401, headers });
            }
            const expectedOwner = `gauth:${user.id}`;
            if (collection.owner_wallet !== expectedOwner) {
                return NextResponse.json({ error: "Unauthorized. You are not the owner of this collection." }, { status: 403, headers });
            }
        } else {
            if (!wallet || !signature || !nonce || !timestamp) {
                return NextResponse.json({ error: "Signature required to view dashboard." }, { status: 401, headers });
            }

            const { verifySignature } = await import("@/lib/crypto");
            const { isValid, error: sigError } = await verifySignature(
                wallet,
                "view_dashboard",
                nonce,
                parseInt(timestamp),
                signature,
                slug
            );

            if (!isValid) {
                console.error(`[Dashboard API] Signature verification failed for wallet ${wallet}. Error: ${sigError}`);
                return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401, headers });
            }

            if (collection.owner_wallet !== wallet) {
                console.error(`[Dashboard API] Unauthorized: Wallet ${wallet} is not owner ${collection.owner_wallet} for slug ${slug}`);
                return NextResponse.json({ error: "Unauthorized. You are not the owner of this collection." }, { status: 403, headers });
            }
        }
        // Get owner profile
        const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("wallet_address, display_name, avatar_url, bio, card_number")
            .eq("wallet_address", collection.owner_wallet)
            .maybeSingle();

        // ----------------------------

        // 2. Get submissions (Ordered in code to avoid RLS/Index issues)
        const { data: submissions, error: subError } = await supabase
            .from("collection_submissions")
            .select("id, collection_id, candidate_wallet, submitted_at, snapshot_data, role_strength, primary_signal, recruiter_status, recruiter_notes, tx_signature")
            .eq("collection_id", collection.id);

        if (subError) {
            console.error("[Dashboard API] Error fetching submissions:", subError);
            return NextResponse.json({ error: subError.message }, { status: 500 });
        }

        // Sort by submitted_at DESC
        submissions?.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

        if (!submissions || submissions.length === 0) {
            return NextResponse.json({ collection, candidates: [] });
        }

        const wallets = submissions.map(s => s.candidate_wallet).filter(Boolean);

        // 3. Batch fetch profiles
        const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("wallet_address, display_name, avatar_url, bio, card_number")
            .in("wallet_address", wallets);

        if (profileError) console.error("[Dashboard API] Profile fetch error:", profileError);

        // 4. Batch fetch receipts (to calculate metrics)
        const { data: receipts, error: receiptsError } = await supabase
            .from("receipts")
            .select("id, wallet_address, org, created_at, status")
            .in("wallet_address", wallets);

        if (receiptsError) console.error("[Dashboard API] Receipts fetch error:", receiptsError);

        // 5. Batch fetch attestations (to verify "Attested" status + attester wallet for tier weighting)
        const receiptIds = receipts?.map(r => r.id) || [];
        const { data: attestations } = await supabase
            .from("attestations")
            .select("receipt_id, attester_wallet")
            .in("receipt_id", receiptIds);

        const attestationMap = new Set(attestations?.map(a => a.receipt_id));

        // 5.5 Batch fetch verification status (candidates)
        const { data: verifications } = await supabase
            .from("organization_verifications")
            .select("wallet_address, status, type, expires_at")
            .in("wallet_address", wallets);

        // 5.6 Batch fetch attester tiers for weighted attestation scoring
        const attesterWallets = [...new Set(
            (attestations ?? []).map((a: any) => a.attester_wallet).filter(Boolean)
        )] as string[];

        let attesterTierMap = new Map<string, string>();
        if (attesterWallets.length > 0) {
            const { data: attesterVerifs } = await supabase
                .from("organization_verifications")
                .select("wallet_address, type, status, expires_at")
                .in("wallet_address", attesterWallets);

            const nowMs = Date.now();
            attesterVerifs?.forEach((v: any) => {
                const active = v.status === 'verified' && (!v.expires_at || new Date(v.expires_at).getTime() > nowMs);
                attesterTierMap.set(v.wallet_address, active ? v.type : 'unverified');
            });
        }

        // receipt_id → attester tier string
        const receiptTierMap = new Map<string, string>();
        (attestations ?? []).forEach((a: any) => {
            receiptTierMap.set(a.receipt_id, attesterTierMap.get(a.attester_wallet) ?? 'unverified');
        });

        // Attestation weight by attester tier (Company > Community > Public Figure > Builder > Unverified)
        function attestationWeight(tier: string | undefined): number {
            const t = (tier || '').toLowerCase();
            if (t.includes('company') || t.includes('org')) return 30;
            if (t.includes('community') || t.includes('dao')) return 25;
            if (t.includes('figure') || t.includes('public')) return 22;
            if (t.includes('builder')) return 20;
            return 12; // unverified
        }

        // Focus matching setup (computed once, used per candidate)
        const focusAreas: string[] = collection.metadata?.focusAreas || [];
        const focusToSignal: Record<string, string> = {
            on_chain: "on-chain activity",
            github: "github / code",
            dao: "dao governance",
            hackathon: "hackathon wins",
            nft: "nft / creative",
        };
        const matchedSignals = focusAreas.map(f => focusToSignal[f]).filter(Boolean);

        // 6. Aggregate data per candidate
        const candidates = submissions.map(sub => {
            const profile = profiles?.find(p => p.wallet_address === sub.candidate_wallet);
            const userReceipts = receipts?.filter(r => r.wallet_address === sub.candidate_wallet) || [];
            const userVerifications = verifications?.filter(v => v.wallet_address === sub.candidate_wallet) || [];

            const attestedReceipts = userReceipts.filter(r => attestationMap.has(r.id));
            const orgs = Array.from(new Set(attestedReceipts.map(r => r.org))).filter(Boolean);

            const latestActivity = userReceipts.length > 0
                ? new Date(Math.max(...userReceipts.map(r => new Date(r.created_at).getTime()))).toISOString()
                : sub.submitted_at;

            const snapshot = sub.snapshot_data || {};

            // Calculate Signal Score
            let score = 0;
            score += Math.min(userReceipts.length * 10, 50); // Up to 50 pts for proof volume
            const weightedAttestation = attestedReceipts.reduce((sum, r) => sum + attestationWeight(receiptTierMap.get(r.id)), 0);
            score += Math.min(weightedAttestation, 40); // Weighted: Company=30, Community=25, Figure=22, Builder=20, Unverified=12

            const daysSinceActive = (new Date().getTime() - new Date(latestActivity).getTime()) / (1000 * 3600 * 24);
            if (daysSinceActive < 30) score += 10; // 10 pts for recent activity

            let signalStrength = 'Low';
            if (score >= 70) signalStrength = 'Strong';
            else if (score >= 30) signalStrength = 'Medium';

            // Calculate Fit Score (focusAreas match + attestations + verification)
            const primaryNorm = (sub.primary_signal || "").toLowerCase();
            const signalMatch = matchedSignals.length > 0 &&
                matchedSignals.some(m => primaryNorm.includes(m) || m.includes(primaryNorm));
            let fitScore = 0;
            if (signalMatch) fitScore += 60;
            fitScore += Math.min(Math.round(attestedReceipts.reduce((s, r) => s + attestationWeight(receiptTierMap.get(r.id)) / 4, 0)), 25);
            if (userVerifications.some(v => v.status === 'verified')) fitScore += 15;

            // Build work history from snapshot captured at submission time,
            // augmented with current attestation status from live attestationMap.
            const rawExperience: any[] = snapshot.experience || [];
            const workHistory = rawExperience.map((e: any) => ({
                role: e.role || "Unknown Role",
                org: e.org || "Unknown Org",
                start_date: e.start_date || null,
                end_date: e.end_date || null,
                description: e.description || null,
                work_type: e.work_type || null,
                isAttested: e.status === "Attested",
            }));

            // Years of experience: span from earliest role start to today
            let yearsOfExperience = 0;
            const startTimes = workHistory
                .map((w) => w.start_date ? new Date(w.start_date).getTime() : null)
                .filter((t): t is number => t !== null && !isNaN(t));
            if (startTimes.length > 0) {
                const earliest = Math.min(...startTimes);
                yearsOfExperience = parseFloat(((Date.now() - earliest) / (1000 * 60 * 60 * 24 * 365)).toFixed(1));
            }

            return {
                id: sub.id,
                wallet: sub.candidate_wallet,
                displayName: profile?.display_name || snapshot.profile?.name || null,
                avatarUrl: profile?.avatar_url || null,
                role: sub.role_strength || profile?.bio || "Web3 Professional",
                primarySignal: sub.primary_signal,
                snapshotTags: snapshot.tags || [],
                powCount: userReceipts.length,
                attestedCount: attestedReceipts.length,
                attestedOrgs: orgs,
                lastActive: latestActivity,
                status: attestedReceipts.length > 0 ? "Attested" : "Self-Declared",
                isVerified: userVerifications.some(v => v.status === 'verified'),
                verificationTier: userVerifications.find(v => v.status === 'verified')?.type || "unverified",
                recruiterStatus: sub.recruiter_status,
                recruiterNotes: sub.recruiter_notes,
                recruiterTxSignature: sub.tx_signature,
                submittedAt: sub.submitted_at,
                signalScore: score,
                signalStrength: signalStrength,
                fitScore,
                signalMatch,
                cardNumber: profile?.card_number || null,
                snapshotBio: snapshot.profile?.bio || profile?.bio || null,
                snapshotSkills: snapshot.profile?.skills || null,
                workHistory,
                yearsOfExperience,
            };
        });

        return NextResponse.json({ collection, candidates, profile: ownerProfile }, { headers });
    } catch (err: any) {
        console.error("Dashboard API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500, headers });
    }
}
