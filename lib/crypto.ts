import { supabaseServer as supabase } from "./supabase/server";
import nacl from "tweetnacl"; // We might need to install this if web3.js doesn't export it clearly
import bs58 from "bs58";

export type AuthAction = "submit_cv"| "submit_work" | "update_work" | "apply_job" | "attest" | "review_submission" | "admin_access" | "approve_org" | "reject_org" | "admin_revoke" | "admin_reset" | "admin_expire" | "admin_delete" | "update_profile" | "update_profile_identity" | "delete_profile" | "update_submission" | "create_collection" | "update_collection" | "view_dashboard" | "generate_api_key" | "send_outreach" | "view_conversations" | "view_thread" | "send_message";

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

        // 1. Check entries and window
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        const twoHours = 2 * 60 * 60 * 1000;
        
        // Session-based actions get a longer window
        const expiryWindow = (action === "view_dashboard" || action === "update_profile" || action === "update_profile_identity" || action === "update_work" || action === "submit_work" || action === "create_collection" || action === "update_collection" || action === "apply_job" || action === "admin_access" || action === "approve_org" || action === "reject_org" || action === "generate_api_key" || action === "view_conversations" || action === "view_thread" || action === "send_message")
            ? twoHours
            : tenMinutes;

        if (now - timestamp > expiryWindow) {
            return { isValid: false, error: "Signature expired" };
        }

        // 2. Prevent future-dated signatures
        if (timestamp > now + 300000) { // 5 min buffer for clock skew
            return { isValid: false, error: "Invalid timestamp" };
        }

        // 3. Check for replay attack (nonce check)
        // We allow some actions to reuse nonces for smoother UX (session-like behavior)
        const isSessionAction = ["view_dashboard", "update_profile", "update_profile_identity", "update_work", "submit_work", "create_collection", "update_collection", "apply_job", "admin_access", "approve_org", "reject_org", "generate_api_key", "view_conversations", "view_thread", "send_message"].includes(action);

        if (supabase && !isSessionAction) {
            const { data } = await supabase
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

/**
 * Generates a SHA-256 hash of the review data for on-chain anchoring
 */
export async function generateReviewHash(data: any): Promise<string> {
    const jsonStr = JSON.stringify(data);
    const msgBuffer = new TextEncoder().encode(jsonStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
