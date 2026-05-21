"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Globe, Lock, BadgeCheck, FileText, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut", delay: i * 0.1 },
    }),
};

const features = [
    {
        icon: ShieldCheck,
        color: "#14F195",
        title: "Verifiable on-chain work history",
        desc: "Every contribution is anchored to the Solana blockchain permanently. Anyone can verify, no one can alter.",
    },
    {
        icon: BadgeCheck,
        color: "#60a5fa",
        title: "Proof of contributions, not claims",
        desc: "Move beyond self-reported CVs. Your attestations are cryptographically signed by real organizations and peers.",
    },
    {
        icon: Zap,
        color: "#a78bfa",
        title: "Instantly verifiable by recruiters",
        desc: "Recruiters can verify your entire work history in seconds - no calls, no manual checks, no friction.",
    },
    {
        icon: Globe,
        color: "#f59e0b",
        title: "Portable across projects and platforms",
        desc: "Your reputation is tied to your wallet, not a company's database. Take it everywhere in Web3.",
    },
    {
        icon: Lock,
        color: "#34d399",
        title: "Tamper-proof and permanent",
        desc: "Once an attestation is issued on-chain, it cannot be removed, edited, or fabricated.",
    },
    {
        icon: FileText,
        color: "#fb7185",
        title: "Open and transparent",
        desc: "Your public profile is readable by anyone. No walled gardens, no gatekeeping.",
    },
];

const faqs = [
    {
        q: "What is a Web3 resume?",
        a: "A Web3 resume is a verifiable on-chain work history. Instead of listing experiences anyone can claim, it uses cryptographic attestations - signed records from real organizations and peers - to prove your contributions.",
    },
    {
        q: "How is it different from a traditional CV?",
        a: "A traditional CV can be fabricated by anyone. A Web3 resume on ChainVolio is backed by on-chain attestations. Recruiters can verify every claim in seconds without background checks or reference calls.",
    },
    {
        q: "Who can attest to my work?",
        a: "Any verified organization on ChainVolio, or trusted community members and peers, can issue attestations to your profile. Each attestation is signed with their wallet, making it publicly verifiable.",
    },
    {
        q: "Is my data public?",
        a: "Your public CV profile is readable by anyone. However, you control what you add to it. Your wallet connects you to your history - nothing is shared without your action.",
    },
    {
        q: "What blockchain does ChainVolio use?",
        a: "ChainVolio is built on Solana, chosen for its speed, low transaction costs, and strong ecosystem of Web3-native projects.",
    },
];

export function Web3ResumePage() {
    return (
        <main className="min-h-screen bg-black text-white overflow-x-hidden">
            <Navbar />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="relative pt-40 pb-28 px-6 overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.01)_0%,transparent_70%)] pointer-events-none" />

                <div className="max-w-[900px] mx-auto text-center relative">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-8">
                            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">WEB3 RESUME GUIDE</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp} initial="hidden" animate="visible" custom={1}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.04] mb-8"
                    >
                        What is a<br />
                        <span className="text-white/60">
                            Web3 Resume?
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp} initial="hidden" animate="visible" custom={2}
                        className="text-white/40 text-lg md:text-xl leading-relaxed font-medium max-w-2xl mx-auto mb-12"
                    >
                        A verifiable record of your work history, stored on-chain. Instead of listing experiences anyone can claim, it proves your contributions through cryptographic attestations.
                    </motion.p>

                    <motion.div
                        variants={fadeUp} initial="hidden" animate="visible" custom={3}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            href="/create-profile"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold text-sm rounded-2xl hover:bg-white/90 transition-all"
                        >
                            Start Building Your Web3 Resume
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/guides/how-it-works"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.04] text-white/60 border border-white/10 font-bold text-sm rounded-2xl hover:bg-white/[0.08] hover:text-white transition-all"
                        >
                            See How It Works
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── WHAT IS IT ─────────────────────────────────────── */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-2">
                            <p className="text-sm font-black uppercase tracking-[0.22em] text-white/25">The Concept</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                                A resume that proves itself.
                            </h2>
                        </div>
                        <div className="space-y-5 text-white/40 text-base leading-relaxed font-medium">
                            <p>
                                Traditional CVs are self-reported documents. Anyone can claim any title, any achievement, any skill. Recruiters spend hours verifying claims that may or may not be true.
                            </p>
                            <p>
                                A <strong className="text-white/70">Web3 resume</strong> on ChainVolio is different. Every work experience is backed by an <strong className="text-white/60">on-chain attestation</strong> - a cryptographically signed record issued by the organization or peer that actually worked with you.
                            </p>
                            <p>
                                These attestations are stored permanently on Solana. They cannot be altered, removed, or fabricated. Recruiters can verify your entire history in seconds without a single reference call.
                            </p>
                        </div>
                    </motion.div>

                    {/* Comparison Cards */}
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
                        className="space-y-4"
                    >
                        {/* Traditional CV */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400/70 mb-4">Traditional CV</p>
                            <div className="space-y-3">
                                {["Self-reported, unverified claims", "Easily fabricated or exaggerated", "Requires manual background checks", "Attached to platforms, not you"].map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 flex-shrink-0" />
                                        <span className="text-sm text-white/30">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Web3 Resume */}
                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/60 mb-4">Web3 Resume on ChainVolio</p>
                            <div className="space-y-3">
                                {["Cryptographically attested by real organizations", "Tamper-proof and permanently stored on-chain", "Instantly verifiable by any recruiter", "Portable - tied to your wallet, not a platform"].map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <ShieldCheck className="w-4 h-4 text-white/40 flex-shrink-0" />
                                        <span className="text-sm text-white/60">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURES GRID ─────────────────────────────────── */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-[1240px] mx-auto">
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16 space-y-4"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">Key Properties</p>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                            Why your Web3 resume<br />is different.
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.05}
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 hover:bg-white/[0.04] transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.08] bg-white/[0.04] flex-shrink-0">
                                    <f.icon className="w-5 h-5 text-white/40" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-white/90">{f.title}</h3>
                                    <p className="text-xs text-white/30 leading-relaxed">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────────────── */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-[780px] mx-auto">
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="mb-16 space-y-4"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">FAQ</p>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                            Common questions.
                        </h2>
                    </motion.div>

                    <div className="space-y-px">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.05}
                                className="py-8 border-b border-white/[0.06] last:border-0"
                            >
                                <h3 className="text-base md:text-lg font-bold text-white mb-3">{faq.q}</h3>
                                <p className="text-white/40 text-sm md:text-base leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BOTTOM CTA ─────────────────────────────────────── */}
            <section className="py-32 px-6 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.01)_0%,transparent_70%)] pointer-events-none" />
                <div className="max-w-[700px] mx-auto text-center relative space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                        Ready to build your<br />
                        <span className="text-white/60">
                            verifiable Web3 resume?
                        </span>
                    </h2>
                    <p className="text-white/40 text-lg leading-relaxed">
                        Turn your work experience into on-chain proof. Join the builders who let their work speak for itself.
                    </p>
                    <Link
                        href="/create-profile"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black font-bold text-base rounded-2xl hover:bg-white/90 transition-all"
                    >
                        Start Building for Free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
