import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const bucket = formData.get("bucket") as string || "portfolio";
        const path = formData.get("path") as string; // Target path like "wallet/timestamp.webp"

        if (!file || !path) {
            return NextResponse.json({ error: "File and path required" }, { status: 400 });
        }

        // --- Basic Security Check ---
        // For production, you might want to verify a signature here too if you want to limit 
        // WHO can upload to WHAT path. But for now, we'll focus on the authoritative proxy.
        // ----------------------------

        const buffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);

        return NextResponse.json({ url: data.publicUrl });
    } catch (err: any) {
        console.error("Server storage error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
