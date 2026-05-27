"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { InterviewRequestCard } from "@/components/messaging/InterviewRequestCard";
import { ConversationThread } from "@/components/messaging/ConversationThread";
import { Inbox, MessageSquare, Users, Send, Clock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Session } from "@supabase/supabase-js";
import type { OrgAccount } from "@/hooks/useGoogleAuth";

type CandidateConversation = {
    id: string; status: string; role_position: string; initial_message: string;
    recruiter_name: string | null; recruiter_company: string | null;
    recruiter_avatar_url: string | null; proposed_interview_date: string | null;
    meeting_link: string | null; created_at: string; updated_at: string;
    accepted_at: string | null; declined_at: string | null;
    candidate_wallet: string; recruiter_wallet: string | null;
    recruiter_auth_uid: string | null; unreadCount: number;
};

type RecruiterConversation = {
    id: string; status: string; role_position: string; initial_message: string;
    candidate_wallet: string; created_at: string; updated_at: string;
    accepted_at: string | null; unreadCount: number;
};

type InboxTab = "requests" | "conversations" | "outreach";

type ActiveThread = { conversationId: string; role: "candidate" | "recruiter" } | null;

const OUTREACH_STATUS = {
    pending:  { label: "Pending",  Icon: Clock,         color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"  },
    accepted: { label: "Accepted", Icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    declined: { label: "Declined", Icon: XCircle,       color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20"    },
    closed:   { label: "Closed",   Icon: MessageSquare, color: "text-white/30",    bg: "bg-white/5",        border: "border-white/10"      },
} as const;

type Props = {
    googleSession?: Session | null;
    googleOrgAccount?: OrgAccount | null;
};

export function InboxPanel({ googleSession, googleOrgAccount }: Props = {}) {
    const walletState = useWallet();
    const wallet = walletState.publicKey?.toBase58();

    const [candidateConvs, setCandidateConvs] = useState<CandidateConversation[]>([]);
    const [recruiterConvs, setRecruiterConvs] = useState<RecruiterConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<InboxTab>("requests");
    const [activeThread, setActiveThread] = useState<ActiveThread>(null);

    const isGoogleRecruiter = !!googleSession && googleOrgAccount?.account_type === "recruiter";

    const fetchAll = useCallback(async () => {
        if (!wallet && !isGoogleRecruiter) return;
        try {
            const promises: Promise<any>[] = [];

            // Candidate conversations — wallet address only, no signature needed
            if (wallet) {
                promises.push(
                    fetch(`/api/messaging/conversations?role=candidate&wallet=${wallet}`).then(r => r.json())
                );
            } else {
                promises.push(Promise.resolve({ ok: true, data: [] }));
            }

            // Recruiter conversations
            if (isGoogleRecruiter) {
                promises.push(
                    fetch(`/api/messaging/conversations?role=recruiter`, {
                        headers: { Authorization: `Bearer ${googleSession!.access_token}` },
                    }).then(r => r.json())
                );
            } else if (wallet) {
                promises.push(
                    fetch(`/api/messaging/conversations?role=recruiter&wallet=${wallet}`).then(r => r.json())
                );
            } else {
                promises.push(Promise.resolve({ ok: true, data: [] }));
            }

            const [cData, rData] = await Promise.all(promises);
            if (cData.ok) setCandidateConvs(cData.data);
            if (rData.ok) setRecruiterConvs(rData.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [wallet, isGoogleRecruiter, googleSession]);

    useEffect(() => {
        setLoading(true);
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (!wallet && !isGoogleRecruiter) return;
        const interval = setInterval(fetchAll, 15_000);
        return () => clearInterval(interval);
    }, [fetchAll, wallet, isGoogleRecruiter]);

    if (!wallet && !isGoogleRecruiter) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Inbox style={{ width: 32, height: 32, color: "rgba(255,255,255,0.1)", marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Connect your wallet to view inbox</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
        );
    }

    const pendingRequests = candidateConvs.filter(c => c.status === "pending");
    const acceptedConvs   = candidateConvs.filter(c => c.status === "accepted" || c.status === "closed");
    const candidateUnread = candidateConvs.reduce((s, c) => s + (c.unreadCount || 0), 0);
    const recruiterUnread = recruiterConvs.reduce((s, c) => s + (c.unreadCount || 0), 0);
    const totalUnread     = candidateUnread + recruiterUnread;

    const handleAccept = (id: string) => {
        setCandidateConvs(prev => prev.map(c => c.id === id ? { ...c, status: "accepted", accepted_at: new Date().toISOString() } : c));
        setActiveTab("conversations");
        setActiveThread({ conversationId: id, role: "candidate" });
    };
    const handleDecline = (id: string) => setCandidateConvs(prev => prev.filter(c => c.id !== id));

    // Thread view
    if (activeThread) {
        return (
            <div className="flex flex-col h-full">
                <button
                    onClick={() => setActiveThread(null)}
                    className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                >
                    <ArrowLeft style={{ width: 13, height: 13 }} /> Back to Inbox
                </button>
                <ConversationThread
                    conversationId={activeThread.conversationId}
                    viewerWallet={activeThread.role === "candidate" ? wallet : !googleSession ? wallet : undefined}
                    viewerAuthToken={activeThread.role === "recruiter" && googleSession ? googleSession.access_token : undefined}
                    viewerRole={activeThread.role}
                    onBack={() => setActiveThread(null)}
                />
            </div>
        );
    }

    const allTabs: { key: InboxTab; label: string; Icon: React.ElementType; count: number; unread: number }[] = [
        { key: "requests",      label: "Requests",      Icon: Users,         count: pendingRequests.length, unread: 0 },
        { key: "conversations", label: "Conversations", Icon: MessageSquare, count: acceptedConvs.length,   unread: candidateUnread },
        { key: "outreach",      label: "My Outreach",   Icon: Send,          count: recruiterConvs.length,  unread: recruiterUnread },
    ];
    const visibleTabs  = allTabs.filter(t => t.count > 0);
    const tabs         = visibleTabs.length > 0 ? visibleTabs : [allTabs[2]];
    const resolvedTab  = tabs.find(t => t.key === activeTab) ? activeTab : tabs[0].key;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Inbox style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} />
                </div>
                <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1 }}>Inbox</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>Recruiter outreach & your conversations</p>
                </div>
                {totalUnread > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5">
                        {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                )}
            </div>

            {/* Tab switcher */}
            {tabs.length > 1 && (
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {tabs.map(({ key, label, Icon, count, unread }) => {
                        const isActive = resolvedTab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all"
                                style={isActive ? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.88)" } : { color: "rgba(255,255,255,0.3)" }}
                            >
                                <Icon style={{ width: 12, height: 12 }} />
                                <span className="hidden sm:inline">{label}</span>
                                {unread > 0 ? (
                                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-1">{unread}</span>
                                ) : count > 0 ? (
                                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-bold px-1" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>{count}</span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Tab: Requests */}
            {resolvedTab === "requests" && (
                <div className="space-y-3">
                    {pendingRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Users style={{ width: 28, height: 28, color: "rgba(255,255,255,0.08)", marginBottom: 10 }} />
                            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.25)" }}>No interview requests</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 4, maxWidth: 260 }}>When recruiters contact you, their requests will appear here.</p>
                        </div>
                    ) : pendingRequests.map(c => (
                        <InterviewRequestCard key={c.id} conversation={c} candidateWallet={wallet || ""} onAccept={handleAccept} onDecline={handleDecline} />
                    ))}
                </div>
            )}

            {/* Tab: Conversations */}
            {resolvedTab === "conversations" && (
                <div className="space-y-2">
                    {acceptedConvs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <MessageSquare style={{ width: 28, height: 28, color: "rgba(255,255,255,0.08)", marginBottom: 10 }} />
                            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.25)" }}>No active conversations</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 4 }}>Accept an interview request to start a conversation.</p>
                        </div>
                    ) : acceptedConvs.map(c => {
                        const recruiterDisplay = c.recruiter_company || c.recruiter_name || "Recruiter";
                        return (
                            <button
                                key={c.id}
                                onClick={() => setActiveThread({ conversationId: c.id, role: "candidate" })}
                                className="w-full text-left rounded-xl p-4 transition-all hover:bg-white/[0.03]"
                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.06em" }} className="truncate">{recruiterDisplay}</span>
                                            {c.status === "closed" && (
                                                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.1)" }} className="rounded px-1.5 py-0.5 uppercase tracking-widest">Closed</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.82)" }} className="truncate">{c.role_position}</p>
                                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 }} className="truncate">{c.initial_message}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        {c.unreadCount > 0 && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">{c.unreadCount}</span>
                                        )}
                                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                                            {new Date(c.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Tab: My Outreach */}
            {resolvedTab === "outreach" && (
                <div className="space-y-2">
                    {recruiterConvs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Send style={{ width: 28, height: 28, color: "rgba(255,255,255,0.08)", marginBottom: 10 }} />
                            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.25)" }}>No outreach sent yet</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 4, maxWidth: 260 }}>Visit a candidate's CV and click "Contact Candidate" to start a conversation.</p>
                        </div>
                    ) : recruiterConvs.map(c => {
                        const statusCfg = OUTREACH_STATUS[c.status as keyof typeof OUTREACH_STATUS] ?? OUTREACH_STATUS.closed;
                        const { Icon: StatusIcon } = statusCfg;
                        return (
                            <button
                                key={c.id}
                                onClick={() => setActiveThread({ conversationId: c.id, role: "recruiter" })}
                                className="w-full text-left rounded-xl p-4 transition-all hover:bg-white/[0.03]"
                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em" }} className="truncate mb-0.5">
                                            {c.candidate_wallet.slice(0, 6)}…{c.candidate_wallet.slice(-4)}
                                        </p>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.82)" }} className="truncate">{c.role_position}</p>
                                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 }} className="truncate">{c.initial_message}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                                            <StatusIcon className="w-2.5 h-2.5" />
                                            {statusCfg.label}
                                        </span>
                                        {c.unreadCount > 0 && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">{c.unreadCount}</span>
                                        )}
                                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                                            {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
