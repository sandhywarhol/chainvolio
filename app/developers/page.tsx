"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, ShieldAlert, Cpu, CheckCircle2, Zap, Target, Gauge, MousePointer2 } from "lucide-react";
import Link from "next/link";

export default function DevelopersPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white font-sans">
            <Navbar />

            {/* Subtle background atmosphere - Matching Why page minimalism */}
            <div className="absolute top-0 left-0 right-0 h-[800px] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-white/[0.03] blur-[120px] rounded-full" />
            </div>

            {/* 1. HERO - The Statement */}
            <section className="relative z-40 pt-32 pb-16 px-6 md:px-8 max-w-6xl mx-auto w-full">
                <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-indigo-400">Developer Portal</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-6">
                        One API call.<br />Know who to trust.
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light tracking-tight max-w-2xl mb-8">
                        ChainVolio turns fragmented Web3 experience into a <span className="text-white/80 font-medium">verifiable reputation signal</span>. Integrate crystalline trust into your application in minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link 
                            href="/api-docs#get-key" 
                            className="w-full sm:w-auto px-10 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group"
                        >
                            Get API Key
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            href="/api-docs" 
                            className="w-full sm:w-auto px-10 py-4 bg-white/[0.03] text-white/60 font-bold rounded-xl border border-white/10 hover:bg-white/[0.08] hover:text-white transition-all flex items-center justify-center"
                        >
                            View Docs
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. PROBLEM SECTION - The Tension */}
            <section className="relative z-40 py-20 px-6 md:px-8 max-w-6xl mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-red-500/60 mb-2 block">The Context</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tighter mb-6 max-w-md">
                            Hiring and trust in Web3 is broken.
                        </h2>
                        <div className="space-y-6">
                            {[
                                { title: "Claims vs Reality", desc: "Anyone can claim experience. Proving it requires deep technical audit of fragmented on-chain data." },
                                { title: "Zero Reliability", desc: "Legacy profiles lack cryptographic guarantees. Social trust is easily manipulated." },
                                { title: "Manual Inefficiency", desc: "Evaluating professional background manually is slow, expensive, and scales poorly." }
                            ].map((point, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 flex-shrink-0">
                                        <ShieldAlert className="w-5 h-5 text-red-500/40" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white/90 mb-1">{point.title}</h4>
                                        <p className="text-sm text-white/40 leading-relaxed font-light max-w-sm">{point.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-10 bg-red-500/5 blur-[80px] rounded-full" />
                        <div className="relative p-8 bg-slate-900/40 border border-white/5 rounded-[40px] space-y-4">
                            <div className="h-2 w-24 bg-red-500/20 rounded-full" />
                            <div className="h-2 w-48 bg-white/5 rounded-full" />
                            <div className="h-2 w-32 bg-white/5 rounded-full" />
                            <div className="pt-8 text-[11px] font-mono text-red-500/40 uppercase tracking-widest">Legacy Validation: Error-Prone</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SOLUTION - The Resolution */}
            <section className="relative z-40 py-20 px-6 md:px-8 max-w-6xl mx-auto w-full text-center">
                <div className="max-w-3xl mx-auto space-y-4">
                    <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-teal-400 mb-2 block">The Solution</span>
                    <h2 className="text-4xl md:text-6xl font-bold font-display text-white tracking-tighter">ChainVolio fixes this.</h2>
                    <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed tracking-tight">
                        We transform fragmented work history into a <span className="text-white/80">verifiable score</span> layered with confidence and trust metrics. We do the audit, so you can do the building.
                    </p>
                </div>
            </section>

            {/* 4. BEFORE vs AFTER - Direct Comparison */}
            <section className="relative z-40 py-20 px-6 md:px-8 max-w-6xl mx-auto w-full">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Before */}
                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[32px] space-y-4">
                        <h3 className="text-sm font-bold text-white/20 uppercase tracking-[0.3em]">The Old Way</h3>
                        <div className="space-y-4">
                            {[
                                "Read CV manually (subjective)",
                                "Verify signatures manually (slow)",
                                "Uncertain levels of trust (risky)"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3 text-white/30 text-lg font-light">
                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* After */}
                    <div className="p-8 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-[32px] space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-24 h-24 text-indigo-400" />
                        </div>
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-[0.3em]">The ChainVolio Way</h3>
                        <div className="space-y-4 relative z-10">
                            {[
                                "Call single API endpoint",
                                "Get scored data instantly",
                                "Make high-confidence decisions"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3 text-white/90 text-lg font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. DIFFERENTIATION - Value Metrics */}
            <section className="relative z-40 py-20 px-6 md:px-8 max-w-6xl mx-auto w-full">
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tighter">More than just a score.</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: <Target className="w-8 h-8 text-purple-400" />, title: "Reputation Score", text: "Quantitative performance measurement based on verifiable on-chain output." },
                        { icon: <Gauge className="w-8 h-8 text-blue-400" />, title: "Confidence Level", text: "Measurement of data reliability and verification depth. Know when the score is absolute." },
                        { icon: <Zap className="w-8 h-8 text-teal-400" />, title: "Trust Score", text: "A decision-ready metric optimized for immediate application logic." }
                    ].map((item, i) => (
                        <div key={i} className="space-y-3 group">
                            <div className="transition-transform group-hover:scale-110 duration-500">{item.icon}</div>
                            <h4 className="text-lg font-bold text-white tracking-tight">{item.title}</h4>
                            <p className="text-sm text-white/30 font-light leading-relaxed">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. SIMPLE FLOW - Visualization */}
            <section className="relative z-40 py-20 px-6 md:px-8 max-w-4xl mx-auto w-full text-center">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-full hidden md:flex">
                    <div className="text-xs font-bold uppercase tracking-widest text-white/40">User Wallet</div>
                    <ArrowRight className="w-4 h-4 text-white/10" />
                    <div className="text-xs font-bold uppercase tracking-widest text-white">ChainVolio API</div>
                    <ArrowRight className="w-4 h-4 text-white/10" />
                    <div className="text-xs font-bold uppercase tracking-widest text-teal-400">Verifiable Signal</div>
                    <ArrowRight className="w-4 h-4 text-white/10" />
                    <div className="text-xs font-bold uppercase tracking-widest text-white/40">Your Application</div>
                </div>
                {/* Mobile version */}
                <div className="md:hidden space-y-4">
                    {["User Wallet", "ChainVolio API", "Verifiable Signal", "Your Application"].map((text, i) => (
                        <div key={i} className={`p-4 border border-white/5 rounded-xl ${i===2 ? 'text-teal-400' : 'text-white/40'}`}>
                            {text}
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. REAL USE - Implementation */}
            <section className="relative z-40 py-20 px-6 md:px-8 max-w-3xl mx-auto w-full overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.02] blur-[100px] pointer-events-none" />
                <div className="relative text-center space-y-6">
                    <div className="space-y-2">
                        <span className="text-[11px] uppercase tracking-[0.4em] font-medium text-indigo-400">Integration</span>
                        <h3 className="text-3xl font-bold font-display text-white tracking-tight">One line of logic.</h3>
                    </div>
                    <div className="p-6 md:p-8 bg-[#0b0f1a] border border-white/10 rounded-[24px] font-mono text-xl md:text-2xl text-indigo-300 text-left shadow-2xl">
                        <span className="text-white/20">if (</span>
                        <span className="text-indigo-400">trust_score</span>
                        <span className="text-white/20"> &gt; </span>
                        <span className="text-teal-400">70</span>
                        <span className="text-white/20">) </span>
                        <span className="text-indigo-400">approveUser()</span>
                    </div>
                    <p className="text-white/30 font-light tracking-tight max-w-lg mx-auto">
                        Focus your development resources on your core product. We provide the truth layer that powers it.
                    </p>
                </div>
            </section>

            {/* 8. CTA - The Closing */}
            <section className="relative z-40 pt-16 pb-32 px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h2 className="text-4xl md:text-7xl font-bold font-display text-white tracking-tighter leading-[0.85]">
                        Start building<br />with trust.
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/api-docs#get-key" className="px-10 py-5 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-200 transition-all shadow-2xl shadow-white/5">
                            Get API Key
                        </Link>
                        <Link href="/api-docs" className="px-10 py-5 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                            View Docs
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
