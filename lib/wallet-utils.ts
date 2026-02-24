import { WalletContextState } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

export async function signChainVolioAction(
    wallet: WalletContextState,
    action: "submit_cv" | "submit_work" | "update_work" | "apply_job" | "attest" | "update_profile" | "update_profile_identity" | "delete_profile" | "update_submission" | "create_collection" | "update_collection" | "review_submission",
    context?: string
): Promise<{ signature: string; nonce: string; timestamp: number } | null> {
    if (!wallet.publicKey || !wallet.signMessage) return null;

    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const walletAddress = wallet.publicKey.toBase58();

    let message = `ChainVolio Action: ${action}\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
    if (context) {
        message += `\nContext: ${context}`;
    }

    const messageBytes = new TextEncoder().encode(message);

    try {
        const signatureBytes = await wallet.signMessage(messageBytes);
        const signature = bs58.encode(signatureBytes);

        return { signature, nonce, timestamp };
    } catch (err) {
        console.error("Signing failed:", err);
        return null;
    }
}
