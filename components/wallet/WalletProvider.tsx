"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network),
    [network]
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(), 
      new SolflareWalletAdapter()
    ],
    []
  );

  // Support for type variations in Next.js 14 environment
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
