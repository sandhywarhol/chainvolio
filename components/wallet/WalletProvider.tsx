"use client";

import { useMemo, useEffect } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
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
 * Disconnects the wallet when the user leaves the page (refresh, tab close, navigation).
 * This removes the active Phantom session so the approval popup is shown again on the next visit,
 * giving users an explicit confirm step on every login.
 */
function DisconnectOnUnload() {
    const { connected, disconnect } = useWallet();

    useEffect(() => {
        const handleUnload = () => {
            // Try the direct wallet API first (most reliable in beforeunload context)
            try {
                const phantom = (window as any).phantom?.solana ?? (window as any).solana;
                if (phantom?.isPhantom) phantom.disconnect();
            } catch { /* ignore */ }
            try {
                const solflare = (window as any).solflare;
                if (solflare) solflare.disconnect();
            } catch { /* ignore */ }
            // Also call the adapter disconnect so React state stays consistent
            if (connected) disconnect().catch(() => {});
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [connected, disconnect]);

    return null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const network = WalletAdapterNetwork.Mainnet;

    const endpoint = useMemo(
        () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network),
        [network]
    );

    // Include adapters explicitly so select() + connect() always uses the
    // battle-tested legacy flow — Standard Wallet auto-registration is unreliable
    // with Phantom MV3 service workers in Chromium browsers.
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
    ], []);

    const ConnProv = ConnectionProvider as any;
    const SolWallProv = SolanaWalletProvider as any;
    const ModalProv = WalletModalProvider as any;

    return (
        <ConnProv endpoint={endpoint}>
            {/* autoConnect is disabled so the site never silently reconnects from a
                cached session — users must go through the wallet approval flow every visit. */}
            <SolWallProv wallets={wallets} autoConnect={false} onError={() => {}}>
                <ModalProv>
                    <MobileReturnHandler />
                    <DisconnectOnUnload />
                    {children}
                </ModalProv>
            </SolWallProv>
        </ConnProv>
    );
}
