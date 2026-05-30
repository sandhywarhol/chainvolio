"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, UserPlus, Shield, ShieldOff, Trash2, Loader2,
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
    recruiterWallet: string;
    companyName: string;
    avatarUrl?: string | null;
};

export function MembersCenter({ recruiterWallet, companyName, avatarUrl }: Props) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"list" | "invite">("list");
    const [invite, setInvite] = useState<InviteState>({ lookupValue: "", lookupType: "wallet", role: "member" });
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
            if (json.ok) setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
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
            if (json.ok) setMembers((prev) => prev.filter((m) => m.id !== memberId));
        } finally {
            setActionId(null);
        }
    }

    return (
        <div className="space-y-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Members</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{companyName}</p>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {(["list", "invite"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setInviteMsg(null); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all"
                            style={tab === t
                                ? { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)" }
                                : { color: "rgba(255,255,255,0.3)" }}
                        >
                            {t === "list" ? <Users style={{ width: 11, height: 11 }} /> : <UserPlus style={{ width: 11, height: 11 }} />}
                            {t === "list" ? `Members (${members.length})` : "Invite"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Member List */}
            {tab === "list" && (
                <div className="space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="py-16 rounded-xl flex flex-col items-center justify-center gap-2 text-center"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <Users style={{ width: 28, height: 28, color: "rgba(255,255,255,0.1)" }} />
                            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>No members yet</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Use the Invite tab to add builders to your company.</p>
                            <button
                                onClick={() => setTab("invite")}
                                className="mt-2 px-4 py-1.5 rounded-lg text-[11px] font-bold"
                                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                            >
                                Invite Member
                            </button>
                        </div>
                    ) : (
                        members.map((m) => {
                            const name = m.profile?.display_name ?? (m.builder_wallet.slice(0, 6) + "…" + m.builder_wallet.slice(-4));
                            const isAdmin = m.role === "admin";
                            const isBusy = actionId === m.id;

                            return (
                                <div key={m.id}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                                        style={{ background: "rgba(255,255,255,0.08)" }}>
                                        {m.profile?.avatar_url
                                            ? <img src={m.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                            : <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{name[0]?.toUpperCase()}</span>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }} className="truncate">{name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {m.profile?.card_number && (
                                                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>CV #{m.profile.card_number}</span>
                                            )}
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest"
                                                style={isAdmin
                                                    ? { color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }
                                                    : { color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }
                                                }>
                                                {isAdmin ? <Crown style={{ width: 9, height: 9 }} /> : <UserCheck style={{ width: 9, height: 9 }} />}
                                                {m.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {isBusy ? (
                                            <Loader2 style={{ width: 14, height: 14, color: "rgba(255,255,255,0.2)" }} className="animate-spin" />
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleChangeRole(m.id, isAdmin ? "member" : "admin")}
                                                    title={isAdmin ? "Remove admin" : "Make admin"}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                                                    style={{ color: isAdmin ? "rgba(255,255,255,0.25)" : "rgba(245,158,11,0.5)" }}
                                                >
                                                    {isAdmin ? <ShieldOff style={{ width: 13, height: 13 }} /> : <Shield style={{ width: 13, height: 13 }} />}
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(m.id)}
                                                    title="Remove member"
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                                                    style={{ color: "rgba(239,68,68,0.35)" }}
                                                >
                                                    <Trash2 style={{ width: 13, height: 13 }} />
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
                <div className="rounded-xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {/* Lookup type toggle */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Lookup by</p>
                        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            {(["wallet", "cv_id"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setInvite((prev) => ({ ...prev, lookupType: t, lookupValue: "" }))}
                                    className="flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all"
                                    style={invite.lookupType === t
                                        ? { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)" }
                                        : { color: "rgba(255,255,255,0.3)" }}
                                >
                                    {t === "wallet" ? "Wallet Address" : "CV ID"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="relative">
                        <Search style={{ width: 13, height: 13, color: "rgba(255,255,255,0.2)" }} className="absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={invite.lookupValue}
                            onChange={(e) => setInvite((prev) => ({ ...prev, lookupValue: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                            placeholder={invite.lookupType === "wallet" ? "Enter wallet address…" : "Enter CV ID number…"}
                            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Role</p>
                        <div className="flex gap-2">
                            {(["member", "admin"] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setInvite((prev) => ({ ...prev, role: r }))}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all"
                                    style={invite.role === r
                                        ? r === "admin"
                                            ? { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }
                                            : { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }
                                        : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }
                                    }
                                >
                                    {r === "admin" ? <Crown style={{ width: 11, height: 11 }} /> : <UserCheck style={{ width: 11, height: 11 }} />}
                                    {r}
                                </button>
                            ))}
                        </div>
                        {invite.role === "admin" && (
                            <p className="mt-2 text-[9px] leading-relaxed" style={{ color: "rgba(245,158,11,0.6)" }}>
                                Admin members can view hiring dashboards and add notes on applicants.
                            </p>
                        )}
                    </div>

                    {/* Send button */}
                    <button
                        onClick={handleInvite}
                        disabled={inviting || !invite.lookupValue.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                        style={{ background: "rgba(255,255,255,0.9)", color: "#0d0e11" }}
                    >
                        {inviting ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : <UserPlus style={{ width: 15, height: 15 }} />}
                        Send Invitation
                    </button>

                    {/* Feedback */}
                    {inviteMsg && (
                        <div className="flex items-start gap-2 p-3 rounded-xl text-xs font-medium"
                            style={inviteMsg.ok
                                ? { background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }
                                : { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }
                            }>
                            {inviteMsg.ok
                                ? <CheckCircle2 style={{ width: 13, height: 13, flexShrink: 0, marginTop: 1 }} />
                                : <AlertCircle style={{ width: 13, height: 13, flexShrink: 0, marginTop: 1 }} />
                            }
                            {inviteMsg.text}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
