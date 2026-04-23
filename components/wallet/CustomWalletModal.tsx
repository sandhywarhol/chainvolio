"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { X, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import nacl from "tweetnacl";
import bs58 from "bs58";

interface CustomWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CustomWalletModal({ isOpen, onClose }: CustomWalletModalProps) {
    const { wallets, select } = useWallet();
    const [phantomAvailable, setPhantomAvailable] = useState(false);
    const [solflareAvailable, setSolflareAvailable] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Mobile detection
        const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobile(checkMobile);

        // Detect via adapter readyState (most reliable)
        const phantom = wallets.find(w => w.adapter.name === "Phantom");
        const solflare = wallets.find(w => w.adapter.name === "Solflare");

        setPhantomAvailable(phantom?.readyState === "Installed" || !!(window as any).solana?.isPhantom);
        setSolflareAvailable(solflare?.readyState === "Installed" || !!(window as any).solflare);
    }, [isOpen, wallets]);

    if (!isOpen) return null;

    const handleConnect = async (walletName: string) => {
        try {
            // Mobile Deep Linking (only when on mobile and no extension available)
            if (isMobile && !phantomAvailable && !solflareAvailable) {
                const currentUrl = window.location.href;

                const keypair = nacl.box.keyPair();
                localStorage.setItem("cv_dapp_secret_key", bs58.encode(keypair.secretKey));
                const dappPublicKey = bs58.encode(keypair.publicKey);

                const params = new URLSearchParams({
                    app_url: window.location.origin,
                    dapp_encryption_public_key: dappPublicKey,
                    redirect_link: currentUrl,
                    cluster: "mainnet-beta"
                });

                if (walletName === "Phantom") {
                    window.location.href = `https://phantom.app/ul/v1/connect?${params.toString()}`;
                    return;
                } else if (walletName === "Solflare") {
                    const solflareParams = new URLSearchParams({
                        app_url: window.location.origin,
                        dapp_encryption_public_key: dappPublicKey,
                        redirect: currentUrl,
                        cluster: "mainnet-beta"
                    });
                    window.location.href = `https://solflare.com/ul/v1/connect?${solflareParams.toString()}`;
                    return;
                }
            }

            // Desktop: find the adapter and call connect() directly on it.
            // We CANNOT use useWallet().connect() here because it reads `wallet` from
            // React state — which hasn't updated yet after select(). Calling the adapter
            // directly bypasses the stale closure and triggers the Phantom popup immediately.
            const targetWallet = wallets.find(w => w.adapter.name === walletName);
            if (targetWallet) {
                select(targetWallet.adapter.name);
                try {
                    await targetWallet.adapter.connect();
                } catch (err: any) {
                    if (err.name !== "WalletConnectionError" && err.name !== "WalletWindowClosedError") {
                        console.error("Connection failed:", err);
                    }
                }
            }

            onClose();
        } catch (err) {
            console.error("Selection failed:", err);
            onClose();
        }
    };

    const handleInstall = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

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

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                            Connect Wallet
                        </h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Select Solana Provider</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* No wallet installed warning */}
                    {noneAvailable && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-amber-200">
                                    {isMobile ? "Connect via Wallet App" : "No supported Solana wallet detected."}
                                </p>
                                <p className="text-[10px] text-amber-500/80 leading-relaxed">
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
                                        handleConnect(wallet.name);
                                    } else {
                                        handleInstall(wallet.downloadUrl);
                                    }
                                }}
                                className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/5 p-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain rounded-md" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white transition-colors">{wallet.name}</p>
                                        <p className="text-[10px] text-slate-500">
                                            {wallet.available ? "Detected & Ready" : isMobile ? "Connect via App" : "Not Installed"}
                                        </p>
                                    </div>
                                </div>

                                {wallet.available || isMobile ? (
                                    <div className="px-4 py-2 bg-indigo-500 group-hover:bg-indigo-400 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-indigo-500/10">
                                        {isMobile && !wallet.available ? "Open App" : "Connect"}
                                    </div>
                                ) : (
                                    <div className="px-4 py-2 bg-white/5 group-hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/10 flex items-center gap-2">
                                        Install
                                        <ExternalLink className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-center">
                        <p className="text-[9px] text-slate-600 font-medium uppercase tracking-tighter">
                            Supported for maximum security and performance
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
