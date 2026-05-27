"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Loader2, Building2, Briefcase, Calendar, Link as LinkIcon } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useWallet } from "@solana/wallet-adapter-react";
import { signChainVolioAction } from "@/lib/wallet-utils";

interface Message {
    id: string;
    sender_type: "recruiter" | "candidate";
    sender_wallet: string | null;
    content: string;
    created_at: string;
    read_at: string | null;
}

interface Conversation {
    id: string;
    status: string;
    role_position: string;
    initial_message: string;
    recruiter_name: string | null;
    recruiter_company: string | null;
    proposed_interview_date: string | null;
    meeting_link: string | null;
    accepted_at: string | null;
    candidate_wallet: string;
    recruiter_wallet: string | null;
    recruiter_auth_uid: string | null;
}

interface ConversationThreadProps {
    conversationId: string;
    viewerWallet?: string;
    viewerAuthToken?: string;
    viewerRole: "candidate" | "recruiter";
    onBack: () => void;
}

export function ConversationThread({
    conversationId, viewerWallet, viewerAuthToken, viewerRole, onBack,
}: ConversationThreadProps) {
    const walletState = useWallet();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const fetchThread = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const params = new URLSearchParams({ role: viewerRole });
            
            if (viewerWallet) {
                params.set("wallet", viewerWallet);
                const sigData = await signChainVolioAction(walletState, "view_thread");
                if (sigData) {
                    params.set("signature", sigData.signature);
                    params.set("nonce", sigData.nonce);
                    params.set("timestamp", String(sigData.timestamp));
                } else {
                    if (!silent) setLoading(false);
                    return; // signature declined
                }
            }

            const headers: Record<string, string> = {};
            if (viewerAuthToken) headers["Authorization"] = `Bearer ${viewerAuthToken}`;

            const res = await fetch(`/api/messaging/conversations/${conversationId}?${params}`, { headers });
            const data = await res.json();
            if (data.ok) {
                setConversation(data.data.conversation);
                setMessages(data.data.messages);
            }
        } catch { /* silent */ }
        finally { if (!silent) setLoading(false); }
    }, [conversationId, viewerWallet, viewerAuthToken, viewerRole, walletState]);

    useEffect(() => { fetchThread(); }, [fetchThread]);

    // Poll for new messages every 12 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchThread(true), 12_000);
        return () => clearInterval(interval);
    }, [fetchThread]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSendError(null);
        setSending(true);
        try {
            const body: Record<string, any> = {
                conversationId,
                content: newMessage.trim(),
            };
            if (viewerWallet) {
                body.senderWallet = viewerWallet;
                const sigData = await signChainVolioAction(walletState, "send_message");
                if (sigData) {
                    body.signature = sigData.signature;
                    body.nonce = sigData.nonce;
                    body.timestamp = sigData.timestamp;
                } else {
                    setSendError("Signing declined. Cannot send message.");
                    setSending(false);
                    return;
                }
            }
            if (viewerAuthToken) body.authToken = viewerAuthToken;

            const res = await fetch("/api/messaging/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.ok) { setSendError(data.error?.message || "Failed to send"); return; }

            setMessages((prev) => [...prev, data.data]);
            setNewMessage("");
            textareaRef.current?.focus();
        } catch {
            setSendError("Network error. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-5 h-5 animate-spin text-white/30" />
            </div>
        );
    }

    if (!conversation) {
        return <p className="text-white/30 text-sm text-center py-12">Conversation not found.</p>;
    }

    const recruiterDisplay = conversation.recruiter_company || conversation.recruiter_name || "Recruiter";
    const dateStr = conversation.proposed_interview_date
        ? new Date(conversation.proposed_interview_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
            {/* Thread Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-xs text-white/40 font-bold uppercase tracking-widest truncate">{recruiterDisplay}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5 text-white/50" />
                        <span className="text-sm font-bold text-white truncate">{conversation.role_position}</span>
                    </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    conversation.status === "accepted"
                        ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                        : conversation.status === "closed"
                        ? "text-white/30 border-white/10 bg-white/5"
                        : "text-white/30 border-white/10 bg-white/5"
                }`}>
                    {conversation.status}
                </span>
            </div>

            {/* Initial outreach context (collapsed header) */}
            <div className="py-3 px-4 bg-white/[0.02] border border-white/[0.05] rounded-xl my-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Original Request</p>
                <p className="text-xs text-white/50 leading-relaxed">{conversation.initial_message}</p>
                {(dateStr || conversation.meeting_link) && (
                    <div className="flex flex-wrap gap-3 pt-1">
                        {dateStr && (
                            <span className="flex items-center gap-1 text-[10px] text-white/30">
                                <Calendar className="w-3 h-3" /> {dateStr}
                            </span>
                        )}
                        {conversation.meeting_link && (
                            <a href={conversation.meeting_link} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] text-indigo-400/70 hover:text-indigo-400">
                                <LinkIcon className="w-3 h-3" /> Meeting link
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 py-2 min-h-0">
                {messages.length === 0 && (
                    <p className="text-center text-white/20 text-xs py-8">No messages yet. Start the conversation.</p>
                )}
                {messages.map((msg) => {
                    const isViewer = msg.sender_type === viewerRole;
                    return (
                        <div key={msg.id} className={`flex ${isViewer ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isViewer
                                    ? "bg-white/10 border border-white/[0.08] text-white"
                                    : "bg-white/[0.04] border border-white/[0.06] text-white/70"
                            }`}>
                                <p>{msg.content}</p>
                                <p className={`text-[10px] mt-1.5 ${isViewer ? "text-white/30 text-right" : "text-white/20"}`}>
                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Composer */}
            {conversation.status === "accepted" && (
                <div className="pt-3 border-t border-white/[0.06]">
                    {sendError && <p className="text-xs text-red-400 mb-2">{sendError}</p>}
                    <div className="flex gap-2 items-end">
                        <textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            maxLength={2000}
                            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                            className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm outline-none focus:border-white/20 transition-all resize-none leading-relaxed min-h-[40px] max-h-[120px]"
                            style={{ height: "auto" }}
                            onInput={(e) => {
                                const t = e.target as HTMLTextAreaElement;
                                t.style.height = "auto";
                                t.style.height = Math.min(t.scrollHeight, 120) + "px";
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !newMessage.trim()}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/[0.08] text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            {sending
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Send className="w-4 h-4" />
                            }
                        </button>
                    </div>
                    <p className="text-[10px] text-white/15 mt-1.5 text-right">{newMessage.length}/2000</p>
                </div>
            )}

            {conversation.status === "closed" && (
                <div className="pt-3 border-t border-white/[0.06] text-center">
                    <p className="text-xs text-white/25">This conversation has been closed.</p>
                </div>
            )}
        </div>
    );
}
