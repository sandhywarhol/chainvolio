"use client";

import { X, ShieldCheck, UserCheck, Calendar, Globe, MapPin, ExternalLink, Link as LinkIcon, Briefcase, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getVerificationLabel, getBadgeStyles } from "@/lib/paymentConfig";
import { RoleBadge } from "@/components/profile/RoleBadge";


interface ReceiptDetailModalProps {
    receipt: any;
    onClose: () => void;
}

export function ReceiptDetailModal({ receipt, onClose }: ReceiptDetailModalProps) {
    if (!receipt) return null;

    const isAttested = receipt.status === "Attested";
    const badge = getBadgeStyles(receipt.attesterVerificationType);

    return (
        <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#0d0d10", border: "1px solid rgba(255,255,255,0.08)" }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2.5">
                        {receipt.attestationType === "Hiring Proof"
                            ? <ShieldCheck className="w-4.5 h-4.5" style={{ color: "rgba(255,255,255,0.5)" }} />
                            : <Briefcase className="w-[18px] h-[18px]" style={{ color: "rgba(255,255,255,0.5)" }} />
                        }
                        <h3 className="text-base font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                            {receipt.attestationType === "Hiring Proof" ? "On-Chain Hiring Proof" : "Work Verification"}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-white/[0.06]" style={{ color: "rgba(255,255,255,0.35)" }}>
                        <X size={16} />
                    </button>
                </div>

                <div className="px-5 py-5 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* Status pill */}
                    <div className="flex items-center justify-center">
                        {isAttested ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.18)" }}>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {receipt.attestationType === "Hiring Proof" ? "Hiring Recorded On-Chain" : "On-Chain Verified"}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <UserCheck className="w-3.5 h-3.5" />
                                Self-Declared
                            </span>
                        )}
                    </div>

                    {/* Core position info */}
                    <div className="rounded-xl px-4 py-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Position</p>
                        <p style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.92)", lineHeight: 1.2 }}>
                            {receipt.role}
                            <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.3)", fontSize: 15 }}> at </span>
                            <span style={{ color: "rgba(255,255,255,0.88)" }}>{receipt.org}</span>
                        </p>
                        {receipt.description && (
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{receipt.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <div>
                                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Time Period</p>
                                <div className="flex items-center gap-1.5">
                                    <Calendar style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                                        {format(new Date(receipt.startDate), "MMM yyyy")} – {format(new Date(receipt.endDate), "MMM yyyy")}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Work Type</p>
                                <div className="flex items-center gap-1.5">
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{receipt.workType}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Details */}
                    {isAttested && (
                        <div className="space-y-4">
                            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                {receipt.attestationType === "Hiring Proof" ? "Verified Recruiter" : "Confirmed By"}
                            </p>

                            {/* Attester card */}
                            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="relative flex-shrink-0">
                                    {receipt.attesterAvatar ? (
                                        <img src={receipt.attesterAvatar} className="w-10 h-10 rounded-full object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-base" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>👤</div>
                                    )}
                                    <div className="absolute -bottom-0.5 -right-0.5 rounded-full p-0.5" style={{ background: "#0d0d10", border: "1px solid rgba(74,222,128,0.3)" }}>
                                        <ShieldCheck style={{ width: 10, height: 10, color: "#4ade80" }} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <Link
                                            href={`/cv/${receipt.attesterWallet}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="font-bold text-sm hover:text-white transition-colors flex items-center gap-1"
                                            style={{ color: "rgba(255,255,255,0.82)" }}
                                        >
                                            {receipt.attestationType === "Hiring Proof" && receipt.attesterName === "Anonymous"
                                                ? "Verified Recruiter"
                                                : receipt.attesterName}
                                            <ExternalLink style={{ width: 11, height: 11, opacity: 0.3 }} />
                                        </Link>
                                        <RoleBadge
                                            isVerified={!!receipt.isAttesterVerified}
                                            type={receipt.attesterVerificationType || receipt.verificationTier}
                                            showTooltip={true}
                                            className="scale-90 origin-left"
                                        />
                                    </div>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                                        {receipt.attesterRole}
                                        {receipt.attesterOrg && <span style={{ color: "rgba(255,255,255,0.2)" }}> • {receipt.attesterOrg}</span>}
                                    </p>
                                </div>
                            </div>

                            {/* Comment */}
                            {receipt.attesterComment && (
                                <div className="rounded-xl px-4 py-3 relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span className="absolute -top-2 left-3 text-xl font-serif" style={{ color: "rgba(255,255,255,0.1)" }}>"</span>
                                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontStyle: "italic", lineHeight: 1.6 }}>{receipt.attesterComment}</p>
                                    <span className="absolute -bottom-3 right-3 text-xl font-serif" style={{ color: "rgba(255,255,255,0.1)" }}>"</span>
                                </div>
                            )}

                            {/* Metadata grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Attestation Type", value: receipt.attestationType, mono: false },
                                    { label: "Confidence Level", value: receipt.confidence || "Confirmed", mono: false },
                                    { label: "Wallet Address", value: receipt.attesterWallet ? `${receipt.attesterWallet.slice(0, 8)}...${receipt.attesterWallet.slice(-6)}` : "Anchored On-Chain", mono: true },
                                    { label: "Timestamp", value: receipt.attesterAt ? format(new Date(receipt.attesterAt), "MMM d, yyyy · HH:mm") : "—", mono: false },
                                    { label: "Network", value: "Solana Mainnet", mono: false, dot: true },
                                    { label: "Technical Proof", value: receipt.txSignature ? `TX: ${receipt.txSignature.slice(0, 10)}…` : receipt.attesterSignature ? `SIG: ${receipt.attesterSignature.slice(0, 10)}…` : "ANALYTIC_PROOF_V1", mono: true },
                                ].map(({ label, value, mono, dot }) => (
                                    <div key={label} className="rounded-lg px-3 py-2.5 space-y-1" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                                        <div className="flex items-center gap-1.5">
                                            {dot && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#14F195", flexShrink: 0 }} />}
                                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: mono ? "monospace" : undefined, wordBreak: "break-all" }}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                {receipt.txSignature && (
                                    <a
                                        href={`https://solscan.io/tx/${receipt.txSignature}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
                                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
                                    >
                                        <Globe className="w-4 h-4" />
                                        View Proof
                                        <ExternalLink className="w-3 h-3 opacity-40" />
                                    </a>
                                )}
                                {receipt.attestationId ? (
                                    <Link
                                        href={`/memo/${receipt.attestationId}`}
                                        className={`${receipt.txSignature ? "" : "col-span-2"} flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all`}
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                                    >
                                        <FileText className="w-4 h-4" />
                                        View Memo
                                    </Link>
                                ) : receipt.attestationType === "Hiring Proof" && (
                                    <div className="flex items-center justify-center py-3 rounded-xl text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.25)" }}>
                                        Memo Pending Sync
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Evidence — self-claimed */}
                    {!isAttested && receipt.evidenceLinks?.length > 0 && (
                        <div className="space-y-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Supporting Evidence</p>
                            <div className="space-y-2">
                                {receipt.evidenceLinks.map((link: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-xl transition-all group"
                                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <LinkIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />
                                            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{link.label}</span>
                                        </div>
                                        <ExternalLink style={{ width: 13, height: 13, color: "rgba(255,255,255,0.2)" }} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>VERIFIED BY DECENTRALISED CRYPTOGRAPHIC ATTESTATION</p>
                </div>
            </div>
        </div>
    );
}
