"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { MessageSquarePlus, ChevronDown, ChevronUp } from "lucide-react";

export function ReceiptUpdates({ receipt, isOwner, onUpdateAdded }: { receipt: any, isOwner: boolean, onUpdateAdded?: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const { publicKey, signMessage } = useWallet();
    const updates = receipt.updates || [];

    const handleAddUpdate = async () => {
        if (!message.trim()) return;
        if (!publicKey || !signMessage) {
            alert("Please connect your wallet to sign this update.");
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
                    ...signedAction
                })
            });

            if (res.ok) {
                setMessage("");
                setIsAdding(false);
                onUpdateAdded?.();
                // optionally refresh the page or update state locally
                window.location.reload();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to add update.");
            }
        } catch (e: any) {
            console.error(e);
            alert("Error adding update");
        } finally {
            setLoading(false);
        }
    };

    const hasUpdates = updates.length > 0;

    if (!hasUpdates && !isOwner) return null;

    return (
        <div className="mt-4 pt-4 border-t border-slate-700/50" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-all text-xs font-medium text-slate-300 group"
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
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none resize-none min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsAdding(false)}
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
                            className="w-full p-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors flex items-center justify-center gap-2"
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
                                <div className="absolute -left-[21px] top-4 w-2 h-2 rounded-full bg-emerald-500/50 ring-4 ring-slate-900" />

                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 transition-all group-hover:bg-slate-800/60">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {new Date(update.createdAt).toLocaleDateString()} · {new Date(update.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {idx === 0 && (
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2 mb-1 py-0.5 rounded border border-emerald-500/20">
                                                New Update
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{update.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
