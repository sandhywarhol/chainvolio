import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import { getPlanFromPriceId } from "@/lib/stripePlans";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const rawBody = await request.arrayBuffer();
    const body = Buffer.from(rawBody);
    const sig = request.headers.get("stripe-signature") ?? "";
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        console.error("STRIPE_WEBHOOK_SECRET is not configured");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, secret);
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Return 200 immediately — process is async from Stripe's perspective
    // (we process synchronously here but don't hold the response)

    if (!supabase) {
        console.error("Supabase not configured — cannot process webhook event");
        return NextResponse.json({ received: true });
    }

    // Idempotency: skip if event already processed
    const { data: existing } = await supabase
        .from("stripe_processed_events")
        .select("stripe_event_id")
        .eq("stripe_event_id", event.id)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ received: true, skipped: true });
    }

    try {
        await handleEvent(event);
        await supabase
            .from("stripe_processed_events")
            .insert({ stripe_event_id: event.id });
    } catch (err) {
        console.error(`Failed to process Stripe event ${event.id}:`, err);
        // Still return 200 — Stripe will retry if we return non-2xx
    }

    return NextResponse.json({ received: true });
}

async function getAuthUidByCustomer(customerId: string): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase
        .from("org_accounts")
        .select("auth_uid")
        .eq("stripe_customer_id", customerId)
        .single();
    return data?.auth_uid ?? null;
}

async function updateSubscription(authUid: string, updates: Record<string, unknown>) {
    if (!supabase) return;
    const { error } = await supabase
        .from("org_accounts")
        .update(updates)
        .eq("auth_uid", authUid);
    if (error) console.error("updateSubscription failed:", error.message);
}

async function handleEvent(event: Stripe.Event) {
    switch (event.type) {

        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.mode !== "subscription") break;

            const authUid = (session.metadata?.auth_uid as string) ?? null;
            if (!authUid) break;

            const sub = await stripe.subscriptions.retrieve(session.subscription as string);
            const item = sub.items.data[0];
            const priceId = item?.price.id ?? "";
            const planName = getPlanFromPriceId(priceId);

            await updateSubscription(authUid, {
                stripe_subscription_id: sub.id,
                subscription_status: sub.status,
                plan_name: planName,
                ...(planName === "company" ? { org_type: "company" } : planName === "community" ? { org_type: "community" } : {}),
                current_period_end: item?.current_period_end
                    ? new Date(item.current_period_end * 1000).toISOString()
                    : null,
            });
            break;
        }

        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;
            const authUid = await getAuthUidByCustomer(customerId);
            if (!authUid) break;

            const subRef = invoice.parent?.subscription_details?.subscription;
            const subId = typeof subRef === "string" ? subRef : subRef?.id;
            const sub = subId ? await stripe.subscriptions.retrieve(subId) : null;

            if (sub) {
                const item = sub.items.data[0];
                const priceId = item?.price.id ?? "";
                const planName = getPlanFromPriceId(priceId);
                await updateSubscription(authUid, {
                    subscription_status: "active",
                    plan_name: planName,
                    ...(planName === "company" ? { org_type: "company" } : planName === "community" ? { org_type: "community" } : {}),
                    current_period_end: item?.current_period_end
                        ? new Date(item.current_period_end * 1000).toISOString()
                        : null,
                });
            }
            break;
        }

        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;
            const authUid = await getAuthUidByCustomer(customerId);
            if (!authUid) break;

            await updateSubscription(authUid, { subscription_status: "past_due" });
            break;
        }

        case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            const customerId = sub.customer as string;
            const authUid = await getAuthUidByCustomer(customerId);
            if (!authUid) break;

            const item = sub.items.data[0];
            const priceId = item?.price.id ?? "";
            const planName = getPlanFromPriceId(priceId);
            await updateSubscription(authUid, {
                stripe_subscription_id: sub.id,
                subscription_status: sub.status,
                plan_name: planName,
                ...(planName === "company" ? { org_type: "company" } : planName === "community" ? { org_type: "community" } : {}),
                current_period_end: item?.current_period_end
                    ? new Date(item.current_period_end * 1000).toISOString()
                    : null,
            });
            break;
        }

        case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const customerId = sub.customer as string;
            const authUid = await getAuthUidByCustomer(customerId);
            if (!authUid) break;

            await updateSubscription(authUid, {
                subscription_status: "canceled",
                plan_name: "free",
                stripe_subscription_id: null,
                current_period_end: null,
            });
            break;
        }

        default:
            break;
    }
}
