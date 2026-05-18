"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { InterviewRequestCard } from "@/components/messaging/InterviewRequestCard";
import { ConversationThread } from "@/components/messaging/ConversationThread";
import { Inbox, MessageSquare, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Conversation = {
    id: string;
    status: string;
    role_position: string;
    initial_message: string;
    recruiter_name: string | null;
    recruiter_company: string | null;
    recruiter_avatar_url: string | null;
    proposed_interview_date: string | null;
    meeting_link: string | null;
    created_at: string;
    updated_at: string;
    accepted_at: string | null;
    declined_at: string | null;
    candidate_wallet: string;
    recruiter_wallet: string | null;
    recruiter_auth_uid: string | null;
    unreadCount: number;
};

type Tab = "requests" | "conversations";

export default function InboxPage() {
    const { publicKey, connected } = useWallet();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("requests");
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    const wallet = publicKey?.toBase58();

    const fetchConversations = useCallback(async () => {
        if (!wallet) return;
        try {
            const res = await fetch(`/api/messaging/conversations?role=candidate&wallet=${wallet}`);
            const data = await res.json();
            if (data.ok) setConversations(data.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [wallet]);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    // Poll every 15 seconds for new requests
    useEffect(() => {
        const interval = setInterval(fetchConversations, 15_000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    if (!connected || !publicKey) {
        return (
            <main className="min-h-screen text-white bg-black">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Inbox className="w-10 h-10 text-white/10" />
                    <p className="text-white/30 text-sm">Connect your wallet to view your inbox</p>
                </div>
            </main>
        );
    }

    if (loading) return <LoadingScreen message="Loading inbox..." />;

    const pendingRequests = conversations.filter((c) => c.status === "pending");
    const activeConversations = conversations.filter((c) => c.status === "accepted" || c.status === "closed");
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    const handleAccept = (id: string) => {
        setConversations((prev) =>
            prev.map((c) => c.id === id ? { ...c, status: "accepted", accepted_at: new Date().toISOString() } : c)
        );
        setActiveTab("conversations");
        setActiveConversationId(id);
    };

    const handleDecline = (id: string) => {
        setConversations((prev) => prev.filter((c) => c.id !== id));
    };

    if (activeConversationId) {
        return (
            <main className="min-h-screen text-white bg-black theme-bg-page theme-aware">
                <Navbar />
                <section className="max-w-2xl mx-auto px-4 pt-24 pb-12">
                    <ConversationThread
                        conversationId={activeConversationId}
                        viewerWallet={wallet}
                        viewerRole="candidate"
                        onBack={() => setActiveConversationId(null)}
                    />
                </section>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen text-white bg-black theme-bg-page theme-aware">
            <Navbar />
            <section className="max-w-2xl mx-auto px-4 pt-24 pb-12">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/[0.08] flex items-center justify-center">
                        <Inbox className="w-5 h-5 text-white/50" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Inbox</h1>
                        <p className="text-xs text-white/30">Recruiter outreach & conversations</p>
                    </div>
                    {totalUnread > 0 && (
                        <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white px-1.5">
                            {totalUnread > 99 ? "99+" : totalUnread}
                        </span>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl mb-6">
                    {(["requests", "conversations"] as Tab[]).map((tab) => {
                        const count = tab === "requests" ? pendingRequests.length : activeConversations.length;
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/30 hover:text-white/60"
                                }`}
                            >
                                {tab === "requests" ? <Users className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                {tab === "requests" ? "Interview Requests" : "Conversations"}
                                {count > 0 && (
                                    <span className={`flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                                        isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/50"
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Interview Requests Tab */}
                {activeTab === "requests" && (
                    <div className="space-y-3">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-16 space-y-3">
                                <Users className="w-10 h-10 text-white/10 mx-auto" />
                                <p className="text-white/25 text-sm font-bold">No interview requests</p>
                                <p className="text-white/15 text-xs max-w-xs mx-auto">When recruiters contact you, their requests will appear here for you to accept or decline.</p>
                            </div>
                        ) : (
                            pendingRequests.map((c) => (
                                <InterviewRequestCard
                                    key={c.id}
                                    conversation={c}
                                    candidateWallet={wallet!}
                                    onAccept={handleAccept}
                                    onDecline={handleDecline}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Active Conversations Tab */}
                {activeTab === "conversations" && (
                    <div className="space-y-2">
                        {activeConversations.length === 0 ? (
                            <div className="text-center py-16 space-y-3">
                                <MessageSquare className="w-10 h-10 text-white/10 mx-auto" />
                                <p className="text-white/25 text-sm font-bold">No active conversations</p>
                                <p className="text-white/15 text-xs max-w-xs mx-auto">Accept an interview request to start a conversation with a recruiter.</p>
                            </div>
                        ) : (
                            activeConversations.map((c) => {
                                const recruiterDisplay = c.recruiter_company || c.recruiter_name || "Recruiter";
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setActiveConversationId(c.id)}
                                        className="w-full text-left bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl p-4 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 truncate">
                                                        {recruiterDisplay}
                                                    </span>
                                                    {c.status === "closed" && (
                                                        <span className="text-[9px] text-white/20 border border-white/10 rounded px-1.5 py-0.5 uppercase tracking-widest">
                                                            Closed
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-white group-hover:text-white transition-colors truncate">
                                                    {c.role_position}
                                                </p>
                                                <p className="text-xs text-white/40 mt-1 truncate">{c.initial_message}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                {c.unreadCount > 0 && (
                                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                                                        {c.unreadCount}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-white/20">
                                                    {new Date(c.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </section>
            <Footer />
        </main>
    );
}
