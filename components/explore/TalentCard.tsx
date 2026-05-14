"use client";
 
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck, Star, ShieldCheck, Globe, Github, Linkedin, Twitter, Building2, Users, ArrowRight, Briefcase } from "lucide-react";

export interface TalentProfile {
    walletAddress: string;
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
    
    if (variant === "square") {
        const endorsedCount = talent.endorsedCount || 0;
        const hiringCount = talent.hiringCount || 0;
        const attestationsCount = talent.attestationsGivenCount || 0;

        return (
            <div className="group relative block rounded-[24px] bg-[#0d0d0d] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl flex flex-col p-6 text-center h-full min-h-[320px]">
                {/* Lighting Effects */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
                </div>

                <div className="relative z-10 w-full flex flex-col flex-1 items-center">
                    {/* Avatar & Verification */}
                    <div className="relative mb-3 group-hover:-translate-y-1 transition-transform duration-500">
                        <div className="w-16 h-16 rounded-[18px] overflow-hidden border border-white/10 bg-white/[0.05] shadow-2xl">
                            {talent.avatarUrl ? (
                                <Image
                                    src={talent.avatarUrl}
                                    alt={talent.displayName}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/40 text-xl font-bold">
                                    {talent.displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {talent.isVerified && (
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#0d0d0d] border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10" title="Verified Organization">
                                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                        )}
                    </div>

                    {/* Name & Type */}
                    <h3 className="text-base font-bold text-white mb-1 line-clamp-1 px-2 group-hover:text-indigo-400 transition-colors">
                        {talent.displayName}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                            {talent.verificationType || "Organization"}
                        </span>
                    </div>

                    {/* Bio */}
                    <div className="mb-5 flex-1 w-full">
                        {talent.bio ? (
                            <p className="text-[11px] text-white/50 line-clamp-3 leading-relaxed">
                                {talent.bio}
                            </p>
                        ) : (
                            <p className="text-[11px] text-white/30 italic">
                                No bio available for this organization.
                            </p>
                        )}
                    </div>

                    {/* Stat Badges */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6 w-full">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/70 shadow-sm" title="Endorsed Talents">
                            <Users className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-bold">{endorsedCount} <span className="text-white/30 font-normal">Endorsed</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/70 shadow-sm" title="Hiring Activity">
                            <Briefcase className="w-3 h-3 text-amber-400" />
                            <span className="text-[10px] font-bold">{hiringCount} <span className="text-white/30 font-normal">Hires</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/70 shadow-sm" title="Attestations Given">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-bold">{attestationsCount} <span className="text-white/30 font-normal">Attestations</span></span>
                        </div>
                    </div>

                    {/* Trust Score */}
                    <div className="flex flex-col items-center mt-auto border-t border-white/5 pt-4 w-full">
                        <span className="text-2xl font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-white to-emerald-400">
                            {talent.trustScore || talent.totalScore}
                        </span>
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1.5">
                            TRUST SCORE
                        </span>
                    </div>
                </div>

                <Link
                    href={`/cv/${talent.walletAddress}`}
                    className="absolute inset-0 z-20"
                    aria-label={`View ${talent.displayName}'s profile`}
                />
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
                <div className="flex flex-col items-center text-center mb-6">
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
                <div className="flex flex-wrap justify-center gap-1.5 mb-8">
                    {visibleSkills.map((skill) => (
                        <span key={skill} className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-medium text-white/50">
                            {skill}
                        </span>
                    ))}
                    {talent.skills.length > 3 && (
                        <span className="text-[10px] text-white/20 font-bold ml-1">+{talent.skills.length - 3}</span>
                    )}
                </div>

                {/* Footer Footer */}
                <div className="mt-auto flex flex-col gap-4">
                    <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {[Github, Linkedin, Twitter].map((Icon, i) => (
                                <Icon key={i} className="w-3.5 h-3.5 text-white/20 hover:text-white/40 transition-colors" />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[8px] font-mono text-white/25">
                                {talent.walletAddress.slice(0, 4)}...{talent.walletAddress.slice(-4)}
                            </div>
                        </div>
                    </div>
                    <Link
                        href={`/cv/${talent.walletAddress}`}
                        className="h-10 w-full bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/15 rounded-xl flex items-center justify-between px-4 transition-all duration-300 cursor-pointer"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">View Profile</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
