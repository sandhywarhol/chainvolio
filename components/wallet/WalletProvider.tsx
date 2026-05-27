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
 * If yes, triggers a two-step reconnect via select() → connect().
 *
 * autoConnect={false} is intentional: connect() without onlyIfTrusted works for both
 * trusted and untrusted sites, unlike autoConnect which silently fails when the wallet
 * hasn't granted trust to this origin yet.
 *
 * connectingRef prevents double-connect when the readyState dependency causes re-runs
 * as the Phantom extension transitions through its injection states.
 *
 * On connect() failure we call select(null) to clear the connecting state so the UI
 * falls through to the sign-in screen, but we intentionally do NOT touch localStorage —
 * a transient rejection (MV3 service worker race, wallet temporarily locked) should not
 * permanently log the user out.
 */
function SessionRestoreHandler() {
    const { select, connect, connected, wallet } = useWallet();
    const attemptedRef = useRef(false);
    const connectingRef = useRef(false);

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

    // Step 2: once the adapter is selected, call connect() once.
    // readyState is in deps so we can abort immediately if the extension isn't installed
    // and so we re-evaluate after Phantom finishes injecting. connectingRef ensures we
    // only ever call connect() once regardless of how many times this effect re-runs.
    useEffect(() => {
        if (!wallet || connected || !attemptedRef.current || connectingRef.current) return;

        if (wallet.adapter.readyState === WalletReadyState.NotDetected) {
            // Extension not installed in this browser — abort, show sign-in screen
            select(null as any);
            return;
        }

        connectingRef.current = true;

        // 15-second safety net: if Phantom hangs (MV3 service worker never wakes),
        // deselect the adapter so the UI falls through to the sign-in screen.
        const timeoutId = setTimeout(() => select(null as any), 15_000);

        connect()
            .catch(() => {
                // Failure (e.g., wallet locked, extension rejected) — clear adapter so
                // the connecting spinner is not shown indefinitely. Do NOT clear
                // localStorage; a transient error must not permanently log the user out.
                select(null as any);
            })
            .finally(() => clearTimeout(timeoutId));

    }, [wallet, connected, connect, select, wallet?.adapter?.readyState]);

    return null;
}

/**
 * Mid-session recovery: if the wallet disconnects after having been connected
 * (e.g. Phantom MV3 service-worker drop during an active session), attempt one
 * silent reconnect while the localStorage session is still valid.
 *
 * This handler intentionally does NOT delete localStorage on failure —
 * localStorage cleanup belongs only to the explicit logout flow or session expiry.
 *
 * wasConnectedRef ensures this handler is dormant during the initial page-load
 * restore sequence (which is owned by SessionRestoreHandler).
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

        // Not yet connected in this tab — let SessionRestoreHandler handle it
        if (!wasConnectedRef.current) return;

        // wallet deselected (null) after being connected — could be an explicit
        // disconnect or a hard reset. Don't clear localStorage; just stop here.
        if (!wallet) return;

        // One recovery attempt per disconnect event
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
