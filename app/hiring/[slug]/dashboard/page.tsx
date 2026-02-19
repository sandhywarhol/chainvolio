"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Loader2,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    ShieldCheck,
    Clock,
    Building2,
    Briefcase,
    Users,
    MoreHorizontal,
    Download,
    CheckCircle2,
    XCircle,
    Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function RecruiterDashboard({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const [data, setData] = useState<{ collection: any; candidates: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Filters & State
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [attestedOnly, setAttestedOnly] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState("recent");
    const [spamFilter, setSpamFilter] = useState(false); // Feature 4: Spam Filter

    useEffect(() => {
        async function fetchDashboard() {
            try {
                // Add timestamp to bust cache
                const res = await fetch(`/api/hiring/collections/${slug}/candidates?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                const result = await res.json();
                if (res.ok) {
                    setData(result);
                } else {
                    setError(result.error || "Failed to load dashboard.");
                }
            } catch (err) {
                setError("Network error occurred.");
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, [slug]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/hiring/collections/${slug}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/hiring/create"); // Redirect to create page after deletion
            } else {
                const result = await res.json();
                alert(`Failed to delete: ${result.error}`);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("An error occurred while deleting.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Feature: Manage Candidate Status & Notes
    const [noteDraft, setNoteDraft] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Sync note draft when expanding a candidate
    useEffect(() => {
        if (expandedId && data) {
            const candidate = data.candidates.find(c => c.id === expandedId);
            setNoteDraft(candidate?.recruiterNotes || "");
        }
    }, [expandedId, data]);

    const handleUpdateStatus = async (candidateId: string, newStatus: string) => {
        const oldStatus = data?.candidates.find(c => c.id === candidateId)?.recruiterStatus;

        // Optimistic update
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                candidates: prev.candidates.map(c =>
                    c.id === candidateId ? { ...c, recruiterStatus: newStatus } : c
                )
            };
        });

        try {
            const res = await fetch(`/api/hiring/submissions/${candidateId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Status update failed");
            }
        } catch (err: any) {
            console.error("Failed to update status", err);
            alert(`Status update failed: ${err.message}`);
            // Revert on error
            setData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    candidates: prev.candidates.map(c =>
                        c.id === candidateId ? { ...c, recruiterStatus: oldStatus } : c
                    )
                };
            });
        }
    };

    const handleSaveNote = async () => {
        if (!expandedId) return;

        const oldNote = data?.candidates.find(c => c.id === expandedId)?.recruiterNotes;
        setIsSavingNote(true);

        // Optimistic update
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                candidates: prev.candidates.map(c =>
                    c.id === expandedId ? { ...c, recruiterNotes: noteDraft } : c
                )
            };
        });

        try {
            const res = await fetch(`/api/hiring/submissions/${expandedId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: noteDraft }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to save note");
            }
        } catch (err: any) {
            console.error("Failed to save note", err);
            alert(`Note save failed: ${err.message}`);
            // Revert
            setData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    candidates: prev.candidates.map(c =>
                        c.id === expandedId ? { ...c, recruiterNotes: oldNote } : c
                    )
                };
            });
        } finally {
            setIsSavingNote(false);
        }
    };

    // Derived filtered & sorted list
    const filteredCandidates = useMemo(() => {
        if (!data) return [];

        let list = [...data.candidates];

        // Search (Name or Org)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(c =>
                (c.displayName?.toLowerCase().includes(term)) ||
                (c.attestedOrgs?.some((o: string) => o.toLowerCase().includes(term))) ||
                (c.wallet?.toLowerCase().includes(term))
            );
        }

        // Role Filter
        if (roleFilter !== "all") {
            list = list.filter(c => c.role?.toLowerCase().includes(roleFilter.toLowerCase()));
        }

        // Attested Only
        if (attestedOnly) {
            list = list.filter(c => c.attestedCount > 0);
        }

        // Feature 4: Spam Filter (Hide Low Signal)
        if (spamFilter) {
            list = list.filter(c => c.signalStrength !== 'Low');
        }

        // Sorting
        list.sort((a, b) => {
            const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
            const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;

            if (sortBy === "recent") return dateB - dateA;
            if (sortBy === "attestations") return (b.attestedCount || 0) - (a.attestedCount || 0);
            if (sortBy === "total_proof") return (b.powCount || 0) - (a.powCount || 0);
            return 0;
        });

        return list;
    }, [data, searchTerm, roleFilter, attestedOnly, spamFilter, sortBy]);

    const uniqueRoles = useMemo(() => {
        if (!data) return [];
        const roles = data.candidates.map(c => c.role).filter(Boolean);
        return Array.from(new Set(roles));
    }, [data]);

    const handleExportCSV = () => {
        if (!data || !data.candidates.length) return;

        const headers = ["Wallet", "Display Name", "Role", "Primary Signal", "Proof Count", "Attested Count", "Status", "Notes", "Submitted At"];
        const rows = data.candidates.map(c => [
            c.wallet,
            c.displayName || "Anonymous",
            c.role,
            c.primarySignal,
            c.powCount,
            c.attestedCount,
            c.recruiterStatus,
            `"${(c.recruiterNotes || "").replace(/"/g, '""')}"`, // Escape quotes
            c.submittedAt
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${data.collection.title.replace(/\s+/g, '_')}_candidates.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    // Feature: Candidate Actions Dropdown
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Close dropdown when interacting outside (simple implementation)
    useEffect(() => {
        const closeDropdown = () => setActiveDropdown(null);
        if (activeDropdown) {
            window.addEventListener('click', closeDropdown);
        }
        return () => window.removeEventListener('click', closeDropdown);
    }, [activeDropdown]);

    const handleDeleteCandidate = async (candidateId: string) => {
        if (!confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return;

        // Optimistic update
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                candidates: prev.candidates.filter(c => c.id !== candidateId)
            };
        });

        try {
            await fetch(`/api/hiring/submissions/${candidateId}`, {
                method: "DELETE"
            });
        } catch (err) {
            console.error("Failed to delete candidate", err);
            // Could revert here if needed
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-slate-400 font-medium">Preparing recruiter insights...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b] text-white p-6">
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-8">{error}</p>
                <Link href="/hiring/create" className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold transition-all w-full block">
                    Back to Hiring Center
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen text-slate-200 font-sans antialiased">
            {/* Top Header */}
            <header className="border-b border-white/5 bg-[#0f0f11]/60 backdrop-blur-md sticky top-0 z-[100]">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <img src="/chainvolio logo.png" alt="Chainvolio Logo" className="w-6 h-6 grayscale hover:grayscale-0 transition-all" />
                            <span className="text-sm font-bold tracking-tight text-white/90">Chainvolio <span className="text-indigo-500">HIRE</span></span>
                        </Link>
                        <div className="h-4 w-[1px] bg-white/10 mx-2" />
                        <h1 className="text-sm font-semibold text-white/70 line-clamp-1">{data?.collection.title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-colors border border-red-500/20 disabled:opacity-50"
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Delete
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold transition-colors border border-white/5"
                        >
                            <Download className="w-3.5 h-3.5" /> Export CSV
                        </button>
                        <Link href={`/r/${slug}`} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" /> View Public Link
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8 relative z-[60]">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Total Candidates", value: data?.candidates.length, icon: Users, color: "text-blue-400" },
                        { label: "Attested Portfolios", value: data?.candidates.filter(c => c.attestedCount > 0).length, icon: ShieldCheck, color: "text-emerald-400" },
                        { label: "Avg. Proofs / User", value: (data?.candidates.reduce((acc, c) => acc + c.powCount, 0) / (data?.candidates.length || 1)).toFixed(1), icon: Briefcase, color: "text-purple-400" },
                        { label: "Verified Organizations", value: new Set(data?.candidates.flatMap(c => c.attestedOrgs)).size, icon: Building2, color: "text-orange-400" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#141417] border border-white/[0.03] rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters Bar */}
                <div className="bg-[#141417] border border-white/[0.03] rounded-2xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search candidates by name, wallet, or organization..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 focus:border-indigo-500/50 outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm focus:border-indigo-500/50 outline-none cursor-pointer"
                                >
                                    <option value="all">Every Role</option>
                                    {uniqueRoles.map((role: string) => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm focus:border-indigo-500/50 outline-none cursor-pointer"
                            >
                                <option value="recent">Sort by Recency</option>
                                <option value="attestations">Most Attestations</option>
                                <option value="total_proof">Most Proofs</option>
                            </select>

                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={attestedOnly}
                                    onChange={(e) => setAttestedOnly(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-500 focus:ring-indigo-500/50"
                                />
                                <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Attested Only</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer group relative">
                                <input
                                    type="checkbox"
                                    checked={spamFilter}
                                    onChange={(e) => setSpamFilter(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-red-500 focus:ring-red-500/50"
                                />
                                <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors border-b border-dashed border-slate-600">Hide Low Signal</span>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#18181b] border border-white/10 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    <p className="text-[10px] text-slate-300 leading-relaxed">
                                        Filters out candidates with low on-chain activity, zero attestations, or inactive wallets.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Candidates Table */}
                <div className="bg-[#141417] border border-white/[0.03] rounded-2xl overflow-hidden min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.03] bg-white/[0.01]">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">In-App Signal</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Primary Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Portfolio</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Top Partners</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Recency</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {filteredCandidates.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 text-slate-600 mb-2" />
                                            <p className="text-slate-400 font-medium">No candidates match your filters.</p>
                                            <button onClick={() => { setSearchTerm(""); setRoleFilter("all"); setAttestedOnly(false); setSpamFilter(false); }} className="text-indigo-500 text-sm font-bold hover:underline">Clear all filters</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCandidates.map((candidate) => (
                                    <React.Fragment key={candidate.id}>
                                        <tr className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${expandedId === candidate.id ? 'bg-white/[0.02]' : ''}`} onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                                        {candidate.avatarUrl ? (
                                                            <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-500">{candidate.wallet.slice(0, 2)}</span>
                                                        )}
                                                        {/* Status Indicator Dot */}
                                                        {candidate.recruiterStatus === 'shortlisted' && (
                                                            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#141417]"></div>
                                                        )}
                                                        {candidate.recruiterStatus === 'rejected' && (
                                                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#141417]"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-bold transition-colors ${candidate.recruiterStatus === 'rejected' ? 'text-slate-500 line-through' : 'text-white'}`}>{candidate.displayName || "Anonymous User"}</span>
                                                            {candidate.attestedCount > 0 && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {candidate.primarySignal && (
                                                                <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 whitespace-nowrap">
                                                                    {candidate.primarySignal}
                                                                </span>
                                                            )}
                                                            {candidate.snapshotTags?.map((tag: string) => (
                                                                <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/5 text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${candidate.signalStrength === 'Strong' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : candidate.signalStrength === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-slate-800 text-slate-400 border-white/5'}`}>
                                                        {candidate.signalStrength === 'Strong' && "🟢 Strong"}
                                                        {candidate.signalStrength === 'Medium' && "🟡 Medium"}
                                                        {candidate.signalStrength === 'Low' && "🔴 Low"}
                                                    </div>
                                                    <span className="text-[9px] font-mono text-slate-500 font-medium">Score: {candidate.signalScore || 0}/100</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 hidden md:table-cell">
                                                <span className="text-sm font-medium text-slate-300 line-clamp-1 max-w-[200px]">{candidate.role}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-bold text-white">{candidate.powCount}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-white/5" />
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-sm font-bold ${candidate.attestedCount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>{candidate.attestedCount}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Attested</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 hidden lg:table-cell">
                                                <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                                    {candidate.attestedOrgs.slice(0, 2).map((org: string) => (
                                                        <span key={org} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 truncate max-w-[100px]">{org}</span>
                                                    ))}
                                                    {candidate.attestedOrgs.length > 2 && (
                                                        <span className="px-2 py-0.5 bg-slate-800 border border-white/5 rounded text-[10px] font-bold text-slate-400">+{candidate.attestedOrgs.length - 2} more</span>
                                                    )}
                                                    {candidate.attestedOrgs.length === 0 && (
                                                        <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] font-medium text-slate-500">
                                                            {candidate.powCount > 0 ? "Independent Builder" : "Early-stage Contributor"}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[11px] font-medium">{new Date(candidate.lastActive).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right relative">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/cv/${candidate.wallet}`}
                                                        target="_blank"
                                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-indigo-400"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCandidate(candidate.id);
                                                        }}
                                                        title="Delete Candidate"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Feature 4: Quick Peek / Expanded Preview */}
                                        {expandedId === candidate.id && (
                                            <tr className="bg-white/[0.01]">
                                                <td colSpan={6} className="px-20 py-8 border-l-2 border-indigo-500">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                <Briefcase className="w-3.5 h-3.5" /> Recent Verified Proofs
                                                            </h4>
                                                            <div className="space-y-4">
                                                                {candidate.attestedCount > 0 ? (
                                                                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                                                        <p className="text-sm font-bold text-white mb-1">Top Attested Proofs available on full CV.</p>
                                                                        <Link href={`/cv/${candidate.wallet}`} target="_blank" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">Click to view deep evidence <ExternalLink className="w-3 h-3" /></Link>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-4 bg-white/5 rounded-xl border border-dashed border-white/10 text-center">
                                                                        <p className="text-xs text-slate-400 font-medium">Candidate has not yet anchored verified proof on-chain.</p>
                                                                        <p className="text-[10px] text-slate-600 mt-1">Check their attached CV link for self-declared portfolio items.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="border-l border-white/5 pl-12 flex flex-col h-full">
                                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Recruiter Controls</h4>
                                                            <div className="space-y-4 flex-1 flex flex-col">
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(candidate.id, candidate.recruiterStatus === 'shortlisted' ? 'pending' : 'shortlisted')}
                                                                        className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all border ${candidate.recruiterStatus === 'shortlisted'
                                                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                                                            }`}
                                                                    >
                                                                        {candidate.recruiterStatus === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(candidate.id, candidate.recruiterStatus === 'rejected' ? 'pending' : 'rejected')}
                                                                        className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all border ${candidate.recruiterStatus === 'rejected'
                                                                            ? "bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                                                            : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                                                            }`}
                                                                    >
                                                                        {candidate.recruiterStatus === 'rejected' ? 'Rejected' : 'Reject'}
                                                                    </button>
                                                                </div>
                                                                <div className="relative flex-1">
                                                                    <textarea
                                                                        value={noteDraft}
                                                                        onChange={(e) => setNoteDraft(e.target.value)}
                                                                        onBlur={handleSaveNote}
                                                                        placeholder="Add private note (stored locally)..."
                                                                        className="w-full h-full min-h-[160px] bg-black/60 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-white/20 transition-all placeholder:text-slate-600 resize-none"
                                                                    />
                                                                    {isSavingNote && (
                                                                        <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-black/80 px-2 py-1 rounded animate-pulse border border-white/5">Saving...</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
