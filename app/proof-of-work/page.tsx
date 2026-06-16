"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { Layers, Plus, FileText, CheckCircle2, Clock, X } from "lucide-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

function getShortDate(dateStr: string | null) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const PAGE_BG = "#111111";
const CARD_BG = "rgba(255,255,255,0.03)";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#f9fafb";
const TEXT_MUTED = "rgba(255,255,255,0.35)";
const ORANGE = "rgba(253,230,138,0.6)";

function AddProjectModal({ authUid, accessToken, onClose, onAdded }: {
    authUid: string;
    accessToken: string;
    onClose: () => void;
    onAdded: (project: Record<string, unknown>) => void;
}) {
    const [form, setForm] = useState({ title: "", description: "", projectType: "", projectUrl: "", startDate: "", endDate: "", isOngoing: false });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!form.title.trim()) { setError("Title is required"); return; }
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/org/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
                body: JSON.stringify({
                    ownerAuthUid: authUid,
                    title: form.title,
                    description: form.description,
                    projectType: form.projectType,
                    projectUrl: form.projectUrl,
                    startDate: form.startDate || null,
                    endDate: form.isOngoing ? null : (form.endDate || null),
                    isOngoing: form.isOngoing,
                }),
            });
            const json = await res.json();
            if (!json.ok) { setError(json.error?.message || "Failed to add"); return; }
            onAdded(json.data);
            onClose();
        } catch { setError("Network error"); }
        setSaving(false);
    };

    const inputStyle: React.CSSProperties = {
        backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14,
        padding: "12px 14px", color: TEXT_PRIMARY, fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box",
    };
    const labelStyle: React.CSSProperties = {
        color: TEXT_MUTED, fontSize: 9, fontWeight: 600, letterSpacing: 1,
        marginBottom: 8, textTransform: "uppercase" as const, display: "block",
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ backgroundColor: "#181818", borderRadius: "24px 24px 0 0", border: "1px solid rgba(255,255,255,0.08)", padding: "24px 20px 0", maxHeight: "85dvh", overflowY: "auto", paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 96px)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <p style={{ color: TEXT_PRIMARY, fontSize: 17, fontWeight: 700 }}>Add Proof of Work</p>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED, display: "flex", padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>TITLE *</label>
                    <input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Project name or role" />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>ORGANIZATION / TYPE</label>
                    <input style={inputStyle} value={form.projectType} onChange={e => setForm(p => ({ ...p, projectType: e.target.value }))} placeholder="e.g. DeFi, NFT, Company name..." />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>DESCRIPTION</label>
                    <textarea style={{ ...inputStyle, height: 80, resize: "none" }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What did you build or do?" />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>PROJECT URL</label>
                    <input style={inputStyle} value={form.projectUrl} onChange={e => setForm(p => ({ ...p, projectUrl: e.target.value }))} placeholder="https://..." />
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>START DATE</label>
                        <input type="month" style={inputStyle} value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                    </div>
                    {!form.isOngoing && (
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>END DATE</label>
                            <input type="month" style={inputStyle} value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setForm(p => ({ ...p, isOngoing: !p.isOngoing }))}
                    style={{ marginBottom: 24, marginTop: 12, display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.isOngoing ? ORANGE : "rgba(255,255,255,0.2)"}`, backgroundColor: form.isOngoing ? "rgba(253,230,138,0.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {form.isOngoing && <span style={{ color: ORANGE, fontSize: 11, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ color: TEXT_MUTED, fontSize: 12 }}>Currently ongoing</span>
                </button>
                {error && <p style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}>{error}</p>}
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{ width: "100%", height: 54, borderRadius: 16, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: TEXT_PRIMARY, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
                >
                    {saving ? "Adding..." : "Add Proof"}
                </button>
            </div>
        </div>
    );
}

export default function ProofOfWorkPage() {
    const { publicKey } = useWallet();
    const { session: googleSession, isGoogleSignedIn } = useGoogleAuth();
    const googleUid = isGoogleSignedIn ? googleSession?.user?.id ?? null : null;
    const router = useRouter();

    // Unified list — receipts for wallet users, projects mapped to same shape for Google users
    const [items, setItems] = useState<{ id: string; role: string; org: string; startDate: string | null; endDate: string | null; status: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAddProject, setShowAddProject] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            router.replace("/dashboard");
        }
    }, [router]);

    useEffect(() => {
        if (!publicKey) { if (!googleUid) setLoading(false); return; }
        fetch(`/api/receipts?wallet=${publicKey.toBase58()}`)
            .then(r => r.json())
            .then(data => setItems((data?.receipts || []).map((r: any) => ({
                id: r.id,
                role: r.role || "Untitled Role",
                org: r.org || "",
                startDate: r.startDate,
                endDate: r.endDate,
                status: r.status,
            }))))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [publicKey, googleUid]);

    useEffect(() => {
        if (!googleUid) return;
        setLoading(true);
        fetch(`/api/org/projects?auth_uid=${googleUid}`)
            .then(r => r.json())
            .then(data => setItems((data?.data || []).map((p: any) => ({
                id: p.id,
                role: p.title || "Untitled Project",
                org: p.project_type || "",
                startDate: p.start_date,
                endDate: p.is_ongoing ? null : p.end_date,
                status: p.is_ongoing ? "Ongoing" : "Active",
            }))))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [googleUid]);

    if (!publicKey && !googleUid) {
        return (
            <>
                <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 25, textAlign: "center" }}>
                    <Layers size={64} color="rgba(255,255,255,0.08)" />
                    <p style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Not Connected</p>
                    <p style={{ color: TEXT_MUTED, fontSize: 13, lineHeight: 1.6, marginBottom: 28, maxWidth: 260 }}>
                        Sign in to view and manage your work history.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{ padding: "12px 28px", backgroundColor: "rgba(253,230,138,0.1)", border: "1px solid rgba(253,230,138,0.3)", color: "rgba(253,230,138,0.85)", borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                        Sign In
                    </button>
                </div>
                <CustomWalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
            </>
        );
    }

    if (loading) return <LoadingScreen />;

    const onChainCount = items.filter(r => r.status === "Attested").length;

    return (
        <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, paddingTop: 52 }}>

            {/* Header — identical for both user types */}
            <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 20, paddingRight: 16 }}>
                <p style={{ fontSize: 20, fontWeight: 600, color: TEXT_PRIMARY }}>Proof of Work</p>
                <div style={{ display: "flex", gap: 8 }}>
                    <Link href="/credential" style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "7px 11px", borderRadius: 11,
                        backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: TEXT_PRIMARY, fontSize: 11, fontWeight: 600, textDecoration: "none",
                    }}>
                        <FileText size={14} /> Add Credential
                    </Link>
                    {googleUid ? (
                        <button
                            onClick={() => setShowAddProject(true)}
                            style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "7px 11px", borderRadius: 11,
                                backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                color: TEXT_PRIMARY, fontSize: 11, fontWeight: 600, cursor: "pointer",
                            }}
                        >
                            <Plus size={15} /> Add Proof
                        </button>
                    ) : (
                        <Link href="/add-proof" style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "7px 11px", borderRadius: 11,
                            backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                            color: TEXT_PRIMARY, fontSize: 11, fontWeight: 600, textDecoration: "none",
                        }}>
                            <Plus size={15} /> Add Proof
                        </Link>
                    )}
                </div>
            </div>

            <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 16 }}>

                {/* Stats — same layout for both */}
                <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
                    {[{ val: items.length, label: "PROOFS" }, { val: onChainCount, label: "ON-CHAIN" }].map(s => (
                        <div key={s.label} style={{
                            flex: 1, height: 76,
                            backgroundColor: CARD_BG, borderRadius: 16, border: `1px solid ${CARD_BORDER}`,
                            display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 18,
                        }}>
                            <p style={{ color: TEXT_PRIMARY, fontSize: 24, fontWeight: 600 }}>{s.val}</p>
                            <p style={{ color: TEXT_MUTED, fontSize: 9, fontWeight: 600, letterSpacing: 1, marginTop: 2 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                <p style={{ color: TEXT_MUTED, fontSize: 9, fontWeight: 600, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>
                    PROOF OF WORK GALLERY
                </p>

                {items.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60, paddingBottom: 60, gap: 14 }}>
                        <Layers size={56} color="rgba(255,255,255,0.06)" />
                        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No projects anchored yet.</p>
                        {googleUid ? (
                            <button
                                onClick={() => setShowAddProject(true)}
                                style={{ padding: "11px 20px", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#f9fafb", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                            >
                                ANCHOR FIRST PROOF
                            </button>
                        ) : (
                            <Link href="/add-proof" style={{
                                padding: "11px 20px", borderRadius: 12,
                                backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#f9fafb",
                                fontSize: 11, fontWeight: 700, textDecoration: "none",
                            }}>
                                ANCHOR FIRST PROOF
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 20 }}>
                        {items.map((r, i) => (
                            <div key={r.id || i} style={{
                                backgroundColor: CARD_BG, borderRadius: 16,
                                border: `1px solid ${CARD_BORDER}`, padding: 16,
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                                    <p style={{ color: TEXT_PRIMARY, fontSize: 15, fontWeight: 600, flex: 1, marginRight: 8 }}>
                                        {r.role}
                                    </p>
                                    {r.status === "Attested" || r.status === "Pending" ? (
                                        <span style={{
                                            padding: "4px 8px", borderRadius: 6,
                                            fontSize: 8, fontWeight: 900, letterSpacing: 0.5,
                                            backgroundColor: r.status === "Attested" ? "rgba(16,185,129,0.12)" : "rgba(251,191,36,0.12)",
                                            color: r.status === "Attested" ? "#34d399" : "#fbbf24",
                                            flexShrink: 0,
                                        }}>
                                            {r.status === "Attested" ? "✓ ATTESTED" : "PENDING"}
                                        </span>
                                    ) : null}
                                </div>
                                <p style={{ color: ORANGE, fontSize: 13, marginBottom: 12 }}>{r.org || "—"}</p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid rgba(255,255,255,0.04)` }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <Clock size={11} color={TEXT_MUTED} />
                                        <span style={{ color: TEXT_MUTED, fontSize: 11 }}>
                                            {getShortDate(r.startDate)}{r.endDate ? ` — ${getShortDate(r.endDate)}` : " — Present"}
                                        </span>
                                    </div>
                                    {r.status === "Attested" && <CheckCircle2 size={15} color="#34d399" />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAddProject && googleSession?.access_token && (
                <AddProjectModal
                    authUid={googleUid!}
                    accessToken={googleSession.access_token}
                    onClose={() => setShowAddProject(false)}
                    onAdded={(project: any) => setItems(prev => [{
                        id: project.id,
                        role: project.title || "Untitled Project",
                        org: project.project_type || "",
                        startDate: project.start_date,
                        endDate: project.is_ongoing ? null : project.end_date,
                        status: project.is_ongoing ? "Ongoing" : "Active",
                    }, ...prev])}
                />
            )}

            <CustomWalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
}
