"use client";

import { X, ShieldCheck, UserCheck, Calendar, Globe, MapPin, ExternalLink, Link as LinkIcon, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface ReceiptDetailModalProps {
    receipt: any;
    onClose: () => void;
}

export function ReceiptDetailModal({ receipt, onClose }: ReceiptDetailModalProps) {
    if (!receipt) return null;

    const isAttested = receipt.status === "Attested";

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-bold text-white">Work Verification</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Status Hero */}
                    <div className={`p-4 rounded-xl border text-center ${isAttested
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-800/50 border-slate-700 text-slate-400"
                        }`}>
                        <div className="flex flex-col items-center gap-2">
                            {isAttested ? (
                                <>
                                    <ShieldCheck className="w-10 h-10" />
                                    <p className="font-bold text-lg">On-Chain Verified</p>
                                    <p className="text-xs opacity-80">This work experience has been cryptographically confirmed by a third party.</p>
                                </>
                            ) : (
                                <>
                                    <UserCheck className="w-10 h-10 opacity-50" />
                                    <p className="font-bold text-lg">Self-Claimed</p>
                                    <p className="text-xs opacity-80">Information provided directly by the candidate.</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Core Info */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Position</h4>
                            <p className="text-xl font-bold text-white">{receipt.role} at {receipt.org}</p>
                            <p className="text-sm text-slate-400 mt-1">{receipt.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[140px]">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Period</h4>
                                <div className="flex items-center gap-2 text-sm text-white">
                                    <Calendar className="w-4 h-4 text-emerald-500" />
                                    <span>{format(new Date(receipt.startDate), "MMM yyyy")} – {format(new Date(receipt.endDate), "MMM yyyy")}</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-[140px]">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Work Type</h4>
                                <div className="flex items-center gap-2 text-sm text-white">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span>{receipt.workType}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Details */}
                    {isAttested && (
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirmed By</h4>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    {receipt.attesterAvatar ? (
                                        <img src={receipt.attesterAvatar} className="w-10 h-10 rounded-full border border-slate-600" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm">👤</div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">{receipt.attesterName}</p>
                                        <p className="text-xs text-slate-400">
                                            {receipt.attesterRole}
                                            {receipt.attesterOrg && ` at ${receipt.attesterOrg}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-[10px]">
                                <div className="space-y-1">
                                    <p className="text-slate-500 font-bold uppercase">Attestation Type</p>
                                    <p className="text-emerald-400 font-medium">{receipt.attestationType}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 font-bold uppercase">Confidence Level</p>
                                    <p className="text-emerald-400 font-medium">{receipt.confidence || "Confirmed"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 font-bold uppercase">Wallet Address</p>
                                    <p className="text-slate-300 font-mono break-all">{receipt.attesterWallet}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 font-bold uppercase">Timestamp</p>
                                    <p className="text-slate-300">{format(new Date(receipt.attesterAt), "MMM d, yyyy · HH:mm")}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 font-bold uppercase">Network</p>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#14F195]"></div>
                                        <span className="text-slate-300">Solana Mainnet</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 font-bold uppercase">Technical Proof</p>
                                    <p className="text-slate-300 font-mono truncate" title={receipt.attesterSignature}>ED25519: {receipt.attesterSignature?.slice(0, 10)}...</p>
                                </div>
                            </div>

                            <a
                                href={`https://solscan.io/account/${receipt.attesterWallet}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition-all border border-slate-700"
                            >
                                <Globe className="w-4 h-4" />
                                View on-chain proof
                                <ExternalLink className="w-3 h-3 opacity-50" />
                            </a>
                        </div>
                    )}

                    {/* Evidence if self-claimed */}
                    {!isAttested && receipt.evidenceLinks?.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Supporting Evidence</h4>
                            <div className="space-y-2">
                                {receipt.evidenceLinks.map((link: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700 hover:border-emerald-500/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <LinkIcon className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-medium text-slate-300">{link.label}</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950/50 text-[10px] text-slate-500 text-center">
                    Verified by decentralised cryptographic attestation.
                </div>
            </div>
        </div>
    );
}
