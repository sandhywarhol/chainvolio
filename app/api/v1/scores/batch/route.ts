import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { validateApiKey } from "@/lib/apiAuth";

export async function POST(request: Request) {
  try {
    // Auth check
    const auth = await validateApiKey(request);
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { wallets } = await request.json();

    if (!wallets || !Array.isArray(wallets)) {
      return NextResponse.json(
        { error: "Invalid input. Expected { wallets: string[] }" },
        { status: 400 }
      );
    }

    if (!supabaseServer) {
      return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }

    // Fetch scores from DB
    const { data: scores, error } = await supabaseServer
      .from("scores")
      .select("*")
      .in("wallet_address", wallets);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map requested wallets to results (or null if not found)
    const result = wallets.map((address) => {
      const record = scores?.find((s) => s.wallet_address === address);
      if (!record) return { wallet: address, error: "Score not found" };

      return {
        wallet: record.wallet_address,
        score: record.total_score,
        level: record.level || "Beginner",
        domain_scores: record.domain_scores || {},
        activity_status: record.activity_status || "active",
        confidence: record.confidence || 0,
        confidence_label: record.confidence_label || "Low",
        trust_score: record.trust_score || 0,
        reason: record.reason || "Building reputation",
        last_updated: record.last_updated,
        breakdown: {
          experience: record.experience_score,
          verification: record.verification_score,
          consistency: record.consistency_score,
          skill: record.skill_score,
          activity: record.activity_score,
        },
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Batch score error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
