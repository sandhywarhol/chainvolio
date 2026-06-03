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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Image - Office Desk Theme */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1740&auto=format&fit=crop' }} 
        style={styles.backgroundImage}
      >
        {/* Gradient overlay to make bottom text readable */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
          style={styles.gradientOverlay}
        />

        <SafeAreaView style={styles.contentArea}>
          
          <View style={styles.centerHero}>
            <ExpoImage 
              source={require('../../assets/images/logo.png')} 
              style={styles.mainLogo} 
              contentFit="contain" 
            />
            <Text style={styles.mainTitle}>Build a Verifiable Web3 Resume That Recruiters Trust.</Text>
            <Text style={styles.subtitle}>
              Signed by real people. Anchored on Solana. Cryptographically verified. Share anywhere with one link.
            </Text>
          </View>

          <View style={styles.bottomArea}>
            {!showWallets ? (
              <TouchableOpacity 
                style={styles.arrowButton} 
                onPress={() => setShowWallets(true)}
              >
                <Ionicons name="chevron-forward" size={24} color="#1f2937" />
              </TouchableOpacity>
            ) : (
              <View style={styles.walletsContainer}>
                <Text style={styles.walletsTitle}>Connect Wallet</Text>
                
                <TouchableOpacity 
                  style={[styles.walletBtn, styles.phantomBtn]} 
                  onPress={() => connectWallet('phantom')} 
                  disabled={isConnecting}
                >
                  {isConnecting ? <ActivityIndicator size="small" color="#fff" /> : (
                    <>
                      <ExpoImage source={require('../../assets/images/phantom.svg')} style={styles.walletIcon} contentFit="contain" />
                      <Text style={styles.btnText}>Phantom</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.walletBtn, styles.solflareBtn]} 
                  onPress={() => connectWallet('solflare')} 
                  disabled={isConnecting}
                >
                  <ExpoImage source={require('../../assets/images/solflare.svg')} style={styles.walletIcon} contentFit="contain" />
                  <Text style={styles.btnText}>Solflare</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelLink} onPress={() => setShowWallets(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
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
    justifyContent: 'flex-end', // push wallets to bottom
    padding: 30,
  },
  centerHero: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: -1, // keeps it behind the bottom area if they overlap
  },
  mainLogo: {
    width: 360,
    height: 90,
    marginBottom: -5,
  },
  mainTitle: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '800', 
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  subtitle: { 
    color: 'rgba(255,255,255,0.9)', 
    fontSize: 15, 
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  bottomArea: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  arrowButton: {
    width: 60,
    height: 60,
    backgroundColor: '#ffffff', // white background
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  walletsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  walletsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  walletBtn: { 
    width: '100%',
    height: 54, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12,
    marginBottom: 12,
  },
  phantomBtn: { backgroundColor: '#ab9ff2' },
  solflareBtn: { backgroundColor: '#fe9c1d' },
  walletIcon: { width: 24, height: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelLink: { marginTop: 10 },
  cancelText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
});

export default WelcomeScreen;

