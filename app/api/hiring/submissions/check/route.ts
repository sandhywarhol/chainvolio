import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const wallet = searchParams.get("wallet");

        if (!slug || !wallet) {
            return NextResponse.json({ error: "Slug and Wallet required" }, { status: 400 });
        }

        // 1. Get collection ID
        const { data: collection } = await supabase
            .from("hiring_collections")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        if (!collection) return NextResponse.json({ submission: null });

        // 2. Get submission
        const { data: submission } = await supabase
            .from("collection_submissions")
            .select("*")
            .eq("collection_id", collection.id)
            .eq("candidate_wallet", wallet)
            .maybeSingle();

        return NextResponse.json({ submission });
    } catch (err) {
        console.error("Check submission error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
