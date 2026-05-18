"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ConversationThread } from "@/components/messaging/ConversationThread";
import { Send, MessageSquare, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Conversation = {
    id: string;
    status: string;
    role_position: string;
    initial_message: string;
    candidate_wallet: string;
    recruiter_name: string | null;
    recruiter_company: string | null;
    proposed_interview_date: string | null;
    meeting_link: string | null;
    created_at: string;
    updated_at: string;
    accepted_at: string | null;
    declined_at: string | null;
    unreadCount: number;
};

const STATUS_CONFIG = {
    pending:  { label: "Pending",  icon: Clock,         color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20"  },
    accepted: { label: "Accepted", icon: CheckCircle2,  color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
    declined: { label: "Declined", icon: XCircle,       color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20"    },
    closed:   { label: "Closed",   icon: MessageSquare, color: "text-white/30",   bg: "bg-white/5",       border: "border-white/10"      },
} as const;

export default function OutreachPage() {
    const { publicKey, connected } = useWallet();
    const { session, isGoogleSignedIn } = useGoogleAuth();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    const wallet = publicKey?.toBase58();
    const isLoggedIn = connected || isGoogleSignedIn;

    const fetchConversations = useCallback(async () => {
        try {
            const params = new URLSearchParams({ role: "recruiter" });
            const headers: Record<string, string> = {};

            if (session?.access_token) {
                headers["Authorization"] = `Bearer ${session.access_token}`;
            } else if (wallet) {
                params.set("wallet", wallet);
            } else {
                setLoading(false);
                return;
            }

            const res = await fetch(`/api/messaging/conversations?${params}`, { headers });
            const data = await res.json();
            if (data.ok) setConversations(data.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [wallet, session]);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    useEffect(() => {
        const interval = setInterval(fetchConversations, 15_000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen text-white bg-black">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Send className="w-10 h-10 text-white/10" />
                    <p className="text-white/30 text-sm">Sign in to view your outreach</p>
                </div>
            </main>
        );
    }

    if (loading) return <LoadingScreen message="Loading outreach..." />;

    if (activeConversationId) {
        return (
            <main className="min-h-screen text-white bg-black theme-bg-page theme-aware">
                <Navbar />
                <section className="max-w-2xl mx-auto px-4 pt-24 pb-12">
                    <ConversationThread
                        conversationId={activeConversationId}
                        viewerWallet={wallet}
                        viewerAuthToken={session?.access_token}
                        viewerRole="recruiter"
                        onBack={() => setActiveConversationId(null)}
                    />
                </section>
                <Footer />
            </main>
        );
    }

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    return (
        <main className="min-h-screen text-white bg-black theme-bg-page theme-aware">
            <Navbar />
            <section className="max-w-2xl mx-auto px-4 pt-24 pb-12">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/[0.08] flex items-center justify-center">
                        <Send className="w-5 h-5 text-white/50" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">My Outreach</h1>
                        <p className="text-xs text-white/30">Interview requests you've sent to candidates</p>
                    </div>
                    {totalUnread > 0 && (
                        <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white px-1.5">
                            {totalUnread > 99 ? "99+" : totalUnread}
                        </span>
                    )}
                </div>

                {/* List */}
                {conversations.length === 0 ? (
                    <div className="text-center py-20 space-y-3">
                        <Send className="w-10 h-10 text-white/10 mx-auto" />
                        <p className="text-white/25 text-sm font-bold">No outreach sent yet</p>
                        <p className="text-white/15 text-xs max-w-xs mx-auto">
                            Visit a candidate's CV and click "Contact Candidate" to start a conversation.
                        </p>
                        <Link
                            href="/explore-talent"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            Browse Talent
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {conversations.map((c) => {
                            const statusCfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.closed;
                            const StatusIcon = statusCfg.icon;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveConversationId(c.id)}
                                    className="w-full text-left bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl p-4 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Candidate wallet short */}
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 truncate mb-0.5">
                                                {c.candidate_wallet.slice(0, 6)}…{c.candidate_wallet.slice(-4)}
                                            </p>
                                            <p className="text-sm font-bold text-white group-hover:text-white truncate">
                                                {c.role_position}
                                            </p>
                                            <p className="text-xs text-white/40 mt-1 truncate">{c.initial_message}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                                                <StatusIcon className="w-2.5 h-2.5" />
                                                {statusCfg.label}
                                            </span>
                                            {c.unreadCount > 0 && (
                                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                                                    {c.unreadCount}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-white/20">
                                                {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>
            <Footer />
        </main>
    );
}
