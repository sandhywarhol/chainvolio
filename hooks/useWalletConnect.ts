"use client";

import { useState, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { performWalletConnection } from "@/lib/wallet-connection";

export function useWalletConnect() {
    const walletState = useWallet();
    const [isConnecting, setIsConnecting] = useState(false);
    const connectingRef = useRef(false);

    const connectWallet = useCallback(async (walletName: string) => {
        if (connectingRef.current) return;
        
        try {
            await performWalletConnection(walletName, walletState, {
                isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
                onConnectingStateChange: (state) => {
                    setIsConnecting(state);
                    connectingRef.current = state;
                }
            });
        } catch (err) {
            // Error is handled/logged in the utility
            throw err;
        }
    }, [walletState]);

    return { 
        connectWallet, 
        isConnecting,
        connected: walletState.connected,
        publicKey: walletState.publicKey
    };
}
