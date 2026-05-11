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
            title: "How to Ask for a Work Attestation | ChainVolio",
            text: "Get your work recognized. Learn how to ask for a cryptographic attestation on ChainVolio.",
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
            <title>How to Ask for a Work Attestation | ChainVolio</title>
            <meta name="description" content="Learn how to ask for a work attestation on ChainVolio with practical tips and example messages." />
            
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
                                        Guides
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-white/30 font-medium uppercase tracking-tight">
                                        <Clock className="w-3.5 h-3.5" />
                                        5 min read
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.15] text-white/90">
                                    How to Ask for a Work Attestation: A Practical Guide for Web3 Contributors
                                </h1>

                                <div className="flex items-center justify-between py-8 border-y border-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/20" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/90">ChainVolio Team</span>
                                            <span className="text-xs text-white/40">Published on May 6, 2026</span>
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
                                            You've done the work. You showed up, delivered, and made a real contribution. Now what?
                                        </p>
                                        <p>
                                            Getting that work recognized, not just remembered, but verifiably confirmed, is what separates a contribution that lives in your memory from one that builds your professional reputation.
                                        </p>
                                        <p>
                                            Asking for a work attestation is simpler than it sounds. Here's how to do it well.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What You're Actually Asking For</h2>
                                        <p>
                                            An attestation is a cryptographic confirmation from another party that you did what you say you did. When someone issues an attestation on ChainVolio, they're signing a statement with their wallet that gets permanently recorded on Solana.
                                        </p>
                                        <p className="text-white/80 font-bold">
                                            It's not a favor. It's a professional record.
                                        </p>
                                        <p>
                                            Framing it this way when you ask is important. You can learn more about the technical foundation in our <Link href="/blog/what-is-on-chain-attestation" className="text-amber-200/60 hover:underline">guide to on-chain attestations</Link>.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Who Should You Ask?</h2>
                                        <p>
                                            The best attestor is someone who directly observed or benefited from your work, has credibility in the relevant ecosystem, and can speak specifically to what you did.
                                        </p>
                                        <p className="border-l-4 border-white/10 pl-8 py-2 text-white/30 text-xl font-medium tracking-tight">
                                            The hierarchy generally goes: organization leads carry the most weight, followed by project managers and senior contributors.
                                        </p>
                                        <p>
                                            An attestation from a verified organization on ChainVolio carries more weight than one from an individual, because the organization's reputation is also on the line.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">How to Ask (With an Example Message)</h2>
                                        <p>
                                            The best attestation requests are specific about what you contributed and when, brief, and framed around the benefit to both parties.
                                        </p>
                                        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] space-y-4">
                                            <p className="text-white/40 text-sm font-black uppercase tracking-widest">Example message:</p>
                                            <p className="text-white/80 italic">
                                                "Hi [Name], I've been building my verified work history on ChainVolio and would love to have the work I did on [project] attested. It takes about two minutes, you'd confirm my role and contribution via your wallet, and it gets recorded on Solana permanently. Would you be up for this? Happy to send you the link."
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/10 space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Timing: When to Ask</h2>
                                        <p>
                                            The best time to ask for an attestation is right after a contribution concludes, when the work is fresh and the relationship is at its strongest.
                                        </p>
                                        <p className="text-white/80 font-medium">
                                            Asking within a week of completing a milestone is natural and almost always gets a yes.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What If They Don't Have a ChainVolio Account?</h2>
                                        <p>
                                            Not everyone you've worked with will be on ChainVolio yet. The good news is that they don't need an existing account to issue an attestation. They just need a Solana wallet and the link you send them.
                                        </p>
                                        <p>
                                            If they're hesitant, you can frame it this way: "You're not signing up for a platform, you're just confirming what you already know to be true, using a wallet you can set up in five minutes."
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-12">
                                        <h2 className="text-3xl md:text-4xl font-bold text-white/90 tracking-tight text-center">Start Proving Your Impact</h2>
                                        <p className="text-center text-white/40 max-w-xl mx-auto">
                                            One attested contribution does more for your credibility than ten self-described ones.
                                        </p>
                                        <div className="flex justify-center pt-8">
                                            <Link 
                                                href="/onboarding" 
                                                className="px-10 py-5 rounded-full bg-white text-black font-black text-lg hover:bg-amber-200 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                                            >
                                                Request Your First Attestation
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
