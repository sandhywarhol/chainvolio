"use client";

import { useEffect, useState } from "react";

interface ToastProps {
    message: string;
    onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-800/90 backdrop-blur-md border border-emerald-500/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    ✓
                </div>
                <p className="text-sm font-medium text-white">{message}</p>
            </div>
        </div>
    );
}
