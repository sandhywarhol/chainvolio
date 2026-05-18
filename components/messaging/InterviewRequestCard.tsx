"use client";

import { useState } from "react";
import { Calendar, Link as LinkIcon, Building2, Briefcase, Check, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InterviewRequestCardProps {
    conversation: {
        id: string;
        role_position: string;
        initial_message: string;
        recruiter_name: string | null;
        recruiter_company: string | null;
        recruiter_avatar_url: string | null;
        proposed_interview_date: string | null;
        meeting_link: string | null;
        created_at: string;
        status: string;
    };
    candidateWallet: string;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
}

export function InterviewRequestCard({ conversation: c, candidateWallet, onAccept, onDecline }: InterviewRequestCardProps) {
    const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAction = async (action: "accept" | "decline") => {
        setLoading(action);
        setError(null);
        try {
            const res = await fetch(`/api/messaging/conversations/${c.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, wallet: candidateWallet }),
            });
            const data = await res.json();
            if (!data.ok) { setError(data.error?.message || "Action failed"); return; }
            if (action === "accept") onAccept(c.id);
            else onDecline(c.id);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    const recruiterDisplay = c.recruiter_company || c.recruiter_name || "Unknown Recruiter";
    const dateStr = c.proposed_interview_date
        ? new Date(c.proposed_interview_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;

    return (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 truncate">
                            {recruiterDisplay}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                        <h3 className="text-sm font-bold text-white">{c.role_position}</h3>
                    </div>
                </div>
                <span className="text-[10px] text-white/20 whitespace-nowrap flex-shrink-0 mt-0.5">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
            </div>

            {/* Message */}
            <p className="text-sm text-white/60 leading-relaxed border-l-2 border-white/[0.06] pl-3">
                {c.initial_message}
            </p>

            {/* Meta */}
            {(dateStr || c.meeting_link) && (
                <div className="flex flex-wrap gap-3">
                    {dateStr && (
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <Calendar className="w-3.5 h-3.5 text-white/20" />
                            <span>Proposed: {dateStr}</span>
                        </div>
                    )}
                    {c.meeting_link && (
                        <a
                            href={c.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-indigo-400/80 hover:text-indigo-400 transition-colors"
                        >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Meeting link</span>
                        </a>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
                <button
                    onClick={() => handleAction("accept")}
                    disabled={!!loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                >
                    {loading === "accept"
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Check className="w-3.5 h-3.5" />
                    }
                    Accept
                </button>
                <button
                    onClick={() => handleAction("decline")}
                    disabled={!!loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white/40 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                >
                    {loading === "decline"
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <X className="w-3.5 h-3.5" />
                    }
                    Decline
                </button>
            </div>
        </div>
    );
}
