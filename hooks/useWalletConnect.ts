"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState, WalletName } from "@solana/wallet-adapter-base";

/**
 * Correct two-step wallet connection flow:
 *
 * 1. select(walletName) — tells the React context which adapter to use.
 *    This triggers a re-render that registers the adapter's event listeners
 *    (connect, disconnect, error) inside WalletProvider.
 *
 * 2. connect() — called AFTER the re-render (via useEffect watching `wallet`).
 *    By this point the context has fully switched to the new adapter and its
 *    event listeners are in place, so the `connected` / `publicKey` React
 *    state updates correctly when the user approves in the extension.
 *
 * Why the old approach broke: calling adapter.connect() directly right after
 * select() runs before React processes the state update, so the wallet
 * extension popup appears but the context never receives the connect event,
 * leaving `connected` stuck at false until a page refresh.
 */
export function useWalletConnect() {
    const { select, connect, wallet, wallets, connecting, connected, publicKey } = useWallet();
    const [isConnecting, setIsConnecting] = useState(false);
    const [pendingWallet, setPendingWallet] = useState<string | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const connectingRef = useRef(false);
    // Tracks which error we already forwarded so stale auto-connect errors are ignored
    const lastHandledErrorRef = useRef<unknown>(null);
    // Ref to the current connect fn so the retry closure always calls the latest version
    const connectRef = useRef(connect);
    useEffect(() => { connectRef.current = connect; }, [connect]);



    // Step 2: React has re-rendered with the new adapter — now call connect()
    useEffect(() => {
        if (!pendingWallet) return;
        if (!wallet || wallet.adapter.name !== pendingWallet) return;

        const doConnect = async () => {
            if (connectingRef.current) return;
            connectingRef.current = true;
            setIsConnecting(true);
            setConnectionError(null);
            try {
                // Race connect() against a 15s timeout so a hanging call never locks
                // the state machine — the finally block always runs and resets the refs.
                await Promise.race([
                    connectRef.current(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error("WalletConnectTimeout")), 15000)
                    ),
                ]);
                localStorage.removeItem("cv_connecting");
            } catch (err: any) {
                const msg: string = err?.message ?? "";
                // User closed/dismissed the popup — clear spinner but no error toast
                if (err?.name === "WalletWindowClosedError") {
                    setConnectionError("cancelled");
                    return;
                }

                // connect() hung for 15 s — treat as unresponsive extension
                if (msg === "WalletConnectTimeout") {
                    setConnectionError("extension_dead");
                    return;
                }

                // Chrome suspended the extension's MV3 service worker.
                // The failed message wakes it up — retry with increasing delays.
                if (msg.includes("Receiving end does not exist") || msg.includes("Could not establish connection")) {
                    connectingRef.current = false;
                    const delays = [1500, 2500, 3500];
                    for (const delay of delays) {
                        await new Promise(r => setTimeout(r, delay));
                        try {
                            await connectRef.current();
                            localStorage.removeItem("cv_connecting");
                            return; // succeeded
                        } catch (retryErr: any) {
                            const retryMsg: string = retryErr?.message ?? "";
                            if (!retryMsg.includes("Receiving end does not exist") &&
                                !retryMsg.includes("Could not establish connection")) {
                                // Different error — stop retrying
                                break;
                            }
                            // Still sleeping — try next delay
                        }
                    }
                    setConnectionError("extension_dead");
                    return;
                }

                // Any other unexpected error
                if (err?.name !== "WalletConnectionError") {
                    console.error("[WalletConnect] Failed:", err);
                }
                setConnectionError("unknown");
            } finally {
                setIsConnecting(false);
                connectingRef.current = false;
                setPendingWallet(null);
            }
        };

        doConnect();
    }, [wallet, pendingWallet]);

    const connectWallet = useCallback(
        async (walletName: string, isMobile = false) => {
            if (connectingRef.current) return;

            // Mobile + not inside wallet browser → open wallet's in-app browser via deep link
            if (isMobile) {
                const targetWallet = wallets.find(w => w.adapter.name === walletName);
                const isInstalled =
                    targetWallet?.readyState === WalletReadyState.Installed ||
                    (walletName === "Phantom" && (!!(window as any).solana?.isPhantom || !!(window as any).phantom?.solana?.isPhantom)) ||
                    (walletName === "Solflare" && !!(window as any).solflare);

                if (!isInstalled) {
                    if (localStorage.getItem("cv_connecting")) return;

                    const currentUrl = window.location.href;
                    const origin = window.location.origin;
                    localStorage.setItem("cv_connecting", walletName);

                    if (walletName === "Phantom") {
                        window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(origin)}`;
                    } else if (walletName === "Solflare") {
                        window.location.href = `https://solflare.com/ul/v1/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(origin)}`;
                    }
                    return;
                }
                // Inside wallet browser: fall through to normal connect below
            }

            // Step 1: tell the context which wallet we want.
            // Reset to null first so the useEffect always fires on retry even if
            // pendingWallet was already set to the same wallet name (React deduplicates
            // identical state updates, which would silently skip the connection).
            setPendingWallet(null);
            // Use a microtask so React processes the null before setting the new value.
            await Promise.resolve();
            setPendingWallet(walletName);
            select(walletName as WalletName);
        },
        [wallets, select]
    );

    return {
        connectWallet,
        isConnecting: isConnecting || connecting,
        connected,
        publicKey,
        connectionError,
    };
}
