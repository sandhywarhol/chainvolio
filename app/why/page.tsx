"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function WhyPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">

            <Navbar />

            {/* 1. HERO SECTION - Statement-driven, Editorial spacing */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-teal-400/60">Introduction</span>
                </div>

                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    The Statement of Proof.
                </h1>

                <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto font-light tracking-tight px-8">
                    Legacy professional credentials rely on social trust. ChainVolio operates on cryptographic truth. We transition from arbitrary promises to a foundational trust layer of verifiable, on-chain architecture.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* 2. THE THRESHOLD - Problem vs Solution (Quiet Comparison) */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-20 items-start">
                    {/* The Old Way */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-red-500/40 font-bold">The Vulnerability</span>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Paper Credentials.</h2>
                            <p className="text-white/40 font-light leading-relaxed max-w-sm">
                                Legacy professional records are static, unanchored artifacts. They lack cryptographic guarantees, are prone to manipulation, and offer no structural accountability.
                            </p>
                        </div>
                        <ul className="space-y-6">
                            {[
                                "Unverifiable professional assertions",
                                "Static records lacking cryptographic ownership",
                                "Zero structural accountability",
                                "High entropy in professional validation"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-white/20 border-l border-white/5 pl-6 pb-1">
                                    <span className="text-xs font-mono opacity-50">0{i + 1}</span>
                                    <span className="text-base font-light tracking-tight">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* The ChainVolio Way - Calm Confidence */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">The Standard</span>
                            <h2 className="text-3xl font-bold text-white tracking-tight">On-Chain Reality.</h2>
                            <p className="text-white/60 font-light leading-relaxed max-w-sm">
                                ChainVolio establishes a permanent trust infrastructure for work history. Every milestone is a gas-backed cryptographic receipt, anchored to public ledger finality.
                            </p>
                        </div>
                        <ul className="space-y-6">
                            {[
                                "Cryptographic provenance of all professional output",
                                "On-chain anchoring of proof-of-work (PoW)",
                                "Consensus-backed professional attestations",
                                "Auditable integrity for institutional actors"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-white/90 border-l border-teal-500/20 pl-6 pb-1">
                                    <span className="text-xs font-mono text-teal-400/50">0{i + 1}</span>
                                    <span className="text-base font-medium tracking-tight">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* 3. CORE PRINCIPLES - Grid without Card Heavy Design */}
            <section className="relative z-40 py-24 px-8 max-w-[1240px] mx-auto w-full">
                <div className="max-w-xl mb-16">
                    <h2 className="text-4xl font-bold text-white tracking-tighter mb-4">Designed for Substance.</h2>
                    <p className="text-white/40 font-light leading-relaxed">
                        ChainVolio is architected for transparency. We eliminate the noise of legacy recruitment systems to focus exclusively on public auditability and verified professional output.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-x-16 gap-y-16">
                    {[
                        {
                            title: "Absolute Provenance",
                            desc: "Solana coordinates the professional ledger. Every milestone is timestamped and anchored with economic finality, creating an immutable career registry."
                        },
                        {
                            title: "Signal Priority",
                            desc: "We prioritize verifiable accomplishments over titles. Institutional records and network-backed proofs allow talent to be audited with crystalline clarity."
                        },
                        {
                            title: "Institutional Trust",
                            desc: "Our attestation protocol enables projects to endorse performance cryptographically. This is not a social referral; it is an on-chain verification anchored by gas-backed finality."
                        },
                        {
                            title: "Permissionless Identity",
                            desc: "Your professional identity is wallet-native and sovereign. Built on open cryptographic standards, it functions as a global trust layer without institutional intermediaries."
                        }
                    ].map((card, i) => (
                        <div key={i} className="group">
                            <div className="w-12 h-[1px] bg-white/10 mb-6 group-hover:w-24 group-hover:bg-teal-500/50 transition-all duration-700" />
                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{card.title}</h3>
                            <p className="text-sm text-white/30 leading-relaxed font-light group-hover:text-white/50 transition-colors duration-500 max-w-sm">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* 4. THE COMPARISON - Understated Table */}
            <section className="relative z-40 py-24 px-8 max-w-[1000px] mx-auto w-full">
                <div className="text-center mb-16 space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">The Calibration</h2>
                    <p className="text-white/20 text-[10px] font-bold tracking-[0.4em] uppercase">Truth vs Fabrication</p>
                </div>

                <div className="border-t border-white/5">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-white/5">
                            {[
                                ["Data Layer", "Legacy Data Architecture", "Public Ledger Infrastructure"],
                                ["Verification Protocol", "Manual Outreach & Social Trust", "Cryptographically Verifiable in Real Time"],
                                ["Validation Logic", "Subjective / Unverified", "Algorithmic / Secure"],
                                ["Data Integrity", "Temporary / Volatile", "Permanent / Immutable"],
                                ["Interoperability", "Systemic Isolation", "Universal Wallet-Native ID"]
                            ].map((row, i) => (
                                <tr key={i} className="group">
                                    <td className="py-6 text-[11px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">{row[0]}</td>
                                    <td className="py-6 text-sm font-light text-white/20 text-center">{row[1]}</td>
                                    <td className="py-6 text-sm font-medium text-white text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="w-1 h-1 rounded-full bg-teal-500/30 group-hover:bg-teal-500 transition-colors" />
                                            {row[2]}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>



            {/* 5. CLOSING STATEMENT - Pure Typography */}
            <section className="relative z-40 py-40 px-8 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-5xl md:text-[72px] font-bold tracking-tighter leading-[0.85] flex flex-col items-center">
                        <span className="text-white">Evidence is the</span>
                        <span className="text-white/30">New Authority.</span>
                    </h2>
                    <p className="text-white/30 text-lg md:text-xl font-light tracking-tight max-w-xl mx-auto">
                        Integrate with the foundational layer where professional reputation requires no external explanation.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
