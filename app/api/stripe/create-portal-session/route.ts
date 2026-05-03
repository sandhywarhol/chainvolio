import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer as supabase } from "@/lib/supabase/server";

const err = (code: string, message: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status });

export async function POST(request: Request) {
    // Temporarily disabled as per user request
    return err("ERR_DISABLED", "Billing management is currently under maintenance. Please try again later.", 503);

    if (!supabase) return err("ERR_CONFIG", "Service unavailable", 503);

    const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();
    if (!token) return err("ERR_UNAUTHORIZED", "Authorization required", 401);

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return err("ERR_UNAUTHORIZED", "Invalid token", 401);

    const { data: orgAccount } = await supabase
        .from("org_accounts")
        .select("stripe_customer_id")
        .eq("auth_uid", user.id)
        .single();

    if (!orgAccount?.stripe_customer_id)
        return err("ERR_NO_SUBSCRIPTION", "No billing account found", 400);

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: orgAccount.stripe_customer_id,
        return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ ok: true, url: portalSession.url });
}
