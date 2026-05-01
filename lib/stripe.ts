import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
    console.error("FATAL: STRIPE_SECRET_KEY is not set in production.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
