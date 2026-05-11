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
            title: "LinkedIn vs ChainVolio: Why You Need Both | ChainVolio",
            text: "LinkedIn is for visibility, ChainVolio is for proof. Learn why you need both for your Web3 career.",
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
            <title>LinkedIn vs ChainVolio: Why You Need Both | ChainVolio</title>
            <meta name="description" content="LinkedIn is built for visibility, but it lacks verification. ChainVolio is a trust layer that works alongside it to provide proof of work." />
            
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
                                    LinkedIn vs ChainVolio: Why You Actually Need Both
                                </h1>

                                <div className="flex items-center justify-between py-8 border-y border-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/20" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/90">ChainVolio Team</span>
                                            <span className="text-xs text-white/40">Published on May 8, 2026</span>
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
                                            Let's be honest. LinkedIn is everywhere.
                                        </p>
                                        <p>
                                            It has over a billion users. Every recruiter, hiring manager, and professional you'll ever meet has a profile there. It's not going anywhere.
                                        </p>
                                        <p>
                                            So when people first hear about ChainVolio, the natural question is: why would I need another professional platform?
                                        </p>
                                        <p className="text-white/80 font-bold">
                                            The short answer: ChainVolio isn't another professional platform. It's a trust layer, and it works better when used alongside LinkedIn, not instead of it.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What LinkedIn Is Great At</h2>
                                        <p>
                                            LinkedIn is built for visibility and networking. It's where people find jobs, connect with colleagues, and build a professional presence. It's a broadcast platform, where you put your experience out into the world and hope the right people find it.
                                        </p>
                                        <p>
                                            For these things, LinkedIn works. The platform's reach is unmatched. The connections you can make there are real. For many people in traditional industries, LinkedIn alone is enough.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What LinkedIn Cannot Do</h2>
                                        <p>
                                            Here's the honest limitation: LinkedIn has no verification mechanism.
                                        </p>
                                        <p>
                                            Anyone can add any job title, any company, and any date range to their profile. LinkedIn itself will tell you this, as they don't verify the accuracy of profile information. They rely on social trust: the assumption that lying would be awkward if your connections noticed.
                                        </p>
                                        <p className="border-l-4 border-white/10 pl-8 py-2 text-white/30 text-xl font-medium tracking-tight">
                                            In Web3, this is a problem.
                                        </p>
                                        <p>
                                            The ecosystem is global, pseudonymous, and moves fast. Most people have never met their collaborators in person. "Social trust," knowing someone well enough to catch a lie, barely exists.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">What ChainVolio Does That LinkedIn Cannot</h2>
                                        <p>
                                            ChainVolio doesn't try to be a social network. It doesn't have feeds, follower counts, or connection requests.
                                        </p>
                                        <p className="text-amber-200/60 font-black text-2xl tracking-tighter">
                                            What it has is cryptographic proof.
                                        </p>
                                        <p>
                                            When you add a role on ChainVolio and get it attested by the organization you worked with, that attestation is signed with their wallet and recorded permanently on Solana. No one can edit it. No one can fake it. Anyone can verify it instantly, without asking anyone.
                                        </p>
                                        <p>
                                            It's the difference between saying "I worked at Protocol X" and being able to prove "Protocol X signed a cryptographic statement confirming I worked there, and here's the public record."
                                        </p>
                                        <p className="text-sm text-white/40">
                                            Learn more about why this shift matters on our <Link href="/why" className="text-amber-200/60 hover:underline">Why ChainVolio</Link> page.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">How They Work Together</h2>
                                        <p>
                                            Here's how the two platforms complement each other in practice:
                                        </p>
                                        <ul className="space-y-4 list-none p-0">
                                            <li className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-200 mt-2" />
                                                <span className="text-white/70">Your LinkedIn profile tells your professional story, including your career narrative, your network, and your presence.</span>
                                            </li>
                                            <li className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-200 mt-2" />
                                                <span className="text-white/70">Your ChainVolio profile proves your professional story, where every contribution is verified, every role attested, and every claim backed by a cryptographic signature.</span>
                                            </li>
                                        </ul>
                                        <p>
                                            When you add your ChainVolio link to your LinkedIn profile, you're giving anyone who views it the option to go from your story to your proof in one click.
                                        </p>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/10 space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">A Concrete Example</h2>
                                        <p>
                                            Alex is a Solana developer with three years of experience. His LinkedIn profile lists his roles and projects. It looks good, but so does every other developer's profile.
                                        </p>
                                        <p>
                                            Alex also has a ChainVolio profile. Every major contribution he's made has been attested by the DAOs and protocols he's worked with. When a recruiter is choosing between Alex and five other candidates, Alex's ChainVolio link is the thing that closes the gap.
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-12">
                                        <h2 className="text-3xl md:text-4xl font-bold text-white/90 tracking-tight text-center">The Bottom Line</h2>
                                        <p className="text-center text-white/40 max-w-xl mx-auto">
                                            Keep your LinkedIn. Keep your network. And then add a layer of proof that LinkedIn was never designed to provide.
                                        </p>
                                        <div className="flex justify-center pt-8">
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
