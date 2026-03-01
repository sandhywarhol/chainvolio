import { supabaseServer as supabase } from "./supabase/server";
import nacl from "tweetnacl"; // We might need to install this if web3.js doesn't export it clearly
import bs58 from "bs58";

export type AuthAction = "submit_cv" | "submit_work" | "update_work" | "apply_job" | "attest" | "review_submission" | "admin_access" | "approve_org" | "reject_org" | "update_profile" | "update_profile_identity" | "delete_profile" | "update_submission" | "create_collection" | "update_collection";

export async function verifySignature(
    walletAddress: string,
    action: AuthAction,
    nonce: string,
    timestamp: number,
    signature: string,
    context?: string
): Promise<{ isValid: boolean; error?: string }> {
    // DEV MODE: Skip verification if explicitly enabled and NOT in production
    if (process.env.SKIP_SIG_VERIFY === "true" && process.env.NODE_ENV !== "production") {
        console.warn(`[DEV MODE] Skipping signature verification for action: ${action}`);
        return { isValid: true };
    }

    try {

        // 1. Check timestamp (prevent long-expired signatures, e.g. 10 min window)
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        if (now - timestamp > tenMinutes) {
            return { isValid: false, error: "Signature expired" };
        }

        // 2. Prevent future-dated signatures
        if (timestamp > now + 60000) { // 1 min buffer for clock skew
            return { isValid: false, error: "Invalid timestamp" };
        }

        // 3. Check for replay attack (nonce check)
        if (supabase) {
            const { data, error } = await supabase
                .from("nonces")
                .select("id")
                .eq("wallet_address", walletAddress)
                .eq("nonce", nonce)
                .single();

            if (data) {
                return { isValid: false, error: "Nonce already used" };
            }

            // Record nonce
            await supabase.from("nonces").insert({
                wallet_address: walletAddress,
                nonce,
                expires_at: new Date(timestamp + tenMinutes).toISOString()
            });
        }

        // 4. Reconstruct message
        let message = `ChainVolio Action: ${action}\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
        if (context) {
            message += `\nContext: ${context}`;
        }

        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = bs58.decode(walletAddress);

        // 5. Verify
        const isValid = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
        );

        if (!isValid) {
            return { isValid: false, error: "Invalid signature" };
        }

        return { isValid: true };
    } catch (err: any) {
        console.error("Signature verification error:", err);
        return { isValid: false, error: "Verification failed" };
    }
}
