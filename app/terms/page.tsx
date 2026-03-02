"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
            {/* Very subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <Navbar />

            {/* Hero Section */}
            <section className="relative z-40 pt-24 pb-20 px-8 max-w-[1240px] mx-auto w-full text-center">
                <div className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] mb-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-teal-400/60">Legal Framework</span>
                </div>

                <h1 className="text-6xl md:text-[80px] font-bold font-display tracking-tighter text-white leading-[0.85] mb-8">
                    Terms of Service.
                </h1>

                <p className="text-sm text-white/30 uppercase tracking-[0.2em] mb-12">
                    Last updated: February 22, 2026
                </p>

                <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto font-light tracking-tight px-8">
                    By accessing or using ChainVolio, you agree to the following terms. If you do not agree with any part of these terms, please do not use the platform.
                </p>
            </section>

            <div className="max-w-[1240px] mx-auto border-t border-white/5 w-full px-8" />

            {/* Content Sections */}
            <section className="relative z-40 py-20 px-8 max-w-[1240px] mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-x-24 gap-y-16">

                    {/* 1. About */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">01. Purpose</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">About ChainVolio.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio is a Web3-native professional record infrastructure. It functions as a non-custodial credential layer, enabling users to anchor professional claims and social proofs to a public blockchain via wallet-bound identity.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio provides the technical infrastructure but does not act as a centralized employer, verifier of individual facts, or hiring intermediary.
                        </p>
                    </div>

                    {/* 2. Eligibility */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">02. Access</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Eligibility.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            You may interact with this infrastructure if you are at least 18 years old and possess the legal capacity to enter into binding agreements. You are solely responsible for ensuring that your interaction with the blockchain is compliant with your local jurisdiction.
                        </p>
                    </div>

                    {/* 3. Wallet Connection */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">03. Authentication</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Wallet & Identity.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio utilizes self-sovereign, wallet-based authentication. By connecting your wallet, you acknowledge that you retain exclusive control over your private keys and that all authenticated actions represent irreversible on-chain transactions.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed text-xs italic">
                            ChainVolio cannot modify, reverse, or delete records anchored to the public ledger.
                        </p>
                    </div>

                    {/* 4. User Content */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">04. Submissions</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">User Content.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            You bear full accountability for all information submitted. Professional claims recorded via this infrastructure are self-declared, with the exception of cryptographically signed attestations.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            We do not arbitrate the accuracy of content or function as a centralized authority for employment verification.
                        </p>
                    </div>

                    {/* 5. Proof of Work & Attestations */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">05. Validation</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Attestations.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Attestations are independent, user-initiated cryptographic actions. A gas-backed transaction represents an economic and reputational commitment by the attesting party. ChainVolio does not arbitrate factual disputes between users and third-party attestors.
                        </p>
                    </div>

                    {/* 6. Public Profiles */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">06. Visibility</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Data Exposure.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Professional identities are publicly verifiable on the ledger. You acknowledge that on-chain data, including timestamps, hashes, and wallet addresses, is permanent and subject to public auditability. Deletion of on-chain data is not technically possible.
                        </p>
                    </div>

                    {/* 7. Prohibited Use */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-red-500/40 font-bold">07. Restrictions</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Prohibited Use.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            You agree not to utilize this infrastructure for deceptive practices, impersonation, or the submission of maliciously false data. We reserve the right to restrict interface-level access for entries that violate these principles.
                        </p>
                    </div>

                    {/* 8. No Guarantee */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">08. Expectations</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Employment.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio provides a trust-minimized tool for professional records. It does not guarantee employment outcomes. Hiring decisions remain the independent responsibility of external actors.
                        </p>
                    </div>

                    {/* 9. Availability */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">09. Reliability</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Platform Status.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Infrastructure access is provided "as is." Reliability is subject to the underlying performance of public blockchain networks and decentralized dependencies. Systemic interruptions may occur due to external network conditions.
                        </p>
                    </div>

                    {/* 10. Liability */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">10. Indemnity</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Limited Liability.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Given the decentralized and user-controlled nature of this infrastructure, ChainVolio disclaims all liability for losses or disputes arising from user-initiated ledger entries or third-party attestations.
                        </p>
                    </div>

                    {/* 11. Changes */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">11. Evolution</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Updates.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            These governance rules may be updated to reflect infrastructure evolution. Continued interaction with the system following such updates constitutes acceptance of the revised rules.
                        </p>
                    </div>

                    {/* 12. Contact */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">12. Support</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Contact.</h2>
                        <p className="text-white/40 font-light mb-4">
                            If you have questions about these Terms, please reach out.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <a href="mailto:sandhywarhol@gmail.com" className="p-4 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                <span className="block text-[10px] uppercase tracking-widest text-white/20 mb-1">Email Support</span>
                                <span className="text-white/60 text-sm">sandhywarhol@gmail.com</span>
                            </a>
                            <a href="https://twitter.com/chainvolio" target="_blank" rel="noopener noreferrer" className="p-4 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                <span className="block text-[10px] uppercase tracking-widest text-white/20 mb-1">X / Twitter</span>
                                <span className="text-white/60 text-sm">@chainvolio</span>
                            </a>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </main>
    );
}
