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
    Trash2,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function RecruiterDashboard({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const [data, setData] = useState<{ collection: any; candidates: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
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
            setShowDeleteModal(false);
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

    const handleDeleteCandidate = async () => {
        if (!candidateToDelete) return;

        const candidateId = candidateToDelete;

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
        } finally {
            setCandidateToDelete(null);
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
                <div className="max-w-[1600px] mx-auto px-8 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-5 h-5 grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300" />
                            <span className="text-[11px] font-black tracking-[0.2em] text-white/50 uppercase group-hover:text-white/80 transition-colors">ChainVolio <span className="text-indigo-400">Secure</span></span>
                        </Link>
                        <div className="h-4 w-[1px] bg-white/[0.08]" />
                        <div className="flex flex-col">
                            <h1 className="text-[11px] font-bold text-white uppercase tracking-widest line-clamp-1">{data?.collection.title}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{data?.collection.metadata?.roleType}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-wider">{data?.collection.metadata?.salary || "Competitive"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/5 text-red-400/50 hover:text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent hover:border-red-500/10 disabled:opacity-50"
                        >
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Terminate
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.03] text-slate-400 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent hover:border-white/5"
                        >
                            <Download className="w-3 h-3" /> Report
                        </button>
                        <Link href={`/r/${slug}`} className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-indigo-500/20 hover:border-indigo-500/40">
                            <ExternalLink className="w-3 h-3" /> Dashboard Access
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8 relative z-[60]">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Pipeline Depth", value: data?.candidates.length, icon: Users, color: "text-blue-400/80", desc: "Total applications" },
                        { label: "Authority Rate", value: `${((data?.candidates.filter(c => c.attestedCount > 0).length || 0) / (data?.candidates.length || 1) * 100).toFixed(0)}%`, icon: ShieldCheck, color: "text-emerald-400/80", desc: "Attested portfolios" },
                        { label: "Signal Density", value: (data?.candidates.reduce((acc, c) => acc + c.powCount, 0) / (data?.candidates.length || 1)).toFixed(1), icon: Briefcase, color: "text-purple-400/80", desc: "Avg. proof volume" },
                        { label: "Network Breadth", value: new Set(data?.candidates.flatMap(c => c.attestedOrgs)).size, icon: Building2, color: "text-orange-400/80", desc: "Verified partners" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#121215] border border-white/[0.04] rounded-2xl p-6 relative overflow-hidden group hover:border-white/[0.08] transition-all duration-300">
                            {/* Suble glow */}
                            <div className={`absolute -top-12 -right-12 w-24 h-24 blur-3xl opacity-5 transition-opacity group-hover:opacity-10 ${stat.color.split('-')[1] === 'blue' ? 'bg-blue-500' : stat.color.split('-')[1] === 'emerald' ? 'bg-emerald-500' : stat.color.split('-')[1] === 'purple' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{stat.label}</span>
                                <div className={`p-2 rounded-lg bg-black/20 border border-white/[0.03] ${stat.color}`}>
                                    <stat.icon className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 relative z-10">
                                <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                                <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">{stat.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters Bar */}
                <div className="bg-[#121215]/80 backdrop-blur-sm border border-white/[0.04] rounded-2xl p-4 mb-10">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, wallet address, or organization..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/[0.05] rounded-xl pl-11 pr-4 py-2 text-[13px] focus:border-indigo-400/30 transition-all text-slate-200 placeholder:text-slate-600 outline-none"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-black/20 border border-white/[0.05] rounded-xl px-3 py-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</span>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="bg-transparent text-[11px] font-bold text-slate-300 outline-none cursor-pointer focus:text-white transition-colors"
                                >
                                    <option value="all">ALL</option>
                                    {uniqueRoles.map((role: string) => <option key={role} value={role}>{role.toUpperCase()}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-black/20 border border-white/[0.05] rounded-xl px-3 py-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sort</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-[11px] font-bold text-slate-300 outline-none cursor-pointer focus:text-white transition-colors"
                                >
                                    <option value="recent">RECENCY</option>
                                    <option value="attestations">AUTHORITY</option>
                                    <option value="total_proof">VOLUME</option>
                                </select>
                            </div>

                            <div className="h-6 w-[1px] bg-white/[0.05] mx-1" />

                            <label className="flex items-center gap-2.5 cursor-pointer group px-2 py-1">
                                <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${attestedOnly ? 'bg-emerald-500 border-emerald-500' : 'border-white/[0.1] bg-black/40'}`}>
                                    {attestedOnly && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={attestedOnly}
                                    onChange={(e) => setAttestedOnly(e.target.checked)}
                                    className="hidden"
                                />
                                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-200 uppercase tracking-widest transition-colors">Verified Only</span>
                            </label>

                            <label className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 relative">
                                <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${spamFilter ? 'bg-red-500 border-red-500' : 'border-white/[0.1] bg-black/40'}`}>
                                    {spamFilter && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={spamFilter}
                                    onChange={(e) => setSpamFilter(e.target.checked)}
                                    className="hidden"
                                />
                                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-200 uppercase tracking-widest transition-colors">High Signal Only</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Candidates Table */}
                <div className="bg-[#121215] border border-white/[0.04] rounded-2xl overflow-hidden min-h-[400px] shadow-2xl relative">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/[0.03]">Candidate Intelligence</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center border-b border-white/[0.03]">Signal Confidence</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hidden md:table-cell border-b border-white/[0.03]">Strategic Fit</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center border-b border-white/[0.03]">Portfolio Authority</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hidden lg:table-cell border-b border-white/[0.03]">Institutional Trust</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/[0.03]">Last Activity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-right border-b border-white/[0.03]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {filteredCandidates.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-2">
                                                <Search className="w-6 h-6 text-slate-700" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No Profiles Found</p>
                                                <p className="text-slate-600 text-[11px]">Adjust your calibration to discover more candidates.</p>
                                            </div>
                                            <button onClick={() => { setSearchTerm(""); setRoleFilter("all"); setAttestedOnly(false); setSpamFilter(false); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-indigo-400 uppercase tracking-widest transition-all mt-4">Clear All Filters</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCandidates.map((candidate) => (
                                    <React.Fragment key={candidate.id}>
                                        <tr
                                            className={`group hover:bg-white/[0.03] transition-all cursor-pointer relative ${expandedId === candidate.id ? 'bg-white/[0.02] shadow-[inset_4px_0_0_0_#6366f1]' : ''}`}
                                            onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-white/[0.08] flex items-center justify-center overflow-hidden shadow-sm shadow-indigo-500/5 group-hover:border-indigo-500/20 transition-all duration-300">
                                                            {candidate.avatarUrl ? (
                                                                <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                                                            ) : (
                                                                <span className="text-[10px] font-black text-indigo-400 font-mono italic opacity-60 uppercase">{candidate.wallet.slice(0, 2)}</span>
                                                            )}
                                                        </div>
                                                        {candidate.recruiterStatus === 'shortlisted' && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121215] shadow-lg shadow-emerald-500/20"></div>
                                                        )}
                                                        {candidate.recruiterStatus === 'rejected' && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#121215] shadow-lg shadow-red-500/20"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 overflow-hidden">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className={`text-[13px] font-bold tracking-tight transition-colors truncate max-w-[140px] md:max-w-[200px] ${candidate.recruiterStatus === 'rejected' ? 'text-slate-600' : 'text-white'}`}>
                                                                {candidate.displayName || "Anonymous Professional"}
                                                            </span>
                                                            {candidate.attestedCount > 0 && (
                                                                <div className="group/shield relative">
                                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 bg-black border border-white/5 rounded px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-emerald-400 opacity-0 group-hover/shield:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                                        Attested
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <span className="text-[9px] font-mono text-slate-500 truncate max-w-[100px] hover:text-slate-300 transition-colors uppercase select-none">
                                                                {candidate.wallet.slice(0, 6)}...{candidate.wallet.slice(-4)}
                                                            </span>
                                                            {candidate.snapshotTags?.slice(0, 2).map((tag: string) => (
                                                                <span key={tag} className="px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.04] text-[9px] font-black text-slate-500 uppercase tracking-wider">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-[0.15em] uppercase border ${candidate.signalStrength === 'Strong' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5' : candidate.signalStrength === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-sm shadow-yellow-500/5' : 'bg-slate-900 text-slate-600 border-white/[0.03]'}`}>
                                                        {candidate.signalStrength === 'Strong' && "HIGH CONFIDENCE"}
                                                        {candidate.signalStrength === 'Medium' && "CALIBRATED"}
                                                        {candidate.signalStrength === 'Low' && "LOW SIGNAL"}
                                                    </div>
                                                    <div className="w-16 h-1 bg-white/[0.02] rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-700 ${candidate.signalStrength === 'Strong' ? 'bg-emerald-500/50' : candidate.signalStrength === 'Medium' ? 'bg-yellow-500/50' : 'bg-red-500/30'}`} style={{ width: `${candidate.signalScore}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 hidden md:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-200 capitalize truncate max-w-[180px]">{candidate.role}</span>
                                                    <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">{candidate.primarySignal || "Standard Contribution"}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-6">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="text-sm font-black text-white font-mono">{candidate.powCount}</span>
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">PROOFS</span>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-white/[0.04]" />
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className={`text-sm font-black font-mono transition-colors ${candidate.attestedCount > 0 ? 'text-emerald-400' : 'text-slate-700'}`}>{candidate.attestedCount}</span>
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ATTESTED</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 hidden lg:table-cell">
                                                <div className="flex flex-wrap gap-2 max-w-[280px]">
                                                    {candidate.attestedOrgs.slice(0, 2).map((org: string) => (
                                                        <div key={org} className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.04] rounded-md flex items-center gap-1.5 shadow-sm">
                                                            <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest truncate max-w-[90px]">{org}</span>
                                                        </div>
                                                    ))}
                                                    {candidate.attestedOrgs.length > 2 && (
                                                        <div className="px-2 py-1 bg-white/[0.02] border border-white/[0.04] rounded-md">
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">+{candidate.attestedOrgs.length - 2}</span>
                                                        </div>
                                                    )}
                                                    {candidate.attestedOrgs.length === 0 && (
                                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] italic select-none">No Verified Anchors</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock className="w-3 h-3 opacity-50" />
                                                    <span className="text-[11px] font-bold font-mono tracking-tight">{new Date(candidate.lastActive).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/cv/${candidate.wallet}`}
                                                        target="_blank"
                                                        className="p-2 hover:bg-indigo-500/5 rounded-lg transition-all text-slate-600 hover:text-indigo-400 group/btn"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="Strategic Review"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        className="p-2 hover:bg-red-500/5 rounded-lg transition-all text-slate-600 hover:text-red-400 group/btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCandidateToDelete(candidate.id);
                                                        }}
                                                        title="Archive Decision"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {expandedId === candidate.id && (
                                            <tr className="bg-[#0c0c0e]/50 backdrop-blur-sm">
                                                <td colSpan={7} className="px-12 py-12 border-l-[3px] border-indigo-500/50 relative overflow-hidden">
                                                    {/* Background Pattern */}
                                                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 relative z-10">
                                                        {/* Separator Line with soft glow */}
                                                        <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[1px] bg-white/[0.04] -translate-x-1/2 shadow-[0_0_15px_rgba(255,255,255,0.02)]"></div>

                                                        {/* Credentials Side */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-10">
                                                                <div className="flex flex-col gap-1">
                                                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2.5">
                                                                        <Briefcase className="w-3.5 h-3.5 opacity-80" /> Candidate Intelligence
                                                                    </h4>
                                                                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest pl-6">Deep Signal Correlation</span>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Verification ID</span>
                                                                    <span className="text-[9px] font-mono text-indigo-500/50 uppercase">CV-{candidate.wallet.slice(0, 8)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                {candidate.attestedCount > 0 ? (
                                                                    <div className="p-8 bg-white/[0.01] border border-white/[0.04] rounded-2xl relative group/card overflow-hidden">
                                                                        <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover/card:opacity-[0.08] transition-all duration-700 group-hover/card:scale-110">
                                                                            <ShieldCheck className="w-32 h-32 text-indigo-500" />
                                                                        </div>
                                                                        <div className="relative z-10">
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <div className="h-[1px] w-4 bg-indigo-500/50"></div>
                                                                                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Protocol Verified</p>
                                                                            </div>
                                                                            <p className="text-sm font-bold text-white mb-3 pr-12 leading-snug font-serif italic opacity-90">"Consolidated professional authority anchored by immutable on-chain evidence."</p>
                                                                            <p className="text-[12px] text-slate-500 leading-relaxed max-w-sm mb-8 font-medium">This professional has successfully correlated multiple high-authority signals, providing a verified foundation for strategic evaluation.</p>
                                                                            <Link href={`/cv/${candidate.wallet}`} target="_blank" className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-indigo-500/5 group/btn">
                                                                                Review Full Dossier <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-12 border border-dashed border-white/[0.05] rounded-3xl flex flex-col items-center text-center bg-black/10">
                                                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-5 text-slate-700 shadow-inner">
                                                                            <AlertCircle className="w-6 h-6" />
                                                                        </div>
                                                                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Signal Attenuation</h5>
                                                                        <p className="text-[11px] text-slate-600 leading-relaxed max-w-[280px] font-medium italic">No verified on-chain anchors detected for this quadrant. Manual verification of external professional history is recommended.</p>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                                                                    <Users className="w-4 h-4 text-slate-700" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Network Consensus</span>
                                                                        <span className="text-[11px] font-bold text-slate-400">{candidate.attestedOrgs.length > 0 ? `${candidate.attestedOrgs.length} Verified Institutional Relays` : "Organic Network Growth"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Calibration Side */}
                                                        <div className="flex flex-col h-full">
                                                            <div className="flex items-center justify-between mb-10">
                                                                <div className="flex flex-col gap-1">
                                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Pipeline Calibration</h4>
                                                                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Strategic Placement</span>
                                                                </div>
                                                                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${candidate.recruiterStatus === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : candidate.recruiterStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-900 text-slate-600 border-white/[0.03]'}`}>
                                                                    {candidate.recruiterStatus ? candidate.recruiterStatus.toUpperCase() : 'UNDER REVIEW'}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-8 flex-1 flex flex-col">
                                                                <div className="flex gap-4">
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(candidate.id, candidate.recruiterStatus === 'shortlisted' ? 'pending' : 'shortlisted')}
                                                                        className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.25em] rounded-xl transition-all border ${candidate.recruiterStatus === 'shortlisted'
                                                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                                                                            : "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/60 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10"
                                                                            }`}
                                                                    >
                                                                        {candidate.recruiterStatus === 'shortlisted' ? 'SHORTLISTED' : 'PROMOTE'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(candidate.id, candidate.recruiterStatus === 'rejected' ? 'pending' : 'rejected')}
                                                                        className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.25em] rounded-xl transition-all border ${candidate.recruiterStatus === 'rejected'
                                                                            ? "bg-red-500 text-white border-red-500 shadow-[0_10px_30px_rgba(239,68,68,0.3)]"
                                                                            : "bg-red-500/5 border-red-500/10 text-red-500/60 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                                                                            }`}
                                                                    >
                                                                        {candidate.recruiterStatus === 'rejected' ? 'REJECTED' : 'ARCHIVE'}
                                                                    </button>
                                                                </div>

                                                                <div className="relative flex-1 group/notes">
                                                                    <div className="absolute top-4 left-5 text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] pointer-events-none group-focus-within/notes:text-indigo-400/70 transition-colors flex items-center gap-2">
                                                                        <div className="w-2 h-[1px] bg-current opacity-30"></div>
                                                                        Evaluation Synthesis
                                                                    </div>
                                                                    <textarea
                                                                        value={noteDraft}
                                                                        onChange={(e) => setNoteDraft(e.target.value)}
                                                                        onBlur={handleSaveNote}
                                                                        placeholder="Record strategic observations, verdict rationale, or next steps..."
                                                                        className="w-full h-full min-h-[180px] bg-black/40 border border-white/[0.04] rounded-2xl p-6 pt-12 text-[14px] outline-none focus:border-indigo-500/20 focus:bg-black/60 transition-all placeholder:text-slate-800 resize-none text-slate-300 leading-relaxed font-medium shadow-inner"
                                                                    />
                                                                    {isSavingNote && (
                                                                        <div className="absolute bottom-6 right-6 flex items-center gap-2.5 px-3 py-1.5 bg-black/80 rounded-lg border border-white/5 shadow-2xl backdrop-blur-md">
                                                                            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                                                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Archiving</span>
                                                                        </div>
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

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Terminate Recruitment?"
                message={`Are you sure you want to delete "${data?.collection.title}"? This action cannot be undone and all candidate data will be lost.`}
                confirmLabel={isDeleting ? "Terminating..." : "Terminate"}
                confirmButtonColor="red"
                iconColor="red"
            />

            <ConfirmationModal
                isOpen={!!candidateToDelete}
                onClose={() => setCandidateToDelete(null)}
                onConfirm={handleDeleteCandidate}
                title="Archive Candidate?"
                message="Are you sure you want to remove this candidate from the pipeline? This action cannot be undone."
                confirmLabel="Archive"
                confirmButtonColor="red"
                iconColor="red"
            />
        </div>
    );
}
