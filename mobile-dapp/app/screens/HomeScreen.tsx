import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
  ImageBackground,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { isConnected, walletAddress, disconnect } = useWallet();

  const handleWalletPress = () => {
    Alert.alert(
      "Wallet Actions",
      `Connected as ${walletAddress?.slice(0, 8)}...`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Disconnect Wallet", 
          style: "destructive", 
          onPress: () => disconnect() 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* TOP NAVIGATION BAR (DAPP STYLE) */}
      <View style={styles.topNav}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="apps" size={12} color="#000" />
          </View>
          <Text style={styles.brandName}>ChainVolio</Text>
        </View>
        
        <View style={styles.navActions}>
          {isConnected ? (
            <TouchableOpacity 
              style={styles.walletPill}
              onPress={handleWalletPress}
            >
              <Text style={styles.walletText}>
                {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
              </Text>
              <View style={styles.activeIndicator} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.loginText}>Connect</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <View style={styles.heroBox}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroLabel}>WEB3 PROFESSIONAL INFRASTRUCTURE</Text>
          <Text style={styles.title}>Verifiable professional identity for Web3 careers.</Text>
          <Text style={styles.subtitle}>
            Build a work history that can't be faked. Verifiable achievements and peer attestations secured on-chain.
          </Text>
          
          <View style={styles.ctaGroup}>
             <TouchableOpacity 
               style={[styles.btn, styles.primaryBtn]}
               onPress={() => navigation.navigate(isConnected ? 'Profile' : 'Welcome')}
             >
                <Text style={styles.btnText}>Build My Identity</Text>
                <Ionicons name="shield-checkmark" size={18} color="#000" />
             </TouchableOpacity>
             
             <TouchableOpacity 
               style={[styles.btn, styles.secondaryBtn]}
               onPress={() => navigation.navigate('CV')}
             >
                <Text style={styles.btnTextSecondary}>Explore Portfolio</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* MOCKUP PREVIEW */}
        <View style={styles.previewBox}>
           <View style={styles.previewInner}>
              <View style={styles.previewHeader}>
                 <View style={styles.dotsRow}>
                    <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
                    <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
                    <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
                 </View>
                 <Text style={styles.previewUrl}>chainvolio.xyz/cv/baraka</Text>
              </View>
              <View style={styles.previewContent}>
                 <View style={styles.skeletonHero} />
                 <View style={styles.skeletonRow} />
                 <View style={styles.skeletonGrid}>
                    <View style={styles.skeletonCard} />
                    <View style={styles.skeletonCard} />
                 </View>
              </View>
           </View>
        </View>

        <View style={styles.footer}>
           <Text style={styles.footerLabel}>THE TRUST LAYER FOR WEB3</Text>
           <View style={styles.socialRow}>
              <Ionicons name="logo-twitter" size={20} color="#333" />
              <Ionicons name="logo-github" size={20} color="#333" />
              <Ionicons name="logo-discord" size={20} color="#333" />
           </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topNav: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  walletText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  loginBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  loginText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroBox: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: -100,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    zIndex: -1,
  },
  heroLabel: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 20,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  ctaGroup: {
    width: '100%',
    gap: 12,
    marginBottom: 60,
  },
  btn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#fff',
  },
  secondaryBtn: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
  },
  btnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextSecondary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  previewBox: {
    paddingHorizontal: 24,
    marginBottom: 60,
  },
  previewInner: {
    width: '100%',
    backgroundColor: '#050505',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#111',
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  previewHeader: {
    height: 32,
    backgroundColor: '#0a0a0a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewUrl: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    fontSize: 9,
    fontWeight: '600',
    paddingRight: 24,
  },
  previewContent: {
    padding: 24,
    gap: 16,
  },
  skeletonHero: {
    height: 100,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
  },
  skeletonRow: {
    height: 12,
    width: '60%',
    backgroundColor: '#0a0a0a',
    borderRadius: 6,
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonCard: {
    flex: 1,
    height: 60,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#111',
    marginHorizontal: 24,
  },
  footerLabel: {
    color: '#222',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  }
});

export default HomeScreen;
