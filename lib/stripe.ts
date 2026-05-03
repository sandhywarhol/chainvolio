import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key_for_build_purposes";

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
    console.warn("WARNING: STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.");
}

export const stripe = new Stripe(stripeKey);
