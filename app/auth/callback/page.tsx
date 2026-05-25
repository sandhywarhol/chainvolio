"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "@/lib/supabase/auth";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);

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
                    setAuthError("Sign in failed. Please try again.");
                    return;
                }
            }

            // Detect new Google user — route to role selection before dashboard
            try {
                const { data: { session } } = await supabaseAuth.auth.getSession();
                if (session?.user?.id) {
                    const res = await fetch(`/api/org-accounts?auth_uid=${session.user.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (!data.orgAccount) {
                            router.replace("/auth/role");
                            return;
                        }
                    }
                }
            } catch {
                // Fail open — go to dashboard as normal
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
                <div className="text-center">
                    <p className="text-white font-bold mb-1">Sign In Failed</p>
                    <p className="text-slate-400 text-sm">{authError}</p>
                </div>
                <button
                    onClick={() => router.replace("/dashboard")}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-colors"
                >
                    Back to Home
                </button>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-white bg-black">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Completing sign in...</p>
        </main>
    );
}
