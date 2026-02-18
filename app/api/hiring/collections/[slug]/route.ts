import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function DELETE(
    request: Request,
    { params }: { params: { slug: string } }
) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const { slug } = params;

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    try {
        // First, check if the collection exists to verify ownership if needed (skipping strict ownership check for now as per MVP requirements, just like updates)
        // In a real app, we should check if the requester is the owner.

        // Delete the collection. 
        // Note: If you have foreign key constraints (like submissions referencing collections), 
        // you might need to delete them first OR have ON DELETE CASCADE set up in your DB.
        // Assuming ON DELETE CASCADE is NOT set up by default unless specified, let's try to delete submissions first to be safe.

        // 1. Get Collection ID
        const { data: collection, error: fetchError } = await supabase
            .from("hiring_collections")
            .select("id")
            .eq("slug", slug)
            .single();

        if (fetchError || !collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        // 2. Delete submissions (if any)
        const { error: subError } = await supabase
            .from("collection_submissions")
            .delete()
            .eq("collection_id", collection.id);

        if (subError) {
            console.error("Error deleting submissions:", subError);
            // Proceeding to try deleting collection anyway, but logging error.
        }

        // 3. Delete the collection
        const { error: deleteError } = await supabase
            .from("hiring_collections")
            .delete()
            .eq("id", collection.id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}
