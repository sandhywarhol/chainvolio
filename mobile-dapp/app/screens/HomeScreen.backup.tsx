import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Animated,
  Easing,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SLIDE_IMAGES = [
  { img: { uri: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop' }, title: 'Work Anywhere', subtitle: 'Global freedom', desc: 'Find a role that respects your family time and boundaries.' },
  { img: { uri: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop' }, title: 'Dream Web3 Job', subtitle: 'Top tier roles', desc: 'Limitless career opportunities in the global Web3 ecosystem.' },
  { img: { uri: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop' }, title: 'More Income', subtitle: 'Crypto payouts', desc: 'Get paid borderlessly with stable cryptocurrencies anywhere.' },
  { img: { uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop' }, title: 'Global Network', subtitle: 'Build together', desc: 'Build connections with elite professionals worldwide.' },
  { img: { uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop' }, title: 'New Adventures', subtitle: 'Explore life', desc: 'Explore a new lifestyle and freedom as a digital nomad.' },
];

const PARTNER_LOGOS = [
  require('../../assets/images/logos/X.png'),
  require('../../assets/images/logos/alchemy.png'),
  require('../../assets/images/logos/behance.png'),
  require('../../assets/images/logos/canva.png'),
  require('../../assets/images/logos/discord.png'),
  require('../../assets/images/logos/dribbble.png'),
  require('../../assets/images/logos/dropbox.png'),
  require('../../assets/images/logos/figma.png'),
  require('../../assets/images/logos/github.png'),
  require('../../assets/images/logos/google drive.png'),
  require('../../assets/images/logos/linkedin.png'),
  require('../../assets/images/logos/notion.png'),
  require('../../assets/images/logos/pdf.png'),
  require('../../assets/images/logos/phantom.png'),
  require('../../assets/images/logos/slack.png'),
  require('../../assets/images/logos/solana.png'),
  require('../../assets/images/logos/solflare.png'),
  require('../../assets/images/logos/superteam.png'),
  require('../../assets/images/logos/telegram.png'),
];

const ITEM_WIDTH = 60; // 35 width + 25 margin
const CONTENT_WIDTH = PARTNER_LOGOS.length * ITEM_WIDTH;

const HomeScreen = ({ navigation }: any) => {
  const { isConnected, walletAddress } = useWallet();
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -CONTENT_WIDTH,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: false, // Support Web animation
      })
    ).start();
  }, [scrollX]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.iconButton}>
            <ExpoImage 
              source={require('../../assets/images/logo.png')} 
              style={styles.logoIcon} 
              contentFit="contain" 
            />
            <Text style={styles.logoText}>Chainvolio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.walletBtn} activeOpacity={0.7}>
            <Ionicons name="wallet-outline" size={16} color="#f97316" />
            <Text style={styles.walletText}>
              {isConnected ? `${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}` : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Partner Logos Marquee */}
        <View style={styles.marqueeContainer}>
          <View style={{ overflow: 'hidden', height: 26, width: '100%' }}>
            <Animated.View style={{ flexDirection: 'row', width: CONTENT_WIDTH * 2, transform: [{ translateX: scrollX }], alignItems: 'center' }}>
              {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((logo, index) => (
                <ExpoImage 
                  key={index} 
                  source={logo} 
                  style={{ width: 35, height: 14, marginRight: 25, opacity: 0.6 }} 
                  contentFit="contain"
                  tintColor="#171717"
                />
              ))}
            </Animated.View>
            
            {/* Fade Edges */}
            <LinearGradient colors={['#fafafa', 'rgba(250,250,250,0)']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.fadeLeft} />
            <LinearGradient colors={['rgba(250,250,250,0)', '#fafafa']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.fadeRight} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              Build a Verifiable Web3 Resume <Text style={styles.greetingHighlight}>That Recruiters Trust.</Text>
            </Text>
            <Text style={styles.greetingSubtitle}>
              Signed by real people. Anchored on Solana. Cryptographically verified. Share anywhere with one link.
            </Text>
          </View>

          {/* Image Slider */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Features</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#f97316" />
            </TouchableOpacity>
          </View>

          <View style={styles.sliderContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalList}
            >
              {SLIDE_IMAGES.map((item, index) => (
                <View key={index} style={styles.slideCard}>
                  <View style={styles.slideItemWrapper}>
                    <ExpoImage 
                      source={item.img} 
                      style={styles.slideImage} 
                      contentFit="cover" 
                    />
                    <View style={styles.slideOverlay}>
                      <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7}>
                        <Ionicons name="heart" size={22} color="#f97316" />
                      </TouchableOpacity>
                      <View style={styles.slideTextContainer}>
                        <Text style={styles.slideTitle}>{item.title}</Text>
                        <View style={styles.slideSubtitleRow}>
                          <Ionicons name="calendar-outline" size={14} color="#fff" style={{marginRight: 4}} />
                          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.slideDescription}>{item.desc}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Bottom spacer for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa', // Milky white
  },
  safeArea: { 
    flex: 1, 
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#171717',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 22,
    height: 22,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  walletText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  marqueeContainer: {
    marginTop: 15, // Pushed down slightly
    paddingBottom: 10,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  scrollContent: {
    paddingTop: 10,
  },
  greetingContainer: {
    paddingHorizontal: 25,
    marginTop: 10,
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    lineHeight: 34,
    marginBottom: 12,
  },
  greetingHighlight: {
    color: '#f97316', 
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  horizontalList: {
    paddingHorizontal: 25,
    gap: 20,
  },
  slideCard: {
    width: width * 0.65,
  },
  slideItemWrapper: {
    width: '100%',
    height: (width * 0.65) * 1.4, // vertical portrait
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    marginBottom: 10,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 15,
  },
  heartBtn: {
    alignSelf: 'flex-end',
  },
  slideTextContainer: {
    justifyContent: 'flex-end',
  },
  slideTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  slideSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slideSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  slideDescription: {
    color: '#4b5563',
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
});

export default HomeScreen;
