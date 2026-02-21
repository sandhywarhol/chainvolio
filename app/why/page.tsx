"use client";

import Link from "next/link";
import { WalletMultiButton } from "@/components/wallet/WalletButton";

export default function WhyPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden selection:bg-teal-500/30 selection:text-white">
            {/* Very subtle noise texture - more refined opacity */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Top Navigation - Consistent with Home */}
            <nav className="flex items-center justify-between px-8 py-3 max-w-[1600px] w-full mx-auto relative z-[100] border-b border-white/5">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-1.5 group">
                        <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-white/90">ChainVolio</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase">
                        <Link href="/why" className="text-white hover:text-white transition-colors normal-case">Why ChainVolio</Link>
                        <Link href="/privacy-policy" className="text-white/40 hover:text-white transition-colors normal-case">Privacy Policy</Link>
                        <Link href="/dashboard" className="text-emerald-500/70 hover:text-emerald-400 transition-colors normal-case">Dashboard</Link>
                    </div>
                </div>
                <WalletMultiButton />
            </nav>

            {/* 1. HERO SECTION - Statement-driven, Editorial spacing */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-teal-400/60">Introduction</span>
                </div>

                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    The Statement of Proof.
                </h1>

                <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto font-light tracking-tight px-8">
                    Traditional credentials are based on trust. ChainVolio is based on truth. We replace promises with verifiable, on-chain evidence.
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
                                Standard CVs and PDFs are static artifacts. They are easily forged, lack context, and offer zero verifiable accountability.
                            </p>
                        </div>
                        <ul className="space-y-6">
                            {[
                                "Unverifiable professional claims",
                                "Static links without proof of ownership",
                                "Zero cryptographic accountability",
                                "High noise-to-signal ratio for hiring"
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
                                ChainVolio creates an immutable record of work. Every entry is a cryptographic receipt, anchored to your wallet and verified by the network.
                            </p>
                        </div>
                        <ul className="space-y-6">
                            {[
                                "Provenance of every contribution",
                                "Cryptographic Proof of Work (PoW)",
                                "Peer-vetted on-chain attestations",
                                "High-density signal for recruiters"
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
                        We removed the fluff of traditional recruitment to focus on the only thing that matters: the work you actually shipped.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-x-16 gap-y-16">
                    {[
                        {
                            title: "Absolute Provenance",
                            desc: "In ChainVolio, the chain is the judge. Every milestone is timestamped and anchored to Solana, creating a permanent, unalterable career ledger."
                        },
                        {
                            title: "Signal Priority",
                            desc: "We prioritize actual accomplishments over titles. Recruiters see your contributions first, allowing talent to speak louder than words."
                        },
                        {
                            title: "Institutional Trust",
                            desc: "Our attestation layer allows projects to verify your work cryptographically. This isn't a referral; it's a signed validation."
                        },
                        {
                            title: "Permissionless Identity",
                            desc: "Your profile is yours. Built on open standards and wallet-based authentication, it functions globally without intermediaries."
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
                                ["Data Layer", "Centralized / Paper", "Decentralized / On-chain"],
                                ["Auditability", "Requires Reference Calls", "Instant & Peer-to-Peer"],
                                ["Trust Model", "Implicit (Assumed)", "Explicit (Verified)"],
                                ["Persistence", "Fragile / Perishable", "Immutable / Permanent"],
                                ["Web3 Compatibility", "None", "Native Wallet Identity"]
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

            <div className="border-t border-white/5 w-full" />

            {/* 5. CLOSING STATEMENT - Pure Typography */}
            <section className="relative z-40 py-40 px-8 text-center bg-black/20">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-5xl md:text-[72px] font-bold tracking-tighter leading-[0.85] flex flex-col items-center">
                        <span className="text-white">Evidence is the</span>
                        <span className="text-white/30">New Authority.</span>
                    </h2>
                    <p className="text-white/30 text-lg md:text-xl font-light tracking-tight max-w-xl mx-auto">
                        Join the professionals who no longer need to explain their work.
                    </p>
                </div>
            </section>

            {/* Footer Area - Minimalist */}
            <footer className="w-full relative z-40 pb-16 pt-16 text-center border-t border-white/5">
                <p className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-medium">
                    ChainVolio Protocol · MMXXVI · Solana Mainnet Native
                </p>
            </footer>
        </main>
    );
}
