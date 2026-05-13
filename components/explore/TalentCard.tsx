"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Bookmark, BadgeCheck, Star, Zap } from "lucide-react";

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
    level: string;
    isVerified: boolean;
    verifierTier: number;
    verificationType?: string;
    receiptCount: number;
    successRate: number;
    status: "available" | "top_rated" | "featured" | null;
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
        className: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
        dot: "bg-amber-400",
    },
};

function VerificationBadge({ tier }: { tier: number }) {
    const color =
        tier >= 3 ? "text-amber-400"
        : tier === 2 ? "text-violet-400"
        : "text-sky-400";
    return <BadgeCheck className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />;
}

function ScoreRing({ score }: { score: number }) {
    const color =
        score >= 90 ? "#fbbf24"
        : score >= 75 ? "#a78bfa"
        : score >= 50 ? "#38bdf8"
        : "#64748b";
    return (
        <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 mb-0.5">CV SCORE</span>
            <span className="text-xl font-black leading-none" style={{ color }}>{score}</span>
        </div>
    );
}

export function TalentCard({ talent }: { talent: TalentProfile }) {
    const status = talent.status ? STATUS_CONFIG[talent.status] : null;
    const visibleSkills = talent.skills.slice(0, 4);
    const extraSkills = talent.skills.length - 4;

    return (
        <Link
            href={`/cv/${talent.walletAddress}`}
            className="group block rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-300 overflow-hidden"
        >
            {/* Card top — avatar + score + status */}
            <div className="p-5 pb-0">
                <div className="flex items-start justify-between mb-4">
                    {/* Status badge */}
                    {status ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em] ${status.className}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </span>
                    ) : (
                        <span />
                    )}

                    {/* Score */}
                    <ScoreRing score={talent.totalScore} />
                </div>

                {/* Avatar + name row */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/[0.05] border border-white/10">
                            {talent.avatarUrl ? (
                                <Image
                                    src={talent.avatarUrl}
                                    alt={talent.displayName}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/40 text-lg font-black select-none">
                                    {talent.displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {talent.isVerified && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#050505] flex items-center justify-center">
                                <VerificationBadge tier={talent.verifierTier} />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white truncate">{talent.displayName}</span>
                        </div>
                        {talent.role && (
                            <p className="text-[11px] text-white/50 truncate mt-0.5">{talent.role}</p>
                        )}
                        {talent.organization && (
                            <p className="text-[11px] text-white/30 truncate">@ {talent.organization}</p>
                        )}
                    </div>
                </div>

                {/* Country */}
                {talent.country && (
                    <div className="flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3 text-white/20 flex-shrink-0" />
                        <span className="text-[10px] text-white/30">{talent.country}</span>
                    </div>
                )}
            </div>

            {/* Skill tags */}
            <div className="px-5 pb-4">
                {visibleSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {visibleSkills.map((skill) => (
                            <span
                                key={skill}
                                className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold text-white/50"
                            >
                                {skill}
                            </span>
                        ))}
                        {extraSkills > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.03] text-[10px] font-bold text-white/30">
                                +{extraSkills}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Stats row */}
            <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-black text-white/80">{talent.receiptCount}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">Projects</span>
                    </div>
                    {talent.successRate > 0 && (
                        <>
                            <div className="w-px h-6 bg-white/[0.06]" />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] font-black text-white/80">{talent.successRate}%</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">Verified</span>
                            </div>
                        </>
                    )}
                    {talent.workPreference.length > 0 && (
                        <>
                            <div className="w-px h-6 bg-white/[0.06]" />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-black text-white/60 capitalize">{talent.workPreference[0]}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">Type</span>
                            </div>
                        </>
                    )}
                </div>
                <button
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                    onClick={(e) => e.preventDefault()}
                    aria-label="Bookmark"
                >
                    <Bookmark className="w-3.5 h-3.5 text-white/20 hover:text-white/50 transition-colors" />
                </button>
            </div>
        </Link>
    );
}
