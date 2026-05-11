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
            title: "Why Web3 Hiring via DM Is Broken | ChainVolio",
            text: "Informal hiring is slowing down Web3. Discover why verifiable signals are the solution.",
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
            <title>Why Web3 Hiring via DM Is Broken | ChainVolio</title>
            <meta name="description" content="Explore why informal hiring via DMs and emails is broken in Web3 and how to transition to verified hiring." />
            
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
                                        Recruitment
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-white/30 font-medium uppercase tracking-tight">
                                        <Clock className="w-3.5 h-3.5" />
                                        5 min read
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.15] text-white/90">
                                    Why Web3 Hiring via DM Is Broken and What to Do Instead
                                </h1>

                                <div className="flex items-center justify-between py-8 border-y border-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/20" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/90">ChainVolio Team</span>
                                            <span className="text-xs text-white/40">Published on May 10, 2026</span>
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
                                        <p className="text-white/40 font-mono text-sm">
                                            "Send me your portfolio on Twitter."<br />
                                            "Just DM me your CV."<br />
                                            "Shoot us an email and we'll review it."
                                        </p>
                                        <p>
                                            Sound familiar? If you've been in Web3 for any amount of time, you've seen this. Hiring happens in Discord channels, Twitter threads, and email inboxes which are informal, unstructured, and almost impossible to verify.
                                        </p>
                                        <p className="text-white/90 font-bold text-xl">
                                            It works. Until it doesn't.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">The Real Cost of DM Hiring</h2>
                                        <p>
                                            DM hiring feels fast. But what it actually does is push all the risk onto the recruiter.
                                        </p>
                                        <p>
                                            When someone sends their portfolio via DM, the recruiter has no way to verify:
                                        </p>
                                        <ul className="space-y-4 list-none p-0">
                                            {[
                                                "Whether the work was actually theirs",
                                                "Whether the timeline they claim is accurate",
                                                "Whether the organization they say they worked for can confirm it",
                                                "Whether the skills they list were actually used"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200 mt-2" />
                                                    <span className="text-white/70">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-white/30 italic">
                                            The recruiter is left making a judgment call based on vibes and reputation. That's not a hiring process. That's educated guessing.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">It's Not Just the Recruiter's Problem</h2>
                                        <p>
                                            Talented contributors suffer too.
                                        </p>
                                        <p>
                                            When hiring runs on informal signals, the people who win are often not the most skilled because they're the most visible. The best self-marketers. The ones with the most followers or the loudest presence in the right Discord servers.
                                        </p>
                                        <p className="border-l-4 border-white/10 pl-8 py-2 text-white/30 text-xl font-medium tracking-tight">
                                            Real contributors who do deep, valuable work in relative silence often get overlooked.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Why Email Isn't Much Better</h2>
                                        <p>
                                            Email feels more formal. But the problems are the same.
                                        </p>
                                        <p>
                                            A PDF attached to an email is a document anyone can edit. A portfolio link leads to a website anyone can build. Claims in a cover letter have no verification mechanism built in.
                                        </p>
                                        <p>
                                            Recruiters end up spending hours on reference calls, background checks, and trial periods, not because they want to, but because they have no other way to separate real contributors from self-promoters.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What the Alternative Looks Like</h2>
                                        <p>
                                            Imagine a world where:
                                        </p>
                                        <ul className="space-y-4">
                                            <li className="text-white/80">• Every role is confirmed by the organization</li>
                                            <li className="text-white/80">• Every contribution is signed by someone who was actually there</li>
                                            <li className="text-white/80">• That verification lives on a public blockchain</li>
                                        </ul>
                                        <p className="text-amber-200/60 font-black text-2xl tracking-tighter">
                                            That's verifiable work history.
                                        </p>
                                        <p className="text-sm text-white/40">
                                            Learn how to build your own in our <Link href="/blog/how-to-build-web3-portfolio" className="text-amber-200/60 hover:underline">Web3 portfolio guide</Link>.
                                        </p>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/10 space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">A Better Way to Share Your Work</h2>
                                        <p>
                                            Instead of DMing a portfolio that no one can verify, you share a single link. That link opens your on-chain professional profile. Every role is attested by the organization you worked for. Every contribution is backed by cryptographic proof.
                                        </p>
                                        <p className="text-white/80 font-medium">
                                            Recruiters can verify everything instantly without needing DMs, calls, or back-and-forth.
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-12">
                                        <h2 className="text-3xl md:text-4xl font-bold text-white/90 tracking-tight">The Shift Is Already Happening</h2>
                                        <p>
                                            The best Web3 projects are already moving away from informal hiring. They want contributors who can prove their work instead of just describing it.
                                        </p>
                                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                                            <Link 
                                                href="/onboarding" 
                                                className="px-8 py-4 rounded-full bg-white text-black font-black text-center hover:bg-amber-200 transition-all"
                                            >
                                                Build Your Verified Profile
                                            </Link>
                                            <Link 
                                                href="/recruiter" 
                                                className="px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-black text-center hover:bg-white/10 transition-all"
                                            >
                                                Start Hiring with Verified Signals
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
