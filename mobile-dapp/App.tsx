import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useCallback, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_700Bold, SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk';
import AppNavigator from './app/navigation/AppNavigator';
import { WalletProvider } from './app/context/WalletContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
  });

  useEffect(() => {
    console.log('FONTS STATUS:', { fontsLoaded, fontError });
  }, [fontsLoaded, fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // Keep splash screen
  }

  // If there's an error loading fonts, we'll still show the app but note it in logs
  if (fontError) {
     console.error('CRITICAL: Font Load failed', fontError);
  }



  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <WalletProvider>
        <AppNavigator />
      </WalletProvider>
    </SafeAreaProvider>
  );
}


