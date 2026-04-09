import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    try {
        const { targetWallet, viewerWallet, isRecruiter } = await request.json();

        if (!targetWallet || !viewerWallet || targetWallet === viewerWallet) {
            return NextResponse.json({ ok: true });
        }

        // 2. Fetch Viewer Profile and Verification Status in One Hit
        const { data: viewerData } = await supabase
            .from("profiles")
            .select(`
                wallet_address,
                verification:organization_verifications (
                    status, type, expires_at
                )
            `)
            .eq("wallet_address", viewerWallet)
            .maybeSingle();

        const viewerOrg = (viewerData as any)?.verification?.[0] || (viewerData as any)?.verification;
        
        const now = new Date();
        const expiresAtDate = viewerOrg?.expires_at ? new Date(viewerOrg.expires_at) : null;
        const isExpired = expiresAtDate ? now > expiresAtDate : false;
        const isVerified = viewerOrg?.status === 'verified' && !isExpired;

        const isRecruiterTier = viewerOrg?.type?.toLowerCase().includes("company") || 
                               viewerOrg?.type?.toLowerCase().includes("organization") || 
                               viewerOrg?.type?.toLowerCase().includes("community") || 
                               viewerOrg?.type?.toLowerCase().includes("dao");

        const isVerifiedRecruiter = isVerified && isRecruiterTier;
        const hasProfile = !!viewerData;

        // --- Avoid Spam ---
        // Check if a notification for THIS viewer → THIS target exists in the last 24h
        const { data: recentNotif } = await supabase
            .from("notifications")
            .select("id")
            .eq("wallet_address", targetWallet)
            .eq("type", "profile_view")
            .eq("related_id", viewerWallet)
            .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

        if (recentNotif && recentNotif.length > 0) {
            return NextResponse.json({ ok: true });
        }

        // --- Determine Notification Message ---
        let notificationTitle = "";
        let notificationMessage = "";

        if (isVerifiedRecruiter) {
            notificationTitle = "Recruiter View";
            notificationMessage = "Your profile was viewed by a verified recruiter";
        } else if (hasProfile) {
            // High-signal interaction: someone with a professional profile viewed you
            notificationTitle = "New Profile View";
            notificationMessage = "Your profile was viewed by someone in the web3 community";
        } else {
            // Anonymous / Unverified views: No notification to maintain high-signal
            return NextResponse.json({ ok: true });
        }

        await supabase.from("notifications").insert({
            wallet_address: targetWallet,
            title: notificationTitle,
            message: notificationMessage,
            type: 'profile_view',
            related_id: viewerWallet,
            link: `/dashboard`,
            is_read: false
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Profile view notification error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
