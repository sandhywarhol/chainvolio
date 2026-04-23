"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { BaseWalletAdapter, WalletName, WalletReadyState, WalletConfigError } from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { performWalletConnection } from "@/lib/wallet-connection";
import "@solana/wallet-adapter-react-ui/styles.css";

// --- MOBILE REDIRECT ADAPTER ---
class MobileRedirectAdapter extends BaseWalletAdapter {
    name = "Mobile App" as WalletName<"Mobile App">;
    url = "https://phantom.app";
    icon = "/favicon.png";
    private _publicKey: PublicKey | null = null;
    private _readyState = WalletReadyState.Installed;

    constructor() {
        super();
        if (typeof window !== "undefined") {
            const addr = localStorage.getItem("cv_mobile_wallet_address");
            if (addr) {
                try {
                    this._publicKey = new PublicKey(addr);
                } catch {
                    localStorage.removeItem("cv_mobile_wallet_address");
                }
            }
        }
    }

    get publicKey() { return this._publicKey; }
    get connected() { return !!this._publicKey; }
    get connecting() { return false; }
    get readyState() { return this._readyState; }
    get supportedTransactionVersions() { return null; }

    async connect(): Promise<void> {
        const addr = localStorage.getItem("cv_mobile_wallet_address");
        if (addr) {
            this._publicKey = new PublicKey(addr);
            this.emit("connect", this._publicKey);
        } else {
            this.emit("error", new WalletConfigError("No mobile wallet session found. Please use the connect button."));
        }
    }

    async disconnect(): Promise<void> {
        this._publicKey = null;
        localStorage.removeItem("cv_mobile_wallet_address");
        localStorage.removeItem("cv_mobile_session");
        localStorage.removeItem("cv_mobile_login_pending");
        this.emit("disconnect");
    }

    async sendTransaction(transaction: any, connection: any, options: any): Promise<any> {
        throw new WalletConfigError("Transaction signing not implemented for mobile redirect yet.");
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        if (!this._publicKey) throw new WalletConfigError("Not connected");
        
        const session = localStorage.getItem("cv_mobile_session");
        if (!session) throw new WalletConfigError("No active session");

        const keypair = nacl.box.keyPair();
        localStorage.setItem("cv_dapp_secret_key", bs58.encode(keypair.secretKey));
        
        const payload = {
            session,
            message: bs58.encode(message),
        };

        const sharedSecret = nacl.box.before(bs58.decode(localStorage.getItem("cv_phantom_encryption_public_key") || ""), keypair.secretKey);
        const nonce = nacl.randomBytes(24);
        const encryptedPayload = nacl.box.after(new TextEncoder().encode(JSON.stringify(payload)), nonce, sharedSecret);

        const params = new URLSearchParams({
            dapp_encryption_public_key: bs58.encode(keypair.publicKey),
            nonce: bs58.encode(nonce),
            payload: bs58.encode(encryptedPayload),
            redirect_link: window.location.href,
        });

        window.location.href = `https://phantom.app/ul/v1/signMessage?${params.toString()}`;
        return new Uint8Array();
    }
}

