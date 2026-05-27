"use client";

import { useMemo, useEffect, useRef } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork, WalletError, WalletAdapter, WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * Clears cv_connecting flag when site loads inside a wallet's in-app browser.
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
 * On mount, checks if there is a valid saved session (cv_wallet_name + cv_session_exp).
 * If yes, triggers a two-step reconnect via select() → connect() — this silently reconnects
 * for trusted sites (returning users) and shows a popup for untrusted sites (permission revoked).
 * autoConnect={false} is intentional: calling connect() without silent:true always works for
 * both trusted and untrusted sites, unlike autoConnect which uses onlyIfTrusted and silently
 * fails for sites the wallet hasn't trusted yet (new browser / first visit).
 */
function SessionRestoreHandler() {
    const { select, connect, connected, wallet } = useWallet();
    const attemptedRef = useRef(false);

    // Step 1: select the saved wallet adapter
    useEffect(() => {
        if (connected || attemptedRef.current) return;
        try {
            const walletName = localStorage.getItem("cv_wallet_name");
            const exp = localStorage.getItem("cv_session_exp");
            if (!walletName || !exp || Date.now() >= parseInt(exp)) return;
            attemptedRef.current = true;
            select(walletName as WalletName);
        } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Step 2: after the adapter is set, call connect()
    useEffect(() => {
        if (!wallet || connected || !attemptedRef.current) return;
        
        // Wait for the browser extension to inject before trying to connect
        if (wallet.adapter.readyState === WalletReadyState.NotDetected) return;

        let isCancelled = false;
        const doConnect = async () => {
            try {
                await Promise.race([
                    connect(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error("Timeout")), 15000)
                    )
                ]);
            } catch (err) {
                if (!isCancelled) {
                    // Timeout or error (e.g., wallet locked, dropped silently)
                    select(null as any);
                }
            }
        };

        doConnect();
        
        return () => {
            isCancelled = true;
        };
    }, [wallet, connected, connect, select, wallet?.adapter?.readyState]);

    return null;
}

/**
 * Mid-session recovery: if the wallet disconnects (e.g. Phantom MV3 service-worker drop)
 * but the localStorage session is still valid, attempt a silent reconnect once.
 * A separate ref prevents infinite retry loops.
 */
function SessionRecoveryHandler() {
    const { connect, connected, wallet } = useWallet();
    const recoveryAttemptRef = useRef(false);
    const wasConnectedRef = useRef(false);

    useEffect(() => {
        if (connected) {
            wasConnectedRef.current = true;
            recoveryAttemptRef.current = false;
            return;
        }
        
        // If it was NEVER connected in this tab, this is an initial load.
        // Let SessionRestoreHandler handle initial loads.
        if (!wasConnectedRef.current) return;
        
        // If we reach here, connected became false AFTER being true.
        // If wallet is completely deselected (null), it means a hard disconnect or rejection.
        if (!wallet) {
            localStorage.removeItem("cv_session_exp");
            localStorage.removeItem("cv_wallet_name");
            return;
        }

        if (recoveryAttemptRef.current) return;
        try {
            const exp = localStorage.getItem("cv_session_exp");
            if (!exp || Date.now() >= parseInt(exp)) return;
            recoveryAttemptRef.current = true;
            connect().catch(() => {});
        } catch {}
    }, [connected, wallet, connect]);

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
            <SolWallProv
                wallets={wallets}
                autoConnect={false}
                onError={(error: WalletError, adapter: WalletAdapter | undefined) => {
                    console.warn(`[WalletProvider] error (${adapter?.name ?? "unknown"}):`, error.name, error.message);
                }}
            >
                <ModalProv>
                    <MobileReturnHandler />
                    <SessionRestoreHandler />
                    <SessionRecoveryHandler />
                    {children}
                </ModalProv>
            </SolWallProv>
        </ConnProv>
    );
}
