"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SourcingGuide() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-white">
            {/* noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-emerald-400/60">Recruiter Guide</span>
                </div>
                
                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    Sourcing Architecture.
                </h1>
                
                <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto font-light tracking-tight px-8">
                    Eliminate the friction of static files. Request live, verified links to capture higher signal talent in the Web3 ecosystem.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* Content Section */}
            <section className="relative z-40 pb-32 px-8">
                <div className="max-w-[1240px] mx-auto space-y-32">
                    
                    {/* The Shift & Operational Value */}
                    <div className="grid lg:grid-cols-2 gap-24 pt-24">
                        <div className="space-y-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/60 font-bold">The Strategic Shift</span>
                            <div className="space-y-6">
                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm group hover:border-white/10 transition-colors">
                                    <p className="text-[10px] text-white/20 uppercase mb-4 tracking-[0.2em] font-bold">Traditional Query</p>
                                    <p className="text-lg text-white/40 font-light italic">"Please attach your CV as a PDF."</p>
                                </div>
                                <div className="p-8 bg-emerald-400/[0.03] border border-emerald-400/10 rounded-sm group hover:border-emerald-400/20 transition-colors">
                                    <p className="text-[10px] text-emerald-400/40 uppercase mb-4 tracking-[0.2em] font-bold">Native Query</p>
                                    <p className="text-lg text-emerald-400/90 font-medium">"Drop your ChainVolio link."</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Operational Value</span>
                            <div className="space-y-8">
                                <div className="flex gap-6 group">
                                    <span className="text-emerald-400/40 font-black text-xl">/</span>
                                    <div className="space-y-2">
                                        <h4 className="text-white/90 font-bold tracking-tight text-lg">Instant Verification</h4>
                                        <p className="text-sm text-white/40 leading-relaxed font-light tracking-tight">Direct access to verified work history without the need for platform logins or manual background checks.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 group">
                                    <span className="text-emerald-400/40 font-black text-xl">/</span>
                                    <div className="space-y-2">
                                        <h4 className="text-white/90 font-bold tracking-tight text-lg">Unified Signal</h4>
                                        <p className="text-sm text-white/40 leading-relaxed font-light tracking-tight">A consolidated view of portfolio assets, GitHub repositories, and direct peer proof in a single interface.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 group">
                                    <span className="text-emerald-400/40 font-black text-xl">/</span>
                                    <div className="space-y-2">
                                        <h4 className="text-white/90 font-bold tracking-tight text-lg">Global Screening</h4>
                                        <p className="text-sm text-white/40 leading-relaxed font-light tracking-tight">Screen for global, remote pipelines with high-density professional data that bypasses geographic barriers.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How to Source Section */}
                    <div className="space-y-16 pt-32 border-t border-white/5">
                        <div className="max-w-2xl">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/60 font-bold mb-6 block">Workflow Framework</span>
                            <h3 className="text-4xl font-bold text-white tracking-tighter mb-4 font-display">How to Source with ChainVolio</h3>
                            <p className="text-white/40 font-light tracking-tight text-lg">Follow this structured approach to transform your recruitment from narrative-based to signal-based.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { step: "01", title: "Define Signal, Not CV", desc: "Shift from resumes to verifiable signals such as on-chain work, GitHub activity, and attestations." },
                                { step: "02", title: "Create Hiring Link", desc: "Create a role-specific hiring link with defined requirements and signal expectations inside your dashboard." },
                                { step: "03", title: "Ask for ChainVolio Link", desc: "Standardize your outreach by replacing 'Send your CV' with 'Drop your ChainVolio link' in all job descriptions." },
                                { step: "04", title: "Evaluate Real Work", desc: "Review verified history, contributions, and attestations instead of relying on self-claimed experience." },
                                { step: "05", title: "Hire with Confidence", desc: "Make final decisions based on transparent, verifiable data instead of assumptions or narrative bias." }
                            ].map((s) => (
                                <div key={s.step} className="p-8 bg-white/[0.02] border border-white/5 rounded-sm space-y-4 hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Step {s.step}</span>
                                        <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold uppercase text-white/90 mb-2 tracking-tight">{s.title}</h4>
                                        <p className="text-xs text-white/40 leading-relaxed font-light tracking-tight">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-emerald-500/5 rounded-sm p-12 border border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl opacity-50 group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-2xl font-bold text-white tracking-tight">Ready to capture high-signal talent?</h3>
                            <p className="text-white/40 font-light tracking-tight">Start creating your first verified hiring link today.</p>
                        </div>
                        <Link href="/hiring/create" className="px-8 py-4 hiring-glossy-button text-white font-bold rounded-xl flex items-center gap-3 group relative z-10">
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
