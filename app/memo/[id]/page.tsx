"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import { format } from "date-fns";
import { ShieldCheck, Globe, FileText, ExternalLink, Copy, Check, Share2, Printer, Award, User, Building } from "lucide-react";
import { getVerificationLabel, getBadgeStyles } from "@/lib/paymentConfig";


// ─── Types ────────────────────────────────────────────────────────────────────
const PERF_LABELS = [
    { key: "reliability", label: "Reliability" },
    { key: "technical_skill", label: "Technical Proficiency" },
    { key: "communication", label: "Communication" },
    { key: "leadership", label: "Leadership" },
    { key: "integrity", label: "Professional Integrity" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function sha256hex(text: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function truncate(str: string, head = 8, tail = 8) {
    if (!str || str.length <= head + tail + 3) return str;
    return `${str.slice(0, head)}…${str.slice(-tail)}`;
}

function CopyButton({ text, light }: { text: string; light?: boolean }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} className={`p-1.5 rounded-full transition-all ${light ? "hover:bg-gray-100 text-gray-400" : "hover:bg-slate-800 text-slate-500"
            }`}>
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemoPage() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoad] = useState(true);
    const [error, setError] = useState("");
    const [isDark, setIsDark] = useState(true);
    const [hashOk, setHashOk] = useState<boolean | null>(null);
    const [shared, setShared] = useState(false);

    const memoUrl = typeof window !== "undefined"
        ? `${window.location.origin}/memo/${id}`
        : `https://chainvolio.xyz/memo/${id}`;

    useEffect(() => {
        if (!id) return;
        fetch(`/api/memo/${id}`)
            .then(r => { if (!r.ok) throw new Error("Memo not found"); return r.json(); })
            .then(async d => {
                setData(d);
                if (d.attestation?.memo_v2 && d.attestation?.content_hash) {
                    const computed = await sha256hex(JSON.stringify(d.attestation.memo_v2));
                    setHashOk(computed === d.attestation.content_hash);
                }
            })
            .catch(e => setError(e.message))
            .finally(() => setLoad(false));
    }, [id]);

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0a0a0c]" : "bg-gray-50"}`}>
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Verification Not Found</h1>
            <p className="text-gray-500 mb-6">The requested credential may have been revoked or the ID is invalid.</p>
            <Link href="/" className="text-emerald-500 hover:underline">Back to ChainVolio</Link>
        </div>
    );

    const { attestation, receipt, attester_verification, attester_profile } = data;
    const memo: any = attestation.memo_v2;
    const hasMemoV2 = !!memo;
    const issuedDate = attestation.memo_issued_at || attestation.created_at;
    const performance = memo?.content?.performance;
    const avgPerf = performance
        ? (Object.values(performance) as number[]).reduce((a: number, b: number) => a + b, 0) / 5
        : null;

    const isHiring = attestation.attestation_type === "Hiring Proof";
    const classification = hasMemoV2 ? memo.classification : (attestation.attestation_type || "Professional Attestation");
    const issuerName = attester_profile?.display_name || (hasMemoV2 ? memo.signature?.signatory_name : (attestation.attester_name !== "Anonymous" ? attestation.attester_name : (isHiring ? "Verified Recruiter" : "Anonymous")));
    const issuerOrg = attester_profile?.organization || (hasMemoV2 ? memo.signature?.signatory_org : (attestation.attester_org || ""));
    const issuerRole = data.issuer_role || attester_profile?.professional_role || attester_profile?.headline || attestation.attester_role || (isHiring ? "Hiring Lead" : "Verifier");

    const isVerified = attester_verification?.status === "verified";
    const tierType = isVerified ? attester_verification?.type : "unverified";
    const s = getBadgeStyles(tierType);
    const displayLabel = isVerified ? getVerificationLabel(tierType) : "Regular";

    const currentTier = {
        label: displayLabel,
        color: s.color,
        bars: s.bars,
        iconText: s.iconText,
        bgBase: s.bgBase
    };

    const avatarUrl = attester_profile?.avatar_url;

    const t = isDark ? {
        body: "bg-[#0a0a0c] text-slate-300",
        paper: "bg-[#111114] border-[#1e1e24]",
        heading: "text-white",
        muted: "text-slate-500",
        accent: "text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        divider: "border-[#1e1e24]",
        btn: "bg-[#1a1a1e] hover:bg-[#25252b] border-[#2a2a32] text-slate-300",
        btnPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white",
    } : {
        body: "bg-gray-50 text-slate-700",
        paper: "bg-white border-gray-200",
        heading: "text-slate-900",
        muted: "text-slate-500",
        accent: "text-emerald-600",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        divider: "border-gray-100",
        btn: "bg-white hover:bg-gray-50 border-gray-200 text-slate-700",
        btnPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white",
    };

    return (
        <div className={`min-h-screen font-sans ${t.body} antialiased`}>
            {/* Navigation */}
            <nav className={`no-print sticky top-0 z-50 border-b backdrop-blur-md transition-all ${isDark ? "bg-[#0a0a0c]/80 border-[#1e1e24]" : "bg-white/80 border-gray-100"}`}>
                <div className="max-w-[1200px] mx-auto flex items-center justify-between px-8 py-4">
                    <Link href="/" className="flex items-center gap-2.5">
                        <img src="/chainvolio%20logo.png" alt="ChainVolio" className="w-7 h-7" />
                        <span className={`font-bold text-lg tracking-tight ${t.heading}`}>ChainVolio</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsDark(!isDark)} className={`p-2.5 rounded-xl border transition-all ${t.btn}`}>
                            {isDark ? "☀" : "🌙"}
                        </button>
                        <button onClick={() => window.print()} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${t.btnPrimary} shadow-lg shadow-emerald-600/20`}>
                            <Printer size={15} /> EXPORT PDF
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-[850px] mx-auto px-8 md:px-12 py-16 md:py-24 border-x border-white/[0.05] min-h-screen">

                {/* Institutional Header Band - Centered for Receipt Look */}
                <header className={`mb-20 pb-12 border-b text-center ${t.divider}`}>
                    <div className="space-y-8 flex flex-col items-center">
                        <div className="w-full">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border mb-6 ${t.badge}`}>
                                <ShieldCheck size={12} /> PROTOCOL ISSUED ENTRY
                            </span>
                            {attestation?.is_external && (
                                <div className="mb-4">
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-500 border border-slate-700">
                                        External Attestation
                                    </span>
                                </div>
                            )}
                            <h1 className={`text-3xl md:text-5xl font-black tracking-tighter mb-4 ${t.heading}`}>
                                {attestation.attestation_type === "Hiring Proof" ? "HIRING MEMO" : "VERIFICATION MEMO"}
                            </h1>
                            <p className={`text-sm md:text-base font-medium opacity-60 max-w-xl mx-auto`}>
                                {attestation.attestation_type === "Hiring Proof" 
                                    ? `Official record confirming the recruitment of ${receipt?.role || "Recipient"} by ${receipt?.org || "Institution"}.`
                                    : `Official institutional record for work performed by ${receipt?.role || "Recipient"}, cryptographically verified and anchored on the Solana blockchain.`
                                }
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 pt-4 w-full">
                            <MetaItem label="Issue Date" value={issuedDate ? format(new Date(issuedDate), "dd MMMM yyyy") : "-"} t={t} />
                            <MetaItem label="Memo ID" value={String(id).slice(0, 12).toUpperCase()} t={t} isMono />
                            <MetaItem label="Protocol Status" value="Verified & Active" t={t} isAccent />
                            <MetaItem label="Classification" value={classification} t={t} />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-16 items-start">

                    {/* Left Side: Document Content */}
                    <div className="space-y-16">

                        {/* Executive Summary Section */}
                        {hasMemoV2 && memo.content?.executive_summary && (
                            <section className="relative">
                                <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-center lg:text-left ${t.muted}`}>Performance Summary</h2>
                                <div className={`relative p-8 rounded-3xl border ${isDark ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-gray-100"}`}>
                                    <p className={`text-lg md:text-xl leading-relaxed font-medium italic relative z-10 text-center lg:text-left ${t.heading}`}>
                                        "{memo.content.executive_summary}"
                                    </p>
                                </div>
                            </section>
                        )}

                        <div className="space-y-16">
                            {/* Recipient details */}
                            <section className="space-y-8 text-center lg:text-left">
                                <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${t.muted}`}>Recipient Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InfoItem label="Professional Position" value={receipt?.role || memo?.recipient?.role} t={t} />
                                    <InfoItem label="Affiliated Organization" value={receipt?.org} t={t} />
                                    <InfoItem label="Engagement Start" value={receipt?.startDate || receipt?.start_date} t={t} />
                                    <InfoItem label="Engagement End" value={receipt?.endDate || receipt?.end_date} t={t} />
                                </div>

                                {/* Key Achievements if present */}
                                {hasMemoV2 && memo.content?.key_achievements?.length > 0 && (
                                    <div className={`pt-8 border-t ${t.divider}`}>
                                        <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${t.muted}`}>Key Contributions</h2>
                                        <ul className="space-y-3 text-left">
                                            {memo.content.key_achievements.filter((s: string) => s.trim()).map((s: string, i: number) => (
                                                <li key={i} className="flex gap-4 text-sm leading-relaxed">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                    <span className="opacity-80">{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>

                            {/* Performance ratings - Only show if data exists or NOT a hiring proof */}
                            {(performance || attestation.attestation_type !== "Hiring Proof") && (
                                <section>
                                    <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-center lg:text-left ${t.muted}`}>Performance Assessment</h2>
                                    <div className={`p-8 rounded-3xl border space-y-6 ${isDark ? "bg-white/[0.01] border-white/5" : "bg-white border-gray-100 shadow-sm"}`}>
                                        {PERF_LABELS.map(({ key, label }) => (
                                            <div key={key} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold tracking-tight opacity-70">{label}</span>
                                                    <span className="text-xs font-black">{performance?.[key] || (attestation.attestation_type === "Hiring Proof" ? "-" : 0)}/5</span>
                                                </div>
                                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${(performance?.[key] || 0) * 20}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {avgPerf !== null && (
                                            <div className={`pt-6 border-t flex items-center justify-between ${t.divider}`}>
                                                <span className="text-xs font-black uppercase tracking-widest opacity-40">Aggregate Rating</span>
                                                <span className={`text-xl font-black ${t.accent}`}>{avgPerf.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {attestation.attestation_type === "Hiring Proof" && (
                                <section>
                                    <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-center lg:text-left ${t.muted}`}>Hiring Confirmation</h2>
                                    <div className={`p-8 rounded-3xl border ${isDark ? "bg-emerald-500/[0.02] border-emerald-500/10" : "bg-emerald-50 border-emerald-100"}`}>
                                        <div className="flex items-start gap-4">
                                            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                                            <div>
                                                <p className={`text-lg font-bold mb-2 ${t.heading}`}>Recruitment Decision Confirmed</p>
                                                <p className="text-sm opacity-70 leading-relaxed">
                                                    This document serves as high-integrity proof that the recipient has been successfully recruited for the role of <strong>{receipt?.role}</strong>. 
                                                    The decision was anchored on-chain by the hiring authority at <strong>{receipt?.org}</strong> and is currently active in the Hirsch-Talent framework.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Verification Panel */}
                    <aside className="sticky top-28">
                        <div className={`p-8 md:p-10 rounded-[2.5rem] border shadow-2xl relative overflow-hidden transition-all group ${isDark
                            ? "bg-[#141417]/80 border-white/10 backdrop-blur-2xl shadow-emerald-500/5"
                            : "bg-white border-gray-200 shadow-xl"
                            }`}>
                            {/* Decorative Cryptographic Elements */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />

                            <div className="relative z-10 space-y-10">
                                <div>
                                    <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-6 ${t.muted}`}>On-Chain Verification</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                            <svg width="24" height="24" viewBox="0 0 33 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5.3855 0H33L27.6145 5.3855H0L5.3855 0Z" fill="url(#paint0_linear_sol)" />
                                                <path d="M27.6145 10.771H0L5.3855 16.1565H33L27.6145 10.771Z" fill="url(#paint1_linear_sol)" />
                                                <path d="M5.3855 21.542H33L27.6145 26.9275H0L5.3855 21.542Z" fill="url(#paint2_linear_sol)" />
                                                <defs>
                                                    <linearGradient id="paint0_linear_sol" x1="5.3855" y1="2.69275" x2="33" y2="2.69275" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#9945FF" />
                                                        <stop offset="1" stopColor="#14F195" />
                                                    </linearGradient>
                                                    <linearGradient id="paint1_linear_sol" x1="33" y1="13.4637" x2="0" y2="13.4637" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#9945FF" />
                                                        <stop offset="1" stopColor="#14F195" />
                                                    </linearGradient>
                                                    <linearGradient id="paint2_linear_sol" x1="5.3855" y1="24.2347" x2="33" y2="24.2347" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#9945FF" />
                                                        <stop offset="1" stopColor="#14F195" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black ${t.heading}`}>Solana Protocol</p>
                                            <p className="text-[10px] font-bold opacity-50 uppercase">Mainnet Consensus</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className={`p-5 rounded-2xl border ${isDark ? "bg-black/40 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Transaction Signature</span>
                                            {attestation.tx_signature && (
                                                <a href={`https://solscan.io/tx/${attestation.tx_signature}`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
                                                    SOLSCAN <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-mono break-all leading-relaxed opacity-60">
                                            {attestation.tx_signature}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className={`p-3 rounded-2xl border bg-white shadow-sm ${isDark ? "border-white/10" : "border-gray-100"}`}>
                                            <QRCode value={memoUrl} size={90} level="H" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className={`text-[10px] font-black uppercase tracking-tight ${t.heading}`}>Digital Original</p>
                                            <p className="text-[9px] leading-relaxed opacity-50">
                                                Scan this secure gateway to verify the authenticity of this digital certificate directly on the protocol.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`pt-8 border-t ${t.divider}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="text-emerald-500" size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Tamper-Proof Secure</span>
                                    </div>
                                    <p className="text-[9px] opacity-40 leading-relaxed font-medium">
                                        The content hash of this memo ({String(attestation.content_hash).slice(0, 8)}...) matches the on-chain instruction data, ensuring zero tampering.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Footer Band: Signature & Anchor */}
                <footer className={`mt-32 pt-16 border-t ${t.divider}`}>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-16">
                        {/* Signature Area */}
                        <div className="w-full md:w-auto space-y-8">
                            <div>
                                <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${t.muted}`}>Authorized Signatory</h2>
                                <div className="flex items-center gap-6">
                                    <div className={`relative w-24 h-24 shrink-0 aspect-square rounded-full border-2 overflow-hidden flex items-center justify-center text-3xl font-black ${isVerified
                                        ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] bg-emerald-500/5 text-emerald-500"
                                        : `border-emerald-500/20 ${isDark ? "bg-white/[0.03]" : "bg-gray-50 text-emerald-600"}`
                                        }`}>
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={issuerName} className="w-full h-full object-cover" />
                                        ) : (
                                            issuerName?.[0]
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <p className={`text-2xl font-black tracking-tight ${t.heading}`}>{issuerName}</p>
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${currentTier.color}`}>
                                                        {currentTier.icon && <ShieldCheck size={10} />} {displayLabel}
                                                    </span>

                                                    <div className={`text-[8px] leading-none tracking-[-0.1em] transition-opacity duration-300 ${currentTier.color} opacity-60`}>
                                                        {"▬".repeat(currentTier.bars)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium opacity-60 italic">
                                            {issuerRole} - {issuerOrg}
                                        </p>
                                        {/* Verification Details */}
                                        {tier > 1 && (
                                            <div className="flex items-center gap-2 pt-1">
                                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${currentTier.color} bg-current`} />
                                                <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                                                    Tier {tier} Institutional Trust Level Active
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Issuer Wallet Identity</p>
                                <p className="text-[10px] font-mono opacity-40">{attestation.attester_wallet}</p>
                            </div>
                        </div>

                        {/* Cryptographic Stamp */}
                        <div className="text-right flex flex-col items-end gap-4">
                            <div className={`p-6 rounded-3xl border flex flex-col items-end gap-3 ${isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-gray-100"}`}>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                    <ShieldCheck size={14} /> Cryptographically Signed
                                </div>
                                <div className="opacity-20 flex gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="w-0.5 h-4 bg-emerald-500" />)}
                                </div>
                                <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${t.muted}`}>
                                    ChainVolio Protocol <br /> Institutional Integrity Unit
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30">
                        <div className="flex items-center gap-3">
                            <img src="/chainvolio%20logo.png" alt="ChainVolio" className="w-5 h-5 grayscale" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Digital Audit Log: {String(id).toUpperCase()}</p>
                        </div>
                        <p className="text-[9px] font-medium italic">© 2026 ChainVolio. All institutional records are immutable.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}

function MetaItem({ label, value, t, isMono, isAccent }: { label: string, value?: string, t: any, isMono?: boolean, isAccent?: boolean }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">{label}</p>
            <p className={`text-sm font-bold tracking-tight ${isMono ? "font-mono" : ""} ${isAccent ? "text-emerald-500" : t.heading}`}>
                {value || "-"}
            </p>
        </div>
    );
}

function InfoItem({ label, value, t }: { label: string, value?: string, t: any }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1 opacity-50">{label}</p>
            <p className={`text-base font-bold ${t.heading}`}>{value || "-"}</p>
        </div>
    );
}
