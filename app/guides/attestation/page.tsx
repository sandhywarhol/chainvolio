"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Activity, Wallet } from "lucide-react";

export default function AttestationGuide() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#07070B] selection:bg-emerald-500/30 selection:text-white">
            {/* noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-emerald-400/60">Proof Standards</span>
                </div>
                
                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    Cryptographic Trust.
                </h1>
                
                <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-3xl mx-auto font-light tracking-tight px-8">
                    Cryptographic validation of professional experience in a decentralized market. Eliminate unverified narrative claims with foundational on-chain professional proof.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* Content Section */}
            <section className="relative z-40 pb-32 px-8">
                <div className="max-w-[1240px] mx-auto space-y-32">
                    
                    {/* Definitions & Insights */}
                    <div className="grid lg:grid-cols-2 gap-24 pt-24">
                        <div className="space-y-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/60 font-bold">The Attestation Primitive</span>
                            <div className="space-y-8">
                                <p className="text-3xl font-bold tracking-tight text-white/90">Defining Proof.</p>
                                <p className="text-lg text-white/40 leading-relaxed font-light font-medium italic tracking-tight">An attestation is a verifiable work record confirmed by a secondary party via blockchain-anchored data.</p>
                                <p className="text-base text-white/60 leading-relaxed font-light tracking-tight">It represents a shift from personal claims to peer-verified signals, creating a decentralized trust layer that is portable, interoperable, and publicly auditable across the Solana ecosystem and beyond.</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-blue-400/60 font-bold">Recruiter Insights</span>
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-sm space-y-12 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl opacity-50 group-hover:bg-emerald-500/10 transition-colors" />
                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-end border-b border-white/10 pb-6">
                                        <div className="space-y-3">
                                            <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black italic">Signal Type</span>
                                            <p className="text-xl text-emerald-400 font-bold tracking-tight">Attested Output</p>
                                        </div>
                                        <ShieldCheck className="w-8 h-8 text-emerald-500/40 group-hover:text-emerald-500/60 transition-colors" />
                                    </div>
                                    <p className="text-sm text-white/40 leading-relaxed font-light italic tracking-tight">"Attestation-based screening eliminates the guesswork and noise that typically complicates early-stage recruitment in Web3, providing an immediate trust baseline."</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How It Works Workflow */}
                    <div className="space-y-16 pt-32 border-t border-white/5">
                        <div className="max-w-2xl">
                            <span className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.4em] mb-6 block">Attestation Path</span>
                            <h3 className="text-4xl font-bold text-white mb-4 tracking-tighter font-display">How Attestation Works</h3>
                            <p className="text-white/40 font-light tracking-tight text-lg leading-relaxed">Follow the cryptographic journey of a professional record from creation to permanent on-chain anchoring.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {[
                                { step: "01", title: "Create Proof", desc: "Candidate creates a verifiable work record inside ChainVolio." },
                                { step: "02", title: "Generate Link", desc: "System generates a unique, shareable verification link with cryptographic seeds." },
                                { step: "03", title: "Send to Verifier", desc: "Candidate sends the link to a trusted party (founder, client, or manager)." },
                                { step: "04", title: "Issue Proof", desc: "Verifier reviews and confirms the work record directly via a secure interface." },
                                { step: "05", title: "Anchor On-Chain", desc: "The attestation is permanently recorded on-chain as immutable professional proof." }
                            ].map((s) => (
                                <div key={s.step} className="p-8 bg-white/[0.02] border border-white/5 rounded-sm space-y-6 hover:border-white/10 transition-all group">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Step {s.step}</span>
                                        <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full group-hover:bg-emerald-500 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[12px] font-bold uppercase text-white/90 leading-snug tracking-tight">{s.title}</h4>
                                        <p className="text-[11px] text-white/40 leading-relaxed font-light tracking-tight">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Sections Grid */}
                    <div className="grid lg:grid-cols-2 gap-24 pt-32 border-t border-white/5">
                        <div className="space-y-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/60 font-bold">Verification Economics</span>
                            <div className="space-y-12">
                                <div className="flex gap-8 group items-start">
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 shrink-0">
                                        <Wallet className="w-6 h-6 text-emerald-400/60 shadow-lg shadow-emerald-500/10 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                    <div className="space-y-4 pt-1">
                                        <p className="text-2xl font-bold text-white/90 tracking-tight">The Verifier-Pays Model.</p>
                                        <div className="space-y-6 font-display">
                                            <p className="text-[15px] text-white/40 leading-relaxed font-light tracking-tight">Attestations are paid by the verifier (not the candidate). This creates a strong signal of internal trust and professional commitment while eliminating inflationary endorsements.</p>
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm">
                                                <p className="text-[11px] text-white/50 leading-relaxed font-light italic tracking-tight">"This economic barrier ensures attestations are meaningful and effectively prevents spam endorsements from polluting the network."</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-blue-400/60 font-bold">Universal Audit</span>
                            <div className="space-y-12">
                                <div className="flex gap-8 group items-start">
                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 shrink-0">
                                        <Activity className="w-6 h-6 text-blue-400/60 shadow-lg shadow-blue-500/10 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <div className="space-y-4 pt-1">
                                        <p className="text-2xl font-bold text-white/90 tracking-tight">Professional Accountability.</p>
                                        <div className="space-y-6">
                                            <p className="text-[15px] text-white/50 tracking-tight leading-relaxed font-light">Eliminates fake or inflated portfolios by anchoring outputs to a cryptographic professional audit trail managed by legitimate market actors.</p>
                                            <p className="text-[15px] text-white/50 tracking-tight leading-relaxed font-light">Converts unverified claims into verifiable professional signals, enabling trust without narrative CV dependency or centralized hub verification.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
