"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
    ShieldCheck,
    ArrowRight,
    Briefcase,
    Zap,
    Activity,
    Workflow,
    Target,
    Link2,
    Search,
    CheckCircle,
    Layers,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function SourcingGuide() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-amber-500/30 selection:text-white bg-black theme-bg-page theme-aware">
            {/* noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[15%] -left-[10%] w-[45%] h-[45%] bg-white/[0.015] blur-[140px] rounded-full" />
                <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-white/[0.01] blur-[140px] rounded-full" />
            </div>

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] mb-8">
                    <Briefcase className="w-3 h-3 text-white/40" />
                    <span className="text-caption text-amber-200/60">Recruiter Guide</span>
                </div>

                <h1 className="text-h1 mb-8">
                    Sourcing Architecture.
                </h1>

                <p className="text-body text-xl max-w-2xl mx-auto px-8">
                    Eliminate the friction of static files. Request live, verified links to capture higher signal talent in the Web3 ecosystem.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* Content Section */}
            <section className="relative z-40 pb-32 px-8">
                <div className="max-w-[1240px] mx-auto space-y-32">

                    {/* The Shift & Operational Value */}
                    <div className="grid lg:grid-cols-2 gap-12 pt-24">
                        <div className="space-y-10">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-white/40" />
                                <span className="text-caption text-amber-200/60">The Strategic Shift</span>
                            </div>
                            <div className="space-y-6">
                                <div className="p-8 bg-white/[0.01] border border-white/[0.03] rounded-2xl group hover:border-white/10 transition-all duration-500">
                                    <p className="text-caption text-white/20 mb-4">Traditional Query</p>
                                    <p className="text-body italic">"Please attach your CV as a PDF."</p>
                                </div>
                                <div className="p-8 bg-white/[0.02] border border-white/[0.08] rounded-2xl group hover:border-white/20 transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] blur-2xl rounded-full" />
                                    <div className="relative z-10">
                                        <p className="text-caption text-amber-200/60 mb-4 flex items-center gap-2">
                                            Native Query
                                            <Link2 className="w-3 h-3" />
                                        </p>
                                        <p className="text-h3 text-amber-200/60">"Drop your ChainVolio link."</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-white/40" />
                                <span className="text-caption text-white/40">Operational Value</span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    {
                                        title: "Instant Verification",
                                        desc: "Direct access to verified work history without the need for platform logins or manual background checks.",
                                        icon: <CheckCircle className="w-5 h-5" />
                                    },
                                    {
                                        title: "Unified Signal",
                                        desc: "A consolidated view of portfolio assets, GitHub repositories, and direct peer proof in a single interface.",
                                        icon: <Layers className="w-5 h-5" />
                                    },
                                    {
                                        title: "Global Screening",
                                        desc: "Screen for global, remote pipelines with high-density professional data that bypasses geographic barriers.",
                                        icon: <Search className="w-5 h-5" />
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 p-6 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/25 group-hover:text-white/60 group-hover:scale-110 transition-all">
                                            {item.icon}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-h3 text-white/90">{item.title}</h4>
                                            <p className="text-body">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* How to Source Section */}
                    <div className="space-y-16 pt-32 border-t border-white/5">
                        <div className="max-w-2xl">
                            <span className="text-caption text-amber-200/60 mb-6 block">Workflow Framework</span>
                            <h3 className="text-h2 mb-4">How to Source with ChainVolio</h3>
                            <p className="text-body text-lg">Follow this structured approach to transform your recruitment from narrative-based to signal-based.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { step: "01", title: "Define Signal, Not CV", desc: "Shift from resumes to verifiable signals such as on-chain work, GitHub activity, and attestations." },
                                { step: "02", title: "Create Hiring Link", desc: "Create a role-specific hiring link with defined requirements and signal expectations inside your dashboard." },
                                { step: "03", title: "Ask for ChainVolio Link", desc: "Standardize your outreach by replacing 'Send your CV' with 'Drop your ChainVolio link' in all job descriptions." },
                                { step: "04", title: "Evaluate Real Work", desc: "Review verified history, contributions, and attestations instead of relying on self-claimed experience." },
                                { step: "05", title: "Hire with Confidence", desc: "Make final decisions based on transparent, verifiable data instead of assumptions or narrative bias." }
                            ].map((s) => (
                                <div key={s.step} className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-caption text-white/20">Step {s.step}</span>
                                        <div className="w-1.5 h-1.5 bg-white/25 rounded-full" />
                                    </div>
                                    <div>
                                        <h4 className="text-caption text-white font-bold mb-2">{s.title}</h4>
                                        <p className="text-body text-xs">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-white/[0.02] rounded-2xl p-12 border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl opacity-50 group-hover:bg-white/[0.04] transition-colors" />
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-h2 !text-2xl">Ready to capture high-signal talent?</h3>
                            <p className="text-body">Start creating your first verified hiring link today.</p>
                        </div>
                        <Link href="/hiring/create" className="px-8 py-4 hiring-glossy-button text-white font-bold rounded-xl flex items-center gap-3 group relative z-10 transition-all uppercase tracking-widest text-[10px]">
                            Create Hiring Link
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
