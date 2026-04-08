import { NextResponse } from "next/server";
import { calculateScore } from "@/lib/score";
import { supabaseServer } from "@/lib/supabase/server";
import { validateApiKey } from "@/lib/apiAuth";

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    // Auth check
    const auth = await validateApiKey(request);
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!supabaseServer) {
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }

    // Attempt to get cached score first
    const { data: scoreRecord } = await supabaseServer
      .from("scores")
      .select("*")
      .eq("wallet_address", address)
      .single();

    if (scoreRecord) {
        // If it was updated in the last 24 hours, return cached version
        const lastUpdated = new Date(scoreRecord.last_updated).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
            return NextResponse.json({
                wallet: scoreRecord.wallet_address,
                score: scoreRecord.total_score,
                domain_scores: scoreRecord.domain_scores || {},
                level: scoreRecord.level || "Beginner",
                activity_status: scoreRecord.activity_status || "active",
                confidence: scoreRecord.confidence || 0,
                confidence_label: scoreRecord.confidence_label || "Low",
                trust_score: scoreRecord.trust_score || 0,
                reason: scoreRecord.reason || "Building reputation",
                last_updated: scoreRecord.last_updated,
                breakdown: {
                    experience: scoreRecord.experience_score,
                    verification: scoreRecord.verification_score,
                    consistency: scoreRecord.consistency_score,
                    skill: scoreRecord.skill_score,
                    activity: scoreRecord.activity_score
                }
            });
        }
    }

    // If no score or older than 24 hours, recalculate
    const scoreData = await calculateScore(address);
    return NextResponse.json(scoreData);
  } catch (error: any) {
    console.error("Error fetching score:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
