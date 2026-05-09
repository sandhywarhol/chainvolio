"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Clock, Calendar, User } from "lucide-react";

const articles = [
    {
        title: "Why Traditional CVs Are Broken in Web3",
        slug: "why-traditional-cv-is-broken-in-web3",
        description: "Explore why static PDFs and unverifiable claims are failing the decentralized workforce and how attestations provide a solution.",
        date: "May 10, 2026",
        readTime: "6 min read",
        author: "ChainVolio Team",
        category: "Identity"
    },
    {
        title: "How to Get a Web3 Job Without Experience",
        slug: "how-to-get-a-web3-job-without-experience",
        description: "Learn how to get a Web3 job without traditional experience by building proof of work, contributing publicly, and creating a verifiable reputation.",
        date: "May 12, 2026",
        readTime: "5 min read",
        author: "ChainVolio Team",
        category: "Career"
    },
    {
        title: "What Recruiters Look for in Web3 Talent",
        slug: "what-recruiters-look-for-in-web3-talent",
        description: "Discover what Web3 recruiters actually look for when hiring talent, from proof of work and on-chain reputation to public contributions.",
        date: "May 15, 2026",
        readTime: "6 min read",
        author: "ChainVolio Team",
        category: "Recruitment"
    }
];

export default function BlogIndexPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-amber-200/30">
            <title>Insights & Guides | ChainVolio Blog</title>
            <meta name="description" content="Learn about Web3 resumes, proof of work, hiring, and verifiable professional identity." />
            
            <Navbar />
            
            <div className="relative pt-32 pb-20 px-6">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

                <div className="max-w-[1100px] mx-auto relative z-10">
                    {/* Header */}
                    <div className="space-y-6 mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(253,230,138,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/60">Insights & Guides</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                            The future of work,<br /><span className="text-white/30">unpacked.</span>
                        </h1>
                        <p className="text-xl text-white/40 max-w-2xl font-medium leading-relaxed">
                            Learn about Web3 resumes, proof of work, hiring, and verifiable professional identity.
                        </p>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link key={article.slug} href={`/blog/${article.slug}`} className="group block">
                                <article className="relative h-full flex flex-col p-8 rounded-[32px] bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
                                    {/* Hover Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className="relative z-10 space-y-6 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-black uppercase tracking-widest text-white/40">
                                                {article.category}
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                                                <Clock className="w-3 h-3" />
                                                {article.readTime}
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold tracking-tight text-white/90 leading-snug group-hover:text-white transition-colors">
                                            {article.title}
                                        </h2>
                                        
                                        <p className="text-white/40 text-sm leading-relaxed line-clamp-3">
                                            {article.description}
                                        </p>
                                    </div>

                                    <div className="relative z-10 pt-8 mt-auto border-t border-white/[0.05] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                                <User className="w-4 h-4 text-white/30" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-white/60">{article.author}</span>
                                                <span className="text-[10px] text-white/20">{article.date}</span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-200 group-hover:text-black transition-all duration-500">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
