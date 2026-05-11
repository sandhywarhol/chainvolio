"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toast } from "@/components/ui/Toast";
import { ArrowLeft, ArrowRight, Clock, Calendar, User, Share2, Bookmark } from "lucide-react";

export default function BlogPostPage() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleShare = () => {
        const shareData = {
            title: "What Is On-Chain Attestation? A Simple Guide | ChainVolio",
            text: "Explore how on-chain attestations are building a verifiable professional identity in Web3.",
            url: typeof window !== 'undefined' ? window.location.href : '',
        };

        if (navigator.share) {
            navigator.share(shareData).catch((err) => {
                if (err.name !== 'AbortError') console.error("Error sharing:", err);
            });
        } else {
            navigator.clipboard.writeText(shareData.url);
            setToast({ message: "Link copied to clipboard!", type: 'success' });
        }
    };

    const handleBookmark = () => {
        setToast({ message: "Bookmark feature coming soon!", type: 'success' });
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-amber-200/30">
            <title>What Is On-Chain Attestation? A Simple Guide | ChainVolio</title>
            <meta name="description" content="A simple guide to understanding on-chain attestations and why they matter for Web3 professionals." />
            
            <Navbar />
            
            <div className="relative pt-32 pb-32 px-6">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />

                <div className="max-w-[800px] mx-auto relative z-10">
                    {/* Breadcrumbs & Back */}
                    <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Insights
                    </Link>

                    {/* Article Container Box */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-[40px] md:rounded-[64px] shadow-2xl relative overflow-hidden group/article">
                        {/* Subtle inner glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

                        <div className="p-8 md:p-16">
                            {/* Article Header */}
                            <header className="space-y-8 mb-16 relative z-10">
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 rounded-full bg-amber-200/10 border border-amber-200/20 text-[10px] font-black uppercase tracking-widest text-amber-200/80">
                                        Identity & Trust
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-white/30 font-medium uppercase tracking-tight">
                                        <Clock className="w-3.5 h-3.5" />
                                        6 min read
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.15] text-white/90">
                                    What Is On-Chain Attestation? A Simple Guide for Web3 Professionals
                                </h1>

                                <div className="flex items-center justify-between py-8 border-y border-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/20" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/90">ChainVolio Team</span>
                                            <span className="text-xs text-white/40">Published on May 11, 2026</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={handleShare}
                                            className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={handleBookmark}
                                            className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
                                        >
                                            <Bookmark className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </header>

                            {/* Article Content */}
                            <div className="max-w-none relative z-10 pb-20">
                                <div className="space-y-12 text-base md:text-lg text-white/60 leading-relaxed font-normal">
                                    <div className="space-y-6">
                                        <p className="text-white/90 font-medium text-xl md:text-2xl leading-snug">
                                            You've worked hard. You've shipped real things. You've contributed to projects that matter.
                                        </p>
                                        <p>
                                            But when someone asks you to prove it, or better yet, really prove it, what do you show them? A PDF you made yourself? A LinkedIn post you wrote? A screenshot anyone could fake?
                                        </p>
                                        <p className="text-white/80 font-bold">
                                            This is the gap that on-chain attestation was built to close.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What Is an Attestation?</h2>
                                        <p>
                                            An attestation is a formal statement from another party confirming that something is true.
                                        </p>
                                        <p>
                                            In the physical world, attestations have existed for centuries. A university degree is an attestation which is where someone else confirms that you completed the work. A reference letter is an attestation. A notarized document is an attestation.
                                        </p>
                                        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-200/50" />
                                            <p className="text-white/80 italic text-lg md:text-xl">
                                                The problem? All of these can be faked, lost, or disputed. They live on paper, in email threads, or in closed systems that no one else can access.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What Makes It "On-Chain"?</h2>
                                        <p>
                                            When an attestation is recorded "on-chain," it means the confirmation is written directly onto a public blockchain, and in ChainVolio's case, it is Solana. Explore our <Link href="/guides/attestation" className="text-amber-200/60 hover:underline">technical guide</Link> for more details.
                                        </p>
                                        <p>
                                            Think of it like this: instead of your employer sending you a reference letter that only you hold, they sign a cryptographic statement that gets permanently recorded in a public ledger that anyone can read and verify instantly, without asking anyone.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                            {[
                                                { title: "Cryptographic", desc: "Signed by the attesting party since only they could have made it." },
                                                { title: "Timestamped", desc: "No one can claim it was made before or after it actually was." },
                                                { title: "Immutable", desc: "No one, not even ChainVolio, can change or delete it." }
                                            ].map((item, i) => (
                                                <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-amber-200/60">{item.title}</h3>
                                                    <p className="text-sm text-white/40">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Who Can Give an Attestation?</h2>
                                        <p>
                                            In ChainVolio, attestations are issued by verified organizations and collaborators, specifically people who were actually there when the work happened.
                                        </p>
                                        <ul className="space-y-4 list-none p-0">
                                            {[
                                                "A DAO that you contributed to",
                                                "A startup where you worked as a freelancer",
                                                "A protocol that ran a grant program you participated in",
                                                "A colleague or manager who saw your output firsthand"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                                                    <span className="text-white/70">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-white/30 italic">
                                            The key is that the attestor signs the statement with their own wallet. Their reputation is attached to what they confirm. That's what makes it meaningful.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">How Is This Different From a LinkedIn Endorsement?</h2>
                                        <p>
                                            A LinkedIn endorsement takes two clicks and requires no accountability. Anyone can endorse anyone for anything.
                                        </p>
                                        <p>
                                            An on-chain attestation requires the attesting party to sign a transaction with their wallet as a deliberate, traceable action. If they lie, the blockchain records it. Their credibility is on the line.
                                        </p>
                                        <p className="border-l-4 border-white/10 pl-8 py-2 text-white/30 text-xl font-medium tracking-tight">
                                            It's the difference between someone saying "yeah they're good" at a party, and a verified organization putting their name and their digital identity behind a claim.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Why Does This Matter for Remote and Web3 Work?</h2>
                                        <p>
                                            Remote work has made verification harder. You work with people you've never met in person. Projects are distributed across time zones and platforms. Your GitHub, Discord, and wallet activity are scattered across a dozen tools.
                                        </p>
                                        <p className="text-amber-200/60 font-bold text-2xl">
                                            Your work becomes portable proof.
                                        </p>
                                        <p>
                                            On-chain attestation solves this by creating a single, verifiable record that travels with you and is not locked in one platform or dependent on anyone else keeping a record.
                                        </p>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/10 space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What This Looks Like in Practice</h2>
                                        <p>
                                            Maria contributes to a DeFi protocol as a UI designer for three months. The protocol lead issues an on-chain attestation confirming her role, the duration, and the quality of her output. That attestation is signed with their wallet and recorded on Solana.
                                        </p>
                                        <p className="text-white/80 font-medium">
                                            Six months later, Maria applies for a remote design role at a Web3 startup. The recruiter opens her ChainVolio profile and sees the attestation which is verified, permanent, and signed by a recognized protocol. No reference calls needed. No PDF required.
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-12">
                                        <h2 className="text-3xl md:text-4xl font-bold text-white/90 tracking-tight text-center">Start Building Your Verifiable History</h2>
                                        <p className="text-center text-white/40 max-w-xl mx-auto">
                                            ChainVolio turns your work into on-chain attestations that anyone can trust. Create your free profile and start building a reputation that travels with you.
                                        </p>
                                        <div className="flex justify-center pt-8">
                                            <Link 
                                                href="/onboarding" 
                                                className="px-10 py-5 rounded-full bg-white text-black font-black text-lg hover:bg-amber-200 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(253,230,138,0.3)]"
                                            >
                                                Create Your Profile, it's Free to Start
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Back to Blog Navigation */}
                                    <div className="pt-16 pb-12 relative z-20 flex justify-center">
                                        <Link 
                                            href="/blog" 
                                            className="inline-flex items-center gap-3 px-8 py-5 rounded-full bg-white/[0.05] border border-white/10 text-white font-bold text-lg hover:bg-white/[0.1] transition-all duration-300"
                                        >
                                            <ArrowLeft className="w-6 h-6" />
                                            Back to Articles
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ultra-Smooth Easing Gradients */}
                        <div className="absolute inset-0 pointer-events-none z-10">
                            <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-black via-black/95 via-black/80 via-black/40 via-black/10 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
}
