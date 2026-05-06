"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, ArrowRight, Clock, Calendar, User, Share2, Bookmark } from "lucide-react";

export default function BlogPostPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-amber-200/30">
            <title>Why Traditional CVs Are Broken in Web3 | ChainVolio</title>
            <meta name="description" content="Explore why static PDFs and unverifiable claims are failing the decentralized workforce and how attestations provide a solution." />
            
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
                                    Why Traditional CVs Are Broken in Web3
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
                                        <button className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                                            <Bookmark className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </header>

                            {/* Article Content */}
                            <div className="max-w-none relative z-10 pb-20">
                                <div className="space-y-12 text-base md:text-lg text-white/60 leading-relaxed font-normal">
                                    <p className="text-white/90 font-medium text-xl md:text-2xl leading-snug">
                                        Resumes were built for a world where work happens inside companies. Web3 is different.
                                    </p>
                                    
                                    <p>
                                        Work is open, distributed, and often pseudonymous. Contributions live across GitHub, Discord, DAOs, and on-chain activity. As a result, traditional CVs struggle to represent real work in Web3.
                                    </p>

                                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group/quote">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-200/50" />
                                        <p className="text-white/80 italic text-xl md:text-2xl font-serif">
                                            "And more importantly, they are hard to verify. A traditional CV is based on claims."
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">The Verification Crisis</h2>
                                        <p>
                                            You list your experience, roles, and achievements but there is no built-in way to prove them. In Web3, this becomes a serious issue because:
                                        </p>
                                        <ul className="space-y-4 list-none p-0">
                                            {[
                                                "Anyone can claim to have worked on a project",
                                                "Contributions are scattered across platforms",
                                                "Recruiters have no reliable way to verify work"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200 mt-2" />
                                                    <span className="text-white/70">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <p>
                                        In Web3, work doesn’t follow a linear career path. People contribute to multiple projects at once. They collaborate in DAOs, ship code on GitHub, and interact on-chain. Identity is fluid, and proof of work is fragmented.
                                    </p>

                                    <p className="border-l-4 border-white/10 pl-8 py-2 text-white/30 text-xl md:text-2xl font-medium tracking-tight">
                                        This creates a gap between what someone has done and what they can prove.
                                    </p>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">The Cost of Noise</h2>
                                        <p>
                                            Hiring without verification leads to noise. Recruiters rely on signals that are often incomplete or misleading. Talented contributors get overlooked, while unverifiable claims pass through.
                                        </p>
                                        <p className="text-amber-200/60 font-bold tracking-tight text-2xl md:text-3xl">
                                            Trust becomes the bottleneck.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Proof Over Claims</h2>
                                        <p>
                                            Web3 introduces a better approach: <span className="text-white/80 font-bold underline decoration-amber-200/20 underline-offset-8">proof instead of claims</span>.
                                        </p>
                                        <p>
                                            A Web3 resume is built on verifiable data. Contributions are recorded as on-chain attestations, making them transparent, tamper-proof, and instantly verifiable.
                                        </p>
                                        <p>
                                            Instead of asking “Can we trust this resume?”, recruiters can verify it directly.
                                        </p>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/10 space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Defining the Web3 Resume</h2>
                                        <p>
                                            A Web3 resume is a verifiable record of your work history stored on-chain. Each contribution is backed by cryptographic proof, allowing anyone to validate your experience without relying on trust alone.
                                        </p>
                                        <p className="text-white/80 font-medium">
                                            It transforms your work into a portable and credible identity.
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-12">
                                        <h2 className="text-3xl md:text-4xl font-bold text-white/90 tracking-tight">The ChainVolio Solution</h2>
                                        <p>
                                            ChainVolio helps you turn your work into verifiable proof. By using on-chain attestations, you can build a resume that recruiters can instantly trust. No more PDFs. No more unverifiable claims.
                                        </p>
                                        <p className="text-white/30 italic">
                                            Your work becomes your reputation and it travels with you.
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
        </main>
    );
}
