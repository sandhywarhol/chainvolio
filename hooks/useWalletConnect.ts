"use client";

import { useState, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { performWalletConnection } from "@/lib/wallet-connection";

export function useWalletConnect() {
    const walletState = useWallet();
    const [isConnecting, setIsConnecting] = useState(false);
    const connectingRef = useRef(false);

    const connectWallet = useCallback(async (walletName: string, isMobile = false) => {
        if (connectingRef.current) return;

        try {
            await performWalletConnection(walletName, walletState, {
                isMobile,
                onConnectingStateChange: (state) => {
                    setIsConnecting(state);
                    connectingRef.current = state;
                },
            });
        } catch (err) {
            throw err;
        }
    }, [walletState]);

    return {
        connectWallet,
        isConnecting,
        connected: walletState.connected,
        publicKey: walletState.publicKey,
    };
}
