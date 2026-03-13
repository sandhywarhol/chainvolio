"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
            {/* Very subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-teal-400/60">Privacy Protocol</span>
                </div>

                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    Ownership of Data.
                </h1>

                <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto font-light tracking-tight px-8">
                    Traditional platforms sell your data. ChainVolio secures it. We focus on transparency, individual ownership, and cryptographic privacy.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* Content Sections */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-x-24 gap-y-16">
                    {/* Introduction */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">01. Introduction</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">The Vision.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio is a Web3-native professional record infrastructure. Our privacy architecture is designed for a wallet-bound identity layer anchoring professional output directly to public blockchain networks. Privacy in this decentralized context operates through transparency and cryptographic ownership.
                        </p>
                    </div>

                    {/* Data We Collect */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">02. Data Processing</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Information we collect.</h2>
                        <p className="text-white/40 font-light leading-relaxed mb-2 text-xs">
                            We process two distinct categories of data:
                        </p>
                        <ul className="space-y-3 text-white/40 font-light text-sm">
                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-teal-500/30" /> <strong>Off-chain Data:</strong> Profile metadata (Bio, Skills) stored in our secure database.</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-teal-500/30" /> <strong>On-chain Data:</strong> Public wallet addresses and cryptographic hashes anchored to the ledger.</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-teal-500/30" /> <strong>Attestations:</strong> Public, immutable work history records confirmed on the blockchain.</li>
                            <li className="flex items-center gap-2 font-bold italic text-white/20 underline decoration-teal-500/20">On-chain records cannot be altered or deleted once confirmed by the network.</li>
                        </ul>
                    </div>

                    {/* What we don't collect */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-red-500/40 font-bold">03. The Threshold</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">What we never see.</h2>
                        <p className="text-white/40 font-light leading-relaxed mb-4">
                            ChainVolio is architected as a non-custodial infrastructure. We have zero access to your private credentials or financial assets.
                        </p>
                        <ul className="grid grid-cols-2 gap-4">
                            {["Private Keys", "Seed Phrases", "Wallet Signing", "Asset Assets"].map((item) => (
                                <li key={item} className="p-3 border border-white/5 bg-white/[0.01] text-[10px] uppercase tracking-widest font-bold text-white/20 text-center">
                                    {item} NO ACCESS
                                </li>
                            ))}
                        </ul>
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2">Users are solely responsible for wallet security and key management.</p>
                    </div>

                    {/* Usage */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">04. Application</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">How we use data.</h2>
                        <ul className="space-y-4">
                            {[
                                { title: "Public Ledger Display", desc: "Projecting your professional profile as part of a transparent, auditable professional ledger." },
                                { title: "Verification Protocol", desc: "Facilitating user-initiated blockchain transactions for attestations and milestones." },
                                { title: "Infrastructure Optimization", desc: "Analyzing anonymized diagnostic data to ensure the reliability of the trust layer. We do not sell personal data." }
                            ].map((item, i) => (
                                <li key={i} className="group">
                                    <h4 className="text-sm font-bold text-white/60 mb-1">{item.title}</h4>
                                    <p className="text-xs text-white/30 font-light leading-relaxed">{item.desc}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* User Control */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">05. Sovereignty</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Your Control.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            You govern your professional identity via wallet-based authentication. While you may modify or remove off-chain profile data at any time, on-chain transactions and hashes remain a permanent part of the public infrastructure.
                        </p>
                    </div>

                    {/* Security */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">06. Safeguards</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Security & Storage.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            We implement industry-standard safeguards for off-chain storage. Data anchored to the blockchain is secured by the underlying public network architecture. ChainVolio does not control or manage independent third-party wallet providers.
                        </p>
                    </div>

                    {/* Third Parties */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">07. Ecosystem</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Third Parties.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            We interact with sovereign wallet providers and public blockchain nodes to facilitate secure authentication. These third-party services operate independently of the ChainVolio infrastructure.
                        </p>
                    </div>

                    {/* Updates */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">08. Governance</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Policy Updates.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Updates to this policy apply prospectively as the infrastructure evolves. Continued interaction with the system constitutes acceptance of the current privacy standards.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
