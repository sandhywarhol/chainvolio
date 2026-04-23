"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { X, ExternalLink, ShieldCheck, AlertCircle, Copy, Check, MessageSquareWarning, Info } from "lucide-react";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { isInAppBrowser, isPhantomBrowser } from "@/lib/browser-utils";

interface CustomWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CustomWalletModal({ isOpen, onClose }: CustomWalletModalProps) {
    const { wallets } = useWallet();
    const { connectWallet, isConnecting } = useWalletConnect();
    const [phantomAvailable, setPhantomAvailable] = useState(false);
    const [solflareAvailable, setSolflareAvailable] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isInApp, setIsInApp] = useState(false);
    const [isPhantom, setIsPhantom] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsInApp(isInAppBrowser());
        setIsPhantom(isPhantomBrowser());
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Mobile detection
        const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobile(checkMobile);

        // More reliable detection using adapter readyState
        const phantom = wallets.find(w => w.adapter.name === "Phantom");
        const solflare = wallets.find(w => w.adapter.name === "Solflare");

        setPhantomAvailable(phantom?.readyState === "Installed" || !!(window as any).solana?.isPhantom);
        setSolflareAvailable(solflare?.readyState === "Installed" || !!(window as any).solflare);
    }, [isOpen, wallets]);

    if (!mounted || !isOpen) return null;

    const handleConnectAction = async (walletName: string) => {
        try {
            await connectWallet(walletName);
            onClose();
        } catch (err) {
            // Error is logged in the hook
            onClose();
        }
    };

    const handleInstall = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    // Requirement 1 & 4: Only show Phantom and Solflare
    const supportedWallets = [
        {
            name: "Phantom",
            available: phantomAvailable,
            icon: "/logos/phantom.svg",
            downloadUrl: "https://phantom.app/download"
        },
        {
            name: "Solflare",
            available: solflareAvailable,
            icon: "/logos/solflare.svg",
            downloadUrl: "https://solflare.com/download"
        }
    ];

    const noneAvailable = !phantomAvailable && !solflareAvailable;

    return createPortal(
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-3 sm:p-4 overflow-x-hidden overflow-y-auto">
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-[92%] sm:max-w-lg bg-[#0d0d0f] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            Connect Wallet
                        </h2>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1.5">Select Solana Provider</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 sm:p-3 hover:bg-white/5 rounded-2xl transition-colors text-slate-400 hover:text-white shrink-0"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="p-5 sm:p-8 space-y-6">
                    {/* In-App Browser Warning (UX Enhancement) */}
                    {isMobile && isInApp && !isPhantom && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-3">
                            <div className="flex items-start gap-3">
                                <MessageSquareWarning className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-rose-200">In-App Browser Detected</p>
                                    <p className="text-[9px] text-rose-500/80 leading-relaxed">
                                        You are viewing this in an app like Instagram or Discord. These browsers often block wallet connections.
                                    </p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    setShowCopyTooltip(true);
                                    setTimeout(() => setShowCopyTooltip(false), 2000);
                                }}
                                className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl flex items-center justify-center gap-2 transition-all group"
                            >
                                {showCopyTooltip ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-rose-400" />
                                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Link Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Copy Link to Safari/Chrome</span>
                                    </>
                                )}
                            </button>
                            
                            <div className="flex items-center gap-2 justify-center py-1">
                                <div className="h-[1px] bg-rose-500/20 flex-1" />
                                <span className="text-[8px] text-rose-500/40 font-black uppercase">Or use</span>
                                <div className="h-[1px] bg-rose-500/20 flex-1" />
                            </div>

                            <p className="text-[8px] text-center text-rose-500/60 font-medium">
                                For the best experience, open this site in the <span className="text-rose-400 font-bold">Phantom Internal Browser</span>.
                            </p>
                        </div>
                    )}

                    {/* No wallet installed warning */}
                    {noneAvailable && !isInApp && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[11px] sm:text-xs font-bold text-amber-200">
                                    {isMobile ? "Connect via Wallet App" : "No supported Solana wallet detected."}
                                </p>
                                <p className="text-[9px] sm:text-[10px] text-amber-500/80 leading-relaxed">
                                    {isMobile 
                                      ? "Click a wallet below to open this page inside your wallet app for a secure connection."
                                      : "To use ChainVolio you need a Solana wallet. Install Phantom or Solflare to continue."
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {supportedWallets.map((wallet) => (
                            <div 
                                key={wallet.name}
                                onClick={() => {
                                    if (wallet.available || isMobile) {
                                        handleConnectAction(wallet.name);
                                    } else {
                                        handleInstall(wallet.downloadUrl);
                                    }
                                }}
                                className="group flex items-center justify-between p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-[24px] hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3 sm:gap-5 text-left min-w-0">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/50 border border-white/5 p-2 sm:p-3 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                                        <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain rounded-md" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base sm:text-lg font-bold text-white transition-colors truncate">{wallet.name}</p>
                                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                                            {wallet.available ? "Detected & Ready" : isMobile ? "Connect via App" : "Not Installed"}
                                        </p>
                                    </div>
                                </div>

                                {/* Requirement 5 & 6: Install vs Connect label */}
                                <div className="ml-2 shrink-0">
                                    {wallet.available || isMobile ? (
                                        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-500 group-hover:bg-indigo-400 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap min-w-[100px] flex items-center justify-center">
                                            {isConnecting ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                isMobile && !wallet.available ? "Open App" : "Connect"
                                            )}
                                        </div>
                                    ) : (
                                        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 group-hover:bg-white/10 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-2 whitespace-nowrap">
                                            Install
                                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 flex justify-center text-center">
                        <p className="text-[9px] text-slate-600 font-medium uppercase tracking-tight max-w-[200px]">
                            Supported for maximum security and performance
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
