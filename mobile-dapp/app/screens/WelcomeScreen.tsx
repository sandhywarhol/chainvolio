import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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

const { width } = Dimensions.get('window');

// PERSISTENT KEYPAIR: This must survive the app-switch cycle.
// If we re-generate this on re-mount, decryption will always fail.
const PERSISTENT_DAPP_KEYPAIR = nacl.box.keyPair();

const WelcomeScreen = ({ navigation }: any) => {
  const [isConnecting, setIsConnecting] = useState(false);
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

    // --- OFFICIAL HANDSHAKE DECRYPTION ---
    try {
      if (queryParams.data && queryParams.nonce && queryParams.phantom_encryption_public_key) {
        const phantomPublicKey = bs58.decode(queryParams.phantom_encryption_public_key as string);
        const nonce = bs58.decode(queryParams.nonce as string);
        const encryptedData = bs58.decode(queryParams.data as string);

        // Uses the PERSISTENT keypair that was used to generate the request
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

    // If we reach here, we likely got back but decryption failed or user cancelled
    setIsConnecting(false);
    
    if (queryParams.errorCode === 'user_cancelled') {
       return; // Just stay on welcome screen
    }

    // Fallback for direct address returns (if any)
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
      Alert.alert('Installation Required', `Please install ${wallet} to connect.`);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop' }} 
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inner}
          >
            <View style={styles.brandArea}>
               <ExpoImage source={require('../../assets/images/logo.png')} style={styles.mainLogo} contentFit="contain" />
               <Text style={styles.logoSubText}>THE TRUST LAYER FOR WEB3</Text>
            </View>

            <View style={styles.loginCard}>
              <Text style={styles.cardTitle}>Login</Text>
              <Text style={styles.cardSubtitle}>Select your wallet to continue</Text>

              <View style={styles.buttonContainer}>
                 <TouchableOpacity 
                   style={[styles.walletBtn, styles.phantomBtn]} 
                   onPress={() => connectWallet('phantom')} 
                   disabled={isConnecting}
                 >
                    {isConnecting ? <ActivityIndicator size="small" color="#fff" /> : (
                      <><ExpoImage source={require('../../assets/images/phantom.svg')} style={styles.walletIcon} contentFit="contain" /><Text style={styles.btnText}>Login with Phantom</Text></>
                    )}
                 </TouchableOpacity>

                 <TouchableOpacity 
                   style={[styles.walletBtn, styles.solflareBtn]} 
                   onPress={() => connectWallet('solflare')} 
                   disabled={isConnecting}
                 >
                    <ExpoImage source={require('../../assets/images/solflare.svg')} style={styles.walletIcon} contentFit="contain" /><Text style={styles.btnText}>Login with Solflare</Text>
                 </TouchableOpacity>
              </View>

              <View style={styles.cardFooter}>
                 <Ionicons name="lock-closed-outline" size={14} color="#666" />
                 <Text style={styles.securityText}>Verified Secure Authentication</Text>
              </View>
            </View>

            {isConnecting && (
              <TouchableOpacity style={styles.cancelLink} onPress={() => setIsConnecting(false)}>
                 <Text style={styles.cancelText}>Return to Selection</Text>
              </TouchableOpacity>
            )}
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)' },
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  brandArea: { alignItems: 'center', marginBottom: 40 },
  mainLogo: { width: 200, height: 60, marginBottom: 10 },
  logoSubText: { color: '#10b981', fontSize: 9, fontWeight: '900', letterSpacing: 4 },
  loginCard: { backgroundColor: 'rgba(20, 20, 20, 0.85)', borderRadius: 30, padding: 30, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  cardSubtitle: { color: '#666', fontSize: 14, marginBottom: 30 },
  buttonContainer: { width: '100%', gap: 16, marginBottom: 30 },
  walletBtn: { height: 58, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, gap: 14 },
  phantomBtn: { backgroundColor: '#ab9ff2' },
  solflareBtn: { backgroundColor: '#fe9c1d' },
  walletIcon: { width: 32, height: 32 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  securityText: { color: '#666', fontSize: 11, fontWeight: '600' },
  cancelLink: { marginTop: 20, alignSelf: 'center' },
  cancelText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textDecorationLine: 'underline' },
});

export default WelcomeScreen;
