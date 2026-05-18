"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { X, ExternalLink, ShieldCheck, AlertCircle, Building2, Users, ChevronRight, ArrowLeft } from "lucide-react";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Toast } from "@/components/ui/Toast";

type ModalStep = "select" | "org-type";

interface CustomWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ORG_TYPES = [
    {
        value: "company",
        icon: Building2,
        label: "Company / Agency",
        description: "Businesses, recruitment agencies, or commercial organizations",
    },
    {
        value: "community",
        icon: Users,
        label: "Community / DAO",
        description: "Open communities, DAOs, or non-profit organizations",
    },
];

export function CustomWalletModal({ isOpen, onClose }: CustomWalletModalProps) {
    const router = useRouter();
    const { wallets, connected, publicKey, disconnect } = useWallet();
    const { connectWallet, connectionError } = useWalletConnect();
    const { signInWithGoogle } = useGoogleAuth();
    const [phantomAvailable, setPhantomAvailable] = useState(false);
    const [solflareAvailable, setSolflareAvailable] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<ModalStep>("select");
    const [selectedOrgType, setSelectedOrgType] = useState<string | null>(null);
    const recruiterModeRef = useRef(false);
    // Per-button loading: key = "builder-Phantom" | "recruiter-Phantom" | "google"
    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: "success" | "error" | "warning" } | null>(null);

    useEffect(() => {
        setMounted(true);
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const phantom = wallets.find(w => w.adapter.name === "Phantom");
        const solflare = wallets.find(w => w.adapter.name === "Solflare");
        // Check both the legacy window.solana API and Phantom's newer window.phantom.solana API
        const isPhantomWindow = !!(window as any).solana?.isPhantom || !!(window as any).phantom?.solana?.isPhantom;
        setPhantomAvailable(phantom?.readyState === "Installed" || isPhantomWindow);
        setSolflareAvailable(solflare?.readyState === "Installed" || !!(window as any).solflare);
    }, [isOpen, wallets]);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep("select");
            setSelectedOrgType(null);
            setLoadingKey(null);
            setToast(null);
            recruiterModeRef.current = false;
        }
    }, [isOpen]);

    // Clears spinner when the hook reports a connection error.
    useEffect(() => {
        if (!connectionError || !loadingKey) return;
        if (connectionError === "cancelled") {
            // User dismissed the wallet popup — just clear the spinner, no toast
        } else if (connectionError === "extension_dead") {
            const walletName = loadingKey.replace(/^(builder|recruiter)-/, "");
            if (isMobile) {
                setToast({ message: `${walletName} is not responding. Try closing and reopening the ${walletName} app, then try again.`, type: "error" });
            } else {
                // Retries in useWalletConnect already woke the Phantom MV3 service worker.
                // A reload will autoConnect successfully — no manual action needed.
                setToast({ message: `Reconnecting to ${walletName}...`, type: "success" });
                setTimeout(() => window.location.reload(), 800);
            }
        } else {
            setToast({ message: "Connection failed. Please try again.", type: "error" });
        }
        setLoadingKey(null);
    }, [connectionError, isMobile, loadingKey]);

    // Safety-net timeout: if anything goes wrong and the spinner is still showing
    // after 20 s (extension dead, event swallowed, etc.) — clear it automatically.
    useEffect(() => {
        if (!loadingKey) return;
        const timer = setTimeout(() => {
            const walletName = loadingKey.replace(/^(builder|recruiter)-/, "");
            const msg = isMobile
                ? `${walletName} is not responding. Try closing and reopening the ${walletName} app, then try again.`
                : `${walletName} is not responding. Click the ${walletName} icon in your browser toolbar, then try again.`;
            setToast({ message: msg, type: "error" });
            setLoadingKey(null);
        }, 20000);
        return () => clearTimeout(timer);
    }, [isMobile, loadingKey]);

    // Fires when a new wallet connection completes.
    // loadingKey guard prevents this from firing when a returning user opens the modal while already connected.
    useEffect(() => {
        if (!connected || !isOpen || step !== "select" || !loadingKey) return;

        const handleConnected = async () => {
            const address = publicKey?.toBase58();

            if (recruiterModeRef.current) {
                // Block Builder wallets from entering the Recruiter onboarding flow.
                if (address) {
                    try {
                        const res = await fetch(`/api/check-wallet?wallet=${address}&mode=recruiter`);
                        const check = await res.json();
                        if (check.allowed === false) {
                            setToast({ message: check.reason, type: "error" });
                            disconnect();
                            setLoadingKey(null);
                            return;
                        }
                    } catch {
                        // Allow on API error — don't block
                    }
                }
                setLoadingKey(null);
                setStep("org-type");
                return;
            }

            // Builder path
            if (address) {
                try {
                    const res = await fetch(`/api/check-wallet?wallet=${address}&mode=builder`);
                    const check = await res.json();
                    if (check.allowed === false) {
                        setToast({ message: check.reason, type: "error" });
                        disconnect();
                        setLoadingKey(null);
                        return;
                    }
                } catch {
                    // Allow on API error — don't block login
                }
            }
            setLoadingKey(null);
            onClose();
            router.refresh();
        };

        handleConnected();
    // onClose and router are stable refs — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, isOpen, step, loadingKey, publicKey, disconnect]);

    if (!mounted || !isOpen) return null;

    const effectivelyAvailable = (available: boolean) => available || isMobile;
    const noneAvailable = !phantomAvailable && !solflareAvailable;

    const handleBuilderConnect = async (walletName: string) => {
        const key = `builder-${walletName}`;
        recruiterModeRef.current = false;
        try {
            // Disconnect first (before setting loadingKey) if the adapter still holds a
            // session from this page visit. This guarantees two things:
            // 1. connect() is always called → Phantom shows its unlock popup if locked.
            // 2. connected goes false→true, so the modal-close useEffect fires at the
            //    right moment instead of immediately when loadingKey is set.
            if (connected) {
                await disconnect();
            }
            setLoadingKey(key);
            await connectWallet(walletName, isMobile);
            // The useEffect above takes over once `connected` becomes true
        } catch (error) {
            console.error("Connection failed", error);
            setLoadingKey(null);
        }
    };

    const handleRecruiterConnect = async (walletName: string) => {
        const key = `recruiter-${walletName}`;
        recruiterModeRef.current = true;
        try {
            if (connected) {
                await disconnect();
            }
            setLoadingKey(key);
            await connectWallet(walletName, isMobile);
            // The useEffect above takes over once `connected` becomes true
        } catch (error) {
            console.error("Connection failed", error);
            recruiterModeRef.current = false;
            setLoadingKey(null);
        }
    };

    const handleInstall = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleOrgTypeConfirm = () => {
        if (!selectedOrgType) return;
        onClose();
        router.push(`/org/edit-profile-wallet?type=${selectedOrgType}`);
    };

    const handleGoogleSignIn = async () => {
        setLoadingKey("google");
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Google sign in error:", error);
            setLoadingKey(null);
        }
    };

    const supportedWallets = [
        {
            name: "Phantom",
            available: phantomAvailable,
            icon: "/logos/phantom.svg",
            downloadUrl: "https://phantom.app/download",
        },
        {
            name: "Solflare",
            available: solflareAvailable,
            icon: "/logos/solflare.svg",
            downloadUrl: "https://solflare.com/download",
        },
    ];

    // ── Org type selection step ──────────────────────────────────────────────────
    if (step === "org-type") {
        return createPortal(
            <div className="fixed inset-0 z-[1000000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
                <div className="relative w-full sm:max-w-md bg-[#0d0d0f] border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200 max-h-[92dvh] overflow-y-auto">
                    {/* Mobile drag handle */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-10 h-1 rounded-full bg-white/10" />
                    </div>

                    <div className="p-6 sm:p-7 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Choose your org type</h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Recruiter Setup</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-2xl transition-colors text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-5 sm:p-7 space-y-4">
                        {ORG_TYPES.map(t => {
                            const Icon = t.icon;
                            const isActive = selectedOrgType === t.value;
                            return (
                                <div
                                    key={t.value}
                                    onClick={() => setSelectedOrgType(t.value)}
                                    className={`p-5 rounded-[20px] border cursor-pointer transition-all ${
                                        isActive
                                            ? "border-teal-500/50 bg-teal-500/10"
                                            : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-teal-500/20" : "bg-white/5"}`}>
                                            <Icon className={`w-5 h-5 ${isActive ? "text-teal-400" : "text-slate-500"}`} />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${isActive ? "text-white" : "text-slate-300"}`}>{t.label}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <button
                            onClick={handleOrgTypeConfirm}
                            disabled={!selectedOrgType}
                            className="w-full mt-2 py-3.5 rounded-[18px] bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            Continue to Profile Setup
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => { setStep("select"); setSelectedOrgType(null); }}
                            className="w-full py-2 text-[10px] text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5 font-medium uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Back
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // ── Main select step — two-column layout ─────────────────────────────────────
    return createPortal(
        <div className="fixed inset-0 z-[1000000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full sm:max-w-[640px] bg-[#0d0d0f] border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200 max-h-[92dvh] overflow-y-auto">
                {/* Mobile drag handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-white/10" />
                </div>

                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                            Connect to ChainVolio
                        </h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Choose how you'll use the platform</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-2xl transition-colors text-slate-400 hover:text-white shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Two columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.05]">

                    {/* LEFT — Builder */}
                    <div className="p-5 sm:p-6 space-y-4">
                        <div>
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                Builder
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Connect your Solana wallet to build your on-chain professional profile.</p>

                        {noneAvailable && !isMobile && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-400 leading-relaxed">No wallet detected. Install Phantom or Solflare to continue.</p>
                            </div>
                        )}

                        <div className="space-y-2.5">
                            {supportedWallets.map((wallet) => (
                                <div
                                    key={wallet.name}
                                    onClick={() => {
                                        if (effectivelyAvailable(wallet.available)) {
                                            handleBuilderConnect(wallet.name);
                                        } else {
                                            handleInstall(wallet.downloadUrl);
                                        }
                                    }}
                                    className="group flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-[18px] hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-black/50 border border-white/5 p-1.5 flex items-center justify-center shrink-0">
                                            <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain rounded" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{wallet.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">
                                                {wallet.available ? "Detected & Ready" : isMobile ? "Tap to open app" : "Not Installed"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 ml-2">
                                        {effectivelyAvailable(wallet.available) ? (
                                            <div className="px-3 py-1.5 bg-indigo-500 group-hover:bg-indigo-400 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all min-w-[60px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                                {loadingKey === `builder-${wallet.name}` ? (
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : isMobile && !wallet.available ? "Open" : "Connect"}
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1.5 bg-white/5 group-hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10 flex items-center gap-1.5">
                                                Install <ExternalLink className="w-2.5 h-2.5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {loadingKey?.startsWith("builder-") && (
                            <p className="text-[9px] text-amber-400/70 text-center leading-relaxed">
                                {isMobile
                                    ? "Waiting for wallet confirmation — make sure your wallet app is open."
                                    : "Check your browser toolbar — the wallet popup may be waiting for your approval."}
                            </p>
                        )}
                        {!loadingKey && (
                            <p className="text-[9px] text-slate-600 text-center font-medium">For freelancers, contributors &amp; professionals</p>
                        )}
                    </div>

                    {/* RIGHT — Recruiter */}
                    <div className="p-5 sm:p-6 space-y-4">
                        <div>
                            <span className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[9px] font-black text-teal-400 uppercase tracking-widest flex items-center gap-1 w-fit">
                                <Building2 className="w-2.5 h-2.5" />
                                Recruiter
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Connect as an organization to post jobs and find verified talent.</p>

                        <div className="space-y-2.5">
                            {supportedWallets.map((wallet) => (
                                <div
                                    key={wallet.name}
                                    onClick={() => {
                                        if (effectivelyAvailable(wallet.available)) {
                                            handleRecruiterConnect(wallet.name);
                                        } else {
                                            handleInstall(wallet.downloadUrl);
                                        }
                                    }}
                                    className="group flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-[18px] hover:border-teal-500/20 hover:bg-teal-500/[0.03] transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-black/50 border border-white/5 p-1.5 flex items-center justify-center shrink-0">
                                            <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain rounded" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{wallet.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">
                                                {wallet.available ? "Detected & Ready" : isMobile ? "Tap to open app" : "Not Installed"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 ml-2">
                                        {effectivelyAvailable(wallet.available) ? (
                                            <div className="px-3 py-1.5 bg-teal-500/10 group-hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all min-w-[60px] flex items-center justify-center">
                                                {loadingKey === `recruiter-${wallet.name}` ? (
                                                    <div className="w-3 h-3 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
                                                ) : isMobile && !wallet.available ? "Open" : "Connect"}
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1.5 bg-white/5 group-hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10 flex items-center gap-1.5">
                                                Install <ExternalLink className="w-2.5 h-2.5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Google sign-in */}
                            <div
                                onClick={handleGoogleSignIn}
                                className="group flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-[18px] hover:border-teal-500/20 hover:bg-teal-500/[0.03] transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white">Google</p>
                                        <p className="text-[10px] text-slate-500">For Company &amp; Community accounts</p>
                                    </div>
                                </div>
                                <div className="shrink-0 ml-2">
                                    <div className="px-3 py-1.5 bg-amber-200/10 group-hover:bg-amber-200/20 border border-amber-200/20 text-amber-200/60 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all min-w-[60px] flex items-center justify-center">
                                        {loadingKey === "google" ? (
                                            <div className="w-3 h-3 border-2 border-amber-200/30 border-t-amber-200/60 rounded-full animate-spin" />
                                        ) : "Sign In"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loadingKey?.startsWith("recruiter-") && (
                            <p className="text-[9px] text-amber-400/70 text-center leading-relaxed">
                                {isMobile
                                    ? "Waiting for wallet confirmation — make sure your wallet app is open."
                                    : "Check your browser toolbar — the wallet popup may be waiting for your approval."}
                            </p>
                        )}
                        {!loadingKey?.startsWith("recruiter-") && (
                            <p className="text-[9px] text-slate-600 text-center font-medium">For organizations, companies &amp; communities</p>
                        )}
                    </div>
                </div>

                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                {/* iOS safe-area spacer */}
                <div className="h-safe-bottom sm:hidden" />
            </div>
        </div>,
        document.body
    );
}
