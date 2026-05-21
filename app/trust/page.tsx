"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
    Shield, 
    Lock, 
    AlertTriangle, 
    Fingerprint, 
    Database, 
    Share2, 
    ShieldAlert,
    Cpu,
    CheckCircle2,
    XCircle,
    ArrowUpRight
} from "lucide-react";

export default function TrustPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-amber-500/30 selection:text-white pb-20 bg-black theme-bg-page theme-aware">
            {/* Refined noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] -left-[5%] w-[40%] h-[40%] bg-white/[0.01] blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] -right-[5%] w-[35%] h-[35%] bg-white/[0.01] blur-[120px] rounded-full" />
            </div>

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <Shield className="w-3 h-3 text-white/40" />
                    <span className="text-caption text-amber-200/60">Trust Architecture</span>
                </div>

                <h1 className="text-h1 mb-8">
                    Trust Model & Guarantees
                </h1>

                <p className="text-body text-xl max-w-3xl mx-auto italic">
                    “ChainVolio is engineered under a zero-trust assumption. Trust is not granted; it is enforced.”
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* Content Sections */}
            <section className="relative z-40 py-24 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* What We Enforce */}
                    <div className="space-y-10 group/section">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <h2 className="text-h2">What We Enforce</h2>
                            </div>
                            <p className="text-body">Hard invariants built into the core protocol and database.</p>
                        </div>
                        <div className="grid gap-4">
                            {[
                                { title: "Verification", icon: <Fingerprint className="w-4 h-4" />, text: "Cryptographic verification for all state changes via wallet signatures." },
                                { title: "Immutability", icon: <Database className="w-4 h-4" />, text: "Immutable professional history once attested or snapshotted." },
                                { title: "Sovereignty", icon: <Share2 className="w-4 h-4" />, text: "Non-custodial identity ownership. You own the keys, you own the data." },
                                { title: "Isolation", icon: <Shield className="w-4 h-4" />, text: "Recruiter data isolation by default through strict RLS policies." }
                            ].map((item, i) => (
                                <article key={i} className="relative h-full flex flex-col p-8 rounded-[32px] bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden group/card">
                                    <div className="flex gap-4 items-start">
                                        <div className="p-2 rounded-lg bg-white/[0.03] text-white/30 group-hover/card:text-white/60 group-hover/card:bg-white/[0.06] transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-caption mb-1.5 flex items-center gap-2">
                                                {item.title}
                                                <CheckCircle2 className="w-3 h-3 text-white/25" />
                                            </h3>
                                            <p className="text-body group-hover/card:text-white/60 transition-colors">{item.text}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* What We Do Not Promise */}
                    <div className="space-y-10 group/section">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <h2 className="text-h2 opacity-40">Platform Boundaries</h2>
                            </div>
                            <p className="text-body opacity-40">Calculated limits of the current architecture.</p>
                        </div>
                        <div className="grid gap-4">
                            {[
                                { title: "Absolute Security", icon: <AlertTriangle className="w-4 h-4" />, text: "No software system is immune to all vectors. We build for resilience, not perfection." },
                                { title: "Zero Risk", icon: <Cpu className="w-4 h-4" />, text: "Market and technological risks are inherent to any Web3-native infrastructure." },
                                { title: "Centralized Recovery", icon: <XCircle className="w-4 h-4" />, text: "Non-custodial design. If you lose access to your wallet, the platform cannot restore it." }
                            ].map((item, i) => (
                                <article key={i} className="relative h-full flex flex-col p-8 rounded-[32px] bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden group/card">
                                    <div className="flex gap-4 items-start opacity-40 group-hover/card:opacity-90 transition-opacity">
                                        <div className="p-2 rounded-lg bg-amber-500/5 text-amber-400/60 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-caption mb-1.5">{item.title}</h3>
                                            <p className="text-body">{item.text}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing Line */}
            <section className="relative z-40 py-40 px-8 text-center border-t border-white/5 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-white/[0.01] blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <div className="flex flex-col items-center gap-6 mb-4">
                        <div className="bg-black rounded-2xl overflow-hidden border border-white/[0.05] shadow-2xl relative group p-4">
                            <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/40 shadow-2xl">
                                <Shield className="w-8 h-8" />
                            </div>
                        </div>
                        <h2 className="text-h1 flex flex-col items-center">
                            <span className="text-white">Security is Not a Feature.</span>
                            <span className="text-white">It Is a System Property.</span>
                        </h2>
                    </div>
                    <p className="text-body text-xl max-w-xl mx-auto italic">
                        Engineered for Verifiable Careers.
                    </p>
                    <div className="pt-8">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white/60 hover:text-white transition-all cursor-default">
                            <ArrowUpRight className="w-5 h-5 text-white/40" />
                            <span className="text-caption text-inherit">Built on Solana</span>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
