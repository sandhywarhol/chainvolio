import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const ADMIN_WALLET_ADDRESS = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { adminWallet, signature, nonce, timestamp } = body;

        if (adminWallet !== ADMIN_WALLET_ADDRESS) {
            return NextResponse.json({ error: "Unauthorized access. This page is restricted." }, { status: 403 });
        }

        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify) {
            if (!signature || !nonce || !timestamp) {
                return NextResponse.json({ error: "Authentication required." }, { status: 401 });
            }

            const { verifySignature } = await import("@/lib/crypto");
            const { isValid, error: sigError } = await verifySignature(
                adminWallet,
                "admin_access",
                nonce || "",
                timestamp || 0,
                signature || ""
            );

            if (!isValid) {
                return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
            }
        }

        // Fetch all requests (admin needs to view pending AND reviewed)
        const { data, error } = await supabase
            .from("organization_verifications")
            .select("id, name, type, wallet_address, website, social_link, proof, status, rejection_reason, tx_signature, amount_paid, created_at, expires_at")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // --- Analytics Helper ---
        // 1. Total User Count
        const { count: totalUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        // 2. Geographic Distribution (Top 5)
        const { data: geoData } = await supabase
            .from("profiles")
            .select("country")
            .not("country", "is", null);
        
        const geoDistribution: Record<string, number> = {};
        geoData?.forEach(p => {
            if (p.country) {
                geoDistribution[p.country] = (geoDistribution[p.country] || 0) + 1;
            }
        });
        const topCountries = Object.entries(geoDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return NextResponse.json({ 
            ok: true, 
            data,
            analytics: {
                totalUsers: totalUsers || 0,
                topCountries
            }
        });

    } catch (err) {
        console.error("Admin organizations fetch error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
