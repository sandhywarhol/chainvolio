"use client";

import { useMemo, useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * Cleans up the cv_connecting flag when the site loads inside a wallet's in-app browser.
 * Browse-link flow: Chrome sets cv_connecting → wallet opens site in its browser → this clears it.
 */
function MobileReturnHandler() {
    useEffect(() => {
        if (typeof window === "undefined") return;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) return;
        localStorage.removeItem("cv_connecting");
    }, []);

    return null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const network = WalletAdapterNetwork.Mainnet;

    // REQUIREMENT 8: Disable autoConnect on mobile to prevent automatic
    // reconnect attempts that can cause redirect loops.
    const [autoConnect, setAutoConnect] = useState(true);
    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            setAutoConnect(false);
            console.log("[WalletProvider] Mobile detected — autoConnect disabled.");
        }
    }, []);

    const endpoint = useMemo(
        () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network),
        [network]
    );

    // Phantom and Solflare auto-register via the Standard Wallet interface —
    // listing them manually causes 40+ duplicate warnings per navigation.
    const wallets = useMemo(() => [], []);

    const ConnProv = ConnectionProvider as any;
    const SolWallProv = SolanaWalletProvider as any;
    const ModalProv = WalletModalProvider as any;

    return (
        <ConnProv endpoint={endpoint}>
            <SolWallProv wallets={wallets} autoConnect={autoConnect}>
                <ModalProv>
                    <MobileReturnHandler />
                    {children}
                </ModalProv>
            </SolWallProv>
        </ConnProv>
    );
}
