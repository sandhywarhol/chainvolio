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
            <title>What Recruiters Look for in Web3 Talent | ChainVolio</title>
            <meta name="description" content="Discover what Web3 recruiters actually look for when hiring talent, from proof of work and on-chain reputation to public contributions." />
            
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
                                        6 min read
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.15] text-white/90">
                                    What Recruiters Look for in Web3 Talent
                                </h1>

                                <div className="flex items-center justify-between py-8 border-y border-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/20" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white/90">ChainVolio Team</span>
                                            <span className="text-xs text-white/40">Published on May 15, 2026</span>
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
                                        Hiring in Web3 is different from traditional recruiting.
                                    </p>
                                    
                                    <p>
                                        Most contributors work across multiple projects, identities are often pseudonymous, and resumes are difficult to verify. As a result, recruiters rely on a different set of signals to identify credible talent.
                                    </p>

                                    <div className="p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group/quote text-center">
                                        <p className="text-white/30 text-xl md:text-2xl font-medium tracking-tight mb-4 uppercase text-xs font-black tracking-[0.2em]">The fundamental shift</p>
                                        <p className="text-white/90 text-2xl md:text-4xl font-bold tracking-tighter">
                                            The question is no longer “Where did you work?” <br /> It’s “What can you prove?”
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Proof of Work Matters More Than Titles</h2>
                                        <p>
                                            Job titles carry less weight in Web3.
                                        </p>
                                        <p>
                                            Recruiters care more about shipped products, visible contributions, governance participation, and technical execution. A strong portfolio of real work often outperforms a polished resume with unverifiable claims.
                                        </p>
                                        <p className="text-emerald-400/80 font-bold tracking-tight text-xl md:text-2xl">
                                            Proof creates trust.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Public Contributions Build Credibility</h2>
                                        <p>
                                            Web3 is built in public. Recruiters actively look at these key signals:
                                        </p>
                                        <ul className="space-y-4 list-none p-0">
                                            {[
                                                "GitHub activity and code quality",
                                                "DAO participation and governance votes",
                                                "On-chain interactions and wallet activity",
                                                "Community engagement on Discord/X",
                                                "Content and thought leadership contributions"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2" />
                                                    <span className="text-white/70">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-white/30 italic">
                                            Your public footprint becomes part of your professional identity.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">Verifiable Reputation is Becoming Essential</h2>
                                        <p>
                                            As more people enter Web3, distinguishing real contributors from noise becomes harder.
                                        </p>
                                        <p>
                                            Recruiters increasingly need systems that allow them to verify work history quickly and reliably. Verifiable credentials and on-chain attestations reduce uncertainty and improve hiring confidence.
                                        </p>
                                        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">
                                            Trust becomes scalable.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">The Future of Hiring in Web3</h2>
                                        <p>
                                            Traditional resumes were designed for centralized companies.
                                        </p>
                                        <p>
                                            Web3 requires a more transparent and portable identity system — one that reflects real contributions across ecosystems and communities.
                                        </p>
                                        <p className="border-l-4 border-white/10 pl-8 py-2 text-white/30 text-xl font-medium tracking-tight leading-relaxed">
                                            The future of hiring will be based on verifiable work, not unverifiable claims.
                                        </p>
                                    </div>

                                    <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/10 space-y-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight text-center">Build a Trusted Identity with ChainVolio</h2>
                                        <p>
                                            ChainVolio helps contributors create a verifiable Web3 resume backed by on-chain attestations.
                                        </p>
                                        <p>
                                            Instead of relying on static PDFs, your work history becomes transparent, portable, and instantly verifiable by recruiters.
                                        </p>
                                        <p className="text-white/80 font-medium text-center">
                                            Your reputation becomes an asset you truly own.
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
