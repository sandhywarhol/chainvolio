"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
    AlertCircle, 
    ShieldCheck, 
    Zap, 
    BarChart3, 
    ExternalLink, 
    Layers, 
    ChevronRight,
    CircleDashed,
    CheckCircle2,
    Lock,
    Cpu,
    ArrowUpRight
} from "lucide-react";

export default function WhyPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white bg-black">

            <Navbar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-500/5 blur-[160px] rounded-full" />
                <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[160px] rounded-full" />
                <div className="absolute bottom-[5%] left-[20%] w-[40%] h-[40%] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            {/* 1. HERO SECTION - Statement-driven, Editorial spacing */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <Layers className="w-3 h-3 text-teal-400" />
                    <span className="text-caption text-teal-400/80">Introduction</span>
                </div>

                <h1 className="text-h1 mb-8">
                    The Statement of Proof.
                </h1>

                <p className="text-body max-w-2xl mx-auto px-8">
                    Legacy professional credentials rely on social trust. ChainVolio operates on cryptographic truth. We transition from arbitrary promises to a foundational trust layer of verifiable, on-chain architecture.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* 2. THE THRESHOLD - Problem vs Solution (Quiet Comparison) */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* The Old Way */}
                    <div className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/20 transition-all duration-500">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500/40" />
                                    <span className="text-caption text-red-500/40 font-bold">The Vulnerability</span>
                                </div>
                                <h2 className="text-h2">Paper Credentials.</h2>
                                <p className="text-body">
                                    Legacy professional records are static, unanchored artifacts. They lack cryptographic guarantees, are prone to manipulation, and offer no structural accountability.
                                </p>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "Unverifiable professional assertions",
                                    "Static records lacking cryptographic ownership",
                                    "Zero structural accountability",
                                    "High entropy in professional validation"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/20 group-hover:text-white/40 transition-colors">
                                        <CircleDashed className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                        <span className="text-body text-inherit">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* The ChainVolio Way - Calm Confidence */}
                    <div className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-500 shadow-[0_20px_50px_rgba(16,185,129,0.05)]">
                        {/* Subtle inner glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
                        
                        <div className="space-y-6 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                                    <span className="text-caption text-teal-400">The Standard</span>
                                </div>
                                <h2 className="text-h2">On-Chain Reality.</h2>
                                <p className="text-body text-white/60">
                                    ChainVolio establishes a permanent trust infrastructure for work history. Every milestone is a gas-backed cryptographic receipt, anchored to public ledger finality.
                                </p>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "Cryptographic provenance of all professional output",
                                    "On-chain anchoring of proof-of-work (PoW)",
                                    "Consensus-backed professional attestations",
                                    "Auditable integrity for institutional actors"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/90">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <span className="text-body text-inherit font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-[1240px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* 3. CORE PRINCIPLES - Grid without Card Heavy Design */}
            <section className="relative z-40 py-24 px-8 max-w-[1240px] mx-auto w-full">
                <div className="max-w-xl mb-16">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-teal-400" />
                        <h2 className="text-h2">Designed for Substance.</h2>
                    </div>
                    <p className="text-body">
                        ChainVolio is architected for transparency. We eliminate the noise of legacy recruitment systems to focus exclusively on public auditability and verified professional output.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-x-16 gap-y-16">
                    {[
                        {
                            title: "Absolute Provenance",
                            icon: <ShieldCheck className="w-5 h-5" />,
                            desc: "Solana coordinates the professional ledger. Every milestone is timestamped and anchored with economic finality, creating an immutable career registry."
                        },
                        {
                            title: "Signal Priority",
                            icon: <BarChart3 className="w-5 h-5" />,
                            desc: "We prioritize verifiable accomplishments over titles. Institutional records and network-backed proofs allow talent to be audited with crystalline clarity."
                        },
                        {
                            title: "Institutional Trust",
                            icon: <Lock className="w-5 h-5" />,
                            desc: "Our attestation protocol enables projects to endorse performance cryptographically. This is not a social referral; it is an on-chain verification anchored by gas-backed finality."
                        },
                        {
                            title: "Permissionless Identity",
                            icon: <Cpu className="w-5 h-5" />,
                            desc: "Your professional identity is wallet-native and sovereign. Built on open cryptographic standards, it functions as a global trust layer without institutional intermediaries."
                        }
                    ].map((card, i) => (
                        <div key={i} className="group p-8 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.1] transition-all duration-500">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                                {card.icon}
                            </div>
                            <h3 className="text-h3 mb-2 flex items-center gap-2">
                                {card.title}
                                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                            </h3>
                            <p className="text-body group-hover:text-white/50 transition-colors duration-500">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="max-w-[1240px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* 4. THE COMPARISON - Understated Table */}
            <section className="relative z-40 py-24 px-8 max-w-[1000px] mx-auto w-full">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <BarChart3 className="w-5 h-5 text-teal-400" />
                        <h2 className="text-h2">The Calibration</h2>
                    </div>
                    <p className="text-caption text-white/30">Truth vs Fabrication</p>
                </div>

                <div className="p-4 md:p-8 rounded-[32px] bg-white/[0.01] border border-white/5 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                    
                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-white/[0.03]">
                                {[
                                    ["Data Layer", "Legacy Data Architecture", "Public Ledger Infrastructure"],
                                    ["Verification Protocol", "Manual Outreach & Social Trust", "Cryptographically Verifiable in Real Time"],
                                    ["Validation Logic", "Subjective / Unverified", "Algorithmic / Secure"],
                                    ["Data Integrity", "Temporary / Volatile", "Permanent / Immutable"],
                                    ["Interoperability", "Systemic Isolation", "Universal Wallet-Native ID"]
                                ].map((row, i) => (
                                    <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="py-6 text-caption text-white/20 group-hover:text-white/40 transition-colors">{row[0]}</td>
                                        <td className="py-6 text-body text-white/20 text-center">{row[1]}</td>
                                        <td className="py-6 text-body text-white text-right">
                                            <div className="inline-flex items-center justify-end gap-3 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 transition-all group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                {row[2]}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-12">
                        {[
                            ["Data Layer", "Legacy Data Architecture", "Public Ledger Infrastructure"],
                            ["Verification Protocol", "Manual Outreach & Social Trust", "Cryptographically Verifiable in Real Time"],
                            ["Validation Logic", "Subjective / Unverified", "Algorithmic / Secure"],
                            ["Data Integrity", "Temporary / Volatile", "Permanent / Immutable"],
                            ["Interoperability", "Systemic Isolation", "Universal Wallet-Native ID"]
                        ].map((row, i) => (
                            <div key={i} className="space-y-4 break-words">
                                <div className="text-caption text-emerald-400/60 uppercase tracking-[0.3em] text-[10px]">{row[0]}</div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Legacy</div>
                                        <div className="text-sm text-white/40">{row[1]}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                                        <div className="text-[10px] uppercase tracking-widest text-emerald-400/40 mb-1">ChainVolio</div>
                                        <div className="text-sm text-white flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            {row[2]}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* 5. CLOSING STATEMENT - Pure Typography */}
            <section className="relative z-40 py-40 px-8 text-center overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-emerald-500/[0.02] blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <div className="flex flex-col items-center gap-6 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-teal-400 shadow-2xl">
                            <ExternalLink className="w-8 h-8" />
                        </div>
                        <h2 className="text-h1 flex flex-col items-center">
                            <span className="text-white">Evidence is the</span>
                            <span className="text-white">New Authority.</span>
                        </h2>
                    </div>
                    <p className="text-body text-xl max-w-xl mx-auto">
                        Integrate with the foundational layer where professional reputation requires no external explanation.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
