"use client";

import { useMemo, useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork, WalletName } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * Handles the RETURN from a wallet deep link on mobile.
 *
 * Runs exactly once on mount. If the URL contains wallet return params
 * (data, nonce, phantom_encryption_public_key, errorCode), we know the
 * wallet app has redirected back. We:
 *   1. Clear cv_connecting immediately (prevents any loop)
 *   2. Strip the return params from the URL (keeps URL clean)
 *
 * No decryption. No connection attempt. Just cleanup.
 * The user will connect normally using the standard adapter
 * (window.solana / window.solflare are available inside the wallet browser).
 */
function MobileReturnHandler() {
    const { connected, connect, select, wallets } = useWallet();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) return;

        const url = new URL(window.location.href);

        // Detect a return from a wallet app via any known return params
        const hasReturnParams =
            url.searchParams.has("data") ||
            url.searchParams.has("phantom_encryption_public_key") ||
            url.searchParams.has("errorCode") ||
            url.searchParams.has("errorMessage");

        if (hasReturnParams) {
            console.log("[MobileReturn] Detected return from wallet app. Clearing cv_connecting.");

            // REQUIREMENT 3 & 4: Clear the flag immediately on return
            const lastWallet = localStorage.getItem("cv_connecting");
            localStorage.removeItem("cv_connecting");

            // Strip all wallet return params from the URL
            url.searchParams.delete("data");
            url.searchParams.delete("nonce");
            url.searchParams.delete("phantom_encryption_public_key");
            url.searchParams.delete("errorCode");
            url.searchParams.delete("errorMessage");
            window.history.replaceState({}, "", url.toString());

            // REQUIREMENT 1 & 2: Automatically trigger connect() after delay
            if (!connected && lastWallet) {
                console.log(`[MobileReturn] Auto-connecting to ${lastWallet}...`);
                
                // Find the wallet adapter
                const targetWallet = wallets.find((w: any) => w.adapter.name === lastWallet);
                
                if (targetWallet) {
                    const timer = setTimeout(async () => {
                        try {
                            select(lastWallet as WalletName);
                            // Wait a tiny bit for select to propagate
                            await new Promise(r => setTimeout(r, 100));
                            await connect();
                            console.log("[MobileReturn] Auto-connect successful.");
                        } catch (err) {
                            console.error("[MobileReturn] Auto-connect failed:", err);
                        }
                    }, 200); // 200ms delay as requested
                    return () => clearTimeout(timer);
                }
            }
        }

        // Safety: if cv_connecting was set but we returned with no params
        // (e.g. user cancelled), clear the flag after a timeout
        const connectingFlag = localStorage.getItem("cv_connecting");
        if (connectingFlag && !hasReturnParams) {
            console.log("[MobileReturn] Stale cv_connecting detected on mount. Clearing after 5s.");
            const timer = setTimeout(() => {
                localStorage.removeItem("cv_connecting");
                console.log("[MobileReturn] Stale cv_connecting cleared.");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [connected, connect, select, wallets]); // Re-run if wallet state changes during return

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

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        []
    );

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
