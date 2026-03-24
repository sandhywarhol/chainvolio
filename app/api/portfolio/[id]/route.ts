import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!supabase) {
        return NextResponse.json(
            { error: "Supabase not configured" },
            { status: 503 }
        );
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const signature = searchParams.get("signature");
    const nonce = searchParams.get("nonce");
    const timestamp = searchParams.get("timestamp");

    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        // 1. Get the item first to check ownership and delete images
        const { data: item, error: fetchError } = await supabase
            .from("portfolio_items")
            .select("wallet_address, image_url, thumbnail_url")
            .eq("id", id)
            .single();

        if (fetchError || !item) {
            return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
        }

        // --- Signature Verification ---
        const skipVerify = process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production";
        if (!skipVerify && (!wallet || !signature || !nonce || !timestamp)) {
            return NextResponse.json({ error: "Signature required to delete portfolio item." }, { status: 401 });
        }

        if (item.wallet_address !== wallet) {
            return NextResponse.json({ error: "Unauthorized. You do not own this item." }, { status: 403 });
        }

        const { verifySignature } = await import("@/lib/crypto");
        const { isValid, error: sigError } = await verifySignature(
            wallet!,
            "update_profile",
            nonce || "",
            parseInt(timestamp || "0"),
            signature || ""
        );

        if (!isValid) {
            return NextResponse.json({ error: sigError || "Signature verification failed." }, { status: 401 });
        }
        // ----------------------------

        // Set transaction context for RLS parity
        await supabase.rpc('set_app_wallet', { wallet_addr: wallet });

        // 2. Delete images from storage
        try {
            const imageFileName = item.image_url.split("/").pop();
            const thumbFileName = item.thumbnail_url.split("/").pop();

            if (imageFileName) {
                await supabase.storage.from("portfolio").remove([`${wallet}/${imageFileName}`]);
            }
            if (thumbFileName) {
                await supabase.storage.from("portfolio").remove([`${wallet}/${thumbFileName}`]);
            }
        } catch (storageError) {
            console.error("Error deleting from storage:", storageError);
        }

        // 3. Delete from database
        const { error: deleteError } = await supabase
            .from("portfolio_items")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("Supabase error:", deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
