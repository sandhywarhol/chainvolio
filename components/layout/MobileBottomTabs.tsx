"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { CustomWalletModal } from "@/components/wallet/CustomWalletModal";
import { Home, Layers, ScanLine, FileText, User, Monitor, X } from "lucide-react";

const ACTIVE = "rgba(253,230,138,0.85)";
const INACTIVE = "rgba(255,255,255,0.3)";

export function MobileBottomTabs() {
    const pathname = usePathname();
    const { publicKey } = useWallet();
    const { session: googleSession, isGoogleSignedIn } = useGoogleAuth();
    const isLoggedIn = !!(publicKey || googleSession);

    // Google auth always takes priority over wallet for identity purposes.
    // Wallet connection by a Google user is for payment/on-chain only, not identity.
    const googleUid = isGoogleSignedIn ? googleSession?.user?.id ?? null : null;
    const cvHref = isGoogleSignedIn
      ? (googleUid ? `/org/${googleUid}` : null)
      : publicKey ? `/cv/${publicKey.toBase58()}` : null;
    const profileHref = isGoogleSignedIn
      ? (googleUid ? "/org/edit-profile" : "#")
      : publicKey ? "/profile" : "#";

    const [showModal, setShowModal] = useState(false);
    const [showTip, setShowTip] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem("cv_desktop_tip_dismissed");
        if (!dismissed) setShowTip(true);
    }, []);

    const dismissTip = () => {
        localStorage.setItem("cv_desktop_tip_dismissed", "1");
        setShowTip(false);
    };

    const tabs = [
        { href: "/", Icon: Home, protected: false },
        { href: "/proof-of-work", Icon: Layers, protected: true },
        { href: "/scan", Icon: ScanLine, protected: false },
        { href: cvHref || "#", Icon: FileText, protected: !cvHref },
        { href: profileHref, Icon: User, protected: !isLoggedIn },
    ];

    if (pathname.startsWith("/dashboard") || pathname.startsWith("/hiring") || pathname.startsWith("/r/") || pathname.startsWith("/scan")) return null;

    const isActive = (href: string) => {
        if (href === "#") return false;
        const base = href.split("?")[0];
        if (base === "/") return pathname === "/";
        return pathname.startsWith(base);
    };

    return (
        <>
            <nav
                className="fixed bottom-0 z-[99999] md:hidden"
                style={{ left: 25, right: 25, paddingBottom: "calc(env(safe-area-inset-bottom, 12px) + 10px)", paddingTop: 8 }}
            >
                {/* Desktop recommendation tip */}
                {showTip && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        marginBottom: 8, padding: "8px 12px", borderRadius: 14,
                        background: "rgba(6,6,8,0.97)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                    }}>
                        <Monitor size={13} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                        <p style={{ flex: 1, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4, margin: 0 }}>
                            <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Tip:</span> Use desktop for the best experience. Mobile is great for quick job applications.
                        </p>
                        <button onClick={dismissTip} style={{ background: "none", border: "none", padding: 2, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}>
                            <X size={12} style={{ color: "rgba(255,255,255,0.25)" }} />
                        </button>
                    </div>
                )}

                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-around", width: "100%",
                    background: "rgba(8,8,10,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                    borderRadius: 22, border: "1px solid rgba(255,255,255,0.07)",
                    paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 8,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}>
                    {tabs.map(({ href, Icon, protected: isProtected }, i) => {
                        const active = isActive(href);
                        const isScan = Icon === ScanLine;

                        if ((isProtected && !isLoggedIn) || href === "#") {
                            return (
                                <button
                                    key={i}
                                    onClick={() => setShowModal(true)}
                                    style={{ width: 52, height: 44, borderRadius: 24, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                    <Icon size={isScan ? 30 : 26} strokeWidth={1.8} style={{ color: INACTIVE }} />
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={i}
                                href={href}
                                className="flex items-center justify-center transition-all active:scale-90"
                                style={{ width: 52, height: 44, borderRadius: 24, background: active ? "rgba(253,230,138,0.08)" : "transparent" }}
                            >
                                <Icon size={isScan ? 30 : 26} strokeWidth={active ? 2.5 : 1.8} style={{ color: active ? ACTIVE : INACTIVE }} />
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <CustomWalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}
