"use client";
 
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck, Star, ShieldCheck, Globe, Github, Linkedin, Twitter, Building2, Users, ArrowRight, Briefcase } from "lucide-react";

export interface TalentProfile {
    walletAddress: string;
    authUid?: string;           // set for Google-login orgs; drives /org/[authUid] routing
    displayName: string;
    bio?: string;
    skills: string[];
    workPreference: string[];
    avatarUrl?: string;
    role?: string;
    organization?: string;
    cardNumber?: number;
    country?: string;
    totalScore: number;
    trustScore?: number;        // populated for org cards; equals totalScore for orgs
    level: string;
    isVerified: boolean;
    verifierTier: number;
    verificationType?: string;
    receiptCount: number;
    successRate: number;
    status: "available" | "top_rated" | "featured" | null;
    // Social links
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    // Org-specific fields
    isOrg?: boolean;
    endorsedCount?: number;
    hiringCount?: number;
    attestationsGivenCount?: number;
}

const STATUS_CONFIG = {
    available: {
        label: "Available",
        className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        dot: "bg-emerald-400",
    },
    top_rated: {
        label: "Top Rated",
        className: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
        dot: "bg-indigo-400",
    },
    featured: {
        label: "Featured",
        className: "bg-amber-200/10 text-amber-200/60 border border-amber-200/20",
        dot: "bg-amber-200/60",
    },
};

