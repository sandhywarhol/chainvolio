import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  Platform,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  { id: '1', src: require('../../assets/images/slides/cv_view_2.png'), label: 'Professional Profile Hub' },
  { id: '2', src: require('../../assets/images/slides/dashboard_2.png'), label: 'Recruiter Dashboard' },
  { id: '3', src: require('../../assets/images/slides/edit_profile_2.png'), label: 'Profile Customization' },
  { id: '4', src: require('../../assets/images/slides/proof_of_work_2.png'), label: 'Verifiable Proof of Work' },
  { id: '5', src: require('../../assets/images/slides/apply.png'), label: 'Talent Application Pipeline' },
  { id: '6', src: require('../../assets/images/slides/attestation.png'), label: 'On-chain Attestation Infrastructure' },
  { id: '7', src: require('../../assets/images/slides/status.png'), label: 'Verification Status Tracking' },
];

const MOCKUP_WIDTH = width * 0.88;

const NAV_BUTTONS = [
  { id: '1', label: 'Add Proof', icon: 'add-circle-outline', route: 'Add Proof' },
  { id: '2', label: 'My CV', icon: 'document-text-outline', route: 'CV' },
  { id: '3', label: 'Credential', icon: 'ribbon-outline', route: 'Add Credential' },
  { id: '4', label: 'Timeline', icon: 'time-outline', route: 'Timeline' },
  { id: '5', label: 'CV Score', icon: 'stats-chart-outline', route: 'CV Score' },
  { id: '6', label: 'Hiring', icon: 'briefcase-outline', route: 'Hiring' },
];

const HomeScreen = ({ navigation }: any) => {
  const { isConnected, walletAddress, disconnect } = useWallet();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Elegant Carousel logic
    const slideInterval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % SLIDES.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 6000);

    // Ambient Pulse logic
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(slideInterval);
  }, [currentIndex]);

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.02, 0.05]
  });

  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1]
  });

  const handleWalletActions = () => {
    if (!isConnected) {
      navigation.navigate('Welcome');
      return;
    }
    disconnect();
  };

  const renderSlide = ({ item }: { item: any }) => (
    <View style={styles.mockupFrame}>
      <ExpoImage source={item.src} style={styles.mockupImg} contentFit="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(5,5,5,0.6)']}
        style={styles.mockupOverlay}
      />
    </View>
  );

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* AMBIENT LIGHT SOURCES */}
        <Animated.View style={[styles.glowTop, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
        <Animated.View style={[styles.glowBottom, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
        <View style={styles.glowCenter} />

        {/* HEADER */}
        <View style={styles.topNav}>
          <View style={styles.logoGroup}>
            <View style={styles.logoWrapper}>
              <ExpoImage
                source={require('../../assets/images/logo-white.png')}
                style={styles.mainLogo}
                contentFit="contain"
              />
            </View>
            <Text style={styles.brandTitle}>ChainVolio</Text>
          </View>
          <TouchableOpacity
            style={styles.walletToggle}
            onPress={handleWalletActions}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#151515', '#080808']}
              style={styles.walletGradient}
            >
              <View style={styles.activeDot} />
              <Text style={styles.walletToggleText}>
                {isConnected ? `${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}` : 'Connect'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* HERO SECTION */}
          <View style={styles.heroSection}>
            <Text style={styles.mainTitle}>Verifiable professional identity for Web3 careers.</Text>
          </View>

          {/* CAROUSEL MOCKUP */}
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={SLIDES}
              renderItem={renderSlide}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.flatListContent}
            />
            <View style={styles.dotRow}>
              {SLIDES.map((_, i) => (
                <View key={i} style={[styles.dot, currentIndex === i && styles.activeDotLine]} />
              ))}
            </View>
            <Text style={styles.carouselLabel}>
              {SLIDES[currentIndex].label.toUpperCase()}
            </Text>
          </View>

          {/* ACTION GRID */}
          <View style={styles.gridSection}>
            <View style={styles.grid}>
              {NAV_BUTTONS.map((btn) => (
                <TouchableOpacity
                  key={btn.id}
                  style={styles.gridBtn}
                  onPress={() => navigation.navigate(btn.route)}
                  activeOpacity={0.8}
                >
                  <View style={styles.btnIconBox}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.06)', 'transparent']}
                      style={styles.iconGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={btn.icon as any} size={20} color="rgba(255,255,255,0.85)" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.gridBtnLabel}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#050505' },
  container: { flex: 1 },
  glowTop: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.2,
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: '#6366f1',
    borderRadius: width,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -height * 0.15,
    left: -width * 0.2,
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: '#10b981',
    borderRadius: width,
  },
  glowCenter: {
    position: 'absolute',
    top: height * 0.3,
    left: '25%',
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: 'rgba(99, 102, 241, 0.02)',
    borderRadius: width,
  },
  topNav: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? 35 : 0
  },
  logoGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLogo: { width: 22, height: 22 },
  brandTitle: {
    color: '#fff',
    fontSize: 18,
    letterSpacing: -1,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  walletToggle: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  walletGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  walletToggleText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    letterSpacing: 0.5,
    fontFamily: 'Inter-Bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 35,
    marginTop: 65,
    marginBottom: 35
  },
  mainTitle: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    letterSpacing: -1,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  carouselContainer: { alignItems: 'center', marginBottom: 40 },
  flatListContent: { paddingHorizontal: (width - MOCKUP_WIDTH) / 2 },
  mockupFrame: {
    width: MOCKUP_WIDTH,
    height: height * 0.25,
    marginHorizontal: (width - MOCKUP_WIDTH) / 2,
    overflow: 'hidden',
  },
  mockupImg: { width: '100%', height: '100%' },
  mockupOverlay: { ...StyleSheet.absoluteFillObject },
  carouselLabel: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  dotRow: { flexDirection: 'row', gap: 6, marginTop: 24 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  activeDotLine: { backgroundColor: '#6366f1', width: 14 },
  gridSection: { paddingHorizontal: 25 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 },
  gridBtn: {
    width: (width - 50 - 28) / 3,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  btnIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  iconGradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBtnLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
    fontFamily: 'Inter-Bold',
  }
});





export default HomeScreen;





