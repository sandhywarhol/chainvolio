"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { PenLine, Eye } from "lucide-react";

const WORK_PREFS = ["Full-time", "Contract", "Freelance", "Project-based"];

const SOCIALS = [
    { key: "twitter", label: "X / TWITTER", placeholder: "@user" },
    { key: "github", label: "GITHUB", placeholder: "username" },
    { key: "linkedin", label: "LINKEDIN", placeholder: "username" },
    { key: "telegram", label: "TELEGRAM", placeholder: "@user" },
    { key: "discord", label: "DISCORD", placeholder: "user#0000" },
    { key: "instagram", label: "INSTAGRAM", placeholder: "@user" },
];

const PAGE_BG = "#111111";
const CARD_BG = "rgba(255,255,255,0.04)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_PRIMARY = "#f9fafb";
const TEXT_MUTED = "rgba(255,255,255,0.4)";
const ORANGE = "rgba(253,230,138,0.6)";

export default function ProfilePage() {
    const { publicKey, disconnect } = useWallet();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [savedMsg, setSavedMsg] = useState(false);

    const [form, setForm] = useState({
        displayName: "", bio: "", skills: "", role: "", organization: "",
        country: "", timezone: "", twitter: "", github: "", linkedin: "",
        telegram: "", discord: "", instagram: "", whatsapp: "", email: "",
        website: "", lookingFor: "", workPreference: [] as string[], avatarUrl: "",
    });

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            router.replace("/dashboard");
        }
    }, [router]);

    const fetchProfile = useCallback(async () => {
        if (!publicKey) { setLoading(false); return; }
        try {
            const res = await fetch(`/api/dashboard/stats?wallet=${publicKey.toBase58()}`);
            const data = await res.json();
            const p = data?.profile;
            if (p) {
                setForm({
                    displayName: p.displayName || "",
                    bio: p.bio || "",
                    skills: p.skills || "",
                    role: p.role || "",
                    organization: p.organization || "",
                    country: p.country || "",
                    timezone: p.timezone || "",
                    twitter: p.twitter || "",
                    github: p.github || "",
                    linkedin: p.linkedin || "",
                    telegram: p.telegram || "",
                    discord: p.discord || "",
                    instagram: p.instagram || "",
                    whatsapp: p.whatsapp || "",
                    email: p.email || "",
                    website: p.website || "",
                    lookingFor: "",
                    workPreference: [],
                    avatarUrl: p.avatarUrl || "",
                });
            }
        } catch { /* ignore */ }
        setLoading(false);
    }, [publicKey]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const handleSave = async () => {
        if (!publicKey) return;
        setSaving(true);
        try {
            await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: publicKey.toBase58(), ...form }),
            });
            setSavedMsg(true);
            setIsEditing(false);
            setTimeout(() => setSavedMsg(false), 3000);
        } catch { /* ignore */ }
        setSaving(false);
    };

    const togglePref = (t: string) => {
        setForm(prev => ({
            ...prev,
            workPreference: prev.workPreference.includes(t)
                ? prev.workPreference.filter(x => x !== t)
                : [...prev.workPreference, t],
        }));
    };

    if (!publicKey) {
        return (
            <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 25 }}>
                <p style={{ color: TEXT_PRIMARY, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Not Connected</p>
                <p style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 24, textAlign: "center" }}>Connect your wallet to view your profile.</p>
                <button
                    onClick={() => router.push("/auth/role")}
                    style={{ padding: "14px 28px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#f9fafb", borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "rgba(255,255,255,0.6)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: TEXT_MUTED, fontSize: 10, letterSpacing: 2, marginTop: 20, textTransform: "uppercase" }}>RESOLVING IDENTITY...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        backgroundColor: "rgba(255,255,255,0.05)",
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 16,
        padding: 16,
        color: TEXT_PRIMARY,
        fontSize: 14,
        width: "100%",
        outline: "none",
        boxSizing: "border-box",
    };

    const labelStyle: React.CSSProperties = {
        color: TEXT_MUTED,
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: 1,
        marginBottom: 10,
        textTransform: "uppercase",
        display: "block",
    };

    const groupLabelStyle: React.CSSProperties = {
        color: "rgba(255,255,255,0.2)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 2,
        marginBottom: 25,
        textTransform: "uppercase",
    };

    return (
        <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, paddingTop: 52, paddingBottom: 20 }}>

            {/* Header */}
            <div style={{
                height: 100,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 20,
                paddingLeft: 25,
                paddingRight: 25,
            }}>
                <div>
                    <p style={{ color: TEXT_PRIMARY, fontSize: 22, fontWeight: 600 }}>
                        {isEditing ? "Identity Editor" : "Professional Identity"}
                    </p>
                    <p style={{ color: TEXT_MUTED, fontSize: 11, marginTop: 2 }}>
                        {isEditing ? "Syncing changes to trust layer" : "Your verifiable persona"}
                    </p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: `1px solid ${CARD_BORDER}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                    }}
                >
                    {isEditing
                        ? <Eye size={22} color={TEXT_PRIMARY} />
                        : <PenLine size={22} color={TEXT_PRIMARY} />
                    }
                </button>
            </div>

            <div style={{ paddingLeft: 25, paddingRight: 25 }}>

                {/* Avatar Section */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 10, marginBottom: 30 }}>
                    <div style={{
                        width: 90, height: 90, borderRadius: 45,
                        backgroundColor: "rgba(255,255,255,0.08)",
                        border: `1.5px solid ${CARD_BORDER}`,
                        position: "relative",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden",
                    }}>
                        {form.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={form.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <span style={{ color: TEXT_PRIMARY, fontSize: 32, fontWeight: 600 }}>
                                {form.displayName?.[0]?.toUpperCase() || "?"}
                            </span>
                        )}
                    </div>
                    <p style={{ color: TEXT_MUTED, fontSize: 10, letterSpacing: 1, marginTop: 12 }}>
                        {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 8, letterSpacing: 2, marginTop: 4, textTransform: "uppercase" }}>
                        IDENTITY MANAGEMENT
                    </p>
                </div>

                {savedMsg && (
                    <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "center" }}>
                        <p style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>✓ Profile updated successfully</p>
                    </div>
                )}

                {/* Personal Info */}
                <div style={{ marginBottom: 40 }}>
                    <p style={groupLabelStyle}>PERSONAL INFORMATION</p>
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>DISPLAY NAME</label>
                        <input
                            style={inputStyle}
                            value={form.displayName}
                            onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                            placeholder="Pseudonym or Real Name"
                            disabled={!isEditing}
                        />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>PROFESSIONAL BIO</label>
                        <textarea
                            style={{ ...inputStyle, height: 100, resize: "none" }}
                            value={form.bio}
                            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                            placeholder="Career highlights..."
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                {/* Professional Info */}
                <div style={{ marginBottom: 40 }}>
                    <p style={groupLabelStyle}>PROFESSIONAL INFORMATION</p>
                    {[
                        { key: "role", label: "CURRENT ROLE", placeholder: "Lead Dev" },
                        { key: "organization", label: "ORGANIZATION", placeholder: "Trust Org" },
                        { key: "skills", label: "CORE SKILLS", placeholder: "Rust, Next.js, Solana..." },
                        { key: "country", label: "COUNTRY", placeholder: "Indonesia" },
                        { key: "timezone", label: "TIMEZONE", placeholder: "UTC+7" },
                    ].map(f => (
                        <div key={f.key} style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>{f.label}</label>
                            <input
                                style={inputStyle}
                                value={(form as any)[f.key]}
                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                placeholder={f.placeholder}
                                disabled={!isEditing}
                            />
                        </div>
                    ))}
                </div>

                {/* Contact & Social */}
                <div style={{ marginBottom: 40 }}>
                    <p style={groupLabelStyle}>CONTACT &amp; SOCIAL</p>
                    {SOCIALS.map(s => (
                        <div key={s.key} style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>{s.label}</label>
                            <input
                                style={inputStyle}
                                value={(form as any)[s.key]}
                                onChange={e => setForm(p => ({ ...p, [s.key]: e.target.value }))}
                                placeholder={s.placeholder}
                                disabled={!isEditing}
                            />
                        </div>
                    ))}
                    {[
                        { key: "whatsapp", label: "WHATSAPP", placeholder: "+62..." },
                        { key: "email", label: "EMAIL", placeholder: "me@..." },
                        { key: "website", label: "WEBSITE", placeholder: "https://..." },
                    ].map(s => (
                        <div key={s.key} style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>{s.label}</label>
                            <input
                                style={inputStyle}
                                value={(form as any)[s.key]}
                                onChange={e => setForm(p => ({ ...p, [s.key]: e.target.value }))}
                                placeholder={s.placeholder}
                                disabled={!isEditing}
                            />
                        </div>
                    ))}
                </div>

                {/* Career Goals */}
                <div style={{ marginBottom: 40 }}>
                    <p style={groupLabelStyle}>CAREER GOALS</p>
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>LOOKING FOR</label>
                        <input
                            style={inputStyle}
                            value={form.lookingFor}
                            onChange={e => setForm(p => ({ ...p, lookingFor: e.target.value.slice(0, 160) }))}
                            placeholder="Open to roles..."
                            disabled={!isEditing}
                        />
                        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 8, textAlign: "right", marginTop: 4 }}>{form.lookingFor.length}/160</p>
                    </div>
                    <div>
                        <label style={labelStyle}>AVAILABILITY</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                            {WORK_PREFS.map(t => {
                                const active = form.workPreference.includes(t);
                                return (
                                    <button
                                        key={t}
                                        onClick={() => isEditing && togglePref(t)}
                                        style={{
                                            paddingLeft: 14, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                                            borderRadius: 10, border: "none", cursor: isEditing ? "pointer" : "default",
                                            backgroundColor: active ? "rgba(253,230,138,0.08)" : "rgba(255,255,255,0.04)",
                                            borderWidth: 1, borderStyle: "solid",
                                            borderColor: active ? "rgba(253,230,138,0.3)" : CARD_BORDER,
                                            color: active ? ORANGE : TEXT_MUTED,
                                            fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                                        }}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            width: "100%", height: 60, borderRadius: 18, border: "none",
                            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                            color: "#f9fafb", fontSize: 16, fontWeight: 700, cursor: "pointer",
                            marginBottom: 12, opacity: saving ? 0.7 : 1,
                        }}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                )}

                {/* Disconnect */}
                <button
                    onClick={() => { disconnect(); router.push("/"); }}
                    style={{
                        width: "100%", height: 56, borderRadius: 16,
                        backgroundColor: "transparent",
                        border: `1px solid ${CARD_BORDER}`,
                        color: TEXT_MUTED, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 8, marginBottom: 20,
                    }}
                >
                    Disconnect Session
                </button>
            </div>
        </div>
    );
}