export function TalentCard({ talent, variant = "default" }: { talent: TalentProfile, variant?: "default" | "square" }) {
    const visibleSkills = talent.skills.slice(0, 3);
    const isOrg = talent.verificationType === 'Company / Organization' || talent.verificationType === 'Community / DAO';
    // Google-login orgs use /org/[authUid]; wallet-based users use /cv/[wallet]
    const profileUrl = talent.authUid ? `/org/${talent.authUid}` : `/cv/${talent.walletAddress}`;
    const shortWallet = talent.walletAddress?.startsWith('gauth:') || !talent.walletAddress
        ? null
        : `${talent.walletAddress.slice(0, 4)}…${talent.walletAddress.slice(-4)}`;
    
    if (variant === "square") {
        const endorsedCount     = talent.endorsedCount || 0;
        const hiringCount       = talent.hiringCount || 0;
        const attestationsCount = talent.attestationsGivenCount || 0;
        const score             = talent.trustScore ?? talent.totalScore;
        const isDao             = talent.verificationType === "Community / DAO";
        const TypeIcon          = isDao ? Users : Building2;
        const typeLabel         = isDao ? "Community / DAO" : "Company / Org";
        const typeBadge         = isDao
            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
            : "bg-amber-500/10 border-amber-500/20 text-amber-400";

        return (
            <div className="group relative rounded-[24px] bg-[#0d0d0d] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden flex flex-col">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="relative px-5 pt-5 pb-4">
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
                    <div className="relative flex items-start gap-3">
                        {/* Square logo / avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-[52px] h-[52px] rounded-[13px] overflow-hidden border border-white/10 bg-white/[0.04] shadow-lg">
                                {talent.avatarUrl ? (
                                    <Image
                                        src={talent.avatarUrl}
                                        alt={talent.displayName}
                                        width={52} height={52}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/25 text-lg font-black">
                                        {talent.displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {talent.isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#0d0d0d] border border-emerald-500/30 flex items-center justify-center">
                                    <BadgeCheck className="w-2.5 h-2.5 text-emerald-400" />
                                </div>
                            )}
                        </div>

                        {/* Name + type badge */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-1 mb-2 group-hover:text-amber-200/60 transition-colors">
                                {talent.displayName}
                            </h3>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[8.5px] font-bold uppercase tracking-wider ${typeBadge}`}>
                                <TypeIcon className="w-2.5 h-2.5" />
                                {typeLabel}
                            </div>
                        </div>
                    </div>

                    {/* Level */}
                    <div className="relative mt-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <span className="text-[10px] font-semibold text-white/40 tracking-wide">{talent.level}</span>
                    </div>
                </div>

                <div className="h-px bg-white/[0.05] mx-5" />

                {/* ── Body ───────────────────────────────────────────────── */}
                <div className="px-5 pt-4 pb-4 flex-1 flex flex-col gap-4">
                    <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {talent.bio || "Building the future of decentralized ecosystems."}
                    </p>

                    {/* Stat boxes — styled like the hero StatCard */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-2 p-2.5 rounded-[14px] border border-amber-500/10 bg-amber-500/[0.03]">
                            <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.05] flex items-center justify-center">
                                <Briefcase className="w-3 h-3 text-amber-400/70" />
                            </div>
                            <div>
                                <span className="text-[16px] font-black text-white/80 leading-none block">{hiringCount}</span>
                                <span className="text-[7.5px] font-bold text-white/25 uppercase tracking-wider mt-0.5 block leading-snug">Opportunities</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 p-2.5 rounded-[14px] border border-indigo-500/10 bg-indigo-500/[0.03]">
                            <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.05] flex items-center justify-center">
                                <ShieldCheck className="w-3 h-3 text-indigo-400/70" />
                            </div>
                            <div>
                                <span className="text-[16px] font-black text-white/80 leading-none block">{attestationsCount}</span>
                                <span className="text-[7.5px] font-bold text-white/25 uppercase tracking-wider mt-0.5 block leading-snug">Attestations</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 p-2.5 rounded-[14px] border border-emerald-500/10 bg-emerald-500/[0.03]">
                            <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.05] flex items-center justify-center">
                                <Users className="w-3 h-3 text-emerald-400/70" />
                            </div>
                            <div>
                                <span className="text-[16px] font-black text-white/80 leading-none block">{endorsedCount}</span>
                                <span className="text-[7.5px] font-bold text-white/25 uppercase tracking-wider mt-0.5 block leading-snug">Endorsed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-3">
                    {/* Trust score — same gradient as builder CV score */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                        <span className="text-[18px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-white to-emerald-400">
                            {score}
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Trust</span>
                            <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Score</span>
                        </div>
                    </div>

                    {/* View Profile */}
                    <Link
                        href={profileUrl}
                        className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white hover:text-black transition-all duration-300 text-[10px] font-bold uppercase tracking-widest group/btn shadow-xl active:scale-[0.98]"
                    >
                        View Profile
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div
            className="group relative block rounded-[24px] bg-[#0d0d0d] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl h-full flex flex-col"
        >
            {/* Lighting Effects */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent animate-lightning-shine opacity-30" />
            </div>

            <div className="relative z-10 p-5 flex-1 flex flex-col">
                {/* Top Banner & Rosette */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex-1">
                        {isOrg ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-3 h-3" />
                                <span className="truncate">{talent.level} Trust Authority</span>
                            </div>
                        ) : talent.workPreference.length > 0 ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                                <Globe className="w-3 h-3" />
                                <span className="truncate">Remote {talent.workPreference[0]}</span>
                            </div>
                        ) : null}
                    </div>
                    {talent.isVerified && (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                            <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                    )}
                </div>

                {/* Avatar & Name */}
                <div className="flex flex-col items-center text-center mb-4">
                    <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 bg-white/[0.05] shadow-2xl">
                            {talent.avatarUrl ? (
                                <Image
                                    src={talent.avatarUrl}
                                    alt={talent.displayName}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/40 text-2xl font-bold">
                                    {talent.displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-amber-200/60 transition-colors">
                            {talent.displayName}
                        </h3>
                        <p className="text-[11px] font-medium text-white/40">
                            {talent.role || "Web3 Builder"}
                        </p>
                        <p className="mt-3 text-[11px] text-white/30 leading-relaxed line-clamp-2 max-w-[200px] mx-auto min-h-[2.2rem]">
                            {talent.bio || "Active contributor building the future of the decentralized web."}
                        </p>
                    </div>
                </div>

                {/* Score & Badges */}
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        {/* Primary Status Badge */}
                        {(() => {
                            const config = {
                                'Company / Organization': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Building2, label: 'COMPANY / ORG' },
                                'Community / DAO': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Users, label: 'COMMUNITY / DAO' },
                                'Public Figure': { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', icon: Star, label: 'PUBLIC FIGURE' },
                                'Genesis': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Star, label: 'GENESIS' },
                                'Auditor': { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: ShieldCheck, label: 'AUDITOR' },
                                'Builder': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: BadgeCheck, label: 'BUILDER' },
                            }[talent.verificationType || 'Builder'] || { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: BadgeCheck, label: 'BUILDER' };

                            const Icon = config.icon;
                            return (
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${config.bg} ${config.border} text-[8px] font-bold uppercase tracking-widest ${config.color}`}>
                                    <Icon className="w-2.5 h-2.5" />
                                    {config.label}
                                </div>
                            );
                        })()}
                        
                        {/* Secondary Status (e.g. if Top Rated) */}
                        {talent.status === 'top_rated' && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-bold text-white/40 tracking-widest uppercase">
                                <Star className="w-2.5 h-2.5 fill-white/20" />
                                PRO
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <span className="text-[28px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-white to-emerald-400">
                            {isOrg ? (talent.trustScore || talent.totalScore) : talent.totalScore}
                        </span>
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-2">
                            {isOrg ? "TRUST SCORE" : "CV SCORE"}
                        </span>
                    </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                    {visibleSkills.map((skill) => (
                        <span key={skill} className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-medium text-white/50">
                            {skill}
                        </span>
                    ))}
                    {talent.skills.length > 3 && (
                        <span className="text-[10px] text-white/20 font-bold ml-1">+{talent.skills.length - 3}</span>
                    )}
                </div>

                {/* Location & Timezone */}
                <div className="flex items-center justify-center gap-3 text-[9px] text-white/20 font-bold uppercase tracking-widest mb-8">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-white/30" />
                        <span className="truncate max-w-[80px]">{talent.country || "Global"}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-white/30" />
                        <span>GMT+7</span>
                    </div>
                </div>

                {/* Footer Footer */}
                <div className="mt-auto flex flex-col gap-4">
                    <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {([
                                { Icon: Github,   value: talent.github   },
                                { Icon: Linkedin, value: talent.linkedin },
                                { Icon: Twitter,  value: talent.twitter  },
                            ] as const).filter(({ value }) => !!value).map(({ Icon }, i) => (
                                <Icon key={i} className="w-3.5 h-3.5 text-white/50" />
                            ))}
                        </div>
                        {shortWallet && (
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[8px] font-mono text-white/25">
                                    {shortWallet}
                                </div>
                            </div>
                        )}
                    </div>
                    <Link
                        href={profileUrl}
                        className="h-11 w-full bg-white/[0.03] hover:bg-white border border-white/10 hover:border-white rounded-xl flex items-center justify-between px-5 transition-all duration-300 cursor-pointer group/btn active:scale-[0.98] shadow-lg"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-black transition-colors">View Profile</span>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-black group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
