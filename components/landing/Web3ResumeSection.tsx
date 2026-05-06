"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck, ArrowRight, MapPin, Clock, Globe, Github,
    ExternalLink, Check, FileText, Image as ImageIcon, Award,
    BadgeCheck, Star, Settings, Mail, Link as LinkIcon, Instagram,
    MessageSquare, Linkedin
} from "lucide-react";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const mockReceipts = [
    {
        id: "1", role: "Senior Protocol Engineer", org: "Nexus Protocol",
        dateRange: "Jan 2024 – Mar 2025, 1y 3m", status: "Attested",
        attesterInitials: "MC", attesterName: "Marcus Chen", attesterRole: "CTO",
        desc: "Core systems development and parallel transaction optimization for the Nexus mainnet.",
        impact: ["Reduced tx latency 40%", "Shipped 3 mainnet upgrades"],
        skills: ["Rust", "Solana", "Anchor"], tx: "5k2R...j8Wq",
    },
    {
        id: "2", role: "Smart Contract Auditor", org: "Apex Security Guild",
        dateRange: "Jun 2023 – Dec 2023, 7m", status: "Attested",
        attesterInitials: "SK", attesterName: "Sarah Kim", attesterRole: "Lead Auditor",
        desc: "Security audit of DeFi protocol suite. Identified 3 critical vulnerabilities.",
        impact: ["Found 3 critical vulns", "Audited $200M TVL"],
        skills: ["Security", "DeFi", "Solidity"], tx: "9xPq...m3Lw",
    },
];

const mockPortfolio = [
    { id: "p1", label: "Nexus Block Explorer", color: "#14F195" },
    { id: "p2", label: "Staking UI v2", color: "#60a5fa" },
    { id: "p3", label: "Audit Dashboard", color: "#a78bfa" },
];

