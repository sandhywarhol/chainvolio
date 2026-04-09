import { NextResponse } from "next/server";
import { syncUserStatus } from "@/lib/sync";

/**
 * POST /api/auth/sync
 * 
 * Explicitly triggers a side-effect sync for a user profile.
 * Use this when a user connects their wallet or performs a manual refresh.
 */
export async function POST(request: Request) {
    try {
        const { wallet } = await request.json();

        if (!wallet) {
            return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
        }

        const result = await syncUserStatus(wallet);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
