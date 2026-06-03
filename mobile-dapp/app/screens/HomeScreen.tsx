import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Image,
  ScrollView
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

const WORK_LOGOS = [
  require('../../assets/images/logos/notion.png'),
  require('../../assets/images/logos/github.png'),
  require('../../assets/images/logos/discord.png'),
  require('../../assets/images/logos/figma.png'),
  require('../../assets/images/logos/canva.png'),
  require('../../assets/images/logos/dropbox.png'),
  require('../../assets/images/logos/slack.png'),
  require('../../assets/images/logos/linkedin.png'),
  require('../../assets/images/logos/google drive.png'),
  require('../../assets/images/logos/telegram.png'),
  require('../../assets/images/logos/solana.png'),
  require('../../assets/images/logos/alchemy.png'),
];

const AnimatedGridLogo = ({ logo }: { logo: any }) => {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let timeout: any;
    const pulse = () => {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true })
      ]).start(() => {
        timeout = setTimeout(pulse, Math.random() * 5000 + 500);
      });
    };
    timeout = setTimeout(pulse, Math.random() * 3000);
    return () => clearTimeout(timeout);
  }, [anim]);

  return (
    <View style={styles.stackIconBox}>
      <Animated.Image 
        source={logo} 
        style={[styles.stackIcon, { transform: [{ scale: anim }], tintColor: '#1f2937' }]} 
        resizeMode="contain"
      />
    </View>
  );
};

const HomeScreen = ({ navigation }: any) => {
  const { isConnected, walletAddress } = useWallet();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" translucent={false} />
      
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
            <Ionicons name="wallet-outline" size={16} color="#ffffff" />
            <Text style={styles.walletText}>
              {isConnected ? `${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}` : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              <Text style={{ color: '#f97316', fontWeight: 'bold' }}>GM Builders!</Text> What are we building today?
            </Text>
          </View>

          {/* Image Slider */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Get Remote Hired Today</Text>
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

          {/* Work Logos Stack Grid */}
          <View style={styles.stackContainer}>
            <Text style={styles.stackTitle}>POWERING YOUR WEB3 CAREER STACK</Text>
            <View style={styles.stackGrid}>
              {WORK_LOGOS.map((logo, index) => (
                <AnimatedGridLogo key={index} logo={logo} />
              ))}
            </View>
            <Text style={styles.desktopHintText}>
              For the best experience in hiring and building your CV, we recommend using a desktop browser.
            </Text>
          </View>

          {/* Bottom spacer for tab bar */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa', // Milky white background
  },
  safeArea: { 
    flex: 1, 
    backgroundColor: '#171717', // Very dark grey for top nav
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ea580c',
  },
  walletText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollContent: {
    paddingTop: 0,
    backgroundColor: '#fafafa',
  },
  greetingContainer: {
    paddingHorizontal: 25,
    marginTop: 15,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 34,
    marginBottom: 12,
  },
  stackContainer: {
    paddingHorizontal: 25,
    marginBottom: 30,
    alignItems: 'center',
  },
  stackTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1.5,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  stackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 350, // fits exactly 8 logos (8*36 + 7*8 = 344)
  },
  stackIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stackIcon: {
    width: 18,
    height: 18,
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  sliderContainer: {
    marginBottom: 15,
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
    fontWeight: '600',
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
  desktopHintText: {
    marginTop: 20,
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
  },
});

export default HomeScreen;
