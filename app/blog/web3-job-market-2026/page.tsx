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
            title: "The Web3 Job Market in 2026 | ChainVolio",
            text: "Discover how the Web3 job market has evolved and why verifiable proof is now the gold standard.",
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
        <main className="min-h-screen bg-black theme-bg-page theme-aware text-white selection:bg-amber-200/30">
            <title>The Web3 Job Market in 2026 | ChainVolio</title>
            <meta name="description" content="The Web3 job market in 2026 rewards real contributors over self-promoters. Learn how it has changed and how to navigate it." />
            
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
                                        6 min read
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.15] text-white/90">
                                    The Web3 Job Market in 2026: What's Changed and How to Navigate It
                                </h1>

                                <div className="flex items-center justify-between py-8 border-y border-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/20" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/90">ChainVolio Team</span>
                                            <span className="text-xs text-white/40">Published on May 7, 2026</span>
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
                                            The Web3 job market in 2026 looks nothing like it did two years ago.
                                        </p>
                                        <p>
                                            The hype cycles have settled. The speculative noise has faded. What's left is a more mature, more demanding, and ultimately more interesting ecosystem, one that rewards real contributors over self-promoters.
                                        </p>
                                        <p>
                                            If you're looking to enter or advance in Web3 this year, here's what has changed and what it means for you.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What's Different in 2026</h2>
                                        <p>
                                            A few years ago, getting a Web3 role was often about timing and connections. Being early to the right Discord server, knowing the right people, or being willing to work for equity in projects that might never ship.
                                        </p>
                                        <p>
                                            That era is largely over. Web3 organizations in 2026 are more selective, more structured, and more focused on verifiable output.
                                        </p>
                                        <p className="text-white/30 italic">Three shifts define the current market:</p>
                                        <ul className="space-y-4">
                                            <li className="text-white/80">• Verification is becoming a baseline expectation, where recruiters want proof, not just claims.</li>
                                            <li className="text-white/80">• Remote-first is now truly global, meaning competing for roles means competing with talent worldwide.</li>
                                            <li className="text-white/80">• Specialization matters more, as generalist "crypto enthusiast" profiles are losing ground to contributors with documented, specific expertise.</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">The Roles That Are Actually Hiring</h2>
                                        <p>
                                            Technical roles remain the most in-demand, but the definition of "technical" has expanded. Solana developers, smart contract auditors, and protocol engineers are still sought after, but so are:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                "Growth and marketing with Web3-native experience",
                                                "Community builders with governance participation",
                                                "Product designers who understand on-chain UX",
                                                "Technical writers and educators",
                                                "Operations contributors in distributed teams"
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                                                    <span className="text-white/70 text-sm">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/10 space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What Recruiters Are Screening For</h2>
                                        <p>
                                            The hiring process in Web3 has professionalized. Serious organizations are no longer hiring from DMs alone. They want to see:
                                        </p>
                                        <ul className="space-y-2">
                                            <li>• A track record of shipped work, not just ideas.</li>
                                            <li>• On-chain activity that confirms claims.</li>
                                            <li>• Attestations from recognized organizations.</li>
                                            <li>• A consistent professional identity.</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">How to Position Yourself for 2026</h2>
                                        <p>
                                            Given where the market is, here is what actually moves the needle:
                                        </p>
                                        <p>
                                            Build in public. Every shipped contribution, no matter how small, is a data point. Learn how to package these effectively in our <Link href="/blog/how-to-build-web3-portfolio" className="text-amber-200/60 hover:underline">portfolio guide</Link>.
                                        </p>
                                        <p>
                                            Get your work attested. When a recognized organization confirms your contribution in writing, especially on-chain, your credibility increases significantly.
                                        </p>
                                        <p>
                                            Make your proof portable. A verified profile you can share in one link is increasingly the standard that serious candidates are expected to meet. Explore <Link href="/guides/how-it-works" className="text-amber-200/60 hover:underline">how it works</Link> to get started.
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-12">
                                        <h2 className="text-3xl md:text-4xl font-bold text-white/90 tracking-tight text-center">The Opportunity</h2>
                                        <p className="text-center text-white/40 max-w-xl mx-auto">
                                            Because verification is becoming the standard, there's a real advantage for the people who start building a verifiable track record now.
                                        </p>
                                        <div className="flex justify-center pt-8">
                                            <Link 
                                                href="/onboarding" 
                                                className="px-10 py-5 rounded-full bg-white text-black font-black text-lg hover:bg-amber-200 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                                            >
                                                Build Your 2026-Ready Profile
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
