import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './app/navigation/AppNavigator';
import { WalletProvider } from './app/context/WalletContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <AppNavigator />
      </WalletProvider>
    </SafeAreaProvider>
  );
}
