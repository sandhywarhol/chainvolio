import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// GET /api/org/public?auth_uid=<uid>
// Returns only public-safe org fields — never exposes Stripe or email data.
export async function GET(req: NextRequest) {
    if (!supabaseServer) return NextResponse.json({ error: "Server error" }, { status: 500 });

    const authUid = req.nextUrl.searchParams.get("auth_uid");
    if (!authUid) return NextResponse.json({ error: "auth_uid required" }, { status: 400 });

    const { data, error } = await supabaseServer
        .from("org_accounts")
        .select(
            "auth_uid, org_name, org_type, account_type, bio, avatar_url, website, twitter, linkedin, discord, telegram, country, github, instagram, whatsapp, skills, role, timezone, looking_for, work_preference, plan_name, subscription_status, current_period_end, onboarding_complete, created_at"
        )
        .eq("auth_uid", authUid)
        .single();

    if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Resolve effective plan — treat canceled/expired as free
    const isExpired = data.current_period_end
        ? new Date(data.current_period_end) < new Date()
        : false;
    const effectivePlan =
        data.subscription_status === "canceled" || isExpired ? "free" : (data.plan_name ?? "free");

    let orgIdNumber = 1;
    if (data.created_at) {
        const { count } = await supabaseServer
            .from("org_accounts")
            .select("*", { count: "exact", head: true })
            .lte("created_at", data.created_at);
        orgIdNumber = count || 1;
    }

    const d = data as any;
    const org = {
        auth_uid: d.auth_uid,
        org_name: d.org_name,
        org_type: d.org_type,
        account_type: d.account_type as string | null,
        bio: d.bio,
        avatar_url: d.avatar_url,
        website: d.website,
        twitter: d.twitter,
        linkedin: d.linkedin,
        discord: d.discord,
        telegram: d.telegram,
        country: d.country,
        github: d.github ?? null,
        instagram: d.instagram ?? null,
        whatsapp: d.whatsapp ?? null,
        skills: d.skills ?? null,
        role: d.role ?? null,
        timezone: d.timezone ?? null,
        looking_for: d.looking_for ?? null,
        work_preference: d.work_preference ?? null,
        effective_plan: effectivePlan as string,
        is_verified: effectivePlan !== "free",
        org_id_number: orgIdNumber,
    };

    return NextResponse.json({ org }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
}
