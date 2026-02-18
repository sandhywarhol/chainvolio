import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

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

    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        // Get the item first to delete images from storage
        const { data: item } = await supabase
            .from("portfolio_items")
            .select("image_url, thumbnail_url")
            .eq("id", id)
            .single();

        if (item) {
            // Extract file paths from URLs and delete from storage
            try {
                const imageFileName = item.image_url.split("/").pop();
                const thumbFileName = item.thumbnail_url.split("/").pop();

                if (imageFileName) {
                    await supabase.storage.from("portfolio").remove([imageFileName]);
                }
                if (thumbFileName) {
                    await supabase.storage.from("portfolio").remove([thumbFileName]);
                }
            } catch (storageError) {
                console.error("Error deleting from storage:", storageError);
                // Continue with database deletion even if storage deletion fails
            }
        }

        // Delete from database
        const { error } = await supabase
            .from("portfolio_items")
            .delete()
            .eq("id", id);

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
