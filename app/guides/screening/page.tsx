"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function ScreeningGuide() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#07070B] selection:bg-blue-500/30 selection:text-white">
            {/* noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-blue-400/60">Screening Protocol</span>
                </div>
                
                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    Evaluation Engine.
                </h1>
                
                <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-3xl mx-auto font-light tracking-tight px-8">
                    Efficient evaluation of Web3 talent requires a shift from credentials to contributions. Use high-density signals to identify elite output with cryptographic certainty.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* Content Section */}
            <section className="relative z-40 pb-32 px-8">
                <div className="max-w-[1240px] mx-auto space-y-32">
                    
                    {/* Core Principles */}
                    <div className="grid lg:grid-cols-2 gap-24 pt-24">
                        <div className="space-y-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/60 font-bold">01 Authority</span>
                            <div className="space-y-6">
                                <p className="text-3xl font-bold tracking-tight text-white/90">Prioritize attested history.</p>
                                <p className="text-lg text-white/40 leading-relaxed font-light tracking-tight">Focus on records verified by founders, organizations, or collaborators. These represent social capital anchored in real output and institutional trust.</p>
                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm relative group overflow-hidden">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl opacity-50 group-hover:bg-emerald-500/10 transition-colors" />
                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mb-4 italic relative z-10">Example Signal</p>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400/40" />
                                        <p className="text-base text-white/70 font-medium tracking-tight">Attestation from Superteam: "Role, Lead Smart Contract Developer."</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-blue-400/60 font-bold">02 Substance</span>
                            <div className="space-y-6">
                                <p className="text-3xl font-bold tracking-tight text-white/90">Evaluate work, not titles.</p>
                                <p className="text-lg text-white/40 leading-relaxed font-light tracking-tight">Web3 roles are fluid. Look for high-frequency contributions and consistency across multiple milestones to identify substance over narrative claims.</p>
                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm relative group overflow-hidden">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl opacity-50 group-hover:bg-blue-500/10 transition-colors" />
                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mb-4 italic relative z-10">Example Signal</p>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <BarChart3 className="w-5 h-5 text-blue-400/40" />
                                        <p className="text-base text-white/70 font-medium tracking-tight">Timeline Activity: 12 months, 4 projects, 15 verifiable proofs.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interpretation Framework */}
                    <div className="space-y-16 pt-32 border-t border-white/5">
                        <div className="max-w-2xl">
                            <span className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.4em] mb-6 block">Execution Layer</span>
                            <h3 className="text-4xl font-bold text-white mb-4 tracking-tighter font-display">Signal Interpretation Framework</h3>
                            <p className="text-white/40 font-light tracking-tight text-lg leading-relaxed">Use this structured framework to map candidate data points directly to your hiring decision metrics within the recruiter interface.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { 
                                    id: "01",
                                    title: "Authority Signal (Trust Layer)", 
                                    desc: "Prioritize attested history. Focus on records verified by founders, organizations, or collaborators.",
                                    metrics: ["Authority rate", "Institutional trust"]
                                },
                                { 
                                    id: "02",
                                    title: "Signal Density (Consistency)", 
                                    desc: "Evaluate consistency of output. Look for multiple proofs and continuous activity over time.",
                                    metrics: ["Signal density", "Proof count", "Timeline activity"]
                                },
                                { 
                                    id: "03",
                                    title: "Portfolio Authority (Depth)", 
                                    desc: "Assess quality and credibility of work. Distinguish between attested and non-attested outputs.",
                                    metrics: ["Portfolio authority"]
                                },
                                { 
                                    id: "04",
                                    title: "Strategic Fit (Context Match)", 
                                    desc: "Match candidate signals with role requirements and contribution relevance.",
                                    metrics: ["Strategic fit"]
                                },
                                { 
                                    id: "05",
                                    title: "Confidence Score (Decision Layer)", 
                                    desc: "Use combined signals to determine hiring confidence (High / Medium / Low).",
                                    metrics: ["Signal confidence indicator"]
                                }
                            ].map((s) => (
                                <div key={s.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-sm space-y-6 hover:border-white/10 transition-all group">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Metric {s.id}</span>
                                        <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full group-hover:bg-emerald-500 transition-colors" />
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase text-white/90 tracking-tight">{s.title}</h4>
                                        <p className="text-[11px] text-white/40 leading-relaxed font-light tracking-tight">{s.desc}</p>
                                        <div className="pt-4 border-t border-white/5 space-y-3">
                                            <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to Dashboard:</p>
                                            <ul className="space-y-2">
                                                {s.metrics.map(m => (
                                                    <li key={m} className="text-[10px] text-white/60 flex items-center gap-2 font-medium tracking-tight">
                                                        <span className="w-1 h-1 bg-white/20 rounded-full shrink-0 group-hover:bg-white/40 transition-colors" />
                                                        {m}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dashboard Teaser */}
                    <div className="bg-blue-500/5 rounded-sm p-12 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl opacity-50 group-hover:bg-blue-500/10 transition-colors" />
                        <div className="space-y-2 relative z-10">
                            <h2 className="text-3xl font-bold text-white tracking-tighter">Evaluate talent with dashboard metrics.</h2>
                            <p className="text-white/40 font-light tracking-tight text-lg">Access deep signal metrics for every applicant in your pipeline.</p>
                        </div>
                        <Link href="/dashboard" className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl flex items-center gap-3 transition-all relative z-10 text-[11px] uppercase tracking-widest">
                            Open Dashboard
                            <BarChart3 className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
