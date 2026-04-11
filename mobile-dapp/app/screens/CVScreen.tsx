import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
  Share,
  Modal,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getProfile, getWalletReceipts, getWalletScore, getCertificates } from '../services/api';
import { useWallet } from '../context/WalletContext';
import CVCard from '../components/Profile/CVCard';
import ProofOfWorkCard from '../components/Profile/ProofOfWorkCard';
import WorkVerificationModal from '../components/Profile/WorkVerificationModal';

const { width, height } = Dimensions.get('window');

const CVScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWorkIndex, setSelectedWorkIndex] = useState<number | null>(null);

  const selectedWork = useMemo(() => 
    selectedWorkIndex !== null ? receipts[selectedWorkIndex] : null, 
    [receipts, selectedWorkIndex]
  );

  const fetchData = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }
    try {
      const [p, r, c, s] = await Promise.all([
        getProfile(walletAddress),
        getWalletReceipts(walletAddress),
        getCertificates(walletAddress),
        getWalletScore(walletAddress)
      ]);
      setProfile(p);
      const list = Array.isArray(r) ? r : (r?.receipts || []);
      setReceipts(list);
      setCertificates(c || []);
      setScoreData(s);
    } catch (error) {
      console.error('CV Sync error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [walletAddress]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [walletAddress])
  );

  const totalExperience = useMemo(() => {
    if (!receipts || receipts.length === 0) return 3;
    return 3; 
  }, [receipts]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>RESOLVING PROFESSIONAL LEGACY...</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* HEADER */}
        <View style={styles.appHeader}>
           <View style={styles.logoRow}>
              <View style={styles.logoCircle} />
              <Text style={styles.brandText}>ChainVolio</Text>
           </View>
           <View style={styles.headerIcons}>
              <Ionicons name="notifications-outline" size={24} color="#fff" style={{ marginRight: 20 }} />
              <Ionicons name="menu-outline" size={28} color="#fff" />
           </View>
        </View>

        <ScrollView 
           contentContainerStyle={styles.scrollContent} 
           showsVerticalScrollIndicator={false}
           refreshControl={
             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
           }
        >
          {/* CV CARD */}
          <CVCard 
            profile={profile} 
            scoreData={scoreData} 
            walletAddress={walletAddress || ''} 
            onScorePress={() => navigation.navigate('CV Score')}
          />

          {/* SECTIONS */}
          <View style={styles.disclaimerBox}>
             <Ionicons name="shield-checkmark" size={20} color="#10b981" />
             <View style={styles.disclaimerContent}>
                <Text style={styles.disclaimerTitle}>RECRUITER NOTE: VERIFIED INTEGRITY</Text>
                <Text style={styles.disclaimerSubtitle}>Attestations marked with ✓ Attested are cryptographically signed by third-party verifiers.</Text>
             </View>
          </View>

          <TouchableOpacity style={styles.expandableSection} onPress={() => navigation.navigate('Timeline')}>
             <View style={styles.expandableIconBox}><Ionicons name="trending-up-outline" size={18} color="#10b981" /></View>
             <View style={styles.expandableText}>
                <Text style={styles.expandableTitle}>Career Timeline</Text>
                <Text style={styles.expandableSub}>Verified professional history.</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.expandableSection} onPress={() => navigation.navigate('Add Credential')}>
             <View style={[styles.expandableIconBox, { backgroundColor: 'rgba(129, 140, 248, 0.1)' }]}><Ionicons name="ribbon-outline" size={18} color="#818cf8" /></View>
             <View style={styles.expandableText}>
                <Text style={styles.expandableTitle}>Verified Credentials</Text>
                <Text style={styles.expandableSub}>{certificates.length} items verified.</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <Text style={styles.powHeader}>Proof of Work</Text>
          
          <View style={styles.workList}>
             {receipts.map((r, i) => (
               <ProofOfWorkCard 
                 key={r.id || `work-${i}`} 
                 work={r} 
                 onPress={() => setSelectedWorkIndex(i)} 
               />
             ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>

        <WorkVerificationModal 
          isVisible={selectedWorkIndex !== null} 
          onClose={() => setSelectedWorkIndex(null)} 
          work={selectedWork} 
        />

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#050505' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2, marginTop: 20 },
  appHeader: { height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  brandText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 15, paddingTop: 10 },
  disclaimerBox: { flexDirection: 'row', gap: 14, padding: 16, backgroundColor: 'rgba(16,185,129,0.03)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)', marginBottom: 25 },
  disclaimerContent: { flex: 1 },
  disclaimerTitle: { color: '#10b981', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  disclaimerSubtitle: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '500', marginTop: 4, lineHeight: 15 },
  expandableSection: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 12 },
  expandableIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center' },
  expandableText: { flex: 1, paddingLeft: 14 },
  expandableTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  expandableSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '500', marginTop: 2 },
  powHeader: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  workList: { gap: 16 },
});


export default CVScreen;
