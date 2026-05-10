"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
    ArrowRight, 
    ShieldAlert, 
    Cpu, 
    CheckCircle2, 
    Zap, 
    Target, 
    Gauge, 
    MousePointer2,
    AlertCircle,
    Terminal,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function DevelopersPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-white font-sans bg-black">
            <Navbar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] -left-[5%] w-[45%] h-[45%] bg-indigo-500/[0.03] blur-[150px] rounded-full" />
                <div className="absolute bottom-[15%] -right-[5%] w-[40%] h-[40%] bg-teal-500/[0.03] blur-[150px] rounded-full" />
            </div>

            {/* 1. HERO - The Statement */}
            <section className="relative z-40 pt-32 pb-16 px-6 md:px-8 max-w-6xl mx-auto w-full text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-4">
                        <Cpu className="w-3 h-3 text-indigo-400" />
                        <span className="text-caption text-indigo-400/80">Developer Portal</span>
                    </div>
                    
                    <h1 className="text-h1 mb-6">
                        One API Call.<br /><span className="text-white">Know Who to Trust.</span>
                    </h1>
                    
                    <p className="text-body text-xl italic mb-8 max-w-2xl mx-auto">
                        ChainVolio turns fragmented Web3 experience into a <span className="text-white/80 font-medium">verifiable reputation signal</span>. Integrate crystalline trust into your application in minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href="/api-docs#get-key" 
                            className="w-full sm:w-auto px-10 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group text-caption !text-slate-950"
                        >
                            Get API Key
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            href="/api-docs" 
                            className="w-full sm:w-auto px-10 py-4 bg-white/[0.03] text-white/60 font-bold rounded-xl border border-white/10 hover:bg-white/[0.08] hover:text-white transition-all flex items-center justify-center text-caption"
                        >
                            View Docs
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. PROBLEM SECTION - The Tension */}
            <section className="relative z-40 py-20 px-6 md:px-8 max-w-6xl mx-auto w-full border-t border-white/[0.03]">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <AlertCircle className="w-5 h-5 text-red-500/60" />
                            <span className="text-caption text-red-500/60 font-bold">The Context</span>
                        </div>
                        <h2 className="text-h1 !text-4xl text-left md:text-5xl mb-8 max-w-md">
                            Hiring and Trust in Web3 Is Broken.
                        </h2>
                        <div className="space-y-4">
                            {[
                                { title: "Claims vs Reality", desc: "Anyone can claim experience. Proving it requires deep technical audit of fragmented on-chain data." },
                                { title: "Zero Reliability", desc: "Legacy profiles lack cryptographic guarantees. Social trust is easily manipulated." },
                                { title: "Manual Inefficiency", desc: "Evaluating professional background manually is slow and scales poorly." }
                            ].map((point, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] group hover:bg-red-500/[0.02] hover:border-red-500/10 transition-all">
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0">
                                            <ShieldAlert className="w-5 h-5 text-red-500/40 group-hover:text-red-500/60 transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-caption text-white font-bold mb-1">{point.title}</h4>
                                            <p className="text-body group-hover:text-white/50">{point.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-10 bg-red-500/5 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-12 bg-black border border-white/[0.05] rounded-2xl space-y-6 shadow-2xl">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-amber-400/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-2 w-24 bg-red-500/20 rounded-full animate-pulse" />
                                <div className="h-2 w-48 bg-white/[0.03] rounded-full" />
                                <div className="h-2 w-32 bg-white/[0.03] rounded-full" />
                                <div className="h-2 w-56 bg-white/[0.03] rounded-full" />
                            </div>
                            <div className="pt-8 flex items-center justify-between">
                                <span className="text-caption !text-[8px] opacity-40 font-mono">LEGACY_STATE: ERROR</span>
                                <ShieldAlert className="w-5 h-5 text-red-500/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SOLUTION - The Resolution */}
            <section className="relative z-40 py-24 px-6 md:px-8 max-w-6xl mx-auto w-full text-center border-t border-white/[0.03]">
                <div className="max-w-3xl mx-auto space-y-6 group">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-teal-400" />
                        <span className="text-caption text-teal-400">The Solution</span>
                    </div>
                    <h2 className="text-h1 !text-4xl md:!text-[64px]">ChainVolio Fixes This.</h2>
                    <p className="text-body text-xl italic opacity-60">
                        "We transform fragmented work history into a verifiable score layered with confidence and trust metrics. We do the audit, so you can do the building."
                    </p>
                </div>
            </section>

            {/* 4. BEFORE vs AFTER - Direct Comparison */}
            <section className="relative z-40 py-20 px-6 md:px-8 max-w-6xl mx-auto w-full border-t border-white/[0.03]">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Before */}
                    <div className="p-10 bg-white/[0.01] border border-white/[0.03] rounded-2xl space-y-8 group">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-white/20" />
                            <h3 className="text-caption text-white/20">The Old Way</h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                "Read CV manually (subjective)",
                                "Verify signatures manually (slow)",
                                "Uncertain trust (reactive)"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-4 text-body italic opacity-40">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* After */}
                    <div className="p-10 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-2xl space-y-8 relative overflow-hidden group shadow-[0_20px_50px_rgba(79,70,229,0.05)]">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-32 h-32 text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <Zap className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-caption text-indigo-400">The ChainVolio Way</h3>
                        </div>
                        <div className="space-y-6 relative z-10">
                            {[
                                "Call single API endpoint",
                                "Get scored data instantly",
                                "High-confidence decisions"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-4 text-body font-bold group/item">
                                    <div className="p-1 rounded-full bg-indigo-500/20 text-indigo-400 group-hover/item:bg-indigo-50 group-hover/item:text-white transition-all">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. DIFFERENTIATION - Value Metrics */}
            <section className="relative z-40 py-24 px-6 md:px-8 max-w-6xl mx-auto w-full border-t border-white/[0.03]">
                <div className="text-center mb-16">
                    <h2 className="text-h1 !text-4xl md:!text-[56px]">More Than Just a Score.</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: <Target className="w-8 h-8 text-indigo-400" />, title: "Reputation Score", text: "Quantitative performance measurement based on verifiable on-chain output." },
                        { icon: <Gauge className="w-8 h-8 text-teal-400" />, title: "Confidence Level", text: "Measurement of data reliability and verification depth. Know when to trust." },
                        { icon: <Zap className="w-8 h-8 text-indigo-400" />, title: "Trust Score", text: "A decision-ready metric optimized for immediate application logic." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.03] group hover:border-indigo-500/20 transition-all duration-500">
                            <div className="p-4 rounded-2xl bg-white/[0.02] w-fit mb-8 group-hover:bg-indigo-500/10 transition-colors">
                                {item.icon}
                            </div>
                            <h4 className="text-caption text-white font-bold mb-4">{item.title}</h4>
                            <p className="text-body group-hover:text-white/50">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. SIMPLE FLOW - Visualization */}
            <section className="relative z-40 py-20 px-6 md:px-8 max-w-[1240px] mx-auto w-full text-center border-t border-white/[0.03]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 p-10 bg-white/[0.01] border border-white/[0.03] rounded-2xl hidden md:flex shadow-2xl">
                    <div className="flex flex-col items-center gap-4 group">
                         <div className="p-3 rounded-xl bg-white/[0.03] group-hover:bg-white/10 transition-colors">
                            <MousePointer2 className="w-5 h-5 text-white/40" />
                         </div>
                         <span className="text-caption text-white/20">User Wallet</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/10" />
                    <div className="flex flex-col items-center gap-4 group">
                         <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                            <Cpu className="w-5 h-5 text-indigo-400" />
                         </div>
                         <span className="text-caption text-white/60">ChainVolio API</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/10" />
                    <div className="flex flex-col items-center gap-4 group">
                         <div className="p-3 rounded-xl bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors">
                            <Zap className="w-5 h-5 text-teal-400" />
                         </div>
                         <span className="text-caption text-teal-400">Verifiable Signal</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/10" />
                    <div className="flex flex-col items-center gap-4 group">
                         <div className="p-3 rounded-xl bg-white/[0.03] group-hover:bg-white/10 transition-colors">
                            <Target className="w-5 h-5 text-white/40" />
                         </div>
                         <span className="text-caption text-white/20">Application Logic</span>
                    </div>
                </div>
            </section>

            {/* 7. REAL USE - Implementation */}
            <section className="relative z-40 py-24 px-6 md:px-8 max-w-4xl mx-auto w-full">
                <div className="p-12 md:p-16 bg-white/[0.01] border border-white/[0.03] rounded-2xl relative overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10 text-center space-y-12">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <Terminal className="w-5 h-5 text-indigo-400" />
                                <span className="text-caption text-indigo-400/80">Integration</span>
                            </div>
                            <h3 className="text-h1 !text-4xl md:!text-5xl">One Line of Logic.</h3>
                        </div>
                        <div className="p-8 md:p-12 bg-black border border-white/[0.05] rounded-2xl font-mono text-xl md:text-3xl text-indigo-300 text-left relative group/code overflow-hidden shadow-2xl">
                             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                            <span className="text-white/20 italic">if (</span>
                            <span className="text-indigo-400 font-bold">trust_score</span>
                            <span className="text-white/20"> &gt; </span>
                            <span className="text-teal-400 font-black">70</span>
                            <span className="text-white/20">) </span>
                            <span className="text-indigo-400 font-bold">approveUser()</span>
                        </div>
                        <p className="text-body text-lg italic opacity-40">
                            "Focus your development resources on your core product. We provide the truth layer that powers it."
                        </p>
                    </div>
                </div>
            </section>

            {/* 8. CTA - The Closing */}
            <section className="relative z-40 pt-16 pb-32 px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-h1 !text-5xl md:!text-[88px]">
                        Start Building<br /><span className="text-white/20">with Trust.</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/api-docs#get-key" className="px-12 py-5 bg-white text-slate-950 rounded-2xl hover:bg-indigo-50 transition-all shadow-2xl shadow-white/5 text-caption !text-slate-950 font-bold">
                            Get API Key
                        </Link>
                        <Link href="/api-docs" className="px-12 py-5 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-caption font-bold">
                            View Docs
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
