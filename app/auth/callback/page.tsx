"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "@/lib/supabase/auth";

/**
 * Supabase OAuth callback page.
 * After Google sign-in, Supabase redirects here with a `code` query param (PKCE flow).
 * We exchange it for a session, then forward to the dashboard.
 */
export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            if (!supabaseAuth) {
                router.replace("/dashboard");
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const next = params.get("next") ?? "/dashboard";

            if (code) {
                const { error } = await supabaseAuth.auth.exchangeCodeForSession(code);
                if (error) {
                    console.error("[auth/callback] Code exchange failed:", error.message);
                }
            }

            router.replace(next);
        };

        handleCallback();
    }, [router]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Completing sign in...</p>
        </main>
    );
}
