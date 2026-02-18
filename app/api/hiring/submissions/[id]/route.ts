import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";


export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const { id } = params;
        const { status, notes } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Submission ID required" }, { status: 400 });
        }

        const updates: any = {};
        if (status) updates.recruiter_status = status;
        if (typeof notes === 'string') updates.recruiter_notes = notes;

        const { data, error } = await supabase
            .from("collection_submissions")
            .update(updates)
            .eq("id", id)
            .select();

        if (data && data.length === 0) {
            console.warn("Update returned 0 rows. Possible RLS issue or ID mismatch for ID:", id);
            return NextResponse.json({ error: "Update failed - likely permission denied. Please run FIX_RLS_POLICIES.sql." }, { status: 403 });
        }

        if (error) {
            console.error("Error updating submission:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const { id } = params;
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const { error } = await supabase
            .from("collection_submissions")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting submission:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}
