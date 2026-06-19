"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { FileText, Upload, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PenLine, Eye } from "lucide-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { compressPdf } from "@/lib/pdf-compress";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

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
    const { publicKey, disconnect, signMessage } = useWallet();
    const { isGoogleSignedIn } = useGoogleAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [savedMsg, setSavedMsg] = useState(false);
    const [cvPdfUrl, setCvPdfUrl] = useState<string | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUploading, setPdfUploading] = useState(false);
    const [pdfDeleting, setPdfDeleting] = useState(false);

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
                if (p.cvPdfUrl) setCvPdfUrl(p.cvPdfUrl);
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

    const handlePdfUpload = async (f: File) => {
        if (!publicKey || !signMessage) return;
        setPdfUploading(true);
        const result = await compressPdf(f);
        if (!result) { setPdfUploading(false); return; }
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signed = await signChainVolioAction({ publicKey, signMessage } as any, "update_profile");
            if (!signed) { setPdfUploading(false); return; }
            const fd = new FormData();
            fd.append("wallet", publicKey.toBase58());
            fd.append("file", result.file);
            fd.append("signature", signed.signature);
            fd.append("nonce", signed.nonce);
            fd.append("timestamp", signed.timestamp.toString());
            const res = await fetch("/api/cv-pdf", { method: "POST", body: fd });
            if (res.ok) { const d = await res.json(); setCvPdfUrl(d.cv_pdf_url); setPdfFile(null); }
        } catch { /* ignore */ }
        setPdfUploading(false);
    };

    const handlePdfDelete = async () => {
        if (!publicKey || !signMessage) return;
        setPdfDeleting(true);
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signed = await signChainVolioAction({ publicKey, signMessage } as any, "update_profile");
            if (!signed) { setPdfDeleting(false); return; }
            const params = new URLSearchParams({
                wallet: publicKey.toBase58(),
                signature: signed.signature,
                nonce: signed.nonce,
                timestamp: signed.timestamp.toString(),
            });
            await fetch(`/api/cv-pdf?${params}`, { method: "DELETE" });
            setCvPdfUrl(null);
        } catch { /* ignore */ }
        setPdfDeleting(false);
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
        // Google builders have their own profile page
        if (isGoogleSignedIn) {
            router.replace("/org/edit-profile");
            return <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/logo.png" alt="" className="w-16 h-16 object-contain animate-spin-slow brightness-125" />
            </div>;
        }
        return (
            <>
                <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 25, textAlign: "center" }}>
                    <p style={{ color: TEXT_PRIMARY, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Not Connected</p>
                    <p style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 24, maxWidth: 260, lineHeight: 1.6 }}>
                        Sign in to view and edit your profile.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{ padding: "14px 28px", background: "rgba(253,230,138,0.1)", border: "1px solid rgba(253,230,138,0.3)", color: "rgba(253,230,138,0.85)", borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                    >
                        Sign In
                    </button>
                </div>
                <CustomWalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
            </>
        );
    }

    if (loading) return <LoadingScreen />;

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

                {/* CV PDF Resume Section */}
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${CARD_BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <FileText size={14} color="#fbbf24" />
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>PDF Resume</span>
                    </div>

                    {cvPdfUrl ? (
                        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <FileText size={16} color="#fbbf24" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ color: TEXT_PRIMARY, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>PDF Resume uploaded</p>
                                <p style={{ color: TEXT_MUTED, fontSize: 11 }}>Visible on your public CV</p>
                            </div>
                            {isEditing && (
                                <button
                                    onClick={handlePdfDelete}
                                    disabled={pdfDeleting}
                                    style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                    {pdfDeleting ? <span style={{ width: 12, height: 12, border: "2px solid rgba(248,113,113,0.3)", borderTopColor: "#f87171", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={14} />}
                                </button>
                            )}
                        </div>
                    ) : isEditing ? (
                        <label style={{
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "20px 16px", borderRadius: 14, cursor: "pointer",
                            border: pdfFile ? "2px dashed rgba(52,211,153,0.4)" : "2px dashed rgba(255,255,255,0.1)",
                            background: pdfFile ? "rgba(52,211,153,0.05)" : "transparent",
                        }}>
                            <input type="file" accept=".pdf" style={{ display: "none" }} onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (!f || f.type !== "application/pdf") return;
                                await handlePdfUpload(f);
                            }} />
                            {pdfUploading ? (
                                <><span style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#fbbf24", borderRadius: "50%", display: "inline-block" }} /><p style={{ color: TEXT_MUTED, fontSize: 12 }}>Uploading...</p></>
                            ) : (
                                <><Upload size={24} color="rgba(255,255,255,0.2)" /><p style={{ color: TEXT_MUTED, fontSize: 12 }}>Tap to upload PDF resume (max 5 MB)</p></>
                            )}
                        </label>
                    ) : (
                        <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 12, fontStyle: "italic" }}>No PDF resume uploaded. Tap Edit to add one.</p>
                    )}
                </div>

                {/* Save Button */}
                {isEditing && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            width: "100%", height: 60, borderRadius: 18,
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
