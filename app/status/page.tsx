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
        { name: "API Services", status: "Operational" },
        { name: "Database Layer", status: "Operational" },
        { name: "Signature Verification", status: "Operational" },
        { name: "CV Attestation Pipeline", status: "Operational" },
    ];

    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-white">
            {/* Refined noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            <div className="flex-1 flex flex-col justify-center w-full">
                {/* Hero Section */}
                <section className="relative z-40 pt-10 pb-8 px-8 max-w-[1240px] mx-auto w-full text-center">
                    <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-4">
                        <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-emerald-400/60">Transparency</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                        System Status
                    </h1>

                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xl font-bold text-white tracking-tight uppercase tracking-wider">Operational <span className="text-emerald-500/80 font-normal">(Pre-Launch)</span></span>
                    </div>
                </section>

                <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

                {/* Status Grid */}
                <section className="relative z-40 py-8 px-8 max-w-2xl mx-auto w-full">
                    <div className="space-y-4">
                        {components.map((comp, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-sm hover:border-white/10 transition-colors group">
                                <span className="text-sm font-bold text-white uppercase tracking-widest">{comp.name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{comp.status}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 border-l border-white/10 bg-white/[0.01]">
                        <p className="text-sm text-white/40 leading-relaxed font-light italic">
                            “This page reflects internal system health checks. Live metrics and incident history will be added as the platform matures.”
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">
                        <span>Build 0.1.0-Alpha</span>
                        <span>Last Updated: {currentTime}</span>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}
