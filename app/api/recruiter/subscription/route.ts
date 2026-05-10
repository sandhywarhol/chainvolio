import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { getEffectiveLimits } from "@/lib/plans";
import type { PlanName } from "@/lib/plans";

const err = (code: string, message: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status });

export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Service unavailable", 503);

    const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();
    if (!token) return err("ERR_UNAUTHORIZED", "Authorization required", 401);

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return err("ERR_UNAUTHORIZED", "Invalid token", 401);

    const { data: orgAccount } = await supabase
        .from("org_accounts")
        .select("plan_name, subscription_status, current_period_end, saved_candidates_count, auth_uid")
        .eq("auth_uid", user.id)
        .single();

    if (!orgAccount) return err("ERR_NOT_FOUND", "Org account not found", 404);

    const plan = (orgAccount.plan_name ?? "free") as PlanName;
    const status = orgAccount.subscription_status ?? "free";
    const isExpired = orgAccount.current_period_end
        ? new Date(orgAccount.current_period_end) < new Date()
        : false;

    // If subscription is expired but status wasn't updated by webhook yet, treat as free
    const effectivePlan: PlanName = (status === "canceled" || isExpired) ? "free" : plan;
    const limits = getEffectiveLimits(effectivePlan, false); // isOrgVerified = false (Google-only path)

    // Count collections for this org account
    const { count: collectionsCount } = await supabase
        .from("hiring_collections")
        .select("*", { count: "exact", head: true })
        .eq("owner_auth_uid", user.id);

    return NextResponse.json({
        ok: true,
        plan: effectivePlan,
        status,
        periodEnd: orgAccount.current_period_end ?? null,
        limits: {
            collections: limits.collections,
            candidates: limits.candidates,
        },
        usage: {
            collections: collectionsCount ?? 0,
            candidates: orgAccount.saved_candidates_count ?? 0,
        },
    });
}
