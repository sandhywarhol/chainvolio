"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
// Legacy adapters removed in favor of standard detection
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
// Removed legacy Phantom explicit imports which conflicted with standard injected providers

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network),
    [network]
  );

  const wallets = useMemo(
    () => [], // Using standard wallet detection instead of hardcoded legacy adapters
    []
  );

  // Support for type variations in Next.js 14 environment
  const ConnProv = ConnectionProvider as any;
  const SolWallProv = SolanaWalletProvider as any;

  return (
    <ConnProv endpoint={endpoint}>
      <SolWallProv wallets={wallets} autoConnect>
        {children}
      </SolWallProv>
    </ConnProv>
  );
}
