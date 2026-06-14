"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "warning";
    onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000); // Increased to 5s for errors/warnings
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: {
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            text: "text-emerald-400",
            icon: <CheckCircle2 className="w-4 h-4" />
        },
        error: {
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            text: "text-red-400",
            icon: <XCircle className="w-4 h-4" />
        },
        warning: {
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
            text: "text-yellow-400",
            icon: <AlertCircle className="w-4 h-4" />
        }
    };

    const currentStyle = styles[type];

    return (
        <div className="fixed bottom-[100px] md:bottom-8 left-1/2 -translate-x-1/2 z-[99999] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`backdrop-blur-md ${currentStyle.bg} border ${currentStyle.border} px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md`}>
                <div className={`${currentStyle.text}`}>
                    {currentStyle.icon}
                </div>
                <p className="text-sm font-bold text-white leading-relaxed">{message}</p>
            </div>
        </div>
    );
}
