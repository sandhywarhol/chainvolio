"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TrustPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-white">
            {/* Refined noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-emerald-400/60">Trust Architecture</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    Trust Model & Guarantees
                </h1>

                <p className="text-lg md:text-2xl text-white/50 leading-relaxed font-light tracking-tight max-w-3xl mx-auto">
                    “ChainVolio is engineered under a zero-trust assumption. Trust is not granted; it is enforced.”
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* Content Sections */}
            <section className="relative z-40 py-24 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid md:grid-cols-2 gap-20">
                    {/* What We Enforce */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white tracking-tight">What We Enforce</h2>
                            <p className="text-sm text-white/30 font-light">Hard invariants built into the core protocol and database.</p>
                        </div>
                        <ul className="space-y-8">
                            {[
                                { title: "Verification", text: "Cryptographic verification for all state changes via wallet signatures." },
                                { title: "Immutability", text: "Immutable professional history once attested or snapshotted." },
                                { title: "Sovereignty", text: "Non-custodial identity ownership. You own the keys, you own the data." },
                                { title: "Isolation", text: "Recruiter data isolation by default through strict RLS policies." }
                            ].map((item, i) => (
                                <li key={i} className="group">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 group-hover:scale-150 transition-transform" />
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">{item.title}</h3>
                                            <p className="text-sm text-white/40 font-light leading-relaxed">{item.text}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What We Do Not Promise */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white tracking-tight text-white/40">What We Do Not Promise</h2>
                            <p className="text-sm text-white/20 font-light">Limits of the system architecture.</p>
                        </div>
                        <ul className="space-y-8">
                            {[
                                { title: "Absolute Security", text: "No software system is immune to all vectors. We build for resilience, not perfection." },
                                { title: "Zero Risk", text: "Market and technological risks are inherent to any Web3-native infrastructure." },
                                { title: "Recovery", text: "Centralized account recovery. If you lose access to your wallet, the platform cannot restore it." }
                            ].map((item, i) => (
                                <li key={i} className="group opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-1 h-[1px] bg-white/20 mt-2.5 group-hover:w-4 transition-all" />
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">{item.title}</h3>
                                            <p className="text-sm text-white/40 font-light leading-relaxed">{item.text}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Closing Line */}
            <section className="relative z-40 py-32 px-8 text-center border-t border-white/5">
                <p className="text-xl md:text-3xl font-display font-medium text-white/80 tracking-tight">
                    “Security is not a feature. It is a system property.”
                </p>
                <div className="mt-8">
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.6em] font-bold">
                        Engineered for Verifiable Careers
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
