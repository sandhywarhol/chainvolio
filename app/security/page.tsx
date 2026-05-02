"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { 
    ShieldCheck, 
    Lock, 
    Activity, 
    ShieldAlert, 
    FileText, 
    Cpu, 
    CheckCircle2, 
    AlertCircle, 
    Terminal, 
    Fingerprint,
    Search,
    Layers,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";

export default function SecurityPage() {
    const [showPdfNotice, setShowPdfNotice] = useState(false);

    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-white bg-black">
            {/* Refined noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[15%] -left-[5%] w-[45%] h-[45%] bg-emerald-500/[0.03] blur-[150px] rounded-full" />
                <div className="absolute bottom-[20%] -right-[5%] w-[40%] h-[40%] bg-blue-500/[0.03] blur-[150px] rounded-full" />
            </div>

            {/* 1. HERO SECTION */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span className="text-caption text-emerald-400/80">System Posture</span>
                </div>

                <h1 className="text-h1 mb-8">
                    Trust by Design.
                </h1>

                <div className="max-w-3xl mx-auto space-y-8">
                    <p className="text-body text-xl italic">
                        Trust-minimized, non-custodial hiring infrastructure. Cryptographically verified actions and architecturally immutable records eliminate reliance on centralized authorities.
                    </p>

                    <p className="text-body opacity-50 max-w-2xl mx-auto">
                        This document details ChainVolio’s public security posture, explicit trust assumptions, and the rigorously enforced invariants underlying the platform's operational readiness.
                    </p>
                </div>
            </section>

            <div className="max-w-[1240px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* 2. CORE SECURITY PRINCIPLES */}
            <section className="relative z-40 py-24 px-8 max-w-[1240px] mx-auto w-full">
                <div className="mb-16 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-h2">
                        Core Security Principles
                    </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Fingerprint className="w-5 h-5" />,
                            title: "Cryptographic Verification",
                            desc: "State mutations require valid signatures. Strictly context-bound to prevent replay attacks and signature harvesting."
                        },
                        {
                            icon: <Lock className="w-5 h-5" />,
                            title: "Database-Enforced Immutability",
                            desc: "Attested records are locked via hardened table triggers and access policies, unconditionally rejecting modifications."
                        },
                        {
                            icon: <Layers className="w-5 h-5" />,
                            title: "Non-Custodial Architecture",
                            desc: "ChainVolio does not custody keys. Identity authority remains with user wallets. We only verify cryptographic proofs."
                        }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-emerald-500/20 transition-all duration-500 group shadow-[0_10px_40px_rgba(16,185,129,0.02)]">
                            <div className="p-3 rounded-xl bg-emerald-500/5 text-emerald-400 mb-8 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 transition-all w-fit">
                                {item.icon}
                            </div>
                            <h3 className="text-caption text-white font-bold mb-4">{item.title}</h3>
                            <p className="text-body group-hover:text-white/50 mb-6">{item.desc}</p>
                            <div className="pt-4 border-t border-white/[0.05] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
                                <span className="text-caption !tracking-[0.15em] opacity-40 group-hover:opacity-60 transition-opacity">Verified Invariant</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="max-w-[1240px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* 3. ISOLATION & ABUSE RESISTANCE */}
            <section className="relative z-40 py-24 px-8 max-w-[1240px] mx-auto w-full">
                <div className="mb-16 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h2 className="text-h2">
                        Isolation & Abuse Resistance
                    </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Search className="w-5 h-5" />,
                            title: "Data Isolation (RLS)",
                            desc: "Hiring data is segmented through strict Row-Level Security. Policies guarantee entities cannot access unauthorized records."
                        },
                        {
                            icon: <TrendingUp className="w-5 h-5" />,
                            title: "Asymmetric Cost Enforcement",
                            desc: "Public infrastructure amplifies economic costs of abuse. Rate limits and cooldowns prevent automated spam throughput."
                        },
                        {
                            icon: <Terminal className="w-5 h-5" />,
                            title: "Architectural Transparency",
                            desc: "Platform guarantees are derived deterministically from code and database constraints, rather than aspirational trust."
                        }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-blue-500/20 transition-all duration-500 group shadow-[0_10px_40px_rgba(59,130,246,0.02)]">
                            <div className="p-3 rounded-xl bg-blue-500/5 text-blue-400 mb-8 group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-all w-fit">
                                {item.icon}
                            </div>
                            <h3 className="text-caption text-white font-bold mb-4">{item.title}</h3>
                            <p className="text-body group-hover:text-white/50 mb-6">{item.desc}</p>
                            <div className="pt-4 border-t border-white/[0.05] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                                <span className="text-caption !tracking-[0.15em] opacity-40">Active Protection</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. SECURITY SCOPE & DISCLOSURE */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full border-y border-white/[0.03]">
                <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldAlert className="w-5 h-5 text-emerald-400" />
                        <span className="text-caption text-emerald-400/80">Legal Threshold</span>
                    </div>
                    <h2 className="text-h2 mb-8">Security Scope & Disclosure</h2>
                    <div className="space-y-6 text-body italic border-l-2 border-emerald-500/20 pl-8 bg-emerald-500/[0.01] py-8 rounded-r-3xl">
                        <p>“This document outlines the operational security posture and structural guarantees implemented within the ChainVolio platform. It is not an assertion of absolute security, nor does it replace formal third-party cryptanalysis or audit reports. While the architecture is hardened against common vectors, including replay, mutation, and enumeration, software systems carry inherent risk. ChainVolio’s operational baseline relies on deterministic enforcement, transparent invariant design, and predictable degradation under failure.”</p>
                    </div>
                </div>
            </section>

            {/* 5. OPERATIONAL READINESS */}
            <section className="relative z-40 py-32 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid md:grid-cols-2 gap-20 items-start">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Cpu className="w-5 h-5 text-emerald-400" />
                                <span className="text-caption text-emerald-400/80">System Status</span>
                            </div>
                            <h3 className="text-h2">Operational Readiness</h3>
                            <p className="text-body text-lg">The platform asserts production readiness based on deterministic protocol constraints.</p>
                        </div>
                        <div className="space-y-6">
                            {[
                                "Trust invariants strictly asserted at the DB layer",
                                "Professional records achieve irrevocable immutability",
                                "Data isolation enforced via RLS policies",
                                "Asymmetric cost enforcement throttles anomaly"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-caption opacity-40 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:opacity-100 transition-all">
                                        0{i + 1}
                                    </div>
                                    <span className="text-body text-inherit font-medium group-hover:text-white transition-colors">{item}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl inline-block">
                            <p className="text-caption text-emerald-400/60 font-bold">Guarantees valid under partial system compromise</p>
                        </div>
                    </div>

                    {/* 6. SECURITY OVERVIEW PDF */}
                    <div className="p-12 bg-white/[0.01] border border-white/[0.03] rounded-[40px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative z-10 space-y-10">
                            <div className="p-4 rounded-2xl bg-white/[0.03] w-fit">
                                <FileText className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-h2 !text-2xl">Security Overview (PDF)</h4>
                                <p className="text-body opacity-50 leading-relaxed">
                                    Intended for institutional due diligence, the Security Overview outlines ChainVolio’s threat model, cryptographic architecture, and recovery mechanisms.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPdfNotice(true)}
                                className="w-full py-5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all text-caption font-bold rounded-2xl flex items-center justify-center gap-3"
                            >
                                Download Overview <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. TRUST & STATUS TRANSPARENCY */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full border-t border-white/[0.03]">
                <div className="flex flex-col md:flex-row gap-16 justify-between items-center">
                    <div className="space-y-8">
                        <h3 className="text-h3 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            Transparency Hub
                        </h3>
                        <div className="flex gap-6">
                            <Link href="/trust" className="group flex items-center gap-2 text-caption opacity-40 hover:opacity-100 transition-all">
                                /trust <ArrowUpRight className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                            <Link href="/status" className="group flex items-center gap-2 text-caption opacity-40 hover:opacity-100 transition-all">
                                /status <ArrowUpRight className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                        </div>
                    </div>

                    <div className="p-8 bg-white/[0.01] border border-white/[0.03] rounded-2xl max-w-sm">
                        <p className="text-caption text-white/20 mb-4">Core Invariant</p>
                        <p className="text-body italic">
                            “ChainVolio is engineered under a zero-trust assumption: the frontend may be compromised, users may be adversarial, and failures are inevitable.”
                        </p>
                    </div>
                </div>
            </section>

            {/* Modal for PDF Notice */}
            {showPdfNotice && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0b] border border-white/10 p-10 rounded-[32px] max-w-md w-full relative">
                        <button
                            onClick={() => setShowPdfNotice(false)}
                            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white font-bold text-xl"
                        >
                            ×
                        </button>
                        <div className="p-4 rounded-2xl bg-emerald-500/10 w-fit mb-8">
                            <AlertCircle className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-h2 !text-2xl mb-4">Under Finalization</h3>
                        <p className="text-body mb-10">
                            The Security Overview PDF is currently being finalized for the next protocol release. Please check back shortly.
                        </p>
                        <button
                            onClick={() => setShowPdfNotice(false)}
                            className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-caption font-bold transition-all rounded-2xl"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

            {/* 8. CLOSING LINE */}
            <section className="relative z-40 py-40 px-8 text-center">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-h1 flex flex-col items-center">
                        <span className="text-white">Verifiable</span>
                        <span className="text-white/20">Immutable</span>
                    </h2>
                    <div className="space-y-6">
                        <p className="text-body text-xl max-w-xl mx-auto italic">
                            Security is enforced in the layers that matter most: cryptography, database constraints, and irreversible system rules.
                        </p>
                        <div className="pt-12">
                            <p className="text-caption opacity-20 tracking-[0.5em]">
                                Built for long-term trust
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
