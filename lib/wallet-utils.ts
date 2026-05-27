import { WalletContextState } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import type { AuthAction } from "./crypto";

export async function signChainVolioAction(
    wallet: WalletContextState,
    action: AuthAction,
    context?: string,
    options: { forceFresh?: boolean } = {}
): Promise<{ signature: string; nonce: string; timestamp: number } | null> {
    if (!wallet.publicKey || !wallet.signMessage) return null;

    const walletAddress = wallet.publicKey.toBase58();
    const storageKey = `cv_sig_${action}_${walletAddress}${context ? `_${context}` : ""}`;

    // 1. Check for cached session signature unless forced
    if (!options.forceFresh && typeof window !== "undefined") {
        const cached = sessionStorage.getItem(storageKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const tenMinutes = 10 * 60 * 1000;
                const twoHours = 2 * 60 * 60 * 1000;
                
                // For most actions, allow 2 hour cache (backend now supports this)
                const cacheWindow = (action === "view_dashboard" || action === "update_profile" || action === "update_profile_identity" || action === "update_work" || action === "submit_work" || action === "create_collection" || action === "update_collection" || action === "apply_job" || action === "admin_access" || action === "approve_org" || action === "reject_org" || action === "generate_api_key" || action === "view_conversations" || action === "view_thread" || action === "send_message")
                    ? twoHours
                    : tenMinutes;

                if (Date.now() - parsed.timestamp < cacheWindow - 30000) { // 30s buffer
                    return parsed;
                }
            } catch (e) {
                sessionStorage.removeItem(storageKey);
            }
        }
    }

    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();

    let message = `ChainVolio Action: ${action}\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
    if (context) {
        message += `\nContext: ${context}`;
    }

    const messageBytes = new TextEncoder().encode(message);

    try {
        const signatureBytes = await wallet.signMessage(messageBytes);
        const signature = bs58.encode(signatureBytes);

        const result = { signature, nonce, timestamp };

        // Cache for future use in this session
        if (typeof window !== "undefined") {
            sessionStorage.setItem(storageKey, JSON.stringify(result));
        }

        return result;
    } catch (err) {
        console.error("Signing failed:", err);
        return null;
    }
}
