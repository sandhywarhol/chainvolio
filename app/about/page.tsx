"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
            {/* Very subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-teal-400/60">Platform Mission</span>
                </div>

                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    The Web3 Standard for Professional Identity.
                </h1>

                <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto font-light tracking-tight px-8">
                    ChainVolio is a primitive for professional trust, designed to make careers verifiable, portable, and owned by the individual builder.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* Content Sections */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-x-24 gap-y-24">

                    {/* What is Chainvolio */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">01. Definition</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">What Is ChainVolio?</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio is a Web3-native CV and portfolio platform. It allows professionals to bind their work history, evidence of output, and peer attestations to a wallet address through an on-chain timestamp.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            Traditional CVs are static PDFs. Links can be edited, records can be lost, and verification in a remote ecosystem is often slow and manual. ChainVolio solves this by creating a permanent, public, and shareable record of professional milestones that remains verified by the blockchain.
                        </p>
                    </div>

                    {/* Why Chainvolio Exists */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">02. Purpose</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Why We Exist.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Web3 hiring is uniquely challenging. Teams are global, often remote, and builders frequently operate under pseudonymous identities. In this environment, trust cannot rely on institutional credentials alone.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            We believe trust should be built on signals over time. ChainVolio provides the neutral infrastructure to capture these signals, serving as the standard CV format for a decentralized workforce that values proof of work above all else.
                        </p>
                    </div>

                    {/* What It Is and Is Not */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">03. Framework</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Scope and Limitations.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            It is important to understand what ChainVolio is and is not. ChainVolio records professional claims made by users. We do not act as a recruiter, employer, or judge of professional performance.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            The platform provides objective on-chain data proving when a claim was made. While peer attestations provide additional signals of trust, they are pointers of verification, not absolute guarantees of truth. The responsibility for final evaluation always remains with the hiring party.
                        </p>
                    </div>

                    {/* Who Is Behind Chainvolio */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">04. The Core</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Behind the Project.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio is an independent, builder-led project. I come from a background in the creative industry and the Web3 ecosystem, with a deep interest in decentralized identity and the future of work.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            This is a long-term vision. We are committed to a community-driven direction and are always open to collaboration with other builders who share the goal of creating a better way to hire and be hired in Web3.
                        </p>
                    </div>

                    {/* Vision */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">05. The Goal</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Long-Term Vision.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Our goal is for a ChainVolio profile to become the default professional link in Web3. When someone says "drop your CV," we want that to mean sharing your verified on-chain history.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            We are building toward open standards, interoperability, and a future where every professional owns their career data permanently. No tokens, no NFTs: just pure infrastructure for professional identity.
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">06. Connection</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Get in Touch.</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <a href="mailto:sandhywarhol@gmail.com" className="p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                <span className="block text-[10px] uppercase tracking-widest text-white/20 mb-2">Email / Partnerships</span>
                                <span className="text-white/60 text-base font-light font-display tracking-tight">sandhywarhol@gmail.com</span>
                            </a>
                            <div className="grid grid-cols-2 gap-4">
                                <a href="https://x.com/chainvolio" target="_blank" rel="noopener noreferrer" className="p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                    <span className="block text-[10px] uppercase tracking-widest text-white/20 mb-2">X / Twitter</span>
                                    <span className="text-white/60 text-base font-light font-display tracking-tight">@chainvolio</span>
                                </a>
                                <div className="p-6 border border-white/5 bg-white/[0.01] cursor-not-allowed opacity-50">
                                    <span className="block text-[10px] uppercase tracking-widest text-white/20 mb-2">GitHub</span>
                                    <span className="text-white/60 text-base font-light font-display tracking-tight">Source</span>
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