// --- MOBILE RECOVERY COMPONENT ---
// Runs ONCE on mount. Handles the return from Phantom deep link and connects the
// MobileRedirectAdapter. Does NOT listen to focus/visibilitychange to avoid loops.
function MobileRecoveryHandler() {
    const walletState = useWallet();
    const { connected, publicKey } = walletState;
    const hasRunRef = useRef(false);

    useEffect(() => {
        // Run only once per mount
        if (hasRunRef.current) return;
        if (typeof window === "undefined") return;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) return;

        const hasPendingLogin = localStorage.getItem("cv_mobile_login_pending") === "true";
        if (!hasPendingLogin) return;

        // Instruction 4: If already connected, clear flag and stop — do NOT reconnect.
        if (connected && publicKey) {
            console.log("[MobileRecovery] Already connected, clearing pending flag.");
            localStorage.removeItem("cv_mobile_login_pending");
            return;
        }

        // Mark as run so this never fires twice
        hasRunRef.current = true;

        // Clear the pending flag immediately BEFORE attempting connection.
        // This ensures that even if the connection call fails or the page
        // re-mounts, we do NOT enter the loop again.
        localStorage.removeItem("cv_mobile_login_pending");

        console.log("[MobileRecovery] Pending login detected. Connecting via MobileRedirectAdapter...");

        performWalletConnection("Mobile App", walletState, {
            isMobile: true,
            retryOnFailure: false,
            onConnectingStateChange: () => {}
        }).catch((err) => {
            console.error("[MobileRecovery] Connection failed:", err);
        });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps: run once on mount only. DO NOT add walletState here.

    return null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
    // Requirement 1: Disable autoConnect on mobile to prevent automatic reconnects
    // and redirect loops after returning from Phantom/Solflare deep link.
    const [autoConnect, setAutoConnect] = useState(true);
    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            setAutoConnect(false);
        }
    }, []);

    useMemo(() => {
        if (typeof window === "undefined") return;
        
        const url = new URL(window.location.href);
        const params = url.searchParams;
        const phantomKey = params.get("phantom_encryption_public_key");
        const data = params.get("data");
        const nonce = params.get("nonce");

        // If we have redirect params, try to process them
        if (data && nonce && phantomKey) {
            let decryptedSuccessfully = false;
            try {
                const sharedSecretKey = localStorage.getItem("cv_dapp_secret_key");
                if (sharedSecretKey) {
                    const secretKey = bs58.decode(sharedSecretKey);
                    const sharedSecret = nacl.box.before(bs58.decode(phantomKey), secretKey);
                    const decryptedData = nacl.box.open.after(
                        bs58.decode(data),
                        bs58.decode(nonce),
                        sharedSecret
                    );

                    if (decryptedData) {
                        const payload = JSON.parse(new TextDecoder().decode(decryptedData));
                        if (payload.public_key) {
                            console.log("[WalletProvider] Decrypted mobile payload successfully.");
                            localStorage.setItem("cv_mobile_wallet_address", payload.public_key);
                            if (payload.session) localStorage.setItem("cv_mobile_session", payload.session);
                            localStorage.setItem("cv_phantom_encryption_public_key", phantomKey);
                            
                            // Flag for MobileRecoveryHandler to pick up on next mount
                            localStorage.setItem("cv_mobile_login_pending", "true");
                            decryptedSuccessfully = true;
                        }
                    }
                } else {
                    console.warn("[WalletProvider] Missing cv_dapp_secret_key in localStorage. Could not decrypt return payload.");
                }
            } catch (err) {
                console.error("[WalletProvider] Failed to process mobile wallet redirect:", err);
            }

            // Fallback: If decryption failed but we already HAVE a wallet address in storage,
            // we can still assume a successful return and try to reconnect.
            if (!decryptedSuccessfully) {
                const existingAddr = localStorage.getItem("cv_mobile_wallet_address");
                if (existingAddr) {
                    console.log("[WalletProvider] Decryption failed but existing address found. Attempting recovery anyway.");
                    localStorage.setItem("cv_mobile_login_pending", "true");
                }
            }

            // Always strip params to clean up URL and prevent re-processing
            url.searchParams.delete("phantom_encryption_public_key");
            url.searchParams.delete("data");
            url.searchParams.delete("nonce");
            window.history.replaceState({}, "", url.toString());
        }
    }, []);

    const network = WalletAdapterNetwork.Mainnet;

    const endpoint = useMemo(
        () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network),
        [network]
    );

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(), 
            new SolflareWalletAdapter(),
            new MobileRedirectAdapter()
        ], 
        []
    );

    const ConnProv = ConnectionProvider as any;
    const SolWallProv = SolanaWalletProvider as any;
    const ModalProv = WalletModalProvider as any;

    return (
        <ConnProv endpoint={endpoint}>
            <SolWallProv wallets={wallets} autoConnect={autoConnect}>
                <ModalProv>
                    <MobileRecoveryHandler />
                    {children}
                </ModalProv>
            </SolWallProv>
        </ConnProv>
    );
}
