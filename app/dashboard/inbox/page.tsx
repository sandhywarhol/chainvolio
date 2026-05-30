"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { InterviewRequestCard } from "@/components/messaging/InterviewRequestCard";
import { ConversationThread } from "@/components/messaging/ConversationThread";
import { Inbox, MessageSquare, Users, Send, Clock, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MemberInvitationCard } from "@/components/members/MemberInvitationCard";

type CandidateConversation = {
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

type RecruiterConversation = {
    id: string;
    status: string;
    role_position: string;
    initial_message: string;
    candidate_wallet: string;
    created_at: string;
    updated_at: string;
    accepted_at: string | null;
    unreadCount: number;
};

type Tab = "requests" | "conversations" | "outreach" | "invitations";

type MemberInvitation = {
    id: string;
    recruiter_wallet: string;
    recruiter_company: string;
    recruiter_avatar_url: string | null;
    role: "member" | "admin";
    status: string;
    created_at: string;
    expires_at: string;
};

type ActiveThread = {
    conversationId: string;
    role: "candidate" | "recruiter";
} | null;

const OUTREACH_STATUS = {
    pending:  { label: "Pending",  Icon: Clock,         color: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/20"  },
    accepted: { label: "Accepted", Icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
    declined: { label: "Declined", Icon: XCircle,       color: "text-red-400",     bg: "bg-red-500/10",    border: "border-red-500/20"    },
    closed:   { label: "Closed",   Icon: MessageSquare, color: "text-white/30",    bg: "bg-white/5",       border: "border-white/10"      },
} as const;

export default function InboxPage() {
    const { publicKey, connected } = useWallet();

    const [candidateConvs, setCandidateConvs] = useState<CandidateConversation[]>([]);
    const [recruiterConvs, setRecruiterConvs] = useState<RecruiterConversation[]>([]);
    const [memberInvitations, setMemberInvitations] = useState<MemberInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("requests");
    const [activeThread, setActiveThread] = useState<ActiveThread>(null);

    const wallet = publicKey?.toBase58();

    const fetchAll = useCallback(async () => {
        if (!wallet) return;
        try {
            const [candidateRes, recruiterRes, invitationsRes] = await Promise.all([
                fetch(`/api/messaging/conversations?role=candidate&wallet=${wallet}`),
                fetch(`/api/messaging/conversations?role=recruiter&wallet=${wallet}`),
                fetch(`/api/members/invitations?builderWallet=${wallet}`),
            ]);
            const [candidateData, recruiterData, invitationsData] = await Promise.all([
                candidateRes.json(),
                recruiterRes.json(),
                invitationsRes.json(),
            ]);
            if (candidateData.ok) setCandidateConvs(candidateData.data);
            if (recruiterData.ok) setRecruiterConvs(recruiterData.data);
            if (invitationsData.ok) setMemberInvitations(invitationsData.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [wallet]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    useEffect(() => {
        const interval = setInterval(fetchAll, 15_000);
        return () => clearInterval(interval);
    }, [fetchAll]);

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

    const pendingRequests = candidateConvs.filter((c) => c.status === "pending");
    const acceptedConvs = candidateConvs.filter((c) => c.status === "accepted" || c.status === "closed");

    const candidateUnread = candidateConvs.reduce((s, c) => s + (c.unreadCount || 0), 0);
    const recruiterUnread = recruiterConvs.reduce((s, c) => s + (c.unreadCount || 0), 0);
    const totalUnread = candidateUnread + recruiterUnread;

    const handleAccept = (id: string) => {
        setCandidateConvs((prev) =>
            prev.map((c) => c.id === id ? { ...c, status: "accepted", accepted_at: new Date().toISOString() } : c)
        );
        setActiveTab("conversations");
        setActiveThread({ conversationId: id, role: "candidate" });
    };

    const handleDecline = (id: string) => {
        setCandidateConvs((prev) => prev.filter((c) => c.id !== id));
    };

    if (activeThread) {
        return (
            <main className="min-h-screen text-white bg-black theme-bg-page theme-aware">
                <Navbar />
                <section className="max-w-2xl mx-auto px-4 pt-24 pb-12">
                    <ConversationThread
                        conversationId={activeThread.conversationId}
                        viewerWallet={wallet}
                        viewerRole={activeThread.role}
                        onBack={() => setActiveThread(null)}
                    />
                </section>
                <Footer />
            </main>
        );
    }

    // Only show tabs that have data; fall back to showing outreach (for recruiters) or requests (for candidates)
    const allTabs: { key: Tab; label: string; Icon: React.ElementType; count: number; unread: number }[] = [
        { key: "requests",      label: "Requests",      Icon: Users,         count: pendingRequests.length,     unread: 0 },
        { key: "conversations", label: "Conversations", Icon: MessageSquare, count: acceptedConvs.length,       unread: candidateUnread },
        { key: "outreach",      label: "My Outreach",   Icon: Send,          count: recruiterConvs.length,      unread: recruiterUnread },
        { key: "invitations",   label: "Invitations",   Icon: Building2,     count: memberInvitations.length,   unread: memberInvitations.length },
    ];
    const visibleTabs = allTabs.filter((t) => t.count > 0);
    // If all empty: show "My Outreach" as default (most likely role for a first-time user here)
    const tabs = visibleTabs.length > 0 ? visibleTabs : [allTabs[2]];
    // If the current active tab is no longer in the visible set, switch to first visible
    const resolvedTab = tabs.find((t) => t.key === activeTab) ? activeTab : tabs[0].key;

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
                        <p className="text-xs text-white/30">Recruiter outreach & your sent conversations</p>
                    </div>
                    {totalUnread > 0 && (
                        <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white px-1.5">
                            {totalUnread > 99 ? "99+" : totalUnread}
                        </span>
                    )}
                </div>

                {/* Tabs — only rendered when there are multiple visible tabs */}
                {tabs.length > 1 && (
                    <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl mb-6">
                        {tabs.map(({ key, label, Icon, count, unread }) => {
                            const isActive = resolvedTab === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                                        isActive ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{label}</span>
                                    {unread > 0 ? (
                                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                                            {unread}
                                        </span>
                                    ) : count > 0 ? (
                                        <span className={`flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                                            isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/50"
                                        }`}>
                                            {count}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Tab: Interview Requests */}
                {resolvedTab === "requests" && (
                    <div className="space-y-3">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-16 space-y-3">
                                <Users className="w-10 h-10 text-white/10 mx-auto" />
                                <p className="text-white/25 text-sm font-bold">No interview requests</p>
                                <p className="text-white/15 text-xs max-w-xs mx-auto">When recruiters contact you, their requests will appear here.</p>
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

                {/* Tab: Conversations (as candidate) */}
                {resolvedTab === "conversations" && (
                    <div className="space-y-2">
                        {acceptedConvs.length === 0 ? (
                            <div className="text-center py-16 space-y-3">
                                <MessageSquare className="w-10 h-10 text-white/10 mx-auto" />
                                <p className="text-white/25 text-sm font-bold">No active conversations</p>
                                <p className="text-white/15 text-xs max-w-xs mx-auto">Accept an interview request to start a conversation.</p>
                            </div>
                        ) : (
                            acceptedConvs.map((c) => {
                                const recruiterDisplay = c.recruiter_company || c.recruiter_name || "Recruiter";
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setActiveThread({ conversationId: c.id, role: "candidate" })}
                                        className="w-full text-left bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl p-4 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 truncate">{recruiterDisplay}</span>
                                                    {c.status === "closed" && (
                                                        <span className="text-[9px] text-white/20 border border-white/10 rounded px-1.5 py-0.5 uppercase tracking-widest">Closed</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-white truncate">{c.role_position}</p>
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

                {/* Tab: My Outreach (as recruiter) */}
                {resolvedTab === "outreach" && (
                    <div className="space-y-2">
                        {recruiterConvs.length === 0 ? (
                            <div className="text-center py-16 space-y-3">
                                <Send className="w-10 h-10 text-white/10 mx-auto" />
                                <p className="text-white/25 text-sm font-bold">No outreach sent yet</p>
                                <p className="text-white/15 text-xs max-w-xs mx-auto">
                                    Visit a candidate's CV and click "Contact Candidate" to start a conversation.
                                </p>
                            </div>
                        ) : (
                            recruiterConvs.map((c) => {
                                const statusCfg = OUTREACH_STATUS[c.status as keyof typeof OUTREACH_STATUS] ?? OUTREACH_STATUS.closed;
                                const { Icon: StatusIcon } = statusCfg;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setActiveThread({ conversationId: c.id, role: "recruiter" })}
                                        className="w-full text-left bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl p-4 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 truncate mb-0.5">
                                                    {c.candidate_wallet.slice(0, 6)}…{c.candidate_wallet.slice(-4)}
                                                </p>
                                                <p className="text-sm font-bold text-white truncate">{c.role_position}</p>
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
                            })
                        )}
                    </div>
                )}

                {/* Tab: Member Invitations */}
                {resolvedTab === "invitations" && (
                    <div className="space-y-3">
                        {memberInvitations.length === 0 ? (
                            <div className="text-center py-16 space-y-3">
                                <Building2 className="w-10 h-10 text-white/10 mx-auto" />
                                <p className="text-white/25 text-sm font-bold">No invitations</p>
                                <p className="text-white/15 text-xs max-w-xs mx-auto">
                                    Company invitations to join as a member will appear here.
                                </p>
                            </div>
                        ) : (
                            memberInvitations.map((inv) => (
                                <MemberInvitationCard
                                    key={inv.id}
                                    invitation={inv}
                                    builderWallet={wallet!}
                                    onAccepted={(id) => setMemberInvitations((prev) => prev.filter((i) => i.id !== id))}
                                    onRejected={(id) => setMemberInvitations((prev) => prev.filter((i) => i.id !== id))}
                                />
                            ))
                        )}
                    </div>
                )}

            </section>
            <Footer />
        </main>
    );
}
