"use client";

import { useState, useEffect } from "react";
import { X, Send, Calendar, Link as LinkIcon, Briefcase, Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { OutreachLimitBadge } from "./OutreachLimitBadge";

interface RecruiterContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateWallet: string;
    candidateName: string;
    onSuccess: (conversationId: string, isExisting: boolean) => void;
}

interface LimitData {
    used: number;
    limit: number | null;
    isPremium: boolean;
    resetDate?: string;
}

export function RecruiterContactModal({
    isOpen, onClose, candidateWallet, candidateName, onSuccess,
}: RecruiterContactModalProps) {
    const { publicKey } = useWallet();
    const { session, orgAccount } = useGoogleAuth();

    const [rolePosition, setRolePosition] = useState("");
    const [message, setMessage] = useState("");
    const [proposedDate, setProposedDate] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limitData, setLimitData] = useState<LimitData | null>(null);
    const [limitLoading, setLimitLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        fetchLimit();
    }, [isOpen]);

    const fetchLimit = async () => {
        setLimitLoading(true);
        try {
            const headers: Record<string, string> = {};
            const params = new URLSearchParams();

            if (session?.access_token) {
                headers["Authorization"] = `Bearer ${session.access_token}`;
            } else if (publicKey) {
                params.set("wallet", publicKey.toBase58());
            }

            const res = await fetch(`/api/messaging/limits?${params}`, { headers });
            const data = await res.json();
            if (data.ok) setLimitData(data);
        } catch {
            // non-critical
        } finally {
            setLimitLoading(false);
        }
    };

    const handleSend = async () => {
        setError(null);
        if (!rolePosition.trim()) { setError("Please enter the role or position."); return; }
        if (!message.trim()) { setError("Please write a message."); return; }
        if (message.length < 20) { setError("Message too short — add at least 20 characters."); return; }
        if (meetingLink && !meetingLink.startsWith("https://")) {
            setError("Meeting link must start with https://"); return;
        }

        setSending(true);
        try {
            const body: Record<string, any> = {
                rolePosition: rolePosition.trim(),
                initialMessage: message.trim(),
                candidateWallet,
                proposedInterviewDate: proposedDate || undefined,
                meetingLink: meetingLink || undefined,
            };

            if (session?.access_token) {
                body.authToken = session.access_token;
            } else if (publicKey) {
                // For wallet-based recruiter: sign the outreach action
                body.recruiterWallet = publicKey.toBase58();
                const skipVerify = process.env.NODE_ENV !== "production";
                if (!skipVerify) {
                    // Signature would be collected here in production
                    // For now, send without signature (SKIP_SIG_VERIFY handles it in dev)
                }
                body.nonce = Date.now().toString();
                body.timestamp = Date.now();
                body.signature = "dev_skip";
            }

            const res = await fetch("/api/messaging/outreach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!data.ok) {
                setError(data.error?.message || "Failed to send. Please try again.");
                return;
            }

            onSuccess(data.conversationId, data.isExisting);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const atLimit = limitData && !limitData.isPremium && limitData.limit !== null && limitData.used >= limitData.limit;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div>
                        <h2 className="text-sm font-bold text-white">Contact Candidate</h2>
                        <p className="text-xs text-white/40 mt-0.5">{candidateName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Role */}
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 block mb-1.5">
                            <Briefcase className="w-3 h-3 inline mr-1.5" />Role / Position *
                        </label>
                        <input
                            type="text"
                            value={rolePosition}
                            onChange={(e) => setRolePosition(e.target.value)}
                            maxLength={100}
                            placeholder="e.g. Senior Solana Developer"
                            className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 block mb-1.5">
                            Message *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={1000}
                            rows={4}
                            placeholder="Introduce yourself and explain why you're reaching out..."
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all resize-none leading-relaxed"
                        />
                        <p className="text-[10px] text-white/20 text-right mt-1">{message.length}/1000</p>
                    </div>

                    {/* Optional fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">
                                <Calendar className="w-3 h-3 inline mr-1" />Interview Date
                            </label>
                            <input
                                type="date"
                                value={proposedDate}
                                onChange={(e) => setProposedDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 10)}
                                className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm outline-none focus:border-white/20 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">
                                <LinkIcon className="w-3 h-3 inline mr-1" />Meeting Link
                            </label>
                            <input
                                type="url"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                placeholder="https://meet.google.com/..."
                                className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm outline-none focus:border-white/20 transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
                    <OutreachLimitBadge
                        used={limitData?.used ?? 0}
                        limit={limitData?.limit ?? null}
                        isPremium={limitData?.isPremium ?? false}
                        resetDate={limitData?.resetDate}
                        loading={limitLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !!atLimit}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-white/90 text-black text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {sending
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending</>
                            : <><Send className="w-3.5 h-3.5" />Send Request</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
