import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Create a new collection
export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const { title, description, ownerWallet, filters, ...metadata } = await request.json();

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        // Generate a simple slug from title
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const randomHash = Math.random().toString(36).substring(2, 7);
        const slug = `${baseSlug}-${randomHash}`;

        // Attempt 1: Full Features
        const { data, error } = await supabase
            .from("hiring_collections")
            .insert({
                title,
                description,
                slug,
                owner_wallet: ownerWallet || null,
                metadata: metadata,
                eligibility_filters: filters || {}
            })
            .select()
            .single();

        if (!error) return NextResponse.json(data);

        console.warn("⚠️ Full insert failed. Error code:", error.code, error.message);

        // Attempt 2: Without eligibility_filters (Schema might be old)
        if (error.code === '42703') { // Undefined column
            const { data: retryData, error: retryError } = await supabase
                .from("hiring_collections")
                .insert({
                    title,
                    description,
                    slug,
                    owner_wallet: ownerWallet || null,
                    metadata: metadata
                })
                .select()
                .single();

            if (!retryError) return NextResponse.json(retryData);
            console.error("⚠️ Retry failed:", retryError);
        }

        // Attempt 3: Minimal Insert (Absolute fallback)
        console.warn("⚠️ Falling back to minimal insert.");
        const { data: minimalData, error: minimalError } = await supabase
            .from("hiring_collections")
            .insert({
                title,
                slug,
                owner_wallet: ownerWallet || null
            })
            .select()
            .single();

        if (minimalError) {
            console.error("❌ CRITICAL: Minimal insert failed:", minimalError);
            return NextResponse.json({ error: "Database rejected all attempts: " + minimalError.message }, { status: 500 });
        }

        return NextResponse.json(minimalData);
    } catch (err: any) {
        console.error("Critical API Error:", err);
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}
