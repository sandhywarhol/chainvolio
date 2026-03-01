"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Phantom Connect OAuth callback page.
 * Phantom redirects here after Google/Apple social login.
 * The Phantom React SDK handles the token extraction automatically from the URL.
 * We just redirect back to the dashboard after a short moment.
 */
export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // The PhantomProvider SDK automatically processes the OAuth callback
        // from the URL hash/query params. After processing, redirect home.
        const timer = setTimeout(() => {
            router.replace("/dashboard");
        }, 1500);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Completing sign in...</p>
        </main>
    );
}
