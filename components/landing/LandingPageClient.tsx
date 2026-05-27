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
    Briefcase,
    Send,
    Inbox,
    Zap,
    TrendingUp
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
function MockRecruiterDashboardUI() {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    const candidates = [
        { initials: "SC", avatar: "https://i.pravatar.cc/40?img=47", name: "Sarah Chen",   wallet: "9xKm...f2Yp", role: "Rust Developer",      status: "shortlisted", signal: "STRONG",     proofs: 12, attested: 4, org: "Solana Foundation", active: "2h ago", bio: "Rust systems engineer with 4 years building on-chain programs and DeFi protocols for Solana mainnet.", skills: ["Rust", "Anchor", "Web3.js"] },
        { initials: "MW", avatar: "https://i.pravatar.cc/40?img=12", name: "Marcus Wei",   wallet: "3tBq...w8Rv", role: "Protocol Engineer",   status: "pending",     signal: "STRONG",     proofs: 8,  attested: 3, org: "Anchor Labs",       active: "5h ago", bio: "Core protocol engineer specialising in high-throughput transaction pipelines and MEV infrastructure.", skills: ["Go", "Rust", "Protocol Design"] },
        { initials: "DO", avatar: "https://i.pravatar.cc/40?img=25", name: "Dani Okonkwo", wallet: "7pLn...k4Jx", role: "Smart Contract Dev", status: "pending",     signal: "CALIBRATED", proofs: 6,  attested: 2, org: "Drift Protocol",    active: "1d ago", bio: "Smart contract developer focused on DeFi primitives and cross-chain bridge security audits.", skills: ["Solidity", "Rust", "TypeScript"] },
        { initials: "YT", avatar: "https://i.pravatar.cc/40?img=44", name: "Yuki Tanaka",  wallet: "2cHs...m9Qd", role: "Core Developer",     status: "hired",       signal: "STRONG",     proofs: 15, attested: 5, org: "Jito Labs",         active: "3h ago", bio: "Low-level systems developer with deep expertise in consensus mechanisms and validator operations.", skills: ["Rust", "C++", "Linux"] },
        { initials: "AP", avatar: "https://i.pravatar.cc/40?img=60", name: "Alex Petrov",  wallet: "8gVz...r6Ns", role: "Frontend Engineer",  status: "rejected",    signal: "LOW SIGNAL", proofs: 3,  attested: 0, org: "",                  active: "2d ago", bio: "Frontend engineer building Web3 interfaces with wallet adapter integrations across DeFi apps.", skills: ["React", "TypeScript", "ethers.js"] },
    ];

    // Auto-cycle through candidates
    useEffect(() => {
        let idx = 0;
        let timer: ReturnType<typeof setTimeout>;
        const SHOW = 2800;
        const GAP  = 350;

        const next = () => {
            setExpandedIdx(null);
            timer = setTimeout(() => {
                idx = (idx + 1) % candidates.length;
                setExpandedIdx(idx);
                timer = setTimeout(next, SHOW);
            }, GAP);
        };

        // initial open after short delay
        timer = setTimeout(() => {
            setExpandedIdx(0);
            timer = setTimeout(next, SHOW);
        }, 700);

        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="w-full h-full flex font-sans text-sm overflow-hidden" style={{ background: "#0a0b0e" }}>
            {/* Sidebar */}
            <div className="w-[200px] flex-shrink-0 flex flex-col overflow-hidden" style={{ background: "#0d0d10", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Logo */}
                <div className="flex items-center px-4 h-[52px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <img src="/chainvolio%20logo.png" alt="chainvolio" style={{ height: 17, width: "auto", objectFit: "contain", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.88)", marginLeft: 6, letterSpacing: "-0.01em" }}>chainvolio</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(99,102,241,0.65)", marginLeft: 4 }}>secure</span>
                </div>

                {/* Collection */}
                <div className="px-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 7.5, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Active Collection</p>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1.35 }}>Frontend Developer</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                        <span style={{ fontSize: 7.5, fontWeight: 800, color: "rgba(99,102,241,0.7)", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.14)", padding: "1.5px 6px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Full-Time</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(52,211,153,0.7)", textTransform: "uppercase" }}>Competitive</span>
                    </div>
                </div>

                {/* Pipeline stats */}
                <div className="px-2.5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 7.5, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7, paddingLeft: 8 }}>Pipeline Overview</p>
                    <div className="space-y-1">
                        {[
                            { label: "Pipeline Depth",  value: "24",  Icon: User,        color: "rgba(96,165,250,0.7)" },
                            { label: "Authority Rate",   value: "58%", Icon: ShieldCheck, color: "rgba(52,211,153,0.7)" },
                            { label: "Signal Density",   value: "7.2", Icon: Briefcase,   color: "rgba(129,140,248,0.7)" },
                            { label: "Network Breadth",  value: "11",  Icon: Building2,   color: "rgba(251,191,36,0.7)" },
                        ].map((s, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", borderRadius: 6, background: "rgba(255,255,255,0.02)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <s.Icon style={{ width: 10, height: 10, color: s.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>{s.label}</span>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-2.5 py-3 flex-1">
                    <p style={{ fontSize: 7.5, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7, paddingLeft: 8 }}>Actions</p>
                    <div className="space-y-0.5">
                        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 6, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.14)" }}>
                            <ExternalLink style={{ width: 10, height: 10, color: "rgba(99,102,241,0.75)", flexShrink: 0 }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(99,102,241,0.8)" }}>View Public Link</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 6 }}>
                            <FileText style={{ width: 10, height: 10, color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
                            <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>Download Report</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Panel */}
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#0a0b0e" }}>
                {/* Top bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 52, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1 }}>Candidate Pipeline</p>
                        <p style={{ fontSize: 8, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>24 candidates · 5 shown</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.2)" }}>Search candidates...</span>
                    </div>
                </div>

                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 0.8fr", padding: "8px 16px", background: "rgba(255,255,255,0.01)", borderBottom: "1px solid rgba(255,255,255,0.03)", flexShrink: 0 }}>
                    {["Candidate", "Signal", "Strategic Fit", "Portfolio", "Last Active"].map((h) => (
                        <span key={h} style={{ fontSize: 7.5, fontWeight: 800, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.14em" }}>{h}</span>
                    ))}
                </div>

                {/* Candidate rows */}
                <div className="flex-1 overflow-hidden">
                    {candidates.map((c, i) => {
                        const isOpen = expandedIdx === i;
                        const statusColor = c.status === "shortlisted" ? "#10b981" : c.status === "hired" ? "#6366f1" : c.status === "rejected" ? "#ef4444" : "transparent";
                        return (
                            <div key={i} style={{ opacity: c.status === "rejected" ? 0.4 : 1, borderBottom: "1px solid rgba(255,255,255,0.025)", transition: "opacity 0.3s ease" }}>
                                {/* Row */}
                                <div style={{
                                    display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 0.8fr",
                                    padding: "9px 16px", alignItems: "center",
                                    background: isOpen ? "rgba(99,102,241,0.04)" : "transparent",
                                    borderLeft: isOpen ? "2px solid rgba(99,102,241,0.4)" : "2px solid transparent",
                                    transition: "background 0.25s ease, border-color 0.25s ease",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                        <div style={{ position: "relative", flexShrink: 0 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: 7, overflow: "hidden", border: `1px solid ${isOpen ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`, transition: "border-color 0.25s", flexShrink: 0 }}>
                                                <img src={c.avatar} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                            </div>
                                            {c.status !== "pending" && <div style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: statusColor, border: "1.5px solid #0a0b0e" }} />}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 10.5, fontWeight: 700, color: isOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.82)", lineHeight: 1, marginBottom: 2, transition: "color 0.2s" }}>{c.name}</p>
                                            <p style={{ fontSize: 7.5, fontWeight: 600, color: "rgba(255,255,255,0.22)", fontFamily: "monospace" }}>{c.wallet}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: 7.5, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.08em", padding: "2px 6px", borderRadius: 3, background: c.signal === "STRONG" ? "rgba(52,211,153,0.1)" : c.signal === "CALIBRATED" ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.08)", color: c.signal === "STRONG" ? "rgba(52,211,153,0.9)" : c.signal === "CALIBRATED" ? "rgba(251,191,36,0.9)" : "rgba(239,68,68,0.7)", border: `1px solid ${c.signal === "STRONG" ? "rgba(52,211,153,0.2)" : c.signal === "CALIBRATED" ? "rgba(251,191,36,0.2)" : "rgba(239,68,68,0.15)"}` }}>
                                            {c.signal}
                                        </span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 9.5, fontWeight: 600, color: "rgba(255,255,255,0.6)", lineHeight: 1, marginBottom: 2 }}>{c.role}</p>
                                        {c.org && <p style={{ fontSize: 8, color: "rgba(255,255,255,0.22)" }}>{c.org}</p>}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ textAlign: "center" as const }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1 }}>{c.proofs}</p>
                                            <p style={{ fontSize: 6.5, fontWeight: 700, color: "rgba(255,255,255,0.18)", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>proofs</p>
                                        </div>
                                        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.05)" }} />
                                        <div style={{ textAlign: "center" as const }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: c.attested > 0 ? "rgba(52,211,153,0.85)" : "rgba(255,255,255,0.18)", lineHeight: 1 }}>{c.attested}</p>
                                            <p style={{ fontSize: 6.5, fontWeight: 700, color: "rgba(255,255,255,0.18)", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>attest</p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <Clock style={{ width: 9, height: 9, color: "rgba(255,255,255,0.2)" }} />
                                        <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{c.active}</span>
                                    </div>
                                </div>

                                {/* Expanded panel — slides in below the row */}
                                <div style={{
                                    maxHeight: isOpen ? "160px" : "0px",
                                    opacity: isOpen ? 1 : 0,
                                    overflow: "hidden",
                                    transition: "max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease",
                                    background: "rgba(0,0,0,0.4)",
                                    borderLeft: "2px solid rgba(99,102,241,0.35)",
                                }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "14px 20px 14px 18px" }}>
                                        {/* Left: Candidate intelligence */}
                                        <div>
                                            <p style={{ fontSize: 8, fontWeight: 800, color: "rgba(99,102,241,0.7)", textTransform: "uppercase" as const, letterSpacing: "0.2em", marginBottom: 8 }}>Candidate Intelligence</p>
                                            <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.55, marginBottom: 10, fontWeight: 500 }}>{c.bio}</p>
                                            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
                                                {c.skills.map((sk) => (
                                                    <span key={sk} style={{ fontSize: 7.5, fontWeight: 700, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "2px 7px", borderRadius: 4, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{sk}</span>
                                                ))}
                                            </div>
                                            {c.attested > 0 && (
                                                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                                                    <ShieldCheck style={{ width: 9, height: 9, color: "rgba(52,211,153,0.7)" }} />
                                                    <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(52,211,153,0.65)" }}>Protocol Verified · {c.org}</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Right: Pipeline calibration */}
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                                <p style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.22)", textTransform: "uppercase" as const, letterSpacing: "0.2em" }}>Pipeline Calibration</p>
                                                <span style={{ fontSize: 7.5, fontWeight: 800, color: c.status === "shortlisted" ? "rgba(52,211,153,0.8)" : c.status === "hired" ? "rgba(99,102,241,0.8)" : c.status === "rejected" ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.3)", background: c.status === "shortlisted" ? "rgba(52,211,153,0.08)" : c.status === "hired" ? "rgba(99,102,241,0.08)" : c.status === "rejected" ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)", border: `1px solid ${c.status === "shortlisted" ? "rgba(52,211,153,0.2)" : c.status === "hired" ? "rgba(99,102,241,0.2)" : c.status === "rejected" ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)"}`, padding: "2px 7px", borderRadius: 3, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                                                    {c.status === "pending" ? "Under Review" : c.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", gap: 6, marginBottom: 7 }}>
                                                <div style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: c.status === "shortlisted" ? "1px solid rgba(52,211,153,0.5)" : "1px solid rgba(52,211,153,0.12)", background: c.status === "shortlisted" ? "rgba(52,211,153,0.15)" : "rgba(52,211,153,0.04)", textAlign: "center" as const }}>
                                                    <span style={{ fontSize: 8, fontWeight: 800, color: c.status === "shortlisted" ? "rgba(52,211,153,1)" : "rgba(52,211,153,0.45)", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>Shortlist</span>
                                                </div>
                                                <div style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: c.status === "rejected" ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.06)", background: c.status === "rejected" ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.02)", textAlign: "center" as const }}>
                                                    <span style={{ fontSize: 8, fontWeight: 800, color: c.status === "rejected" ? "rgba(239,68,68,0.85)" : "rgba(255,255,255,0.25)", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>Reject</span>
                                                </div>
                                            </div>
                                            <div style={{ padding: "7px 0", borderRadius: 7, border: c.status === "hired" ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(99,102,241,0.14)", background: c.status === "hired" ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.05)", textAlign: "center" as const }}>
                                                <span style={{ fontSize: 8, fontWeight: 800, color: c.status === "hired" ? "rgba(99,102,241,1)" : "rgba(99,102,241,0.5)", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>
                                                    {c.status === "hired" ? "Hired On-Chain ✓" : "Mark as Hired"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer strip */}
                <div style={{ height: 32, flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", opacity: 0.4 }}>
                    <span style={{ fontSize: 8.5, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", letterSpacing: "0.04em" }}>COLLECTION: cv-frontend-2025 · 24 applicants</span>
                    <span style={{ fontSize: 8.5, fontWeight: 600, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>Secured · Solana Mainnet</span>
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
    background: "#060608",
    border: "1px solid rgba(255,255,255,0.13)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.1) inset, 0 32px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)",
};

function CardShimmers({ delay = "-2s" }: { delay?: string }) {
    return (
        <>
            {/* Lightning shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.10] to-transparent animate-lightning-shine pointer-events-none z-[48] opacity-90 rounded-[14px]" style={{ animationDelay: delay }} />
            {/* Diagonal sheen — top-left catch light */}
            <div className="absolute inset-0 pointer-events-none rounded-[14px]" style={{ zIndex: 40, background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 25%, transparent 50%)" }} />
            {/* Top-edge specular line */}
            <div className="absolute inset-x-0 top-0 h-px pointer-events-none rounded-t-[14px]" style={{ zIndex: 41, background: "linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.25) 35%, rgba(255,255,255,0.15) 65%, transparent 92%)" }} />
            {/* Spotlight cone from top-left */}
            <div className="absolute inset-0 pointer-events-none rounded-[14px]" style={{ zIndex: 39, background: "conic-gradient(from 150deg at 12% -6%, transparent 55deg, rgba(255,255,255,0.05) 67deg, rgba(255,255,255,0.025) 78deg, transparent 92deg)" }} />
        </>
    );
}

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
        { initials: "SD", color: "#60a5fa", name: "Superteam DAO", action: "attested your contribution at", subject: "Solana Hackathon", time: "1h ago" },
        { initials: "SA", color: "#a78bfa", name: "Smart Contract Auditor", action: "attested your audit on", subject: "Payment Protocol v2", time: "3h ago" },
        { initials: "GH", color: "#f59e0b", name: "GitHub", action: "verified your contribution in", subject: "chainvolio/identity-core", time: "1d ago" },
    ];
    return (
        <div style={CARD_BASE} className="theme-preserve">
            <CardShimmers delay="-1.5s" />
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
            <CardShimmers delay="-3.5s" />
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
                            Transaction confirmed on Solana. This record is now public and tamper-resistant.
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
            <CardShimmers delay="-5.5s" />
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
        { icon: Lock, label: "Public and tamper-resistant", desc: "Anyone can verify, the on-chain record cannot be altered.", color: "#a78bfa" },
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
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.12]" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse flex-shrink-0" />
                        <span className="text-[11px] text-white/50 font-medium tracking-[-0.01em]">Verifiable Work History with On-Chain Attestations</span>
                    </div>
                    <h3 className="text-[22px] sm:text-[32px] md:text-[38px] lg:text-[44px] font-bold text-white tracking-tight leading-[1.06] mb-5">
                        Proof of work,<br /><span className="text-amber-200/60">not claims.</span>
                    </h3>
                    <div className="h-px w-full max-w-6xl bg-white/10 mb-5" />
                    <p className="text-white/40 text-[12px] md:text-[13px] leading-relaxed font-normal max-w-md">
                        Attestations turn real contributions into verifiable records. Every endorsement is cryptographically signed, creating a tamper-resistant work history.
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
// --- Floating Inbox Card ---
function FloatingInboxCard() {
    return (
        <div className="theme-preserve w-[220px] rounded-xl border overflow-hidden flex flex-col font-sans relative"
            style={{
                background: "#0c0d11",
                borderColor: "rgba(255,255,255,0.13)",
                boxShadow: "1px 2px 8px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)",
            }}
        >
            {/* Lightning shimmer — offset by half cycle so it doesn't sync with hero */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-lightning-shine pointer-events-none z-10 rounded-xl" style={{ animationDelay: "-4s" }} />
            {/* Header */}
            {/* Header */}
            <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-1.5">
                    <Inbox style={{ width: 10, height: 10, color: "rgba(255,255,255,0.35)" }} />
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Inbox</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.4)" }} />
                    <span style={{ fontSize: 6.5, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>1 new</span>
                </div>
            </div>

            {/* Recruiter message */}
            <div className="px-2.5 pt-2 pb-1.5">
                <div style={{ padding: "6px 7px", borderRadius: 7, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.14)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                        <div style={{ width: 17, height: 17, borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Building2 style={{ width: 8, height: 8, color: "rgba(255,255,255,0.3)" }} />
                        </div>
                        <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.65)", lineHeight: 1, flex: 1 }}>Meridian Labs</p>
                        <span style={{ fontSize: 6, color: "rgba(255,255,255,0.18)", fontFamily: "monospace" }}>2h</span>
                    </div>
                    <p style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                        Inviting you for an interview —{" "}
                        <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>Core Rust Engineer</span>.
                    </p>
                </div>
            </div>

            {/* Reply compose */}
            <div className="px-2.5 pb-2.5">
                <div style={{ padding: "6px 7px", borderRadius: 7, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <p style={{ fontSize: 6.5, fontWeight: 700, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Reply</p>
                    <p style={{ fontSize: 8, color: "rgba(255,255,255,0.42)", lineHeight: 1.5, marginBottom: 6 }}>
                        Thanks for the invite! I&apos;d be happy to schedule a call this week.
                        <span className="animate-pulse inline-block ml-[2px]" style={{ width: "1.5px", height: "10px", background: "rgba(255,255,255,0.7)", borderRadius: "1px", verticalAlign: "middle" }} />
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", lineHeight: 1 }}>
                            <span style={{ fontSize: 7, fontWeight: 600, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1, display: "block" }}>Send</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Floating CV Score Card ---
function FloatingVerificationCard() {
    const top3 = [
        { initials: "SC", avatar: "https://i.pravatar.cc/40?img=47", name: "Sarah Chen",  role: "Rust Developer",    score: 94, color: "#6366f1" },
        { initials: "YT", avatar: "https://i.pravatar.cc/40?img=44", name: "Yuki Tanaka", role: "Core Developer",    score: 91, color: "#34d399" },
        { initials: "MW", avatar: "https://i.pravatar.cc/40?img=12", name: "Marcus Wei",  role: "Protocol Engineer", score: 87, color: "#60a5fa" },
    ];
    return (
        <div className="theme-preserve w-[280px] bg-[#060608]/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col font-sans relative"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04) inset" }}
        >
            {/* Shiny sweep with offset timing */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none z-50 rounded-2xl"
                style={{ 
                    animation: "lightning-shine 7s ease-in-out infinite",
                    animationDelay: "-2.5s"
                }} 
            />

            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between" style={{ background: "rgba(99,102,241,0.06)" }}>
                <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">CV Score</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            </div>

            {/* Body */}
            <div className="px-3 py-3 space-y-2">
                <p style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
                    Top Recommended
                </p>
                {top3.map((c, i) => (
                    <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px", borderRadius: 10,
                        background: i === 0 ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${i === 0 ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.05)"}`,
                    }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, overflow: "hidden", border: `1px solid ${c.color}35`, flexShrink: 0 }}>
                            <img src={c.avatar} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1, marginBottom: 2 }}>{c.name}</p>
                            <p style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.role}</p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{ fontSize: 16, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.score}</p>
                            <p style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.1em" }}>score</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom glow */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />
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
        <div key={0} className="theme-preserve w-full h-[360px] rounded-2xl overflow-hidden flex relative" style={{ background: "#0d0e11", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 24px 48px -8px rgba(0,0,0,0.85)" }}>
            {/* Spotlight */}
            <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: "radial-gradient(ellipse 50% 30% at 50% -1%, rgba(255,255,255,0.06) 0%, transparent 80%)" }} />
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-lightning-shine pointer-events-none z-[6] opacity-70" />

            {/* Left Sidebar */}
            <div className="w-[110px] sm:w-[130px] flex-shrink-0 flex flex-col h-full" style={{ background: "#111215", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center px-3 h-[38px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <img src="/chainvolio%20logo.png" alt="logo" style={{ height: 12, width: "auto" }} />
                    <span className="hidden sm:inline" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>chainvolio</span>
                </div>
                <div className="px-1.5 py-2 flex-1 space-y-0.5">
                    {[
                        { label: "Talent Pool", id: 0 },
                        { label: "Trust Net", id: 1 },
                        { label: "Distribution", id: 2 }
                    ].map(item => {
                        const isItemActive = active === item.id;
                        return (
                            <div key={item.id} className="flex items-center gap-1 px-2 py-[4px] rounded-md transition-colors cursor-pointer" style={isItemActive ? { background: "rgba(255,255,255,0.07)" } : {}} onClick={() => setActive(item.id)}>
                                <span style={{ fontSize: 9, fontWeight: isItemActive ? 600 : 500, color: isItemActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0" style={{ background: "#0a0b0e" }}>
                <div className="flex items-center justify-between px-4 h-[38px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Talent Pool</span>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-center min-h-0 relative z-10">
                    {/* Profile Card */}
                    <div className="rounded-xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 p-3.5 relative overflow-hidden flex flex-col justify-center shadow-inner">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs font-black text-white/80 shadow-lg">
                                    AR
                                </div>
                                <div>
                                    <h5 className="text-[12px] font-bold text-white mb-0.5">Alex Rivera</h5>
                                    <p className="text-[10px] text-white/40">Sr. Rust Developer</p>
                                </div>
                            </div>
                            
                            {/* Trust Score Badge */}
                            <div className="flex flex-col items-center justify-center relative scale-90">
                                <span className="text-[7px] font-bold text-[#14F195]/60 uppercase tracking-widest mb-0.5">Score</span>
                                <div className="w-9 h-9 rounded-full bg-[#14F195]/10 border border-[#14F195]/30 shadow-[0_0_15px_rgba(20,241,149,0.15)] flex items-center justify-center">
                                    <span className="text-xs font-black text-[#14F195]">98</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 relative z-10">
                            <div className="p-2.5 rounded-lg bg-[#0d0e11] border border-white/5 shadow-md">
                                <p className="text-[8px] text-white/30 uppercase tracking-wider mb-1 font-bold">On-Chain Signals</p>
                                <p className="text-sm font-black text-blue-400 leading-none">142</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#0d0e11] border border-white/5 shadow-md">
                                <p className="text-[8px] text-white/30 uppercase tracking-wider mb-1 font-bold">Org Attestations</p>
                                <p className="text-sm font-black text-indigo-400 leading-none">12</p>
                            </div>
                        </div>

                        {/* Skills & Match score */}
                        <div className="mt-3.5 space-y-2 relative z-10">
                            <div className="flex items-center justify-between text-[9px]">
                                <span className="text-white/30 font-bold uppercase tracking-wider">Role Match</span>
                                <span className="text-[#14F195] font-black">95% (Perfect)</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-505 to-[#14F195] rounded-full" style={{ width: "95%" }} />
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {["Rust", "Solana", "Anchor", "DeFi"].map(skill => (
                                    <span key={skill} className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white/50 bg-white/5 border border-white/5">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,

        // Box 1: Org-Backed Trust (Endorsement Chain)
        <div key={1} className="theme-preserve w-full h-[360px] rounded-2xl overflow-hidden flex relative" style={{ background: "#0d0e11", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 24px 48px -8px rgba(0,0,0,0.85)" }}>
            {/* Spotlight */}
            <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: "radial-gradient(ellipse 50% 30% at 50% -1%, rgba(255,255,255,0.06) 0%, transparent 80%)" }} />
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-lightning-shine pointer-events-none z-[6] opacity-70" />

            {/* Left Sidebar */}
            <div className="w-[110px] sm:w-[130px] flex-shrink-0 flex flex-col h-full" style={{ background: "#111215", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center px-3 h-[38px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <img src="/chainvolio%20logo.png" alt="logo" style={{ height: 12, width: "auto" }} />
                    <span className="hidden sm:inline" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>chainvolio</span>
                </div>
                <div className="px-1.5 py-2 flex-1 space-y-0.5">
                    {[
                        { label: "Talent Pool", id: 0 },
                        { label: "Trust Net", id: 1 },
                        { label: "Distribution", id: 2 }
                    ].map(item => {
                        const isItemActive = active === item.id;
                        return (
                            <div key={item.id} className="flex items-center gap-1 px-2 py-[4px] rounded-md transition-colors cursor-pointer" style={isItemActive ? { background: "rgba(255,255,255,0.07)" } : {}} onClick={() => setActive(item.id)}>
                                <span style={{ fontSize: 9, fontWeight: isItemActive ? 600 : 500, color: isItemActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0" style={{ background: "#0a0b0e" }}>
                <div className="flex items-center justify-between px-4 h-[38px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Trust Network</span>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-center min-h-0 relative z-10">
                    {/* Timeline */}
                    <div className="relative pl-4 space-y-2.5 border-l border-white/[0.08] ml-2">
                        {[
                            { org: "Nexus Protocol", role: "Core Contributor", date: "Q3 24", color: "#94a3b8" },
                            { org: "Superteam", role: "Grant Winner", date: "Q1 24", color: "#60a5fa" },
                            { org: "Solana Foundation", role: "Hackathon 1st", date: "2023", color: "#14F195" },
                        ].map((e, i) => (
                            <div key={i} className="relative group">
                                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border-2 border-[#0a0b0e] transition-transform duration-300 group-hover:scale-125" style={{ background: e.color }} />
                                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors flex items-center justify-between shadow-md">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <ShieldCheck className="w-3.5 h-3.5" style={{ color: e.color }} />
                                            <h5 className="text-[11px] font-bold text-white/90">{e.org}</h5>
                                        </div>
                                        <p className="text-[9px] text-white/40">{e.role}</p>
                                    </div>
                                    <span className="text-[9px] font-medium text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{e.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Verification Summary Card */}
                    <div className="mt-3.5 p-2 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/80 leading-none">Security Attestation</p>
                                <p className="text-[8px] text-white/30 mt-0.5 font-medium">Solana SPL-Memo Protocol</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[7.5px] font-mono text-emerald-400/70 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Verified</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>,

        // Box 2: Post Anywhere (Share Link)
        <div key={2} className="theme-preserve w-full h-[360px] rounded-2xl overflow-hidden flex relative" style={{ background: "#0d0e11", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 24px 48px -8px rgba(0,0,0,0.85)" }}>
            {/* Spotlight */}
            <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: "radial-gradient(ellipse 50% 30% at 50% -1%, rgba(255,255,255,0.06) 0%, transparent 80%)" }} />
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-lightning-shine pointer-events-none z-[6] opacity-70" />

            {/* Left Sidebar */}
            <div className="w-[110px] sm:w-[130px] flex-shrink-0 flex flex-col h-full" style={{ background: "#111215", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center px-3 h-[38px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <img src="/chainvolio%20logo.png" alt="logo" style={{ height: 12, width: "auto" }} />
                    <span className="hidden sm:inline" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>chainvolio</span>
                </div>
                <div className="px-1.5 py-2 flex-1 space-y-0.5">
                    {[
                        { label: "Talent Pool", id: 0 },
                        { label: "Trust Net", id: 1 },
                        { label: "Distribution", id: 2 }
                    ].map(item => {
                        const isItemActive = active === item.id;
                        return (
                            <div key={item.id} className="flex items-center gap-1 px-2 py-[4px] rounded-md transition-colors cursor-pointer" style={isItemActive ? { background: "rgba(255,255,255,0.07)" } : {}} onClick={() => setActive(item.id)}>
                                <span style={{ fontSize: 9, fontWeight: isItemActive ? 600 : 500, color: isItemActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0" style={{ background: "#0a0b0e" }}>
                <div className="flex items-center justify-between px-4 h-[38px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Distribution</span>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-center min-h-0 relative z-10">
                    {/* Share Widget */}
                    <div className="flex-1 flex flex-col gap-2.5 justify-center">
                        {/* Primary Link Card */}
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5 relative group/link hover:bg-white/[0.05] transition-all duration-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
                                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Live Link</span>
                                </div>
                                <div className="px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                                    <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Encrypted</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white tracking-tight truncate">chainvolio.xyz/hire/rust-dev</span>
                                <button className="flex-shrink-0 w-6 h-6 rounded bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all shadow-lg active:scale-95">
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Social Channels */}
                        <div className="grid grid-cols-2 gap-2">
                            {/* LinkedIn Channel */}
                            <div className="rounded-lg border border-white/5 bg-gradient-to-br from-[#0077b5]/10 to-transparent p-2.5 flex flex-col justify-between group/social hover:border-[#0077b5]/30 transition-all duration-500 cursor-pointer">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="w-5 h-5 rounded bg-[#0077b5]/20 flex items-center justify-center">
                                        <Linkedin className="w-2.5 h-2.5 text-[#0077b5]" />
                                    </div>
                                    <ArrowRight className="w-2.5 h-2.5 text-white/20 group-hover/social:text-white/60 group-hover/social:translate-x-1 transition-all" />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-bold text-white mb-0.5">LinkedIn</h5>
                                    <p className="text-[7.5px] text-white/30 leading-tight">Professional network</p>
                                </div>
                                <div className="mt-2 py-1 w-full rounded bg-[#0077b5] text-white text-[8px] font-black uppercase tracking-widest text-center shadow-lg shadow-[#0077b5]/20 opacity-80 group-hover/social:opacity-100 transition-opacity">
                                    Share Post
                                </div>
                            </div>

                            {/* X Channel */}
                            <div className="rounded-lg border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-2.5 flex flex-col justify-between group/social hover:border-white/20 transition-all duration-500 cursor-pointer">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-white">X</span>
                                    </div>
                                    <ArrowRight className="w-2.5 h-2.5 text-white/20 group-hover/social:text-white/60 group-hover/social:translate-x-1 transition-all" />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-bold text-white mb-0.5">X / Twitter</h5>
                                    <p className="text-[7.5px] text-white/30 leading-tight">Instant broadcast</p>
                                </div>
                                <div className="mt-2 py-1 w-full rounded bg-white text-black text-[8px] font-black uppercase tracking-widest text-center shadow-lg shadow-white/10 opacity-90 group-hover/social:opacity-100 transition-opacity">
                                    Blast Link
                                </div>
                            </div>
                        </div>

                        {/* Live Metrics Row */}
                        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                            <div className="p-1.5 rounded-lg bg-white/[0.015] border border-white/5">
                                <p className="text-[7.5px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Views</p>
                                <p className="text-xs font-black text-white/80">1,420</p>
                            </div>
                            <div className="p-1.5 rounded-lg bg-white/[0.015] border border-white/5">
                                <p className="text-[7.5px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Applicants</p>
                                <p className="text-xs font-black text-[#14F195]">48</p>
                            </div>
                            <div className="p-1.5 rounded-lg bg-white/[0.015] border border-white/5">
                                <p className="text-[7.5px] text-white/30 font-bold uppercase tracking-wider mb-0.5">CTR</p>
                                <p className="text-xs font-black text-amber-400">3.4%</p>
                            </div>
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
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.12]" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse flex-shrink-0" />
                        <span className="text-[11px] text-white/50 font-medium tracking-[-0.01em]">How to Hire Verified Web3 Talent</span>
                    </div>
                    <h3 className="text-[22px] sm:text-[32px] md:text-[38px] lg:text-[44px] font-bold text-white tracking-tight leading-[1.06]">
                        Hire based on real proof,<br /><span className="text-amber-200/60">not profiles.</span>
                    </h3>
                    <div className="h-px w-full max-w-6xl bg-white/10" />
                    <p className="text-white/40 text-[12px] md:text-[13px] leading-relaxed font-normal max-w-md">
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
                                <p className={`text-[12px] font-bold mb-1 ${active === f.slide ? "text-white/90" : "text-white/50"}`}>
                                    {f.label}
                                </p>
                                <p className={`text-[11px] leading-relaxed ${active === f.slide ? "text-white/40" : "text-white/20"}`}>
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
    const [heroTab, setHeroTab] = useState<'profile' | 'proof-work' | 'timeline'>('profile');
    const [heroFading, setHeroFading] = useState(false);
    const heroVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const tabs: Array<'profile' | 'proof-work' | 'timeline'> = ['profile', 'proof-work', 'timeline'];
        let idx = 0;
        const cycle = setInterval(() => {
            setHeroFading(true);
            setTimeout(() => {
                idx = (idx + 1) % tabs.length;
                setHeroTab(tabs[idx]);
                setHeroFading(false);
            }, 380);
        }, 4800);
        return () => clearInterval(cycle);
    }, []);
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

    const onAnimationComplete = () => {
        setIsAnimating(false);
        if (problemIdx === 0) setProblemIdx(3);
        if (problemIdx === 4) setProblemIdx(1);
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
                <div className="w-full" style={{ background: "linear-gradient(to bottom, #000000 0%, #2c2c30 100%)" }}>
                <section className="relative pt-20 sm:pt-28 md:pt-36 pb-0 px-4 sm:px-6 z-20 max-w-[1100px] mx-auto flex flex-col w-full">

                    {/* Badge — above headline */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.14] backdrop-blur-md mb-5 self-start" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70 animate-pulse flex-shrink-0" />
                        <span className="text-[11px] text-white/50 font-medium tracking-[-0.01em] whitespace-nowrap">
                            Trust layer for Web3
                        </span>
                    </div>

                    {/* Headline — large, left-aligned, Linear proportions */}
                    <h1 className="text-[22px] sm:text-[32px] md:text-[40px] lg:text-[46px] font-bold tracking-[-0.025em] leading-[1.1] text-white max-w-[680px] mb-5 sm:mb-6">
                        Build a Verifiable Web3
                        <br />Resume <span className="text-amber-200/60">That Recruiters Trust.</span>
                    </h1>

                    {/* Subtitle + Start Free */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8 sm:mb-10">
                        <div className="space-y-2">
                            <p className="text-white/35 text-[12px] sm:text-[13px] font-normal leading-relaxed max-w-[380px]">
                                Signed by real people. Anchored on Solana.
                                <br />Cryptographically verified. Share anywhere with one link.
                            </p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2 max-w-[320px] w-full sm:w-auto sm:-mt-1.5">
                            <Link
                                href="/create-profile"
                                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.14] backdrop-blur-md flex-shrink-0 transition-all hover:border-white/[0.22] active:scale-[0.97]" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)" }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 flex-shrink-0" />
                                <span className="text-[11px] text-white/50 font-medium tracking-[-0.01em] whitespace-nowrap">
                                    Start Free
                                </span>
                                <ArrowRight className="w-3 h-3 text-white/25 flex-shrink-0" />
                            </Link>
                            <p className="text-white/20 text-[10px] font-normal leading-relaxed text-left sm:text-right">
                                Connect your wallet or Google account → complete your profile → get a shareable verified link in under 2 minutes.
                            </p>
                        </div>
                    </div>

                    {/* HERO VISUAL - App UI Card Mockup */}
                    <div className="relative w-full mt-6 sm:mt-8 flex items-center justify-center h-[260px] min-[400px]:h-[300px] sm:h-[400px] md:h-[520px] lg:h-[640px]">
                        {/* Container scaled responsively */}
                        <div
                            className="w-[960px] h-[540px] absolute left-1/2 -translate-x-1/2 top-0 scale-[0.45] min-[400px]:scale-[0.52] sm:scale-[0.7] md:scale-[0.88] lg:scale-[1.1] origin-top transition-all duration-300 flex-shrink-0"
                        >
                            {/* ── LINEAR-STYLE 3-PANEL APP MOCKUP ── */}
                            <div className="absolute inset-0 rounded-2xl overflow-hidden flex" style={{ background: "#0d0e11", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 40px 48px -20px rgba(0,0,0,0.98), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
                                {/* Spotlight — thin cone from top-center */}
                                <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: "radial-gradient(ellipse 45% 28% at 50% -1%, rgba(255,255,255,0.07) 0%, transparent 80%)" }} />

                                {/* ── LEFT SIDEBAR ── */}
                                <div className="w-[195px] flex-shrink-0 flex flex-col h-full" style={{ background: "#111215", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                                    {/* Logo */}
                                    <div className="flex items-center px-4 h-[46px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <img src="/chainvolio%20logo.png" alt="chainvolio" style={{ height: 20, width: "auto", objectFit: "contain" }} />
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", marginLeft: 6, letterSpacing: "-0.01em" }}>chainvolio</span>
                                    </div>
                                    {/* Nav items */}
                                    <div className="px-2 py-2.5 flex-1 space-y-0.5">
                                        {([
                                            { icon: User,        label: "Profile",           id: "profile"     },
                                            { icon: ShieldCheck, label: "Credential",        id: "credential"  },
                                            { icon: FileCheck2,  label: "Proof of Work",     id: "proof-work"  },
                                            { icon: FolderOpen,  label: "Hiring Collection", id: "hiring"      },
                                            { icon: Activity,    label: "Attestation Usage", id: "attestation" },
                                            { icon: Briefcase,   label: "Career Timeline",   id: "timeline"    },
                                            { icon: Send,        label: "My Applications",   id: "applications"},
                                        ] as Array<{ icon: React.ElementType; label: string; id: string }>).map(({ icon: Icon, label, id }) => {
                                            const active = heroTab === id;
                                            return (
                                                <div key={id} className={`flex items-center gap-2.5 px-3 py-[6px] rounded-md relative transition-all duration-300 cursor-default ${active ? "" : "hover:bg-white/[0.03]"}`} style={active ? { background: "rgba(255,255,255,0.07)" } : {}}>
                                                    {active && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />}
                                                    <Icon style={{ width: 13, height: 13, flexShrink: 0, color: active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }} />
                                                    <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.42)" }}>{label}</span>
                                                </div>
                                            );
                                        })}
                                        
                                        {/* Floating/Wobbling Inbox Card inside sidebar */}
                                        <div className="pt-2">
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.03, 0.98, 1.02, 1, 1],
                                                    x: [0, -2, 2, -1.5, 1.5, 0, 0, 0],
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    repeat: Infinity,
                                                    repeatDelay: 4.5,
                                                    ease: "easeInOut"
                                                }}
                                                whileHover={{
                                                    scale: 1.02,
                                                    transition: { duration: 0.3 }
                                                }}
                                                className="cursor-pointer w-full"
                                            >
                                                <div className="theme-preserve w-full rounded-xl border overflow-hidden flex flex-col font-sans relative"
                                                    style={{
                                                        background: "rgba(255,255,255,0.015)",
                                                        borderColor: "rgba(255,255,255,0.06)",
                                                        boxShadow: "none",
                                                    }}
                                                >
                                                    {/* Lightning shimmer */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-lightning-shine pointer-events-none z-10 rounded-xl" style={{ animationDelay: "-4s" }} />
                                                    {/* Header */}
                                                    <div className="px-3 py-1.5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                                                        <div className="flex items-center gap-1.5">
                                                            <Inbox style={{ width: 10, height: 10, color: "rgba(255,255,255,0.35)" }} />
                                                            <span style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Inbox</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                            <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.4)" }} />
                                                            <span style={{ fontSize: 6.5, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>1 new</span>
                                                        </div>
                                                    </div>

                                                    {/* Recruiter message */}
                                                    <div className="px-2 pt-2 pb-1.5">
                                                        <div style={{ padding: "5px 6px", borderRadius: 7, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                                                                <div style={{ width: 15, height: 15, borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                                    <Building2 style={{ width: 8, height: 8, color: "rgba(255,255,255,0.3)" }} />
                                                                </div>
                                                                <p style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.65)", lineHeight: 1, flex: 1 }}>Meridian Labs</p>
                                                                <span style={{ fontSize: 6, color: "rgba(255,255,255,0.18)", fontFamily: "monospace" }}>2h</span>
                                                            </div>
                                                            <p style={{ fontSize: 7.5, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                                                                Inviting you for an interview —{" "}
                                                                <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>Core Rust Engineer</span>.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Reply compose */}
                                                    <div className="px-2 pb-2">
                                                        <div style={{ padding: "5px 6px", borderRadius: 7, background: "rgba(255,255,255,0.005)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                            <p style={{ fontSize: 6.5, fontWeight: 700, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Reply</p>
                                                            <p style={{ fontSize: 7.5, color: "rgba(255,255,255,0.42)", lineHeight: 1.4, marginBottom: 5 }}>
                                                                Thanks for the invite! I&apos;d be happy to schedule a call.
                                                                <>
                                                                    <style>{`
                                                                        @keyframes fast-blink {
                                                                            0%, 100% { opacity: 1; }
                                                                            50% { opacity: 0; }
                                                                        }
                                                                    `}</style>
                                                                    <span className="inline-block ml-[1px]" style={{ width: "1px", height: "8.5px", background: "rgba(255,255,255,0.75)", verticalAlign: "middle", animation: "fast-blink 0.75s infinite step-end" }} />
                                                                </>
                                                            </p>
                                                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                                <div style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", lineHeight: 1 }}>
                                                                    <span style={{ fontSize: 6.5, fontWeight: 600, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1, display: "block" }}>Send</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                    {/* User at bottom */}
                                    <div className="px-3 py-3 flex items-center gap-2 hover:bg-white/[0.03] transition-colors cursor-default" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
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
                                <div className="flex-1 flex flex-col min-w-0" style={{ background: "#0a0b0e" }}>
                                    {/* Top bar */}
                                    <div className="flex items-center justify-between px-5 h-[46px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{ transition: "opacity 380ms cubic-bezier(0.4,0,0.2,1), transform 380ms cubic-bezier(0.4,0,0.2,1)", opacity: heroFading ? 0 : 1, transform: heroFading ? "translateY(5px)" : "translateY(0)" }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1 }}>
                                                {heroTab === 'profile' ? 'Profile' : heroTab === 'proof-work' ? 'Proof of Work' : 'Career Timeline'}
                                            </p>
                                            <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>
                                                {heroTab === 'profile' ? 'Manage your professional identity and information.' : heroTab === 'proof-work' ? 'Your verified work history and on-chain contributions.' : 'Your full verified professional career timeline.'}
                                            </p>
                                        </div>
                                        <div style={{ transition: "opacity 380ms cubic-bezier(0.4,0,0.2,1)", opacity: heroFading ? 0 : 1 }}>
                                        {heroTab === 'proof-work' && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-default" style={{ background: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 700, color: "#0d0e11" }}>
                                                + Add Proof
                                            </div>
                                        )}
                                        {heroTab === 'profile' && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-default" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                                                <ExternalLink style={{ width: 10, height: 10, color: "rgba(255,255,255,0.4)" }} />
                                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Edit Profile</span>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                    {/* Body — fades on tab switch */}
                                    <div className="flex-1 overflow-hidden px-5 py-5 flex flex-col gap-3" style={{ opacity: heroFading ? 0 : 1, transform: heroFading ? "translateY(6px)" : "translateY(0)", transition: "opacity 380ms cubic-bezier(0.4,0,0.2,1), transform 380ms cubic-bezier(0.4,0,0.2,1)" }}>

                                        {/* ── PROFILE TAB ── */}
                                        {heroTab === 'profile' && (<>
                                            <div className="rounded-xl p-4 flex-shrink-0" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-[44px] h-[44px] rounded-full overflow-hidden flex-shrink-0" style={{ border: "2px solid rgba(255,255,255,0.08)" }}>
                                                        <img src="/homepage/cv%20example.png" alt="Alex Rivera" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em" }}>Alex Rivera</span>
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
                                                                <CheckCircle2 style={{ width: 7, height: 7, color: "#4ade80" }} />
                                                                <span style={{ fontSize: 8, fontWeight: 700, color: "#4ade80", letterSpacing: "0.05em" }}>VERIFIED</span>
                                                            </div>
                                                        </div>
                                                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Rust Developer · Nexus Protocol</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <div className="flex items-center gap-1"><MapPin style={{ width: 9, height: 9, color: "rgba(255,255,255,0.25)" }} /><span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)" }}>Indonesia</span></div>
                                                            <div className="flex items-center gap-1"><Clock style={{ width: 9, height: 9, color: "rgba(255,255,255,0.25)" }} /><span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)" }}>UTC+7</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 10 }} />
                                                <div className="mb-2.5">
                                                    <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Bio</p>
                                                    <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>Smart contract engineer focused on DeFi protocols and on-chain identity.</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Skills</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {["Rust", "Solana", "Anchor", "DeFi", "TypeScript"].map(s => (
                                                            <span key={s} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.5)", fontWeight: 500, padding: "1.5px 7px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Badges — only verified/attested in green */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded text-[9.5px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} /> READY
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded text-[9.5px] font-black uppercase tracking-widest" style={{ color: "rgba(147,197,253,0.9)", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)" }}>
                                                    <Clock style={{ width: 9, height: 9 }} /> 4 YR EXP
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded text-[9.5px] font-black uppercase tracking-widest" style={{ color: "#4ade80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
                                                    <ShieldCheck style={{ width: 9, height: 9 }} /> 3 ATTESTED
                                                </span>
                                            </div>
                                            {/* Work history mini */}
                                            <div className="flex-1 min-h-0">
                                                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Work History</p>
                                                <div className="space-y-1.5 relative pl-4">
                                                    <div className="absolute left-[5px] top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                                                    {[
                                                        { org: "Nexus Protocol", role: "Rust Developer", period: "2022 to 2024", current: true },
                                                        { org: "SolanaLabs", role: "Smart Contract Eng.", period: "2020 to 2022", current: false },
                                                    ].map((item, i) => (
                                                        <div key={i} className="relative">
                                                            <div className="absolute left-[-10px] top-[8px] rounded-full" style={{ width: item.current ? 7 : 5, height: item.current ? 7 : 5, background: item.current ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", transform: "translateX(-50%)" }} />
                                                            <div className="rounded-lg px-3 py-2 cursor-default" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)" }}>
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div>
                                                                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.82)" }}>{item.org}</span>
                                                                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>{item.role}</p>
                                                                    </div>
                                                                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", flexShrink: 0 }}>{item.period}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>)}

                                        {/* ── PROOF OF WORK TAB ── */}
                                        {heroTab === 'proof-work' && (<>
                                            {/* Stats row */}
                                            <div className="flex gap-2 flex-shrink-0">
                                                {[
                                                    { label: "Total Entries", value: "3" },
                                                    { label: "Attested", value: "2", green: true },
                                                    { label: "Self-Declared", value: "1" },
                                                ].map(({ label, value, green }) => (
                                                    <div key={label} className="flex-1 rounded-lg px-2.5 py-2 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: green ? "#4ade80" : "rgba(255,255,255,0.75)", lineHeight: 1 }}>{value}</p>
                                                        <p style={{ fontSize: 8.5, color: "rgba(255,255,255,0.25)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-2">
                                                {[
                                                    { org: "Nexus Protocol", role: "Rust Developer", type: "Full-time", period: "Jan 2022 to Dec 2024", attested: true, desc: "Built on-chain identity modules and DeFi smart contracts." },
                                                    { org: "SolanaLabs",    role: "Smart Contract Eng.", type: "Contract", period: "Mar 2020 to Dec 2022", attested: true, desc: "Developed Anchor programs for NFT marketplace." },
                                                    { org: "DeFi Hub",      role: "Frontend Developer",  type: "Freelance", period: "Jun 2019 — Feb 2020", attested: false, desc: "Integrated wallet adapters and swap UI flows." },
                                                ].map((item, i) => (
                                                    <div key={i} className="rounded-xl p-3.5 cursor-default hover:bg-white/[0.03] transition-colors" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                                    <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{item.org}</span>
                                                                    {item.attested ? (
                                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                                                                            <CheckCircle2 style={{ width: 7, height: 7 }} /> Attested
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                                            Self-Declared
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>{item.role}</p>
                                                                <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", marginTop: 3, lineHeight: 1.4 }}>{item.desc}</p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", display: "block" }}>{item.period}</span>
                                                                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2, display: "block" }}>{item.type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>)}

                                        {/* ── CAREER TIMELINE TAB ── */}
                                        {heroTab === 'timeline' && (<>
                                            {/* Summary bar */}
                                            <div className="flex gap-2 flex-shrink-0">
                                                {[
                                                    { label: "Total XP", value: "6 yr" },
                                                    { label: "Companies", value: "4" },
                                                    { label: "On-Chain", value: "2", green: true },
                                                ].map(({ label, value, green }) => (
                                                    <div key={label} className="flex-1 rounded-lg px-2.5 py-2 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: green ? "#4ade80" : "rgba(255,255,255,0.75)", lineHeight: 1 }}>{value}</p>
                                                        <p style={{ fontSize: 8.5, color: "rgba(255,255,255,0.25)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative pl-5 flex-1 min-h-0">
                                                <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                                                <div className="space-y-2">
                                                    {[
                                                        { org: "Nexus Protocol", role: "Rust Developer",       start: "Jan 2022", end: "Dec 2024", duration: "3 yr", current: true,  attested: true  },
                                                        { org: "SolanaLabs",    role: "Smart Contract Eng.",   start: "Mar 2020", end: "Dec 2022", duration: "2 yr", current: false, attested: true  },
                                                        { org: "DeFi Hub",      role: "Frontend Developer",   start: "Jun 2019", end: "Feb 2020", duration: "9 mo", current: false, attested: false },
                                                        { org: "Freelance",     role: "Solana Developer",     start: "Jan 2018", end: "May 2019", duration: "1 yr", current: false, attested: false },
                                                    ].map((item, i) => (
                                                        <div key={i} className="relative">
                                                            <div className="absolute left-[-14px] top-[10px] rounded-full" style={{ width: item.current ? 10 : 6, height: item.current ? 10 : 6, background: item.current ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", border: item.current ? "none" : "1px solid rgba(255,255,255,0.1)", transform: "translateX(-50%)" }} />
                                                            <div className="rounded-xl px-3 py-2.5 cursor-default hover:bg-white/[0.03] transition-colors" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                                            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{item.org}</span>
                                                                            {item.current && <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Latest</span>}
                                                                            {item.attested && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.15)" }}><ShieldCheck style={{ width: 6, height: 6 }} /> Verified</span>}
                                                                        </div>
                                                                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{item.role}</p>
                                                                    </div>
                                                                    <div className="text-right flex-shrink-0">
                                                                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", display: "block" }}>{item.start} to {item.end}</span>
                                                                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", marginTop: 1, display: "block" }}>{item.duration}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>)}
                                    </div>
                                </div>

                                {/* ── RIGHT PANEL ── */}
                                <div className="w-[215px] flex-shrink-0 flex flex-col" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)", background: "#0a0b0e" }}>
                                    <div className="px-4 pt-3 pb-4 space-y-2.5 overflow-hidden flex-1">
                                        {/* Share Your Profile */}
                                        <motion.div
                                            animate={{
                                                scale: [1, 0.98, 1.03, 1.02, 1, 1],
                                                x: [0, 2, -2, 1.5, -1.5, 0, 0, 0],
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                                repeatDelay: 4.5,
                                                ease: "easeInOut",
                                                delay: 0.4
                                            }}
                                            whileHover={{
                                                scale: 1.02,
                                                transition: { duration: 0.3 }
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <div className="rounded-xl p-3 hover:bg-white/[0.03] transition-colors relative overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                {/* Lightning shimmer */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-lightning-shine pointer-events-none z-10 rounded-xl" style={{ animationDelay: "-2s" }} />
                                                
                                                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>Share Your Profile</p>
                                                <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 7 }}>Share your profile with employers.</p>
                                                <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-default" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", marginBottom: 8 }}>
                                                    <Share2 style={{ width: 10, height: 10, color: "rgba(255,255,255,0.5)" }} />
                                                    <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>Share Profile</span>
                                                </div>
                                                {/* Social icons row */}
                                                <div className="flex items-center justify-between px-0.5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                                    {[
                                                        {
                                                            name: "LinkedIn",
                                                            svg: (
                                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                                                    <rect x="2" y="9" width="4" height="12" />
                                                                    <circle cx="4" cy="4" r="2" />
                                                                </svg>
                                                            )
                                                        },
                                                        {
                                                            name: "Telegram",
                                                            svg: (
                                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="m22 2-7 20-4-9-9-4Z" />
                                                                    <path d="M22 2 11 13" />
                                                                </svg>
                                                            )
                                                        },
                                                        {
                                                            name: "X",
                                                            svg: (
                                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                                                                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                                                                </svg>
                                                            )
                                                        },
                                                        {
                                                            name: "Discord",
                                                            svg: (
                                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.197.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                                                                </svg>
                                                            )
                                                        },
                                                        {
                                                            name: "WhatsApp",
                                                            svg: (
                                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M19.005 3.125A11.206 11.206 0 0 0 11.002 0c-6.19 0-11.22 5.03-11.22 11.22 0 1.98.518 3.91 1.502 5.625L0 24l7.33-1.923a11.164 11.164 0 0 0 5.666 1.52h.005c6.19 0 11.223-5.03 11.223-11.22a11.2 11.2 0 0 0-3.22-7.925zM12.002 20.528h-.005a9.29 9.29 0 0 1-4.743-1.3l-.34-.2-.2-.12-4.4 1.156 1.176-4.293-.22-.35a9.28 9.28 0 0 1-1.423-4.992c0-5.114 4.16-9.274 9.278-9.274a9.208 9.208 0 0 1 6.56 2.717 9.208 9.208 0 0 1 2.712 6.565c-.003 5.117-4.168 9.28-9.278 9.28zm5.088-6.945c-.279-.14-1.648-.813-1.902-.906-.255-.093-.44-.14-.627.14-.186.279-.72.906-.883 1.093-.163.186-.326.21-.605.07a8.55 8.55 0 0 1-2.247-1.385 9.43 9.43 0 0 1-1.554-1.936c-.163-.28-.017-.43.122-.57.126-.124.279-.325.419-.487.14-.162.186-.279.28-.464.093-.186.046-.35-.023-.49-.07-.14-.627-1.512-.86-2.07-.226-.547-.453-.473-.627-.482-.162-.008-.348-.01-.533-.01-.186 0-.488.07-.743.348-.256.279-.977.954-.977 2.327 0 1.373 1.002 2.7 1.14 2.885.138.186 1.97 3.01 4.774 4.22.666.288 1.187.46 1.593.59.67.213 1.28.183 1.761.11.536-.08 1.648-.673 1.88-1.323.232-.65.232-1.207.162-1.323-.07-.116-.255-.186-.533-.326z" />
                                                                </svg>
                                                            )
                                                        },
                                                        {
                                                            name: "Gmail",
                                                            svg: (
                                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                                                </svg>
                                                            )
                                                        }
                                                    ].map(social => (
                                                        <div key={social.name} className="p-1 rounded text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-default" title={social.name}>
                                                            {social.svg}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                        {/* View Your CV */}
                                        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>View Your CV</p>
                                            <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 7 }}>Preview your professional CV.</p>
                                            <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-default" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                                                <FileText style={{ width: 10, height: 10, color: "rgba(255,255,255,0.5)" }} />
                                                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>View CV</span>
                                            </div>
                                        </div>
                                        {/* Upgrade */}
                                        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>Upgrade to Next Tier</p>
                                            <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 7 }}>Unlock more features and attestation limits.</p>
                                            <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-default" style={{ border: "1px solid rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.04)" }}>
                                                <ShieldCheck style={{ width: 10, height: 10, color: "#fbbf24" }} />
                                                <span style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24" }}>Upgrade</span>
                                            </div>
                                        </div>
                                        {/* Profile Completion */}
                                        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Profile Completion</p>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>85%</span>
                                            </div>
                                            <div className="h-1 w-full rounded-full overflow-hidden mb-2.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                                                <div className="h-full rounded-full" style={{ width: "85%", background: "rgba(255,255,255,0.35)" }} />
                                            </div>
                                            <div className="space-y-1.5">
                                                {[
                                                    { done: true, label: "Profile information" },
                                                    { done: true, label: "Add credentials (3/3)" },
                                                    { done: false, label: "Proof of work (2/3)" },
                                                    { done: true, label: "Career timeline" },
                                                ].map(({ done, label }) => (
                                                    <div key={label} className="flex items-center gap-2">
                                                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: done ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)", border: done ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.1)" }}>
                                                            {done && <Check style={{ width: 7, height: 7, color: "#4ade80" }} />}
                                                        </div>
                                                        <span style={{ fontSize: 9.5, color: done ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}>{label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Diagonal sheen — top-left catch light */}
                                <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ zIndex: 45, background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 25%, transparent 50%)" }} />
                                {/* Top-edge specular line */}
                                <div className="absolute inset-x-0 top-0 h-px pointer-events-none rounded-t-2xl" style={{ zIndex: 46, background: "linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.12) 65%, transparent 92%)" }} />
                                {/* Spotlight cone from top-left */}
                                <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ zIndex: 44, background: "conic-gradient(from 150deg at 12% -6%, transparent 55deg, rgba(255,255,255,0.05) 67deg, rgba(255,255,255,0.025) 78deg, transparent 92deg)" }} />
                                {/* Shiny sweep overlay on top of all panels */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent animate-lightning-shine pointer-events-none z-[50] opacity-80 rounded-2xl" />
                            </div>{/* end 3-panel absolute inset flex */}

                        </div>{/* end scaled 960x540 container */}
                    </div>{/* end hero outer relative */}

                </section>

                {/* Partner logos — same background as Problem section */}
                <div className="w-full relative z-50 py-8" style={{ background: "#060608" }}>
                    <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] mb-6" style={{ color: "rgba(255,255,255,0.18)" }}>Powering the Web3 career stack</p>
                    <div className="w-full overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 28%, black 72%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 28%, black 72%, transparent 100%)' }}>
                        <div className="flex animate-marquee whitespace-nowrap items-center w-max">
                            {[...PARTNERS, ...PARTNERS].map((partner, i) => (
                                <div key={`${partner.name}-${i}`} className="flex items-center mx-10 flex-shrink-0 grayscale opacity-30 hover:grayscale-0 hover:opacity-75 transition-all duration-500 cursor-default" style={{ minWidth: 40 }}>
                                    <img
                                        src={partner.src}
                                        alt={partner.name}
                                        loading="eager"
                                        decoding="sync"
                                        width={80}
                                        height={22}
                                        className="h-5 sm:h-[22px] w-auto object-contain"
                                        style={{ minHeight: 20 }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </div>{/* end hero background wrapper */}



                {/* THE PROBLEM SECTION */}
                <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 bg-[#060608] theme-bg-section">

                    <div className="max-w-[1240px] mx-auto">
                        <div className="text-center mb-8 space-y-6">
                            {/* Pill Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.12] mx-auto" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse flex-shrink-0" />
                                <span className="text-[11px] text-white/50 font-medium tracking-[-0.01em]">Why Web3 Hiring Is Broken</span>
                            </div>

                            <h2 className="text-[22px] sm:text-3xl md:text-4xl lg:text-[44px] font-bold tracking-tighter leading-[1.1] text-white max-w-6xl mx-auto whitespace-normal md:whitespace-nowrap">
                                Your work is real. <span className="text-amber-200/60">Your proof isn&apos;t.</span>
                            </h2>
                            <div className="w-full max-w-6xl mx-auto h-px bg-white/10 mt-12 theme-border-base" />



                            <p className="text-white/40 text-[12px] md:text-[13px] font-normal max-w-3xl mx-auto mt-6">
                                Hiring runs on claims, not proof. There is no reliable way to verify real work.
                            </p>
                        </div>

                        {/* NEW ANIMATED PROBLEM DIAGRAM */}
                        <div className="theme-invert-diagram relative w-full max-w-6xl mx-auto mt-8 mb-8">
                            <ProblemDiagram />
                        </div>

                        {/* BENTO CARDS SECTION - Minimal Editorial Style (Light) */}
                        <div className="relative mt-8 -mx-4 sm:mx-0 overflow-hidden">
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
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 flex-shrink-0 transition-all duration-500 relative overflow-hidden ${
                                                theme === 'light'
                                                ? 'bg-brand-cyan border border-brand-cyan shadow-cyan-900/10 theme-preserve'
                                                : 'border border-white/10 group-hover:border-white/20'
                                            }`}
                                            style={theme !== 'light' ? {
                                                background: "linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.04) 100%)",
                                                boxShadow: "0 8px 24px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
                                            } : undefined}>
                                                {/* Top highlight streak */}
                                                {theme !== 'light' && (
                                                    <div className="absolute inset-x-2 top-1.5 h-2 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.18)" }} />
                                                )}
                                                <item.icon size={20} className={`relative z-10 transition-colors duration-500 ${
                                                    theme === 'light' ? 'text-white' : 'text-white/55 group-hover:text-white/90'
                                                }`} />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-white/40 tracking-widest">{item.id}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-[15px] font-bold text-white/70 transition-colors">{item.title}</h3>
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

                    {/* Atmospheric depth layers */}
                    <div className="absolute inset-0 pointer-events-none" style={{ zIndex:0 }}>
                        <div className="absolute inset-0" style={{ background:"linear-gradient(160deg, #060608 0%, #050507 50%, #060609 100%)" }} />
                        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 65% 55% at 55% 65%, rgba(255,255,255,0.013) 0%, transparent 60%)" }} />
                    </div>

                    <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6" style={{ zIndex:1 }}>

                        {/* Label pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.12] mb-8" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse flex-shrink-0" />
                            <span className="text-[11px] text-white/50 font-medium tracking-[-0.01em]">Portable Web3 reputation</span>
                        </div>

                        {/* Top row: heading LEFT + description RIGHT */}
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-20 mb-8">
                            <h2 className="lg:w-[44%] text-[22px] sm:text-[32px] md:text-[38px] lg:text-[44px] font-bold tracking-tight text-white leading-[1.06] flex-shrink-0">
                                From noise<br/>
                                <span className="text-amber-200/70">to verifiable signal.</span>
                            </h2>
                            <div className="lg:flex-1 flex flex-col gap-5 lg:pt-2">
                                <p className="text-white/40 text-[13px] sm:text-[14px] font-normal leading-relaxed max-w-md">
                                    Your verified history becomes portable trust across platforms and opportunities. ChainVolio anchors every contribution on-chain, cryptographically signed, portable, and tamper-resistant.
                                </p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <Link href="/guides/how-it-works" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/35 hover:text-white/70 transition-colors group">
                                        Explore the architecture
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-white/[0.06] bg-white/[0.02]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                                        <span className="text-[9px] font-bold text-white/35 tracking-widest">BUILT ON SOLANA</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layered UI mockup area */}
                        <div className="relative overflow-hidden" style={{ height: 440 }}>
                            {/* Section-level right vignette — wide and subtle, looks intentional */}
                            <div className="absolute inset-y-0 right-0 pointer-events-none" style={{ zIndex: 10, width: "18%", background: "linear-gradient(to right, transparent, rgba(6,6,8,0.55) 55%, #060608 100%)" }} />

                            {/* Spotlight beam from above */}
                            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                                <div className="absolute inset-x-0 top-0 h-full"
                                    style={{ background: "conic-gradient(from 180deg at 58% -8%, transparent 68deg, rgba(255,255,255,0.055) 80deg, rgba(255,255,255,0.03) 90deg, rgba(255,255,255,0.055) 100deg, transparent 112deg)" }} />
                                <div className="absolute inset-x-0 top-0 h-36"
                                    style={{ background: "radial-gradient(ellipse 45% 100% at 58% 0%, rgba(255,255,255,0.04) 0%, transparent 80%)" }} />
                            </div>

                            {/* ── BACK panel: extends past container right so clip is natural ── */}
                            <div className="absolute rounded-xl overflow-hidden flex"
                                style={{
                                    left: "30%", right: -80,
                                    top: 33, height: 360,
                                    zIndex: 1,
                                    borderTop: "1px solid rgba(255,255,255,0.06)",
                                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    borderLeft: "1px solid rgba(255,255,255,0.06)",
                                    boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
                                }}>

                                {/* Back LEFT: On-Chain Attestation */}
                                <div className="flex-1 flex flex-col min-w-0 p-5" style={{ background:"linear-gradient(to bottom, #060609 0%, #0d0d11 30%)", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"rgba(94,106,210,0.12)", border:"1px solid rgba(94,106,210,0.22)" }}>
                                            <ShieldCheck className="w-4 h-4" style={{ color:"rgba(94,106,210,0.8)" }} />
                                        </div>
                                        <span className="text-[15px] font-bold text-white/85">On-Chain Attestation</span>
                                    </div>
                                    {/* Description */}
                                    <p className="text-[12px] text-white/40 leading-relaxed mb-5 flex-shrink-0">
                                        Every entry is cryptographically signed by the issuing organization. Every claim is backed by a verifiable signature.
                                    </p>
                                    {/* Attestation card */}
                                    <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                                        {/* Card header row */}
                                        <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                                            <span className="text-[11px] font-bold text-white/65">Attestation</span>
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold" style={{ color:"#34d399" }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] inline-block" />
                                                Verified
                                            </span>
                                        </div>
                                        {/* Rows */}
                                        <div className="flex-1 overflow-hidden">
                                            {[
                                                { label:"Project",   value:"ChainVolio Website", check:true,  link:false },
                                                { label:"Role",      value:"Frontend Developer",  check:false, link:false },
                                                { label:"Signed by", value:"ChainVolio DAO",      check:false, link:false },
                                                { label:"Network",   value:"Solana",              check:false, link:false },
                                                { label:"Tx Hash",   value:"5xYk...7e9p",         check:false, link:true  },
                                            ].map(({ label, value, check, link }, i, arr) => (
                                                <div key={i} className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: i < arr.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                                                    <span className="text-[10px] text-white/35 font-medium">{label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-semibold text-white/65">{value}</span>
                                                        {check && <Check className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />}
                                                        {link  && <ExternalLink className="w-3 h-3 text-white/30 flex-shrink-0" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Back MIDDLE: Portable Trust */}
                                <div className="w-[27%] flex-shrink-0 flex flex-col p-5" style={{ background:"linear-gradient(to bottom, #060609 0%, #0c0c10 30%)", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
                                    {/* Header */}
                                    <div className="flex items-center gap-2.5 mb-3 flex-shrink-0">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)" }}>
                                            <Globe className="w-3.5 h-3.5 text-white/35" />
                                        </div>
                                        <span className="text-[13px] font-bold text-white/80">Portable Trust</span>
                                    </div>
                                    {/* Description */}
                                    <p className="text-[10px] text-white/35 leading-relaxed mb-4 flex-shrink-0">
                                        Your verified history is shareable across platforms like LinkedIn, Twitter, or anywhere you share your work.
                                    </p>
                                    {/* Share profile card */}
                                    <div className="flex-1 rounded-xl flex flex-col p-3.5" style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)" }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[9px] font-bold text-white/55">Share your profile</span>
                                            <Check className="w-3 h-3 text-white/25" />
                                        </div>
                                        {/* URL copy row */}
                                        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg mb-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                                            <span className="text-[8px] text-white/45 font-mono truncate">chainvolio.xyz/u/0x8F3A...7C21</span>
                                            <svg className="flex-shrink-0 ml-2" width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                        </div>
                                        {/* Share on */}
                                        <p className="text-[8.5px] text-white/30 mb-2">Share on</p>
                                        <div className="flex flex-wrap items-center gap-1.5 mb-4">
                                            {[
                                                { bg:"#0077B5", svg:<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2" fill="white"/></svg> },
                                                { bg:"#171515", svg:<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                                                { bg:"#5865F2", svg:<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.032.05a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.05c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg> },
                                                { bg:"#229ED9", svg:<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
                                                { bg:"#25D366", svg:<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
                                                { bg:"#EA4335", svg:<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg> },
                                            ].map(({ bg, svg }, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:bg }}>
                                                    {svg}
                                                </div>
                                            ))}
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.09)" }}>
                                                <span className="text-[9px] text-white/40 font-bold leading-none">···</span>
                                            </div>
                                        </div>
                                        {/* Footer */}
                                        <div className="flex items-center gap-1.5 mt-auto">
                                            <ShieldCheck className="w-3 h-3 text-white/20 flex-shrink-0" />
                                            <span className="text-[8px] text-white/30">Anyone can verify this data on-chain.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Back RIGHT: Career Timeline */}
                                <div className="w-[27%] flex-shrink-0 flex flex-col p-5" style={{ background:"linear-gradient(to bottom, #060609 0%, #0c0c10 30%)" }}>
                                    {/* Header */}
                                    <div className="flex items-center gap-2.5 mb-3 flex-shrink-0">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"rgba(251,191,36,0.10)", border:"1px solid rgba(251,191,36,0.20)" }}>
                                            <Briefcase className="w-3.5 h-3.5" style={{ color:"rgba(251,191,36,0.85)" }} />
                                        </div>
                                        <span className="text-[13px] font-bold text-white/80">Career Timeline</span>
                                    </div>
                                    {/* Description */}
                                    <p className="text-[10px] text-white/35 leading-relaxed mb-4 flex-shrink-0">
                                        Every verified role compounds your reputation. Recruiters see growth, not just a snapshot.
                                    </p>
                                    {/* Timeline card */}
                                    <div className="flex-1 rounded-xl overflow-hidden p-3.5" style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)" }}>
                                        <div className="relative pl-4">
                                            <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background:"rgba(255,255,255,0.07)" }} />
                                            {[
                                                { year:"2022", org:"DeFi Protocol",  role:"Developer",     current:false },
                                                { year:"2024", org:"ChainVolio DAO", role:"Lead Builder",  current:true  },
                                            ].map(({ year, org, role, current }, i) => (
                                                <div key={i} className="relative pb-4 last:pb-0">
                                                    <div className="absolute rounded-full"
                                                        style={{
                                                            left: -11, top: 5,
                                                            width: current ? 10 : 7,
                                                            height: current ? 10 : 7,
                                                            background: current ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.18)",
                                                            border: current ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                                                            transform: "translateX(-50%)",
                                                            boxShadow: current ? "0 0 8px rgba(255,255,255,0.3)" : "none",
                                                        }} />
                                                    <span className="text-[9px] font-mono text-white/25 block mb-0.5">{year}</span>
                                                    <p className="text-[11px] font-bold leading-tight" style={{ color:"rgba(255,255,255,0.75)" }}>{org}</p>
                                                    <p className="text-[10px] leading-tight mt-0.5" style={{ color:"rgba(255,255,255,0.38)" }}>{role}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-2.5 flex items-center gap-1.5" style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                                            <TrendingUp className="w-3 h-3 flex-shrink-0" style={{ color:"rgba(251,191,36,0.5)" }} />
                                            <span className="text-[9px] text-white/30">2 years of verified growth</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Gradient fade — right/back panel only */}
                                <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10"
                                    style={{ background:"linear-gradient(to top, #070709 25%, rgba(7,7,9,0.6) 60%, transparent)" }} />
                            </div>

                            {/* ── FRONT panel: One Unified Profile + Globe (single card) ── */}
                            <div className="absolute left-0 flex flex-col rounded-xl overflow-hidden"
                                style={{
                                    top: 0, width: 340, height: 425,
                                    zIndex: 2,
                                    background: "linear-gradient(160deg, #040408 0%, #060609 60%, #050508 100%)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    boxShadow: "0 0 0 0.5px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.07) inset, 12px 0 80px rgba(0,0,0,0.98), 28px 0 100px rgba(0,0,0,0.75), 0 24px 64px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.6)"
                                }}>
                                {/* Gloss sheen — diagonal highlight from top-left */}
                                <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ zIndex: 20, background: "linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 30%, transparent 55%)" }} />
                                {/* Top-edge specular line */}
                                <div className="absolute inset-x-0 top-0 h-px pointer-events-none rounded-t-xl" style={{ zIndex: 21, background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.18) 35%, rgba(255,255,255,0.1) 65%, transparent 95%)" }} />
                                {/* Header */}
                                <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
                                        <User className="w-4 h-4 text-white/40" />
                                    </div>
                                    <span className="text-[15px] font-bold text-white/85">One Unified Profile</span>
                                </div>

                                {/* Top content: description */}
                                <div className="px-5 py-4 flex-shrink-0">
                                    <p className="text-[12px] text-white/40 leading-relaxed">
                                        All your contributions, roles, and achievements in one portable identity you fully own.
                                    </p>
                                </div>

                                {/* Globe section — fills rest of card, no inner box */}
                                <div className="flex-1 relative overflow-hidden">
                                    <div className="absolute inset-x-0 top-0 px-4 pt-3 pb-0 z-10 flex items-center gap-2 pointer-events-none">
                                        <Globe className="w-3 h-3 text-white/20" />
                                        <span className="text-[9px] font-black text-white/20 tracking-[0.15em] uppercase">Blockchain Network</span>
                                    </div>
                                    <GlobeCanvas className="absolute inset-0 w-full h-full theme-globe-canvas" />
                                    {/* Sphere depth vignette — darkens edges to make globe pop */}
                                    <div className="absolute inset-0 pointer-events-none z-[6]" style={{ background: "radial-gradient(circle at 50% 52%, transparent 32%, rgba(4,4,8,0.45) 62%, rgba(4,4,8,0.88) 80%)" }} />
                                    {/* Directional highlight — top-left light source */}
                                    <div className="absolute inset-0 pointer-events-none z-[7]" style={{ background: "radial-gradient(ellipse 55% 45% at 30% 22%, rgba(255,255,255,0.065) 0%, transparent 65%)" }} />
                                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#050508] to-transparent z-[5] pointer-events-none" />
                                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050508] to-transparent z-[5] pointer-events-none" />
                                    {/* Cost / Speed chip */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-black/60 backdrop-blur-2xl z-10 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[6px] font-bold text-white/20 uppercase tracking-[0.18em]">Cost</span>
                                            <span className="text-[9px] font-bold text-[#14F195] tracking-tight">~$0.001 / attest</span>
                                        </div>
                                        <div className="w-px h-4 bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-[6px] font-bold text-white/20 uppercase tracking-[0.18em]">Speed</span>
                                            <span className="text-[9px] font-bold text-white/60 tracking-tight">Near-instant</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature text blocks: 01 / 02 / 03 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 mt-10 pt-8 border-t border-white/[0.06]">
                            {[
                                {
                                    num: "01",
                                    title: "One Unified Profile",
                                    body: "No more scattered contributions. You own a single source of truth that follows you across every protocol, DAO, and organization.",
                                },
                                {
                                    num: "02",
                                    title: "On-Chain Attestation",
                                    body: "Trust is verifiable, not just claimed. Issuers sign your record once, so anyone can verify it without asking you to prove it again.",
                                },
                                {
                                    num: "03",
                                    title: "Portable Trust",
                                    body: "Doors that once required warm introductions become more accessible. Your verified record speaks before you do.",
                                },
                            ].map(({ num, title, body }) => (
                                <div key={num} className="flex flex-col gap-2.5">
                                    <span className="text-[10px] font-black text-white/20 tracking-[0.18em]">{num}</span>
                                    <h4 className="text-[13px] font-bold text-white/70 leading-snug">{title}</h4>
                                    <p className="text-[12px] text-white/35 leading-relaxed font-normal">{body}</p>
                                </div>
                            ))}
                        </div>



                        {/* Bottom bar */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-1">
                            <p className="text-[11px] text-white/25 italic max-w-xs leading-relaxed">
                                &ldquo;ChainVolio doesn&apos;t replace LinkedIn. It adds cryptographic proof to your existing presence anywhere you already share your work.&rdquo;
                            </p>
                            <p className="text-[11px] text-white/25 italic">
                                Recruiters see proof, not promises. Real contributors rise above the noise.
                            </p>
                        </div>

                    </div>

                </section>

                {/* CORE FEATURE SECTION */}
                <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 overflow-hidden bg-[#060608] theme-bg-section">
                    <div className="max-w-[1200px] mx-auto relative z-10">
                        <AttestationBlock />
                    </div>
                </section>

                <section id="solution" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 bg-[#060608] theme-bg-section">
                    <div className="theme-fade-from-black absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-[#060608] to-transparent pointer-events-none z-30"></div>

                    <div className="max-w-[1200px] mx-auto relative">

                        {/* ── Header: left-aligned ── */}
                        <div className="text-left space-y-6 mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.12]" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse flex-shrink-0" />
                                <span className="text-[11px] text-white/50 font-medium tracking-[-0.01em]">Build a Verifiable Web3 Resume with On-Chain Proof</span>
                            </div>
                            <h3 className="text-[22px] sm:text-3xl md:text-[38px] lg:text-[44px] font-bold text-white tracking-tight leading-[1.3]">
                                Build a reputation <span className="text-amber-200/60">that travels.</span>
                            </h3>
                            <div className="h-px w-full max-w-6xl bg-white/10" />
                            <p className="text-white/40 text-[12px] md:text-[13px] font-normal leading-relaxed max-w-2xl">
                                Turn your work into verifiable proof that anyone can trust. Transparent, portable, and tamper-resistant.
                            </p>
                        </div>


                        {/* ── Interactive Flow ── */}
                        <div className="relative w-full max-w-[860px] mx-auto mb-4">
                            <div className="absolute -inset-8 bg-white/[0.01] blur-[80px] pointer-events-none" />

                            <VerifiableWorkHistoryFlow />
                        </div>

                        {/* ── 3 compact attributes — replaces the old text card ── */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-10 gap-y-4 mb-6 mt-4 md:mt-6 px-6">
                            {[
                                { icon: ShieldCheck, label: "On-Chain Proof", color: "#14F195" },
                                { icon: CheckCircle2, label: "Instant Verification", color: "#60a5fa" },
                                { icon: Lock, label: "Tamper-Resistant", color: "#a78bfa" },
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
                            <div className="absolute inset-0 bg-white/[0.01] blur-[120px] rounded-full opacity-20 pointer-events-none" />

                            {/* Unified Scaling Container for the entire assembly */}
                            <div className="relative scale-[0.65] min-[440px]:scale-[0.75] sm:scale-[0.65] md:scale-[0.8] lg:scale-100 transition-transform duration-700 origin-center flex items-center justify-center w-[350px] h-[650px] md:w-[1200px] md:h-[650px]">
                                <div className="relative w-full h-full group">
                                    {/* Main Dashboard Mockup */}
                                    <div className="theme-preserve w-full h-full bg-[#060608] rounded-[32px] border border-white/[0.13] overflow-hidden text-left relative"
                                        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.1) inset, 0 32px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)" }}
                                    >
                                        <MockRecruiterDashboardUI />
                                        {/* Lightning shimmer sweep */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.10] to-transparent animate-lightning-shine pointer-events-none z-[22] opacity-90 rounded-[32px]" />
                                        {/* Bottom fade — darkens bottom third of dashboard */}
                                        <div className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none rounded-b-[32px]" style={{ zIndex: 23, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)" }} />
                                        {/* Diagonal sheen — top-left catch light */}
                                        <div className="absolute inset-0 pointer-events-none rounded-[32px]" style={{ zIndex: 20, background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 25%, transparent 50%)" }} />
                                        {/* Top-edge specular line */}
                                        <div className="absolute inset-x-0 top-0 h-px pointer-events-none rounded-t-[32px]" style={{ zIndex: 21, background: "linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.12) 65%, transparent 92%)" }} />
                                        {/* Spotlight cone from top-left */}
                                        <div className="absolute inset-0 pointer-events-none rounded-[32px]" style={{ zIndex: 19, background: "conic-gradient(from 150deg at 12% -6%, transparent 55deg, rgba(255,255,255,0.05) 67deg, rgba(255,255,255,0.025) 78deg, transparent 92deg)" }} />
                                    </div>

                                    {/* Floating CV Score Card — in front */}
                                    <div className="absolute -right-16 top-[52%] z-40 transition-all duration-1000 group-hover:translate-y-[-15px] group-hover:translate-x-6 group-hover:rotate-2">
                                        <div className="[perspective:1500px]">
                                            <div className="rounded-2xl [transform:rotateY(-8deg)rotateX(2deg)]">
                                                <FloatingVerificationCard />
                                            </div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>

                    {/* Explanation / Description below the dashboard */}
                    <div className="mt-4 sm:mt-6 md:mt-8 max-w-[1200px] mx-auto relative z-30 px-4">
                        <div style={{
                            padding: "16px 20px",
                            borderRadius: "16px",
                            border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(10,11,14,0.6)",
                            backdropFilter: "blur(12px)",
                            position: "relative" as const,
                            overflow: "hidden"
                        }}>
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "3px",
                                height: "100%",
                                background: "linear-gradient(to bottom, rgba(99,102,241,0.8), transparent)"
                            }} />
                            <div className="flex items-start gap-4">
                                <div style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    background: "rgba(99,102,241,0.08)",
                                    border: "1px solid rgba(99,102,241,0.18)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: 2
                                }}>
                                    <Terminal style={{ width: 14, height: 14, color: "rgba(129,140,248,0.85)" }} />
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="flex items-center gap-2 mb-1.5" style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: "rgba(255,255,255,0.9)",
                                        letterSpacing: "0.02em"
                                    }}>
                                        Verifiable Recruitment Engine
                                        <span style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            background: "#10b981",
                                            boxShadow: "0 0 8px #10b981"
                                        }} />
                                    </h4>
                                    <p style={{
                                        fontSize: "12.5px",
                                        color: "rgba(255,255,255,0.45)",
                                        lineHeight: 1.6,
                                        fontWeight: 400
                                    }}>
                                        The recruiter dashboard aggregates cryptographically signed credentials directly from the blockchain. Filter candidates based on verified on-chain signals, instantly verify work history validity, and request interviews directly without relying on unverified PDF resumes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    </div>
                </section>

                {/* USE CASE SECTION */}
                <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 overflow-hidden bg-[#060608] theme-bg-section">
                    <div className="max-w-[1200px] mx-auto space-y-16 relative z-10">

                        {/* BLOCK 2 — HIRING */}
                        <HiringBlock />
                    </div>
                </section>

                <Web3ResumeSection onCtaClick={() => setIsWalletModalOpen(true)} />

                {/* 5. FINAL CTA */}
                <section className="pt-16 sm:pt-20 md:pt-24 pb-40 sm:pb-52 md:pb-64 relative z-10 bg-[#060608] theme-bg-section">

                    <div className="relative max-w-[760px] mx-auto text-center z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                        >
                            <h2 className="text-[28px] md:text-[40px] font-bold text-white mb-10 tracking-tight leading-[1.06]">
                                Start Building Your<br />
                                <span className="text-amber-200/60">Verifiable Web3 Resume.</span>
                            </h2>

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

                            {/* Post-signup flow hint */}
                            <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                                {[
                                    { step: "1", label: "Connect wallet or Google" },
                                    { step: "2", label: "Fill your profile" },
                                    { step: "3", label: "Share your verified link" },
                                ].map(({ step, label }, i) => (
                                    <React.Fragment key={step}>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.10] text-[10px] font-bold text-white/40 flex items-center justify-center flex-shrink-0">{step}</span>
                                            <span className="text-[11px] text-white/30 font-medium">{label}</span>
                                        </div>
                                        {i < 2 && <span className="text-white/15 text-[10px]">→</span>}
                                    </React.Fragment>
                                ))}
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
                                                    <p className="text-[10px] text-white/50 leading-relaxed font-light">Reduces portfolio fraud risk by anchoring outputs to a cryptographic professional audit trail.</p>
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