// ─── BACKGROUND DASHBOARD PANELS ────────────────────────────────────────────
function DashboardPanels() {
    return (
        <div className="relative w-[1400px] h-full text-[9px] font-sans flex-shrink-0">
            {/* 1. Recent Attestations (Top Left) */}
            <div className="absolute top-[5%] left-[2%] w-[280px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Recent Attestations</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="space-y-4">
                    {[
                        { name: "Nexus Protocol", time: "2h ago", msg: "Verified your role as Senior Protocol Engineer via on-chain signature.", color: "#34d399" },
                        { name: "Solana Fnd", time: "1d ago", msg: "Issued a builder credential for your participation in the Grizzlython hackathon.", color: "#a78bfa" },
                        { name: "Superteam", time: "3d ago", msg: "Endorsed your Proof of Work submission for 'Blinks Integration'.", color: "#f59e0b" },
                    ].map((m, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" style={{ background: m.color + "25", border: `1px solid ${m.color}35` }}>
                                <span className="flex items-center justify-center h-full text-[8px] font-bold" style={{ color: m.color }}>{m.name[0].toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-bold text-white/50 text-[10px] truncate">{m.name}</span>
                                    <span className="text-white/20 text-[9px] flex-shrink-0">{m.time}</span>
                                </div>
                                <p className="text-white/30 leading-relaxed text-[9px]">{m.msg}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Verifiable Timeline (Top Center) */}
            <div className="absolute top-[2%] left-[30%] w-[320px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Verifiable Timeline</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-[9px] text-white/20 font-bold">2023 - 2024</div>
                    <div className="text-[9px] text-white/20 font-bold">2024 - Present</div>
                </div>
                <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-emerald-500/20 w-[80%] flex items-center justify-between">
                        <p className="text-emerald-400/80 font-bold text-[9px]">Smart Contract Dev</p>
                        <p className="text-emerald-500/60 text-[8px] flex items-center gap-1">✓ Verified</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] w-[90%] flex items-center justify-between">
                        <p className="text-white/60 font-bold text-[9px]">Senior Protocol Engineer</p>
                        <p className="text-amber-500/60 text-[8px]">Pending Audit</p>
                    </div>
                </div>
            </div>

            {/* 3. Hiring Inbox (Top Right) */}
            <div className="absolute top-[4%] right-[8%] w-[260px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Hiring Inbox</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="space-y-4">
                    {[
                        { name: "Jump Crypto", action: "viewed your verifiable CV", time: "2h ago", color: "#60a5fa" },
                        { name: "Paradigm", action: "requested an interview for Lead Rust Dev", time: "3h ago", color: "#a78bfa" },
                        { name: "Chainvolio", action: "matched you with 3 open roles", time: "5h ago", color: "#f59e0b" },
                    ].map((t, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: t.color + "20", border: `1px solid ${t.color}30` }}>
                                <span className="flex items-center justify-center h-full text-[8px] font-bold" style={{ color: t.color }}>{t.name[0]}</span>
                            </div>
                            <div>
                                <span className="text-white/50 font-bold text-[9px]">{t.name}</span>
                                <span className="text-white/20 text-[9px]"> {t.action}</span>
                                <p className="text-white/15 text-[8px] mt-0.5">{t.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Proof of Work (Mid Left) */}
            <div className="absolute top-[45%] left-[2%] w-[220px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Proof of Work</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="space-y-3">
                    {[
                        { name: "Solana Pay Integration", status: "Verified", icon: "✓", statCol: "text-emerald-500/50" },
                        { name: "DeFi Liquidity Vault", status: "Audited", icon: "🔒", statCol: "text-blue-400/50" },
                        { name: "Parallel Execution Engine", status: "Peer Reviewed", icon: "👁", statCol: "text-fuchsia-400/50" },
                        { name: "Open Source Libs", status: "Github Linked", icon: "🔗", statCol: "text-white/30" },
                    ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] grayscale opacity-50">{p.icon}</span>
                                <span className="text-white/40 text-[9px]">{p.name}</span>
                            </div>
                            <span className={`text-[8px] ${p.statCol}`}>{p.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Credentials (Mid Right) */}
            <div className="absolute top-[35%] right-[2%] w-[240px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Identity & Credentials</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="mb-4">
                    <span className="text-emerald-500/40 text-[9px]">All systems synced ∨</span>
                </div>
                <div className="space-y-4">
                    {[
                        { dot: true, title: "Identity Provider", sub: "Civic Pass Linked", time: "Active" },
                        { dot: true, title: "Code Contributions", sub: "GitHub Commits Synced", time: "Just now" },
                        { dot: false, title: "Social Graph", sub: "X (Twitter) Verified", time: "Active" },
                    ].map((n, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border border-white/10 flex items-center justify-center">
                                <span className="text-emerald-500/50 text-[8px]">✓</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-white/30 text-[9px]">{n.title}</p>
                                <p className="text-white/50 text-[9px] font-bold">{n.sub}</p>
                                <p className="text-white/15 text-[8px]">{n.time}</p>
                            </div>
                            {n.dot && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* 6. Profile Analytics (Bottom Left) */}
            <div className="absolute bottom-[8%] left-[8%] w-[200px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Profile Analytics</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div>
                    <p className="text-white/20 text-[9px] mb-1">Total Profile Views</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-white/70 text-[28px] font-black leading-none">1.2K</span>
                        <span className="text-emerald-500/70 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">+15.2%</span>
                    </div>
                </div>
            </div>

            {/* 7. CV Score Activity (Bottom Center) */}
            <div className="absolute bottom-[5%] left-[30%] w-[240px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">CV Score Breakdown</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 text-[12px]">⭐</span>
                    </div>
                    <div>
                        <p className="text-white/20 text-[9px]">Score increased by +15 points</p>
                        <p className="text-white/50 text-[10px] font-medium mt-0.5">Verified Role at Nexus Protocol</p>
                        <p className="text-white/15 text-[8px] mt-1">On-chain verification completed</p>
                    </div>
                </div>
            </div>

            {/* 8. Pending Verifications (Bottom Mid-Right) */}
            <div className="absolute bottom-[5%] right-[32%] w-[220px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Verifications</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-amber-500/50"></div>
                            <span className="text-white/40 text-[9px]">Previous Employer Sig</span>
                        </div>
                        <span className="text-amber-500/50 text-[8px]">Pending</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-emerald-500/50 bg-emerald-500/20"></div>
                            <span className="text-white/40 text-[9px]">Wallet Snapshot</span>
                        </div>
                        <span className="text-emerald-500/50 text-[8px]">Confirmed</span>
                    </div>
                </div>
            </div>

            {/* 9. Activity Heatmap (Bottom Right) */}
            <div className="absolute bottom-[2%] right-[8%] w-[240px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 text-[10px]">‹</span>
                    <span className="text-white/50 font-bold text-[10px]">On-Chain Activity</span>
                    <span className="text-white/30 text-[10px]">›</span>
                </div>
                <div className="grid grid-cols-7 gap-y-2 text-center mb-2">
                    {["S","M","T","W","T","F","S"].map((d, i) => (
                        <div key={i} className="text-[8px] text-white/20 font-bold">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-2 text-center">
                    {[...Array(4)].map((_, i) => <div key={`e${i}`} className="w-4 h-4 mx-auto rounded-sm bg-white/[0.02]" />)}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                        const intensity = d % 7 === 0 ? "bg-emerald-500/80" : d % 3 === 0 ? "bg-emerald-500/40" : "bg-white/[0.02]";
                        return (
                            <div key={d} className={`w-4 h-4 mx-auto rounded-sm ${intensity} border border-white/[0.05]`} />
                        );
                    })}
                </div>
            </div>

            {/* 10. Trust Graph (Mid Center-Right) */}
            <div className="absolute top-[38%] left-[55%] w-[260px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Trust & Reputation</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                        <div className="flex items-center gap-2">
                            <span className="text-white/40 text-[9px]">Direct Attestations</span>
                        </div>
                        <span className="text-emerald-500/70 text-[9px] font-mono">12</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                        <div className="flex items-center gap-2">
                            <span className="text-white/40 text-[9px]">Endorsed Skills</span>
                        </div>
                        <span className="text-emerald-500/70 text-[9px] font-mono">8</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                        <div className="flex items-center gap-2">
                            <span className="text-white/40 text-[9px]">Network Connections</span>
                        </div>
                        <span className="text-white/70 text-[9px] font-mono">45</span>
                    </div>
                </div>
            </div>

            {/* 11. Connected Wallets (Top Center-Right) */}
            <div className="absolute top-[12%] left-[56%] w-[220px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Connected Wallets</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-1.5 before:w-px before:bg-white/[0.05]">
                    {[
                        { wallet: "Phantom (Primary)", pubkey: "5xAr...b9Kf", status: "Verified", color: "text-emerald-500" },
                        { wallet: "Backpack", pubkey: "9YxQ...m2Lp", status: "Connected", color: "text-white/50" },
                    ].map((d, i) => (
                        <div key={i} className="flex items-start gap-3 relative z-10">
                            <div className="w-3 h-3 rounded-full bg-[#0c0c0c] border-2 border-white/20 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white/40 text-[9px] font-bold">{d.wallet}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-white/20 text-[8px] font-mono">{d.pubkey}</span>
                                    <span className={`${d.color} text-[8px]`}>{d.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 12. Skill Endorsements (Mid-Right) */}
            <div className="absolute top-[60%] right-[26%] w-[250px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Skill Endorsements</span>
                    <span className="text-white/15 text-[10px]">•••</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-500 text-[10px]">✓</span>
                            <span className="text-white/40 text-[9px]">Rust Development</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-white/30 text-[8px]">Endorsed by 5 peers</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-500 text-[10px]">✓</span>
                            <span className="text-white/40 text-[9px]">Smart Contracts</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-amber-500/60 text-[8px]">Verified via Hackathon</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 13. Profile Strength (Bottom Left Center) - Adjusted slightly up to avoid Analytics */}
            <div className="absolute top-[62%] left-[18%] w-[180px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/30 font-bold tracking-wide text-[10px]">Profile Strength</span>
                    <span className="text-emerald-500/70 text-[9px] font-bold">Expert</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/50 w-[85%] rounded-full" />
                </div>
            </div>

            {/* 14. Global Rank (Mid Center-Left) */}
            <div className="absolute top-[32%] left-[28%] w-[160px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-white/30 font-bold tracking-wide text-[9px] mb-2">Global Rank</span>
                    <span className="text-emerald-400 text-[24px] font-black leading-none">Top 1%</span>
                    <span className="text-white/20 text-[8px] mt-1">among Rust Devs</span>
                </div>
            </div>

            {/* 15. Latest Badge (Center) */}
            <div className="absolute top-[52%] left-[40%] w-[180px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[14px]">🏆</span>
                </div>
                <div>
                    <span className="text-white/30 font-bold text-[9px] block">Latest Badge</span>
                    <span className="text-white/60 font-bold text-[10px] block mt-0.5">Hackathon Winner</span>
                </div>
            </div>

            {/* 16. Score Trend (Top Mid-Left) - Adjusted to avoid Timeline */}
            <div className="absolute top-[22%] left-[44%] w-[150px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <span className="text-white/30 font-bold text-[9px] mb-2 block">Score Trend</span>
                <div className="flex items-end gap-1 h-[30px]">
                    {[40, 60, 45, 80, 65, 90, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>

            {/* 17. Bio Snippet (Mid-Right Edge) - Adjusted to avoid Skill Endorsements */}
            <div className="absolute top-[55%] right-[10%] w-[200px] p-4 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl">
                <span className="text-white/20 text-[18px] font-serif leading-none block mb-1">"</span>
                <p className="text-white/40 text-[9px] italic leading-relaxed">
                    Building verifiable systems and scalable smart contracts for the next generation of DeFi.
                </p>
            </div>

            {/* 18. Network Metrics (Top Right Center) - Adjusted up to avoid Connected Wallets */}
            <div className="absolute top-[2%] right-[28%] w-[150px] p-3 rounded-[16px] bg-[#0c0c0c] border border-white/[0.05] shadow-2xl flex justify-between items-center">
                <span className="text-white/30 font-bold text-[9px]">Solana TPS</span>
                <span className="text-emerald-500/70 text-[9px] font-mono">2,840</span>
            </div>
        </div>
    );
}

// ─── BACKGROUND DASHBOARD (Animated Marquee) ────────────────────────────────
function DashboardBg() {
    return (
        <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
            <motion.div
                className="flex h-full w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            >
                {/* Render the set of panels twice to create an infinite seamless loop */}
                <DashboardPanels />
                <DashboardPanels />
            </motion.div>

            {/* Gradient Masks for Edge Fade Out */}
            <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-black to-transparent z-10" />
        </div>
    );
}

// ─── CV CARD MOCKUP (reference-matched) ─────────────────────────────────────
function PublicCVCardMockup() {
    return (
        <div className="relative w-[850px] mx-auto overflow-visible scale-[0.32] min-[380px]:scale-[0.36] min-[440px]:scale-[0.42] sm:scale-[0.6] md:scale-[0.75] lg:scale-100 origin-center">
            {/* Outer ambient glow */}
            <div className="absolute -inset-20 bg-white/[0.03] blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* MAIN CV CARD COMPONENT (Structure from official app/cv/[wallet]/page.tsx) */}
            <div className="relative flex flex-col justify-between min-h-[440px] p-10 rounded-[32px] overflow-hidden group w-full text-left">
                {/* Animated silver gradient border */}
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-slate-400/20 via-white/30 to-slate-400/20 opacity-60 animate-pulse pointer-events-none"></div>

                {/* Main Card Background: Very Dark Grey */}
                <div className="absolute inset-0 rounded-[32px] bg-[#0d0d0d] border border-white/10 pointer-events-none"></div>

                {/* Top-Center Spotlight Effect */}
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-[32px]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[120%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    {/* Diagonal lightning shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-lightning-shine opacity-50"></div>
                </div>

                {/* Bottom black gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

                {/* 3D Rim Light */}
                <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),inset_1px_0_0_0_rgba(255,255,255,0.05)] pointer-events-none z-30" />

                {/* Outer glow */}
                <div className="absolute -inset-[2px] rounded-[32px] bg-gradient-to-br from-slate-400/20 via-white/10 to-slate-500/20 opacity-50 group-hover:opacity-80 transition-opacity duration-500 -z-10 blur-xl pointer-events-none"></div>

                {/* Top-Right Badges/Score */}
                <div className="absolute top-10 right-10 z-50 flex flex-col gap-8 items-center">
                    {/* Verified Rosette Mock */}
                    <div className="relative group/vcheck">
                        <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <div className="relative w-8 h-8 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-full h-full fill-none stroke-emerald-400 stroke-[1.5]">
                                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" />
                                </svg>
                                <Check className="absolute w-4 h-4 text-emerald-400" strokeWidth={4} />
                            </div>
                        </div>
                    </div>

                    {/* CV Score */}
                    <div className="flex flex-col items-center justify-center group/score">
                        <span className="text-[48px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#a855f7] via-fuchsia-400 to-blue-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                            98
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a855f7]/80 mt-2">CV Score</span>
                    </div>
                </div>

                {/* Content wrapper - Forced flex-row for desktop fidelity on all screens */}
                <div className="relative flex flex-row items-start gap-16 w-full z-40 flex-1">
                    {/* Avatar Column */}
                    <div className="flex-shrink-0 flex flex-col items-start">
                        <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl mb-6 bg-slate-800">
                            <img
                                src="/homepage/cv%20example.png"
                                alt="Alex Rivera"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div className="space-y-3 text-slate-400">
                            <div className="flex items-center gap-2 text-[14px] font-medium">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                Canada
                            </div>
                            <div className="flex items-center gap-2 text-[12px] font-mono text-slate-500">
                                <Clock className="w-4 h-4" />
                                GMT-4
                            </div>
                            <div className="pt-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Availability</p>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                                    Full-time
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 flex flex-col space-y-5">
                        {/* Looking For */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-max">
                            <Globe className="w-4 h-4" />
                            <span className="text-[13px] font-bold">Open to remote as Protocol Engineer</span>
                        </div>

                        <div>
                            <h3 className="text-[44px] font-bold text-white tracking-tight leading-none mb-2">Alex Rivera</h3>
                            <p className="text-[18px] font-medium text-slate-400">Senior Engineer at Nexus Protocol</p>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: "BUILDER", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <BadgeCheck className="w-3.5 h-3.5" /> },
                                { label: "AUDITOR", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                                { label: "GENESIS", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: <Star className="w-3.5 h-3.5 fill-amber-400" /> },
                            ].map(b => (
                                <div key={b.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${b.bg} ${b.border} text-[10px] font-black uppercase tracking-widest ${b.color}`}>
                                    {b.icon}
                                    {b.label}
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                            {["Rust", "Solidity", "Anchor Framework", "Cryptography", "DeFi Security"].map(s => (
                                <span key={s} className="px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[13px] font-medium text-white/60">
                                    {s}
                                </span>
                            ))}
                        </div>

                        <p className="text-[15px] text-slate-300 leading-relaxed font-medium max-w-[500px]">
                            Core Protocol Engineer building high-performance blockchain infrastructure. Specialized in parallel execution engines and protocol security.
                        </p>

                        {/* Footer area inside card */}
                        <div className="pt-6 mt-auto border-t border-white/[0.05] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {[Github, Linkedin, Mail, Globe].map((Icon, i) => (
                                    <div key={i} className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-500">
                                    FwHt...GcMv
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono">
                                    <span className="text-slate-600">ID</span>
                                    <span className="text-slate-400 font-black ml-1">#00001</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function Web3ResumeSection({ onCtaClick }: { onCtaClick: () => void }) {
    return (
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative z-10 bg-black overflow-hidden">
            {/* Elegant thin line separator constrained to content width */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1240px] px-6 z-20">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_65%)] pointer-events-none" />

            <div className="max-w-[1240px] mx-auto space-y-4 sm:space-y-6 lg:space-y-12 relative">

                {/* ── HEADER ──────────────────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.22em] bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">WEB3 RESUME</span>
                        </div>
                        <div className="space-y-3">
                            <p className="text-lg md:text-xl font-normal text-white/60 tracking-tight">What is a Web3 Resume?</p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                                A resume you don't<br /><span className="text-white/30">have to explain.</span>
                            </h2>
                            <div className="h-0.5 w-full bg-white/15" />
                        </div>
                    </div>
                    <div className="lg:max-w-xs pb-2">
                        <p className="text-white/40 text-sm md:text-lg font-normal max-w-2xl leading-relaxed">
                            Turn your work into verifiable on-chain proof. Build a resume that recruiters can instantly trust.
                        </p>
                    </div>
                </div>

                {/* ── SHOWCASE: Seamless blended container ─── */}
                <div className="relative w-full min-h-[350px] sm:min-h-[450px] lg:min-h-[900px] bg-transparent overflow-hidden flex flex-col justify-center">

                    {/* Background: blurred dashboard grid */}
                    <div className="absolute inset-0 opacity-40 select-none pointer-events-none">
                        <DashboardBg />
                    </div>

                    {/* Edge vignette — softer, only darkens outer edges */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 40%, black 95%)" }}
                    />
                    {/* Bottom fade — reduced on mobile to prevent covering the card */}
                    <div className="absolute inset-x-0 bottom-0 h-16 sm:h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
                    {/* Top fade — reduced on mobile */}
                    <div className="absolute inset-x-0 top-0 h-16 sm:h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />

                    {/* Foreground: CV Card floating on top */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 pointer-events-none gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 32, scale: 0.97 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            className="w-full pointer-events-auto flex items-center justify-center overflow-visible"
                        >
                            <PublicCVCardMockup />
                        </motion.div>

                        {/* View Live CV button — floats directly below the card */}
                        <motion.a
                            href="https://www.chainvolio.xyz/vivian-maier/27"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                            className="pointer-events-auto group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200"
                        >
                            <span className="text-xs font-bold text-white/50 group-hover:text-white/90 transition-colors uppercase tracking-[0.18em]">View Live CV</span>
                            <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-white/70 transition-colors" />
                        </motion.a>
                    </div>
                </div>

                {/* ── DESCRIPTION GRID (Now slideable boxes) ────────────────── */}
                <div className="pt-10 border-t border-white/5">
                    <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 sm:gap-6 pb-4">
                        {[
                            { 
                                title: "On-Chain History", 
                                desc: "Every project and achievement is permanently anchored to your wallet as a tamper-proof record.",
                                icon: Clock,
                                color: "#60a5fa"
                            },
                            { 
                                title: "Cryptographic Proof", 
                                desc: "Contributions are proven through attestations cryptographically signed by real organizations and peers.",
                                icon: ShieldCheck,
                                color: "#14F195"
                            },
                            { 
                                title: "Instant Verification", 
                                desc: "Recruiters can instantly trust your experience without manual checks or reference calls.",
                                icon: BadgeCheck,
                                color: "#a78bfa"
                            },
                        ].map((item, i) => (
                            <div 
                                key={i} 
                                className="flex-shrink-0 w-[280px] sm:w-[calc(33.333%-16px)] snap-center p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 bg-white/[0.03] border border-white/5 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                                </div>
                                <h4 className="text-white/90 font-bold text-lg mb-3 tracking-tight">{item.title}</h4>
                                <p className="text-white/30 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── MINI BENEFITS (2x2 on mobile) ────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { title: "Verifiable", icon: ShieldCheck },
                        { title: "Portable", icon: ArrowRight },
                        { title: "Trustless", icon: Award },
                        { title: "Tamper-proof", icon: ShieldCheck },
                    ].map((bullet, i) => (
                        <div key={i} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group cursor-default">
                            <bullet.icon className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                            <span className="text-xs font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-widest">{bullet.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
