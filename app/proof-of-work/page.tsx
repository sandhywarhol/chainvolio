"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { Layers, Plus, FileText, CheckCircle2, Clock } from "lucide-react";

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

export default function ProofOfWorkPage() {
    const { publicKey } = useWallet();
    const router = useRouter();
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            router.replace("/dashboard");
        }
    }, [router]);

    useEffect(() => {
        if (!publicKey) { setLoading(false); return; }
        fetch(`/api/receipts?wallet=${publicKey.toBase58()}`)
            .then(r => r.json())
            .then(data => setReceipts(data?.receipts || []))
            .catch(() => setReceipts([]))
            .finally(() => setLoading(false));
    }, [publicKey]);

    if (!publicKey) {
        return (
            <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 25 }}>
                <Layers size={64} color="rgba(255,255,255,0.08)" />
                <p style={{ color: TEXT_MUTED, fontSize: 14, marginTop: 16, marginBottom: 24 }}>Connect your wallet to view your work.</p>
                <Link href="/auth/role" style={{ padding: "12px 24px", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#f9fafb", borderRadius: 14, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    Connect Wallet
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 28, height: 28, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "rgba(255,255,255,0.6)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: TEXT_MUTED, fontSize: 10, letterSpacing: 2, marginTop: 20, textTransform: "uppercase" }}>
                    COLLECTING ACHIEVEMENTS...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const onChainCount = receipts.filter(r => r.status === "Attested").length;

    return (
        <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, paddingTop: 52 }}>

            {/* Header */}
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
                    <Link href="/add-proof" style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "7px 11px", borderRadius: 11,
                        backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: TEXT_PRIMARY, fontSize: 11, fontWeight: 600, textDecoration: "none",
                    }}>
                        <Plus size={15} /> Add Proof
                    </Link>
                </div>
            </div>

            <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 16 }}>
                {/* Stats Row */}
                <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
                    {[{ val: receipts.length, label: "PROOFS" }, { val: onChainCount, label: "ON-CHAIN" }].map(s => (
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

                {receipts.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60, paddingBottom: 60, gap: 14 }}>
                        <Layers size={56} color="rgba(255,255,255,0.06)" />
                        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No projects anchored yet.</p>
                        <Link href="/add-proof" style={{
                            padding: "11px 20px", borderRadius: 12,
                            backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#f9fafb",
                            fontSize: 11, fontWeight: 700, textDecoration: "none",
                        }}>
                            ANCHOR FIRST PROOF
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 20 }}>
                        {receipts.map((r, i) => (
                            <div key={r.id || i} style={{
                                backgroundColor: CARD_BG, borderRadius: 16,
                                border: `1px solid ${CARD_BORDER}`, padding: 16,
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                                    <p style={{ color: TEXT_PRIMARY, fontSize: 15, fontWeight: 600, flex: 1, marginRight: 8 }}>
                                        {r.role || "Untitled Role"}
                                    </p>
                                    <span style={{
                                        padding: "4px 8px", borderRadius: 6,
                                        fontSize: 8, fontWeight: 900, letterSpacing: 0.5,
                                        backgroundColor: r.status === "Attested" ? "rgba(16,185,129,0.12)" : "rgba(251,191,36,0.12)",
                                        color: r.status === "Attested" ? "#34d399" : "#fbbf24",
                                        flexShrink: 0,
                                    }}>
                                        {r.status === "Attested" ? "✓ ATTESTED" : "PENDING"}
                                    </span>
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
        </div>
    );
}
