"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { X, ExternalLink, ShieldCheck, AlertCircle, Building2, Users, ChevronRight, ArrowLeft } from "lucide-react";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Toast } from "@/components/ui/Toast";

// Steps:
//  "select"   — connect wallet / Google
//  "role"     — choose Builder or Recruiter (only for brand-new wallets)
//  "org-type" — choose Company or DAO (only for new Recruiter wallets)
type ModalStep = "select" | "role" | "org-type";

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

function saveSession(walletAddress: string, walletName: string, accountType: "builder" | "recruiter") {
    try {
        localStorage.setItem("cv_wallet_address", walletAddress);
        localStorage.setItem("cv_wallet_name", walletName);
        localStorage.setItem("cv_account_type", accountType);
        localStorage.setItem("cv_session_exp", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {}
}

export function CustomWalletModal({ isOpen, onClose }: CustomWalletModalProps) {
    const router = useRouter();
    const { wallets, connected, publicKey, disconnect } = useWallet();
    const { connectWallet, connectionError } = useWalletConnect();
    const { signInWithGoogle, orgAccount: googleOrgAccount, session: googleSession } = useGoogleAuth();
    const [phantomAvailable, setPhantomAvailable] = useState(false);
    const [solflareAvailable, setSolflareAvailable] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<ModalStep>("select");
    const [selectedRole, setSelectedRole] = useState<"builder" | "recruiter" | null>(null);
    const [selectedOrgType, setSelectedOrgType] = useState<string | null>(null);
    const [roleConfirmLoading, setRoleConfirmLoading] = useState(false);
    const connectedWalletNameRef = useRef<string>("");
    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

    useEffect(() => {
        setMounted(true);
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const phantom = wallets.find(w => w.adapter.name === "Phantom");
        const solflare = wallets.find(w => w.adapter.name === "Solflare");
        const isPhantomWindow = !!(window as any).solana?.isPhantom || !!(window as any).phantom?.solana?.isPhantom;
        setPhantomAvailable(phantom?.readyState === "Installed" || isPhantomWindow);
        setSolflareAvailable(solflare?.readyState === "Installed" || !!(window as any).solflare);
    }, [isOpen, wallets]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setStep("select");
            setSelectedRole(null);
            setSelectedOrgType(null);
            setLoadingKey(null);
            setToast(null);
            setRoleConfirmLoading(false);
            connectedWalletNameRef.current = "";
        }
    }, [isOpen]);

    // Clear spinner on connection error
    useEffect(() => {
        if (!connectionError || !loadingKey) return;
        if (connectionError === "cancelled") {
            connectedWalletNameRef.current = ""; // abandon intent
        } else if (connectionError === "extension_dead") {
            // MV3 wake-up: wallet may connect shortly after this error.
            // Keep connectedWalletNameRef so the ref-gate in handleConnected can catch it.
        } else {
            setToast({ message: "Connection failed. Please try again.", type: "error" });
            connectedWalletNameRef.current = ""; // hard error — abandon intent
        }
        setLoadingKey(null);
    }, [connectionError, loadingKey]);

    // Safety-net: clear spinner after 30s
    useEffect(() => {
        if (!loadingKey || loadingKey === "google") return;
        const t = setTimeout(() => setLoadingKey(null), 30000);
        return () => clearTimeout(t);
    }, [loadingKey]);

    // Fires when wallet connection completes — detect new vs returning.
    // Secondary gate: connectedWalletNameRef catches the MV3 race where loadingKey
    // was cleared by extension_dead error before connected became true.
    useEffect(() => {
        if (!connected || !isOpen || step !== "select") return;
        if (!loadingKey && !connectedWalletNameRef.current) return;

        const handleConnected = async () => {
            const address = publicKey?.toBase58();
            if (!address) { setLoadingKey(null); return; }

            if (googleSession) {
                setLoadingKey(null);
                onClose();
                return;
            }

            try {
                const res = await fetch(`/api/check-wallet?wallet=${address}&mode=builder`);
                const check = await res.json();

                const dest = isMobile ? "/" : "/dashboard";

                if (check.allowed === false) {
                    // Existing recruiter — go straight to dashboard
                    const wn = connectedWalletNameRef.current;
                    connectedWalletNameRef.current = "";
                    saveSession(address, wn, "recruiter");
                    setLoadingKey(null);
                    onClose();
                    router.push(isMobile ? "/" : "/dashboard");
                    return;
                }

                if (check.isNew === true) {
                    // Google builder already chose their role — skip wallet role selection
                    if (googleOrgAccount?.account_type === "builder") {
                        const wn = connectedWalletNameRef.current;
                        connectedWalletNameRef.current = "";
                        saveSession(address, wn, "builder");
                        setLoadingKey(null);
                        onClose();
                        router.push(dest);
                        return;
                    }
                    // Brand-new wallet — keep ref intact so handleRoleConfirm can use walletName
                    setLoadingKey(null);
                    setStep("role"); // step change gates effect from re-firing
                    return;
                }

                // Existing builder — go straight to dashboard
                const wn = connectedWalletNameRef.current;
                connectedWalletNameRef.current = "";
                saveSession(address, wn, "builder");
                setLoadingKey(null);
                onClose();
                router.push(dest);
            } catch {
                // API error — still save session so the wallet auto-reconnects next visit
                const wn = connectedWalletNameRef.current;
                connectedWalletNameRef.current = "";
                saveSession(address, wn, "builder");
                setLoadingKey(null);
                onClose();
                router.push(isMobile ? "/" : "/dashboard");
            }
        };

        handleConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, isOpen, step, loadingKey, publicKey]);

    if (!mounted || !isOpen) return null;

    const effectivelyAvailable = (available: boolean) => available || isMobile;
    const noneAvailable = !phantomAvailable && !solflareAvailable;

    const handleConnect = async (walletName: string) => {
        try {
            if (connected) await disconnect();
            connectedWalletNameRef.current = walletName;
            setLoadingKey(walletName);
            await connectWallet(walletName, isMobile);
        } catch {
            setLoadingKey(null);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoadingKey("google");
        try {
            await signInWithGoogle();
        } catch {
            setLoadingKey(null);
        }
    };

    // After new user picks their role, validate then redirect
    const handleRoleConfirm = async () => {
        if (!selectedRole) return;
        const address = publicKey?.toBase58();
        setRoleConfirmLoading(true);

        if (selectedRole === "recruiter" && address) {
            try {
                const res = await fetch(`/api/check-wallet?wallet=${address}&mode=recruiter`);
                const check = await res.json();
                if (check.allowed === false) {
                    setToast({ message: check.reason ?? "This wallet cannot be used as a Recruiter.", type: "error" });
                    setRoleConfirmLoading(false);
                    return;
                }
            } catch {
                // API error — allow through
            }
        }

        setRoleConfirmLoading(false);

        if (selectedRole === "builder") {
            if (address) saveSession(address, connectedWalletNameRef.current, "builder");
            onClose();
            router.push(isMobile ? "/" : "/dashboard");
        } else {
            // Recruiter — pick org type next
            setStep("org-type");
        }
    };

    const handleOrgTypeConfirm = () => {
        if (!selectedOrgType) return;
        const address = publicKey?.toBase58();
        if (address) saveSession(address, connectedWalletNameRef.current, "recruiter");
        onClose();
        router.push(`/org/edit-profile-wallet?type=${selectedOrgType}`);
    };

    const supportedWallets = [
        { name: "Phantom",  available: phantomAvailable,  icon: "/logos/phantom.svg",  downloadUrl: "https://phantom.app/download" },
        { name: "Solflare", available: solflareAvailable, icon: "/logos/solflare.svg", downloadUrl: "https://solflare.com/download" },
    ];

    // ── Reusable shell ──────────────────────────────────────────────────────────────
    const shell = (content: React.ReactNode) =>
        createPortal(
            <div className="fixed inset-0 z-[1000000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
                <div className="relative w-full sm:max-w-md bg-[#0d0d0f] border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200 max-h-[92dvh] overflow-y-auto">
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-10 h-1 rounded-full bg-white/10" />
                    </div>
                    {content}
                    <div className="h-safe-bottom sm:hidden" />
                </div>
            </div>,
            document.body
        );

    // ── Org type step ───────────────────────────────────────────────────────────────
    if (step === "org-type") {
        return shell(
            <>
                <div className="flex justify-center gap-1.5 pt-5 pb-1">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>

                <div className="p-6 sm:p-7 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Choose your org type</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Step 3 of 3 — Recruiter Setup</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-2xl transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 sm:p-7 space-y-4">
                    {ORG_TYPES.map(t => {
                        const Icon = t.icon;
                        const active = selectedOrgType === t.value;
                        return (
                            <div
                                key={t.value}
                                onClick={() => setSelectedOrgType(t.value)}
                                className={`p-5 rounded-[20px] border cursor-pointer transition-all ${active ? "border-amber-500/50 bg-amber-500/10" : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-amber-500/20" : "bg-white/5"}`}>
                                        <Icon className={`w-5 h-5 ${active ? "text-amber-400" : "text-slate-500"}`} />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${active ? "text-white" : "text-slate-300"}`}>{t.label}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        onClick={handleOrgTypeConfirm}
                        disabled={!selectedOrgType}
                        className="w-full mt-2 py-3.5 rounded-[18px] bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        Continue to Profile Setup <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => { setStep("role"); setSelectedOrgType(null); }}
                        className="w-full py-2 text-[10px] text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5 font-medium uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                </div>

                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </>
        );
    }

    // ── Role selection step — only shown for brand-new wallets ──────────────────────
    if (step === "role") {
        const shortAddress = publicKey
            ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
            : "";

        return shell(
            <>
                <div className="flex justify-center gap-1.5 pt-5 pb-1">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <div className={`w-2 h-2 rounded-full transition-colors ${selectedRole === "builder" ? "bg-indigo-400" : selectedRole === "recruiter" ? "bg-amber-400" : "bg-white/30"}`} />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>

                <div className="p-6 sm:p-7 border-b border-white/5 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">How will you use ChainVolio?</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Step 2 of 2 — Choose your role</p>
                        {shortAddress && (
                            <div className="mt-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <p className="text-[11px] text-slate-400">
                                    Connected as: <span className="font-mono text-white/70">{shortAddress}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-2xl transition-colors text-slate-400 hover:text-white shrink-0 ml-2">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 sm:p-7 space-y-4">
                    {/* Role cards — left / right */}
                    <div className="grid grid-cols-2 gap-3">
                        <div
                            onClick={() => setSelectedRole("builder")}
                            className={`p-5 rounded-[20px] border cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${
                                selectedRole === "builder"
                                    ? "border-indigo-500/50 bg-indigo-500/10"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${selectedRole === "builder" ? "bg-indigo-500/20" : "bg-white/5"}`}>
                                🏗
                            </div>
                            <div>
                                <p className={`font-black text-sm ${selectedRole === "builder" ? "text-white" : "text-slate-300"}`}>Builder</p>
                                <p className="text-[10px] text-slate-500 mt-1 leading-snug">Talent, dev, designer, creator</p>
                            </div>
                            {selectedRole === "builder" && (
                                <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                            )}
                        </div>

                        <div
                            onClick={() => setSelectedRole("recruiter")}
                            className={`p-5 rounded-[20px] border cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${
                                selectedRole === "recruiter"
                                    ? "border-amber-500/50 bg-amber-500/10"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${selectedRole === "recruiter" ? "bg-amber-500/20" : "bg-white/5"}`}>
                                🔍
                            </div>
                            <div>
                                <p className={`font-black text-sm ${selectedRole === "recruiter" ? "text-white" : "text-slate-300"}`}>Recruiter</p>
                                <p className="text-[10px] text-slate-500 mt-1 leading-snug">Company, DAO, community</p>
                            </div>
                            {selectedRole === "recruiter" && (
                                <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-black" />
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleRoleConfirm}
                        disabled={!selectedRole || roleConfirmLoading}
                        className={`w-full py-3.5 rounded-[18px] disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            selectedRole === "recruiter"
                                ? "bg-amber-500 hover:bg-amber-400 text-black"
                                : selectedRole === "builder"
                                    ? "bg-indigo-500 hover:bg-indigo-400 text-white"
                                    : "bg-white/10 text-white/30"
                        }`}
                    >
                        {roleConfirmLoading
                            ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            : selectedRole
                                ? `Continue as ${selectedRole === "builder" ? "Builder" : "Recruiter"} →`
                                : "Select your role to continue"}
                    </button>

                    <button
                        onClick={() => { setStep("select"); setSelectedRole(null); }}
                        className="w-full py-2 text-[10px] text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5 font-medium uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <p className="text-center text-[10px] text-slate-600">You can change this later in settings</p>
                </div>

                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </>
        );
    }

    // ── Wallet selection step (Sign In / Link Wallet) ──────────────────────────────
    return shell(
        <>
            {/* Header */}
            <div className="p-5 sm:p-7 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                        {googleSession ? "Link Your Wallet" : "Sign In"}
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">
                        {googleSession
                            ? "Connect a Solana wallet to unlock on-chain features"
                            : "New wallet? You’ll set up your role after connecting."}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-2xl transition-colors text-slate-400 hover:text-white shrink-0">
                    <X className="w-5 h-5" />
                </button>
            </div>
            {googleSession && (
                <div className="mx-5 sm:mx-6 mt-5 p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-teal-300 leading-relaxed">
                        Linking a wallet to your Google account unlocks on-chain proof of work, attestations, and a verifiable CV — all tied to your existing account.
                    </p>
                </div>
            )}

            <div className="p-5 sm:p-6 space-y-3">
                {/* No wallet warning */}
                {noneAvailable && !isMobile && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-400 leading-relaxed">No wallet detected. Install Phantom or Solflare to continue.</p>
                    </div>
                )}

                {/* Wallet buttons */}
                <div className="space-y-2.5">
                    {supportedWallets.map((wallet) => (
                        <div
                            key={wallet.name}
                            onClick={() => effectivelyAvailable(wallet.available) ? handleConnect(wallet.name) : window.open(wallet.downloadUrl, "_blank", "noopener,noreferrer")}
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
                                    <div className="px-3 py-1.5 bg-white/[0.08] group-hover:bg-white/[0.12] text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all min-w-[60px] flex items-center justify-center border border-white/[0.08]">
                                        {loadingKey === wallet.name
                                            ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : isMobile && !wallet.available ? "Open" : "Connect"}
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

                {/* Divider + Google option — only shown when not already in a Google session */}
                {!googleSession && (
                    <>
                        <div className="flex items-center gap-3 py-1">
                            <div className="flex-1 h-px bg-white/[0.06]" />
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">or</p>
                            <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>

                        <div
                            onClick={handleGoogleSignIn}
                            className="group flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-[18px] hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer"
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
                                    <p className="text-[10px] text-slate-500">Builder or Recruiter — choose after sign in</p>
                                </div>
                            </div>
                            <div className="shrink-0 ml-2">
                                <div className="px-3 py-1.5 bg-white/[0.06] group-hover:bg-white/[0.10] border border-white/[0.08] text-white/60 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all min-w-[60px] flex items-center justify-center">
                                    {loadingKey === "google"
                                        ? <div className="w-3 h-3 border-2 border-white/30 border-t-white/60 rounded-full animate-spin" />
                                        : "Sign In"}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Mobile connection tip */}
                {loadingKey && loadingKey !== "google" && isMobile && (
                    <p className="text-[9px] text-amber-400/70 text-center leading-relaxed">
                        Waiting for wallet confirmation — make sure your wallet app is open.
                    </p>
                )}

                {!googleSession && (
                    <div className="pt-1">
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] text-center mb-2">What you can do</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-[14px] bg-indigo-500/[0.06] border border-indigo-500/[0.12]">
                                <p className="text-[10px] font-black text-indigo-300/80 mb-1.5">🏗 Builder</p>
                                <ul className="space-y-0.5">
                                    {["Verified resume", "On-chain proof of work", "Shareable profile link"].map(t => (
                                        <li key={t} className="text-[9px] text-slate-500 flex items-center gap-1"><span className="text-indigo-500/60">·</span>{t}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-3 rounded-[14px] bg-amber-500/[0.06] border border-amber-500/[0.12]">
                                <p className="text-[10px] font-black text-amber-300/80 mb-1.5">🔍 Recruiter</p>
                                <ul className="space-y-0.5">
                                    {["Post hiring collections", "Attest talent work", "Browse verified talent"].map(t => (
                                        <li key={t} className="text-[9px] text-slate-500 flex items-center gap-1"><span className="text-amber-500/60">·</span>{t}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}
