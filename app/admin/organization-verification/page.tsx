"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, XCircle, CheckCircle, Globe, Mail, MapPin, Clock, ExternalLink, ShieldAlert, FileText, LayoutDashboard, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import bs58 from "bs58";

const ADMIN_WALLET = "FwHtKFZY6jRqhtczE7Nkwq7pkR7fb3vWq6YqYSYtGcMv";

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
};

export default function AdminVerificationPage() {
    const { publicKey, signMessage, connected } = useWallet();
    const [requests, setRequests] = useState<OrgRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ id: string, action: 'approve' | 'reject', name: string } | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

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
            // Need to sign message for admin authentication
            const timestamp = Date.now();
            const nonce = Math.random().toString(36).substring(2, 11);
            const messageStr = `ChainVolio Action: admin_access\nWallet: ${ADMIN_WALLET}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
            const message = new TextEncoder().encode(messageStr);
            const signature = await signMessage!(message);
            const signatureBase58 = bs58.encode(signature);

            const res = await fetch("/api/admin/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminWallet: ADMIN_WALLET,
                    signature: signatureBase58,
                    nonce,
                    timestamp
                }),
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

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setActionLoading(id);
        try {
            const timestamp = Date.now();
            const nonce = Math.random().toString(36).substring(2, 11);
            const actionType = action === 'approve' ? 'approve_org' : 'reject_org';
            const messageStr = `ChainVolio Action: ${actionType}\nWallet: ${ADMIN_WALLET}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
            const message = new TextEncoder().encode(messageStr);
            const signature = await signMessage!(message);
            const signatureBase58 = bs58.encode(signature);

            const res = await fetch("/api/admin/organizations/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    action,
                    reason: action === 'reject' ? rejectionReason : null,
                    adminWallet: ADMIN_WALLET,
                    signature: signatureBase58,
                    nonce,
                    timestamp
                }),
            });

            if (!res.ok) throw new Error(`Failed to ${action} organization`);

            // Refresh list
            setRequests(requests.filter(r => r.id !== id));
            setShowConfirm(null);
            setRejectionReason("");
        } catch (err: any) {
            alert(err.message);
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
                        <h1 className="text-4xl font-bold tracking-tighter">Organization Verifications</h1>
                        <p className="text-white/40 max-w-md">Review and validate organizational credentials for the ChainVolio trust network.</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logged in As</p>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-white/60">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            {ADMIN_WALLET.slice(0, 6)}...{ADMIN_WALLET.slice(-6)}
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats / Filters (Static for now) */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Pending Requests</span>
                        <span className="text-3xl font-bold">{requests.length}</span>
                    </div>
                    {/* Placeholder for others */}
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50 relative overflow-hidden flex flex-col items-center justify-center">
                        <span className="text-slate-700 uppercase font-black text-xs tracking-tighter text-center italic">Advanced Controls Locked</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50 relative overflow-hidden flex flex-col items-center justify-center">
                        <span className="text-slate-700 uppercase font-black text-xs tracking-tighter text-center italic">Audit Logs Locked</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50 relative overflow-hidden flex flex-col items-center justify-center">
                        <span className="text-slate-700 uppercase font-black text-xs tracking-tighter text-center italic">User Metrics Locked</span>
                    </div>
                </div>

                {/* Main Content Table Area */}
                <div className="rounded-[32px] bg-white/[0.01] border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold">New Submissions</h2>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                                <Clock className="w-3.5 h-3.5" />
                                Action Required
                            </div>
                        </div>
                        <button onClick={fetchRequests} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Refresh</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.01] border-b border-white/5 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-4 font-normal">Organization</th>
                                    <th className="px-8 py-4 font-normal">Details</th>
                                    <th className="px-8 py-4 font-normal">Verification Proof</th>
                                    <th className="px-8 py-4 font-normal text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">Incoming data...</td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">No pending requests found. Good work, Admin.</td>
                                    </tr>
                                ) : requests.map((req) => (
                                    <tr key={req.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-lg font-bold leading-tight">{req.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-tight">{req.type}</span>
                                                    <span className="text-[10px] text-slate-500 italic font-medium">Submitted {format(new Date(req.created_at), 'MMM d, p')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 group/wallet cursor-pointer" onClick={() => navigator.clipboard.writeText(req.wallet_address)}>
                                                    <div className="p-1 rounded bg-slate-900 border border-white/5">
                                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                    </div>
                                                    <span className="text-xs font-mono text-white/40 group-hover/wallet:text-white/60 transition-colors uppercase">{req.wallet_address.slice(0, 8)}...{req.wallet_address.slice(-8)}</span>
                                                </div>
                                                <a href={req.website} target="_blank" className="flex items-center gap-2 group/link">
                                                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                                                    <span className="text-xs text-white/40 group-hover/link:text-blue-400 transition-colors underline-offset-4 hover:underline truncate max-w-[200px]">{req.website}</span>
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-sm">
                                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 group-hover:border-white/10 transition-all">
                                                <p className="text-xs text-white/50 italic leading-relaxed line-clamp-2">{req.proof || "No additional proof provided."}</p>
                                            </div>
                                        </td>
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
                        <div className={`p-4 rounded-3xl mb-6 text-center ${showConfirm.action === 'approve' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            {showConfirm.action === 'approve' ? (
                                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                            ) : (
                                <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                            )}
                        </div>

                        <h3 className="text-2xl font-bold tracking-tighter mb-2 text-center">
                            {showConfirm.action === 'approve' ? 'Approve' : 'Reject'} Organization?
                        </h3>
                        <p className="text-white/40 text-center mb-8">
                            Are you sure you want to {showConfirm.action} <span className="text-white font-bold">{showConfirm.name}</span>? This action will be logged.
                        </p>

                        {showConfirm.action === 'reject' && (
                            <textarea
                                placeholder="State rejection reason (optional)"
                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-sm focus:border-red-500/50 outline-none mb-6 resize-none min-h-[100px]"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                disabled={!!actionLoading}
                                onClick={() => handleAction(showConfirm.id, showConfirm.action)}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${showConfirm.action === 'approve'
                                    ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                    } disabled:opacity-50`}
                            >
                                {actionLoading ? 'Processing...' : `Confirm ${showConfirm.action === 'approve' ? 'Approval' : 'Rejection'}`}
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirm(null);
                                    setRejectionReason("");
                                }}
                                className="w-full py-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
