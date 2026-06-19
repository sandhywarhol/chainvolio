import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
  ImageBackground,
  AppState
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useWallet } from '../context/WalletContext';
import * as ExpoLinking from 'expo-linking';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// PERSISTENT KEYPAIR
const PERSISTENT_DAPP_KEYPAIR = nacl.box.keyPair();

const WelcomeScreen = ({ navigation }: any) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWallets, setShowWallets] = useState(false);
  const { setWalletAddress } = useWallet();
  const appState = useRef(AppState.currentState);

  const handleDeepLink = (url: string) => {
    console.log('RECOVERY URL:', url);
    const parsed = ExpoLinking.parse(url);
    const { queryParams } = parsed;
    
    if (!queryParams) {
       setIsConnecting(false);
       return;
    }

    try {
      if (queryParams.data && queryParams.nonce && queryParams.phantom_encryption_public_key) {
        const phantomPublicKey = bs58.decode(queryParams.phantom_encryption_public_key as string);
        const nonce = bs58.decode(queryParams.nonce as string);
        const encryptedData = bs58.decode(queryParams.data as string);

        const sharedSecret = nacl.box.before(phantomPublicKey, PERSISTENT_DAPP_KEYPAIR.secretKey);
        const decryptedData = nacl.box.open.after(encryptedData, nonce, sharedSecret);

        if (decryptedData) {
          setIsConnecting(false);
          const payload = JSON.parse(Buffer.from(decryptedData).toString('utf8'));
          if (payload.public_key) {
            console.log('REAL WALLET FOUND:', payload.public_key);
            setWalletAddress(payload.public_key);
            navigation.replace('Loading');
            return;
          }
        }
      }
    } catch (err) {
      console.error('Decryption failed check:', err);
    }

    setIsConnecting(false);
    
    if (queryParams.errorCode === 'user_cancelled') {
       return; 
    }

    const walletAddress = queryParams?.public_key || queryParams?.address;
    if (walletAddress && walletAddress.length >= 32) {
      setWalletAddress(walletAddress as string);
      navigation.replace('Loading');
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url) handleDeepLink(url);
    });

    Linking.getInitialURL().then((url) => { if (url) handleDeepLink(url); });
    
    const stateSubscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        setTimeout(() => setIsConnecting(false), 2000);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      stateSubscription.remove();
    };
  }, []);

  const connectWallet = async (wallet: 'phantom' | 'solflare') => {
    setIsConnecting(true);
    
    if (Platform.OS === 'web') {
      try {
        if (wallet === 'phantom') {
          const { solana } = window as any;
          if (solana && solana.isPhantom) {
            const response = await solana.connect();
            setWalletAddress(response.publicKey.toString());
            navigation.replace('Loading');
            return;
          } else {
            Alert.alert('Extension Not Found', 'Please install the Phantom browser extension.');
            setIsConnecting(false);
            return;
          }
        } else if (wallet === 'solflare') {
          const { solflare } = window as any;
          if (solflare && solflare.isSolflare) {
            await solflare.connect();
            setWalletAddress(solflare.publicKey.toString());
            navigation.replace('Loading');
            return;
          } else {
            Alert.alert('Extension Not Found', 'Please install the Solflare browser extension.');
            setIsConnecting(false);
            return;
          }
        }
      } catch (err) {
        console.error('Web connection error:', err);
        Alert.alert('Connection Failed', 'Could not connect to wallet.');
        setIsConnecting(false);
        return;
      }
    }

    const redirectUrl = ExpoLinking.createURL('onConnect');
    const dappPublicKey = bs58.encode(PERSISTENT_DAPP_KEYPAIR.publicKey);
    
    const params = new URLSearchParams({
      app_url: 'https://chainvolio.xyz',
      dapp_encryption_public_key: dappPublicKey,
      redirect_link: redirectUrl,
      cluster: 'mainnet-beta'
    });

    const baseUrl = wallet === 'phantom' 
      ? `https://phantom.app/ul/v1/connect?${params.toString()}` 
      : `https://solflare.com/ul/v1/connect?${params.toString()}`;

    try {
      await Linking.openURL(baseUrl);
    } catch (error) {
      setIsConnecting(false);
      Alert.alert('Installation Required', `Please install ${wallet} on your device to connect.`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ExpoImage 
        source={require('../../assets/images/welcome-bg.svg')} 
        style={StyleSheet.absoluteFillObject} 
        contentFit="cover" 
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

      <SafeAreaView style={styles.contentArea}>
        <View style={styles.glassBox}>
          <ExpoImage 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo} 
            contentFit="contain" 
            tintColor="#ffffff"
          />
          
          <Text style={styles.welcomeText}>Welcome to ChainVolio</Text>
          <Text style={styles.subtitleText}>Connect your wallet to get started</Text>

          <View style={styles.walletsContainer}>
            <TouchableOpacity 
              style={[styles.walletBtn, styles.blackBtn]} 
              onPress={() => connectWallet('phantom')} 
              disabled={isConnecting}
            >
              {isConnecting ? <ActivityIndicator size="small" color="#fff" /> : (
                <>
                  <ExpoImage source={require('../../assets/images/phantom.svg')} style={styles.walletIcon} contentFit="contain" />
                  <Text style={styles.btnText}>Continue with Phantom</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.walletBtn, styles.blackBtn]} 
              onPress={() => connectWallet('solflare')} 
              disabled={isConnecting}
            >
              <ExpoImage source={require('../../assets/images/solflare.svg')} style={styles.walletIcon} contentFit="contain" />
              <Text style={styles.btnText}>Continue with Solflare</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.walletBtn, styles.whiteBtn]} 
              disabled={isConnecting}
            >
              <ExpoImage source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' }} style={styles.walletIcon} contentFit="contain" />
              <Text style={[styles.btnText, { color: '#1f2937' }]}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  glassBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 25,
    borderRadius: 28,
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 240,
    height: 60,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 30,
  },
  walletsContainer: {
    width: '100%',
    gap: 12,
  },
  walletBtn: { 
    width: '100%',
    height: 48, 
    borderRadius: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blackBtn: { backgroundColor: '#000000' },
  whiteBtn: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
  walletIcon: { width: 20, height: 20 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default WelcomeScreen;

