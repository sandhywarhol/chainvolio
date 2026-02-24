"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function SecurityPage() {
    const [showPdfNotice, setShowPdfNotice] = useState(false);

    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-white">
            {/* Refined noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* 1. HERO SECTION */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-emerald-400/60">System Posture</span>
                </div>

                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    Trust by Design.
                </h1>

                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="space-y-4">
                        <p className="text-lg md:text-2xl text-white/80 leading-relaxed font-light tracking-tight">
                            ChainVolio is built as a trust-minimized, non-custodial hiring infrastructure.
                        </p>
                        <p className="text-lg md:text-2xl text-white/80 leading-relaxed font-light tracking-tight">
                            Every state-changing action is cryptographically verified.
                        </p>
                        <p className="text-lg md:text-2xl text-white/80 leading-relaxed font-light tracking-tight">
                            Professional history is protected through architectural immutability, not promises.
                        </p>
                    </div>
                    <p className="text-sm text-white/40 max-w-2xl mx-auto leading-relaxed pt-8 font-light">
                        This page consolidates ChainVolio’s public security posture, trust assumptions, enforced invariants, and operational readiness into a single source of truth.
                    </p>
                </div>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* 2. CORE SECURITY PRINCIPLES */}
            <section className="relative z-40 py-24 px-8 max-w-[1240px] mx-auto w-full">
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        Core Security Principles
                    </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-16">
                    {[
                        {
                            title: "Signature Verification",
                            desc: "All critical actions: profile updates, CV snapshots, attestations, and job submissions, require wallet-based cryptographic signatures. Signatures are context-bound, meaning a signature generated for one action or hiring context is invalid for any other, preventing replay and signature harvesting attacks."
                        },
                        {
                            title: "Immutability (Ledger of Truth)",
                            desc: "Once a work record is attested or a CV snapshot is submitted, it becomes immutable. Database-level constraints and triggers prevent modification, deletion, or historical rewriting, even with elevated privileges."
                        },
                        {
                            title: "Non-Custodial Data Model",
                            desc: "ChainVolio never stores private keys or wallet credentials. Users retain full control of their identity via their chosen wallet provider. The platform verifies proofs and does not custody secrets."
                        }
                    ].map((item, i) => (
                        <div key={i} className="group">
                            <div className="w-12 h-[1px] bg-white/10 mb-6 group-hover:w-24 group-hover:bg-emerald-500/50 transition-all duration-700" />
                            <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{item.title}</h3>
                            <p className="text-sm text-white/30 leading-relaxed font-light group-hover:text-white/50 transition-colors duration-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* 3. ISOLATION & ABUSE RESISTANCE */}
            <section className="relative z-40 py-24 px-8 max-w-[1240px] mx-auto w-full">
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        Isolation & Abuse Resistance
                    </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-16">
                    {[
                        {
                            title: "Isolated Environments",
                            desc: "All recruiter and hiring data is logically and cryptographically isolated. Row-Level Security (RLS) ensures recruiters cannot access, infer, or enumerate data outside their own collections."
                        },
                        {
                            title: "Abuse Prevention",
                            desc: "Public hiring links are protected by layered defenses: Context-aware signatures, wallet-based cooldowns, privacy-preserving IP throttling, and server-enforced eligibility checks. These mechanisms increase the economic cost of spam while preserving legitimate access."
                        },
                        {
                            title: "Open Disclosure",
                            desc: "ChainVolio favors transparent architecture over obscurity. Security guarantees are enforced by code, database constraints, and verifiable invariants, not trust assumptions."
                        }
                    ].map((item, i) => (
                        <div key={i} className="group">
                            <div className="w-12 h-[1px] bg-white/10 mb-6 group-hover:w-24 group-hover:bg-emerald-500/50 transition-all duration-700" />
                            <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{item.title}</h3>
                            <p className="text-sm text-white/30 leading-relaxed font-light group-hover:text-white/50 transition-colors duration-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. SECURITY SCOPE & DISCLOSURE */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full bg-white/[0.01] border-y border-white/5">
                <div className="max-w-4xl px-8">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/60 font-bold mb-6 block flex items-center gap-2">
                        Legal Threshold
                    </span>
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Security Scope & Disclosure</h2>
                    <div className="space-y-6 text-white/40 font-light leading-relaxed text-sm italic border-l border-white/10 pl-8">
                        <p>“This page describes the security principles and architectural guarantees enforced by the ChainVolio platform. It does not constitute a formal third-party security audit, bug bounty program, or a guarantee of absolute risk elimination. While the system is designed to be resilient against abuse, tampering, and replay attacks, no software system can guarantee perfect security. ChainVolio prioritizes verifiable invariants, transparent design, and safe failure modes over unverifiable claims.”</p>
                    </div>
                </div>
            </section>

            {/* 5. OPERATIONAL READINESS */}
            <section className="relative z-40 py-24 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid md:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/60 font-bold flex items-center gap-2">
                                Status
                            </span>
                            <h3 className="text-3xl font-bold text-white tracking-tight">Operational Readiness</h3>
                            <p className="text-sm text-white/40 max-w-md font-light">The platform is considered production-ready under the following enforced conditions:</p>
                        </div>
                        <ul className="space-y-6">
                            {[
                                "Trust invariants enforced at the database level",
                                "Historical professional records remain immutable once attested",
                                "Recruiter data is cryptographically and logically isolated",
                                "Abuse mitigation and eligibility checks are active by default"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-white/90 border-l border-emerald-500/20 pl-6 pb-1">
                                    <span className="text-xs font-mono text-emerald-400/50">0{i + 1}</span>
                                    <span className="text-base font-medium tracking-tight">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest pt-4">These guarantees remain valid even under partial system compromise.</p>
                    </div>

                    {/* 6. SECURITY OVERVIEW PDF */}
                    <div className="space-y-8 p-10 bg-white/[0.02] border border-white/5 rounded-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl opacity-50 group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="flex items-center gap-3">
                            <h4 className="text-lg font-bold text-white tracking-tight">Security Overview (PDF)</h4>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-white/30 font-light leading-relaxed">
                                For partners, investors, and institutional reviewers, a concise Security Overview PDF is available. It summarizes ChainVolio’s architecture, trust assumptions, enforced invariants, and failure modes.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowPdfNotice(true)}
                            className="w-full py-4 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm"
                        >
                            [ Download Security Overview (PDF) ]
                        </button>
                    </div>
                </div>
            </section>

            {/* 7. TRUST & STATUS TRANSPARENCY */}
            <section className="relative z-40 py-16 px-8 max-w-[1240px] mx-auto w-full border-t border-white/5">
                <div className="flex flex-col md:flex-row gap-12 justify-between items-start">
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                            Trust & Status Transparency
                        </h3>
                        <p className="text-sm text-white/30 max-w-md font-light">For ongoing trust signals and system health:</p>
                        <div className="flex gap-4">
                            <Link href="/trust" className="px-6 py-2 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all text-[10px] uppercase tracking-widest font-bold">Visit /trust</Link>
                            <Link href="/status" className="px-6 py-2 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all text-[10px] uppercase tracking-widest font-bold">Visit /status</Link>
                        </div>
                    </div>

                    <div className="md:text-right max-w-sm">
                        <p className="text-xs text-white/20 uppercase tracking-[0.3em] font-bold mb-4">Final Note</p>
                        <p className="text-sm text-white/40 font-light leading-relaxed italic">
                            “ChainVolio is engineered under a zero-trust assumption: the frontend may be compromised, users may be adversarial, and failures are inevitable.”
                        </p>
                    </div>
                </div>
            </section>

            {/* Modal for PDF Notice */}
            {showPdfNotice && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0b] border border-white/10 p-8 rounded-sm max-w-md w-full relative">
                        <button
                            onClick={() => setShowPdfNotice(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white"
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-bold text-white mb-4">Under Finalization</h3>
                        <p className="text-sm text-white/50 leading-relaxed mb-6">
                            The Security Overview PDF is currently being finalized. Please check back shortly.
                        </p>
                        <button
                            onClick={() => setShowPdfNotice(false)}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

            {/* 8. CLOSING LINE */}
            <section className="relative z-40 py-40 px-8 text-center bg-gradient-to-b from-transparent to-black/40">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-5xl md:text-[72px] font-bold tracking-tighter leading-[0.85] flex flex-col items-center">
                        <span className="text-white">Verifiable by design.</span>
                        <span className="text-white/30">Immutable by default.</span>
                    </h2>
                    <div className="space-y-4">
                        <p className="text-white/40 text-lg md:text-xl font-light tracking-tight max-w-xl mx-auto">
                            Security is enforced in the layers that matter most: cryptography, database constraints, and irreversible system rules.
                        </p>
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.6em] font-bold pt-8">
                            Built for long-term trust in Web3 careers.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
