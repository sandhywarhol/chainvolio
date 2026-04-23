"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">

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
                            ChainVolio is a Web3-native professional trust infrastructure. It enables professionals, peers, and recruiters to record verifiable career milestones as permanent on-chain transactions.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            Traditional CVs are static PDFs. Links can be edited, records can be lost, and verification in a remote ecosystem is slow and manual. ChainVolio replaces this fragile model with cryptographic proof.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            Instead of relying on editable claims, work history, attestations, and hiring decisions are anchored to the blockchain through verifiable transactions. Only privacy-preserving hashes are stored on-chain, ensuring that no personal data is exposed while maintaining public verifiability.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            This transforms a CV from a document into a living, tamper-resistant professional ledger.
                        </p>
                    </div>

                    {/* Why Chainvolio Exists */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">02. Purpose</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Why We Exist.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Web3 hiring is uniquely challenging. Teams are global, remote, and often pseudonymous. In this environment, trust cannot rely on institutional credentials alone.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            We believe trust should be built on verifiable signals accumulated over time. ChainVolio provides the neutral infrastructure to capture these signals through on-chain attestations and recruiter-verified hiring actions, forming a transparent and tamper-resistant hiring history.
                        </p>
                    </div>

                    {/* What It Is and Is Not */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">03. Framework</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Scope and Limitations.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            It is important to understand what ChainVolio is and is not. ChainVolio provides infrastructure for recording professional claims and attestations as blockchain transactions.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            We do not act as a recruiter, employer, arbitrator, or authority of truth. On-chain records prove that an event was recorded at a specific time by a specific wallet. Peer attestations and recruiter actions are verifiable signals, not absolute guarantees of performance or character. Final evaluation remains the responsibility of the hiring party.
                        </p>
                    </div>

                    {/* Who Is Behind Chainvolio */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">04. The Core</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Behind the Project.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio is an independent, builder-led initiative focused on decentralized identity and the future of work. The project is grounded in real-world industry experience and long-term infrastructure thinking rather than short-term trends.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            We are committed to building open, verifiable systems that strengthen professional trust in Web3 and beyond.
                        </p>
                    </div>

                    {/* Vision */}
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">05. The Goal</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Long-Term Vision.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Our goal is for a ChainVolio profile to become the default professional link in Web3. When someone says “drop your CV,” it should mean sharing a verifiable on-chain history.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            We are building toward open standards, interoperability, and permanent ownership of career data. No tokens, no NFTs, just durable infrastructure for professional identity.
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
