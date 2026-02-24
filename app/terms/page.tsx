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
                            ChainVolio is a Web3-native CV and professional profile platform that allows users to create public profiles linked to a wallet address, record self-declared work history, and anchor claims with on-chain timestamps.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio is not an employer, recruiter, hiring agency, or verification authority.
                        </p>
                    </div>

                    {/* 2. Eligibility */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">02. Access</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Eligibility.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            You may use ChainVolio if you are at least 18 years old, have the legal capacity to enter into this agreement, and comply with all applicable laws in your jurisdiction. You are responsible for ensuring that your use of the platform is lawful.
                        </p>
                    </div>

                    {/* 3. Wallet Connection */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">03. Authentication</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Wallet & Identity.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio uses wallet-based authentication. By connecting a wallet, you confirm you control the address, understand that your address may be publicly visible, and acknowledge that blockchain data is public and immutable.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed text-xs italic">
                            ChainVolio does not custody wallets, private keys, or assets.
                        </p>
                    </div>

                    {/* 4. User Content */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">04. Submissions</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">User Content.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            You are fully responsible for all information you submit. All professional claims on ChainVolio are self-declared unless explicitly marked as attested.
                        </p>
                        <p className="text-white/40 font-light leading-relaxed">
                            We do not guarantee the accuracy of content, verify employment by default, or endorse any claims made by users.
                        </p>
                    </div>

                    {/* 5. Proof of Work & Attestations */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">05. Validation</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Attestations.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Attestations represent opinions or acknowledgments by the attesting party, not factual guarantees. ChainVolio does not validate the truthfulness of attestations and is not responsible for disputes between users and attestors.
                        </p>
                    </div>

                    {/* 6. Public Profiles */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">06. Visibility</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Data Exposure.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            Public profiles can be viewed by anyone with the link. You understand that on-chain data (timestamps, hashes, wallet addresses) is permanent. You should not upload sensitive or confidential information.
                        </p>
                    </div>

                    {/* 7. Prohibited Use */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-red-500/40 font-bold">07. Restrictions</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Prohibited Use.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            You agree not to submit false information, impersonate others, upload harmful content, or use the platform for deceptive activities. We reserve the right to restrict content that violates these terms.
                        </p>
                    </div>

                    {/* 8. No Guarantee */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">08. Expectations</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Employment.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio does not guarantee job placement or responses from recruiters. All hiring decisions are made independently by third parties.
                        </p>
                    </div>

                    {/* 9. Availability */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">09. Reliability</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Platform Status.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            ChainVolio is provided "as is" and "as available." We do not guarantee continuous availability or error-free operation. Features may change or be discontinued at any time.
                        </p>
                    </div>

                    {/* 10. Liability */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">10. Indemnity</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Limited Liability.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            To the maximum extent permitted by law, ChainVolio is not liable for any loss, damage, or dispute arising from platform use. Users assume full responsibility for how their information is used by others.
                        </p>
                    </div>

                    {/* 11. Changes */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-teal-400/60 font-bold">11. Evolution</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Updates.</h2>
                        <p className="text-white/40 font-light leading-relaxed">
                            We may update these terms from time to time. Changes are effective once published. Continued use of the platform means you accept the updated terms.
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
