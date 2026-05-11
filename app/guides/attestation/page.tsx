"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
    ShieldCheck, 
    Activity, 
    Wallet, 
    Fingerprint, 
    Zap, 
    Workflow, 
    Shield, 
    ArrowUpRight, 
    Search,
    CheckCircle,
    Cpu,
    Lock
} from "lucide-react";

export default function AttestationGuide() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-white bg-black theme-bg-page theme-aware">
            {/* noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[12%] -left-[5%] w-[40%] h-[40%] bg-emerald-500/[0.03] blur-[130px] rounded-full" />
                <div className="absolute bottom-[25%] -right-[5%] w-[35%] h-[35%] bg-blue-500/[0.03] blur-[130px] rounded-full" />
            </div>

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <Fingerprint className="w-3 h-3 text-emerald-400" />
                    <span className="text-caption text-emerald-400/80">Proof Standards</span>
                </div>
                
                <h1 className="text-h1 mb-8">
                    Cryptographic Trust.
                </h1>
                
                <p className="text-body text-xl max-w-3xl mx-auto italic">
                    Cryptographic validation of professional experience in a decentralized market. Eliminate unverified narrative claims with foundational on-chain professional proof.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* Content Section */}
            <section className="relative z-40 pb-32 px-8">
                <div className="max-w-[1240px] mx-auto space-y-32">
                    
                    {/* Definitions & Insights */}
                    <div className="grid lg:grid-cols-2 gap-12 pt-24">
                        <div className="space-y-10 group/section">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-emerald-400" />
                                <span className="text-caption text-emerald-400/80">The Attestation Primitive</span>
                            </div>
                            <div className="space-y-8 p-8 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-emerald-500/10 transition-all duration-500">
                                <p className="text-h2">Defining Proof.</p>
                                <p className="text-body text-lg italic font-medium">An attestation is a verifiable work record confirmed by a secondary party via blockchain-anchored data.</p>
                                <p className="text-body">It represents a shift from personal claims to peer-verified signals, creating a decentralized trust layer that is portable, interoperable, and publicly auditable across the Solana ecosystem and beyond.</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-blue-400" />
                                <span className="text-caption text-blue-400/80">Recruiter Insights</span>
                            </div>
                            <div className="p-10 bg-white/[0.02] border border-white/[0.03] rounded-2xl space-y-12 relative overflow-hidden group shadow-[0_10px_40px_rgba(16,185,129,0.02)]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl opacity-50 group-hover:bg-emerald-500/10 transition-all" />
                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-end border-b border-white/[0.05] pb-6">
                                        <div className="space-y-3">
                                            <span className="text-caption text-white/20 italic">Signal Type</span>
                                            <p className="text-h3 text-emerald-400">Attested Output</p>
                                        </div>
                                        <ShieldCheck className="w-8 h-8 text-emerald-500/40 group-hover:text-emerald-500/80 transition-all" />
                                    </div>
                                    <p className="text-body italic group-hover:text-white/60 transition-colors">"Attestation-based screening eliminates the guesswork and noise that typically complicates early-stage recruitment in Web3, providing an immediate trust baseline."</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How It Works Workflow */}
                    <div className="space-y-16 pt-32 border-t border-white/5">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Workflow className="w-5 h-5 text-emerald-400" />
                                <span className="text-caption text-emerald-400/80 block">Attestation Path</span>
                            </div>
                            <h3 className="text-h2 mb-4">How Attestation Works</h3>
                            <p className="text-body text-lg">Follow the cryptographic journey of a professional record from creation to permanent on-chain anchoring.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {[
                                { step: "01", icon: <Cpu className="w-5 h-5" />, title: "Create Proof", desc: "Candidate creates a verifiable work record inside ChainVolio." },
                                { step: "02", icon: <Fingerprint className="w-5 h-5" />, title: "Generate Link", desc: "System generates a unique, shareable verification link with cryptographic seeds." },
                                { step: "03", icon: <Workflow className="w-5 h-5" />, title: "Send to Verifier", desc: "Candidate sends the link to a trusted party (founder, client, or manager)." },
                                { step: "04", icon: <ShieldCheck className="w-5 h-5" />, title: "Issue Proof", desc: "Verifier reviews and confirms the work record directly via a secure interface." },
                                { step: "05", icon: <Lock className="w-5 h-5" />, title: "Anchor On-Chain", desc: "The attestation is permanently recorded on-chain as immutable professional proof." }
                            ].map((s) => (
                                <div key={s.step} className="p-8 bg-white/[0.01] border border-white/[0.03] rounded-2xl flex flex-col gap-8 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group">
                                    <div className="flex justify-between items-center text-emerald-400/20">
                                        <div className="p-3 rounded-xl bg-emerald-500/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all">
                                            {s.icon}
                                        </div>
                                        <span className="text-caption">Step {s.step}</span>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-caption text-white font-bold tracking-tight flex items-center justify-between">
                                            {s.title}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                                        </h4>
                                        <p className="text-body text-xs font-medium">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Sections Grid */}
                    <div className="grid lg:grid-cols-2 gap-12 pt-32 border-t border-white/5">
                        <div className="space-y-10">
                            <div className="flex items-center gap-3">
                                <Wallet className="w-5 h-5 text-emerald-400" />
                                <span className="text-caption text-emerald-400/80">Verification Economics</span>
                            </div>
                            <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.03] group hover:border-emerald-500/20 transition-all duration-500">
                                <div className="flex gap-8 group items-start">
                                    <div className="space-y-4 pt-1">
                                        <p className="text-h2">The Verifier-Pays Model.</p>
                                        <div className="space-y-6">
                                            <p className="text-body">Attestations are paid by the verifier (not the candidate). This creates a strong signal of internal trust and professional commitment while eliminating inflationary endorsements.</p>
                                            <div className="p-8 bg-black/20 border border-white/[0.05] rounded-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl opacity-50" />
                                                <p className="text-body italic relative z-10 text-[13px]">"This economic barrier ensures attestations are meaningful and effectively prevents spam endorsements from polluting the network."</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-blue-400" />
                                <span className="text-caption text-blue-400/80">Universal Audit</span>
                            </div>
                            <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.03] group hover:border-blue-500/20 transition-all duration-500">
                                <div className="flex gap-8 group items-start">
                                    <div className="space-y-6 pt-1">
                                        <p className="text-h2">Professional Accountability.</p>
                                        <div className="space-y-6">
                                            <p className="text-body">Eliminates fake or inflated portfolios by anchoring outputs to a cryptographic professional audit trail managed by legitimate market actors.</p>
                                            <p className="text-body">Converts unverified claims into verifiable professional signals, enabling trust without narrative CV dependency or centralized hub verification.</p>
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
