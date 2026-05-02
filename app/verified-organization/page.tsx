"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { Navbar } from "@/components/layout/Navbar";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Shield, CheckCircle, TrendingUp, Lock, Award, Building, Users, Globe, Briefcase, Zap, Magnet, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifiedOrganizationPage() {
    const { connected, publicKey } = useWallet();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);

    useEffect(() => {
        if (!publicKey) {
            setIsVerified(false);
            return;
        }

        // Check if the current wallet is already a verified organization
        fetch(`/api/profile?wallet=${publicKey.toBase58()}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                // We check if the verification status exists and is verified
                setIsVerified(data?.verificationStatus === 'verified');
            })
            .catch(() => setIsVerified(false));
    }, [publicKey]);

    // Only show the "Verify your organization" button to "new" (unverified) users
    const showVerifyCTA = !isVerified;

    return (
        <div className="min-h-screen relative">
            <Navbar />
            <main className="min-h-screen bg-transparent text-white selection:bg-emerald-500/30 relative">

            {/* HERO SECTION */}
            <section className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-[1240px] mx-auto w-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

                <div className="relative z-10 space-y-8 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                        <Shield className="w-3 h-3" />
                        Trust Gateway
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
                        Verified <span className="text-emerald-400">Organization</span>
                    </h1>

                    <p className="text-sm md:text-xl text-white/50 leading-relaxed font-light tracking-tight">
                        Issue high-trust attestations and strengthen your organization's credibility on-chain. Verified organizations issue credentials with higher weight, making candidate profiles more credible and evaluated faster.
                    </p>

                    <div className="pt-4">
                        {showVerifyCTA && (
                            !connected ? (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-8 py-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-lg hover:bg-emerald-400 transition-all hover:scale-105 shadow-2xl shadow-emerald-500/20"
                                >
                                    Verify your organization
                                </button>
                            ) : (
                                <Link
                                    href="/dashboard?tab=organization"
                                    className="px-8 py-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-lg hover:bg-emerald-400 transition-all hover:scale-105 shadow-2xl shadow-emerald-500/20 inline-block"
                                >
                                    Verify your organization
                                </Link>
                            )
                        )}
                        {connected && !showVerifyCTA && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                                <CheckCircle className="w-4 h-4" />
                                Your organization is verified
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* WHY UPGRADE SECTION */}
            <section className="relative z-10 py-16 md:py-24 px-4 md:px-8 max-w-[1240px] mx-auto w-full border-t border-white/5">
                <div className="mb-16 max-w-2xl">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-6">Why Upgrade to Verified</h2>
                    <p className="text-white/40 font-light text-sm md:text-lg">
                        Verification transforms your organization from a participant into a trusted issuer within the ChainVolio network.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Shield className="w-6 h-6 text-emerald-400" />,
                            title: "Become a Trusted Issuer",
                            items: ["Your attestations carry more weight", "Your profile signals credibility instantly", "You stand out from regular users"]
                        },
                        {
                            icon: <Zap className="w-6 h-6 text-blue-400" />,
                            title: "Increase Your Attestation Capacity",
                            items: ["Free users are limited, verified users scale", "Give more attestations per month", "Support more talent and expand your reach"]
                        },
                        {
                            icon: <Magnet className="w-6 h-6 text-purple-400" />,
                            title: "Build a Stronger Talent Magnet",
                            items: ["More candidates seek your endorsement", "Your organization becomes a hub of trust", "Attract higher-quality talent"]
                        },
                        {
                            icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
                            title: "Amplify Your Hiring Power",
                            items: ["Create and manage opportunities", "Showcase hiring activity publicly", "Turn hiring into a visible trust signal"]
                        },
                        {
                            icon: <RefreshCw className="w-6 h-6 text-blue-400" />,
                            title: "Accelerate Your Reputation Growth",
                            items: ["More attestations -> more visibility -> more trust", "Build a compounding reputation", "Establish long-term credibility"]
                        },
                        {
                            icon: <Lock className="w-6 h-6 text-purple-400" />,
                            title: "Ensure Network Quality",
                            items: ["Payment is not just a fee, but a commitment", "Ensures serious participation", "Reduces spam", "Maintains high-quality trust signals"]
                        }
                    ].map((benefit, i) => (
                        <div key={i} className="p-6 md:p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all">
                                {benefit.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-6 tracking-tight">{benefit.title}</h3>
                            <ul className="space-y-3">
                                {benefit.items.map((item, j) => (
                                    <li key={j} className="flex gap-3 text-sm text-white/40 font-light leading-relaxed group-hover:text-white/60 transition-colors">
                                        <span className="text-emerald-500 opacity-50">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-6 md:p-12 rounded-[40px] bg-emerald-500/[0.03] border border-emerald-500/10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <p className="text-2xl md:text-3xl font-light text-white italic tracking-tight relative z-10">
                        "Companies don't pay to give attestations - they pay to become <span className="text-emerald-400 font-bold not-italic">trusted issuers</span>."
                    </p>
                </div>
            </section>

            {/* WHO IS THIS FOR */}
            <section className="relative z-10 py-16 md:py-24 px-4 md:px-8 max-w-[1240px] mx-auto w-full border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-8">Who is this for?</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: <Building className="w-4 h-4" />, label: "Companies & Startups" },
                                { icon: <Globe className="w-4 h-4" />, label: "DAOs & Web3 Teams" },
                                { icon: <Users className="w-4 h-4" />, label: "Agencies & Studios" },
                                { icon: <Users className="w-4 h-4" />, label: "Communities" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-emerald-400">{item.icon}</div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 md:p-10 rounded-[40px] bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/20 blur-[100px] group-hover:bg-emerald-500/40 transition-all duration-700" />
                        <h3 className="text-2xl font-bold mb-6">How Verification Works</h3>
                        <div className="space-y-8 relative z-10">
                            {[
                                "Connect & Register your organization wallet",
                                "Submit basic verification proof (Website/GitHub/Social)",
                                "Manual review by ChainVolio team",
                                "Start issuing high-trust attestations"
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">
                                        {i + 1}
                                    </div>
                                    <p className="text-white/60 font-light pt-1">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section id="apply" className="relative z-10 py-16 md:py-32 px-4 md:px-8 max-w-[1000px] mx-auto w-full text-center">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tighter">Upgrade your organization and start scaling trust today.</h2>
                        <p className="text-sm md:text-xl text-white/40 font-light italic max-w-xl mx-auto border-l-2 border-emerald-500/20 pl-6 text-left">
                            Secure the future of professional trust by verifying your identity directly on-chain.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link 
                            href="/dashboard?tab=organization" 
                            className="px-10 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-2xl shadow-white/10 uppercase tracking-widest text-xs flex items-center gap-3"
                        >
                            Upgrade to Verified <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link 
                            href="/guides/how-it-works" 
                            className="px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest flex items-center gap-3"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            <div className="relative z-10">
                <Footer />
            </div>

            <CustomWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </main>
        </div>
    );
}
