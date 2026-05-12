"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toast } from "@/components/ui/Toast";
import { ShareModal } from "@/components/ui/ShareModal";
import { ArrowLeft, ArrowRight, Clock, Calendar, User, Share2, Bookmark } from "lucide-react";

export default function BlogPostPage() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    const handleBookmark = () => {
        setToast({ message: "Bookmark feature coming soon!", type: 'success' });
    };

    return (
        <main className="min-h-screen bg-black theme-bg-page theme-aware text-white selection:bg-amber-200/30">
            <title>How to Get a Web3 Job Without Experience | ChainVolio</title>
            <meta name="description" content="Learn how to get a Web3 job without traditional experience by building proof of work, contributing publicly, and creating a verifiable reputation." />
            
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
                                        Career & Hiring
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-white/30 font-medium uppercase tracking-tight">
                                        <Clock className="w-3.5 h-3.5" />
                                        5 min read
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.15] text-white/90">
                                    How to Get a Web3 Job Without Experience
                                </h1>

                                <div className="flex items-center justify-between py-8 border-y border-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/20" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/90">ChainVolio Team</span>
                                            <span className="text-xs text-white/40">Published on May 12, 2026</span>
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
                                    <p className="text-white/90 font-medium text-xl md:text-2xl leading-snug">
                                        Breaking into Web3 can feel impossible when every opportunity asks for experience.
                                    </p>
                                    
                                    <p>
                                        But unlike traditional industries, Web3 hiring is not only based on resumes. What matters most is visible proof of work.
                                    </p>

                                    <p>
                                        In many cases, contributors who publicly build, ship, and participate outperform candidates with polished CVs but no verifiable track record.
                                    </p>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Web3 Values Proof Over Credentials</h2>
                                        <p>
                                            Web3 is fundamentally different from traditional hiring.
                                        </p>
                                        <p>
                                            Projects care less about where you studied and more about what you can prove. Open-source contributions, DAO participation, community involvement, and on-chain activity often matter more than formal job titles.
                                        </p>
                                        <p className="text-amber-200/60 font-bold tracking-tight text-2xl md:text-3xl italic">
                                            Your reputation is built in public.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Start Contributing Publicly</h2>
                                        <p>
                                            You don’t need permission to start building in Web3.
                                        </p>
                                        <p>
                                            You can start today by exploring these paths:
                                        </p>
                                        <ul className="space-y-4 list-none p-0">
                                            {[
                                                "Contribute to open-source projects",
                                                "Join DAOs and communities",
                                                "Write technical or educational content",
                                                "Design interfaces and UX improvements",
                                                "Help moderate growing communities",
                                                "Participate in global hackathons"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200 mt-2" />
                                                    <span className="text-white/70">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="border-l-4 border-white/10 pl-8 py-2 text-white/30 text-xl font-medium tracking-tight">
                                            Small contributions compound over time.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Build Proof of Work</h2>
                                        <p>
                                            The biggest mistake new contributors make is focusing only on resumes.
                                        </p>
                                        <p>
                                            In Web3, proof of work matters more than self-claimed experience. Recruiters want to see visible contributions and verifiable activity.
                                        </p>
                                        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group/quote text-center">
                                            <p className="text-white/90 text-2xl md:text-3xl font-bold tracking-tighter">
                                                Every shipped project becomes a signal.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Why Verifiable Identity Matters</h2>
                                        <p>
                                            As the ecosystem grows, trust becomes more important.
                                        </p>
                                        <p>
                                            Contributions spread across multiple platforms are difficult to verify. This creates friction for both recruiters and contributors.
                                        </p>
                                        <p>
                                            A verifiable work history solves this problem by turning activity into trusted proof.
                                        </p>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/10 space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Build Your Reputation with ChainVolio</h2>
                                        <p>
                                            ChainVolio helps contributors turn their work into verifiable proof.
                                        </p>
                                        <p>
                                            Instead of relying on PDFs or unverifiable claims, your contributions become part of an on-chain professional identity that recruiters can instantly trust.
                                        </p>
                                        <p className="text-white/80 font-black uppercase tracking-[0.1em] text-sm text-center">
                                            Your work becomes your resume.
                                        </p>
                                    </div>

                                    {/* Back to Blog Navigation */}
                                    <div className="pt-16 pb-12 relative z-20">
                                        <Link 
                                            href="/blog" 
                                            className="inline-flex items-center gap-3 px-8 py-5 rounded-full bg-white/[0.05] border border-white/10 text-white font-bold text-lg md:text-xl hover:bg-white/[0.1] transition-all duration-300"
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
                            {/* Bottom fade with easing stops */}
                            <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-black via-black/95 via-black/80 via-black/40 via-black/10 to-transparent" />
                            {/* Left fade with easing stops */}
                            <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-black/40 via-black/20 via-black/5 to-transparent hidden lg:block" />
                            {/* Right fade with easing stops */}
                            <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-black/40 via-black/20 via-black/5 to-transparent hidden lg:block" />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title="How to Get a Web3 Job Without Experience"
                url={typeof window !== 'undefined' ? window.location.href : ''}
            />

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
