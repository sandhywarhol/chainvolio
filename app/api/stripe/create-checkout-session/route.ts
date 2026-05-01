import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { getPriceId } from "@/lib/stripePlans";
import type { StripePlanName } from "@/lib/stripePlans";

const err = (code: string, message: string, status = 400) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status });

export async function POST(request: Request) {
    if (!supabase) return err("ERR_CONFIG", "Service unavailable", 503);

    // Verify JWT
    const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();
    if (!token) return err("ERR_UNAUTHORIZED", "Authorization required", 401);

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return err("ERR_UNAUTHORIZED", "Invalid token", 401);

    const body = await request.json();
    const { planName } = body as { planName: StripePlanName };

    const priceId = getPriceId(planName);
    if (!priceId) return err("ERR_INVALID_PLAN", "Invalid plan or price not configured", 400);

    // Fetch org account
    const { data: orgAccount } = await supabase
        .from("org_accounts")
        .select("stripe_customer_id, email, org_name")
        .eq("auth_uid", user.id)
        .single();

    if (!orgAccount) return err("ERR_NOT_FOUND", "Org account not found", 404);

    // Create Stripe customer if needed (idempotent)
    let customerId = orgAccount.stripe_customer_id;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: orgAccount.email ?? user.email ?? undefined,
            name: orgAccount.org_name ?? undefined,
            metadata: { auth_uid: user.id },
        });
        customerId = customer.id;
        await supabase
            .from("org_accounts")
            .update({ stripe_customer_id: customerId })
            .eq("auth_uid", user.id);
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/recruiter/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/recruiter/subscription/cancel`,
        metadata: { auth_uid: user.id },
        subscription_data: { metadata: { auth_uid: user.id } },
        allow_promotion_codes: true,
    });

    return NextResponse.json({ ok: true, url: session.url });
}
