"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { MessageSquarePlus, ChevronDown, ChevronUp, Link as LinkIcon, Image as ImageIcon, X, ExternalLink } from "lucide-react";
import { formatDateTime } from "@/shared/utils/date";
import { Toast } from "@/components/ui/Toast";

export function ReceiptUpdates({ receipt, isOwner, onUpdateAdded }: { receipt: any, isOwner: boolean, onUpdateAdded?: () => void }) {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState("");
    const [evidenceLink, setEvidenceLink] = useState("");
    const [evidencePicture, setEvidencePicture] = useState<string | null>(null);
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: "error" | "success" } | null>(null);
    const { publicKey, signMessage } = useWallet();
    const updates = receipt.updates || [];

    const handleAddUpdate = async () => {
        if (!message.trim()) return;
        if (!publicKey || !signMessage) {
            setToast({ message: "Please connect your wallet to sign this update.", type: "error" });
            return;
        }

        setLoading(true);
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "update_work");

            if (!signedAction) {
                setLoading(false);
                return;
            }

            const res = await fetch("/api/receipt-updates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiptId: receipt.id,
                    walletAddress: publicKey.toBase58(),
                    message: message.trim(),
                    evidenceLink: evidenceLink.trim() || null,
                    evidencePicture: evidencePicture || null,
                    ...signedAction
                })
            });

            if (res.ok) {
                setMessage("");
                setEvidenceLink("");
                setEvidencePicture(null);
                setIsAdding(false);
                setIsAddingLink(false);
                onUpdateAdded?.();
                router.refresh();
            } else {
                const err = await res.json();
                setToast({ message: err.error || "Failed to add update.", type: "error" });
            }
        } catch (e: any) {
            console.error(e);
            setToast({ message: "Error adding update.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setToast({ message: "Image too large. Please use an image under 5MB.", type: "error" });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Max resolution 1200px
                const maxDim = 1200;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height *= maxDim / width;
                        width = maxDim;
                    } else {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                // Compress to WebP
                const dataUrl = canvas.toDataURL("image/webp", 0.7);
                setEvidencePicture(dataUrl);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const hasUpdates = updates.length > 0;

    if (!hasUpdates && !isOwner) return null;

    return (
        <>
        <div className="mt-4 pt-4 border-t border-white/[0.05]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/50 transition-all text-xs font-medium text-slate-300 group"
                >
                    {hasUpdates ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border border-emerald-500/20">
                                    New Update
                                </span>
                                <span className="text-slate-400">({updates.length})</span>
                            </div>
                            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </>
                    ) : (
                        <span className="text-emerald-400 group-hover:text-emerald-300">Add First Update</span>
                    )}
                </button>
                {isOwner && hasUpdates && !expanded && (
                    <button
                        onClick={() => { setExpanded(true); setIsAdding(true); }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                        + Add Update
                    </button>
                )}
            </div>

            {expanded && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-emerald-500/20 ml-2">
                    {/* Add Form */}
                    {isOwner && (
                        <div className={`space-y-3 ${!hasUpdates || isAdding ? "block" : "hidden"}`}>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Share a milestone or update for this work..."
                                className="w-full bg-black/60 border border-white/[0.08] rounded-lg p-3 text-sm focus:border-emerald-500 outline-none resize-none min-h-[80px]"
                            />

                            {/* Evidence Preview & Inputs */}
                            <div className="space-y-3">
                                {isAddingLink && (
                                    <div className="flex items-center gap-2 bg-white/[0.03] p-2 rounded-lg border border-white/[0.06]">
                                        <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        <input
                                            type="url"
                                            value={evidenceLink}
                                            onChange={(e) => setEvidenceLink(e.target.value)}
                                            placeholder="https://..."
                                            className="bg-transparent border-none outline-none text-xs w-full text-slate-200"
                                            autoFocus
                                        />
                                        <button onClick={() => { setIsAddingLink(false); setEvidenceLink(""); }} className="text-slate-500 hover:text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {evidencePicture && (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/[0.08] group/img">
                                        <img src={evidencePicture} alt="Evidence preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setEvidencePicture(null)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover/img:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    {!isAddingLink && !evidenceLink && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingLink(true)}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.04] text-[11px] font-medium text-slate-400 transition-all"
                                        >
                                            <LinkIcon className="w-3.5 h-3.5" />
                                            Add Link
                                        </button>
                                    )}
                                    {!evidencePicture && (
                                        <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.04] text-[11px] font-medium text-slate-400 transition-all cursor-pointer">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            Add Picture
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEvidenceLink("");
                                        setEvidencePicture(null);
                                        setIsAddingLink(false);
                                    }}
                                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddUpdate}
                                    disabled={loading || !message.trim()}
                                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Signing..." : "Post Update"}
                                </button>
                            </div>
                        </div>
                    )}

                    {isOwner && hasUpdates && !isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full p-2 border border-dashed border-white/[0.1] rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            Add Another Update
                        </button>
                    )}

                    {/* Timeline of Updates */}
                    <div className="space-y-4 mt-4">
                        {updates.map((update: any, idx: number) => (
                            <div key={update.id} className="relative group">
                                {/* Timeline dot */}
                                <div className="absolute -left-[21px] top-4 w-2 h-2 rounded-full bg-emerald-500/50 ring-4 ring-black" />

                                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 transition-all group-hover:bg-white/[0.05]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {formatDateTime(update.createdAt)}
                                        </span>
                                        {idx === 0 && (
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2 mb-1 py-0.5 rounded border border-emerald-500/20">
                                                New Update
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mb-3">{update.message}</p>

                                    {/* Evidence Display in Timeline */}
                                    <div className="space-y-3">
                                        {update.evidence_picture && (
                                            <div className="rounded-lg overflow-hidden border border-white/[0.06] max-h-96">
                                                <img src={update.evidence_picture} alt="Update evidence" className="w-full h-full object-contain bg-black/20" />
                                            </div>
                                        )}
                                        {update.evidence_link && (
                                            <a
                                                href={update.evidence_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group/link"
                                            >
                                                <div className="w-7 h-7 rounded bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] text-emerald-400/60 uppercase font-bold tracking-wider mb-0.5">External Resource</div>
                                                    <div className="text-xs text-slate-300 truncate font-medium">{update.evidence_link}</div>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {toast && (
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
        </>
    );
}
