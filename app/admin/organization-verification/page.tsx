"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, XCircle, CheckCircle, Globe, Clock, ShieldAlert, LayoutDashboard, Code2, Star, Users, Building, ExternalLink, RotateCcw, Ban, Trash2, Clock8 } from "lucide-react";
import { format } from "date-fns";
import bs58 from "bs58";
import { Toast } from "@/components/ui/Toast";

const ADMIN_WALLET = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

// ── Tier badge styles ──────────────────────────────────────────────────────
const TIER_STYLES: Record<string, { color: string; Icon: any; label: string }> = {
    "Builder":               { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", Icon: Code2,     label: "Builder" },
    "Public Figure":         { color: "text-pink-400 bg-pink-500/10 border-pink-500/20",          Icon: Star,      label: "Public Figure" },
    "Community / DAO":       { color: "text-blue-400 bg-blue-500/10 border-blue-500/20",           Icon: Users,     label: "Community / DAO" },
    "Company / Organization":{ color: "text-amber-400 bg-amber-500/10 border-amber-500/20",        Icon: Building,  label: "Company / Org" },
};

function TierBadge({ type }: { type: string }) {
    const style = TIER_STYLES[type] || TIER_STYLES["Builder"];
    const Icon = style.Icon;
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tight ${style.color}`}>
            <Icon className="w-2.5 h-2.5" />
            {style.label}
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
    const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending");

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
    }, [connected, publicKey]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const timestamp = Date.now();
            const nonce = Math.random().toString(36).substring(2, 11);
            const messageStr = `ChainVolio Action: admin_access\nWallet: ${ADMIN_WALLET}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
            const message = new TextEncoder().encode(messageStr);
            const signature = await signMessage!(message);
            const signatureBase58 = bs58.encode(signature);

            const res = await fetch("/api/admin/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminWallet: ADMIN_WALLET, signature: signatureBase58, nonce, timestamp }),
            });

            if (!res.ok) throw new Error("Failed to fetch requests");
            const data = await res.json();
            setRequests(data.data || []);
        } catch (err) {
            console.error("Fetch requests failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: string) => {
        setActionLoading(id);
        try {
            const timestamp = Date.now();
            const nonce = Math.random().toString(36).substring(2, 11);
            
            // Map action for signature
            let actionType = `admin_${action}`;
            if (action === 'approve') actionType = 'approve_org';
            else if (action === 'reject') actionType = 'reject_org';

            const messageStr = `ChainVolio Action: ${actionType}\nWallet: ${ADMIN_WALLET}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
            const message = new TextEncoder().encode(messageStr);
            const signature = await signMessage!(message);
            const signatureBase58 = bs58.encode(signature);

            const res = await fetch("/api/admin/organizations/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id, action,
                    reason: (action === 'reject' || action === 'revoke') ? rejectionReason : null,
                    adminWallet: ADMIN_WALLET,
                    signature: signatureBase58,
                    nonce, timestamp
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

    if (!connected) {
        return (
            <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
                <Navbar />
                <div className="flex flex-col items-center justify-center pt-48 pb-20 px-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-8 relative">
                        <LayoutDashboard className="w-8 h-8 text-slate-500" />
                        <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter mb-4">Admin Dashboard</h1>
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
                    <h1 className="text-4xl font-bold tracking-tighter mb-4">Unauthorized Access</h1>
                    <p className="text-red-400 font-medium bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">This page is restricted to admin wallets only.</p>
                    <p className="text-white/20 mt-8 text-sm">Target wallet not recognized: <br /><span className="text-white/40 font-mono">{publicKey?.toBase58()}</span></p>
                </div>
                <Footer />
            </main>
        );
    }

    const pendingRequests  = requests.filter(r => r.status === "pending");
    const reviewedRequests = requests.filter(r => r.status !== "pending");

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
                        <h1 className="text-4xl font-bold tracking-tighter">Identity Verification Requests</h1>
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
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Pending</span>
                        <span className="text-3xl font-bold text-yellow-400">{pendingRequests.length}</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Approved</span>
                        <span className="text-3xl font-bold text-emerald-400">{reviewedRequests.filter(r => r.status === "verified").length}</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Rejected</span>
                        <span className="text-3xl font-bold text-red-400">{reviewedRequests.filter(r => r.status === "rejected").length}</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total</span>
                        <span className="text-3xl font-bold text-white">{requests.length}</span>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "pending"
                            ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                            : "bg-white/[0.02] border border-white/5 text-slate-500 hover:text-white"
                        }`}
                    >
                        Pending Review ({pendingRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("reviewed")}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "reviewed"
                            ? "bg-slate-500/10 border border-slate-500/30 text-slate-300"
                            : "bg-white/[0.02] border border-white/5 text-slate-500 hover:text-white"
                        }`}
                    >
                        Reviewed ({reviewedRequests.length})
                    </button>
                    <button onClick={fetchRequests} className="ml-auto text-xs font-bold text-slate-500 hover:text-white transition-colors">
                        ↻  Refresh
                    </button>
                </div>

                {/* Main Table */}
                <div className="rounded-[32px] bg-white/[0.01] border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold">
                                {activeTab === "pending" ? "New Submissions" : "Reviewed Requests"}
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
                                    <th className="px-8 py-4 font-normal">Applicant</th>
                                    <th className="px-8 py-4 font-normal">Requested Tier</th>
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
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 italic">Loading requests…</td>
                                    </tr>
                                ) : (activeTab === "pending" ? pendingRequests : reviewedRequests).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 italic">
                                            {activeTab === "pending" ? "No pending requests. Good work, Admin." : "No reviewed requests yet."}
                                        </td>
                                    </tr>
                                ) : (activeTab === "pending" ? pendingRequests : reviewedRequests).map((req) => (
                                    <tr key={req.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-base font-bold leading-tight">{req.name}</span>
                                                <span className="text-[10px] text-slate-500 italic font-medium">
                                                    Submitted {format(new Date(req.created_at), 'MMM d, p')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <TierBadge type={req.type} />
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
                                                <span className="text-xs text-slate-600 italic">—</span>
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
                                                <span className="text-xs text-slate-600 italic">—</span>
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
                                                <span className="text-xs text-slate-600 italic">—</span>
                                            )}
                                        </td>

                                         {/* Status + Actions column (reviewed tab) */}
                                         {activeTab === "reviewed" && (
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

                                        {/* Actions column (pending tab) */}
                                        {activeTab === "pending" && (
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
