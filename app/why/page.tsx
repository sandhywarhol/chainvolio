"use client";

import Link from "next/link";
import { WalletMultiButton } from "@/components/wallet/WalletButton";

export default function WhyPage() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Top Navigation */}
            <nav className="flex items-center justify-between px-8 py-3 max-w-[1600px] w-full mx-auto relative z-[100] border-b border-white/5">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-1.5 group">
                        <img src="/chainvolio logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-white/90">chainvolio</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase">
                        <Link href="/" className="text-white/40 hover:text-white/90 transition-colors">Home</Link>
                        <Link href="/why" className="text-white/90 transition-colors">Why ChainVolio</Link>
                        <Link href="/dashboard" className="text-white/40 hover:text-white/90 transition-colors">Dashboard</Link>
                    </div>
                </div>
                <WalletMultiButton />
            </nav>

            {/* 1. HERO SECTION */}
            <section className="relative z-40 py-16 px-8 max-w-[1240px] mx-auto w-full text-center border-b border-white/5">
                <div className="max-w-3xl mx-auto space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-white">
                        Why ChainVolio?
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-white/90 font-display">
                        Because Web3 careers deserve proof, not promises.
                    </p>
                    <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto italic font-light">
                        ChainVolio replaces traditional CVs, PDFs, and unverifiable claims with trusted, on-chain proof of work.
                    </p>
                </div>
            </section>

            {/* 2. PROBLEM VS SOLUTION */}
            <section className="relative z-40 py-16 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                    {/* Traditional Hiring (Problem) */}
                    <div className="bg-black/20 backdrop-blur-sm border border-white/5 p-8 rounded-2xl space-y-6">
                        <h2 className="text-2xl font-bold text-white/40 tracking-tight uppercase">Traditional Hiring</h2>
                        <ul className="space-y-6">
                            {[
                                "CVs can be faked or exaggerated",
                                "GitHub links lack context",
                                "No verifiable contribution history",
                                "Recruiters waste time filtering noise"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-white/40">
                                    <span className="text-red-500/50 mt-1">✕</span>
                                    <span className="text-lg">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ChainVolio (Solution) */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/30 to-blue-500/30 rounded-2xl blur opacity-100 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl space-y-6 h-full shadow-2xl">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent tracking-tight uppercase">ChainVolio</h2>
                            <ul className="space-y-6">
                                {[
                                    "On-chain activity as proof",
                                    "Verifiable work history & receipts",
                                    "Signal-based evaluation",
                                    "Faster, trustless hiring"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-white">
                                        <span className="text-teal-400 mt-1">✓</span>
                                        <span className="text-lg font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. WHAT MAKES CHAINVOLIO DIFFERENT */}
            <section className="relative z-40 py-16 px-8 max-w-[1240px] mx-auto w-full">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-white tracking-tight">Different by Design</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            title: "Verifiable by Design",
                            desc: "Work history anchored on-chain. Immutable and timestamped."
                        },
                        {
                            title: "Signal > Credentials",
                            desc: "Focus on what was built, contributed, and shipped — not age, gender, or degrees."
                        },
                        {
                            title: "Faster Hiring",
                            desc: "Recruiters see real signals instantly, reducing low-quality applications."
                        },
                        {
                            title: "Built for Global Web3",
                            desc: "Wallet-based identity. Remote-first. Permissionless."
                        }
                    ].map((card, i) => (
                        <div
                            key={i}
                            className="bg-white/[0.03] backdrop-blur-sm border border-white/10 p-6 rounded-xl hover:-translate-y-1 hover:shadow-xl hover:bg-white/[0.05] transition-all duration-300 group"
                        >
                            <h3 className="text-lg font-bold text-white mb-3 tracking-tight group-hover:text-teal-400 transition-colors">{card.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed font-light">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. FOR TALENT / FOR RECRUITERS */}
            <section className="relative z-40 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-[1240px] mx-auto grid md:grid-cols-2 divide-x divide-white/5">
                    {/* For Talent */}
                    <div className="p-10 space-y-6">
                        <h2 className="text-2xl font-bold text-white tracking-tight">For Talent</h2>
                        <ul className="space-y-4">
                            {[
                                "Own your on-chain career",
                                "Share one trusted portfolio link",
                                "Build reputation across projects",
                                "No need to oversell yourself"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Recruiters */}
                    <div className="p-10 space-y-6">
                        <h2 className="text-2xl font-bold text-white tracking-tight">For Recruiters</h2>
                        <ul className="space-y-4">
                            {[
                                "Filter by real on-chain signal",
                                "Reduce spam and noise",
                                "Verify contributions before interviews",
                                "Hire faster with confidence"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 5. MINI COMPARISON TABLE */}
            <section className="relative z-40 py-16 px-8 max-w-[1000px] mx-auto w-full">
                <h2 className="text-2xl font-bold text-center mb-8 text-white">The Comparison</h2>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-md">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="p-6 text-sm font-bold uppercase tracking-wider text-white/60">Feature</th>
                                <th className="p-6 text-sm font-bold uppercase tracking-wider text-white/60">Traditional CV</th>
                                <th className="p-6 text-sm font-bold uppercase tracking-wider text-teal-400">ChainVolio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                ["Verifiable history", "No", "Yes (On-chain)"],
                                ["Editable past", "Yes", "No"],
                                ["Proof of contribution", "Weak", "Strong"],
                                ["Global & permissionless", "No", "Yes"],
                                ["Built for Web3", "No", "Yes"]
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6 text-white/80 font-medium">{row[0]}</td>
                                    <td className="p-6 text-white/40">{row[1]}</td>
                                    <td className="p-6 text-white font-semibold">{row[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 6. CLOSING STATEMENT */}
            <section className="relative z-40 py-20 px-8 text-center bg-gradient-to-b from-transparent to-teal-500/5">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                            In Web3, your work is public. <br />
                            <span className="text-white/40">Your career should be too.</span>
                        </h2>
                    </div>

                </div>
            </section>

            {/* Footer Area */}
            <div className="w-full relative z-40 pb-12 border-t border-white/5 pt-12 text-center bg-black/20">
                <p className="text-xs text-white/20 uppercase tracking-[0.2em]">
                    ChainVolio · Built for the Future of Work
                </p>
            </div>
        </main>
    );
}
