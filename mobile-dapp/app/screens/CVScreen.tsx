import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useWallet } from '../context/WalletContext';
import { getProfile, getWalletReceipts, getWalletScore, getDashboardStats } from '../services/api';
import IdentityHeroCard from '../components/Profile/IdentityHeroCard';

const CVScreen = () => {
  const { walletAddress } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  const [certificates, setCertificates] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [walletAddress])
  );

  const fetchData = async (isRefresh = false) => {
    if (!walletAddress) return;
    if (!isRefresh) setLoading(true);

    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setRefreshing(false);
        console.warn('CV Sync timeout');
      }
    }, 10000);
    
    try {
      const [stats, recs, score] = await Promise.all([
        getDashboardStats(walletAddress),
        getWalletReceipts(walletAddress),
        getWalletScore(walletAddress)
      ]);
      
      setProfile(stats.profile);
      setCertificates(stats.certificates || []);
      setReceipts(recs?.receipts || []);
      setScoreData(score);
    } catch (error) {
      console.error('CV sync error:', error);
      Alert.alert('Sync Delay', 'Fetching your public profile is taking longer than usual.');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading Resume...</Text>
      </View>
    );
  }

  const contributionReceipts = receipts;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} tintColor="#10b981" />
        }
      >
        
        {/* PUBLIC CV HERO */}
        <IdentityHeroCard 
          profile={{
            ...profile,
            receiptCount: contributionReceipts.length,
            verificationType: profile?.verificationTier || 'Builder'
          }}
          scoreData={scoreData}
          onScorePress={() => setIsScoreModalOpen(true)}
        />

        {/* BIO & SKILLS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
          <View style={styles.glassCard}>
            <Text style={styles.bioText}>{profile?.bio || 'Professional identity verified by ChainVolio infrastructure.'}</Text>
          </View>
          
          <Text style={styles.sectionTitle}>TECHNICAL STACK</Text>
          <View style={styles.skillsGrid}>
            {(profile?.skills || 'Web3,Blockchain,Development').split(',').map((skill: string, i: number) => (
              <View key={i} style={styles.skillTag}>
                <View style={styles.skillDot} />
                <Text style={styles.skillText}>{skill.trim()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CERTIFICATES (NEW) */}
        {certificates.length > 0 && (
          <View style={styles.section}>
             <Text style={styles.sectionTitle}>VERIFIED CERTIFICATIONS</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.certScroll}>
                {certificates.map((c, i) => (
                  <View key={i} style={styles.certCard}>
                     <Ionicons name="ribbon" size={20} color="#10b981" />
                     <Text style={styles.certTitle} numberOfLines={1}>{c.title}</Text>
                     <Text style={styles.certIssuer}>{c.issuer}</Text>
                  </View>
                ))}
             </ScrollView>
          </View>
        )}

        {/* PROFESSIONAL TIMELINE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ANCHORED EXPERIENCE</Text>
          {contributionReceipts.length === 0 ? (
            <View style={styles.emptyTimeline}>
               <Text style={styles.emptyText}>No verified history found.</Text>
            </View>
          ) : (
            contributionReceipts.map((r, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  <View style={[styles.timelineDot, { backgroundColor: r.status === 'Attested' ? '#10b981' : '#333' }]} />
                  {i < contributionReceipts.length - 1 && <View style={styles.timelineConnector} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineRole}>{r.role}</Text>
                  <Text style={styles.timelineOrg}>{r.org}</Text>
                  <Text style={styles.timelineStatus}>
                    {r.status === 'Attested' ? '✓ VERIFIED ON-CHAIN' : 'SELF-DECLARED PROOF'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* SCORE MODAL */}
      <Modal visible={isScoreModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setIsScoreModalOpen(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trust Score Analysis</Text>
              <TouchableOpacity onPress={() => setIsScoreModalOpen(false)}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreVal}>{scoreData?.score || 0}</Text>
              <Text style={styles.scoreLabel}>TOTAL REPUTATION</Text>
            </View>
            <View style={styles.breakdown}>
               <View style={styles.breakItem}>
                  <Text style={styles.breakLabel}>VERIFICATION</Text>
                  <View style={styles.breakLine}><View style={[styles.breakFill, { width: '85%', backgroundColor: '#10b981' }]} /></View>
               </View>
               <View style={styles.breakItem}>
                  <Text style={styles.breakLabel}>EXPERIENCE</Text>
                  <View style={styles.breakLine}><View style={[styles.breakFill, { width: '60%', backgroundColor: '#6366f1' }]} /></View>
               </View>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#444', fontSize: 11, marginTop: 12, fontWeight: '800', letterSpacing: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  glassCard: { backgroundColor: '#050505', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#111' },
  section: { marginTop: 32 },
  sectionTitle: { color: '#333', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 16 },
  bioText: { color: '#888', fontSize: 14, lineHeight: 24 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillTag: { backgroundColor: '#050505', borderWidth: 1, borderColor: '#111', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  skillDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#10b981' },
  skillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  timelineItem: { flexDirection: 'row', gap: 16 },
  timelineLine: { width: 14, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  timelineConnector: { width: 2, flex: 1, backgroundColor: '#111' },
  timelineContent: { flex: 1, paddingBottom: 32 },
  timelineRole: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timelineOrg: { color: '#10b981', fontSize: 14, fontWeight: '600', marginTop: 2 },
  timelineStatus: { color: '#333', fontSize: 9, fontWeight: '900', marginTop: 8 },
  certScroll: { gap: 12, paddingRight: 20 },
  certCard: { width: 150, backgroundColor: '#050505', borderRadius: 16, borderWidth: 1, borderColor: '#111', padding: 16, gap: 8 },
  certTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  certIssuer: { color: '#444', fontSize: 10, fontWeight: '600' },
  emptyTimeline: { padding: 32, alignItems: 'center', backgroundColor: '#050505', borderRadius: 16 },
  emptyText: { color: '#222', fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: '#050505', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: '#222' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scoreCircle: { alignItems: 'center', marginBottom: 40 },
  scoreVal: { color: '#fff', fontSize: 64, fontWeight: '900' },
  scoreLabel: { color: '#10b981', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  breakdown: { gap: 20 },
  breakItem: { gap: 8 },
  breakLabel: { color: '#333', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  breakLine: { height: 4, backgroundColor: '#111', borderRadius: 2 },
  breakFill: { height: '100%', borderRadius: 2 }
});

export default CVScreen;
