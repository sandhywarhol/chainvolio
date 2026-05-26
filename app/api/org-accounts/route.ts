import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// GET /api/org-accounts?auth_uid=<uid>
// Returns the org_account row for the given Supabase Auth UID.
export async function GET(req: NextRequest) {
    if (!supabaseServer) return NextResponse.json({ error: "Server error" }, { status: 500 });

    const authUid = req.nextUrl.searchParams.get("auth_uid");
    if (!authUid) return NextResponse.json({ error: "auth_uid required" }, { status: 400 });

    const { data, error } = await supabaseServer
        .from("org_accounts")
        .select("*")
        .eq("auth_uid", authUid)
        .single();

    if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let org_id_number = 1;
    if (data?.created_at) {
        const { count, error: countError } = await supabaseServer
            .from("org_accounts")
            .select("*", { count: "exact", head: true })
            .lte("created_at", data.created_at);
        
        if (!countError && count !== null) {
            org_id_number = count;
        }
    }

    return NextResponse.json({ orgAccount: data ? { ...data, org_id_number } : null });
}

// POST /api/org-accounts
// Body: { auth_uid, email, org_name, org_type }
// Creates a new org_account row (called after onboarding form submit).
export async function POST(req: NextRequest) {
    if (!supabaseServer) return NextResponse.json({ error: "Server error" }, { status: 500 });

    const body = await req.json();
    const { auth_uid, email, org_name, org_type, account_type, onboarding_complete } = body;

    if (!auth_uid || !email) {
        return NextResponse.json({ error: "auth_uid and email required" }, { status: 400 });
    }

    const isBuilder = account_type === "builder";
    const resolvedComplete = onboarding_complete !== undefined
        ? !!onboarding_complete
        : isBuilder ? true : !!(org_name && org_type);

    const { data, error } = await supabaseServer
        .from("org_accounts")
        .upsert(
            {
                auth_uid,
                email,
                org_name: org_name ?? null,
                org_type: org_type ?? null,
                account_type: account_type ?? "recruiter",
                onboarding_complete: resolvedComplete,
            },
            { onConflict: "auth_uid" }
        )
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ orgAccount: data });
}

// PATCH /api/org-accounts
// Body: { auth_uid, ...fields }
// Updates an existing org_account row.
export async function PATCH(req: NextRequest) {
    if (!supabaseServer) return NextResponse.json({ error: "Server error" }, { status: 500 });

    const body = await req.json();
    const { auth_uid, ...updates } = body;

    if (!auth_uid) return NextResponse.json({ error: "auth_uid required" }, { status: 400 });

    if (updates.wallet_address) {
        // Validate wallet uniqueness before linking
        const [profileResult, orgResult] = await Promise.all([
            supabaseServer.from("profiles").select("wallet_address").eq("wallet_address", updates.wallet_address).maybeSingle(),
            supabaseServer.from("org_accounts").select("auth_uid").eq("wallet_address", updates.wallet_address).neq("auth_uid", auth_uid).maybeSingle(),
        ]);

        if (profileResult.data) {
            return NextResponse.json({ error: "This wallet is already registered as a Builder. You cannot link it to a Recruiter account." }, { status: 400 });
        }
        if (orgResult.data) {
            return NextResponse.json({ error: "This wallet is already linked to another Recruiter account." }, { status: 400 });
        }
    }

    const { data, error } = await supabaseServer
        .from("org_accounts")
        .update(updates)
        .eq("auth_uid", auth_uid)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ orgAccount: data });
}
