"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomProvider } from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";

import "@solana/wallet-adapter-react-ui/styles.css";

// Your Phantom Portal App ID — registers ChainVolio as a recognized app
// so users see "ChainVolio" instead of "Unknown App" in their Phantom wallet.
const PHANTOM_APP_ID = "50fbe4ae-fe6e-4d4e-beb8-1a798d2f6632";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network),
    [network]
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  // Support for type variations in Next.js 14 environment
  const ConnProv = ConnectionProvider as any;
  const SolWallProv = SolanaWalletProvider as any;

  return (
    // PhantomProvider registers our App ID so Phantom wallet shows "ChainVolio"
    // instead of "Unknown App" during transaction signing and connection requests
    <PhantomProvider
      config={{
        providers: ["injected", "deeplink"], // Only extension + mobile deeplink (no social login)
        appId: PHANTOM_APP_ID,
        addressTypes: [AddressType.solana],
        authOptions: {
          redirectUrl: "https://chainvolio.xyz/auth/callback",
        },
      }}
      appName="ChainVolio"
      appIcon="https://chainvolio.xyz/chainvolio%20logo.png"
    >
      <ConnProv endpoint={endpoint}>
        <SolWallProv wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </SolWallProv>
      </ConnProv>
    </PhantomProvider>
  );
}
