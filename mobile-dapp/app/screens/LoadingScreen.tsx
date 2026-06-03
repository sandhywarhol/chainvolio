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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1740&auto=format&fit=crop' }} 
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
          style={styles.gradientOverlay}
        />
        <SafeAreaView style={styles.contentArea}>
          <View style={styles.content}>
            <ExpoImage 
              source={require('../../assets/images/logo.png')} 
              style={{ width: 200, height: 50, marginBottom: 20 }} 
              contentFit="contain" 
            />
            <ActivityIndicator size="large" color="#1f2937" />
            <Text style={styles.text}>Synchronizing with ChainVolio...</Text>
            <Text style={styles.subtext}>Connecting to Trust Layer</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: { 
    flex: 1, 
    width: '100%', 
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  subtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default LoadingScreen;


