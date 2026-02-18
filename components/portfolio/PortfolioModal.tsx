"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";

type PortfolioModalProps = {
    item: {
        type?: 'image' | 'link';
        title: string;
        description?: string;
        imageUrl?: string;
        url?: string;
        domain?: string;
    } | null;
    onClose: () => void;
};

export function PortfolioModal({ item, onClose }: PortfolioModalProps) {
    const [iframeError, setIframeError] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        if (!item) return;

        // Lock body scroll when modal is open
        document.body.style.overflow = "hidden";

        // Close on ESC key
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);

        // Set timeout to show fallback if iframe doesn't load
        const fallbackTimer = setTimeout(() => {
            if (item.type === 'link') {
                setShowFallback(true);
            }
        }, 3000); // Show fallback after 3 seconds

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEsc);
            clearTimeout(fallbackTimer);
        };
    }, [item, onClose]);

    // Reset state when item changes
    useEffect(() => {
        setIframeError(false);
        setShowFallback(false);
    }, [item?.url]);

    if (!item) return null;

    const isImage = item.type === 'image' || item.imageUrl;
    const isLink = item.type === 'link' || item.url;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-slate-900 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-4 border-b border-slate-800">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
                        {item.description && (
                            <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                        )}
                        {item.domain && (
                            <p className="text-xs text-slate-500 mt-1">{item.domain}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {isImage && item.imageUrl && (
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full max-h-[60vh] object-contain rounded-lg"
                        />
                    )}

                    {isLink && item.url && (
                        <div className="relative">
                            {!iframeError && !showFallback ? (
                                <>
                                    <iframe
                                        src={item.url}
                                        className="w-full h-[60vh] rounded-lg border border-slate-700 bg-white"
                                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                        onError={() => setIframeError(true)}
                                        title={item.title}
                                    />
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 px-4 py-2 rounded-lg text-sm text-slate-300">
                                        Loading preview...
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <div className="mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
                                            <ExternalLink className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-300 font-medium mb-2">
                                            Preview not available
                                        </p>
                                        <p className="text-slate-500 text-sm">
                                            This site cannot be embedded
                                        </p>
                                    </div>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-colors"
                                    >
                                        Open in New Tab
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer with "Open in New Tab" for links */}
                {isLink && item.url && !iframeError && !showFallback && (
                    <div className="p-4 border-t border-slate-800 flex justify-between items-center">
                        <p className="text-xs text-slate-500">
                            If preview doesn't load, click the button to open in a new tab
                        </p>
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                            Open in New Tab
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
