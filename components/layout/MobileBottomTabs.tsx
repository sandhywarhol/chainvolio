"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Home, Layers, ScanLine, FileText, User } from "lucide-react";

const ACTIVE = "rgba(253,230,138,0.85)";
const INACTIVE = "rgba(255,255,255,0.3)";

export function MobileBottomTabs() {
    const pathname = usePathname();
    const { publicKey } = useWallet();
    const { isGoogleSignedIn } = useGoogleAuth();
    const isLoggedIn = !!(publicKey || isGoogleSignedIn);
    const cvHref = publicKey ? `/cv/${publicKey.toBase58()}` : "/auth/role";

    const tabs = [
        { href: "/", Icon: Home },
        { href: isLoggedIn ? "/proof-of-work" : "/auth/role", Icon: Layers },
        { href: "/explore-talent", Icon: ScanLine },
        { href: cvHref, Icon: FileText },
        { href: isLoggedIn ? "/profile" : "/auth/role", Icon: User },
    ];

    // Hide on desktop-layout pages that have their own navigation
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/hiring")) {
        return null;
    }

    const isActive = (href: string) => {
        const base = href.split("?")[0];
        if (base === "/") return pathname === "/";
        return pathname.startsWith(base);
    };

    return (
        <nav
            className="fixed bottom-0 z-[99999] md:hidden"
            style={{ left: 25, right: 25, paddingBottom: "calc(env(safe-area-inset-bottom, 12px) + 10px)", paddingTop: 8 }}
        >
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                width: "100%",
                background: "rgba(22,22,24,0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 22,
                border: "1px solid rgba(255,255,255,0.1)",
                paddingLeft: 8,
                paddingRight: 8,
                paddingTop: 8,
                paddingBottom: 8,
                boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
                {tabs.map(({ href, Icon }) => {
                    const active = isActive(href);
                    const isScan = Icon === ScanLine;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center justify-center transition-all active:scale-90"
                            style={{
                                width: 52,
                                height: 44,
                                borderRadius: 24,
                                background: active ? "rgba(253,230,138,0.08)" : "transparent",
                            }}
                        >
                            <Icon
                                size={isScan ? 30 : 26}
                                strokeWidth={active ? 2.5 : 1.8}
                                style={{ color: active ? ACTIVE : INACTIVE }}
                            />
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
