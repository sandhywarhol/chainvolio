"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { Award, Plus, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { CertificateUploadModal } from "@/components/profile/CertificateUploadModal";

interface Certificate {
    id: string;
    title: string;
    issuer_name: string | null;
    date_issued: string | null;
    file_url: string;
    file_type: "pdf" | "image";
}

const PAGE_BG = "#111111";
const CARD_BG = "rgba(255,255,255,0.03)";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#f9fafb";
const TEXT_MUTED = "rgba(255,255,255,0.35)";
const AMBER = "rgba(253,230,138,0.6)";

export default function CredentialPage() {
    const { publicKey } = useWallet();
    const router = useRouter();
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            router.replace("/dashboard?tab=credential");
        }
    }, [router]);

    const fetchCerts = useCallback(async () => {
        if (!publicKey) { setLoading(false); return; }
        try {
            const res = await fetch(`/api/certificates?wallet=${publicKey.toBase58()}`);
            const data = await res.json();
            setCerts(data?.certificates || []);
        } catch { setCerts([]); }
        setLoading(false);
    }, [publicKey]);

    useEffect(() => { fetchCerts(); }, [fetchCerts]);

    const handleDelete = async (id: string) => {
        if (!publicKey || !confirm("Delete this credential?")) return;
        setDeleting(id);
        try {
            await fetch(`/api/certificates?id=${id}&wallet=${publicKey.toBase58()}`, { method: "DELETE" });
            setCerts(prev => prev.filter(c => c.id !== id));
        } catch { /* ignore */ }
        setDeleting(null);
    };

    if (!publicKey) {
        return (
            <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 25 }}>
                <Award size={56} color="rgba(255,255,255,0.07)" />
                <p style={{ color: TEXT_MUTED, fontSize: 14, marginTop: 16, marginBottom: 24, textAlign: "center" }}>
                    Connect your wallet to manage credentials.
                </p>
                <button
                    onClick={() => router.push("/auth/role")}
                    style={{ padding: "12px 24px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#f9fafb", borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 28, height: 28, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "rgba(255,255,255,0.6)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: TEXT_MUTED, fontSize: 10, letterSpacing: 2, marginTop: 20, textTransform: "uppercase" }}>LOADING CREDENTIALS...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, paddingTop: 52 }}>

            {/* Header */}
            <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 20, paddingRight: 20 }}>
                <div>
                    <p style={{ fontSize: 20, fontWeight: 600, color: TEXT_PRIMARY }}>Credentials</p>
                    <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>Your verified certificates & badges</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "9px 14px", borderRadius: 12,
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                        color: "#f9fafb", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}
                >
                    <Plus size={15} /> Add New
                </button>
            </div>

            <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 20 }}>

                {/* Stats chip */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 99,
                    backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`,
                    marginBottom: 24,
                }}>
                    <Award size={12} color={AMBER} />
                    <span style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: 600 }}>
                        {certs.length} credential{certs.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {certs.length === 0 ? (
                    /* Empty state */
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60, paddingBottom: 60, gap: 14 }}>
                        <Award size={56} color="rgba(255,255,255,0.06)" />
                        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No credentials uploaded yet.</p>
                        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center", lineHeight: 1.6, maxWidth: 240 }}>
                            Upload certificates, degrees, or badges to show recruiters your qualifications.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{ padding: "11px 20px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#f9fafb", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                        >
                            UPLOAD FIRST CREDENTIAL
                        </button>
                    </div>
                ) : (
                    /* Credential list */
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {certs.map((cert) => (
                            <div key={cert.id} style={{ backgroundColor: CARD_BG, borderRadius: 16, border: `1px solid ${CARD_BORDER}`, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                                {/* File preview icon */}
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                    backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${CARD_BORDER}`,
                                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                                }}>
                                    {cert.file_type === "image" ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={cert.file_url} alt={cert.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <FileText size={20} color="rgba(255,255,255,0.3)" />
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ color: TEXT_PRIMARY, fontSize: 14, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {cert.title}
                                    </p>
                                    {cert.issuer_name && (
                                        <p style={{ color: AMBER, fontSize: 12, marginBottom: 1 }}>{cert.issuer_name}</p>
                                    )}
                                    {cert.date_issued && (
                                        <p style={{ color: TEXT_MUTED, fontSize: 11 }}>
                                            {new Date(cert.date_issued).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                                    <a
                                        href={cert.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${CARD_BORDER}` }}
                                    >
                                        {cert.file_type === "pdf" ? <FileText size={14} color="rgba(255,255,255,0.5)" /> : <ImageIcon size={14} color="rgba(255,255,255,0.5)" />}
                                    </a>
                                    <button
                                        onClick={() => handleDelete(cert.id)}
                                        disabled={deleting === cert.id}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer" }}
                                    >
                                        <Trash2 size={14} color={deleting === cert.id ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.6)"} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showModal && publicKey && (
                <CertificateUploadModal
                    walletAddress={publicKey.toBase58()}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchCerts(); }}
                />
            )}
        </div>
    );
}
