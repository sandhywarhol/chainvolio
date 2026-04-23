import { WalletContextState } from "@solana/wallet-adapter-react";
import { WalletReadyState, WalletName } from "@solana/wallet-adapter-base";
import nacl from "tweetnacl";
import bs58 from "bs58";

export interface ConnectionOptions {
    isMobile: boolean;
    retryOnFailure?: boolean;
    onConnectingStateChange?: (isConnecting: boolean) => void;
    recoveryWallet?: string;
}

/**
 * SINGLE shared connection logic for both manual triggers and automatic recovery.
 */
export async function performWalletConnection(
    walletName: string,
    walletState: WalletContextState,
    options: ConnectionOptions
): Promise<void> {
    const { wallets, select, connect, wallet, connected, publicKey } = walletState;
    const { isMobile, retryOnFailure = true, onConnectingStateChange, recoveryWallet } = options;

    try {
        onConnectingStateChange?.(true);
        console.log(`[WalletConnection] Initiating flow for: ${walletName}`);

        // 1. Detection & Adapter Finding
        const targetWallet = wallets.find(w => w.adapter.name === walletName);
        if (!targetWallet) {
            throw new Error(`Wallet adapter for ${walletName} not found.`);
        }

        const isInstalled = targetWallet.readyState === WalletReadyState.Installed || 
                           (walletName === "Phantom" && !!(window as any).solana?.isPhantom) ||
                           (walletName === "Solflare" && !!(window as any).solflare);

        // 2. Mobile Deep Linking (Redirect)
        if (isMobile && !isInstalled && walletName !== "Mobile App") {
            console.log("[WalletConnection] Mobile & Not Installed: Handling deep link redirect.");
            const currentUrl = window.location.href;
            const keypair = nacl.box.keyPair();
            localStorage.setItem("cv_dapp_secret_key", bs58.encode(keypair.secretKey));
            const dappPublicKey = bs58.encode(keypair.publicKey);

            const params = new URLSearchParams({
                app_url: window.location.origin,
                dapp_encryption_public_key: dappPublicKey,
                redirect_link: currentUrl,
                cluster: "mainnet-beta"
            });

            localStorage.setItem("cv_mobile_login_pending", "true");

            if (walletName === "Phantom") {
                window.location.href = `https://phantom.app/ul/v1/connect?${params.toString()}`;
            } else if (walletName === "Solflare") {
                const solflareParams = new URLSearchParams({
                    app_url: window.location.origin,
                    dapp_encryption_public_key: dappPublicKey,
                    redirect: currentUrl,
                    cluster: "mainnet-beta"
                });
                window.location.href = `https://solflare.com/ul/v1/connect?${solflareParams.toString()}`;
            }
            return; 
        }

        // 3. Selection — inform the provider which wallet is active
        if (wallet?.adapter.name !== walletName) {
            console.log(`[WalletConnection] Selecting adapter: ${walletName}`);
            select(walletName as WalletName);
            // Note: we do NOT await state propagation here because we connect via
            // targetWallet.adapter directly (step 5), which bypasses the stale closure.
        }

        // 4. Readiness Guard — use targetWallet.adapter (live instance, not stale React state)
        let attempts = 0;
        while (attempts < 10 && 
               targetWallet.adapter.readyState !== WalletReadyState.Installed && 
               targetWallet.adapter.readyState !== WalletReadyState.Loadable) {
            console.log(`[WalletConnection] Waiting for readiness (Attempt ${attempts + 1})...`);
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }

        // 5. Connect directly on the adapter instance.
        // CRITICAL: We call targetWallet.adapter.connect() NOT connect() from useWallet().
        // useWallet().connect() reads `wallet` from React state — which is still null/stale
        // right after select() because React hasn't re-rendered yet.
        // targetWallet.adapter is a live object reference, so it always works immediately.
        console.log("[WalletConnection] Calling adapter.connect() directly...");
        try {
            await targetWallet.adapter.connect();
        } catch (err: any) {
            // Fallback retry for mobile
            if (isMobile && retryOnFailure) {
                console.warn("[WalletConnection] Mobile connection failed, retrying once in 500ms...");
                await new Promise(r => setTimeout(r, 500));
                await performWalletConnection(recoveryWallet || "Phantom", walletState, {
                    isMobile: true,
                    retryOnFailure: false,
                    onConnectingStateChange
                });
            } else {
                throw err;
            }
        }

        console.log("[WalletConnection] Connection successful.");

    } catch (err: any) {
        if (err.name === "WalletConnectionError" || err.name === "WalletWindowClosedError") {
            console.log("[WalletConnection] User cancelled connection.");
        } else {
            console.error("[WalletConnection] Failed:", err);
            throw err;
        }
    } finally {
        onConnectingStateChange?.(false);
    }
}
