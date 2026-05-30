"use client";

import { useState } from "react";
import { Building2, Crown, UserCheck, Check, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Invitation = {
    id: string;
    recruiter_wallet: string;
    recruiter_company: string;
    recruiter_avatar_url: string | null;
    role: "member" | "admin";
    status: string;
    created_at: string;
    expires_at: string;
};

type Props = {
    invitation: Invitation;
    builderWallet: string;
    onAccepted: (id: string) => void;
    onRejected: (id: string) => void;
};

export function MemberInvitationCard({ invitation, builderWallet, onAccepted, onRejected }: Props) {
    const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

    async function handleAccept() {
        setLoading("accept");
        try {
            const res = await fetch(`/api/members/invitations/${invitation.id}/accept`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ builderWallet }),
            });
            const json = await res.json();
            if (json.ok) onAccepted(invitation.id);
        } finally {
            setLoading(null);
        }
    }

    async function handleReject() {
        setLoading("reject");
        try {
            const res = await fetch(`/api/members/invitations/${invitation.id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ builderWallet }),
            });
            const json = await res.json();
            if (json.ok) onRejected(invitation.id);
        } finally {
            setLoading(null);
        }
    }

    const isAdmin = invitation.role === "admin";

    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {invitation.recruiter_avatar_url ? (
                        <img src={invitation.recruiter_avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Building2 className="w-5 h-5 text-white/20" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-snug">{invitation.recruiter_company}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                        Invited you to join as{" "}
                        <span className={`font-bold ${isAdmin ? "text-amber-400" : "text-white/60"}`}>
                            {isAdmin ? "Admin" : "Member"}
                        </span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                            isAdmin
                                ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                : "text-white/30 bg-white/5 border-white/10"
                        }`}>
                            {isAdmin ? <Crown className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                            {invitation.role}
                        </span>
                        <span className="text-[9px] text-white/20">
                            {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>

            {isAdmin && (
                <p className="text-[10px] text-white/30 leading-relaxed bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2">
                    As an admin, you can view the hiring dashboard and add notes on applicants.
                </p>
            )}

            <div className="flex gap-2">
                <button
                    onClick={handleAccept}
                    disabled={!!loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold transition-all disabled:opacity-50"
                >
                    {loading === "accept" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Accept
                </button>
                <button
                    onClick={handleReject}
                    disabled={!!loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white/40 text-xs font-bold transition-all disabled:opacity-50"
                >
                    {loading === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    Decline
                </button>
            </div>
        </div>
    );
}
