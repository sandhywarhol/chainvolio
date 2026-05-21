"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useEffect, useState } from "react";

export default function StatusPage() {
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        setCurrentTime(new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }));
    }, []);

    const components = [
        { name: "Identity & Authentication", status: "Operational" },
        { name: "Profile & CV System", status: "Operational" },
        { name: "Proof of Work Engine", status: "Operational" },
        { name: "Attestation Protocol", status: "Operational" },
        { name: "Hiring & Talent Pipeline", status: "Operational" },
        { name: "Verification System", status: "Operational" },
        { name: "Signature Verification", status: "Operational" },
    ];

    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-amber-500/30 selection:text-white pb-20 bg-black theme-bg-page theme-aware">
            {/* Refined noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            <div className="flex-1 flex flex-col w-full">
                {/* Hero Section */}
                <section className="relative z-40 pt-32 pb-12 px-8 max-w-[1240px] mx-auto w-full text-center">
                    <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-4">
                        <span className="text-caption text-amber-200/60">Transparency</span>
                    </div>

                    <h1 className="text-h1 mb-8">
                        System Status
                    </h1>

                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-h3 !text-white flex items-center">Operational <span className="text-emerald-500/80 font-normal ml-2 text-sm">(Pre-Launch)</span></span>
                    </div>
                </section>

                <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

                {/* Status Grid */}
                <section className="relative z-40 py-8 px-8 max-w-2xl mx-auto w-full">
                    <div className="space-y-3">
                        {components.map((comp, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-sm hover:border-white/10 transition-colors group">
                                <span className="text-caption text-white/60 group-hover:text-white transition-colors">{comp.name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-caption text-emerald-500">{comp.status}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col gap-2">
                        <p className="text-caption text-emerald-400">All core systems are operational.</p>
                        <p className="text-body text-white/50">
                            ChainVolio's identity, proof, and hiring infrastructure are fully functional and secured.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-caption opacity-40">
                        <span>Build 0.1.0-Alpha</span>
                        <span>Last Updated: {currentTime}</span>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}
