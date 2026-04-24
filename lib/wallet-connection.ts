import { WalletContextState } from "@solana/wallet-adapter-react";
import { WalletReadyState, WalletName } from "@solana/wallet-adapter-base";

export interface ConnectionOptions {
    isMobile?: boolean;
    onConnectingStateChange?: (isConnecting: boolean) => void;
}

/**
 * Connects to the specified wallet adapter directly.
 *
 * MOBILE PATH:
 *   - If the wallet extension is not installed (not inside the wallet's browser),
 *     redirect to the wallet app's universal link.
 *   - The flag cv_connecting is set before redirect and cleared on return.
 *   - No encryption. No complex recovery. No loops.
 *
 * DESKTOP PATH:
 *   - Standard adapter.connect() flow. Unchanged.
 */
export async function performWalletConnection(
    walletName: string,
    walletState: WalletContextState,
    options: ConnectionOptions = {}
): Promise<void> {
    const { wallets, select, wallet } = walletState;
    const { isMobile = false, onConnectingStateChange } = options;

    try {
        onConnectingStateChange?.(true);
        console.log(`[WalletConnection] Initiating for: ${walletName} | mobile: ${isMobile}`);

        // 1. Find the adapter
        const targetWallet = wallets.find(w => w.adapter.name === walletName);
        if (!targetWallet) {
            throw new Error(`Wallet adapter for "${walletName}" not found.`);
        }

        // 2. Check if the extension/app is available in this browser context
        const isInstalled =
            targetWallet.readyState === WalletReadyState.Installed ||
            (walletName === "Phantom" && !!(window as any).solana?.isPhantom) ||
            (walletName === "Solflare" && !!(window as any).solflare);

        // ── MOBILE: not inside wallet browser → open site inside wallet's in-app browser ──
        // Using "browse" links opens the site directly inside the wallet's built-in browser
        // where window.solana / window.solflare is injected, enabling standard connect flow.
        if (isMobile && !isInstalled) {
            const alreadyConnecting = localStorage.getItem("cv_connecting");
            if (alreadyConnecting) {
                console.warn("[WalletConnection] cv_connecting already set — refusing duplicate redirect.");
                onConnectingStateChange?.(false);
                return;
            }

            const currentUrl = window.location.href;
            const origin = window.location.origin;
            console.log(`[WalletConnection] Mobile: opening ${walletName} in-app browser. URL: ${currentUrl}`);

            localStorage.setItem("cv_connecting", walletName);

            if (walletName === "Phantom") {
                const encodedUrl = encodeURIComponent(currentUrl);
                const encodedRef = encodeURIComponent(origin);
                window.location.href = `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedRef}`;
            } else if (walletName === "Solflare") {
                const encodedUrl = encodeURIComponent(currentUrl);
                const encodedRef = encodeURIComponent(origin);
                window.location.href = `https://solflare.com/ul/v1/browse/${encodedUrl}?ref=${encodedRef}`;
            }

            // Execution stops here — the browser navigates to the wallet app
            return;
        }

        // ── DESKTOP (or mobile inside wallet's own browser): standard flow ──

        // 3. Select the adapter so wallet-adapter context is aware
        if (wallet?.adapter.name !== walletName) {
            console.log(`[WalletConnection] Selecting: ${walletName}`);
            select(walletName as WalletName);
        }

        // 4. Wait for readiness — also exit early if window object already confirms wallet presence
        let attempts = 0;
        while (
            attempts < 15 &&
            targetWallet.adapter.readyState !== WalletReadyState.Installed &&
            targetWallet.adapter.readyState !== WalletReadyState.Loadable &&
            !(walletName === "Phantom" && !!(window as any).solana?.isPhantom) &&
            !(walletName === "Solflare" && !!(window as any).solflare)
        ) {
            console.log(`[WalletConnection] Waiting for readiness (attempt ${attempts + 1})...`);
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }

        // 5. Connect directly on the live adapter — bypasses stale React state
        console.log(`[WalletConnection] Calling adapter.connect() for ${targetWallet.adapter.name}...`);
        await targetWallet.adapter.connect();

        // 6. Clear any lingering mobile flag (e.g. user is now inside Phantom's browser)
        localStorage.removeItem("cv_connecting");

        console.log("[WalletConnection] Connection successful.");

    } catch (err: any) {
        if (err.name === "WalletWindowClosedError" || err.name === "WalletConnectionError") {
            console.log("[WalletConnection] User cancelled connection.");
        } else {
            console.error("[WalletConnection] Failed:", err);
            throw err;
        }
    } finally {
        onConnectingStateChange?.(false);
    }
}
