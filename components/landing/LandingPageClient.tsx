"use client";

// Force re-compile: v2-floating-card
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ProblemVideoCard from "./ProblemVideoCard";
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
    User,
    FileCheck2,
    PenLine,
    Share2,
    Boxes,
    Hash,
} from 'lucide-react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWallet } from "@solana/wallet-adapter-react";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { Toast } from "@/components/ui/Toast";
import { Web3ResumeSection } from "./Web3ResumeSection";

// --- Interactive Verifiable Work History Flow (3D Chip Style) ---
function VerifiableWorkHistoryFlow() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const nodes: {
        icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> | "profile";
        label: string;
        sublabel: string;
        color: string;
    }[] = [
        { icon: "profile",   label: "Your Profile",  sublabel: "Identity",    color: "#ffffff"  },
        { icon: FileCheck2,  label: "Work Recorded", sublabel: "Contribution",color: "#60a5fa"  },
        { icon: ShieldCheck, label: "Attested",       sublabel: "By Org",      color: "#14F195"  },
        { icon: PenLine,     label: "Signed",         sublabel: "Crypto Sig",  color: "#a78bfa"  },
        { icon: Boxes,       label: "On-Chain",       sublabel: "Solana",      color: "#34d399"  },
        { icon: Hash,        label: "Hash Created",   sublabel: "Immutable",   color: "#9945FF"  },
        { icon: Share2,      label: "Shareable",      sublabel: "To Recruiters",color: "#f59e0b" },
    ];

    const isLineActive = (lineIndex: number) =>
        hoveredIndex !== null && lineIndex < hoveredIndex;

    return (
        <div className="relative w-full flex items-center justify-center py-12 pb-16 select-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(153,69,255,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="flex items-center w-full max-w-4xl mx-auto px-4">
                {nodes.map((node, i) => {
                    const isHovered = hoveredIndex === i;
                    const isActive  = hoveredIndex !== null && i <= hoveredIndex;
                    const IconComp  = node.icon === "profile" ? null : node.icon;
                    const isProfile = node.icon === "profile";
                    const chipW     = "52px";
                    const chipH     = "52px";
                    const r         = "16px";

                    return (
                        <div key={i} className="contents">
                            {/* ── NODE ── */}
                            <div
                                className="relative flex-shrink-0 flex flex-col items-center cursor-pointer z-10"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* 3D chip: tilt at rest, lifts on hover */}
                                <motion.div
                                    className="relative"
                                    animate={{
                                        y:       isHovered ? -10 : 0,
                                        rotateX: isHovered ? 0 : 8,
                                        rotateY: isHovered ? 0 : -10,
                                        scale:   isHovered ? 1.1 : 1,
                                    }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    style={{ perspective: "600px", transformStyle: "preserve-3d" }}
                                >
                                    {/* Layer 3 — deepest shadow */}
                                    <div style={{
                                        position: "absolute", width: chipW, height: chipH,
                                        top: "7px", left: "5px", borderRadius: r,
                                        background: "#010101",
                                        border: "1px solid rgba(255,255,255,0.02)",
                                    }} />

                                    {/* Layer 2 */}
                                    <div style={{
                                        position: "absolute", width: chipW, height: chipH,
                                        top: "3px", left: "2px", borderRadius: r,
                                        background: "#060606",
                                        border: "1px solid rgba(255,255,255,0.04)",
                                    }} />

                                    {/* Main face */}
                                    <motion.div
                                        animate={{
                                            borderColor: isActive ? node.color + "55" : "rgba(255,255,255,0.09)",
                                            boxShadow: isHovered
                                                ? `0 0 30px ${node.color}40, 0 14px 44px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)`
                                                : "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className="relative flex items-center justify-center overflow-hidden"
                                        style={{
                                            width: chipW, height: chipH, borderRadius: r,
                                            background: "linear-gradient(145deg, #1e1e1e 0%, #0e0e0e 100%)",
                                            border: "1px solid rgba(255,255,255,0.09)",
                                        }}
                                    >
                                        {/* Lighting: top-edge highlight */}
                                        <div className="absolute inset-x-2 top-0 h-[1px] pointer-events-none"
                                            style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)" }} />
                                        {/* Lighting: left-edge highlight */}
                                        <div className="absolute inset-y-2 left-0 w-[1px] pointer-events-none"
                                            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.07), transparent)" }} />

                                        {/* Color inner glow (active) */}
                                        <motion.div
                                            animate={{ opacity: isActive ? 1 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                borderRadius: r,
                                                background: `radial-gradient(circle at 40% 40%, ${node.color}22 0%, transparent 65%)`,
                                            }}
                                        />

                                        {/* Content */}
                                        {isProfile ? (
                                            <User
                                                className="relative z-10 w-6 h-6"
                                                style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.4)" }}
                                            />
                                        ) : (
                                            IconComp && (
                                                <IconComp
                                                    className="relative z-10 w-7 h-7"
                                                    style={{ color: isActive ? node.color : "rgba(255,255,255,0.2)" }}
                                                />
                                            )
                                        )}
                                    </motion.div>
                                </motion.div>

                                {/* Ground glow puddle */}
                                <motion.div
                                    animate={{
                                        opacity: isHovered ? 1 : 0.35,
                                        scaleX: isHovered ? 1.4 : 0.85,
                                    }}
                                    transition={{ duration: 0.25 }}
                                    className="pointer-events-none"
                                    style={{
                                        width: "100%", height: "10px", marginTop: "6px",
                                        background: isActive
                                            ? `radial-gradient(ellipse at center, ${node.color}45 0%, transparent 70%)`
                                            : "radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)",
                                        filter: "blur(4px)",
                                    }}
                                />

                                {/* Hover label */}
                                <motion.div
                                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute -bottom-10 flex flex-col items-center pointer-events-none whitespace-nowrap"
                                >
                                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: node.color }}>
                                        {node.label}
                                    </span>
                                    <span className="text-[9px] text-white/30 tracking-wider mt-0.5">{node.sublabel}</span>
                                </motion.div>
                            </div>

                            {/* ── CONNECTOR ── */}
                            {i < nodes.length - 1 && (
                                <div className="relative flex-1 h-6 flex items-center mx-1 overflow-visible">
                                    {/* dashed base */}
                                    <svg width="100%" height="2" className="absolute top-1/2 -translate-y-1/2 overflow-visible" preserveAspectRatio="none">
                                        <line x1="0" y1="1" x2="100%" y2="1"
                                            stroke="rgba(255,255,255,0.07)"
                                            strokeWidth="1.5"
                                            strokeDasharray="4 7"
                                        />
                                    </svg>

                                    {/* active glow line */}
                                    <motion.div
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{
                                            opacity: isLineActive(i) ? 1 : 0,
                                            scaleX: isLineActive(i) ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                        className="absolute h-[1.5px] w-full pointer-events-none"
                                        style={{
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            transformOrigin: "left center",
                                            background: `linear-gradient(to right, ${nodes[i].color}90, ${nodes[i + 1].color}90)`,
                                            boxShadow: `0 0 8px ${nodes[i + 1].color}60`,
                                        }}
                                    />

                                    {/* traveling particle */}
                                    {isLineActive(i) && (
                                        <motion.div
                                            key={`dot-${i}-${hoveredIndex}`}
                                            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
                                            style={{
                                                background: nodes[i + 1].color,
                                                boxShadow: `0 0 8px ${nodes[i + 1].color}, 0 0 16px ${nodes[i + 1].color}60`,
                                                left: 0,
                                            }}
                                            animate={{ left: "100%" }}
                                            transition={{
                                                duration: 1.0,
                                                repeat: Infinity,
                                                ease: "linear",
                                                delay: i * 0.12,
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Static UI Mockup for Feature Card ---
function MockProfileUI() {
    return (
        <div className="w-full h-full flex font-sans text-sm">
            {/* 1. Sidebar (Linear Style) */}
            <div className="w-64 border-r border-white/5 bg-white/[0.01] p-6 flex flex-col gap-8">
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
            <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
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
                                { name: "Apex Guild", color: "bg-orange-500" }
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
    width: "360px",
    borderRadius: "14px",
    overflow: "hidden",
    position: "relative",
    background: "#111115",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.95), 0 4px 16px rgba(0,0,0,0.7)",
};

// Shared header dots (three-dot menu like Linear)
function CardDots() {
    return (
        <div className="flex items-center gap-1">
            {[0,1,2].map(i => (
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
        { initials: "DC", color: "#34d399", name: "David Chen",           action: "attested your work on",         subject: "Brand Identity Design",        time: "2m ago" },
        { initials: "GD", color: "#60a5fa", name: "Glassdoor",            action: "verified your employment at",   subject: "Stripe",                        time: "1h ago" },
        { initials: "SA", color: "#a78bfa", name: "Smart Contract Auditor",action: "attested your audit on",        subject: "Payment Protocol v2",           time: "3h ago" },
        { initials: "GH", color: "#f59e0b", name: "GitHub",               action: "verified your contribution in", subject: "chainvolio/identity-core",       time: "1d ago" },
    ];
    return (
        <div style={CARD_BASE}>
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
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 3l2 2 2-2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/></svg>
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
        <div style={CARD_BASE}>
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
        { icon: CheckCircle2, color: "#34d399", dot: true,  title: "Attestation Received",   desc: "Superteam attested your grant",   time: "2h ago"  },
        { icon: ShieldCheck,  color: "#60a5fa", dot: true,  title: "Audit Passed",            desc: "Smart contract audit passed",     time: "5h ago"  },
        { icon: User,         color: "#a78bfa", dot: false, title: "New Attestation",         desc: "0xA34F...BCd2 attested your work", time: "1d ago" },
        { icon: Globe,        color: "#f59e0b", dot: false, title: "Identity Verified",       desc: "Your wallet has been verified",   time: "2d ago"  },
    ];
    return (
        <div style={CARD_BASE}>
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
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 3l2 2 2-2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/></svg>
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
        { icon: ShieldCheck, label: "Verifiable on-chain proof",    desc: "Each attestation is stored permanently on Solana.", color: "#14F195" },
        { icon: Building2,   label: "Issued by real organizations", desc: "Only verified orgs and collaborators can attest.",    color: "#60a5fa" },
        { icon: Lock,        label: "Public and tamper-resistant",  desc: "Anyone can verify, no one can alter or revoke.",      color: "#a78bfa" },
    ];

    const cards = [<AttestationCard />, <OrgIssuerCard />, <PublicVerifyCard />];

    // pos 0 = center (active), pos 1 = right peek, pos 2 = left peek
    const stackAnim = (pos: number) => {
        if (pos === 0) return { x: 0,    y: 0,  scale: 1,    opacity: 1,    zIndex: 30, filter: "blur(0px)"   };
        if (pos === 1) return { x: 160,  y: 40, scale: 0.9,  opacity: 0.5,  zIndex: 20, filter: "blur(1.5px)" };
        return              { x: -160, y: 40, scale: 0.9,  opacity: 0.5,  zIndex: 20, filter: "blur(1.5px)" };
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
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.22em] bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">Core Feature</span>
                    </div>
                    <p className="text-lg md:text-xl font-semibold text-white/60 tracking-tight">
                        Verifiable Work History with On-Chain Attestations
                    </p>
                    <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.06]">
                        Proof of work,<br /><span className="text-white/30">not claims.</span>
                    </h3>
                    <p className="text-white/40 text-base md:text-lg leading-relaxed font-medium max-w-md">
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
                            animate={{ opacity: active === i ? 1 : 0.45 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-start gap-4 py-4 cursor-default"
                        >
                            <motion.div
                                animate={{
                                    background: active === i ? f.color + "18" : f.color + "08",
                                    borderColor: active === i ? f.color + "35" : f.color + "15",
                                }}
                                transition={{ duration: 0.25 }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border"
                            >
                                <f.icon className="w-3.5 h-3.5" style={{ color: active === i ? f.color : f.color + "55" }} />
                            </motion.div>
                            <div>
                                <p className="text-sm font-bold mb-0.5" style={{ color: active === i ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>
                                    {f.label}
                                </p>
                                <p className="text-xs text-white/25 leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Link href="/guides/attestation" className="inline-flex items-center gap-2 text-sm font-bold text-white/30 hover:text-white/80 transition-colors duration-200 group">
                    Explore attestations
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
            </div>

            {/* Right — Linear-style horizontal carousel */}
            <div className="relative overflow-hidden" style={{ height: "560px" }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {/* Ambient glow follows active card colour */}
                <motion.div
                    animate={{ background: `radial-gradient(ellipse 90% 55% at 50% 30%, ${features[active].color}12, transparent 68%)` }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 pointer-events-none"
                />

                {/* Cards — all anchored to horizontal centre */}
                {cards.map((card, i) => {
                    const pos = (i - active + 3) % 3;
                    const anim = stackAnim(pos);
                    return (
                        <motion.div
                            key={i}
                            animate={{ x: anim.x, y: anim.y, scale: anim.scale, opacity: anim.opacity, filter: anim.filter }}
                            transition={{ type: "spring", stiffness: 260, damping: 28 }}
                            style={{
                                position: "absolute",
                                top: 28,
                                left: "50%",
                                marginLeft: -180,
                                zIndex: anim.zIndex,
                            }}
                        >
                            {card}
                        </motion.div>
                    );
                })}

                {/* Left edge fade */}
                <div className="absolute inset-y-0 left-0 w-12 pointer-events-none z-40"
                    style={{ background: "linear-gradient(to right, black 20%, transparent)" }} />
                {/* Right edge fade */}
                <div className="absolute inset-y-0 right-0 w-12 pointer-events-none z-40"
                    style={{ background: "linear-gradient(to left, black 20%, transparent)" }} />
                {/* Bottom fade */}
                <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none z-40"
                    style={{ background: "linear-gradient(to top, black 30%, transparent)" }} />

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
        </motion.div>
    );
}

// --- Mobile UI Mockup for Feature Card ---
// --- Floating Feature Card (Overlay) ---
function FloatingVerificationCard() {
    return (
        <div className="w-[340px] bg-[#0c0c0c]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-sans">
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
        { label: "Verified signal candidates",  color: "#60a5fa" },
        { label: "Org-backed endorsements",     color: "#34d399" },
        { label: "Post your job link anywhere", color: "#f59e0b" },
        { label: "Reduce hiring guesswork",     color: "#a78bfa" },
    ];

    const panels = [
        // Panel 0 — Verified Signal (bullet 0)
        <div key={0} className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Top Candidates with Proven Signals</p>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
                    <span className="text-[8px] font-bold" style={{ color: "#60a5fa" }}>Verified</span>
                </div>
            </div>
            {[
                { name: "Alex Rivera", role: "Core Developer",     signals: 8 },
                { name: "Sarah Chen",  role: "Smart Contract Dev", signals: 5 },
            ].map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#111111] bg-gradient-to-b from-transparent to-black/20 border border-white/5 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/40">
                            {c.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                            <h5 className="text-[11px] font-bold text-white/80">{c.name}</h5>
                            <p className="text-[9px] text-slate-500">{c.role}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.12)" }}>
                        <ShieldCheck className="w-2.5 h-2.5" style={{ color: "#60a5fa" }} />
                        <span className="text-[9px] font-bold" style={{ color: "#60a5fa" }}>{c.signals}</span>
                    </div>
                </div>
            ))}
        </div>,

        // Panel 1 — Org-Backed Trust (bullet 1)
        <div key={1} className="space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-3">Alex Rivera, Endorsement Chain</p>
            {[
                { initials: "NP", name: "Nexus Protocol", type: "Core infrastructure audit", color: "#34d399" },
                { initials: "ST", name: "Superteam",      type: "Grant delivery, Q3 2024",  color: "#60a5fa" },
            ].map((e, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#111111] bg-gradient-to-b from-transparent to-black/20 border border-white/5 flex items-center gap-3 shadow-xl">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: e.color + "22", color: e.color, border: `1px solid ${e.color}33` }}>
                        {e.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h5 className="text-[11px] font-bold text-white/80">{e.name}</h5>
                            <ShieldCheck className="w-2.5 h-2.5 flex-shrink-0" style={{ color: e.color }} />
                        </div>
                        <p className="text-[9px] text-slate-500">{e.type}</p>
                    </div>
                </div>
            ))}
        </div>,

        // Panel 2 — Post Anywhere (bullet 2)
        <div key={2} className="space-y-2">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Share Job Post</p>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <span className="text-[8px] font-bold" style={{ color: "#f59e0b" }}>Portable Link</span>
                </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111111] border border-white/5 flex items-center gap-2 mb-2 shadow-xl">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-2.5 h-2.5 text-amber-400" />
                </div>
                <span className="text-[9px] text-white/30 font-mono truncate flex-1">chainvolio.xyz/hire/nexus-rust-dev</span>
                <span className="text-[8px] font-bold text-amber-400/70 flex-shrink-0">Copy</span>
            </div>
            {[
                { platform: "LinkedIn",  icon: "in", color: "#60a5fa", status: "Posted",    statusColor: "#34d399" },
                { platform: "Twitter/X", icon: "X",  color: "#ffffff", status: "Scheduled", statusColor: "#f59e0b" },
                { platform: "Discord",   icon: "D",  color: "#a78bfa", status: "Posted",    statusColor: "#34d399" },
            ].map((p, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#111111] border border-white/5 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0"
                            style={{ background: p.color + "18", color: p.color, border: `1px solid ${p.color}25` }}>
                            {p.icon}
                        </div>
                        <span className="text-[9px] text-white/50 font-medium">{p.platform}</span>
                    </div>
                    <span className="text-[8px] font-bold" style={{ color: p.statusColor }}>{p.status}</span>
                </div>
            ))}
        </div>,

        // Panel 3 — Confidence Score (auto-only, no bullet)
        <div key={3} className="space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-3">Alex Rivera, Confidence Score</p>
            <div className="p-3 rounded-xl bg-[#111111] bg-gradient-to-b from-transparent to-black/20 border border-white/5 space-y-3 shadow-xl">
                {[
                    { label: "Verified Work",    score: 92, color: "#34d399" },
                    { label: "Org Attestations", score: 87, color: "#60a5fa" },
                    { label: "Chain Activity",   score: 74, color: "#a78bfa" },
                ].map((s, i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-slate-400">{s.label}</span>
                            <span className="text-[9px] font-bold" style={{ color: s.color }}>{s.score}</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.color + "99" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>,
    ];

    const cardAnim = (pos: number) => {
        if (pos === 0) return { x: 0,    y: 0,  scale: 1,    opacity: 1,    zIndex: 30, filter: "blur(0px)"  };
        if (pos === 1) return { x: 210,  y: 20, scale: 0.88, opacity: 0.45, zIndex: 20, filter: "blur(2px)" };
        if (pos === 2) return { x: -210, y: 20, scale: 0.88, opacity: 0.45, zIndex: 20, filter: "blur(2px)" };
        return              { x: 0,    y: 40, scale: 0.78, opacity: 0,    zIndex: 10, filter: "blur(4px)" };
    };

    return (
        <div className="w-full flex flex-col gap-6 relative group"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white tracking-tight">Recruiter Dashboard</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Operations</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Verified Org</span>
                </div>
            </div>

            {/* Stat Pods */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                {[
                    { icon: LayoutDashboard, label: "Hiring",  val: "12",  col: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { icon: ShieldCheck,     label: "Signals", val: "142", col: "text-blue-400",    bg: "bg-blue-500/10"    },
                    { icon: FolderOpen,      label: "Active",  val: "4",   col: "text-purple-400",  bg: "bg-purple-500/10"  },
                ].map((pod, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#111111] bg-gradient-to-b from-transparent to-black/20 border border-white/5 space-y-1.5 shadow-xl">
                        <div className={`w-6 h-6 flex items-center justify-center rounded-lg ${pod.bg}`}>
                            <pod.icon className={`w-3 h-3 ${pod.col}`} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white leading-none">{pod.val}</p>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{pod.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Carousel */}
            <div className="relative overflow-hidden" style={{ height: 170 }}>
                {panels.map((panel, i) => {
                    const pos = (i - active + 4) % 4;
                    const anim = cardAnim(pos);
                    return (
                        <motion.div
                            key={i}
                            animate={{ x: anim.x, y: anim.y, scale: anim.scale, opacity: anim.opacity, filter: anim.filter }}
                            transition={{ type: "spring", stiffness: 260, damping: 28 }}
                            style={{ position: "absolute", top: 0, left: "50%", marginLeft: -160, width: 320, zIndex: anim.zIndex, pointerEvents: pos === 0 ? "auto" : "none" }}
                        >
                            {panel}
                        </motion.div>
                    );
                })}
                <div className="absolute inset-y-0 left-0 w-10 pointer-events-none z-40" style={{ background: "linear-gradient(to right, black 20%, transparent)" }} />
                <div className="absolute inset-y-0 right-0 w-10 pointer-events-none z-40" style={{ background: "linear-gradient(to left, black 20%, transparent)" }} />
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2 relative z-10">
                {slides.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => { setActive(i); setPaused(true); setTimeout(() => setPaused(false), 6000); }}
                        className="rounded-full transition-all duration-300"
                        style={{ width: active === i ? 20 : 6, height: 6, background: active === i ? s.color + "cc" : "rgba(255,255,255,0.18)" }}
                    />
                ))}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
        </div>
    );
}

// Block 2 — Hiring — state lifted here, controls both bullets and carousel
function HiringBlock() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;
        const t = setInterval(() => setActive(p => (p + 1) % 4), 3500);
        return () => clearInterval(t);
    }, [paused]);

    const features = [
        { icon: ShieldCheck, label: "Verified Signal Only",     desc: "Surface candidates with proven on-chain records. No more guessing based on unverified PDF resumes.",              color: "#60a5fa", slide: 0 },
        { icon: Building2,   label: "Org-Backed Trust",         desc: "See exactly which protocols and organizations have attested to a candidate's specific work output.",              color: "#34d399", slide: 1 },
        { icon: Share2,      label: "Post Anywhere, Instantly", desc: "Share a portable job link to LinkedIn, Twitter, Discord, or any platform. One link, verified by ChainVolio.", color: "#f59e0b", slide: 2 },
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
                <div className="absolute -inset-10 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
                <RecruiterDashboardPreviewUI_V2
                    active={active}
                    setActive={setActive}
                    paused={paused}
                    setPaused={setPaused}
                />
            </div>

            {/* Right — copy & hover-controlled feature rows */}
            <div className="space-y-10 order-1 lg:order-2">
                <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.22em] bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">Use Case</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.06]">
                        Hire based on real proof,<br /><span className="text-white/30">not profiles.</span>
                    </h3>
                    <p className="text-white/40 text-base md:text-lg leading-relaxed font-medium max-w-md">
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
                            animate={{ opacity: active === f.slide ? 1 : 0.4 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-start gap-4 py-4 cursor-default"
                        >
                            <motion.div
                                animate={{
                                    background: active === f.slide ? f.color + "18" : f.color + "08",
                                    borderColor: active === f.slide ? f.color + "35" : f.color + "15",
                                }}
                                transition={{ duration: 0.25 }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border"
                            >
                                <f.icon className="w-3.5 h-3.5" style={{ color: active === f.slide ? f.color : f.color + "55" }} />
                            </motion.div>
                            <div>
                                <p className="text-sm font-bold mb-1" style={{ color: active === f.slide ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>
                                    {f.label}
                                </p>
                                <p className="text-xs leading-relaxed" style={{ color: active === f.slide ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)" }}>
                                    {f.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Link href="/hiring/create" className="inline-flex items-center gap-2 text-sm font-bold text-white/30 hover:text-white/80 transition-colors duration-200 group">
                    Start hiring
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
            </div>
        </motion.div>
    );
}


const SLIDES = [
    { src: "/homepage/image%20slide%202/cv%20view2.svg", label: "Professional Profile" },
    { src: "/homepage/image%20slide%202/dashboard%202.svg", label: "Recruiter dashboard" },
    { src: "/homepage/image%20slide%202/edit%20profile%202.svg", label: "Profile customization" },
    { src: "/homepage/image%20slide%202/proof%20of%20work%202.svg", label: "Verifiable work" },
    { src: "/homepage/image%20slide%202/apply.svg", label: "Talent application" },
    { src: "/homepage/image%20slide%202/attestation.svg", label: "On-chain attestations" },
    { src: "/homepage/image%20slide%202/status.svg", label: "Verification status" },
];

// ─── Why ChainVolio — Circuit Board Diagram ─────────────────────────────────

const CATEGORY_COLORS = {
    purple: "#9945FF",
    green:  "#14F195",
    blue:   "#60a5fa",
    amber:  "#f59e0b",
    violet: "#a78bfa",
    teal:   "#2dd4bf",
};

function CompetitiveNetworkDiagram() {
    const [active, setActive] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const el = svgRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setActive(true); },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const SVW = 1100, SVH = 720;
    const CX = 550, CY = 375;

    // Top input sources
    const COL_XS = [248, 424, 600];
    const ROW_YS = [52, 112, 172];
    const N_W = 148;
    const COLLECTOR_Y = 224;
    const INGEST_X = 470, INGEST_Y = 240, INGEST_W = 160, INGEST_H = 26;

    // Center chip
    const CHIP_X = 440, CHIP_Y = 330, CHIP_W = 220, CHIP_H = 90;

    // Left verification
    const N_H = 26;
    const LN_X = 20, LN_W = 148, LN_H = 26;
    const LN_YS = [315, 375, 435];
    const L_BUS_X = 256;
    const VERIFY_X = 274, VERIFY_W = 116, VERIFY_H = 30;

    // Right outputs
    const RO_X = 920, RO_W = 168, RO_H = 26;
    const RO_YS = [195, 255, 315, 375];
    const R_BUS_X = 710;

    // Bottom consumers
    const BC_XS = [340, 480, 620, 760];
    const BC_Y = 574;
    const BC_W = 118, BC_H = 26;
    const MATCH_Y = 490;

    const TOP_SOURCES = [
        [
            { label: "Code Contributions",     color: CATEGORY_COLORS.purple, sub: "repos & commits" },
            { label: "Project Documentation", color: CATEGORY_COLORS.purple, sub: "docs & specs"    },
            { label: "Design Output",        color: CATEGORY_COLORS.purple, sub: "design work"     },
        ],
        [
            { label: "On-chain Activity",      color: CATEGORY_COLORS.green,  sub: "tx history"      },
            { label: "Ecosystem Contributions", color: CATEGORY_COLORS.green,  sub: "bounties"         },
            { label: "Hackathon Work",        color: CATEGORY_COLORS.green,  sub: "hackathons"       },
        ],
        [
            { label: "Public Signals",        color: CATEGORY_COLORS.blue,   sub: "threads"         },
            { label: "Community Activity",    color: CATEGORY_COLORS.blue,   sub: "community"       },
            { label: "Peer Interaction",      color: CATEGORY_COLORS.blue,   sub: "channels"        },
        ],
    ];
    const ROW_LABELS = ["DEV TOOLS", "ON-CHAIN", "SOCIAL"];
    const ROW_COLORS = [CATEGORY_COLORS.purple, CATEGORY_COLORS.green, CATEGORY_COLORS.blue];

    const LEFT_NODES = [
        { label: "SMART CONTRACT", sub: "audit trace",      color: CATEGORY_COLORS.green },
        { label: "WORK HISTORY",   sub: "on-chain proof",   color: CATEGORY_COLORS.green },
        { label: "ATTESTATIONS",   sub: "verified by DAOs", color: CATEGORY_COLORS.green },
    ];

    const RIGHT_OUTPUTS = [
        { label: "Verifiable CV",     sub: "permanent record",   color: CATEGORY_COLORS.teal },
        { label: "Reputation Score",  sub: "credibility rating", color: CATEGORY_COLORS.teal },
        { label: "Skill Proof",       sub: "verified skills",    color: CATEGORY_COLORS.teal },
        { label: "Public Identity",   sub: "shareable link",     color: CATEGORY_COLORS.teal },
    ];

    const CONSUMERS = [
        { label: "DAO Access",       sub: "Protocol admin",  color: CATEGORY_COLORS.amber },
        { label: "Talent Discovery", sub: "Instant hire",    color: CATEGORY_COLORS.amber },
        { label: "Hiring",           sub: "HR verification", color: CATEGORY_COLORS.amber },
        { label: "Collaboration",    sub: "Team builder",    color: CATEGORY_COLORS.amber },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anim = (opts: any): any => active ? opts : {};

    return (
        <svg ref={svgRef} viewBox={`0 0 ${SVW} ${SVH}`} width="100%" height="auto"
            className="overflow-visible" xmlns="http://www.w3.org/2000/svg">

            <defs>
                <pattern id="dotGrid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.055)" />
                </pattern>
                <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="node-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#111111" />
                    <stop offset="100%" stopColor="#000000" />
                </linearGradient>
            </defs>

            {/* dot grid */}
            <rect width="100%" height="100%" fill="url(#dotGrid)"
                opacity={active ? 1 : 0.4} style={{ transition: 'opacity 1.5s ease-in-out' }} />

            {/* ══ SECTION LABELS ══ */}
            <text x={424} y={30} textAnchor="middle" fill="rgba(255,255,255,0.14)"
                fontSize={7.5} fontWeight={700} letterSpacing={3} fontFamily="monospace">INPUT SOURCES</text>
            
            <text x={194} y={LN_YS[0] - 30} textAnchor="middle" fill="rgba(255,255,255,0.14)"
                fontSize={7.5} fontWeight={700} letterSpacing={3} fontFamily="monospace">VERIFICATION</text>

            <text x={772} y={RO_YS[0] - 30} textAnchor="middle"
                fill="rgba(255,255,255,0.14)" fontSize={7.5} fontWeight={700}
                letterSpacing={3} fontFamily="monospace">VERIFIED OUTPUT</text>

            <text x={CX} y={544} textAnchor="middle" fill="rgba(255,255,255,0.14)"
                fontSize={7.5} fontWeight={700} letterSpacing={3} fontFamily="monospace">CONSUMERS</text>

            {/* ══ TOP INPUT SOURCES ══ */}

            {/* row category labels */}
            {ROW_LABELS.map((label, ri) => (
                <motion.text key={`rl${ri}`} x={174} y={ROW_YS[ri] + N_H / 2 + 1}
                    textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={6.5}
                    fontWeight={700} letterSpacing={2.5} opacity={0}
                    animate={anim({ opacity: 0.65 })}
                    transition={{ delay: 0.1 + ri * 0.06 }}
                    fontFamily="monospace">{label}</motion.text>
            ))}

            {/* ══ ANIMATED DATA PACKETS ══ */}
            {active && [
                // TOP SOURCES (9 nodes)
                { d: `M ${COL_XS[0]} ${ROW_YS[0] + N_H} L ${COL_XS[0]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '4.8s', delay: '0s'   },
                { d: `M ${COL_XS[1]} ${ROW_YS[0] + N_H} L ${COL_XS[1]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.0s', delay: '0.4s' },
                { d: `M ${COL_XS[2]} ${ROW_YS[0] + N_H} L ${COL_XS[2]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.2s', delay: '0.8s' },
                
                { d: `M ${COL_XS[0]} ${ROW_YS[1] + N_H} L ${COL_XS[0]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '4.9s', delay: '1.2s' },
                { d: `M ${COL_XS[1]} ${ROW_YS[1] + N_H} L ${COL_XS[1]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.1s', delay: '0.3s' },
                { d: `M ${COL_XS[2]} ${ROW_YS[1] + N_H} L ${COL_XS[2]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.3s', delay: '0.7s' },
                
                { d: `M ${COL_XS[0]} ${ROW_YS[2] + N_H} L ${COL_XS[0]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.0s', delay: '1.5s' },
                { d: `M ${COL_XS[1]} ${ROW_YS[2] + N_H} L ${COL_XS[1]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.4s', delay: '1.1s' },
                { d: `M ${COL_XS[2]} ${ROW_YS[2] + N_H} L ${COL_XS[2]} ${COLLECTOR_Y} L ${CX} ${COLLECTOR_Y} L ${CX} ${INGEST_Y}`, dur: '5.6s', delay: '0.9s' },

                // INGESTION TO CHIP
                { d: `M ${CX} ${INGEST_Y + INGEST_H} L ${CX} ${CHIP_Y}`, dur: '1.4s', delay: '1.3s' },

                // LEFT NODES (3 nodes)
                { d: `M ${LN_X + LN_W} ${LN_YS[0]} L ${L_BUS_X} ${LN_YS[0]} L ${L_BUS_X} ${CY} L ${CHIP_X} ${CY}`, dur: '3.4s', delay: '0.6s' },
                { d: `M ${LN_X + LN_W} ${LN_YS[1]} L ${L_BUS_X} ${LN_YS[1]} L ${L_BUS_X} ${CY} L ${CHIP_X} ${CY}`, dur: '3.6s', delay: '1.0s' },
                { d: `M ${LN_X + LN_W} ${LN_YS[2]} L ${L_BUS_X} ${LN_YS[2]} L ${L_BUS_X} ${CY} L ${CHIP_X} ${CY}`, dur: '3.9s', delay: '1.4s' },

                // CHIP TO RIGHT (4 nodes)
                { d: `M ${CHIP_X + CHIP_W} ${CY} L ${R_BUS_X} ${CY} L ${R_BUS_X} ${RO_YS[0]} L ${R_BUS_X + 12} ${RO_YS[0]}`, dur: '3.0s', delay: '1.6s' },
                { d: `M ${CHIP_X + CHIP_W} ${CY} L ${R_BUS_X} ${CY} L ${R_BUS_X} ${RO_YS[1]} L ${R_BUS_X + 12} ${RO_YS[1]}`, dur: '3.2s', delay: '1.9s' },
                { d: `M ${CHIP_X + CHIP_W} ${CY} L ${R_BUS_X} ${CY} L ${R_BUS_X} ${RO_YS[2]} L ${R_BUS_X + 12} ${RO_YS[2]}`, dur: '3.4s', delay: '2.2s' },
                { d: `M ${CHIP_X + CHIP_W} ${CY} L ${R_BUS_X} ${CY} L ${R_BUS_X} ${RO_YS[3]} L ${R_BUS_X + 12} ${RO_YS[3]}`, dur: '3.6s', delay: '2.5s' },

                // CHIP TO MATCHING
                { d: `M ${CX} ${CHIP_Y + CHIP_H} L ${CX} ${MATCH_Y - 18}`, dur: '1.4s', delay: '1.9s' },

                // MATCHING TO CONSUMERS (4 nodes)
                { d: `M ${CX} ${MATCH_Y + 18} L ${CX} ${BC_Y - 52} L ${BC_XS[0]} ${BC_Y - 52} L ${BC_XS[0]} ${BC_Y - BC_H/2}`, dur: '3.8s', delay: '2.3s' },
                { d: `M ${CX} ${MATCH_Y + 18} L ${CX} ${BC_Y - 52} L ${BC_XS[1]} ${BC_Y - 52} L ${BC_XS[1]} ${BC_Y - BC_H/2}`, dur: '4.0s', delay: '2.6s' },
                { d: `M ${CX} ${MATCH_Y + 18} L ${CX} ${BC_Y - 52} L ${BC_XS[2]} ${BC_Y - 52} L ${BC_XS[2]} ${BC_Y - BC_H/2}`, dur: '4.2s', delay: '2.9s' },
                { d: `M ${CX} ${MATCH_Y + 18} L ${CX} ${BC_Y - 52} L ${BC_XS[3]} ${BC_Y - 52} L ${BC_XS[3]} ${BC_Y - BC_H/2}`, dur: '4.4s', delay: '3.2s' },
            ].map((p, i) => (
                <rect key={`pkt-${i}`} x="-1.5" y="-1.5" width={3} height={3} rx={0.5}
                    fill="white" style={{ filter: `drop-shadow(0 0 3px white)` }}>
                    <animateMotion dur={p.dur} repeatCount="indefinite" begin={p.delay} path={p.d} />
                </rect>
            ))}

            {/* 9 source nodes */}
            {TOP_SOURCES.map((row, ri) => row.map((node, ci) => {
                const nw = Math.max(node.label.length * 6.2, node.sub.length * 4.6) + 10;
                const nx = COL_XS[ci] - nw / 2;
                const ny = ROW_YS[ri];
                return (
                    <motion.g key={`tn${ri}${ci}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={anim({ opacity: 1, y: 0 })}
                        transition={{ delay: 0.12 + ri * 0.07 + ci * 0.04 }}>
                        <rect x={nx} y={ny} width={nw} height={N_H} rx={3}
                            fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                        
                        {/* Terminal via */}
                        <circle cx={COL_XS[ci]} cy={ny + N_H} r={1.5} fill="#000" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                        
                        <text x={COL_XS[ci]} y={ny + N_H / 2 - 1.5} textAnchor="middle"
                            fill="rgba(255,255,255,0.9)" fontSize={8} fontWeight={600}
                            fontFamily="Inter, sans-serif">{node.label}</text>
                        <text x={COL_XS[ci]} y={ny + N_H / 2 + 7.5} textAnchor="middle"
                            fill="rgba(255,255,255,0.3)" fontSize={6}
                            fontFamily="Inter, sans-serif">{node.sub}</text>

                        {/* vertical trace to collector */}
                        <line x1={COL_XS[ci]} y1={ny + N_H} x2={COL_XS[ci]} y2={COLLECTOR_Y}
                            stroke="rgba(255,255,255,0.12)" strokeWidth={0.75} strokeDasharray="3 5" />
                        
                        {/* junction via at collector line */}
                        <g opacity={active ? 0.4 : 0}>
                            <circle cx={COL_XS[ci]} cy={COLLECTOR_Y} r={2.5} fill="#000" stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} />
                            <circle cx={COL_XS[ci]} cy={COLLECTOR_Y} r={1} fill="rgba(255,255,255,0.5)" />
                        </g>
                    </motion.g>
                );
            }))}

            {/* horizontal collector rail */}
            <motion.line x1={COL_XS[0]} y1={COLLECTOR_Y} x2={COL_XS[2]} y2={COLLECTOR_Y}
                stroke="rgba(255,255,255,0.10)" strokeWidth={1} strokeDasharray="4 6"
                opacity={0} animate={anim({ opacity: 1 })}
                transition={{ delay: 0.55 }} />

            {/* collector → ingestion trunk */}
            <motion.line x1={CX} y1={COLLECTOR_Y} x2={CX} y2={INGEST_Y}
                stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="3 4"
                opacity={0} animate={anim({ opacity: 1 })}
                transition={{ delay: 0.65 }} />

            {/* ── DATA INGESTION node ── */}
            <motion.g initial={{ opacity: 0 }} animate={anim({ opacity: 1 })} transition={{ delay: 0.85 }}>
                <rect x={INGEST_X} y={INGEST_Y} width={INGEST_W} height={26} rx={3}
                    fill="url(#node-grad)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
                <text x={CX} y={INGEST_Y + 11} textAnchor="middle"
                    fill="rgba(255,255,255,0.9)" fontSize={8.5} fontWeight={800} letterSpacing={1}
                    fontFamily="Inter, sans-serif">DATA INGESTION</text>
                <text x={CX} y={INGEST_Y + 20} textAnchor="middle"
                    fill="rgba(255,255,255,0.35)" fontSize={6.5} fontFamily="Inter, sans-serif">collecting all signals</text>
                <rect x={CX - 3} y={INGEST_Y - 4} width={6} height={6} fill="none" />
                <rect x={CX - 3} y={INGEST_Y + INGEST_H - 2} width={6} height={6} fill="none" />
                {/* ingestion → chip */}
                <line x1={CX} y1={INGEST_Y + INGEST_H + 2} x2={CX} y2={CHIP_Y}
                    stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="4 4" />
                <g opacity={active ? 0.5 : 0}>
                    <circle cx={CX} cy={CHIP_Y} r={3} fill="#000" stroke="rgba(255,255,255,0.4)" strokeWidth={0.5} />
                    <circle cx={CX} cy={CHIP_Y} r={1.2} fill="white" />
                </g>
            </motion.g>

            {/* ══ LEFT: WORK VERIFICATION ══ */}
            <motion.g initial={{ opacity: 0, x: -18 }} animate={anim({ opacity: 1, x: 0 })} transition={{ delay: 0.38 }}>
                {LEFT_NODES.map((node, i) => {
                    const lnw = Math.max(node.label.length * 6.2, node.sub.length * 4.6) + 10;
                    const center_x = L_BUS_X - 12 - lnw / 2;
                    return (
                        <g key={`ln${i}`}>
                            <rect x={L_BUS_X - 12 - lnw} y={LN_YS[i] - 13} width={lnw} height={26} rx={3}
                                fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                            <text x={center_x} y={LN_YS[i] - 1.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.9)" fontSize={8} fontWeight={600}
                                fontFamily="Inter, sans-serif">{node.label}</text>
                            <text x={center_x} y={LN_YS[i] + 7.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.3)" fontSize={6}
                                fontFamily="Inter, sans-serif">{node.sub}</text>
                            <line x1={L_BUS_X - 12} y1={LN_YS[i]} x2={L_BUS_X} y2={LN_YS[i]}
                                stroke="rgba(255,255,255,0.15)" strokeWidth={0.75} strokeDasharray="3 5" />
                            <circle cx={L_BUS_X - 12} cy={LN_YS[i]} r={1.5} fill="#000" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                        </g>
                    );
                })}
                {/* left vertical bus */}
                <line x1={L_BUS_X} y1={LN_YS[0]} x2={L_BUS_X} y2={LN_YS[LN_YS.length - 1]}
                    stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} strokeDasharray="4 4" />
                {/* horizontal trunk (bus → verify engine → chip) */}
                <line x1={L_BUS_X} y1={CY} x2={CHIP_X} y2={CY}
                    stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeDasharray="4 4" />
                {/* VERIFICATION ENGINE (sits on trunk) */}
                <rect x={VERIFY_X} y={CY - 13} width={VERIFY_W} height={26} rx={3}
                    fill="url(#node-grad)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
                <text x={VERIFY_X + VERIFY_W / 2} y={CY - 1.5} textAnchor="middle"
                    fill="rgba(255,255,255,0.85)" fontSize={8.5} fontWeight={800} letterSpacing={1}
                    fontFamily="Inter, sans-serif">VERIFICATION</text>
                <text x={VERIFY_X + VERIFY_W / 2} y={CY + 7.5} textAnchor="middle"
                    fill="rgba(255,255,255,0.3)" fontSize={6} fontFamily="Inter, sans-serif">ENGINE</text>
                <rect x={L_BUS_X - 4} y={CY - 4} width={8} height={8} fill="rgba(255,255,255,0.2)" rx={1} />
                <rect x={CHIP_X - 4} y={CY - 4} width={8} height={8} fill="rgba(255,255,255,0.2)" rx={1} />
                {/* Vias at L-bus junctions */}
                {active && LN_YS.map((y, i) => (
                    <g key={`lvia${i}`}>
                        <circle cx={L_BUS_X} cy={y} r={2.5} fill="#000" stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} />
                        <circle cx={L_BUS_X} cy={y} r={1} fill="rgba(255,255,255,0.5)" />
                    </g>
                ))}
                {active && (
                    <g>
                        <circle cx={L_BUS_X} cy={CY} r={3.5} fill="#000" stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} />
                        <circle cx={L_BUS_X} cy={CY} r={1.5} fill="white" />
                    </g>
                )}
            </motion.g>

            {/* ══ CENTER: ChainVolio Chip ══ */}
            <motion.g
                initial={{ opacity: 0, scale: 0.9 }}
                animate={anim({ opacity: 1, scale: 1 })}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
                transition={{ duration: 0.8, delay: 0.7 }}>
                <circle cx={CX} cy={CY} r={82} fill="url(#hub-glow)" />
                <rect x={CHIP_X} y={CHIP_Y} width={CHIP_W} height={CHIP_H} rx={8}
                    fill="url(#node-grad)" stroke="rgba(255,255,255,0.15)" strokeWidth={0.6} />
                
                <image href="/logo.png" x={CX - 22} y={CY - 34} width={44} height={44}
                    style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))' }} />
                <text x={CX} y={CY + 26} textAnchor="middle" fill="white"
                    fontSize={11} fontWeight={800} letterSpacing={2.5} fontFamily="Inter, sans-serif">CHAINVOLIO</text>
            </motion.g>

            {/* ══ RIGHT: VERIFIED OUTPUT ══ */}
            <motion.g initial={{ opacity: 0, x: 18 }} animate={anim({ opacity: 1, x: 0 })} transition={{ delay: 0.5 }}>
                {/* chip → right bus trunk */}
                <line x1={CHIP_X + CHIP_W} y1={CY} x2={R_BUS_X} y2={CY}
                    stroke="rgba(255,255,255,0.15)" strokeWidth={2} strokeDasharray="4 4" />
                <rect x={CHIP_X + CHIP_W - 4} y={CY - 4} width={8} height={8} fill="rgba(255,255,255,0.18)" rx={1} />
                <rect x={R_BUS_X - 4} y={CY - 4} width={8} height={8} fill="rgba(255,255,255,0.18)" rx={1} />
                {/* right vertical bus */}
                <line x1={R_BUS_X} y1={RO_YS[0]} x2={R_BUS_X} y2={RO_YS[RO_YS.length - 1]}
                    stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} strokeDasharray="4 4" />

                {/* output nodes */}
                {RIGHT_OUTPUTS.map((node, i) => {
                    const row = Math.max(node.label.length * 6.2, node.sub.length * 4.6) + 10;
                    const center_x = R_BUS_X + 12 + row / 2;
                    return (
                        <g key={`ro${i}`}>
                            <line x1={R_BUS_X} y1={RO_YS[i]} x2={R_BUS_X + 12} y2={RO_YS[i]}
                                stroke="rgba(255,255,255,0.1)" strokeWidth={0.75} strokeDasharray="3 5" />
                            <g opacity={active ? 1 : 0}>
                                <circle cx={R_BUS_X} cy={RO_YS[i]} r={1.5} fill="#000" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                            </g>
                            <rect x={R_BUS_X + 12} y={RO_YS[i] - 13} width={row} height={26} rx={3}
                                fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                            <text x={center_x} y={RO_YS[i] - 1.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.95)" fontSize={8} fontWeight={700}
                                fontFamily="Inter, sans-serif">{node.label}</text>
                            <text x={center_x} y={RO_YS[i] + 7.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.35)" fontSize={6}
                                fontFamily="Inter, sans-serif">{node.sub}</text>
                        </g>
                    );
                })}
                {active && (
                    <g>
                        <circle cx={R_BUS_X} cy={CY} r={3.5} fill="#000" stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} />
                        <circle cx={R_BUS_X} cy={CY} r={1.5} fill="white" />
                    </g>
                )}
            </motion.g>

            {/* ══ BOTTOM: SMART MATCHING & CONSUMERS ══ */}
            <motion.g initial={{ opacity: 0, y: 18 }} animate={anim({ opacity: 1, y: 0 })} transition={{ delay: 0.6 }}>
                {/* chip → matching trunk */}
                <line x1={CX} y1={CHIP_Y + CHIP_H} x2={CX} y2={MATCH_Y - 18}
                    stroke="rgba(255,255,255,0.15)" strokeWidth={2} strokeDasharray="4 4" />
                <rect x={CX - 4} y={CHIP_Y + CHIP_H - 4} width={8} height={8} fill="rgba(255,255,255,0.18)" rx={1} />
                {/* SMART MATCHING box */}
                <rect x={CX - 82} y={MATCH_Y - 13} width={164} height={26} rx={3}
                    fill="url(#node-grad)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
                <text x={CX} y={MATCH_Y} textAnchor="middle"
                    fill="rgba(255,255,255,0.85)" fontSize={8.5} fontWeight={800} letterSpacing={1}
                    fontFamily="Inter, sans-serif">SMART MATCHING</text>
                <text x={CX} y={MATCH_Y + 9} textAnchor="middle"
                    fill="rgba(255,255,255,0.35)" fontSize={6.5} fontFamily="Inter, sans-serif">verified credentials, trusted anywhere</text>
                {/* horizontal distribution rail */}
                <line x1={BC_XS[0]} y1={BC_Y - 52} x2={BC_XS[BC_XS.length - 1]} y2={BC_Y - 52}
                    stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="3 6" />
                {/* consumer nodes */}
                {CONSUMERS.map((node, i) => {
                    const bcw = Math.max(node.label.length * 6.2, node.sub.length * 4.6) + 10;
                    const bcx = BC_XS[i];
                    return (
                        <g key={`bc${i}`}>
                             <path
                                d={`M ${CX} ${MATCH_Y + 16} L ${CX} ${BC_Y - 52} L ${bcx} ${BC_Y - 52} L ${bcx} ${BC_Y - 13}`}
                                fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="3 6" />
                            <circle cx={bcx} cy={BC_Y - 52} r={1.5} fill="#000" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                            <rect x={bcx - bcw / 2} y={BC_Y - 13} width={bcw} height={26} rx={3}
                                fill="url(#node-grad)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                            <text x={bcx} y={BC_Y - 1.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.9)" fontSize={8.5} fontWeight={800}
                                letterSpacing={1} fontFamily="Inter, sans-serif">{node.label}</text>
                            <text x={bcx} y={BC_Y + 7.5} textAnchor="middle"
                                fill="rgba(255,255,255,0.3)" fontSize={6}
                                fontFamily="Inter, sans-serif">{node.sub}</text>
                        </g>
                    );
                })}
            </motion.g>


        </svg>
    );
}

// ─── Simple Flow Diagram ──────────────────────────────────────────────────────
function SimpleDiagram() {
    const [active, setActive] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const el = svgRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setActive(true); },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const W = 920, H = 600;
    const f = (d: number) => ({ opacity: active ? 1 : 0, transition: `opacity 0.5s ease ${d}s` });

    return (
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height="auto"
            className="overflow-visible" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="s-node-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#111111" />
                    <stop offset="100%" stopColor="#000000" />
                </linearGradient>
            </defs>

            {/* ─── ANIMATED DOTS (DATA PACKETS) ─── */}
            {active && [
                { d: "M 155 134 L 155 145 L 460 145 L 460 185", dur: '4s', delay: '0s' },
                { d: "M 460 134 L 460 145 L 460 185", dur: '3s', delay: '0.5s' },
                { d: "M 765 134 L 765 145 L 460 145 L 460 185", dur: '4s', delay: '1s' },
                { d: "M 460 225 L 460 270", dur: '2s', delay: '0.2s' },
                { d: "M 144 320 L 204 320", dur: '2s', delay: '0.4s' },
                { d: "M 314 320 L 375 320", dur: '1s', delay: '1.2s' },
                { d: "M 545 320 L 776 320", dur: '3s', delay: '1.5s' },
                { d: "M 460 370 L 460 415", dur: '2s', delay: '1.2s' },
                { d: "M 460 455 L 460 475 L 127 475 L 127 495", dur: '4s', delay: '2.2s' },
                { d: "M 460 455 L 460 475 L 349 475 L 349 495", dur: '4s', delay: '2.4s' },
                { d: "M 460 455 L 460 475 L 571 475 L 571 495", dur: '4s', delay: '2.6s' },
                { d: "M 460 455 L 460 475 L 793 475 L 793 495", dur: '4s', delay: '2.8s' },
            ].map((p, i) => (
                <rect key={`spkt-${i}`} x="-1" y="-1" width={2} height={2} rx={0.5}
                    fill="white" style={{ filter: `drop-shadow(0 0 2px white)` }}>
                    <animateMotion dur={p.dur} repeatCount="indefinite" begin={p.delay} path={p.d} />
                </rect>
            ))}

            {/* ─── INPUT SOURCES ────────────────────────────────────── */}
            <g style={f(0.05)}>
                <text x={W / 2} y={12} textAnchor="middle" fill="rgba(255,255,255,0.3)"
                    fontSize="8" fontWeight="800" letterSpacing="4" fontFamily="monospace">INPUT SOURCE</text>
                
                {[
                    { cx: 155, items: ["Code Contributions", "Project Documentation", "Design Output"] },
                    { cx: 460, items: ["On-chain Activity", "Ecosystem Contributions", "Hackathon Work"] },
                    { cx: 765, items: ["Public Signals", "Community Activity", "Peer Interaction"] }
                ].map((box, i) => (
                    <g key={i}>
                        <rect x={box.cx - 75} y={24} width={150} height={110} rx={12} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        {box.items.map((it, j) => (
                            <g key={j}>
                                <text x={box.cx} y={48 + j * 16} textAnchor="middle" fill="white" fontSize="9.5" fontWeight="600">{it}</text>
                                {j < 2 && <line x1={box.cx - 50} y1={53 + j * 16} x2={box.cx + 50} y2={53 + j * 16} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />}
                            </g>
                        ))}
                        <g transform={`translate(${box.cx}, 98)`} opacity="0.8">
                            {i === 0 && (
                                <g>
                                    <g transform="translate(-40,0)">
                                        <path d="M-4,0 L-8,4 L-4,8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M1,-2 L-2,10" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M4,0 L8,4 L4,8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </g>
                                    <g transform="translate(0,-4)">
                                        <path d="M-6,0 H2 L6,4 V12 H-6 Z" fill="none" stroke="white" strokeWidth="1.2" />
                                        <path d="M2,0 V4 H6" fill="none" stroke="white" strokeWidth="1" />
                                    </g>
                                    <g transform="translate(40,-2)">
                                        <circle cx="0" cy="4" r="7" fill="none" stroke="white" strokeWidth="1.2" />
                                        <circle cx="-3" cy="2" r="1" fill="white" />
                                        <circle cx="1" cy="1" r="1" fill="white" />
                                        <circle cx="4" cy="4" r="1" fill="white" />
                                        <path d="M4,1 L9,-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                    </g>
                                </g>
                            )}
                            {i === 1 && (
                                <g>
                                    <g transform="translate(-40,0)">
                                        <path d="M4,-8 A8,8 0 0,1 4,8" fill="none" stroke="white" strokeWidth="1.5" />
                                        <circle cx="-6" cy="0" r="0.8" fill="white" />
                                        <circle cx="-4" cy="-4" r="0.8" fill="white" />
                                        <circle cx="-4" cy="4" r="0.8" fill="white" />
                                        <path d="M4,0 V-4 M4,0 L1,3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </g>
                                    <g transform="translate(0,-4)">
                                        <circle cx="0" cy="4" r="8" fill="none" stroke="white" strokeWidth="1.2" />
                                        <path d="M0,12 V4" stroke="white" strokeWidth="1" />
                                        <circle cx="-3" cy="3" r="1.5" fill="none" stroke="white" strokeWidth="0.8" />
                                        <circle cx="3" cy="3" r="1.5" fill="none" stroke="white" strokeWidth="0.8" />
                                        <circle cx="0" cy="1" r="1.5" fill="none" stroke="white" strokeWidth="0.8" />
                                    </g>
                                    <g transform="translate(40,-4)">
                                        <rect x="-8" y="0" width="16" height="11" rx="1.5" fill="none" stroke="white" strokeWidth="1.2" />
                                        <path d="M-3,0 V-2 H3 V0" fill="none" stroke="white" strokeWidth="1.2" />
                                        <rect x="-2" y="4" width="4" height="2.5" rx="0.5" fill="none" stroke="white" strokeWidth="0.8" />
                                    </g>
                                </g>
                            )}
                            {i === 2 && (
                                <g>
                                    <g transform="translate(-40,0)">
                                        <circle cx="0" cy="0" r="1.5" fill="white" />
                                        <path d="M-4,-4 A6,6 0 0,0 -4,4 M4,-4 A6,6 0 0,1 4,4" fill="none" stroke="white" strokeWidth="1.2" />
                                        <path d="M-8,-8 A12,12 0 0,0 -8,8 M8,-8 A12,12 0 0,1 8,8" fill="none" stroke="white" strokeWidth="1.2" />
                                    </g>
                                    <g transform="translate(0,0)">
                                        <circle cx="-5" cy="-3" r="2.5" fill="white" />
                                        <circle cx="5" cy="-3" r="2.5" fill="white" />
                                        <circle cx="0" cy="0" r="3.5" fill="white" stroke="black" strokeWidth="0.5" />
                                        <path d="M-7,6 A4,4 0 0,1 7,6 Z" fill="white" stroke="black" strokeWidth="0.5" transform="translate(0,2)" />
                                    </g>
                                    <g transform="translate(40,-2)">
                                        <path d="M-8,2 V8 H-5 L2,12 V-2 L-5,2 Z" fill="white" />
                                        <path d="M5,1 A6,6 0 0,1 5,9 M8,-2 A10,10 0 0,1 8,12" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                    </g>
                                </g>
                            )}
                        </g>
                    </g>
                ))}
            </g>

            {/* ─── CONNECTORS ────────────────────────────────────────── */}
            <g style={f(0.2)}>
                <path d="M 155 134 L 155 145 L 765 145 M 460 134 L 460 185 M 765 134 L 765 145" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="460" y1="145" x2="460" y2="185" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>

            {/* ─── CENTER COLUMN ─────────────────────────────────────── */}
            <g style={f(0.12)}>
                <rect x={355} y={185} width={210} height={40} rx={20} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.1)" />
                <text x={460} y={203} textAnchor="middle" fill="white" fontSize="10" fontWeight="800">DATA INGESTION</text>
                <text x={460} y={218} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7.5">collecting all signals</text>
                <line x1="460" y1="225" x2="460" y2="270" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />

                <rect x={375} y={270} width={170} height={100} rx={16} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.1)" />
                <image href="/logo.png" x={438} y={288} width={44} height={44} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.25))' }} />
                <text x={460} y={348} textAnchor="middle" fill="white" fontSize="13" fontWeight="900" letterSpacing="3">CHAINVOLIO</text>

                <line x1="460" y1="370" x2="460" y2="415" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x={355} y={415} width={210} height={40} rx={20} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.1)" />
                <text x={460} y={433} textAnchor="middle" fill="white" fontSize="10" fontWeight="800">SMART MATCHING</text>
                <text x={460} y={448} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7.5">verified credentials, trusted anywhere</text>
            </g>

            {/* ─── SIDE PANELS ───────────────────────────────────────── */}
            <g style={f(0.25)}>
                <text x={79} y={236} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="800" letterSpacing="4" fontFamily="monospace">VERIFICATION</text>
                <rect x={14} y={245} width={130} height={150} rx={16} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.08)" />
                <g transform="translate(14, 261)">
                    {/* Item 1: Smart Contract */}
                    <g transform="translate(12, 10)">
                        <g transform="scale(0.85) rotate(-45, 6, 6)" opacity="0.9">
                            <rect x="0" y="3" width="9" height="5" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
                            <rect x="5" y="3" width="9" height="5" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
                        </g>
                        <g transform="translate(20, 5)">
                            <text fill="white" fontSize="9" fontWeight="800">SMART CONTRACT</text>
                            <text y={10} fill="rgba(255,255,255,0.4)" fontSize="7">audit trace</text>
                        </g>
                    </g>
                    <line x1="10" y1="30" x2="120" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                    
                    {/* Item 2: Work History */}
                    <g transform="translate(12, 50)">
                        <g transform="scale(0.7) translate(-2, -2)" opacity="0.9">
                            <path d="M10,0 L12.5,2 L15.5,1.5 L16,4.5 L19,6 L17.5,9 L19,12 L16,13.5 L15.5,16.5 L12.5,16 L10,18 L7.5,16 L4.5,16.5 L4,13.5 L1,12 L2.5,9 L1,6 L4,4.5 L4.5,1.5 L7.5,2 Z" fill="white" opacity="0.2" />
                            <path d="M10,0 L12.5,2 L15.5,1.5 L16,4.5 L19,6 L17.5,9 L19,12 L16,13.5 L15.5,16.5 L12.5,16 L10,18 L7.5,16 L4.5,16.5 L4,13.5 L1,12 L2.5,9 L1,6 L4,4.5 L4.5,1.5 L7.5,2 Z" fill="none" stroke="white" strokeWidth="1.5" />
                            <path d="M6,9 L9,12 L14,7" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                        </g>
                        <g transform="translate(20, 5)">
                            <text fill="white" fontSize="9" fontWeight="800">WORK HISTORY</text>
                            <text y={10} fill="rgba(255,255,255,0.4)" fontSize="7">on-chain proof</text>
                        </g>
                    </g>
                    <line x1="10" y1="70" x2="120" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />

                    {/* Item 3: Attestations */}
                    <g transform="translate(12, 90)">
                        <g transform="scale(0.85) translate(0, 0)" opacity="0.9">
                            <circle cx="6" cy="6" r="3" fill="none" stroke="white" strokeWidth="1.5" />
                            <path d="M6,0 V2 M6,10 V12 M0,6 H2 M10,6 H12 M2,2 L3.5,3.5 M8.5,8.5 L10,10 M2,10 L3.5,8.5 M8.5,3.5 L10,2" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                        </g>
                        <g transform="translate(20, 5)">
                            <text fill="white" fontSize="9" fontWeight="800">ATTESTATIONS</text>
                            <text y={10} fill="rgba(255,255,255,0.4)" fontSize="7">verified by DAOs</text>
                        </g>
                    </g>
                </g>

                {/* Verification Engine Node */}
                <rect x={204} y={300} width={110} height={40} rx={20} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.1)" />
                <text x={259} y={318} textAnchor="middle" fill="white" fontSize="9" fontWeight="800">VERIFICATION</text>
                <text x={259} y={330} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">engine</text>
                
                {/* Connector from Verification to Engine */}
                <line x1="144" y1="320" x2="204" y2="320" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="314" y1="320" x2="375" y2="320" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Verified Output Section */}
                <text x={841} y={211} textAnchor="middle" fill="rgba(255,255,255,0.3)" 
                    fontSize="8" fontWeight="800" letterSpacing="4" fontFamily="monospace">VERIFIED OUTPUT</text>
                <rect x={776} y={220} width={130} height={200} rx={16} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.08)" />
                <g transform="translate(841, 251)" textAnchor="middle">
                    {["Verifiable CV", "Reputation Score", "Skill Proof", "Public Identity"].map((t, i) => (
                        <g key={i} transform={`translate(0, ${i * 45})`}>
                            <text fill="white" fontSize="10" fontWeight="800">{t}</text>
                            <text y={10} fill="rgba(255,255,255,0.4)" fontSize="7">{["permanent record", "credibility rating", "verified skills", "shareable link"][i]}</text>
                            {i < 3 && <line x1="-50" y1="20" x2="50" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />}
                        </g>
                    ))}
                </g>
                <line x1="545" y1="320" x2="776" y2="320" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>

            {/* ─── CONSUMERS ─────────────────────────────────────────── */}
            <g style={f(0.35)}>
                <path d="M 460 455 L 460 475 L 127 475 L 127 495 M 460 475 L 349 475 L 349 495 M 460 475 L 571 475 L 571 495 M 460 475 L 793 475 L 793 495" 
                      fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
                
                {[
                    { cx: 127, label: "DAO Acces", sub: "Protocol Admin" }, 
                    { cx: 349, label: "Talent Discovery", sub: "Instant hire" },
                    { cx: 571, label: "Hiring", sub: "HR verification" }, 
                    { cx: 793, label: "Collaboration", sub: "Team builder" }
                ].map((box, i) => (
                    <g key={i}>
                        <rect x={box.cx - 60} y={495} width={120} height={50} rx={12} fill="url(#s-node-grad)" stroke="rgba(255,255,255,0.08)" />
                        <text x={box.cx} y={520} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">{box.label}</text>
                        <text x={box.cx} y={535} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">{box.sub}</text>
                    </g>
                ))}
                <text x={W / 2} y={H - 5} textAnchor="middle" fill="rgba(255,255,255,0.3)" 
                    fontSize="8" fontWeight="800" letterSpacing="4" fontFamily="monospace">CONSUMERS</text>
            </g>
        </svg>
    );
}



// PARTNERS are now loaded dynamically from /api/logos

export function LandingPageClient() {
    const { publicKey, connected } = useWallet();
    const [profile, setProfile] = useState<any>(null);
    const [activeModal, setActiveModal] = useState<'how' | 'recruiters' | 'talent' | 'ask' | 'screening' | 'attestation' | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [partners, setPartners] = useState<{ src: string; name: string; scale?: number }[]>([]);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [showFullDiagram, setShowFullDiagram] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" } | null>(null);
    const heroVideoRef = useRef<HTMLVideoElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (heroVideoRef.current) {
            heroVideoRef.current.playbackRate = 0.5;
        }
    }, []);

    useEffect(() => {
        const modal = searchParams.get('modal');
        if (modal === 'how') {
            router.push('/guides/how-it-works');
            return;
        }
        if (modal === 'recruiters' || modal === 'talent' || modal === 'ask' || modal === 'screening' || modal === 'attestation') {
            setActiveModal(modal as any);
        }
    }, [searchParams, router]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

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

    useEffect(() => {
        fetch('/api/logos')
            .then(r => r.json())
            .then(data => setPartners(data))
            .catch(err => console.error('Error fetching logos:', err));
    }, []);

    return (
        <div className="min-h-screen flex flex-col relative selection:bg-teal-500/30 selection:text-white">
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

            <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
                {/* Background Video */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <video 
                        ref={heroVideoRef}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover opacity-20 scale-105"
                    >
                        <source src="/video-background.mp4" type="video/mp4" />
                    </video>
                    {/* Dark Overlay for readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow-purple opacity-20 blur-[120px] pointer-events-none"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-glow-teal opacity-10 blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-glow-purple opacity-10 blur-[120px] pointer-events-none"></div>

                {/* HERO SECTION */}
                <section className="relative pt-32 pb-20 px-6 z-20 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-8 group transition-all hover:border-emerald-500/20 hover:bg-emerald-500/[0.02]">
                        <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent opacity-80">
                            Trust Layer for Web3
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-[72px] font-bold tracking-[-0.04em] leading-[1.05] mb-8 text-white max-w-5xl">
                        <span className="block drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">Build a Verifiable Web3</span>
                        <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(20,241,149,0.1)]">
                            Resume <span className="text-white/30">That Recruiters Trust.</span>
                        </span>
                    </h1>

                    <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mb-12 leading-relaxed">
                        Turn your work experience into verifiable on-chain proof.<br />
                        No fake CVs. No manual checks. Just trust.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-0">
                        <button
                            onClick={() => setIsWalletModalOpen(true)}
                            className="premium-shimmer-button w-full sm:w-auto px-10 py-4 bg-white text-black font-bold text-base rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                        >
                            Build Your Reputation
                        </button>
                        <button
                            onClick={() => router.push('/hiring/create')}
                            className="w-full sm:w-auto px-10 py-4 bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-base rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            Discover Talent <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* HERO VISUAL - Clean Slide Preview */}
                    <div className="relative w-full max-w-4xl mx-auto group -mt-12 pt-4 pb-4">
                        <div className="relative overflow-hidden transition-all duration-1000">
                            <div className="aspect-[16/10] relative">
                                {SLIDES.map((slide, index) => (
                                    <div 
                                        key={index}
                                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                                            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                                        }`}
                                    >
                                        <Image
                                            src={slide.src}
                                            alt={slide.label}
                                            fill
                                            className="object-contain"
                                            priority={index === 0}
                                        />
                                    </div>
                                ))}
                                {/* Multi-layered Bottom Gradient for Smooth Blending */}
                                <div className="absolute bottom-0 left-0 w-full h-[70%] bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-full h-12 bg-black z-20 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Slide Caption & Navigation */}
                        <div className="mt-4 space-y-6 flex flex-col items-center">
                            <div className="h-10 relative w-full flex justify-center">
                                {SLIDES.map((slide, index) => (
                                    <div 
                                        key={index} 
                                        className={`absolute transition-all duration-700 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm ${
                                            index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
                                        }`}
                                    >
                                        <div className="w-1 h-1 rounded-full bg-emerald-500/60" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                                            {slide.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Dot Indicators */}
                            <div className="flex items-center gap-3">
                                {SLIDES.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            index === currentSlide 
                                                ? "w-8 bg-white" 
                                                : "w-1.5 bg-white/20 hover:bg-white/40"
                                        }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Glow behind visual - reduced intensity */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/5 to-emerald-500/5 blur-3xl -z-10 rounded-[40px] opacity-30"></div>
                    </div>

                    <div className="mt-16 w-full max-w-[1400px] relative z-50">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 mb-12">
                            Powering the Web3 career stack
                        </p>
                        <div className="w-full py-4 overflow-hidden relative mb-12" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' }}>
                            <div className="flex animate-marquee whitespace-nowrap items-center w-max">
                                {[...partners, ...partners].map((partner, i) => (
                                    <div key={`${partner.name}-${i}`} className="flex items-center mx-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default group/partner">
                                        <img
                                            src={partner.src}
                                            alt={partner.name}
                                            className="h-6 w-auto object-contain transition-transform group-hover/partner:scale-110"
                                            style={{ transform: partner.scale ? `scale(${partner.scale})` : 'none' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Separator Line Below Logos */}
                        <div className="w-full max-w-[1240px] mx-auto px-6">
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                    </div>
                </section>

                {/* THE PROBLEM SECTION */}
                <section className="py-32 pt-48 px-6 relative z-10 bg-black -mt-32">
                    {/* Extended Smooth Transitions to reach the image slides */}
                    <div className="absolute top-0 left-0 w-full h-[1000px] bg-gradient-to-b from-transparent via-black/80 to-black -translate-y-full pointer-events-none"></div>
                    <div className="max-w-[1240px] mx-auto">
                        <div className="text-center mb-24 space-y-4">
                            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-4 group transition-all hover:border-red-500/20 hover:bg-red-500/[0.02] mx-auto">
                                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent opacity-80">
                                    THE PROBLEM
                                </span>
                            </div>
                            <p className="text-lg md:text-xl font-semibold text-white/60 tracking-tight">
                                Why Traditional CVs Can&apos;t Be Trusted
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.06] text-white">
                                Your work is real. <span className="text-white/30">Your proof isn’t.</span>
                            </h2>
                            <p className="text-white/40 text-base md:text-lg font-medium max-w-4xl mx-auto">
                                Hiring runs on claims, not proof. There is no reliable way to verify real work.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3">
                            {/* Card 1 */}
                            <div className="space-y-12 group pr-16 pb-16 md:pb-0">
                                <ProblemVideoCard
                                    idleSrc="/homepage/The%20Problem%20Asset/Broken%20Work%20History%20Idle.mp4?v=12"
                                    hoverSrc="/homepage/The%20Problem%20Asset/Broken%20Work%20History%20Mouse%20Click.mp4?v=6"
                                />
                                <div className="space-y-4 text-center">
                                    <h3 className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-bold text-xl">Broken Work History</h3>
                                    <p className="text-white/40 text-base leading-relaxed">
                                        Your experience is scattered across PDFs, portfolios, and links. No single source of truth.
                                    </p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="space-y-12 group px-16 border-l border-white/[0.05] pb-16 md:pb-0">
                                <ProblemVideoCard
                                    idleSrc="/homepage/The%20Problem%20Asset/Unverifiable%20Resumes%20Idle.mp4?v=4"
                                    hoverSrc="/homepage/The%20Problem%20Asset/Unverifiable%20Resumes%20Mouse%20Click.mp4?v=4"
                                />
                                <div className="space-y-4 text-center pt-2">
                                    <h3 className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-bold text-xl">Unverifiable Resumes</h3>
                                    <p className="text-white/40 text-base leading-relaxed">
                                        Without verifiable data, resumes become claims, not proof.
                                    </p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="space-y-12 group pl-16 border-l border-white/[0.05]">
                                <ProblemVideoCard
                                    idleSrc="/homepage/The%20Problem%20Asset/Signal%20Lost%20in%20Noise%20Idle.mp4?v=4"
                                    hoverSrc="/homepage/The%20Problem%20Asset/Signal%20Lost%20in%20Noise%20Mouse%20Click.mp4?v=4"
                                />
                                <div className="space-y-4 text-center">
                                    <h3 className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-bold text-xl">Signal Lost in Noise</h3>
                                    <p className="text-white/40 text-base leading-relaxed">
                                        Real talent gets buried. Hiring becomes guesswork.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* COMPETITIVE POSITIONING */}
                <section className="py-24 px-6 relative z-10 bg-black">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1240px] px-6 z-20">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                    <div className="max-w-[1240px] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                            {/* Left side: Network Diagram */}
                            <div className="lg:col-span-8 relative">
                                <div className="w-full">
                                    <SimpleDiagram />
                                </div>
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={() => setShowFullDiagram(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/40 hover:text-white/70 text-[11px] font-bold uppercase tracking-widest transition-all"
                                    >
                                        View full architecture
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                                            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Right side: Why ChainVolio copy */}
                            <div className="lg:col-span-4 space-y-8 pt-8">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.22em] bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">Why ChainVolio</span>
                                    </div>
                                    <p className="text-lg md:text-xl font-semibold text-white/60 tracking-tight">
                                        Traditional tools created isolated silos.
                                    </p>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.06]">
                                        One trust layer.<br />
                                        <span className="text-white/30">Everything connects.</span>
                                    </h2>
                                </div>
                                <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed">
                                    LinkedIn can't verify it. A PDF can't prove it. ChainVolio turns every Web3 contribution into a verifiable signal, permanently, without asking anyone's permission.
                                </p>
                            </div>
                        </div>

                        {/* Bottom callouts — vs competitors */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-24 pt-12">
                            {[
                                {
                                    against: "Beyond Profiles",
                                    color: "#60a5fa",
                                    point: "LinkedIn shows who you are. ChainVolio proves what you’ve done. Every contribution is backed by verifiable signals, not just self-reported claims.",
                                },
                                {
                                    against: "From Claims to Proof",
                                    color: "#14F195",
                                    point: "Traditional resumes rely on trust. ChainVolio anchors work history with attestations and on-chain records, making every entry independently verifiable.",
                                },
                                {
                                    against: "A Portable Trust Layer",
                                    color: "#a78bfa",
                                    point: "ChainVolio works across platforms. Your verified work history can be shared anywhere, including LinkedIn, as a trusted source of proof.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3 group hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]"
                                            style={{ color: item.color + "bb" }}>{item.against}</span>
                                    </div>
                                    <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/55 transition-colors">
                                        {item.point}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Full Diagram Modal */}
                {showFullDiagram && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md"
                        onClick={() => setShowFullDiagram(false)}
                    >
                        <div
                            className="relative w-full max-w-6xl bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/40">Full Architecture</span>
                                </div>
                                <button
                                    onClick={() => setShowFullDiagram(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                            {/* Diagram */}
                            <div className="p-6 overflow-x-auto">
                                <div className="min-w-[800px]">
                                    <CompetitiveNetworkDiagram />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TRUST TRANSFORMATION — Noise to Signal */}
                <section className="relative z-10 bg-black overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1240px] px-6 z-20">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>

                    {/* ── Top text block ── */}
                    <div className="max-w-[1240px] mx-auto px-6 pt-28 pb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                        <div className="space-y-4 max-w-xl">
                            {/* badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.22em] bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">Signal vs Noise</span>
                            </div>
                            <p className="text-lg md:text-xl font-semibold text-white/60 tracking-tight">
                                Why Web3 Needs Verifiable Work History
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                                From Noise to<br />
                                <span className="text-white/30">Verifiable Signal</span>
                            </h2>
                        </div>
                        <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed max-w-xl md:text-right">
                            Work history is fragmented and impossible to verify.<br />
                            ChainVolio transforms scattered contributions<br />
                            into a single, verifiable identity.
                        </p>
                    </div>

                    {/* ── Full-bleed animation canvas ── */}
                    <div className="relative w-full h-[580px]">
                        <SignalNoiseVisual />

                        {/* Radial vignette — lines fade at edges */}
                        <div className="absolute inset-0 pointer-events-none z-10"
                            style={{ background: "radial-gradient(ellipse 68% 62% at 50% 50%, transparent 35%, #000 92%)" }}
                        />

                        {/* Top + bottom black bleed so canvas merges with section bg */}
                        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10"
                            style={{ background: "linear-gradient(to bottom, black, transparent)" }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
                            style={{ background: "linear-gradient(to top, black, transparent)" }}
                        />

                        {/* ── Central Logo Node ── */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <div className="relative flex items-center justify-center">
                                {/* Outer pulse rings */}
                                <motion.div
                                    animate={{ scale: [1, 3.2], opacity: [0.12, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeOut", delay: 0 }}
                                    className="absolute w-16 h-16 rounded-full border border-white/20"
                                />
                                <motion.div
                                    animate={{ scale: [1, 2.2], opacity: [0.18, 0] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                                    className="absolute w-16 h-16 rounded-full border border-white/25"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1.4 }}
                                    className="absolute w-16 h-16 rounded-full border border-white/30"
                                />

                                {/* Logo container */}
                                <motion.div
                                    animate={{ opacity: [0.75, 1, 0.75] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative w-16 h-16 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.06)]"
                                >
                                    <Image
                                        src="/logo.png"
                                        alt="ChainVolio"
                                        width={36}
                                        height={36}
                                        className="opacity-80"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* ── Bottom outcome row — the answer to the problems above ── */}
                    <div className="max-w-[1240px] mx-auto px-6 pb-24">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.05]">
                            {[
                                {
                                    label: "One Unified Profile",
                                    desc: "Every contribution, from grants to project roles, lives in a single portable identity you fully own.",
                                    accent: "#14F195",
                                },
                                {
                                    label: "On-Chain Attestation",
                                    desc: "Each entry is cryptographically signed by the issuing org. No more unverifiable claims.",
                                    accent: "#60a5fa",
                                },
                                {
                                    label: "Verified Signal",
                                    desc: "Recruiters see proof, not promises. Real contributors rise above the noise automatically.",
                                    accent: "#a78bfa",
                                },
                            ].map((item, i) => (
                                <div key={i} className="px-8 py-7 bg-black group hover:bg-white/[0.02] transition-colors duration-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                                            style={{ background: item.accent + "60" }}
                                        />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300"
                                            style={{ color: item.accent + "99" }}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-sm leading-relaxed group-hover:text-white/45 transition-colors duration-300">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </section>

                <section id="solution" className="pt-24 pb-32 px-6 relative z-10 bg-black">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1240px] px-6 z-20">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-black to-transparent pointer-events-none z-30"></div>

                    <div className="max-w-[1200px] mx-auto relative">

                        {/* ── Header: compact, left + right split ── */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                                    <span className="text-[10px] font-black uppercase tracking-[0.22em] bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                                        The Solution
                                    </span>
                                </div>
                                <p className="text-lg md:text-xl font-semibold text-white/60 tracking-tight">
                                    Build a Verifiable Web3 Resume with On-Chain Proof
                                </p>
                                <h3 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-white tracking-tight leading-[1.06]">
                                    Build a reputation<br /><span className="text-white/30">that travels.</span>
                                </h3>
                            </div>
                            <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed max-w-xs md:text-right">
                                Turn your work into verifiable proof that anyone can trust. Transparent, portable, impossible to fake.
                            </p>
                        </div>

                        {/* ── Interactive Flow ── */}
                        <div className="relative w-full max-w-[860px] mx-auto mb-4">
                            <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/4 to-purple-500/4 blur-[80px] pointer-events-none" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/15 mb-4 text-center">
                                Hover each step to see the flow
                            </p>
                            <VerifiableWorkHistoryFlow />
                        </div>

                        {/* ── 3 compact attributes — replaces the old text card ── */}
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-20 mt-6">
                            {[
                                { icon: ShieldCheck, label: "On-Chain Proof",       color: "#14F195" },
                                { icon: CheckCircle2, label: "Instant Verification", color: "#60a5fa" },
                                { icon: Lock,         label: "Impossible to Fake",  color: "#a78bfa" },
                            ].map(({ icon: Icon, label, color }, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                                    <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: color + "bb" }}>
                                        {label}
                                    </span>
                                    {i < 2 && <span className="hidden md:block ml-8 w-px h-3 bg-white/10" />}
                                </div>
                            ))}
                        </div>

                        {/* ── UI Mockup ── */}
                        <div className="relative h-[650px] w-full max-w-[1100px] mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 bg-emerald-500/4 blur-[120px] rounded-full opacity-40 pointer-events-none" />
                            <div className="relative w-full h-full group">
                                <div className="w-full h-full bg-[#0a0a0a] rounded-3xl border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-700 text-left">
                                    <MockProfileUI />
                                </div>
                                <div className="absolute -right-4 md:-right-8 top-1/4 z-40 transition-all duration-1000 group-hover:translate-y-[-15px] group-hover:translate-x-6 group-hover:rotate-2">
                                    <div className="[perspective:1500px]">
                                        <div className="shadow-[0_40px_80px_rgba(0,0,0,0.7)] rounded-2xl [transform:rotateY(-8deg)rotateX(2deg)]">
                                            <FloatingVerificationCard />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* PRODUCT SECTION */}
                <section className="py-32 px-6 relative z-10 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1240px] px-6 z-20">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>

                    <div className="max-w-[1200px] mx-auto space-y-48 relative z-10">
                        
                        {/* BLOCK 1 — ATTESTATION */}
                        <AttestationBlock />

                        {/* Divider Text */}
                        <div className="flex items-center justify-center gap-8 opacity-20">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.5em] whitespace-nowrap">From proof to hiring decisions</span>
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white"></div>
                        </div>

                        {/* BLOCK 2 — HIRING */}
                        <HiringBlock />
                    </div>
                </section>

                <Web3ResumeSection onCtaClick={() => setIsWalletModalOpen(true)} />

                {/* 5. FINAL CTA */}
                <section className="relative py-48 px-6 overflow-hidden bg-black">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1240px] px-6 z-20">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                    {/* Subtle grid */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                        backgroundSize: "88px 88px"
                    }} />
                    {/* Radial glow center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[480px] rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at center, rgba(153,69,255,0.12) 0%, rgba(20,241,149,0.06) 45%, transparent 70%)" }}
                    />
                    {/* Top + bottom fade */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

                    <div className="relative max-w-[760px] mx-auto text-center z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.06]">
                                 Start Building Your<br />
                                 <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">Verifiable Web3 Resume.</span>
                            </h2>
                            <p className="text-white/40 text-base md:text-lg mb-12 max-w-lg mx-auto leading-relaxed font-medium">
                                Turn your work experience into verifiable on-chain proof. Build a resume that recruiters can instantly trust.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
                                <button
                                    onClick={() => setIsWalletModalOpen(true)}
                                    className="premium-shimmer-button w-full sm:w-auto px-10 py-4 bg-white text-black font-bold text-base rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                                >
                                    Create Your Profile
                                </button>
                                <Link
                                    href="/hiring/create"
                                    className="w-full sm:w-auto px-10 py-4 bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-base rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
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
                            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-white/40 hover:text-white/90 transition-colors text-2xl z-20">×</button>
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
    const canvasRef  = useRef<HTMLCanvasElement>(null);
    const mouseRef   = useRef({ x: -9999, y: -9999, active: false });
    const rafRef     = useRef<number>(0);
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

        let W = 0, H = 0;

        // Three layers of rays for depth — dense short inner, mid, long sparse outer
        const makeLayers = () => {
            const layerA = Array.from({ length: 100 }, (_, i) => ({
                baseAngle:   (i / 100) * Math.PI * 2 + Math.random() * 0.12,
                length:      40 + Math.random() * 80,
                wobbleAmp:   0.04 + Math.random() * 0.06,
                wobbleSpeed: 0.6  + Math.random() * 1.2,
                wobblePhase: Math.random() * Math.PI * 2,
                opacity:     0.18 + Math.random() * 0.30,
                thickness:   0.5  + Math.random() * 0.5,
                dotR:        0.6  + Math.random() * 0.8,
                iconIdx:     -1
            }));

            const layerB = Array.from({ length: 140 }, (_, i) => ({
                baseAngle:   (i / 140) * Math.PI * 2 + Math.random() * 0.15,
                length:      150 + Math.random() * 180,
                wobbleAmp:   0.03 + Math.random() * 0.07,
                wobbleSpeed: 0.3  + Math.random() * 0.8,
                wobblePhase: Math.random() * Math.PI * 2,
                opacity:     0.08 + Math.random() * 0.20,
                thickness:   0.4  + Math.random() * 0.45,
                dotR:        0.8  + Math.random() * 1.2,
                iconIdx:     -1
            }));

            const layerC = Array.from({ length: 100 }, (_, i) => ({
                baseAngle:   (i / 100) * Math.PI * 2 + Math.random() * 0.2,
                length:      320 + Math.random() * 230,
                wobbleAmp:   0.02 + Math.random() * 0.04,
                wobbleSpeed: 0.2  + Math.random() * 0.5,
                wobblePhase: Math.random() * Math.PI * 2,
                opacity:     0.05 + Math.random() * 0.12,
                thickness:   0.3  + Math.random() * 0.35,
                dotR:        1.0  + Math.random() * 1.5,
                iconIdx:     -1
            }));

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
            // Place evenly on Layer C (far distance), offset angle so they don't align perfectly with Layer B
            assignIconsToLayer(layerC, [10, 11, 12, 13, 14], Math.PI / 5);

            return [...layerA, ...layerB, ...layerC];
        };

        let rays = makeLayers();

        const resize = () => {
            const dpr  = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            W = rect.width;
            H = rect.height;
            canvas.width  = W * dpr;
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

            const mx      = mouseRef.current.x;
            const my      = mouseRef.current.y;
            const mActive = mouseRef.current.active;
            const mAngle  = Math.atan2(my - oy, mx - ox);
            const mNorm   = mActive
                ? Math.min(Math.hypot(mx - ox, my - oy) / (Math.min(W, H) * 0.45), 1)
                : 0;

            rays.forEach(ray => {
                const wobble = Math.sin(t * ray.wobbleSpeed + ray.wobblePhase) * ray.wobbleAmp;

                let scatter = 0;
                if (mActive && mNorm > 0.04) {
                    const da  = ray.baseAngle - mAngle;
                    const nda = Math.atan2(Math.sin(da), Math.cos(da));
                    scatter   = Math.exp(-nda * nda * 5) * mNorm * 0.5;
                }

                const angle = ray.baseAngle + wobble + scatter;
                const lMult = 1 + (mNorm * Math.exp(-Math.abs(Math.atan2(Math.sin(ray.baseAngle - mAngle), Math.cos(ray.baseAngle - mAngle))) * 1.8) * 0.3);
                const len   = ray.length * lMult;

                const ex = ox + Math.cos(angle) * len;
                const ey = oy + Math.sin(angle) * len;

                // Draw Line
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.lineTo(ex, ey);
                ctx.strokeStyle = `rgba(255,255,255,${ray.opacity})`;
                ctx.lineWidth   = ray.thickness;
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
