import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { useWallet } from '../context/WalletContext';
import { getUserMe } from '../services/api';

const LoadingScreen = ({ navigation }: any) => {
  const { walletAddress, setHasProfile } = useWallet();

  useEffect(() => {
    let isMounted = true;

    const checkProfile = async () => {
      // 1. Wait for Context Catch-up
      // Mobile state updates can sometimes trail navigation. We give it 500ms to propagate.
      if (!walletAddress) {
        console.log('LOADING SCREEN: Waiting for wallet context...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const activeWallet = walletAddress;
      console.log('LOADING SCREEN: Finalizing sync for:', activeWallet);
      
      if (!activeWallet) {
        console.log('LOADING SCREEN: Fatal - No wallet address found after wait.');
        navigation.replace('Welcome');
        return;
      }

      // 2. Synchronization Handshake
      const timeout = setTimeout(() => {
        if (isMounted) {
          console.log('LOADING SCREEN: Handshake Timeout - Proceeding to Setup');
          navigation.replace('Setup');
        }
      }, 7000);

      try {
        const userData = await getUserMe(activeWallet);
        clearTimeout(timeout);
        
        if (!isMounted) return;

        console.log('LOADING SCREEN: API Response:', userData);

        // If userData is not null and has a display name, the profile exists
        if (userData && (userData.displayName || userData.display_name)) {
          console.log('LOADING SCREEN: Profile found, going to Dashboard');
          setHasProfile(true);
          navigation.replace('MainTabs', { screen: 'Profile' });
        } else {
          console.log('LOADING SCREEN: No profile found, going to Setup');
          setHasProfile(false);
          navigation.replace('Setup');
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error('LOADING SCREEN: Profile check error:', error);
        if (isMounted) {
          // If we hit an error (e.g. 404 or network error), treat as new user
          setHasProfile(false);
          navigation.replace('Setup');
        }
      }
    };

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, [walletAddress]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.text}>Synchronizing with ChainVolio...</Text>
        <Text style={styles.subtext}>Connecting to Trust Layer</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
  },
  subtext: {
    color: '#444',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default LoadingScreen;
