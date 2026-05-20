"use client";

// Force re-compile: v2-floating-card
import React, { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
// Dynamic imports for heavy components to improve LCP and initial bundle size
const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black/20 animate-pulse rounded-full" />
});
const SimpleDiagram = dynamic(() => import("./SimpleDiagram"), { ssr: false });
const CompetitiveNetworkDiagram = dynamic(() => import("./CompetitiveNetworkDiagram"), { ssr: false });
const ProblemDiagram = dynamic(() => import("./ProblemDiagram"), { ssr: false });

import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Building2,
    LayoutDashboard,
    FolderOpen,
    Lock,
    Award,
    Globe,
    Terminal,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    User,
    FileCheck2,
    PenLine,
    Share2,
    Boxes,
    Hash,
    Linkedin,
    FileText,
    MapPin,
    Clock,
    Github,
    Mail,
    BadgeCheck,
    Star,
    Check,
    HelpCircle,
    LayoutGrid,
    FileQuestion,
    Activity,
    X,
    Plus,
    Briefcase
} from 'lucide-react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@solana/wallet-adapter-react";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { Toast } from "@/components/ui/Toast";
import { Web3ResumeSection } from "./Web3ResumeSection";
import { useTheme } from "@/components/theme/ThemeProvider";

// --- Interactive Verifiable Work History Flow (3D Chip Style) ---
function VerifiableWorkHistoryFlow() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const nodes: {
        icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> | "profile";
        label: string;
        sublabel: string;
        color: string;
    }[] = [
            { icon: "profile", label: "Your Profile", sublabel: "Identity", color: "#ffffff" },
            { icon: FileCheck2, label: "Work Recorded", sublabel: "Contribution", color: "#94a3b8" },
            { icon: ShieldCheck, label: "Attested", sublabel: "By Org", color: "#94a3b8" },
            { icon: PenLine, label: "Signed", sublabel: "Crypto Sig", color: "#94a3b8" },
            { icon: Boxes, label: "On-Chain", sublabel: "Solana", color: "#94a3b8" },
            { icon: Hash, label: "Hash Created", sublabel: "Immutable", color: "#94a3b8" },
            { icon: Share2, label: "Shareable", sublabel: "To Recruiters", color: "#94a3b8" },
        ];

    const isLineActive = (lineIndex: number) =>
        hoveredIndex !== null && lineIndex < hoveredIndex;

    return (
        <>
            {/* ── DESKTOP VERSION (100% Original from GitHub) ── */}
            <div className="hidden md:flex relative w-full items-center justify-center py-12 pb-16 select-none origin-center">

                <div className="flex items-center w-full max-w-4xl mx-auto px-4">
                    {nodes.map((node, i) => {
                        const isHovered = hoveredIndex === i;
                        const isActive = hoveredIndex !== null && i <= hoveredIndex;
                        const IconComp = node.icon === "profile" ? null : node.icon;
                        const isProfile = node.icon === "profile";
                        const chipW = "52px";
                        const chipH = "52px";
                        const r = "16px";

                        return (
                            <div key={i} className="contents">
                                <div className="relative flex-shrink-0 flex flex-col items-center cursor-pointer z-10"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}>
                                    <motion.div className="relative"
                                        animate={{ y: isHovered ? -10 : 0, rotateX: isHovered ? 0 : 8, rotateY: isHovered ? 0 : -10, scale: isHovered ? 1.1 : 1 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                        style={{ perspective: "600px", transformStyle: "preserve-3d" }}>
                                        <motion.div
                                            animate={{
                                                borderColor: isActive ? node.color + "55" : "rgba(255,255,255,0.09)",
                                                boxShadow: isHovered
                                                    ? `0 0 40px ${node.color}30, 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
                                                    : "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className="relative flex items-center justify-center overflow-hidden"
                                            style={{ width: chipW, height: chipH, borderRadius: r, background: "linear-gradient(145deg, #1e1e1e 0%, #0e0e0e 100%)", border: "1px solid rgba(255,255,255,0.09)" }}>
                                            <div className="absolute inset-x-2 top-0 h-[1px] pointer-events-none" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)" }} />
                                            <div className="absolute inset-y-2 left-0 w-[1px] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.07), transparent)" }} />
                                            <motion.div animate={{ opacity: isActive ? 1 : 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 pointer-events-none" style={{ borderRadius: r, background: `radial-gradient(circle at 40% 40%, ${node.color}22 0%, transparent 65%)` }} />
                                            {isProfile ? <User className="relative z-10 w-6 h-6" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.4)" }} /> : IconComp && <IconComp className="relative z-10 w-7 h-7" style={{ color: isActive ? node.color : "rgba(255,255,255,0.2)" }} />}
                                        </motion.div>
                                    </motion.div>
                                    <motion.div animate={{ opacity: isHovered ? 1 : 0.35, scaleX: isHovered ? 1.4 : 0.85 }} transition={{ duration: 0.25 }} className="pointer-events-none" style={{ width: "100%", height: "10px", marginTop: "6px", background: isActive ? `radial-gradient(ellipse at center, ${node.color}45 0%, transparent 70%)` : "radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)", filter: "blur(4px)" }} />
                                    <div className="absolute -bottom-10 flex flex-col items-center pointer-events-none whitespace-nowrap">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">{node.label}</span>
                                        <span className="text-[9px] text-white/30 tracking-wider mt-0.5">{node.sublabel}</span>
                                    </div>
                                </div>
                                {i < nodes.length - 1 && (
                                    <div className="relative flex-1 h-6 flex items-center mx-1 overflow-visible">
                                        <svg width="100%" height="2" className="absolute top-1/2 -translate-y-1/2 overflow-visible" preserveAspectRatio="none">
                                            <line x1="0" y1="1" x2="100%" y2="1" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" strokeDasharray="4 7" />
                                        </svg>
                                        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: isLineActive(i) ? 1 : 0, scaleX: isLineActive(i) ? 1 : 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="absolute h-[1.5px] w-full pointer-events-none" style={{ top: "50%", transform: "translateY(-50%)", transformOrigin: "left center", background: `linear-gradient(to right, ${nodes[i].color}90, ${nodes[i + 1].color}90)`, boxShadow: `0 0 8px ${nodes[i + 1].color}60` }} />
                                        {isLineActive(i) && (
                                            <motion.div key={`dot-${i}-${hoveredIndex}`} className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none" style={{ background: nodes[i + 1].color, boxShadow: `0 0 8px ${nodes[i + 1].color}, 0 0 16px ${nodes[i + 1].color}60`, left: 0 }} animate={{ left: "100%" }} transition={{ duration: 1.0, repeat: Infinity, ease: "linear", delay: i * 0.12 }} />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── MOBILE VERSION (Optimized Swipeable) ── */}
            <div className="md:hidden relative w-full pt-0 pb-24 overflow-x-auto no-scrollbar active:cursor-grabbing">
                <div className="flex items-center w-max px-12">
                    {nodes.map((node, i) => {
                        const IconComp = node.icon === "profile" ? null : node.icon;
                        const isProfile = node.icon === "profile";
                        const chipW = "58px";
                        const chipH = "58px";
                        const r = "16px";

                        return (
                            <div key={i} className="flex items-center">
                                <div className="relative flex-shrink-0 flex flex-col items-center z-10">
                                    <div className="relative" style={{ perspective: "600px", transformStyle: "preserve-3d" }}>
                                        <div className="absolute top-[7px] left-[5px] w-[58px] h-[58px] rounded-[16px] bg-[#010101] border border-white/5 shadow-xl" />
                                        <div className="relative flex items-center justify-center overflow-hidden w-[58px] h-[58px] rounded-[16px] bg-gradient-to-br from-[#1e1e1e] to-[#0e0e0e] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
                                            {isProfile ? <User className="relative z-10 w-5 h-5 text-white/40" /> : IconComp && <IconComp className="w-5 h-5" style={{ color: node.color }} />}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-14 w-28 text-center pointer-events-none">
                                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{node.label}</p>
                                        <p className="text-[9px] text-white/30 uppercase tracking-tight">{node.sublabel}</p>
                                    </div>
                                </div>
                                {i < nodes.length - 1 && (
                                    <div className="relative w-12 h-[1.5px] bg-white/5 overflow-hidden mx-[-2px]">
                                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

// --- Static UI Mockup for Feature Card ---
function MockProfileUI() {
    return (
        <div className="w-full h-full flex flex-col md:flex-row font-sans text-sm overflow-hidden">
            {/* 1. Sidebar (Linear Style) */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.01] p-6 md:p-6 flex flex-col gap-4 md:gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-white/50">AR</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white/90 tracking-tight">Alex Rivera</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">Member</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {[
                        { icon: LayoutDashboard, label: "Overview", active: true },
                        { icon: ShieldCheck, label: "Verifications" },
                        { icon: FolderOpen, label: "Collections" },
                        { icon: Terminal, label: "Activity" }
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${item.active ? 'bg-white/5 text-white' : 'text-white/40 hover:bg-white/[0.02] hover:text-white/60'}`}>
                            <item.icon className={`w-4 h-4 ${item.active ? 'text-amber-400' : ''}`} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Trust Signal</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[11px] font-bold text-white/70">Score: 98</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-y-auto md:overflow-hidden">
                {/* Content Header */}
                <div className="h-14 border-b border-white/5 px-8 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Active Grants</span>
                        <div className="w-[1px] h-4 bg-white/5"></div>
                        <span className="text-[11px] font-bold text-white/80">NX-2703</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">In Progress</div>
                    </div>
                </div>

                {/* Main Body - Fixed Size, No Scroll */}
                <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h4 className="text-2xl font-bold text-white tracking-tight leading-tight">Nexus Protocol Grant #882</h4>
                        <p className="text-white/40 text-sm leading-relaxed max-w-2xl">
                            Core systems development and parallel transaction processing optimization for the Nexus mainnet infrastructure.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Detailed Activity</span>
                        <div className="space-y-3">
                            {[
                                "Built staking contract module using Anchor framework",
                                "Integrated Core optimization for Lumina mainnet nodes",
                                "Reduced transaction latency by 30% through parallel processing"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-colors">
                                    <div className="mt-0.5 flex-shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <span className="text-[12px] text-white/60 font-medium leading-none">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Verified Attestations</span>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { name: "Lumina", color: "bg-blue-500" },
                                { name: "Apex Guild", color: "bg-amber-500" }
                            ].map((org, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className={`w-2 h-2 rounded-full ${org.color}`}></div>
                                    <span className="text-[11px] font-bold text-white/80">{org.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="h-12 border-t border-white/5 px-8 flex items-center justify-between opacity-30 bg-white/[0.01]">
                    <div className="flex gap-6">
                        <code className="text-[10px] font-mono text-white/60 tracking-tighter">SIG: 5k2R...j8Wq</code>
                        <span className="text-[10px] text-white/40 font-mono tracking-tighter">2025-03-24 14:02 UTC</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/60">
                        View Proof <ExternalLink className="w-3 h-3" />
                    </div>
                </div>
            </div>

        </div>
    );
}

// ─── Stacked Feature Cards ───────────────────────────────────────────────────

// Linear-style card shell
const CARD_BASE: React.CSSProperties = {
    width: "min(300px, calc(100vw - 48px))",
    borderRadius: "14px",
    overflow: "hidden",
    position: "relative",
    background: "#080808",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
};

// Shared header dots (three-dot menu like Linear)
function CardDots() {
    return (
        <div className="flex items-center gap-1">
            {[0, 1, 2].map(i => (
                <div key={i} className="w-[3px] h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
            ))}
        </div>
    );
}

// Initials avatar
function Avatar({ initials, color }: { initials: string; color: string }) {
    return (
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
            style={{ background: color + "22", color, border: `1px solid ${color}33` }}>
            {initials}
        </div>
    );
}

// Card 1 — Activity Feed (emerald) — like Linear's left Activity panel
function AttestationCard() {
    const items = [
        { initials: "DC", color: "#34d399", name: "David Chen", action: "attested your work on", subject: "Brand Identity Design", time: "2m ago" },
        { initials: "GD", color: "#60a5fa", name: "Glassdoor", action: "verified your employment at", subject: "Stripe", time: "1h ago" },
        { initials: "SA", color: "#a78bfa", name: "Smart Contract Auditor", action: "attested your audit on", subject: "Payment Protocol v2", time: "3h ago" },
        { initials: "GH", color: "#f59e0b", name: "GitHub", action: "verified your contribution in", subject: "chainvolio/identity-core", time: "1d ago" },
    ];
    return (
        <div style={CARD_BASE} className="theme-preserve">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)" }}>
                        <ShieldCheck style={{ width: 11, height: 11, color: "#34d399" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>Activity</span>
                </div>
                <CardDots />
            </div>

            {/* Filter pill */}
            <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>All</span>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 3l2 2 2-2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" /></svg>
                </div>
            </div>

            {/* Activity items */}
            <div className="py-1">
                {items.map((item, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors cursor-default"
                        style={{ borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <Avatar initials={item.initials} color={item.color} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>{item.name}</span>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", flexShrink: 0 }}>{item.time}</span>
                            </div>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.5, marginTop: 1 }}>
                                {item.action}
                            </p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.58)", fontWeight: 500, marginTop: 1 }}>
                                {item.subject}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Card 2 — Attestation Issuance (blue) — like Linear's center Thread panel
function OrgIssuerCard() {
    return (
        <div style={CARD_BASE} className="theme-preserve">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(96,165,250,0.12)" }}>
                        <PenLine style={{ width: 11, height: 11, color: "#60a5fa" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>Issuing Attestation</span>
                </div>
                <CardDots />
            </div>

            {/* Thread messages */}
            <div className="px-4 pt-4 space-y-4">
                {/* Org message */}
                <div className="flex items-start gap-3">
                    <Avatar initials="NP" color="#60a5fa" />
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>Nexus Protocol</span>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>4:54 PM</span>
                        </div>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", lineHeight: 1.55 }}>
                            Issuing attestation for exceptional work on core infrastructure and parallel transaction optimization for mainnet.
                        </p>
                    </div>
                </div>

                {/* Contributor message */}
                <div className="flex items-start gap-3">
                    <Avatar initials="AR" color="#34d399" />
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>Alex Rivera</span>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>4:54 PM</span>
                        </div>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", lineHeight: 1.55 }}>
                            Transaction confirmed on Solana. This record is now public and tamper-proof forever.
                        </p>
                    </div>
                </div>

                {/* System message */}
                <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
                        <ShieldCheck style={{ width: 12, height: 12, color: "#60a5fa" }} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>ChainVolio</span>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>4:55 PM</span>
                        </div>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", lineHeight: 1.55 }}>
                            Signature verified. Attestation anchored on-chain and ready to share with recruiters.
                        </p>
                    </div>
                </div>
            </div>

            {/* Compose bar */}
            <div className="px-4 pb-4 pt-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", flex: 1 }}>@Nexus Protocol sign and issue...</span>
                    <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#5e6ad2" }}>
                            <ArrowRight style={{ width: 11, height: 11, color: "white" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Card 3 — Updates / Notifications (purple) — like Linear's right Updates panel
function PublicVerifyCard() {
    const updates = [
        { icon: CheckCircle2, color: "#34d399", dot: true, title: "Attestation Received", desc: "Superteam attested your grant", time: "2h ago" },
        { icon: ShieldCheck, color: "#60a5fa", dot: true, title: "Audit Passed", desc: "Smart contract audit passed", time: "5h ago" },
        { icon: User, color: "#a78bfa", dot: false, title: "New Attestation", desc: "0xA34F...BCd2 attested your work", time: "1d ago" },
        { icon: Globe, color: "#f59e0b", dot: false, title: "Identity Verified", desc: "Your wallet has been verified", time: "2d ago" },
    ];
    return (
        <div style={CARD_BASE} className="theme-preserve">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(167,139,250,0.12)" }}>
                        <Globe style={{ width: 11, height: 11, color: "#a78bfa" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>Updates</span>
                </div>
                <CardDots />
            </div>

            {/* Filter */}
            <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Unread</span>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 3l2 2 2-2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" /></svg>
                </div>
            </div>

            {/* Updates list */}
            <div className="py-1">
                {updates.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors cursor-default"
                            style={{ borderBottom: i < updates.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: item.color + "14", border: `1px solid ${item.color}22` }}>
                                <Icon style={{ width: 12, height: 12, color: item.color + "bb" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{item.title}</span>
                                    {item.dot && <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: "#5e6ad2" }} />}
                                </div>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2, lineHeight: 1.4 }}>{item.desc}</p>
                                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", marginTop: 3 }}>{item.time}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Block 1 — stateful wrapper so hover on left controls active card on right
function AttestationBlock() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    // Auto-advance every 3.5 s, pauses on hover
    useEffect(() => {
        if (paused) return;
        const t = setInterval(() => setActive(p => (p + 1) % 3), 3500);
        return () => clearInterval(t);
    }, [paused]);

    const features = [
        { icon: ShieldCheck, label: "Verifiable on-chain proof", desc: "Each attestation is stored permanently on Solana.", color: "#94a3b8" },
        { icon: Building2, label: "Issued by real organizations", desc: "Only verified orgs and collaborators can attest.", color: "#60a5fa" },
        { icon: Lock, label: "Public and tamper-resistant", desc: "Anyone can verify, no one can alter or revoke.", color: "#a78bfa" },
    ];

    const cards = [<AttestationCard />, <OrgIssuerCard />, <PublicVerifyCard />];

    // pos 0 = center (active), pos 1 = right peek, pos 2 = left peek
    const stackAnim = (pos: number) => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const xOffset = isMobile ? (window.innerWidth < 400 ? 35 : 55) : 160;

        if (pos === 0) return { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 30, filter: "blur(0px)" };
        if (pos === 1) return { x: xOffset, y: 40, scale: 0.9, opacity: 0.5, zIndex: 20, filter: "blur(1.5px)" };
        return { x: -xOffset, y: 40, scale: 0.9, opacity: 0.5, zIndex: 20, filter: "blur(1.5px)" };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
        >
            {/* Left — copy */}
            <div className="space-y-10">
                <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02]">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200/60">Core Feature</span>
                    </div>
                    <p className="text-lg md:text-xl font-normal text-white/60 tracking-tight">
                        Verifiable Work History with On-Chain Attestations
                    </p>
                    <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.06]">
                        Proof of work,<br /><span className="text-amber-200/60">not claims.</span>
                    </h3>
                    <div className="h-px w-full max-w-6xl bg-white/10" />
                    <p className="text-white/40 text-sm md:text-lg leading-relaxed font-normal max-w-md">
                        Attestations turn real contributions into verifiable records. Every endorsement is cryptographically signed, creating a tamper-proof work history.
                    </p>
                </div>

                {/* Feature rows — hover controls which card is centred */}
                <div className="divide-y divide-white/[0.04]">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            onHoverStart={() => { setPaused(true); setActive(i); }}
                            onHoverEnd={() => setPaused(false)}
                            onClick={() => { setPaused(true); setActive(i); setTimeout(() => setPaused(false), 8000); }}
                            animate={{ opacity: active === i ? 1 : 0.45 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-start gap-4 py-4 cursor-pointer"
                        >
                            <motion.div
                                animate={{
                                    background: active === i ? f.color + "18" : f.color + "08",
                                    borderColor: active === i ? f.color + "35" : f.color + "15",
                                }}
                                transition={{ duration: 0.25 }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border"
                            >
                                <f.icon className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ color: active === i ? f.color : f.color + "55" }} />
                            </motion.div>
                            <div>
                                <p className={`text-sm font-bold mb-0.5 ${active === i ? "text-white/90" : "text-white/50"}`}>
                                    {f.label}
                                </p>
                                <p className="text-xs text-white/25 leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Right — Linear-style horizontal carousel */}
            <div className="theme-preserve flex flex-col gap-8">
                <div className="relative" style={{ height: "560px" }}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >


                    {/* Cards — all anchored to horizontal centre */}
                    {cards.map((card, i) => {
                        const pos = (i - active + 3) % 3;
                        const anim = stackAnim(pos);
                        return (
                            <motion.div
                                key={i}
                                animate={{ x: anim.x, y: anim.y, scale: anim.scale, opacity: anim.opacity, filter: anim.filter }}
                                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                                className="absolute top-7 left-1/2 -ml-[min(150px,calc(50vw-24px))]"
                                style={{
                                    zIndex: anim.zIndex,
                                }}
                            >
                                {card}
                            </motion.div>
                        );
                    })}

                    {/* Dot indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
                        {features.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => { setActive(i); setPaused(true); setTimeout(() => setPaused(false), 6000); }}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: active === i ? 20 : 6,
                                    height: 6,
                                    background: active === i ? features[active].color + "cc" : "rgba(255,255,255,0.18)",
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-center lg:justify-start">
                    <Link href="/guides/attestation" className="inline-flex items-center gap-2 text-sm font-bold text-white/30 hover:text-white/80 transition-colors duration-200 group">
                        Explore attestations
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

// --- Mobile UI Mockup for Feature Card ---
// --- Floating Feature Card (Overlay) ---
function FloatingVerificationCard() {
    return (
        <div className="theme-preserve w-[340px] bg-[#0c0c0c]/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col font-sans"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}
        >
            {/* Card Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Verified Proof</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-white/40">AR</span>
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white">Alex Rivera</h4>
                        <p className="text-[10px] text-white/30 font-medium">Nexus Protocol • Grant #882</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-white/20 uppercase">On-Chain Attestation</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500/60" />
                    </div>
                    <p className="text-[11px] text-white/70 font-medium leading-relaxed">
                        Technical contribution verified by Lumina Systems core infrastructure audit team.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Hash ID</span>
                        <code className="text-[9px] text-emerald-400/60 font-mono">0x4f2d...9b1a</code>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-dashed border-white/10 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30"></div>
        </div>
    );
}

// --- Recruiter Dashboard Preview UI V2 (carousel — state lifted to HiringBlock) ---
function RecruiterDashboardPreviewUI_V2({
    active,
    setActive,
    paused,
    setPaused,
}: {
    active: number;
    setActive: React.Dispatch<React.SetStateAction<number>>;
    paused: boolean;
    setPaused: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const slides = [
        { label: "Verified signal candidates", color: "#60a5fa" },
        { label: "Org-backed endorsements", color: "#94a3b8" },
        { label: "Post your job link anywhere", color: "#f59e0b" },
    ];

    const panels = [
        // Box 0: Talent Pool (Verified Signal)
        <div key={0} className="theme-preserve w-full h-[360px] bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white tracking-tight">Talent Pool</h4>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Verified Signal</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hidden sm:block">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Top Match</span>
                </div>
            </div>

            {/* Profile Card */}
            <div className="flex-1 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 p-4 sm:p-5 relative overflow-hidden flex flex-col justify-center shadow-inner">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-lg font-black text-white/80 shadow-lg">
                            AR
                        </div>
                        <div>
                            <h5 className="text-base font-bold text-white mb-0.5">Alex Rivera</h5>
                            <p className="text-xs text-white/40">Sr. Rust Developer</p>
                        </div>
                    </div>
                    
                    {/* Trust Score Badge */}
                    <div className="flex flex-col items-center justify-center relative">
                        <span className="text-[8px] font-bold text-[#14F195]/60 uppercase tracking-widest mb-1">Score</span>
                        <div className="w-12 h-12 rounded-full bg-[#14F195]/10 border border-[#14F195]/30 shadow-[0_0_15px_rgba(20,241,149,0.15)] flex items-center justify-center">
                            <span className="text-lg font-black text-[#14F195]">98</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                    <div className="p-3 rounded-xl bg-[#0D0D0D] border border-white/5 shadow-md">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5 font-bold">On-Chain Signals</p>
                        <p className="text-lg font-black text-blue-400 leading-none">142</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0D0D0D] border border-white/5 shadow-md">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5 font-bold">Org Attestations</p>
                        <p className="text-lg font-black text-indigo-400 leading-none">12</p>
                    </div>
                </div>
            </div>
        </div>,

        // Box 1: Org-Backed Trust (Endorsement Chain)
        <div key={1} className="theme-preserve w-full h-[360px] bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white tracking-tight">Trust Network</h4>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Endorsement Chain</p>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 relative pl-5 space-y-5 border-l-2 border-white/[0.08] ml-3 flex flex-col justify-center">
                {[
                    { org: "Nexus Protocol", role: "Core Contributor", date: "Q3 2024", color: "#94a3b8" },
                    { org: "Superteam", role: "Grant Winner", date: "Q1 2024", color: "#60a5fa" },
                    { org: "Solana Foundation", role: "Hackathon 1st", date: "2023", color: "#14F195" },
                ].map((e, i) => (
                    <div key={i} className="relative group">
                        <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-[3px] border-[#0D0D0D] transition-transform duration-300 group-hover:scale-125" style={{ background: e.color }} />
                        <div className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors flex items-center justify-between shadow-md">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheck className="w-4 h-4" style={{ color: e.color }} />
                                    <h5 className="text-sm font-bold text-white/90">{e.org}</h5>
                                </div>
                                <p className="text-[10px] text-white/40">{e.role}</p>
                            </div>
                            <span className="text-[10px] font-medium text-white/30 bg-white/5 px-2 py-1 rounded-md">{e.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>,
 
        // Box 2: Post Anywhere (Share Link)
        <div key={2} className="theme-preserve w-full h-[360px] bg-[#0D0D0D] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white tracking-tight">Distribution</h4>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Portable Job Link</p>
                    </div>
                </div>
            </div>
            
            {/* Share Widget - Launchpad Style */}
            <div className="flex-1 flex flex-col gap-3 relative z-10">
                {/* Primary Link Card */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2 relative group/link hover:bg-white/[0.05] transition-all duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Live Link</span>
                        </div>
                        <div className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Encrypted</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-bold text-white tracking-tight truncate">chainvolio.xyz/hire/rust-dev</span>
                        <button className="flex-shrink-0 w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all shadow-lg active:scale-95">
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Social Channels */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                    {/* LinkedIn Channel */}
                    <div className="rounded-xl border border-white/5 bg-gradient-to-br from-[#0077b5]/10 to-transparent p-3 flex flex-col justify-between group/social hover:border-[#0077b5]/30 transition-all duration-500 cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="w-7 h-7 rounded-lg bg-[#0077b5]/20 flex items-center justify-center">
                                <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                            </div>
                            <ArrowRight className="w-3 h-3 text-white/20 group-hover/social:text-white/60 group-hover/social:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <h5 className="text-[11px] font-bold text-white mb-0.5">LinkedIn</h5>
                            <p className="text-[8px] text-white/30 leading-tight">Professional network</p>
                        </div>
                        <div className="mt-2 py-1.5 w-full rounded-lg bg-[#0077b5] text-white text-[9px] font-black uppercase tracking-widest text-center shadow-lg shadow-[#0077b5]/20 opacity-80 group-hover/social:opacity-100 transition-opacity">
                            Share Post
                        </div>
                    </div>

                    {/* X Channel */}
                    <div className="rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-3 flex flex-col justify-between group/social hover:border-white/20 transition-all duration-500 cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                                <span className="text-xs font-black text-white">X</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-white/20 group-hover/social:text-white/60 group-hover/social:translate-x-1 transition-all" />
                        </div>
                        <div>
                            <h5 className="text-[11px] font-bold text-white mb-0.5">X / Twitter</h5>
                            <p className="text-[8px] text-white/30 leading-tight">Instant broadcast</p>
                        </div>
                        <div className="mt-2 py-1.5 w-full rounded-lg bg-white text-black text-[9px] font-black uppercase tracking-widest text-center shadow-lg shadow-white/10 opacity-90 group-hover/social:opacity-100 transition-opacity">
                            Blast Link
                        </div>
                    </div>
                </div>
            </div>
        </div>,
    ];

    const cardAnim = (pos: number) => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const xOffset = isMobile ? (window.innerWidth < 400 ? 60 : 90) : 90;

        if (pos === 0) return { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 30, filter: "blur(0px)" };
        if (pos === 1) return { x: xOffset, y: 15, scale: 0.85, opacity: 0.35, zIndex: 20, filter: "blur(2px)" };
        if (pos === 2) return { x: -xOffset, y: 15, scale: 0.85, opacity: 0.35, zIndex: 20, filter: "blur(2px)" };
        return { x: 0, y: 30, scale: 0.75, opacity: 0, zIndex: 10, filter: "blur(4px)" };
    };

    return (
        <>
            <div className="w-full max-w-[460px] relative left-1/2 -translate-x-1/2 scale-[0.82] min-[400px]:scale-[0.92] sm:scale-95 md:scale-100 lg:scale-100 origin-top"
                style={{ height: 380 }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {/* Carousel */}
                <div className="absolute inset-0">
                    {panels.map((panel, i) => {
                        const pos = (i - active + 3) % 3;
                        const anim = cardAnim(pos);
                        return (
                            <motion.div
                                key={i}
                                animate={{ x: anim.x, y: anim.y, scale: anim.scale, opacity: anim.opacity, filter: anim.filter }}
                                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                                className="absolute top-0 left-0 w-full"
                                style={{ zIndex: anim.zIndex, pointerEvents: pos === 0 ? "auto" : "none" }}
                            >
                                {panel}
                            </motion.div>
                        );
                    })}

                    {/* Swipe Overlay for Mobile */}
                    <motion.div
                        className="absolute inset-0 z-50 md:hidden"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(e: any, info: any) => {
                            if (info.offset.x < -30) setActive((prev) => (prev + 1) % 3);
                            if (info.offset.x > 30) setActive((prev) => (prev - 1 + 3) % 3);
                        }}
                    />
                </div>
            </div>

            {/* Dot indicators — Moved outside the box */}
            <div className="flex items-center justify-center gap-2 mt-6 relative z-10">
                {slides.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => { setActive(i); setPaused(true); setTimeout(() => setPaused(false), 6000); }}
                        className="rounded-full transition-all duration-300"
                        style={{ width: active === i ? 20 : 6, height: 6, background: active === i ? s.color + "cc" : "rgba(255,255,255,0.18)" }}
                    />
                ))}
            </div>
        </>
    );
}

// Block 2 — Hiring — state lifted here, controls both bullets and carousel
function HiringBlock() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;
        const t = setInterval(() => setActive(p => (p + 1) % 3), 3500);
        return () => clearInterval(t);
    }, [paused]);

    const features = [
        { icon: ShieldCheck, label: "Verified Signal Only", desc: "Surface candidates with proven on-chain records. No more guessing based on unverified PDF resumes.", color: "#60a5fa", slide: 0 },
        { icon: Building2, label: "Org-Backed Trust", desc: "See exactly which protocols and organizations have attested to a candidate's specific work output.", color: "#94a3b8", slide: 1 },
        { icon: Share2, label: "Post Anywhere, Instantly", desc: "Share a portable job link to LinkedIn, Twitter, Discord, or any platform. One link, verified by ChainVolio.", color: "#f59e0b", slide: 2 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
        >
            {/* Left — interactive dashboard */}
            <div className="relative order-2 lg:order-1">

                <RecruiterDashboardPreviewUI_V2
                    active={active}
                    setActive={setActive}
                    paused={paused}
                    setPaused={setPaused}
                />

                <div className="mt-8 flex justify-center lg:justify-start">
                    <Link href="/hiring/create" className="inline-flex items-center gap-2 text-sm font-bold text-white/30 hover:text-white/80 transition-colors duration-200 group">
                        Start hiring
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                </div>
            </div>

            {/* Right — copy & hover-controlled feature rows */}
            <div className="space-y-10 order-1 lg:order-2">
                <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02]">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#fde68a99]">Use Case</span>
                    </div>

                    <p className="text-lg md:text-xl font-normal text-white/60 tracking-tight">
                        How to Hire Verified Web3 Talent
                    </p>
                    <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.06]">
                        Hire based on real proof,<br /><span className="text-amber-200/60">not profiles.</span>
                    </h3>
                    <div className="h-px w-full max-w-6xl bg-white/10" />
                    <p className="text-white/40 text-[13px] md:text-lg leading-relaxed font-normal max-w-md">
                        Discover talent through verified work history and trusted signals. Filter noise and identify candidates with real, proven contributions.
                    </p>
                </div>

                {/* Feature rows — hover controls carousel */}
                <div className="divide-y divide-white/[0.04]">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            onHoverStart={() => { setPaused(true); setActive(f.slide); }}
                            onHoverEnd={() => setPaused(false)}
                            onClick={() => { setPaused(true); setActive(f.slide); setTimeout(() => setPaused(false), 8000); }}
                            animate={{ opacity: active === f.slide ? 1 : 0.4 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-start gap-4 py-4 cursor-pointer"
                        >
                            <motion.div
                                animate={{
                                    background: active === f.slide ? f.color + "18" : f.color + "08",
                                    borderColor: active === f.slide ? f.color + "35" : f.color + "15",
                                }}
                                transition={{ duration: 0.25 }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border"
                            >
                                <f.icon className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ color: active === f.slide ? f.color : f.color + "55" }} />
                            </motion.div>
                            <div>
                                <p className={`text-sm font-bold mb-1 ${active === f.slide ? "text-white/90" : "text-white/50"}`}>
                                    {f.label}
                                </p>
                                <p className={`text-xs leading-relaxed ${active === f.slide ? "text-white/40" : "text-white/20"}`}>
                                    {f.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}


const SLIDES = [
    { src: "/homepage/image%20slide%202/cv%20view2.svg", label: "Professional Profile" },
    { src: "/homepage/image%20slide%202/dashboard%202.svg", label: "Recruiter dashboard" },
    { src: "/homepage/image%20slide%202/edit%20profile%202.svg", label: "Profile customization" },
    { src: "/homepage/image%20slide%202/proof%20of%20work%202.svg", label: "Verifiable work" },
    { src: "/homepage/image%20slide%202/attestation.svg", label: "On-chain attestations" },
    { src: "/homepage/image%20slide%202/status.svg", label: "Verification status" },
];


const PARTNERS = [
    { src: "/logos/solana.png", name: "Solana" },
    { src: "/logos/behance.png", name: "Behance" },
    { src: "/logos/github.png", name: "GitHub" },
    { src: "/logos/google drive.png", name: "Google Drive" },
    { src: "/logos/linkedin.png", name: "LinkedIn" },
    { src: "/logos/dribbble.png", name: "Dribbble" },
    { src: "/logos/phantom.png", name: "Phantom" },
    { src: "/logos/slack.png", name: "Slack" },
    { src: "/logos/discord.png", name: "Discord" },
    { src: "/logos/dropbox.png", name: "Dropbox" },
    { src: "/logos/superteam.png", name: "Superteam" },
    { src: "/logos/figma.png", name: "Figma" },
    { src: "/logos/notion.png", name: "Notion" },
    { src: "/logos/canva.png", name: "Canva" },
    { src: "/logos/alchemy.png", name: "Alchemy" },
    { src: "/logos/pdf.png", name: "PDF" },
    { src: "/logos/telegram.png", name: "Telegram" },
    { src: "/logos/solflare.png", name: "Solflare" },
    { src: "/logos/X.png", name: "X" },
];

// Isolated component so useSearchParams doesn't suspend the whole page.
// Wrapped in its own <Suspense> inside LandingPageClient.
function SearchParamsConsumer({ onModal }: { onModal: (modal: string) => void }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    // Stable ref so the effect deps don't include the inline arrow from the parent.
    const onModalRef = useRef(onModal);
    onModalRef.current = onModal;
    useEffect(() => {
        const modal = searchParams.get('modal');
        if (modal === 'how') { router.push('/guides/how-it-works'); return; }
        if (modal === 'recruiters' || modal === 'talent' || modal === 'ask' || modal === 'screening' || modal === 'attestation') {
            onModalRef.current(modal);
        }
    }, [searchParams, router]);
    return null;
}

export function LandingPageClient() {
    const { publicKey, connected } = useWallet();
    const [profile, setProfile] = useState<any>(null);
    const [activeModal, setActiveModal] = useState<'how' | 'recruiters' | 'talent' | 'ask' | 'screening' | 'attestation' | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" } | null>(null);
    const heroVideoRef = useRef<HTMLVideoElement>(null);
    const { theme } = useTheme();
    const router = useRouter();

    const filteredSlides = theme === 'light'
        ? SLIDES.filter(s => !s.src.includes('apply'))
        : SLIDES;

    useEffect(() => {
        if (currentSlide >= filteredSlides.length) {
            setCurrentSlide(0);
        }
    }, [theme, filteredSlides.length, currentSlide]);

    useEffect(() => {
        if (heroVideoRef.current) {
            heroVideoRef.current.playbackRate = 0.5;
        }
    }, []);

    // Mobile Carousel States
    const [problemIdx, setProblemIdx] = useState(1);
    const [whyIdx, setWhyIdx] = useState(1);
    const [solutionIdx, setSolutionIdx] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    const problems = [
        { title: "Broken Work History", id: 0 },
        { title: "Unverifiable Resumes", id: 1 },
        { title: "Signal Lost in Noise", id: 2 }
    ];
    const clonedProblems = [problems[2], ...problems, problems[0]];

    const handleProblemLoop = (newIdx: number) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setProblemIdx(newIdx);
    };

    const handleWhyLoop = (newIdx: number) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setWhyIdx(newIdx);
    };

    const handleSolutionLoop = (newIdx: number) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setSolutionIdx(newIdx);
    };

    const onAnimationComplete = () => {
        setIsAnimating(false);
        // Teleport for Problem
        if (problemIdx === 0) setProblemIdx(3);
        if (problemIdx === 4) setProblemIdx(1);
        // Teleport for Why
        if (whyIdx === 0) setWhyIdx(3);
        if (whyIdx === 4) setWhyIdx(1);
        // Teleport for Solution
        if (solutionIdx === 0) setSolutionIdx(3);
        if (solutionIdx === 4) setSolutionIdx(1);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % filteredSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [filteredSlides.length]);

    // Auto-slide for Problem Carousel on Mobile
    useEffect(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (!isMobile) return;

        const timer = setInterval(() => {
            if (!isAnimating) {
                handleProblemLoop(problemIdx + 1);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [problemIdx, isAnimating]);

    useEffect(() => {
        if (!connected || !publicKey) {
            setProfile(null);
            return;
        }
        const wallet = publicKey.toBase58();
        fetch(`/api/user/me?wallet=${wallet}`)
            .then((r) => r.json())
            .then((data) => setProfile(data))
            .catch(() => setProfile(null));
    }, [publicKey, connected]);


    return (
        <div className="min-h-screen flex flex-col relative selection:bg-teal-500/30 selection:text-white">
            <Suspense fallback={null}>
                <SearchParamsConsumer onModal={(modal) => setActiveModal(modal as any)} />
            </Suspense>
            <Navbar
                isVerified={!!profile?.isVerified}
                verifierTier={profile?.verifierTier}
                verificationTier={profile?.verificationTier}
                onHowItWorksClick={() => router.push('/guides/how-it-works')}
                onRecruitersClick={() => setActiveModal('recruiters')}
                onTalentClick={() => setActiveModal('talent')}
                onAskClick={() => setActiveModal('ask')}
                onScreeningClick={() => router.push('/guides/screening')}
                onAttestationClick={() => router.push('/guides/attestation')}
            />

            <main className="flex-1 flex flex-col relative overflow-hidden theme-bg-page theme-aware" style={{ background: "#0d0d0f" }}>

                {/* HERO SECTION */}
                {/* Background spotlight — center of glow sits ~35% down the page (lower-half of hero), Linear-style */}
                <div className="absolute inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse 110% 35% at 50% 35%, rgba(72,68,90,0.36) 0%, rgba(32,30,40,0.18) 45%, transparent 70%)" }} />
                <section className="relative pt-20 sm:pt-28 md:pt-36 pb-0 px-4 sm:px-6 z-20 max-w-[1100px] mx-auto flex flex-col w-full">

                    {/* Announcement badge — top right corner, Linear-style */}
                    <div className="flex justify-end mb-8 sm:mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.09] bg-white/[0.025] backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70 animate-pulse flex-shrink-0" />
                            <span className="text-[11px] text-white/50 font-medium tracking-[-0.01em] whitespace-nowrap">
                                Trust layer for Web3
                            </span>
                            <ArrowRight className="w-3 h-3 text-white/25 flex-shrink-0" />
                        </div>
                    </div>

                    {/* Headline — large, left-aligned, Linear proportions */}
                    <h1 className="text-[36px] sm:text-[50px] md:text-[58px] lg:text-[66px] font-bold tracking-[-0.025em] leading-[1.08] text-white max-w-[820px] mb-5 sm:mb-6">
                        Build a Verifiable Web3
                        <br />Resume <span className="text-amber-200/60">That Recruiters Trust.</span>
                    </h1>

                    {/* Subtitle — below headline, left-aligned, narrow */}
                    <p className="text-white/40 text-[14px] sm:text-[15px] font-normal leading-relaxed max-w-[500px]">
                        Signed by real people. Anchored on Solana.
                        <br />Cryptographically verified. Share anywhere with one link.
                    </p>

                    {/* HERO VISUAL - App UI Card Mockup */}
                    <div className="relative w-full mt-6 sm:mt-8 flex items-center justify-center h-[220px] min-[400px]:h-[260px] sm:h-[345px] md:h-[450px] lg:h-[560px] overflow-hidden rounded-[20px] sm:rounded-[28px]"
                        style={{ background: "radial-gradient(ellipse 140% 100% at 50% 0%, #ebebef 0%, #e3e3e8 45%, #d8d8de 100%)" }}>
                        {/* DSLR vignette — natural lens falloff */}
                        <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse 90% 85% at 50% 30%, transparent 25%, rgba(0,0,0,0.5) 100%)" }} />
                        {/* Studio key light from top */}
                        <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse 65% 45% at 50% 0%, rgba(255,255,255,0.45) 0%, transparent 55%)" }} />
                        {/* Bottom fade back to dark page */}
                        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none z-20" style={{ background: "linear-gradient(to bottom, transparent, #0d0d0f)" }} />
                        {/* Container scaled responsively */}
                        <div 
                            className="w-[960px] h-[540px] absolute scale-[0.38] min-[400px]:scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top transition-all duration-300 flex-shrink-0"
                        >
                            {/* ── LINEAR-STYLE 3-PANEL APP MOCKUP ── */}
                            <div className="absolute inset-0 rounded-2xl overflow-hidden flex" style={{ background: "#0d0e11", border: "1px solid rgba(255,255,255,0.08)" }}>

                                {/* ── LEFT SIDEBAR ── */}
                                <div className="w-[195px] flex-shrink-0 flex flex-col h-full" style={{ background: "#111215", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                                    {/* Logo */}
                                    <div className="flex items-center px-4 h-[46px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <img src="/chainvolio%20logo.png" alt="chainvolio" style={{ height: 20, width: "auto", objectFit: "contain" }} />
                                    </div>
                                    {/* Nav items */}
                                    <div className="px-2 py-2.5 flex-1 space-y-0.5">
                                        <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-md relative" style={{ background: "rgba(255,255,255,0.07)" }}>
                                            <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
                                            <User style={{ width: 13, height: 13, color: "rgba(255,255,255,0.8)", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>Profile</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-md">
                                            <ShieldCheck style={{ width: 13, height: 13, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.42)" }}>Credential</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-md">
                                            <FileCheck2 style={{ width: 13, height: 13, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.42)" }}>Proof of Work</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-md">
                                            <FolderOpen style={{ width: 13, height: 13, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.42)" }}>Hiring Collection</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-md">
                                            <Activity style={{ width: 13, height: 13, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.42)" }}>Attestation Usage</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-md">
                                            <Briefcase style={{ width: 13, height: 13, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.42)" }}>Career Timeline</span>
                                        </div>
                                    </div>
                                    {/* User at bottom */}
                                    <div className="px-3 py-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                                            <img src="/homepage/cv%20example.png" alt="Alex Rivera" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1 }}>Alex Rivera</p>
                                            <p style={{ fontSize: 9.5, color: "#4ade80", fontWeight: 600, marginTop: 2, letterSpacing: "0.03em" }}>VERIFIED</p>
                                        </div>
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}><path d="M3 4l2 2 2-2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                    </div>
                                </div>

                                {/* ── CENTER PANEL ── */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    {/* Top bar */}
                                    <div className="flex items-center justify-between px-5 h-[46px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1 }}>Profile</p>
                                            <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>Manage your professional identity and information.</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                                            <ExternalLink style={{ width: 10, height: 10, color: "rgba(255,255,255,0.4)" }} />
                                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Edit Profile</span>
                                        </div>
                                    </div>
                                    {/* Body */}
                                    <div className="flex-1 overflow-hidden px-5 py-4">
                                        {/* Profile header card */}
                                        <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <div className="flex items-start gap-3">
                                                <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0" style={{ border: "2px solid rgba(255,255,255,0.08)" }}>
                                                    <img src="/homepage/cv%20example.png" alt="Alex Rivera" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em" }}>Alex Rivera</span>
                                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
                                                            <CheckCircle2 style={{ width: 8, height: 8, color: "#4ade80" }} />
                                                            <span style={{ fontSize: 9, fontWeight: 700, color: "#4ade80", letterSpacing: "0.05em" }}>VERIFIED</span>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Rust Developer at Nexus Protocol</p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin style={{ width: 10, height: 10, color: "rgba(255,255,255,0.25)" }} />
                                                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Indonesia</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock style={{ width: 10, height: 10, color: "rgba(255,255,255,0.25)" }} />
                                                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>UTC+7</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                        <div className="flex items-center gap-1">
                                                            <Mail style={{ width: 9, height: 9, color: "rgba(255,255,255,0.2)" }} />
                                                            <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)" }}>alex@chainvolio.xyz</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Globe style={{ width: 9, height: 9, color: "rgba(255,255,255,0.2)" }} />
                                                            <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)" }}>chainvolio.xyz/alex-rivera</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Linkedin style={{ width: 9, height: 9, color: "rgba(255,255,255,0.2)" }} />
                                                            <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)" }}>LinkedIn</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "12px 0" }} />
                                            <div className="mb-3">
                                                <p style={{ fontSize: 9.5, fontWeight: 600, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Bio</p>
                                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>Smart contract engineer focused on DeFi protocols and on-chain identity.<br/>Building the future of verifiable work history.</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 9.5, fontWeight: 600, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Skills</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {["Rust", "Solana", "Anchor", "DeFi", "TypeScript", "Web3"].map(skill => (
                                                        <span key={skill} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 500, padding: "2px 8px", borderRadius: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Section rows */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}><ShieldCheck style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Credential</p>
                                                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.26)" }}>Manage and showcase your verified credentials and certificates.</p>
                                                </div>
                                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>3 Credentials</span>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.25 }}><path d="M3.5 5l2.5 2.5 2.5-2.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                            </div>
                                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}><FileCheck2 style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Proof of Work</p>
                                                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.26)" }}>Showcase your work experience, contributions, and achievements.</p>
                                                </div>
                                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>2 Proofs</span>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.25 }}><path d="M3.5 5l2.5 2.5 2.5-2.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                            </div>
                                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}><FolderOpen style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Hiring Collection</p>
                                                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.26)" }}>Your hiring collections and saved opportunities.</p>
                                                </div>
                                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>0 Collections</span>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.25 }}><path d="M3.5 5l2.5 2.5 2.5-2.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                            </div>
                                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}><Activity style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Attestation Usage</p>
                                                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.26)" }}>Track your attestation usage and subscription metrics.</p>
                                                    <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}><div className="h-full rounded-full" style={{ width: "30%", background: "rgba(255,255,255,0.4)" }} /></div>
                                                </div>
                                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>3 / 10 this month</span>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.25 }}><path d="M3.5 5l2.5 2.5 2.5-2.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                            </div>
                                            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}><Briefcase style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Career Timeline</p>
                                                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.26)" }}>Your professional journey and verified career history.</p>
                                                </div>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.25 }}><path d="M3.5 5l2.5 2.5 2.5-2.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── RIGHT PANEL ── */}
                                <div className="w-[230px] flex-shrink-0 flex flex-col" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div className="h-[46px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} />
                                    <div className="px-4 py-4 space-y-3 overflow-hidden flex-1">
                                        {/* Share Your Profile */}
                                        <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <p style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>Share Your Profile</p>
                                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 9 }}>Share your professional profile with employers and collaborators.</p>
                                            <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                                                <Share2 style={{ width: 11, height: 11, color: "rgba(255,255,255,0.55)" }} />
                                                <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Share Profile</span>
                                            </div>
                                        </div>
                                        {/* View Your CV */}
                                        <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <p style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>View Your CV</p>
                                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 9 }}>Preview and download your professional CV.</p>
                                            <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                                                <FileText style={{ width: 11, height: 11, color: "rgba(255,255,255,0.55)" }} />
                                                <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>View CV</span>
                                            </div>
                                        </div>
                                        {/* Upgrade to Pro */}
                                        <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <p style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>Upgrade to Pro</p>
                                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 9 }}>Unlock more features and increase your attestation limits.</p>
                                            <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" }}>
                                                <Award style={{ width: 11, height: 11, color: "rgba(255,255,255,0.7)" }} />
                                                <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>Upgrade</span>
                                            </div>
                                        </div>
                                        {/* Profile Completion */}
                                        <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <p style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>Profile Completion</p>
                                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 10 }}>Complete your profile to increase visibility and opportunities.</p>
                                            <div className="flex justify-center mb-3">
                                                <div className="relative" style={{ width: 60, height: 60 }}>
                                                    <svg viewBox="0 0 60 60" style={{ width: 60, height: 60, transform: "rotate(-90deg)" }}>
                                                        <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5"/>
                                                        <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="5" strokeDasharray="157.08" strokeDashoffset="23.56" strokeLinecap="round"/>
                                                    </svg>
                                                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>85%</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}><Check style={{ width: 8, height: 8, color: "#4ade80" }} /></div>
                                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Add profile information</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}><Check style={{ width: 8, height: 8, color: "#4ade80" }} /></div>
                                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Add credentials (3/3)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
                                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>Add proof of work (2/3)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}><Check style={{ width: 8, height: 8, color: "#4ade80" }} /></div>
                                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Complete career timeline</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>{/* end 3-panel absolute inset flex */}
                        </div>{/* end scaled 960x540 container */}
                    </div>{/* end hero outer relative */}

                    {/* Partner logos — Linear-style static row, center-aligned, grayscale */}
                    <div className="mt-4 sm:mt-6 w-full relative z-50 border-t border-white/[0.06] pt-8 sm:pt-10">
                        <div className="w-full overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
                            <div className="flex animate-marquee whitespace-nowrap items-center w-max">
                                {[...PARTNERS, ...PARTNERS].map((partner, i) => (
                                    <div key={`${partner.name}-${i}`} className="flex items-center mx-10 grayscale opacity-35 hover:grayscale-0 hover:opacity-80 transition-all duration-500 cursor-default">
                                        <img
                                            src={partner.src}
                                            alt={partner.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-5 sm:h-[22px] w-auto object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>



                {/* THE PROBLEM SECTION */}
                <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 bg-[#0D0D0D] theme-bg-section">

                    <div className="max-w-[1240px] mx-auto">
                        <div className="text-center mb-10 md:mb-14 space-y-6">
                            {/* Pill Badge - Editorial Light Style */}
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mx-auto">
                                <span className="text-[10px] md:text-[11px] font-black tracking-[0.2em] text-[#fde68a99] uppercase">The problem</span>
                            </div>

                            <p className="text-lg md:text-xl font-normal text-white/60 tracking-tight">
                                Why Web3 Hiring Is Broken
                            </p>

                            <h2 className="text-[32px] sm:text-5xl md:text-6xl lg:text-[72px] font-bold tracking-tighter leading-[1.1] text-white max-w-6xl mx-auto whitespace-normal md:whitespace-nowrap">
                                Your work is real. <span className="text-amber-200/60">Your proof isn&apos;t.</span>
                            </h2>
                            <div className="w-full max-w-6xl mx-auto h-px bg-white/10 mt-12 theme-border-base" />



                            <p className="text-white/40 text-[13px] md:text-base font-normal max-w-3xl mx-auto mt-6">
                                Hiring runs on claims, not proof. There is no reliable way to verify real work.
                            </p>
                        </div>

                        {/* NEW ANIMATED PROBLEM DIAGRAM */}
                        <div className="theme-invert-diagram relative w-full max-w-6xl mx-auto mt-16 mb-24">
                            <ProblemDiagram />
                        </div>

                        {/* BENTO CARDS SECTION - Minimal Editorial Style (Light) */}
                        <div className="relative mt-14 pb-12 -mx-4 sm:mx-0 overflow-hidden">
                            <motion.div
                                className="flex md:grid md:grid-cols-3 w-max md:w-full touch-pan-y cursor-grab active:cursor-grabbing md:cursor-default md:active:cursor-default relative z-30"
                                animate={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? `-${problemIdx * 85}vw` : 0 }}
                                transition={isAnimating ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0 }}
                                onAnimationComplete={onAnimationComplete}
                                drag={typeof window !== 'undefined' && window.innerWidth < 768 ? "x" : false}
                                dragConstraints={{ left: -1000, right: 1000 }}
                                dragElastic={0.2}
                                onDragEnd={(e: any, info: any) => {
                                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                        if (info.offset.x < -40) handleProblemLoop(problemIdx + 1);
                                        else if (info.offset.x > 40) handleProblemLoop(problemIdx - 1);
                                    }
                                }}
                            >
                                {[
                                    {
                                        id: "03",
                                        title: "Lost in Noise",
                                        desc: "Real talent gets buried. Hiring becomes slow, biased, and unreliable.",
                                        icon: Activity
                                    },
                                    {
                                        id: "01",
                                        title: "Scattered Identity",
                                        desc: "Your work is spread across platforms, files, and chats. No single source of truth.",
                                        icon: LayoutGrid
                                    },
                                    {
                                        id: "02",
                                        title: "Unverifiable Claims",
                                        desc: "Without verifiable data, resumes become claims, not proof.",
                                        icon: FileQuestion
                                    },
                                    {
                                        id: "03",
                                        title: "Lost in Noise",
                                        desc: "Real talent gets buried. Hiring becomes slow, biased, and unreliable.",
                                        icon: Activity
                                    },
                                    {
                                        id: "01",
                                        title: "Scattered Identity",
                                        desc: "Your work is spread across platforms, files, and chats. No single source of truth.",
                                        icon: LayoutGrid
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className={`p-6 transition-colors group relative w-[80vw] md:w-auto flex-shrink-0 px-5 mx-2 md:mx-0 ${(idx === 0 || idx === 4) ? 'md:hidden' : ''}`}>
                                        <div className="flex items-start gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-xl ${
                                                theme === 'light'
                                                ? 'bg-brand-cyan border border-brand-cyan shadow-cyan-900/10 theme-preserve'
                                                : 'bg-white/10 group-hover:bg-white border border-white/10 shadow-black/5'
                                            }`}>
                                                <item.icon size={20} className={`transition-colors duration-500 ${
                                                    theme === 'light' ? 'text-white' : 'text-white/60 group-hover:text-black'
                                                }`} />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-white/40 tracking-widest">{item.id}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-bold text-[#fde68a99] transition-colors">{item.title}</h3>
                                                    <p className="text-[13px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vertical Separator */}
                                        {idx > 0 && idx < 3 && (
                                            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-24 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent theme-fade-border" />
                                        )}
                                    </div>
                                ))}
                            </motion.div>

                            {/* Mobile Pagination Dots */}
                            <div className="flex justify-center gap-1.5 mt-8 md:hidden relative z-50">
                                {[0, 1, 2].map((i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleProblemLoop(i + 1)}
                                        className={`h-1 rounded-full transition-all duration-300 ${(problemIdx === i + 1 || (i === 2 && problemIdx === 0) || (i === 0 && problemIdx === 4))
                                                ? "w-8 bg-white"
                                                : "w-1.5 bg-white/20"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* TRUST TRANSFORMATION — Noise to Signal */}
                <section id="problems" className="theme-aware py-16 sm:py-20 md:py-24 relative z-10 theme-signal-bg overflow-hidden">

                    {/* ── Top text block ── */}
                    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 md:pt-12 md:pb-4 flex flex-col md:flex-row-reverse md:items-start md:justify-between gap-6 md:gap-8">
                        <div className="space-y-2 md:space-y-4 flex flex-col md:items-end text-left md:text-right md:flex-1">
                            {/* badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                                <span className="text-[10px] md:text-[11px] font-black tracking-[0.12em] text-[#fde68a99]">Signal vs noise</span>
                            </div>
                            <p className="text-lg md:text-xl font-normal text-white/60 tracking-tight">
                                Why Web3 Work History Can&apos;t Be Verified
                            </p>
                            <h2 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                                From Noise to<br />
                                <span className="text-amber-200/60">Verifiable Signal</span>
                            </h2>
                        </div>
                        <p className="text-white/40 text-[13px] md:text-lg font-normal leading-relaxed max-w-xl md:text-left md:pt-20">
                            Work history is fragmented and impossible to verify.<br />
                            ChainVolio transforms scattered contributions<br />
                            into a single, verifiable identity.
                        </p>
                    </div>
                    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mb-4">
                        <div className="h-px w-full bg-white/10" />
                    </div>

                    {/* ── Full-bleed animation canvas ── */}
                    <div className="relative w-full h-[160px] sm:h-[300px] md:h-[420px]">
                        <SignalNoiseVisual />

                        {/* Radial vignette — lines fade at edges */}
                        <div className="absolute inset-0 pointer-events-none z-10 theme-signal-vignette" />

                        {/* Top + bottom bleed so canvas merges with section bg */}
                        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10 theme-signal-fade-to" />
                        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10 theme-signal-fade-from" />

                        {/* ── Central Logo Node ── */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <div className="relative flex items-center justify-center">
                                {/* Outer pulse rings */}
                                <motion.div
                                    animate={{ scale: [1, 3.2], opacity: [0.12, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeOut", delay: 0 }}
                                    className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20"
                                />
                                <motion.div
                                    animate={{ scale: [1, 2.2], opacity: [0.18, 0] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                                    className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/25"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1.4 }}
                                    className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/30"
                                />

                                {/* Logo container */}
                                <motion.div
                                    animate={{ opacity: [0.75, 1, 0.75] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.06)]"
                                >
                                    <Image
                                        src="/logo.png"
                                        alt="ChainVolio"
                                        width={24}
                                        height={24}
                                        className="md:w-[36px] md:h-[36px] opacity-80"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* ── Bottom outcome row — the answer to the problems above ── */}
                    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pb-8 md:pb-12">
                        <div className="relative overflow-hidden">
                            <motion.div
                                className="flex md:grid md:grid-cols-3 w-full md:gap-8"
                                animate={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? `-${solutionIdx * 85}vw` : 0 }}
                                transition={isAnimating ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0 }}
                                onAnimationComplete={onAnimationComplete}
                                drag={typeof window !== 'undefined' && window.innerWidth < 768 ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.7}
                                onDragEnd={(e: any, info: any) => {
                                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                        if (info.offset.x < -30) handleSolutionLoop(solutionIdx + 1);
                                        else if (info.offset.x > 30) handleSolutionLoop(solutionIdx - 1);
                                    }
                                }}
                            >
                                {[
                                    {
                                        label: "Verified Signal",
                                        desc: "Recruiters see proof, not promises. Real contributors rise above the noise automatically.",
                                        accent: "#fde68a99",
                                        icon: Activity,
                                        id: "03"
                                    },
                                    {
                                        label: "One Unified Profile",
                                        desc: "Every contribution, from grants to project roles, lives in a single portable identity you fully own.",
                                        accent: "#fde68a99",
                                        icon: User,
                                        id: "01"
                                    },
                                    {
                                        label: "On-Chain Attestation",
                                        desc: "Each entry is cryptographically signed by the issuing org. No more unverifiable claims.",
                                        accent: "#fde68a99",
                                        icon: ShieldCheck,
                                        id: "02"
                                    },
                                    {
                                        label: "Verified Signal",
                                        desc: "Recruiters see proof, not promises. Real contributors rise above the noise automatically.",
                                        accent: "#fde68a99",
                                        icon: Activity,
                                        id: "03"
                                    },
                                    {
                                        label: "One Unified Profile",
                                        desc: "Every contribution, from grants to project roles, lives in a single portable identity you fully own.",
                                        accent: "#fde68a99",
                                        icon: User,
                                        id: "01"
                                    },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className={`p-6 bg-transparent transition-all duration-300 w-[80vw] md:w-auto flex-shrink-0 md:px-10 md:py-8 pb-8 px-5 mx-2 md:mx-0 group ${(i === 0 || i === 4) ? 'md:hidden' : ''}`}
                                    >
                                        <div className="flex items-start gap-8">
                                            {/* Big Number */}
                                            <div className="flex-shrink-0 pt-2">
                                                <span className="text-4xl font-black text-white/10 group-hover:text-[#fde68a99] transition-colors duration-500 tracking-tighter leading-none">
                                                    {item.id}
                                                </span>
                                            </div>

                                            {/* Vertical Divider */}
                                            <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent flex-shrink-0 mt-1" />

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2.5">
                                                    <item.icon size={16} className="text-white/40" />
                                                    <h3 className="text-xl font-bold text-[#fde68a99] transition-colors">
                                                        {item.label}
                                                    </h3>
                                                </div>
                                                <p className="text-[13px] text-white/30 leading-relaxed group-hover:text-white/50 transition-colors duration-300 max-w-sm">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Mobile Pagination Dots */}
                            <div className="flex justify-center gap-1.5 mt-2 md:hidden relative z-50">
                                {[0, 1, 2].map((i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSolutionLoop(i + 1)}
                                        className={`h-1 rounded-full transition-all duration-300 ${(solutionIdx === i + 1 || (i === 2 && solutionIdx === 0) || (i === 0 && solutionIdx === 4))
                                                ? "w-8 bg-white"
                                                : "w-1.5 bg-white/20"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                </section>


                {/* DIVIDER: why → black */}
                <div className="h-px w-full bg-black/10" />

                {/* REDESIGNED: COMPETITIVE POSITIONING — Premium Editorial Layout */}
                <section className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16 relative z-10 bg-[#080808] theme-bg-section2 overflow-hidden">

                    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
                        <div className="grid lg:grid-cols-2 gap-4 lg:gap-16 items-start">

                            {/* Left: Content Block */}
                            <div className="space-y-6 md:space-y-12">
                                <div className="space-y-3 md:space-y-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                                        <span className="text-[10px] md:text-[11px] font-black tracking-[0.2em] text-[#fde68a99] uppercase">Why ChainVolio</span>
                                    </div>

                                    <p className="text-lg md:text-xl font-normal text-white/60 tracking-tight">
                                        How On-Chain Attestations Work
                                    </p>

                                    <h2 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                                        One trust layer.<br />
                                        <span className="text-amber-200/60">Everything connects.</span>
                                    </h2>
                                    <div className="h-px w-full max-w-6xl bg-white/10 theme-border-base" />

                                    <p className="text-white/40 text-[13px] md:text-xl leading-relaxed max-w-xl font-normal">
                                        Traditional tools created isolated silos. ChainVolio turns Web3 contributions into verifiable signals, shareable across platforms.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-8 items-center">
                                    <Link href="/guides/how-it-works" className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors group">
                                        Explore the architecture
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Built on</span>
                                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05]">
                                            <div className="w-2 h-2 rounded-full bg-[#0d9488]" />
                                            <span className="text-[9px] font-bold text-white/60">SOLANA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Globe Visual — Aligned with text height */}
                            <div className="relative w-full max-w-[560px] mx-auto lg:ml-auto group overflow-hidden flex flex-col h-full min-h-[220px] sm:min-h-[280px] md:min-h-[380px] mb-8 bg-[#080808] theme-bg-section2">

                                {/* Title Overlay */}
                                <div className="absolute top-10 left-10 z-20 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Global Trust Graph</span>
                                </div>
                                <div className="flex-1 relative z-10 w-full">
                                    <GlobeCanvas className="absolute inset-0 w-full h-full scale-[0.65] sm:scale-[0.70] theme-globe-canvas" />
                                </div>

                                {/* Top/Bottom Gradients to mask clipping */}
                                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#080808] via-[#080808]/40 to-transparent z-10 pointer-events-none theme-fade-to-black" />
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent z-10 pointer-events-none theme-fade-from-black" />

                                {/* Floating Stats Overlay — Refined Metrics */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-8 px-4 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl z-20 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05] whitespace-nowrap">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[6px] sm:text-[7px] font-bold text-white/20 uppercase tracking-[0.2em]">Efficiency</span>
                                        <span className="text-[9px] sm:text-[11px] font-bold text-[#14F195] theme-cyan-accent tracking-tight">Low-cost attestations (~$0.001)</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[6px] sm:text-[7px] font-bold text-white/20 uppercase tracking-[0.2em]">Latency</span>
                                        <span className="text-[9px] sm:text-[11px] font-bold text-white/80 tracking-tight">Near-instant finality</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Row — Infinite Carousel on Mobile */}
                        <div className="relative mt-4 md:mt-8 mb-6 md:mb-8 -mx-4 sm:mx-0">
                            <motion.div
                                className="flex md:grid md:grid-cols-3 w-max md:w-full touch-pan-y cursor-grab active:cursor-grabbing md:cursor-default md:active:cursor-default relative z-30"
                                animate={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? `-${whyIdx * 85}vw` : 0 }}
                                transition={isAnimating ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0 }}
                                onAnimationComplete={onAnimationComplete}
                                drag={typeof window !== 'undefined' && window.innerWidth < 768 ? "x" : false}
                                dragConstraints={{ left: -1000, right: 1000 }}
                                dragElastic={0.2}
                                onDragEnd={(e: any, info: any) => {
                                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                        if (info.offset.x < -40) handleWhyLoop(whyIdx + 1);
                                        else if (info.offset.x > 40) handleWhyLoop(whyIdx - 1);
                                    }
                                }}
                            >
                                {[
                                    {
                                        id: "03",
                                        title: "Portable Trust",
                                        desc: "Your verified history can be shared across platforms, including LinkedIn, Twitter, or your own portfolio.",
                                        icon: Globe,
                                    },
                                    {
                                        id: "01",
                                        title: "Beyond Profiles",
                                        desc: "LinkedIn shows who you are. ChainVolio adds verifiable signals to what you've done.",
                                        icon: Activity,
                                    },
                                    {
                                        id: "02",
                                        title: "Claims to Proof",
                                        desc: "Traditional resumes rely on trust. We anchor work history with attestations and on-chain records.",
                                        icon: ShieldCheck,
                                    },
                                    {
                                        id: "03",
                                        title: "Portable Trust",
                                        desc: "Your verified history can be shared across platforms, including LinkedIn, Twitter, or your own portfolio.",
                                        icon: Globe,
                                    },
                                    {
                                        id: "01",
                                        title: "Beyond Profiles",
                                        desc: "LinkedIn shows who you are. ChainVolio adds verifiable signals to what you've done.",
                                        icon: Activity,
                                    },
                                ].map((feature, i) => (
                                    <div
                                        key={i}
                                        className={`p-6 bg-transparent transition-colors group relative w-[80vw] md:w-auto flex-shrink-0 md:px-12 md:p-10 pb-8 px-5 mx-2 md:mx-0 ${(i === 0 || i === 4) ? 'md:hidden' : ''}`}
                                    >
                                        <div className="space-y-4 relative z-10">
                                            <span className="text-[10px] font-black text-white/25 tracking-widest">{feature.id}</span>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2.5">
                                                    <feature.icon size={16} className="text-white/50 flex-shrink-0" />
                                                    <h3 className="text-xl font-bold text-[#fde68a99]">{feature.title}</h3>
                                                </div>
                                                <p className="text-[13px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                                                    {feature.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Vertical Separator */}
                                        {i > 0 && i < 3 && (
                                            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-24 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent theme-fade-border" />
                                        )}
                                    </div>
                                ))}
                            </motion.div>

                            {/* Mobile Pagination Dots */}
                            <div className="flex justify-center gap-1.5 mt-2 md:hidden relative z-50 mb-6">
                                {[0, 1, 2].map((i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleWhyLoop(i + 1)}
                                        className={`h-1 rounded-full transition-all duration-300 ${(whyIdx === i + 1 || (i === 2 && whyIdx === 0) || (i === 0 && whyIdx === 4))
                                                ? "w-8 bg-white"
                                                : "w-1.5 bg-white/20"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Founder Quote */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="max-w-2xl mx-auto mt-6 md:mt-8 text-center px-6"
                        >
                            <div className="h-px w-12 bg-white/10 mx-auto mb-6" />
                            <p className="text-sm md:text-base text-white/50 italic leading-relaxed mb-6 font-normal">
                                &ldquo;ChainVolio doesn&apos;t replace LinkedIn. It adds cryptographic proof to your existing presence anywhere you already share your work.&rdquo;
                            </p>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[9px] md:text-[10px] font-black tracking-widest text-white/80 uppercase">Sandhy Warhol</span>
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Founder Chainvolio</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section id="solution" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 bg-black theme-bg-page">
                    <div className="theme-fade-from-black absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-black to-transparent pointer-events-none z-30"></div>

                    <div className="max-w-[1200px] mx-auto relative">

                        {/* ── Header: compact, left + right split ── */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                            <div className="space-y-2 md:space-y-4 md:flex-1">
                                <div className="max-w-xl space-y-2 md:space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200/60">
                                            The Solution
                                        </span>
                                    </div>
                                    <p className="text-lg md:text-xl font-normal text-white/60 tracking-tight">
                                        Build a Verifiable Web3 Resume with On-Chain Proof
                                    </p>
                                    <h3 className="text-[28px] sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-white tracking-tight leading-[1.06]">
                                        Build a reputation<br /><span className="text-amber-200/60">that travels.</span>
                                    </h3>
                                </div>

                            </div>
                            <p className="text-white/40 text-sm md:text-lg font-normal leading-relaxed max-w-xs md:text-right md:pt-20">
                                Turn your work into verifiable proof that anyone can trust. Transparent, portable, impossible to fake.
                            </p>
                        </div>
                        <div className="w-full max-w-[1240px] mx-auto h-px bg-white/10 mt-12 mb-12" />

                        {/* ── Interactive Flow ── */}
                        <div className="relative w-full max-w-[860px] mx-auto mb-4">
                            <div className="absolute -inset-8 bg-white/[0.03] blur-[80px] pointer-events-none" />

                            <VerifiableWorkHistoryFlow />
                        </div>

                        {/* ── 3 compact attributes — replaces the old text card ── */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-10 gap-y-4 mb-6 mt-4 md:mt-6 px-6">
                            {[
                                { icon: ShieldCheck, label: "On-Chain Proof", color: "#14F195" },
                                { icon: CheckCircle2, label: "Instant Verification", color: "#60a5fa" },
                                { icon: Lock, label: "Impossible to Fake", color: "#a78bfa" },
                            ].map(({ icon: Icon, label, color }, i) => (
                                <div key={i} className="flex items-center gap-2 md:gap-2.5 flex-shrink-0">
                                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color }} />
                                    <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.08em] md:tracking-[0.18em] max-w-[65px] md:max-w-none whitespace-normal md:whitespace-nowrap leading-tight text-left" style={{ color: color + "cc" }}>
                                        {label}
                                    </span>
                                    {i < 2 && <span className="hidden md:block ml-10 w-px h-4 bg-white/10" />}
                                </div>
                            ))}
                        </div>

                        {/* ── UI Mockup ── */}
                        <div className="relative h-[480px] sm:h-[350px] md:h-[550px] lg:h-[700px] w-full max-w-[1200px] mx-auto flex items-center justify-center overflow-visible">
                            <div className="absolute inset-0 bg-white/[0.03] blur-[120px] rounded-full opacity-40 pointer-events-none" />

                            {/* Unified Scaling Container for the entire assembly */}
                            <div className="relative scale-[0.65] min-[440px]:scale-[0.75] sm:scale-[0.65] md:scale-[0.8] lg:scale-100 transition-transform duration-700 origin-center flex items-center justify-center w-[350px] h-[650px] md:w-[1200px] md:h-[650px]">
                                <div className="relative w-full h-full group">
                                    {/* Main Dashboard Mockup */}
                                    <div className="theme-preserve w-full h-full bg-[#0a0a0a] rounded-[32px] border border-white/10 overflow-hidden text-left relative"
                                        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                                    >
                                        <MockProfileUI />
                                    </div>

                                    {/* Floating Proof Card - Now visible on all screens, part of the scaled assembly */}
                                    <div className="absolute -right-16 top-1/4 z-40 transition-all duration-1000 group-hover:translate-y-[-15px] group-hover:translate-x-6 group-hover:rotate-2">
                                        <div className="[perspective:1500px]">
                                            <div className="rounded-2xl [transform:rotateY(-8deg)rotateX(2deg)]">
                                                <FloatingVerificationCard />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* CORE FEATURE SECTION */}
                <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 overflow-hidden bg-[#0D0D0D] theme-bg-section">
                    <div className="max-w-[1200px] mx-auto relative z-10">
                        <AttestationBlock />
                    </div>
                </section>

                {/* USE CASE SECTION */}
                <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 overflow-hidden bg-[#080808] theme-bg-section2">
                    <div className="max-w-[1200px] mx-auto space-y-16 relative z-10">

                        {/* BLOCK 2 — HIRING */}
                        <HiringBlock />
                    </div>
                </section>

                <Web3ResumeSection onCtaClick={() => setIsWalletModalOpen(true)} />

                {/* 5. FINAL CTA */}
                <section className="py-20 sm:py-24 md:py-32 relative z-10 overflow-hidden bg-black theme-bg-page">
                    {/* Subtle grid */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                        backgroundSize: "88px 88px",
                        maskImage: "radial-gradient(circle at center, white 0%, transparent 80%)",
                        WebkitMaskImage: "radial-gradient(circle at center, white 0%, transparent 80%)"
                    }} />
                    {/* Radial glow center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[480px] rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)" }}
                    />
                    {/* Top + bottom fade */}
                    <div className="theme-cta-fade absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
                    <div className="theme-cta-fade absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

                    <div className="relative max-w-[760px] mx-auto text-center z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.06]">
                                Start Building Your<br />
                                <span className="text-amber-200/60">Verifiable Web3 Resume.</span>
                            </h2>
                            <p className="text-white/40 text-base md:text-lg mb-12 max-w-lg mx-auto leading-relaxed font-normal">
                                Signed by real people. Anchored on Solana.<br />
                                Cryptographically verified. Share anywhere with one link.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 px-4">
                                <button
                                    onClick={() => setIsWalletModalOpen(true)}
                                    className="premium-shimmer-button w-fit min-w-[240px] sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white text-black font-bold text-sm sm:text-base rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 mx-auto sm:mx-0"
                                >
                                    Create Your Profile
                                </button>
                                <Link
                                    href="/hiring/create"
                                    className="w-fit min-w-[240px] sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-sm sm:text-base rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm mx-auto sm:mx-0"
                                >
                                    Create Hiring Link <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Trust pills */}
                            <div className="flex items-center justify-center flex-wrap gap-3">
                                {["No token required", "Built on Solana", "Permissionless", "Free to start"].map((pill, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full border border-white/[0.07] bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">
                                        {pill}
                                    </span>
                                ))}
                            </div>

                        </motion.div>
                    </div>
                </section>
                <Footer />
            </main>

            <CustomWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {activeModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-8" onClick={() => setActiveModal(null)}>
                    <div className="relative border border-white/20 rounded-sm max-w-3xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden group" onClick={(e) => e.stopPropagation()}>
                        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-70"><source src="/box%20navigation.mp4" type="video/mp4" /></video>
                        <div className="relative z-10 p-5 sm:p-8 md:p-12 bg-black/40 backdrop-blur-sm max-h-[90vh] sm:max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-white/40 hover:text-white/90 transition-colors text-2xl z-20">&times;</button>
                            {activeModal === 'recruiters' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4">
                                        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">For Recruiters</h2>
                                        <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                                            ChainVolio provides verifiable hiring infrastructure that reduces information asymmetry and enables transparent candidate evaluation through an accountable, on-chain recruitment trail.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-8">
                                            <h3 className="text-[10px] font-bold text-teal-400/60 uppercase tracking-[0.3em]">Strategic Value</h3>
                                            <div className="space-y-6">
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-teal-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Web3 Talent</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Access wallet-native professional records and review on-chain work history with proven output.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-teal-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Instant Review</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Evaluate high-signal professional ledgers in a standardized, verifiable format to reduce due-diligence friction.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-teal-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Automated Integrity</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Leverage gas-backed peer attestations to maintain a permanent, cryptographic hiring audit trail.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Key Benefits</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Verifiable decisions</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Transparent accountability</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Signal-dense data</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Institutional trust</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'talent' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4">
                                        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">For Talent</h2>
                                        <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                                            Establish a wallet-bound professional record and participate in a public trust infrastructure that ensures long-term career persistence outside of centralized platforms.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-8">
                                            <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">Advantage</h3>
                                            <div className="space-y-6">
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-emerald-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Sovereign Identity</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Self-custodied wallet authentication with no centralized account dependency. Interoperable and permissionless.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-emerald-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Showcase Output</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Anchor contributions as verifiable records and prioritize provable output over narrative claims via timestamped proof.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-emerald-400/40 font-bold mt-0.5">/</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-bold uppercase text-white/90">Reputation Hub</h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">Unified professional ledger providing a verifiable identity surface compatible with Web3 grants and DAOs.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Why it matters</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Wallet-Native Identity</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Cryptographic Proof</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Self-Sovereign Data</p>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Borderless Verifiability</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'ask' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4">
                                        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">Sourcing</h2>
                                        <p className="text-white/40 text-sm max-w-md">Eliminate the friction of static files. Request live, verified links to capture higher signal talent.</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12 pt-8">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">The Shift</h3>
                                            <div className="space-y-4">
                                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm">
                                                    <p className="text-[10px] text-white/20 uppercase mb-3 text-[10px] tracking-[0.2em]">Traditional Query</p>
                                                    <p className="text-sm text-white/40 font-light">"Please attach your CV as a PDF."</p>
                                                </div>
                                                <div className="p-6 bg-emerald-400/[0.03] border border-emerald-400/10 rounded-sm">
                                                    <p className="text-[10px] text-emerald-400/40 uppercase mb-3 text-[10px] tracking-[0.2em]">Native Query</p>
                                                    <p className="text-sm text-emerald-400/90 font-medium">"Drop your ChainVolio link."</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Operational Value</h3>
                                            <div className="space-y-5 text-xs text-white/60">
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold">/</span>
                                                    <p className="font-light leading-relaxed">Direct access to verified work history without logins.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold">/</span>
                                                    <p className="font-light leading-relaxed">Unified view of portfolio, code, and peer proof.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold">/</span>
                                                    <p className="font-light leading-relaxed">Signal-rich screening for global, remote pipelines.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* HOW TO SOURCE SECTION */}
                                    <div className="space-y-8 pt-12 border-t border-white/5">
                                        <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">HOW TO SOURCE WITH CHAINVOLIO</h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Step 1 */}
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 1</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Define Signal, Not CV</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Shift from resumes to verifiable signals such as on-chain work, GitHub activity, and attestations.</p>
                                                </div>
                                            </div>

                                            {/* Step 2 */}
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 2</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Create Hiring Link</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Create a role-specific hiring link with defined requirements and signal expectations.</p>
                                                </div>
                                            </div>

                                            {/* Step 3 */}
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 3</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Ask for ChainVolio Link</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Replace "Send your CV" with "Drop your ChainVolio link".</p>
                                                </div>
                                            </div>

                                            {/* Step 4 */}
                                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 4</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Evaluate Real Work</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Review verified history, contributions, and attestations instead of self-claimed experience.</p>
                                                </div>
                                            </div>

                                            {/* Step 5 */}
                                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Step 5</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase text-white/90 mb-1">Hire with Confidence</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Make decisions based on transparent, verifiable data instead of assumptions.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex justify-end">
                                        <Link href="/guides/sourcing" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 flex items-center gap-2 group transition-colors">
                                            View full guide
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'screening' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">Screening Protocol</h2><p className="text-white/40 text-sm max-w-md">Efficient evaluation of Web3 talent requires a shift from credentials to contributions.</p></div>
                                    <div className="grid gap-12">
                                        <section className="grid md:grid-cols-[1fr,2fr] gap-8 items-start"><h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.2em] pt-1">01 Authority</h3><div className="space-y-3"><p className="text-sm text-white/90 font-medium">Prioritize attested history.</p><p className="text-xs text-white/40 leading-relaxed font-light">Focus on records verified by founders or collaborators. These represent social capital anchored in real output.</p></div></section>
                                        <section className="grid md:grid-cols-[1fr,2fr] gap-8 items-start border-t border-white/5 pt-12"><h3 className="text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.2em] pt-1">02 Substance</h3><div className="space-y-3"><p className="text-sm text-white/90 font-medium">Evaluate work, not titles.</p><p className="text-xs text-white/40 leading-relaxed font-light">Web3 roles are fluid. Look for high-frequency contributions and consistency across multiple milestones.</p></div></section>
                                    </div>

                                    {/* SIGNAL INTERPRETATION FRAMEWORK */}
                                    <div className="space-y-8 pt-12 border-t border-white/5">
                                        <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">SIGNAL INTERPRETATION FRAMEWORK</h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* 01 Authority Signal */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">01, Authority Signal (Trust Layer)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Prioritize attested history. Focus on records verified by founders, organizations, or collaborators.</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Authority rate</li>
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Institutional trust</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 02 Signal Density */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">02, Signal Density (Consistency)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Evaluate consistency of output. Look for multiple proofs and continuous activity over time.</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Signal density</li>
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Proof count</li>
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Timeline activity</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 03 Portfolio Authority */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">03, Portfolio Authority (Depth)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Assess quality and credibility of work. Distinguish between attested and non-attested outputs.</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Portfolio authority</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 04 Strategic Fit */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">04, Strategic Fit (Context Match)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Match candidate signals with role requirements and contribution relevance.</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Strategic fit</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 05 Confidence Score */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[10px] font-bold uppercase text-white/90 leading-tight">05, Confidence Score (Decision Layer)</h4>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">Use combined signals to determine hiring confidence (High / Medium / Low).</p>
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <p className="text-[8px] text-emerald-400/40 uppercase tracking-widest font-black">Map to:</p>
                                                        <ul className="space-y-1">
                                                            <li className="text-[9px] text-white/50 flex items-center gap-2"><span className="w-1 h-1 bg-white/10 rounded-full" /> Signal confidence indicator</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex justify-end">
                                        <Link href="/guides/screening" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 flex items-center gap-2 group transition-colors">
                                            View full guide
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'attestation' && (
                                <div className="space-y-16 py-4">
                                    <div className="space-y-4"><h2 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase">Proof Standards</h2><p className="text-white/40 text-sm max-w-md">Cryptographic validation of professional experience in a decentralized market.</p></div>
                                    <div className="grid md:grid-cols-2 gap-16">
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">The Attestation Primitive</h3><p className="text-sm text-white/70 leading-relaxed font-light">An attestation is a work record confirmed by a secondary party.</p></div>
                                        <div className="space-y-8"><h3 className="text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.3em]">Recruiter Insights</h3><div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm space-y-8"><div className="flex justify-between items-end border-b border-white/5 pb-4"><div className="space-y-1"><span className="text-[8px] text-white/20 uppercase tracking-widest">Signal Type</span><p className="text-xs text-white/90">Attested Work</p></div></div><p className="text-xs text-white/40 leading-relaxed italic font-light">"Verification reduces screening noise."</p></div></div>
                                    </div>

                                    {/* HOW ATTESTATION WORKS */}
                                    <div className="space-y-8 pt-12 border-t border-white/5">
                                        <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.3em]">HOW ATTESTATION WORKS</h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                                            {/* Step 1 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 01</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Create Proof of Work</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">Candidate creates a verifiable work record inside ChainVolio.</p>
                                                </div>
                                            </div>

                                            {/* Step 2 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 02</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Generate Link</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">System generates a unique, shareable verification link.</p>
                                                </div>
                                            </div>

                                            {/* Step 3 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 03</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Send to Verifier</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">Link sent to a founder, client, or manager.</p>
                                                </div>
                                            </div>

                                            {/* Step 4 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 04</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Attestation Issued</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">Verifier reviews and confirms the work signal.</p>
                                                </div>
                                            </div>

                                            {/* Step 5 */}
                                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-sm space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Step 05</span>
                                                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-white/90 mb-1">Anchored On-Chain</h4>
                                                    <p className="text-[9px] text-white/40 leading-relaxed font-light">Permanently recorded on-chain as verifiable proof.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECONDARY SECTIONS */}
                                    <div className="grid md:grid-cols-2 gap-16 pt-12 border-t border-white/5">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-teal-400/60 uppercase tracking-[0.3em]">VERIFICATION ECONOMICS</h3>
                                            <div className="space-y-4">
                                                <div className="flex gap-4">
                                                    <span className="text-teal-400/40 font-bold text-[10px]">/</span>
                                                    <p className="text-[10px] text-white/50 leading-relaxed font-light">Attestations are paid by the verifier (not the candidate), creating a strong signal of trust and commitment.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-teal-400/40 font-bold text-[10px]">/</span>
                                                    <p className="text-[10px] text-white/50 leading-relaxed font-light">This economic model ensures attestations are meaningful and eliminates inflationary or spam endorsements.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">WHY IT MATTERS</h3>
                                            <div className="space-y-4">
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold text-[10px]">/</span>
                                                    <p className="text-[10px] text-white/50 leading-relaxed font-light">Eliminates fake portfolios by anchoring outputs to a cryptographic professional audit trail.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-emerald-400/40 font-bold text-[10px]">/</span>
                                                    <p className="text-[10px] text-white/50 leading-relaxed font-light">Converts unverified claims into verifiable professional signals, enabling trust without narrative CV dependency.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex justify-end">
                                        <Link href="/guides/attestation" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 flex items-center gap-2 group transition-colors">
                                            View full guide
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Stripe-style Radial Burst: Noise Visualization ---
const NETWORK_ICONS = [
    // GitHub
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>`,
    // LinkedIn
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
    // X (Twitter)
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    // Discord
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.05.05 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    // Mail
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    // Globe / Web
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>`,
    // Telegram
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M21.543 2.126c-.3-.213-.67-.267-1.015-.147L2.128 8.683c-.76.26-1.163.984-.963 1.713.187.683.793 1.156 1.5 1.187l5.247.227 1.84 5.92c.16.51.58.87 1.107.937.527.067 1.04-.183 1.343-.65l2.67-4.117 5.093 3.737c.393.287.907.34 1.353.14.447-.2.787-.6.907-1.08l3.153-12.6c.14-.56-.05-1.15-.49-1.517zM6.928 10.97l9.743-6.193-7.513 7.037-2.23-1.844zm3.93 6.06l-1.02-3.28 7.37-6.9-6.35 10.18z"/></svg>`,
    // Instagram
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
    // Figma
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>`,
    // Slack
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="3" height="8" x="13" y="2" rx="1.5"/><path d="M19 8.5v1a1.5 1.5 0 0 1-3 0v-1a1.5 1.5 0 0 1 3 0z"/><rect width="3" height="8" x="8" y="14" rx="1.5"/><path d="M5 15.5v-1a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1-3 0z"/><rect width="8" height="3" x="14" y="13" rx="1.5"/><path d="M15.5 19h-1a1.5 1.5 0 0 1 0-3h1a1.5 1.5 0 0 1 0 3z"/><rect width="8" height="3" x="2" y="8" rx="1.5"/><path d="M8.5 5h1a1.5 1.5 0 0 1 0 3h-1a1.5 1.5 0 0 1 0-3z"/></svg>`,
    // Resume (FileText)
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`,
    // Code
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    // Trophy
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
    // Briefcase
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    // Web3 / Chain
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
];

function SignalNoiseVisual() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999, active: false });
    const rafRef = useRef<number>(0);
    const visibleRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const visObserver = new IntersectionObserver(
            ([entry]) => { visibleRef.current = entry.isIntersecting; },
            { threshold: 0.05 }
        );
        visObserver.observe(canvas);

        // Preload icons
        const loadedIcons: HTMLImageElement[] = [];
        NETWORK_ICONS.forEach(svgString => {
            const img = new window.Image();
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
            loadedIcons.push(img);
        });

        const EXTRA_LOGOS = [
            "/logos/behance.png",
            "/logos/google drive.png",
            "/logos/dribbble.png",
            "/logos/slack.png",
            "/logos/dropbox.png",
            "/logos/figma.png",
            "/logos/canva.png",
            "/logos/pdf.png"
        ];
        EXTRA_LOGOS.forEach(url => {
            const img = new window.Image();
            img.src = url;
            loadedIcons.push(img);
        });

        let W = 0, H = 0;

        // Three layers of rays for depth — dense short inner, mid, long sparse outer
        const makeLayers = () => {
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const countA = isMobile ? 80 : 120;
            const countB = isMobile ? 120 : 240; // Increased medium rays
            const countC = isMobile ? 100 : 200; // Increased outer rays

            const layerA = Array.from({ length: countA }, (_, i) => ({
                baseAngle: (i / countA) * Math.PI * 2 + Math.random() * 0.12,
                length: 30 + Math.random() * 60,
                wobbleAmp: 0.04 + Math.random() * 0.06,
                wobbleSpeed: 0.6 + Math.random() * 1.2,
                wobblePhase: Math.random() * Math.PI * 2,
                opacity: 0.18 + Math.random() * 0.30,
                thickness: 0.5 + Math.random() * 0.5,
                dotR: 0.6 + Math.random() * 0.8,
                iconIdx: -1
            }));

            const layerB = Array.from({ length: countB }, (_, i) => {
                const baseAngle = (i / countB) * Math.PI * 2 + Math.random() * 0.15;
                // Horizontal bias: make rays longer on the left/right sides
                const aspectMult = 1 + Math.abs(Math.cos(baseAngle)) * 0.6;
                return {
                    baseAngle,
                    length: (120 + Math.random() * 160) * aspectMult,
                    wobbleAmp: 0.03 + Math.random() * 0.07,
                    wobbleSpeed: 0.3 + Math.random() * 0.8,
                    wobblePhase: Math.random() * Math.PI * 2,
                    opacity: 0.08 + Math.random() * 0.20,
                    thickness: 0.4 + Math.random() * 0.45,
                    dotR: 0.8 + Math.random() * 1.2,
                    iconIdx: -1
                };
            });

            const layerC = Array.from({ length: countC }, (_, i) => {
                const baseAngle = (i / countC) * Math.PI * 2 + Math.random() * 0.2;
                // Stronger horizontal bias for outer rays
                const aspectMult = 1 + Math.abs(Math.cos(baseAngle)) * 1.2;
                return {
                    baseAngle,
                    length: (250 + Math.random() * 250) * aspectMult,
                    wobbleAmp: 0.02 + Math.random() * 0.04,
                    wobbleSpeed: 0.2 + Math.random() * 0.5,
                    wobblePhase: Math.random() * Math.PI * 2,
                    opacity: 0.05 + Math.random() * 0.12,
                    thickness: 0.3 + Math.random() * 0.35,
                    dotR: 1.0 + Math.random() * 1.5,
                    iconIdx: -1
                };
            });

            // Helper to assign icons to a layer evenly across 360 degrees to prevent overlaps
            const assignIconsToLayer = (layer: any[], iconIndices: number[], angleOffset: number = 0) => {
                const numIcons = iconIndices.length;
                const sectorSize = (Math.PI * 2) / numIcons;

                iconIndices.forEach((iconIdx, i) => {
                    const targetAngle = (i * sectorSize + angleOffset) % (Math.PI * 2);
                    let bestRay: any = null;
                    let minDiff = Infinity;

                    layer.forEach(ray => {
                        if (ray.iconIdx === -1) {
                            let diff = Math.abs((ray.baseAngle % (Math.PI * 2)) - targetAngle);
                            diff = Math.min(diff, Math.PI * 2 - diff); // Shortest circular distance
                            if (diff < minDiff) {
                                minDiff = diff;
                                bestRay = ray;
                            }
                        }
                    });

                    if (bestRay) {
                        bestRay.iconIdx = iconIdx;
                    }
                });
            };

            // Important icons (0-9): GitHub, LinkedIn, X, Discord, Mail, Web, Telegram, Instagram, Figma, Slack
            // Place evenly on Layer B (medium distance)
            assignIconsToLayer(layerB, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0);

            // Less important icons (10-14): Resume, Code, Trophy, Briefcase, Web3
            // New Image Logos (15-22): Behance, Google Drive, Dribbble, Slack, Dropbox, Figma, Canva, PDF
            // Place evenly on Layer C (far distance), offset angle so they don't align perfectly with Layer B
            assignIconsToLayer(layerC, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], Math.PI / 5);

            return [...layerA, ...layerB, ...layerC];
        };

        let rays = makeLayers();

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            W = rect.width;
            H = rect.height;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        let t = 0;
        const draw = () => {
            if (!visibleRef.current) {
                rafRef.current = requestAnimationFrame(draw);
                return;
            }
            ctx.clearRect(0, 0, W, H);

            const ox = W / 2;
            const oy = H / 2;

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const mActive = mouseRef.current.active;
            const mAngle = Math.atan2(my - oy, mx - ox);
            const mNorm = mActive
                ? Math.min(Math.hypot(mx - ox, my - oy) / (Math.min(W, H) * 0.45), 1)
                : 0;

            rays.forEach(ray => {
                const wobble = Math.sin(t * ray.wobbleSpeed + ray.wobblePhase) * ray.wobbleAmp;

                let scatter = 0;
                if (mActive && mNorm > 0.04) {
                    const da = ray.baseAngle - mAngle;
                    const nda = Math.atan2(Math.sin(da), Math.cos(da));
                    scatter = Math.exp(-nda * nda * 5) * mNorm * 0.5;
                }

                const angle = ray.baseAngle + wobble + scatter;
                const lMult = 1 + (mNorm * Math.exp(-Math.abs(Math.atan2(Math.sin(ray.baseAngle - mAngle), Math.cos(ray.baseAngle - mAngle))) * 1.8) * 0.3);
                const len = ray.length * lMult;

                const ex = ox + Math.cos(angle) * len;
                const ey = oy + Math.sin(angle) * len;

                // Draw Line
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.lineTo(ex, ey);
                ctx.strokeStyle = `rgba(255,255,255,${ray.opacity})`;
                ctx.lineWidth = ray.thickness;
                ctx.stroke();

                // Draw Endpoint (Icon or Dot)
                if (ray.iconIdx >= 0 && loadedIcons[ray.iconIdx]?.complete) {
                    const img = loadedIcons[ray.iconIdx];
                    const size = 12; // Icon size in pixels
                    ctx.globalAlpha = ray.opacity * 4; // Make icons pop a bit more than the faint lines
                    ctx.drawImage(img, ex - size / 2, ey - size / 2, size, size);
                    ctx.globalAlpha = 1.0; // Reset alpha
                } else {
                    ctx.beginPath();
                    ctx.arc(ex, ey, ray.dotR, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255,255,255,${ray.opacity * 1.8})`;
                    ctx.fill();
                }
            });

            // Soft central glow (origin point)
            const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, 36);
            grd.addColorStop(0, 'rgba(255,255,255,0.18)');
            grd.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.beginPath();
            ctx.arc(ox, oy, 36, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            t += 0.016;
            rafRef.current = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        const onMove = (e: MouseEvent) => {
            const r = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, active: true };
        };
        const onLeave = () => { mouseRef.current.active = false; };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);

        return () => {
            cancelAnimationFrame(rafRef.current);
            visObserver.disconnect();
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', onMove);
            canvas.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}