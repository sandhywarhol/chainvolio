import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
    if (!supabase) {
        return NextResponse.json(
            { error: "Supabase not configured" },
            { status: 503 }
        );
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
        return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("wallet_address", wallet)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        thumbnailUrl: item.thumbnail_url,
        createdAt: item.created_at,
    }));

    return NextResponse.json(list);
}

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json(
            { error: "Supabase not configured" },
            { status: 503 }
        );
    }

    try {
        const body = await request.json();
        const { walletAddress, title, description, imageUrl, thumbnailUrl } = body;

        if (!walletAddress || !title || !imageUrl || !thumbnailUrl) {
            return NextResponse.json(
                { error: "walletAddress, title, imageUrl, and thumbnailUrl are required" },
                { status: 400 }
            );
        }

        // Validate description length
        if (description && description.length > 150) {
            return NextResponse.json(
                { error: "Description must be 150 characters or less" },
                { status: 400 }
            );
        }

        // Ensure wallet exists
        await supabase.from("wallets").upsert(
            {
                wallet_address: walletAddress,
                last_connected_at: new Date().toISOString(),
            },
            { onConflict: "wallet_address" }
        );

        // Insert portfolio item
        const { error } = await supabase.from("portfolio_items").insert({
            wallet_address: walletAddress,
            title,
            description: description || null,
            image_url: imageUrl,
            thumbnail_url: thumbnailUrl,
        });

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
