"use client";

import { AlertTriangle, X } from "lucide-react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    iconColor?: "yellow" | "green" | "red";
    confirmButtonColor?: "yellow" | "green" | "red";
};

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    iconColor = "yellow",
    confirmButtonColor = "yellow"
}: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[#0f0f11] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconColor === "green" ? "bg-emerald-500/10" :
                            iconColor === "red" ? "bg-red-500/10" :
                                "bg-yellow-500/10"
                        }`}>
                        <AlertTriangle className={`w-6 h-6 ${iconColor === "green" ? "text-emerald-500" :
                                iconColor === "red" ? "text-red-500" :
                                    "text-yellow-500"
                            }`} />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-colors border border-white/5"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-colors ${confirmButtonColor === "green" ? "bg-emerald-500 hover:bg-emerald-400" :
                                    confirmButtonColor === "red" ? "bg-red-500 hover:bg-red-400 text-white" :
                                        "bg-yellow-500 hover:bg-yellow-400"
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
