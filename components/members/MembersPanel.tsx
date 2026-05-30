"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, X, UserPlus, Shield, ShieldOff, Trash2, Loader2,
    Search, Crown, UserCheck, AlertCircle, CheckCircle2
} from "lucide-react";

type Member = {
    id: string;
    builder_wallet: string;
    role: "member" | "admin";
    joined_at: string;
    profile: {
        display_name: string;
        avatar_url: string | null;
        card_number: number;
    } | null;
};

type InviteState = {
    lookupValue: string;
    lookupType: "wallet" | "cv_id";
    role: "member" | "admin";
};

type Props = {
    // Canonical recruiter identity (matches hiring_collections.owner_wallet):
    //   wallet user  → actual wallet address
    //   Google user  → "gauth:{auth_uid}"
    recruiterWallet: string;
    companyName: string;
    avatarUrl?: string | null;
    onClose: () => void;
};

export function MembersPanel({ recruiterWallet, companyName, avatarUrl, onClose }: Props) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"list" | "invite">("list");
    const [invite, setInvite] = useState<InviteState>({
        lookupValue: "",
        lookupType: "wallet",
        role: "member",
    });
    const [inviting, setInviting] = useState(false);
    const [inviteMsg, setInviteMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/members?recruiterWallet=${encodeURIComponent(recruiterWallet)}`);
            const json = await res.json();
            if (json.ok) setMembers(json.data);
        } finally {
            setLoading(false);
        }
    }, [recruiterWallet]);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    async function handleInvite() {
        if (!invite.lookupValue.trim()) return;
        setInviting(true);
        setInviteMsg(null);
        try {
            const res = await fetch("/api/members/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recruiterWallet,
                    companyName,
                    avatarUrl: avatarUrl ?? null,
                    lookupValue: invite.lookupValue.trim(),
                    lookupType: invite.lookupType,
                    role: invite.role,
                }),
            });
            const json = await res.json();
            if (json.ok) {
                setInviteMsg({ text: "Invitation sent! The builder will see it in their inbox.", ok: true });
                setInvite((prev) => ({ ...prev, lookupValue: "" }));
            } else {
                setInviteMsg({ text: json.error?.message ?? "Failed to send invitation.", ok: false });
            }
        } catch {
            setInviteMsg({ text: "Network error. Please try again.", ok: false });
        } finally {
            setInviting(false);
        }
    }

    async function handleChangeRole(memberId: string, newRole: "member" | "admin") {
        setActionId(memberId);
        try {
            const res = await fetch(`/api/members/${memberId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recruiterWallet, role: newRole }),
            });
            const json = await res.json();
            if (json.ok) {
                setMembers((prev) =>
                    prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
                );
            }
        } finally {
            setActionId(null);
        }
    }

    async function handleRemove(memberId: string) {
        setActionId(memberId);
        try {
            const res = await fetch(`/api/members/${memberId}?recruiterWallet=${encodeURIComponent(recruiterWallet)}`, {
                method: "DELETE",
            });
            const json = await res.json();
            if (json.ok) {
                setMembers((prev) => prev.filter((m) => m.id !== memberId));
            }
        } finally {
            setActionId(null);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center">
                            <Users className="w-4 h-4 text-white/50" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Members</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{companyName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
                        <X className="w-4 h-4 text-white/40" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-3 border-b border-white/[0.06]">
                    {(["list", "invite"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setInviteMsg(null); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                                tab === t ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                            }`}
                        >
                            {t === "list" ? <Users className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                            {t === "list" ? `Members (${members.length})` : "Invite"}
                        </button>
                    ))}
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {/* Member List */}
                    {tab === "list" && (
                        <div className="space-y-2">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-12 space-y-2">
                                    <Users className="w-8 h-8 text-white/10 mx-auto" />
                                    <p className="text-white/30 text-sm font-bold">No members yet</p>
                                    <p className="text-white/20 text-xs">Use the Invite tab to add builders to your company.</p>
                                </div>
                            ) : (
                                members.map((m) => {
                                    const name = m.profile?.display_name ?? m.builder_wallet.slice(0, 6) + "…" + m.builder_wallet.slice(-4);
                                    const isAdmin = m.role === "admin";
                                    const isBusy = actionId === m.id;

                                    return (
                                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {m.profile?.avatar_url ? (
                                                    <img src={m.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-white/40">{name[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {m.profile?.card_number && (
                                                        <span className="text-[9px] text-white/20 font-bold">CV #{m.profile.card_number}</span>
                                                    )}
                                                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                                        isAdmin
                                                            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                                            : "text-white/30 bg-white/5 border-white/10"
                                                    }`}>
                                                        {isAdmin ? <Crown className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                                                        {m.role}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {isBusy ? (
                                                    <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleChangeRole(m.id, isAdmin ? "member" : "admin")}
                                                            title={isAdmin ? "Remove admin" : "Make admin"}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                                                        >
                                                            {isAdmin
                                                                ? <ShieldOff className="w-3.5 h-3.5 text-white/30" />
                                                                : <Shield className="w-3.5 h-3.5 text-amber-400/60 hover:text-amber-400" />
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemove(m.id)}
                                                            title="Remove member"
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-red-400/40 hover:text-red-400" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Invite Tab */}
                    {tab === "invite" && (
                        <div className="space-y-4">
                            {/* Lookup type toggle */}
                            <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                {(["wallet", "cv_id"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setInvite((prev) => ({ ...prev, lookupType: t, lookupValue: "" }))}
                                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                                            invite.lookupType === t ? "bg-white/10 text-white" : "text-white/30"
                                        }`}
                                    >
                                        {t === "wallet" ? "Wallet Address" : "CV ID"}
                                    </button>
                                ))}
                            </div>

                            {/* Lookup input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                <input
                                    value={invite.lookupValue}
                                    onChange={(e) => setInvite((prev) => ({ ...prev, lookupValue: e.target.value }))}
                                    placeholder={invite.lookupType === "wallet" ? "Enter wallet address…" : "Enter CV ID number…"}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                                />
                            </div>

                            {/* Role selector */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Role</p>
                                <div className="flex gap-2">
                                    {(["member", "admin"] as const).map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setInvite((prev) => ({ ...prev, role: r }))}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${
                                                invite.role === r
                                                    ? r === "admin"
                                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                                        : "bg-white/10 border-white/20 text-white"
                                                    : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50"
                                            }`}
                                        >
                                            {r === "admin" ? <Crown className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                {invite.role === "admin" && (
                                    <p className="text-[9px] text-amber-400/60 leading-relaxed">
                                        Admin members can view hiring dashboards and add notes on applicants.
                                    </p>
                                )}
                            </div>

                            {/* Invite button */}
                            <button
                                onClick={handleInvite}
                                disabled={inviting || !invite.lookupValue.trim()}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-bold disabled:opacity-40 hover:bg-white/90 transition-all"
                            >
                                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Send Invitation
                            </button>

                            {/* Feedback message */}
                            {inviteMsg && (
                                <div className={`flex items-start gap-2 p-3 rounded-xl border text-xs font-medium ${
                                    inviteMsg.ok
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        : "bg-red-500/10 border-red-500/20 text-red-400"
                                }`}>
                                    {inviteMsg.ok
                                        ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                        : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                    }
                                    {inviteMsg.text}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
