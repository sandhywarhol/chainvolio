"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
    ShieldCheck, 
    BarChart3, 
    PieChart, 
    Activity, 
    Search, 
    Target, 
    Database, 
    Fingerprint, 
    Layers,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";
import Link from "next/link";

export default function ScreeningGuide() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-blue-500/30 selection:text-white">
            {/* noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] -left-[5%] w-[45%] h-[45%] bg-blue-500/[0.04] blur-[140px] rounded-full" />
                <div className="absolute bottom-[20%] -right-[5%] w-[40%] h-[40%] bg-emerald-500/[0.04] blur-[140px] rounded-full" />
            </div>

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <PieChart className="w-3 h-3 text-blue-400" />
                    <span className="text-caption text-blue-400/80">Screening Protocol</span>
                </div>
                
                <h1 className="text-h1 mb-8">
                    Evaluation Engine.
                </h1>
                
                <p className="text-body text-xl max-w-3xl mx-auto italic">
                    Efficient evaluation of Web3 talent requires a shift from credentials to contributions. Use high-density signals to identify elite output with cryptographic certainty.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* Content Section */}
            <section className="relative z-40 pb-32 px-8">
                <div className="max-w-[1240px] mx-auto space-y-32">
                    
                    {/* Core Principles */}
                    <div className="grid lg:grid-cols-2 gap-12 pt-24">
                        <div className="group space-y-10 p-8 rounded-3xl bg-white/[0.01] border border-white/[0.03] hover:border-emerald-500/20 transition-all duration-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/5 text-emerald-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="text-caption text-emerald-400/80">01 Authority</span>
                            </div>
                            <div className="space-y-6">
                                <p className="text-h2">Prioritize Attested History.</p>
                                <p className="text-body text-lg">Focus on records verified by founders, organizations, or collaborators. These represent social capital anchored in real output and institutional trust.</p>
                                <div className="p-8 bg-black/20 border border-white/[0.05] rounded-2xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl opacity-50 group-hover:bg-emerald-500/10 transition-colors" />
                                    <p className="text-caption text-white/20 mb-4 italic relative z-10">Example Signal</p>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500/40 animate-pulse" />
                                        <p className="text-body font-medium tracking-tight">Attestation from Superteam: "Role, Lead Smart Contract Developer."</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group space-y-10 p-8 rounded-3xl bg-white/[0.01] border border-white/[0.03] hover:border-blue-500/20 transition-all duration-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/5 text-blue-400">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <span className="text-caption text-blue-400/80">02 Substance</span>
                            </div>
                            <div className="space-y-6">
                                <p className="text-h2">Evaluate Work, Not Titles.</p>
                                <p className="text-body text-lg">Web3 roles are fluid. Look for high-frequency contributions and consistency across multiple milestones to identify substance over narrative claims.</p>
                                <div className="p-8 bg-black/20 border border-white/[0.05] rounded-2xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl opacity-50 group-hover:bg-blue-500/10 transition-colors" />
                                    <p className="text-caption text-white/20 mb-4 italic relative z-10">Example Signal</p>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-2 h-2 rounded-full bg-blue-500/40 animate-pulse" />
                                        <p className="text-body font-medium tracking-tight">Timeline Activity: 12 months, 4 projects, 15 verifiable proofs.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interpretation Framework */}
                    <div className="space-y-16 pt-32 border-t border-white/5">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Search className="w-5 h-5 text-blue-400" />
                                <span className="text-caption text-blue-400/80 block">Execution Layer</span>
                            </div>
                            <h3 className="text-h2 mb-4">Signal Interpretation Framework</h3>
                            <p className="text-body text-lg">Use this structured framework to map candidate data points directly to your hiring decision metrics within the recruiter interface.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { 
                                    id: "01",
                                    icon: <Fingerprint className="w-4 h-4" />,
                                    title: "Authority Signal", 
                                    desc: "Prioritize attested history. Focus on records verified by founders, organizations, or collaborators.",
                                    metrics: ["Authority rate", "Institutional trust"]
                                },
                                { 
                                    id: "02",
                                    icon: <TrendingUp className="w-4 h-4" />,
                                    title: "Signal Density", 
                                    desc: "Evaluate consistency of output. Look for multiple proofs and continuous activity over time.",
                                    metrics: ["Signal density", "Proof count", "Timeline activity"]
                                },
                                { 
                                    id: "03",
                                    icon: <Database className="w-4 h-4" />,
                                    title: "Portfolio Authority", 
                                    desc: "Assess quality and credibility of work. Distinguish between attested and non-attested outputs.",
                                    metrics: ["Portfolio authority"]
                                },
                                { 
                                    id: "04",
                                    icon: <Target className="w-4 h-4" />,
                                    title: "Strategic Fit", 
                                    desc: "Match candidate signals with role requirements and contribution relevance.",
                                    metrics: ["Strategic fit"]
                                },
                                { 
                                    id: "05",
                                    icon: <Layers className="w-4 h-4" />,
                                    title: "Confidence Score", 
                                    desc: "Use combined signals to determine hiring confidence (High / Medium / Low).",
                                    metrics: ["Signal confidence indicator"]
                                }
                            ].map((s) => (
                                <div key={s.id} className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-6 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group">
                                    <div className="flex justify-between items-center text-white/20">
                                        <div className="p-2 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.08] group-hover:text-white transition-all">
                                            {s.icon}
                                        </div>
                                        <span className="text-caption">Metric {s.id}</span>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <h4 className="text-caption text-white font-bold tracking-tight flex items-center justify-between">
                                            {s.title}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                                        </h4>
                                        <p className="text-body text-xs font-light">{s.desc}</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/[0.05] space-y-3">
                                        <p className="text-[9px] text-blue-400 opacity-40 uppercase tracking-[0.3em] font-bold">Map To Dashboard:</p>
                                        <ul className="space-y-2">
                                            {s.metrics.map(m => (
                                                <li key={m} className="text-body text-[11px] flex items-center gap-2 font-medium">
                                                    <span className="w-1 h-3 bg-blue-500/20 rounded-full shrink-0 group-hover:bg-blue-500/40 transition-colors" />
                                                    {m}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dashboard Teaser */}
                    <div className="bg-blue-500/[0.02] rounded-[32px] p-12 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-[0_20px_50px_rgba(59,130,246,0.05)]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] opacity-50 group-hover:bg-blue-500/10 transition-all pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 blur-[80px] opacity-50 group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                        
                        <div className="space-y-4 relative z-10 max-w-xl">
                            <h2 className="text-h2">Evaluate Talent with Dashboard <span className="text-blue-400">Metrics.</span></h2>
                            <p className="text-body text-lg">Access deep signal metrics for every applicant in your pipeline and make data-driven decisions.</p>
                        </div>
                        <Link href="/dashboard" className="px-10 py-5 bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 border border-white/10 text-white font-bold uppercase tracking-[0.3em] text-[10px] rounded-2xl flex items-center gap-4 transition-all relative z-10 shadow-2xl">
                            Open Dashboard
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
