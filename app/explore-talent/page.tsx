"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TalentCard } from "@/components/explore/TalentCard";
import { useExploreTalent } from "@/hooks/useExploreTalent";
import { CATEGORIES, WORK_TYPES, SORT_OPTIONS } from "@/types/explore";
import {
    Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight,
    Loader2, Users, X, Briefcase, ShieldCheck, Globe
} from "lucide-react";
import Link from "next/link";

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ 
    icon, value, label, sub, color 
}: { 
    icon: React.ReactNode; value: string; label: string; sub: string; color: string 
}) {
    const colorClasses = {
        indigo: "border-indigo-500/10 bg-indigo-500/[0.02]",
        emerald: "border-emerald-500/10 bg-emerald-500/[0.02]",
        amber: "border-amber-200/10 bg-amber-200/[0.02]",
        cyan: "border-cyan-500/10 bg-cyan-500/[0.02]",
    }[color as 'indigo' | 'emerald' | 'amber' | 'cyan'];

    return (
        <div className={`p-6 rounded-3xl border ${colorClasses} space-y-4`}>
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">{label}</p>
                <p className="text-[10px] text-white/20 mt-2 leading-relaxed">{sub}</p>
            </div>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
    page, totalPages, onPage,
}: { page: number; totalPages: number; onPage: (p: number) => void }) {
    if (totalPages <= 1) return null;

    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push("…");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
        if (page < totalPages - 2) pages.push("…");
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-center gap-1.5 mt-12">
            <button
                onClick={() => onPage(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-3.5 h-3.5 text-white/60" />
            </button>
            {pages.map((p, i) =>
                p === "…" ? (
                    <span key={`el-${i}`} className="w-8 h-8 flex items-center justify-center text-white/30 text-sm">…</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPage(p as number)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                            p === page
                                ? "bg-white text-black"
                                : "border border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.08]"
                        }`}
                    >
                        {p}
                    </button>
                )
            )}
            <button
                onClick={() => onPage(page + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight className="w-3.5 h-3.5 text-white/60" />
            </button>
        </div>
    );
}

// ─── Select dropdown ──────────────────────────────────────────────────────────
function FilterSelect({
    value, onChange, options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: readonly { value: string; label: string }[];
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-[12px] font-bold cursor-pointer hover:bg-white/[0.07] transition-all outline-none"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#0d0d0d]">
                        {o.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
        </div>
    );
}

    // ─── Inner page (uses hook that calls useSearchParams) ────────────────────────
function ExploreTalentInner() {
    const { 
        talents, organizations, total, loading, error, 
        filters, setFilter, setPage, page, totalPages, hasFilters, clearFilters
    } = useExploreTalent();

    const [stats, setStats] = useState({
        talents: 0,
        verified: 0,
        opportunities: 0,
        countries: 0,
        teamAvatars: [] as string[],
        verifiedProofs: 0
    });

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setStats(data);
            })
            .catch(console.error);
    }, []);

    return (
        <main className="pt-24 pb-20 px-4 sm:px-6 max-w-[1320px] mx-auto">

            {/* ── Hero section ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 mt-4 items-center">
                <div className="lg:col-span-7 space-y-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Talent Ecosystem</span>
                        </div>
                        <h1 className="text-h1 mb-6">
                            Discover Web3
                            <br />
                            <span className="text-amber-200/60">Creators & Builders</span>
                        </h1>
                        <p className="text-white/40 text-base md:text-lg max-w-xl leading-relaxed">
                            Explore verified creators, developers, and marketers from the ChainVolio ecosystem.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Link 
                            href="/"
                            className="premium-shimmer-button px-8 py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-all flex items-center gap-2 group"
                        >
                            Create Profile
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            href="/hiring/create"
                            className="px-8 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold uppercase tracking-widest text-xs border border-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"
                        >
                            Create Job
                            <Briefcase className="w-4 h-4" />
                        </Link>
                    </div>

                    {!loading && total > 0 && (
                        <div className="flex items-center gap-3 pt-4">
                            <div className="flex -space-x-3">
                                {(stats.teamAvatars.length > 0 ? stats.teamAvatars : [
                                    '/homepage/cv%20example.png',
                                    'https://tlbxjzruyytontxwvwtl.supabase.co/storage/v1/object/public/avatars/ChB5PVQbpZdvPepRcMpFGo2jvHfW8SB3kZS3Wquwgsjh-1775311376892.webp',
                                    'https://tlbxjzruyytontxwvwtl.supabase.co/storage/v1/object/public/avatars/AzQjFU1G59uMqUL8aDxaSxSgxBnfwCQDEqHcDEJuQHEd-1775397574888.webp',
                                    'https://tlbxjzruyytontxwvwtl.supabase.co/storage/v1/object/public/avatars/5KpNaznowuAnjgvT56aghxT8rpPHCcpUmupSdgtA923H-1776434373129.webp'
                                ]).map((avatar, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white/[0.05] overflow-hidden">
                                        <img 
                                            src={avatar} 
                                            alt="" 
                                            className="w-full h-full object-cover grayscale opacity-70 hover:opacity-100 transition-opacity" 
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest">
                                Trusted by <span className="text-white/60">{stats.verified > 0 ? `${stats.verified}+` : 'verified'}</span> teams worldwide
                            </p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                    <StatCard 
                        icon={<Users className="w-5 h-5 text-indigo-400" />}
                        value={`${stats.talents}+`}
                        label="Talents"
                        sub="Active creators in the network"
                        color="indigo"
                    />
                    <StatCard 
                        icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
                        value={`${stats.verifiedProofs || stats.verified}+`}
                        label="Verified"
                        sub="Proof of work verified"
                        color="emerald"
                    />
                    <StatCard 
                        icon={<Briefcase className="w-5 h-5 text-amber-200/60" />}
                        value={`${stats.opportunities}+`}
                        label="Opportunities"
                        sub="Hiring links created"
                        color="amber"
                    />
                    <StatCard 
                        icon={<Globe className="w-5 h-5 text-cyan-400" />}
                        value={`${stats.countries}+`}
                        label="Countries"
                        sub="Global talent community"
                        color="cyan"
                    />
                </div>
            </div>

            {/* ── Search bar ────────────────────────────────────────────── */}
            <div className="relative mb-5" id="search-section">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                    placeholder="Search by name, skill, or keyword…"
                    className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 text-sm outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                />
                {filters.search && (
                    <button
                        onClick={() => setFilter("search", "")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* ── Category tabs ─────────────────────────────────────────── */}
            <div className="flex items-center gap-1 mb-5 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter("category", cat.id)}
                        className={`flex-shrink-0 h-8 px-4 rounded-xl text-[12px] font-bold transition-all ${
                            filters.category === cat.id
                                ? "bg-white text-black"
                                : "bg-white/[0.04] border border-white/[0.07] text-white/50 hover:bg-white/[0.08] hover:text-white/70"
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* ── Filter row ────────────────────────────────────────────── */}
            <div className="flex items-center gap-2.5 mb-8 flex-wrap">
                <div className="flex items-center gap-2 text-white/30">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>

                <FilterSelect
                    value={filters.workType}
                    onChange={(v) => setFilter("workType", v)}
                    options={WORK_TYPES}
                />

                {/* Min score */}
                <div className="relative">
                    <select
                        value={filters.minScore}
                        onChange={(e) => setFilter("minScore", Number(e.target.value))}
                        className="appearance-none h-9 pl-3 pr-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-[12px] font-bold cursor-pointer hover:bg-white/[0.07] transition-all outline-none"
                    >
                        <option value={0}  className="bg-[#0d0d0d]">All Scores</option>
                        <option value={50} className="bg-[#0d0d0d]">50+ Score</option>
                        <option value={70} className="bg-[#0d0d0d]">70+ Score</option>
                        <option value={80} className="bg-[#0d0d0d]">80+ Score</option>
                        <option value={90} className="bg-[#0d0d0d]">90+ Score</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="h-9 px-3 rounded-xl text-[12px] font-bold text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"
                        >
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                    <span className="text-[11px] text-white/25 font-bold uppercase tracking-widest">Sort by</span>
                    <FilterSelect
                        value={filters.sort}
                        onChange={(v) => setFilter("sort", v)}
                        options={SORT_OPTIONS}
                    />
                </div>
            </div>

            {/* ── Grids ─────────────────────────────────────────────────── */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                </div>
            ) : error ? (
                <div className="text-center py-24 text-red-400/70 text-sm">{error}</div>
            ) : (talents.length === 0 && organizations.length === 0) ? (
                <div className="text-center py-24 space-y-3">
                    <Users className="w-10 h-10 text-white/10 mx-auto" />
                    <p className="text-white/30 text-sm font-bold">No talent found matching your filters.</p>
                    {hasFilters && (
                        <button onClick={clearFilters} className="text-[11px] text-white/40 hover:text-white/60 underline transition-colors">
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-16">
                    {/* Builders / Individuals */}
                    {talents.length > 0 && (
                        <div>
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <div className="w-1 h-4 bg-emerald-400 rounded-full" />
                                    <h2 className="text-xl font-bold text-white tracking-tight">Featured Creators</h2>
                                </div>
                                <p className="text-[12px] text-white/40 pl-4">
                                    Discover top-rated builders, public figures, and verified individuals in the network.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {talents.map((talent) => (
                                    <TalentCard key={talent.walletAddress} talent={talent} />
                                ))}
                            </div>
                            
                            <div className="mt-12">
                                <Pagination page={page} totalPages={totalPages} onPage={setPage} />

                                {total > 0 && (
                                    <p className="text-center text-[11px] text-white/20 mt-4">
                                        Showing {Math.min((page - 1) * 8 + 1, total)}–{Math.min(page * 8, total)} of {total} talents
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Organizations */}
                    {organizations.length > 0 && (
                        <div>
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <div className="w-1 h-4 bg-indigo-400 rounded-full" />
                                    <h2 className="text-xl font-bold text-white tracking-tight">Verified Organizations</h2>
                                </div>
                                <p className="text-[12px] text-white/40 pl-4">
                                    Explore verified companies, communities, and DAOs actively participating in the ecosystem.
                                </p>
                            </div>
                            <div className={organizations.length < 4 ? "flex flex-wrap justify-center gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}>
                                {organizations.map((org) => (
                                    <div key={org.walletAddress} className={organizations.length < 4 ? "w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]" : ""}>
                                        <TalentCard talent={org} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

// ─── Page root — Suspense required for useSearchParams ────────────────────────
export default function ExploreTalentPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                </div>
            }>
                <ExploreTalentInner />
            </Suspense>
            <Footer />
        </div>
    );
}
