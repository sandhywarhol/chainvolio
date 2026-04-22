"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { BaseWalletAdapter, WalletName, WalletReadyState, WalletConfigError } from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
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

export function WalletProvider({ children }: { children: React.ReactNode }) {
    useMemo(() => {
        if (typeof window === "undefined") return;
        
        const url = new URL(window.location.href);
        const params = url.searchParams;
        const phantomKey = params.get("phantom_encryption_public_key");
        const data = params.get("data");
        const nonce = params.get("nonce");

        if (data && nonce && phantomKey) {
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
                            localStorage.setItem("cv_mobile_wallet_address", payload.public_key);
                            if (payload.session) localStorage.setItem("cv_mobile_session", payload.session);
                            localStorage.setItem("cv_phantom_encryption_public_key", phantomKey);
                            
                            url.searchParams.delete("phantom_encryption_public_key");
                            url.searchParams.delete("data");
                            url.searchParams.delete("nonce");
                            window.history.replaceState({}, "", url.toString());
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to process mobile wallet redirect:", err);
            }
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
      <SolWallProv wallets={wallets} autoConnect>
        <ModalProv>
          {children}
        </ModalProv>
      </SolWallProv>
    </ConnProv>
  );
}
