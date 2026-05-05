"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from "@solana/wallet-adapter-react";
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

/**
 * When Chrome suspends the Phantom MV3 service worker, autoConnect fails with
 * "Could not establish connection. Receiving end does not exist."
 * The failed attempt itself wakes the service worker up — so retrying after
 * a short delay almost always succeeds without any user interaction.
 */
function AutoConnectRetry() {
    const { connected, connecting, connect, wallet, error } = useWallet();
    const retriedRef = useRef(false);

    useEffect(() => {
        if (!error || retriedRef.current || connected || connecting || !wallet) return;
        const msg = error.message ?? "";
        if (!msg.includes("Receiving end does not exist") && !msg.includes("Could not establish connection")) return;

        retriedRef.current = true;
        const timer = setTimeout(async () => {
            try { await connect(); } catch { /* silent — user can still connect manually */ }
        }, 1500);

        return () => clearTimeout(timer);
    }, [error, connected, connecting, connect, wallet]);

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
                    <AutoConnectRetry />
                    {children}
                </ModalProv>
            </SolWallProv>
        </ConnProv>
    );
}
