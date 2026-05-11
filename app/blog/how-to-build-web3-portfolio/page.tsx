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
            title: "How to Build a Web3 Portfolio That Gets You Hired | ChainVolio",
            text: "Stop making claims and start showing proof. Learn how to build a verifiable Web3 portfolio.",
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
            <title>How to Build a Web3 Portfolio That Gets You Hired | ChainVolio</title>
            <meta name="description" content="A practical guide on how to build a verifiable Web3 portfolio using proof of work and on-chain attestations." />
            
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
                                        Career
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-white/30 font-medium uppercase tracking-tight">
                                        <Clock className="w-3.5 h-3.5" />
                                        7 min read
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.15] text-white/90">
                                    How to Build a Web3 Portfolio That Actually Gets You Hired
                                </h1>

                                <div className="flex items-center justify-between py-8 border-y border-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/20" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/90">ChainVolio Team</span>
                                            <span className="text-xs text-white/40">Published on May 9, 2026</span>
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
                                            There are two types of people in Web3.
                                        </p>
                                        <p>
                                            The first type builds quietly, ships consistently, and does real work. The second type talks about building, posts about web3, and claims experience they've never actually demonstrated.
                                        </p>
                                        <p className="text-white/80 font-bold">
                                            The problem? From the outside, they often look the same.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Step 1: Understand What "Portfolio" Means in Web3</h2>
                                        <p>
                                            In traditional industries, a portfolio is a collection of samples. You curate it. You present it. You control the narrative.
                                        </p>
                                        <p>
                                            In Web3, a portfolio is **evidence**. It's not just what you say you've done but rather what you can prove.
                                        </p>
                                        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] space-y-4">
                                            <p className="text-white/40 text-sm font-black uppercase tracking-widest">Your portfolio should answer:</p>
                                            <ul className="space-y-2">
                                                <li className="text-white/80">• What did you actually build or contribute?</li>
                                                <li className="text-white/80">• Who can confirm that you did it?</li>
                                                <li className="text-white/80">• Where can I verify this independently?</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Step 2: Start Contributing Publicly, Right Now</h2>
                                        <p>
                                            The biggest mistake beginners make is waiting until they feel "ready" to start contributing. There is no ready. There is only shipped.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                "Open-source projects on GitHub",
                                                "DAO governance participation",
                                                "Hackathon submissions",
                                                "Technical or educational content",
                                                "Community management or growth"
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                                                    <span className="text-white/70 text-sm">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Step 3: Document Your Work As You Go</h2>
                                        <p>
                                            Most contributors make the mistake of doing great work and then forgetting to document it. For each significant contribution, capture:
                                        </p>
                                        <ul className="space-y-3">
                                            <li><span className="text-white/80 font-bold">The Project:</span> What problem did it solve?</li>
                                            <li><span className="text-white/80 font-bold">Your Role:</span> What exactly did you deliver?</li>
                                            <li><span className="text-white/80 font-bold">The Outcome:</span> What was the impact?</li>
                                            <li><span className="text-white/80 font-bold">Collaborators:</span> Who can confirm your work?</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Step 4: Get Your Work Attested</h2>
                                        <p>
                                            This is the step that separates a portfolio from a verified portfolio. Documentation you write yourself is still a claim. Attestation from someone who was there with you is **proof**. 
                                        </p>
                                        <p>
                                            You can read more about <Link href="/blog/what-is-on-chain-attestation" className="text-amber-200/60 hover:underline">what attestations are here</Link>, and check our guide on <Link href="/blog/how-to-ask-for-work-attestation" className="text-amber-200/60 hover:underline">how to ask for them</Link>.
                                        </p>
                                        <p className="border-l-4 border-white/10 pl-8 py-2 text-white/30 text-xl font-medium tracking-tight">
                                            One attested contribution is worth more to a recruiter than ten self-described ones.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Step 5: Make It Findable</h2>
                                        <p>
                                            A great portfolio that no one sees is a missed opportunity. Once you have verified contributions:
                                        </p>
                                        <ul className="space-y-4">
                                            <li className="text-white/70">• Put your ChainVolio link in your Twitter/X bio</li>
                                            <li className="text-white/70">• Share your link alongside your traditional CV</li>
                                            <li className="text-white/70">• Use it in Discord hiring channels</li>
                                        </ul>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/10 space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What a Strong Portfolio Looks Like</h2>
                                        <p>
                                            A strong Web3 portfolio is not 50 projects that nobody can verify. It's 5 to 10 meaningful contributions with clear descriptions and on-chain attestations.
                                        </p>
                                        <p className="text-white/80 font-medium">
                                            Quality beats quantity. Verified beats self-described. Every time.
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-12 text-center">
                                        <h2 className="text-3xl md:text-4xl font-bold text-white/90 tracking-tight">Start Building Today</h2>
                                        <p className="text-white/40 max-w-xl mx-auto">
                                            ChainVolio is where your Web3 contributions become a verified professional identity.
                                        </p>
                                        <div className="pt-8">
                                            <Link 
                                                href="/onboarding" 
                                                className="px-10 py-5 rounded-full bg-white text-black font-black text-lg hover:bg-amber-200 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                                            >
                                                Create Your ChainVolio Profile
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
