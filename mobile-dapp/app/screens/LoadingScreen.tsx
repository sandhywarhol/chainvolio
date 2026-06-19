import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar, ImageBackground } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../context/WalletContext';
import { getUserMe } from '../services/api';
import { Platform } from 'react-native';

const LoadingScreen = ({ navigation }: any) => {
  const { walletAddress, setHasProfile } = useWallet();

  useEffect(() => {
    let isMounted = true;

    const checkProfile = async () => {
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

      const timeout = setTimeout(() => {
        if (isMounted) {
          console.log('LOADING SCREEN: Handshake Slow - Still attempting to resolve...');
        }
      }, 7000);

      const finalTimeout = setTimeout(() => {
        if (isMounted) {
            console.log('LOADING SCREEN: Handshake Critical Timeout - Proceeding to Setup');
            navigation.replace('Setup');
        }
      }, 15000);

      if (Platform.OS === 'web') {
        console.log('LOADING SCREEN: Web UI Bypass enabled');
        clearTimeout(timeout);
        clearTimeout(finalTimeout);
        setHasProfile(true);
        navigation.replace('MainTabs', { screen: 'Home' });
        return;
      }

      try {
        const userData = await getUserMe(activeWallet);
        clearTimeout(timeout);
        clearTimeout(finalTimeout);
        
        if (!isMounted) return;

        console.log('LOADING SCREEN: API Response:', userData);

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
        clearTimeout(finalTimeout);
        console.error('LOADING SCREEN: Profile check error:', error);
        if (isMounted) {
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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.contentArea}>
        <View style={styles.content}>
          <ExpoImage 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 200, height: 50, marginBottom: 20, tintColor: '#1e232c' }} 
            contentFit="contain" 
          />
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.text}>Synchronizing with ChainVolio...</Text>
          <Text style={styles.subtext}>Connecting to Trust Layer</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 15,
  },
  text: {
    color: '#1e232c',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
  },
  subtext: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default LoadingScreen;


