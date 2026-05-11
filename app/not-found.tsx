"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-black theme-bg-page theme-aware text-white flex flex-col items-center justify-center px-6 relative overflow-hidden selection:bg-indigo-500/30">
            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[160px] rounded-full" />
                <div className="absolute bottom-[20%] right-[10%] w-[35%] h-[35%] bg-emerald-500/4 blur-[160px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full gap-10">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group mb-4">
                    <img
                        src="/chainvolio%20logo.png"
                        alt="ChainVolio"
                        className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                    />
                    <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                        ChainVolio
                    </span>
                </Link>

                {/* 404 number */}
                <div className="relative">
                    <span className="text-[120px] md:text-[180px] font-black leading-none text-white/[0.04] select-none">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="w-12 h-12 text-white/20" />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Page Not Found
                    </h1>
                    <p className="text-white/40 text-sm md:text-base leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                        <br />
                        Double-check the URL or head back to the platform.
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-100 transition-all text-sm"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08] font-bold rounded-xl transition-all text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>

                {/* Quick links */}
                <div className="pt-4 border-t border-white/5 w-full space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">
                        Useful Links
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { label: "Dashboard", href: "/dashboard" },
                            { label: "Guides", href: "/guides/how-it-works" },
                            { label: "API Docs", href: "/api-docs" },
                            { label: "Security", href: "/security" },
                            { label: "Developers", href: "/developers" },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-3 py-1.5 text-xs font-bold text-white/30 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-all"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
