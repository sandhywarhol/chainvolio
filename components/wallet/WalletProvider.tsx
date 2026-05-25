"use client";

import { useMemo, useEffect, useRef } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork, WalletError, WalletAdapter, WalletName } from "@solana/wallet-adapter-base";
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
    // 10s timeout guards against Phantom MV3 service-worker hangs where
    // connect() stays pending indefinitely, leaving `connecting=true` and
    // the dashboard spinner stuck for the user.
    useEffect(() => {
        if (!wallet || connected || !attemptedRef.current) return;
        const timer = setTimeout(() => {
            // Force the adapter to abort by selecting null — clears `connecting`
            // so the dashboard falls through to the "Sign in" screen.
            select(null as any);
        }, 10000);
        connect().catch(() => {}).finally(() => clearTimeout(timer));
    }, [wallet, connected, connect, select]);

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
                    {children}
                </ModalProv>
            </SolWallProv>
        </ConnProv>
    );
}
