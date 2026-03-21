import { createClient } from "@supabase/supabase-js";

// This client is for use IN API ROUTES ONLY.
// It uses the SERVICE_ROLE_KEY to bypass RLS.
// ONLY use this after you have manually verified the user's signature/identity.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'production') {
        console.error("FATAL: SUPABASE credentials missing in production.");
    } else {
        console.warn("Supabase credentials missing. API routes will fail.");
    }
}

export const supabaseServer =
    supabaseUrl && supabaseServiceKey
        ? createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        })
        : null;


