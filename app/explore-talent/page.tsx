"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TalentCard, TalentProfile } from "@/components/explore/TalentCard";
import {
    Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight,
    Loader2, Users, X
} from "lucide-react";

// ─── Category tabs ────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: "all",         label: "All" },
    { id: "video",       label: "Video" },
    { id: "design",      label: "Design" },
    { id: "development", label: "Development" },
    { id: "writing",     label: "Writing" },
    { id: "community",   label: "Community" },
    { id: "ai",          label: "AI" },
];

const WORK_TYPES = [
    { value: "",           label: "All Types" },
    { value: "Freelance",  label: "Freelance" },
    { value: "Full-time",  label: "Full-time" },
    { value: "Part-time",  label: "Part-time" },
    { value: "Remote",     label: "Remote" },
    { value: "Contract",   label: "Contract" },
];

const SORT_OPTIONS = [
    { value: "score_desc", label: "Highest Score" },
    { value: "score_asc",  label: "Lowest Score" },
    { value: "newest",     label: "Newest First" },
];

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
    options: { value: string; label: string }[];
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

// ─── Page component ───────────────────────────────────────────────────────────
export default function ExploreTalentPage() {
    const [talents, setTalents]         = useState<TalentProfile[]>([]);
    const [total, setTotal]             = useState(0);
    const [totalPages, setTotalPages]   = useState(0);
    const [page, setPage]               = useState(1);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState("");

    const [search, setSearch]           = useState("");
    const [category, setCategory]       = useState("all");
    const [workType, setWorkType]       = useState("");
    const [minScore, setMinScore]       = useState(0);
    const [sort, setSort]               = useState("score_desc");

    const searchRef                     = useRef<ReturnType<typeof setTimeout>>();

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchTalents = useCallback(async (opts: {
        page: number; search: string; category: string;
        workType: string; minScore: number; sort: string;
    }) => {
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams({
                page:     String(opts.page),
                search:   opts.search,
                category: opts.category,
                workType: opts.workType,
                minScore: String(opts.minScore),
                maxScore: "100",
                sort:     opts.sort,
            });
            const res  = await fetch(`/api/explore-talent?${params}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch");
            setTalents(data.talents || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 0);
        } catch (e: any) {
            setError(e.message || "Something went wrong.");
            setTalents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial + filter-change fetch
    useEffect(() => {
        fetchTalents({ page, search, category, workType, minScore, sort });
    }, [page, category, workType, minScore, sort]);

    // Debounced search
    useEffect(() => {
        clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            setPage(1);
            fetchTalents({ page: 1, search, category, workType, minScore, sort });
        }, 380);
        return () => clearTimeout(searchRef.current);
    }, [search]);

    const handleCategory = (cat: string) => {
        setCategory(cat);
        setPage(1);
    };

    const handlePage = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("all");
        setWorkType("");
        setMinScore(0);
        setSort("score_desc");
        setPage(1);
    };
    const hasFilters = search || category !== "all" || workType || minScore > 0 || sort !== "score_desc";

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <main className="pt-24 pb-20 px-4 sm:px-6 max-w-[1320px] mx-auto">

                {/* ── Hero header ───────────────────────────────────────────── */}
                <div className="mb-8 mt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Talent Ecosystem</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2">
                        Discover Web3
                        <br />
                        <span className="text-amber-400">Creators & Builders</span>
                    </h1>
                    <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                        Explore verified creators, developers, and marketers from the ChainVolio ecosystem.
                    </p>
                </div>

                {/* ── Stats bar ─────────────────────────────────────────────── */}
                {!loading && total > 0 && (
                    <div className="flex items-center gap-6 mb-8 text-sm">
                        <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-white/30" />
                            <span className="font-black text-white/70">{total.toLocaleString()}</span>
                            <span className="text-white/30">talent{total !== 1 ? "s" : ""} found</span>
                        </div>
                    </div>
                )}

                {/* ── Search bar ────────────────────────────────────────────── */}
                <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, skill, or keyword…"
                        className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 text-sm outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
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
                            onClick={() => handleCategory(cat.id)}
                            className={`flex-shrink-0 h-8 px-4 rounded-xl text-[12px] font-bold transition-all ${
                                category === cat.id
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
                        value={workType}
                        onChange={(v) => { setWorkType(v); setPage(1); }}
                        options={WORK_TYPES}
                    />

                    {/* Min score selector */}
                    <div className="relative">
                        <select
                            value={minScore}
                            onChange={(e) => { setMinScore(Number(e.target.value)); setPage(1); }}
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
                            value={sort}
                            onChange={(v) => { setSort(v); setPage(1); }}
                            options={SORT_OPTIONS}
                        />
                    </div>
                </div>

                {/* ── Grid ──────────────────────────────────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                    </div>
                ) : error ? (
                    <div className="text-center py-24 text-red-400/70 text-sm">{error}</div>
                ) : talents.length === 0 ? (
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
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {talents.map((talent) => (
                                <TalentCard key={talent.walletAddress} talent={talent} />
                            ))}
                        </div>

                        <Pagination page={page} totalPages={totalPages} onPage={handlePage} />

                        {total > 0 && (
                            <p className="text-center text-[11px] text-white/20 mt-4">
                                Showing {Math.min((page - 1) * 8 + 1, total)}–{Math.min(page * 8, total)} of {total} talents
                            </p>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
