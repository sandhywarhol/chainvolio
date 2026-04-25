"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, XCircle, CheckCircle, Globe, Clock, ShieldAlert, LayoutDashboard, Code2, Star, Users, Building, ExternalLink, RotateCcw, Ban, Trash2, Clock8, Search, Filter, BarChart3, TrendingUp, PieChart } from "lucide-react";
import { getBadgeStyles } from "@/lib/paymentConfig";


import { format } from "date-fns";
import { Toast } from "@/components/ui/Toast";

const ADMIN_WALLET = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

// ── Tier icon map (icon-only, colors/labels come from getBadgeStyles) ──────
const TIER_ICONS: Record<string, any> = {
    "Builder":                Code2,
    "Public Figure":          Star,
    "Community / DAO":        Users,
    "Company / Organization": Building,
};

function TierBadge({ type }: { type: string }) {
    const s = getBadgeStyles(type);
    const Icon = TIER_ICONS[type] || ShieldCheck;
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tight ${s.color}`}>
            <Icon className="w-2.5 h-2.5" />
            {s.tierLabel}
        </span>
    );
}

type OrgRequest = {
    id: string;
    name: string;
    type: string;
    wallet_address: string;
    website: string;
    social_link: string;
    proof: string;
    status: string;
    created_at: string;
    rejection_reason?: string;
    tx_signature?: string;
    amount_paid?: number;
    expires_at?: string;
    profiles?: { card_number: number, display_name: string };
};


export default function AdminVerificationPage() {
    const { publicKey, signMessage, connected } = useWallet();
    const [requests, setRequests] = useState<OrgRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ 
        id: string, 
        action: 'approve' | 'reject' | 'revoke' | 'reset' | 'expire' | 'delete', 
        name: string 
    } | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" } | null>(null);
    const [activeTab, setActiveTab] = useState<"pending" | "reviewed" | "curated">("pending");
    const [curatedSearch, setCuratedSearch] = useState("");
    const [curatedProfile, setCuratedProfile] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [grantLoading, setGrantLoading] = useState(false);
    const [selectedTier, setSelectedTier] = useState("Builder");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [tierFilter, setTierFilter] = useState("all");
    const [showTestUsers, setShowTestUsers] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [analytics, setAnalytics] = useState<{ totalUsers: number; topCountries: any[] } | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);



    const isAdmin = publicKey?.toBase58() === ADMIN_WALLET;

    useEffect(() => {
        if (!connected) {
            setLoading(false);
            return;
        }
        if (publicKey?.toBase58() !== ADMIN_WALLET) {
            setIsAuthorized(false);
            setLoading(false);
            return;
        }
        setIsAuthorized(true);
        fetchRequests();
    }, [connected, publicKey, showTestUsers]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "admin_access");
            if (!signedAction) {
                setLoading(false);
                return;
            }

            const res = await fetch("/api/admin/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    adminWallet: ADMIN_WALLET, 
                    signature: signedAction.signature, 
                    nonce: signedAction.nonce, 
                    timestamp: signedAction.timestamp, 
                    showTestUsers 
                }),
            });

            if (!res.ok) throw new Error("Failed to fetch requests");
            const data = await res.json();
            setRequests(data.data || []);
            if (data.analytics) setAnalytics(data.analytics);

        } catch (err) {
            console.error("Fetch requests failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: string) => {
        setActionLoading(id);
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            
            // Map action for signature
            let actionType: any = `admin_${action}`;
            if (action === 'approve') actionType = 'approve_org';
            else if (action === 'reject') actionType = 'reject_org';

            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, actionType);
            if (!signedAction) {
                setActionLoading(null);
                return;
            }

            const res = await fetch("/api/admin/organizations/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id, action,
                    reason: (action === 'reject' || action === 'revoke') ? rejectionReason : null,
                    adminWallet: ADMIN_WALLET,
                    signature: signedAction.signature,
                    nonce: signedAction.nonce,
                    timestamp: signedAction.timestamp
                }),
            });

            if (!res.ok) throw new Error(`Failed to ${action} request`);

            // Refresh or update local state
            if (action === 'delete') {
                setRequests(prev => prev.filter(r => r.id !== id));
            } else {
                let newStatus = action;
                if (action === 'approve') newStatus = 'verified';
                else if (action === 'reject') newStatus = 'rejected';
                else if (action === 'reset')   newStatus = 'pending';
                else if (action === 'expire')  newStatus = 'expired';

                setRequests(prev => prev.map(r => r.id === id
                    ? { ...r, status: newStatus, rejection_reason: (action === 'reject' || action === 'revoke') ? rejectionReason : undefined }
                    : r
                ));
            }
            
            setShowConfirm(null);
            setRejectionReason("");
            setToast({ message: `Successfully processed: ${action}.`, type: "success" });
        } catch (err: any) {
            setToast({ message: err.message || "Action failed.", type: "error" });
        } finally {
            setActionLoading(null);
        }
    };

    const handleCuratedSearch = async () => {
        if (!curatedSearch) return;
        setSearchLoading(true);
        setCuratedProfile(null);
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "admin_access");
            if (!signedAction) {
                setToast({ message: "Could not obtain session signature.", type: "error" });
                return;
            }

            const res = await fetch("/api/admin/curated/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    adminWallet: ADMIN_WALLET, 
                    signature: signedAction.signature, 
                    nonce: signedAction.nonce, 
                    timestamp: signedAction.timestamp, 
                    cvId: curatedSearch, 
                    showTestUsers 
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Search failed");
            
            setCuratedProfile(data.data);
            setToast({ message: "Profile found", type: "success" });
        } catch (err: any) {
            setToast({ message: err.message || "Failed to find profile", type: "error" });
        } finally {
            setSearchLoading(false);
        }
    };

    const handleGrantVerification = async () => {
        if (!curatedProfile) return;
        setGrantLoading(true);
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "admin_access");
            if (!signedAction) {
                setToast({ message: "Could not obtain session signature.", type: "error" });
                return;
            }

            const res = await fetch("/api/admin/curated/grant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    adminWallet: ADMIN_WALLET, 
                    signature: signedAction.signature, 
                    nonce: signedAction.nonce, 
                    timestamp: signedAction.timestamp, 
                    walletAddress: curatedProfile.wallet_address, 
                    tier: selectedTier 
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Grant failed");
            
            setToast({ message: "User successfully verified via admin override", type: "success" });
            setCuratedProfile(null);
            setCuratedSearch("");
            fetchRequests();
        } catch (err: any) {
            setToast({ message: err.message || "Failed to grant verification", type: "error" });
        } finally {
            setGrantLoading(false);
        }
    };

    if (!connected) {
        return (
            <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
                <Navbar />
                <div className="flex flex-col items-center justify-center pt-48 pb-20 px-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-8 relative">
                        <LayoutDashboard className="w-8 h-8 text-slate-500" />
                        <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full" />
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-4">Admin Dashboard</h1>
                    <p className="text-white/40 mb-8 max-w-sm">Please connect your authorized wallet to access the verification portal.</p>
                    <WalletMultiButton />
                </div>
                <Footer />
            </main>
        );
    }

    if (isAuthorized === false) {
        return (
            <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
                <Navbar />
                <div className="flex flex-col items-center justify-center pt-48 pb-20 px-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-4">Unauthorized Access</h1>
                    <p className="text-red-400 font-medium bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">This page is restricted to admin wallets only.</p>
                    <p className="text-white/20 mt-8 text-sm">Target wallet not recognized: <br /><span className="text-white/40 font-mono">{publicKey?.toBase58()}</span></p>
                </div>
                <Footer />
            </main>
        );
    }

    const allPending  = requests.filter(r => r.status === "pending");
    const allReviewed = requests.filter(r => r.status !== "pending");

    const filteredRequests = requests.filter(r => {
        // If status filter is 'all', respect the active tab
        if (statusFilter === "all") {
            if (activeTab === "pending" && r.status !== "pending") return false;
            if (activeTab === "reviewed" && r.status === "pending") return false;
        }

        // Search logic
        const s = searchTerm.toLowerCase();
        const matchesSearch = !s || 
            r.wallet_address.toLowerCase().includes(s) ||
            r.name.toLowerCase().includes(s) ||
            (r.tx_signature && r.tx_signature.toLowerCase().includes(s)) ||
            r.type.toLowerCase().includes(s);

        // Status logic
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;

        // Tier logic
        const t = tierFilter.toLowerCase();
        const matchesTier = tierFilter === "all" || 
            r.type.toLowerCase().includes(t.includes("public") ? "public" : t.includes("comm") ? "comm" : t.includes("comp") ? "comp" : t);

        // Date range logic
        const date = new Date(r.created_at);
        const matchesStartDate = !startDate || date >= new Date(startDate);
        const matchesEndDate = !endDate || date <= new Date(new Date(endDate).getTime() + 86400000);

        return matchesSearch && matchesStatus && matchesTier && matchesStartDate && matchesEndDate;
    });

    const verifiedUsersList = requests.filter(r => r.status === "verified");
    const activeSubscribersCount = verifiedUsersList.filter(r => {
        if (!r.expires_at) return true;
        return new Date(r.expires_at) > new Date();
    }).length;
    const expiredUsersCount = requests.filter(r => {
        if (r.status === 'expired') return true;
        if (r.expires_at && new Date(r.expires_at) < new Date()) return true;
        return false;
    }).length;
    const expiringSoonCount = verifiedUsersList.filter(r => {
        if (!r.expires_at) return false;
        const diff = new Date(r.expires_at).getTime() - new Date().getTime();
        return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
    }).length;

    const tierDist = {
        builder: verifiedUsersList.filter(r => r.type.toLowerCase().includes("builder")).length,
        figure: verifiedUsersList.filter(r => r.type.toLowerCase().includes("public") || r.type.toLowerCase().includes("figure")).length,
        community: verifiedUsersList.filter(r => r.type.toLowerCase().includes("community") || r.type.toLowerCase().includes("dao")).length,
        company: verifiedUsersList.filter(r => r.type.toLowerCase().includes("company") || r.type.toLowerCase().includes("organization")).length,
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-slate-500/30 font-sans">
            <Navbar />

            <div className="pt-24 pb-20 px-8 max-w-[1400px] mx-auto w-full">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-700">Internal</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Live Portal</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tighter">Identity Verification Requests</h1>
                        <p className="text-white/40 max-w-md">Review and approve identity verification requests across all tiers.</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logged in As</p>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-white/60">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            {ADMIN_WALLET.slice(0, 6)}...{ADMIN_WALLET.slice(-6)}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Pending</span>
                        <span className="text-xl md:text-3xl font-bold text-yellow-400">{allPending.length}</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Approved</span>
                        <span className="text-xl md:text-3xl font-bold text-emerald-400">{allReviewed.filter(r => r.status === "verified").length}</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Rejected</span>
                        <span className="text-xl md:text-3xl font-bold text-red-400">{allReviewed.filter(r => r.status === "rejected").length}</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total</span>
                        <span className="text-xl md:text-3xl font-bold text-white">{requests.length}</span>
                    </div>
                </div>

                {/* Search and Advanced Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center justify-between">
                    <div className="relative w-full lg:w-[450px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search wallet, name, tx signature, tier..." 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-12 py-3.5 text-sm focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-600 focus:bg-white/[0.05]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-2xl px-3 py-2">
                             <Filter className="w-3.5 h-3.5 text-slate-500" />
                             <select 
                                className="bg-transparent text-xs font-bold text-slate-400 outline-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                                <option value="revoked">Revoked</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-2xl px-3 py-2">
                             <select 
                                className="bg-transparent text-xs font-bold text-slate-400 outline-none cursor-pointer"
                                value={tierFilter}
                                onChange={(e) => setTierFilter(e.target.value)}
                            >
                                <option value="all">All Tiers</option>
                                <option value="builder">Builder</option>
                                <option value="public_figure">Public Figure</option>
                                <option value="community">Community / DAO</option>
                                <option value="company">Company / Org</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-black text-slate-600 tracking-tighter">From</span>
                                <input 
                                    type="date" 
                                    className="bg-transparent text-xs text-slate-400 outline-none [color-scheme:dark] cursor-pointer" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="w-[1px] h-3 bg-white/10" />
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-black text-slate-600 tracking-tighter">To</span>
                                <input 
                                    type="date" 
                                    className="bg-transparent text-xs text-slate-400 outline-none [color-scheme:dark] cursor-pointer" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {(searchTerm || statusFilter !== "all" || tierFilter !== "all" || startDate || endDate) && (
                            <button 
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                    setTierFilter("all");
                                    setStartDate("");
                                    setEndDate("");
                                }}
                                className="px-4 py-2 rounded-2xl bg-white/5 text-slate-400 hover:text-white border border-white/5 text-xs font-bold transition-all flex items-center gap-2"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs & Analytics Toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "pending" && statusFilter === "all"
                                ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                                : "bg-white/[0.02] border border-white/5 text-slate-500 hover:text-white"
                            }`}
                        >
                            Pending Review ({allPending.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("reviewed")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "reviewed" || statusFilter !== "all"
                                ? "bg-slate-500/10 border border-slate-500/30 text-slate-300"
                                : "bg-white/[0.02] border border-white/5 text-slate-500 hover:text-white"
                            }`}
                        >
                            {statusFilter !== "all" ? `Filtered Results (${filteredRequests.length})` : `Reviewed (${allReviewed.length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab("curated")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "curated"
                                ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                                : "bg-white/[0.02] border border-white/5 text-slate-500 hover:text-white"
                            }`}
                        >
                            Curated Verification
                        </button>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <label className="flex items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity mr-2">
                            <div className={`w-8 h-4 rounded-full transition-colors relative ${showTestUsers ? 'bg-indigo-500' : 'bg-white/10'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showTestUsers ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Show Test Users</span>
                            <input type="checkbox" className="hidden" checked={showTestUsers} onChange={(e) => setShowTestUsers(e.target.checked)} />
                        </label>
                        <div className="w-[1px] h-4 bg-white/10 mr-2" />
                        <button onClick={fetchRequests} className="text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                            <RotateCcw className="w-3 h-3" /> Refresh
                        </button>
                        <button 
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border ${
                                showAnalytics 
                                ? "bg-purple-500/10 border-purple-500/30 text-purple-400" 
                                : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.04]"
                            }`}
                        >
                            {showAnalytics ? <TrendingUp className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                            {showAnalytics ? "Hide Intelligence" : "Platform Analytics"}
                        </button>
                    </div>
                </div>

                {/* Analytics Section */}
                {showAnalytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-top-4">
                        {/* Core Intelligence */}
                        <div className="lg:col-span-1 p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <TrendingUp className="w-32 h-32" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em] mb-8 flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Platform Growth
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-end justify-between border-b border-white/[0.03] pb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Total Ecosystem Users</span>
                                        <span className="text-2xl font-bold font-mono text-white/90">{analytics?.totalUsers || 0}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-emerald-500/60 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">Active Index</span>
                                </div>
                                <div className="flex items-end justify-between border-b border-white/[0.03] pb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Entities</span>
                                        <span className="text-2xl font-bold font-mono text-emerald-400">{verifiedUsersList.length}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-white/20">{((verifiedUsersList.length / (analytics?.totalUsers || 1)) * 100).toFixed(1)}% Conversion</span>
                                </div>
                                <div className="flex items-end justify-between border-b border-white/[0.03] pb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Subscriptions</span>
                                        <span className="text-2xl font-bold font-mono text-blue-400">{activeSubscribersCount}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-bold text-amber-500/60 uppercase">{expiringSoonCount} Expiring Soon</span>
                                        <span className="text-[9px] font-bold text-red-500/40 uppercase">{expiredUsersCount} Expired</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tier Distribution */}
                        <div className="lg:col-span-1 p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative group">
                            <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em] mb-8 flex items-center gap-2">
                                <PieChart className="w-3.5 h-3.5 text-blue-500" /> Tier Distribution
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Builder", count: tierDist.builder, color: "bg-emerald-500" },
                                    { label: "Public Figure", count: tierDist.figure, color: "bg-pink-500" },
                                    { label: "Community", count: tierDist.community, color: "bg-blue-500" },
                                    { label: "Company", count: tierDist.company, color: "bg-amber-500" }
                                ].map((tier) => (
                                    <div key={tier.label} className="space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-slate-500 uppercase tracking-widest">{tier.label}</span>
                                            <span className="text-white font-mono">{tier.count} <span className="text-slate-700">/ {verifiedUsersList.length}</span></span>
                                        </div>
                                        <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${tier.color} opacity-60 rounded-full transition-all duration-1000`} 
                                                style={{ width: `${(tier.count / (verifiedUsersList.length || 1)) * 100}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Geographic & Expansion */}
                        <div className="lg:col-span-1 p-8 rounded-[32px] bg-white/[0.02] border border-white/5 group">
                            <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em] mb-8 flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-teal-400" /> Geographic Penetration
                            </h3>
                            <div className="space-y-5">
                                {analytics?.topCountries && analytics.topCountries.length > 0 ? (
                                    analytics.topCountries.map((c, i) => (
                                        <div key={c.name} className="flex items-center justify-between group/geo">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono text-slate-700">0{i+1}</span>
                                                <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">{c.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-mono font-bold text-white/40">{c.count} users</span>
                                                <div className="w-12 h-1 bg-white/[0.04] rounded-full">
                                                    <div 
                                                        className="h-full bg-teal-500/40 rounded-full" 
                                                        style={{ width: `${(c.count / analytics.totalUsers) * 100}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-30 italic text-xs">
                                        No geographic data available
                                    </div>
                                )}
                                <div className="pt-6 border-t border-white/[0.03] mt-4 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">Global Trust Layer</span>
                                    <span className="text-[8px] font-mono text-slate-800">Uptime: 99.9%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === "curated" ? (
                    <div className="rounded-[32px] bg-white/[0.01] border border-white/5 overflow-hidden p-8 max-w-2xl mx-auto mt-8">
                        <h2 className="text-2xl font-bold mb-2">Curated Verification</h2>
                        <p className="text-white/40 mb-8">Manually verify early adopters, high-impact users, and strategic accounts without requiring payment.</p>
                        
                        <div className="flex gap-4 mb-8">
                            <input 
                                type="text" 
                                placeholder="Enter numeric CV ID (e.g. 7)" 
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-600 focus:bg-white/[0.05]"
                                value={curatedSearch}
                                onChange={(e) => setCuratedSearch(e.target.value.replace(/[^0-9]/g, ''))}
                                onKeyDown={(e) => e.key === 'Enter' && handleCuratedSearch()}
                            />
                            <button 
                                onClick={handleCuratedSearch}
                                disabled={searchLoading || !curatedSearch}
                                className="px-8 py-4 rounded-2xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {searchLoading ? "Searching..." : "Search"}
                            </button>
                        </div>

                        {curatedProfile && (
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 mt-6 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold">{curatedProfile.display_name} <span className="text-slate-500 font-mono text-sm ml-2">#{String(curatedProfile.card_number).padStart(5, '0')}</span></h3>
                                        <p className={curatedProfile.role && curatedProfile.role.toLowerCase() !== 'none' ? "text-slate-400 mb-2 font-medium" : "text-slate-500/70 mb-2 italic text-sm"}>
                                            {curatedProfile.role && curatedProfile.role.toLowerCase() !== 'none' ? curatedProfile.role : "Add your role"}
                                        </p>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 font-mono text-[10px] text-white/60 mb-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                            {curatedProfile.wallet_address}
                                        </div>
                                        <div className="mt-2">
                                            <a 
                                                href={`/cv/${curatedProfile.wallet_address}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all font-bold"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> View Profile CV
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Status</span>
                                        {curatedProfile.verification_status === 'verified' ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-tight flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {curatedProfile.verification_status}</span>
                                                <span className="text-[10px] text-slate-400">{curatedProfile.verification_tier}</span>
                                            </div>
                                        ) : (
                                            <span className="px-2 py-1 rounded bg-slate-500/10 border border-slate-500/20 text-slate-400 text-xs font-bold uppercase tracking-tight flex items-center gap-1"><Clock8 className="w-3 h-3" /> {curatedProfile.verification_status}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Select Verification Tier to Grant</label>
                                    <select 
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500/50 outline-none transition-all cursor-pointer mb-6"
                                        value={selectedTier}
                                        onChange={(e) => setSelectedTier(e.target.value)}
                                    >
                                        <option value="Builder" className="bg-slate-900 text-white">Builder (Individual)</option>
                                        <option value="Public Figure" className="bg-slate-900 text-white">Public Figure (High Profile)</option>
                                        <option value="Community / DAO" className="bg-slate-900 text-white">Community / DAO (Group)</option>
                                        <option value="Company / Organization" className="bg-slate-900 text-white">Company / Organization (Enterprise)</option>
                                    </select>

                                    <button 
                                        onClick={handleGrantVerification}
                                        disabled={grantLoading}
                                        className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {grantLoading ? "Processing..." : (
                                            <>
                                                <CheckCircle className="w-5 h-5" /> Grant Verification
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (

                <div className="rounded-[32px] bg-white/[0.01] border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold">
                                {statusFilter !== "all" ? "Search Results" : 
                                 activeTab === "pending" ? "New Submissions" : "Reviewed Requests"}
                            </h2>

                            {activeTab === "pending" && (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                                    <Clock className="w-3.5 h-3.5" />
                                    Action Required
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.01] border-b border-white/5 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-4 font-normal">CV ID</th>
                                    <th className="px-8 py-4 font-normal">Applicant</th>
                                    <th className="px-8 py-4 font-normal">Requested Tier</th>
                                    <th className="px-8 py-4 font-normal">Sub Expires</th>
                                    <th className="px-8 py-4 font-normal">Wallet</th>
                                    <th className="px-8 py-4 font-normal">Amount</th>
                                    <th className="px-8 py-4 font-normal">Tx Signature</th>
                                    <th className="px-8 py-4 font-normal">Website</th>
                                    <th className="px-8 py-4 font-normal text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="px-8 py-20 text-center text-slate-500 italic">Loading requests…</td>

                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-8 py-20 text-center text-slate-500 italic">

                                            {statusFilter !== "all" || searchTerm ? "No results found for your search/filters." :
                                             activeTab === "pending" ? "No pending requests. Good work, Admin." : "No reviewed requests yet."}
                                        </td>
                                    </tr>
                                ) : filteredRequests.map((req) => (

                                    <tr key={req.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-6">
                                            {req.profiles?.card_number ? (
                                                <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                                                    #{req.profiles.card_number}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-base font-bold leading-tight max-w-[200px] truncate" title={req.profiles?.display_name || req.name}>{req.profiles?.display_name || req.name}</span>
                                                <span className="text-[10px] text-slate-500 italic font-medium mb-1">
                                                    Submitted {format(new Date(req.created_at), 'MMM d, p')}
                                                </span>
                                                <a 
                                                    href={`/cv/${req.wallet_address}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-purple-400 transition-all"
                                                >
                                                    <ExternalLink className="w-2.5 h-2.5" /> View CV
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <TierBadge type={req.type} />
                                        </td>
                                        <td className="px-8 py-6">
                                            {(req.type.toLowerCase().includes("company") || req.type.toLowerCase().includes("community") || req.type.toLowerCase().includes("org") || req.type.toLowerCase().includes("dao")) && req.status === "verified" && req.expires_at ? (
                                                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 whitespace-nowrap inline-flex items-center gap-1">
                                                    <Clock8 className="w-3 h-3" />
                                                    {(() => {
                                                        const diff = new Date(req.expires_at).getTime() - Date.now();
                                                        if (diff <= 0) return "Expired";
                                                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                        if (days > 30) return `${Math.floor(days/30)} months left`;
                                                        if (days > 0) return `${days} days left`;
                                                        const hours = Math.floor(diff / (1000 * 60 * 60));
                                                        if (hours > 0) return `${hours} hrs left`;
                                                        return "Expiring soon";
                                                    })()}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div
                                                className="flex items-center gap-2 cursor-pointer group/wallet"
                                                onClick={() => navigator.clipboard.writeText(req.wallet_address)}
                                                title="Click to copy"
                                            >
                                                <div className="p-1 rounded bg-slate-900 border border-white/5">
                                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                </div>
                                                <span className="text-xs font-mono text-white/40 group-hover/wallet:text-white/60 transition-colors">
                                                    {req.wallet_address.slice(0, 8)}…{req.wallet_address.slice(-8)}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Amount Paid */}
                                        <td className="px-8 py-6">
                                            {req.amount_paid !== undefined && req.amount_paid !== null ? (
                                                <span className={`text-sm font-bold ${
                                                    req.amount_paid > 0 ? "text-emerald-400" : "text-white/30"
                                                }`}>
                                                    {req.amount_paid > 0 ? `${req.amount_paid} USDC` : "Free"}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">-</span>
                                            )}
                                        </td>
                                        {/* Tx Signature */}
                                        <td className="px-8 py-6">
                                            {req.tx_signature ? (
                                                <a
                                                    href={`https://solscan.io/tx/${req.tx_signature}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 group/tx"
                                                    title={req.tx_signature}
                                                >
                                                    <ExternalLink className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                    <span className="text-xs font-mono text-blue-400/60 group-hover/tx:text-blue-400 transition-colors">
                                                        {req.tx_signature.slice(0, 8)}…{req.tx_signature.slice(-6)}
                                                    </span>
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {req.website ? (
                                                <a href={req.website} target="_blank" className="flex items-center gap-2 group/link">
                                                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                                                    <span className="text-xs text-white/40 group-hover/link:text-blue-400 transition-colors underline-offset-4 hover:underline truncate max-w-[160px]">
                                                        {req.website}
                                                    </span>
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">-</span>
                                            )}
                                        </td>

                                         {/* Status + Actions column (reviewed logic) */}
                                         {req.status !== "pending" && (

                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="mr-4 flex flex-col items-end gap-1">
                                                        {req.status === "verified" ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-tight">
                                                                <CheckCircle className="w-2.5 h-2.5" /> Approved
                                                            </span>
                                                        ) : req.status === "rejected" ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-tight">
                                                                <XCircle className="w-2.5 h-2.5" /> Rejected
                                                            </span>
                                                        ) : req.status === "revoked" ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-bold uppercase tracking-tight">
                                                                <Ban className="w-2.5 h-2.5" /> Revoked
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[9px] font-bold uppercase tracking-tight">
                                                                <Clock8 className="w-2.5 h-2.5" /> {req.status}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => setShowConfirm({ id: req.id, action: 'reset', name: req.name })}
                                                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all border border-white/5"
                                                        title="Reset to Pending"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {req.status === 'verified' && (
                                                        <>
                                                            <button
                                                                onClick={() => setShowConfirm({ id: req.id, action: 'expire', name: req.name })}
                                                                className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all border border-orange-500/20"
                                                                title="Force Expire"
                                                            >
                                                                <Clock8 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setShowConfirm({ id: req.id, action: 'revoke', name: req.name })}
                                                                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                                title="Revoke Verification"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => setShowConfirm({ id: req.id, action: 'delete', name: req.name })}
                                                        className="p-2 rounded-lg bg-red-900/10 text-red-700 hover:bg-red-900 hover:text-white transition-all border border-red-900/20"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                         )}

                                        {/* Actions column (pending logic) */}
                                        {req.status === "pending" && (

                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setShowConfirm({ id: req.id, action: 'reject', name: req.name })}
                                                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowConfirm({ id: req.id, action: 'approve', name: req.name })}
                                                        className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:scale-[1.05] hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Approve
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}
            </div>

            {/* CONFIRMATION OVERLAY */}
            {showConfirm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md">
                    <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden p-8 shadow-2xl">
                        <div className={`p-4 rounded-3xl mb-6 text-center ${
                            showConfirm.action === 'approve' ? 'bg-emerald-500/10' : 
                            showConfirm.action === 'reject' || showConfirm.action === 'revoke' || showConfirm.action === 'delete' ? 'bg-red-500/10' :
                            showConfirm.action === 'reset' ? 'bg-blue-500/10' : 'bg-orange-500/10'
                        }`}>
                            {showConfirm.action === 'approve' ? <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" /> :
                             showConfirm.action === 'reject' ? <XCircle className="w-12 h-12 text-red-500 mx-auto" /> :
                             showConfirm.action === 'revoke' ? <Ban className="w-12 h-12 text-red-500 mx-auto" /> :
                             showConfirm.action === 'reset' ? <RotateCcw className="w-12 h-12 text-blue-500 mx-auto" /> :
                             showConfirm.action === 'expire' ? <Clock8 className="w-12 h-12 text-orange-500 mx-auto" /> :
                             <Trash2 className="w-12 h-12 text-red-700 mx-auto" />}
                        </div>

                        <h3 className="text-2xl font-bold tracking-tighter mb-2 text-center capitalize">
                            {showConfirm.action === 'reset' ? 'Reset to Pending' : 
                             showConfirm.action === 'expire' ? 'Force Expire' :
                             showConfirm.action} Request?
                        </h3>
                        <p className="text-white/40 text-center mb-8 px-4">
                            Are you sure you want to {showConfirm.action === 'reset' ? 'reset' : showConfirm.action} <span className="text-white font-bold">{showConfirm.name}</span>? 
                            {showConfirm.action === 'delete' && " This cannot be undone."}
                            {showConfirm.action === 'reset' && " This will allow re-testing of the approval flow." }
                        </p>

                        {(showConfirm.action === 'reject' || showConfirm.action === 'revoke') && (
                            <textarea
                                placeholder={showConfirm.action === 'revoke' ? "Reason for revocation (optional)" : "State rejection reason (optional)"}
                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-sm focus:border-red-500/50 outline-none mb-6 resize-none min-h-[100px]"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                disabled={!!actionLoading}
                                onClick={() => handleAction(showConfirm.id, showConfirm.action)}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                                    showConfirm.action === 'approve' ? 'bg-emerald-500 text-black hover:bg-emerald-400' :
                                    showConfirm.action === 'reject' || showConfirm.action === 'revoke' || showConfirm.action === 'delete' ? 'bg-red-500 text-white hover:bg-red-600' :
                                    showConfirm.action === 'reset' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                                    'bg-orange-500 text-white hover:bg-orange-600'
                                    } disabled:opacity-50`}
                            >
                                {actionLoading ? 'Processing...' : `Confirm ${showConfirm.action}`}
                            </button>
                            <button
                                onClick={() => { setShowConfirm(null); setRejectionReason(""); }}
                                className="w-full py-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
}
