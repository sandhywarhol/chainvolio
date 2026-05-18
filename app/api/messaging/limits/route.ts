import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { isRecruiterTier } from "@/lib/paymentConfig";

const err = (code: string, msg: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message: msg } }, { status });

const FREE_LIMIT = 2;

export async function GET(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Supabase not configured", 503);

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();

    if (!wallet && !token) return err("ERR_AUTH", "wallet or Authorization required", 401);

    try {
        let isPremium = false;
        let authUid: string | undefined;

        if (token) {
            const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
            if (authErr || !user) return err("ERR_AUTH", "Invalid token", 401);
            authUid = user.id;

            const { data: orgAcc } = await supabase
                .from("org_accounts")
                .select("plan_name, subscription_status, current_period_end")
                .eq("auth_uid", authUid)
                .maybeSingle();

            const periodExpired = orgAcc?.current_period_end
                ? new Date(orgAcc.current_period_end) < new Date() : false;
            isPremium = !!(
                orgAcc?.plan_name &&
                orgAcc.plan_name !== "free" &&
                orgAcc.subscription_status === "active" &&
                !periodExpired
            );
        } else if (wallet) {
            const { data: orgData } = await supabase
                .from("organization_verifications")
                .select("type, status, expires_at")
                .eq("wallet_address", wallet)
                .maybeSingle();

            const isExpired = orgData?.expires_at
                ? new Date(orgData.expires_at) < new Date() : false;
            const isVerified = orgData?.status === "verified" && !isExpired;
            isPremium = isVerified && isRecruiterTier(orgData?.type ?? "");
        }

        if (isPremium) {
            return NextResponse.json({ ok: true, used: 0, limit: null, isPremium: true });
        }

        const monthYear = new Date().toISOString().slice(0, 7);
        const whereClause = wallet
            ? { recruiter_wallet: wallet, month_year: monthYear }
            : { recruiter_auth_uid: authUid, month_year: monthYear };

        const { data: limitRow } = await supabase
            .from("recruiter_outreach_limits")
            .select("outreach_count")
            .match(whereClause)
            .maybeSingle();

        const used = limitRow?.outreach_count ?? 0;
        const resetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            .toISOString().slice(0, 10);

        return NextResponse.json({ ok: true, used, limit: FREE_LIMIT, isPremium: false, resetDate });
    } catch (e: any) {
        return err("ERR_SERVER", e.message, 500);
    }
}
