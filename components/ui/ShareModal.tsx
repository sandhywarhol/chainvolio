"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Copy, 
    Check, 
    Twitter, 
    Linkedin, 
    Facebook, 
    Send, 
    Mail, 
    MessageCircle,
    Share2
} from "lucide-react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
}

export function ShareModal({ isOpen, onClose, title, url }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
    };

    const shareOptions = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            color: "#25D366",
            href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
        },
        {
            name: "LinkedIn",
            icon: Linkedin,
            color: "#0077B5",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        },
        {
            name: "X (Twitter)",
            icon: Twitter,
            color: "#000000",
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        },
        {
            name: "Telegram",
            icon: Send,
            color: "#0088cc",
            href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        },
        {
            name: "Facebook",
            icon: Facebook,
            color: "#1877F2",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        },
        {
            name: "Email",
            icon: Mail,
            color: "#EA4335",
            href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
        },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-[480px] bg-[#121212] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-amber-200" />
                            Bagikan artikel
                        </h3>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Share Options Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                            {shareOptions.map((option) => (
                                <a
                                    key={option.name}
                                    href={option.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div 
                                        className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/10 group-hover:border-white/20 transition-all duration-300"
                                        style={{ color: option.color }}
                                    >
                                        <option.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-medium text-white/40 group-hover:text-white/80 transition-colors">
                                        {option.name}
                                    </span>
                                </a>
                            ))}
                        </div>

                        {/* Copy Link Section */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Atau salin tautan</p>
                            <div className="relative flex items-center gap-2 p-1 pl-4 bg-white/[0.03] border border-white/10 rounded-2xl group focus-within:border-amber-200/50 transition-all">
                                <span className="text-sm text-white/60 truncate flex-1 font-mono">
                                    {url}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                        copied 
                                        ? "bg-emerald-500 text-white" 
                                        : "bg-white text-black hover:bg-amber-200"
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Tersalin
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Salin
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
