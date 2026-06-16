"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "@/lib/supabase/auth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const isMobile = window.innerWidth < 768;
            const dashDest = isMobile ? "/" : "/dashboard";

            if (!supabaseAuth) {
                router.replace(dashDest);
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const errorParam = params.get("error");
            if (errorParam) {
                setAuthError("Sign in was cancelled. Please try again.");
                return;
            }

            // With implicit flow: detectSessionInUrl processes hash tokens automatically.
            // With PKCE (fallback): exchange the code manually.
            const code = params.get("code");
            if (code) {
                const { error } = await supabaseAuth.auth.exchangeCodeForSession(code);
                if (error) {
                    // PKCE exchange failed — likely a cross-browser redirect issue.
                    // The user probably completed OAuth in a different browser context.
                    setAuthError("Sign in could not complete. If you opened ChainVolio inside another app (Instagram, WhatsApp, etc.), please open it directly in Safari or Chrome and try again.");
                    return;
                }
            } else {
                // Implicit flow: give detectSessionInUrl a moment to process the hash
                await new Promise(r => setTimeout(r, 300));
            }

            // Check session
            const { data: { session } } = await supabaseAuth.auth.getSession();
            if (!session) {
                // No session after processing — redirect to home, user can retry
                router.replace("/");
                return;
            }

            const next = params.get("next") ?? dashDest;

            // Detect new Google user — route to role selection before dashboard
            try {
                const res = await fetch(`/api/org-accounts?auth_uid=${session.user.id}`, {
                    headers: { "Authorization": `Bearer ${session.access_token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!data.orgAccount) {
                        router.replace("/auth/role");
                        return;
                    }
                }
            } catch {
                router.replace("/auth/role");
                return;
            }

            router.replace(next);
        };

        handleCallback();
    }, [router]);

    if (authError) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center gap-6 text-white bg-black px-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-xl">✕</span>
                </div>
                <div className="text-center max-w-xs">
                    <p className="text-white font-bold mb-2">Sign In Failed</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{authError}</p>
                </div>
                <button
                    onClick={() => router.replace("/")}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-colors"
                >
                    Back to Home
                </button>
            </main>
        );
    }

    return <LoadingScreen />;
}
