import { NextResponse } from "next/server";
import { fetchSiteStats } from "@/lib/siteStats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const stats = await fetchSiteStats();
        return NextResponse.json(stats);
    } catch (err) {
        console.error("[stats-api]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
