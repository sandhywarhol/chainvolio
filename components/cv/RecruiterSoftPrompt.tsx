"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useWallet } from "@solana/wallet-adapter-react";

const DISMISS_KEY = "chainvolio_recruiter_prompt_dismissed";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Shown on public CV pages when a visitor scrolls past 60% depth.
// Non-blocking bottom bar. Dismissible for 7 days via localStorage.
// Not shown if visitor is already signed in (wallet or Google).
export function RecruiterSoftPrompt() {
    const { session, loading, signInWithGoogle } = useGoogleAuth();
    const { connected } = useWallet();
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Check dismiss state on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DISMISS_KEY);
            if (raw) {
                const expiry = Number(raw);
                if (Date.now() < expiry) {
                    setDismissed(true);
                }
            }
        } catch {
            // localStorage blocked (private mode etc.) — just show it
        }
    }, []);

    // Listen for scroll past 60%
    useEffect(() => {
        if (dismissed || loading || session || connected) return;

        const handleScroll = () => {
            const scrolled = window.scrollY + window.innerHeight;
            const total = document.documentElement.scrollHeight;
            if (total > 0 && scrolled / total >= 0.6) {
                setVisible(true);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [dismissed, loading, session]);

    const dismiss = useCallback(() => {
        setVisible(false);
        setDismissed(true);
        try {
            localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_TTL_MS));
        } catch {
            // ignore
        }
    }, []);

    // Don't render if already signed in, dismissed, or not yet triggered
    if (!visible || dismissed || session || connected) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9000] flex justify-center px-4 pb-[95px] md:pb-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0d0d0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
                        <svg viewBox="0 0 24 24" className="w-4 h-4">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-white leading-snug">Interested in this talent profile?</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            Sign in with Google to access hiring tools, issue verified endorsements, and build talent collections.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={signInWithGoogle}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-white/90 text-black text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
                    >
                        Sign In Free
                    </button>
                    <button
                        onClick={dismiss}
                        className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
