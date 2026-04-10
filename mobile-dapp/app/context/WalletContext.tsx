import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface WalletContextType {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  hasProfile: boolean | null;
  setHasProfile: (has: boolean | null) => void;
  isConnected: boolean;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const isConnected = !!walletAddress;

  const disconnect = () => {
    setWalletAddress(null);
    setAuthToken(null);
    setHasProfile(null);
  };

  return (
    <WalletContext.Provider value={{ 
      walletAddress, 
      setWalletAddress, 
      hasProfile, 
      setHasProfile,
      isConnected,
      authToken,
      setAuthToken,
      disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
