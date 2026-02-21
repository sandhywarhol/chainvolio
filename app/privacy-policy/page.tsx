"use client";

import Link from "next/link";
import { WalletMultiButton } from "@/components/wallet/WalletButton";

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden selection:bg-teal-500/30 selection:text-white">
            {/* Very subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Top Navigation */}
            <nav className="flex items-center justify-between px-8 py-3 max-w-[1600px] w-full mx-auto relative z-[100] border-b border-white/5">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-1.5 group">
                        <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-white/90">ChainVolio</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase">
                        <Link href="/why" className="text-white/40 hover:text-white transition-colors normal-case">Why ChainVolio</Link>
                        <Link href="/privacy-policy" className="text-white hover:text-white transition-colors normal-case">Privacy Policy</Link>
                        <Link href="/dashboard" className="text-emerald-500/70 hover:text-emerald-400 transition-colors normal-case">Dashboard</Link>
                    </div>
                </div>
                <WalletMultiButton />
            </nav>

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-teal-400/60">Privacy Protocol</span>
                </div>

                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    Ownership of Data.
                </h1>

                <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto font-light tracking-tight px-8">
                    Traditional platforms sell your data. ChainVolio secures it. We focus on transparency, individual ownership, and cryptographic privacy.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* Content Sections */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-x-24 gap-y-16">
                    {/* Introduction */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">01. Introduction</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">The Vision.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio is a Web3-native CV and portfolio platform built to empower talent through verifiable proof of work. Our privacy approach is anchored in the principles of decentralization and user sovereignty.
                        </p>
                    </div>

                    {/* Data We Collect */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">02. Data Processing</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Information we collect.</h2>
                        <ul className="space-y-3 text-white/40 font-light text-sm">
                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-teal-500/30" /> Public wallet addresses linked to your profile</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-teal-500/30" /> Professional information you explicitly provide (CV, Work, Bio)</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-teal-500/30" /> On-chain attestations and verified milestones</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-teal-500/30" /> Basic diagnostic metadata to improve platform stability</li>
                        </ul>
                    </div>

                    {/* What we don't collect */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-red-500/40 font-bold">03. The Threshold</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">What we never see.</h2>
                        <p className="text-white/40 font-light leading-relaxed mb-4">
                            As a non-custodial platform, we prioritize your security by never interacting with sensitive credentials.
                        </p>
                        <ul className="grid grid-cols-2 gap-4">
                            {["Private Keys", "Seed Phrases", "Wallet Balances", "Asset Values"].map((item) => (
                                <li key={item} className="p-3 border border-white/5 bg-white/[0.01] text-[10px] uppercase tracking-widest font-bold text-white/20 text-center">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Usage */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">04. Application</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">How we use data.</h2>
                        <ul className="space-y-4">
                            {[
                                { title: "Visibility", desc: "Displaying your verified profile to recruiters and potential collaborators." },
                                { title: "Verification", desc: "Showcasing attested proof of work linked to your unique wallet identity." },
                                { title: "Evolution", desc: "Analyzing usage patterns to refine the hiring dashboard and peer review systems." }
                            ].map((item, i) => (
                                <li key={i} className="group">
                                    <h4 className="text-sm font-bold text-white/60 mb-1">{item.title}</h4>
                                    <p className="text-xs text-white/30 font-light leading-relaxed">{item.desc}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* User Control */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">05. Sovereignty</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Your Control.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            You are the sole owner of your professional identity. You can update, modify, or remove your profile information at any time through your authenticated wallet.
                        </p>
                    </div>

                    {/* Security */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">06. Safeguards</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Security & Storage.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            We utilize industry-standard cryptographic practices and secure database environments. No sensitive wallet credentials or production secrets are ever stored on our servers.
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* Updates & Third Party */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid md:grid-cols-2 gap-16">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Third-Party Verification</h3>
                        <p className="text-sm text-white/30 font-light leading-relaxed">
                            We interact with wallet providers (like Phantom or Solflare) and blockchain nodes to facilitate secure authentication and data retrieval. These services operate under their own independent privacy standards.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Policy Updates</h3>
                        <p className="text-sm text-white/30 font-light leading-relaxed">
                            As the ChainVolio protocol evolves, this policy may be updated to reflect new features or security standards. The latest version will always be anchored to this permanent URL.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full relative z-40 pb-16 pt-16 text-center border-t border-white/5">
                <p className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-medium">
                    ChainVolio Utility · Identity Protocol · Solana Network
                </p>
            </footer>
        </main>
    );
}
