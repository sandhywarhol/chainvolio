import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
  Easing,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../context/WalletContext';
import { getProfile, getWalletReceipts, getDashboardStats } from '../services/api';
import ProofOfWorkCard from '../components/Profile/ProofOfWorkCard';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImpactExpanded, setIsImpactExpanded] = useState(true);
  const [isHiringExpanded, setIsHiringExpanded] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress) return;
      try {
        const stats = await getDashboardStats(walletAddress);
        const recs = await getWalletReceipts(walletAddress);
        
        setProfile(stats.profile);
        setReceipts(recs?.receipts || []);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, [walletAddress]);

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.08]
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>RESOLVING PROFESSIONAL LOG...</Text>
      </View>
    );
  }

  const completion = profile?.completionPercentage || 0;

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" />
      
      {/* AMBIENT LIGHT SOURCES */}
      <Animated.View style={[styles.glowTop, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.glowBottom, { opacity: glowOpacity }]} />

      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header Management Row */}
          <View style={styles.header}>
             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
             </TouchableOpacity>
             <View style={styles.headerTextCol}>
               <Text style={styles.greeting}>Management</Text>
               <Text style={styles.subGreeting}>Verifiable Identity Operations</Text>
             </View>
             <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('Profile')}>
               <Ionicons name="person-outline" size={18} color="#fff" />
             </TouchableOpacity>
          </View>

          {/* Profile Completion Card */}
          {completion < 100 && (
            <View style={styles.completionCard}>
               <LinearGradient
                  colors={['rgba(16,185,129,0.05)', 'transparent']}
                  style={styles.cardGradient}
               >
                 <View style={styles.completionHeader}>
                    <View style={styles.completionTitleRow}>
                       <View style={styles.pulseDot} />
                       <Text style={styles.completionTitle}>PROFILE COMPLETION</Text>
                    </View>
                    <Text style={styles.completionPercent}>{completion}%</Text>
                 </View>
                 <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${completion}%` }]} />
                 </View>
                 <Text style={styles.completionHint}>
                   Complete your <Text style={styles.whiteText}>professional bio</Text> and <Text style={styles.whiteText}>skills</Text> to optimize recruiter discovery.
                 </Text>
               </LinearGradient>
            </View>
          )}

          {/* Verified Identity Impact */}
          <View style={styles.managementSection}>
             <TouchableOpacity 
               style={styles.sectionHeader}
               onPress={() => setIsImpactExpanded(!isImpactExpanded)}
               activeOpacity={0.7}
             >
                <View style={styles.sectionTitleRow}>
                   <View style={[styles.iconBox, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                      <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                   </View>
                   <View>
                      <Text style={styles.sectionMainTitle}>Identity Impact</Text>
                      <Text style={styles.sectionSubTitle}>Trust signals and on-chain metrics</Text>
                   </View>
                </View>
                <Ionicons 
                  name={isImpactExpanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="rgba(255,255,255,0.3)" 
                />
             </TouchableOpacity>

             {isImpactExpanded && (
               <View style={styles.expandedContent}>
                  <View style={styles.statsGrid}>
                     <View style={styles.statBox}>
                        <Text style={styles.statLabel}>MONTHLY QUOTA</Text>
                        <Text style={styles.statVal}>
                           {profile?.attestationUsed || 0} <Text style={styles.dimText}>/</Text> {profile?.attestationQuota || 12}
                        </Text>
                        <Text style={styles.statSub}>Attestations issued</Text>
                     </View>
                     <View style={styles.statBox}>
                        <Text style={styles.statLabel}>VERIFIER TIER</Text>
                        <Text style={[styles.statVal, { color: '#10b981' }]}>
                           {profile?.verifierTier === 4 ? 'Level IV' : 'Level I'}
                        </Text>
                        <Text style={styles.statSub}>Institutional Trust</Text>
                     </View>
                  </View>
               </View>
             )}
          </View>

          {/* Hiring Center */}
          <View style={styles.managementSection}>
             <TouchableOpacity 
               style={styles.sectionHeader}
               onPress={() => setIsHiringExpanded(!isHiringExpanded)}
               activeOpacity={0.7}
             >
                <View style={styles.sectionTitleRow}>
                   <View style={[styles.iconBox, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                      <Ionicons name="briefcase" size={20} color="#6366f1" />
                   </View>
                   <View>
                      <Text style={styles.sectionMainTitle}>Hiring Operations</Text>
                      <Text style={styles.sectionSubTitle}>Manage collections and pipeline</Text>
                   </View>
                </View>
                <Ionicons 
                  name={isHiringExpanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="rgba(255,255,255,0.3)" 
                />
             </TouchableOpacity>

             {isHiringExpanded && (
                <View style={styles.expandedContent}>
                   <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Source Talent with Integrity</Text>
                      <Text style={styles.emptySub}>Create collections to receive immutable snapshots of candidate portfolios.</Text>
                      <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('Create Hiring')}
                      >
                         <LinearGradient
                            colors={['#6366f1', '#4f46e5']}
                            style={styles.actionBtnGradient}
                         >
                            <Text style={styles.actionBtnText}>Initialize Collection</Text>
                            <Ionicons name="add" size={18} color="#fff" />
                         </LinearGradient>
                      </TouchableOpacity>
                   </View>
                </View>
             )}
          </View>

          {/* Proof of Work Section */}
          <View style={styles.workSection}>
             <View style={styles.workHeader}>
                <Text style={styles.workTitle}>Professional Evidence</Text>
                <TouchableOpacity 
                  style={styles.addProofBtn}
                  onPress={() => navigation.navigate('Add Proof')}
                >
                   <Text style={styles.addProofText}>+ Add Work</Text>
                </TouchableOpacity>
             </View>

             {receipts.length > 0 ? (
               receipts.slice(0, 5).map((r, i) => (
                 <ProofOfWorkCard 
                    key={i} 
                    work={r} 
                    onPress={() => navigation.navigate('CV')} 
                 />
               ))
             ) : (
               <View style={styles.emptyWorkBox}>
                  <Ionicons name="document-text-outline" size={32} color="rgba(255,255,255,0.05)" />
                  <Text style={styles.emptySectionText}>No professional records resolved.</Text>
               </View>
             )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#050505' },
  container: { flex: 1 },
  glowTop: {
    position: 'absolute',
    top: -width * 0.4,
    right: -width * 0.4,
    width: width,
    height: width,
    backgroundColor: '#6366f1',
    borderRadius: width / 2,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -width * 0.4,
    left: -width * 0.4,
    width: width,
    height: width,
    backgroundColor: '#10b981',
    borderRadius: width / 2,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: 'rgba(255,255,255,0.2)', fontSize: 10,  letterSpacing: 2, marginTop: 20 },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
    marginTop: 10,
    gap: 15
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  headerTextCol: { flex: 1 },
  greeting: {
    color: '#fff',
    fontSize: 22,
    
  },
  subGreeting: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  completionCard: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    marginBottom: 30,
    overflow: 'hidden'
  },
  cardGradient: { padding: 20 },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  completionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  completionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    
    letterSpacing: 1.5,
  },
  completionPercent: {
    color: '#10b981',
    fontSize: 14,
    
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  completionHint: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    
    lineHeight: 16,
  },
  whiteText: {
    color: 'rgba(255,255,255,0.6)',
  },
  managementSection: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionMainTitle: {
    color: '#fff',
    fontSize: 15,
    
  },
  sectionSubTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    
    marginTop: 2,
  },
  expandedContent: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 8,
    
    letterSpacing: 1,
    marginBottom: 6,
  },
  statVal: {
    color: '#fff',
    fontSize: 18,
    
  },
  dimText: {
    color: 'rgba(255,255,255,0.1)',
  },
  statSub: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 9,
    
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyText: {
    color: '#fff',
    fontSize: 15,
    
    marginBottom: 8,
  },
  emptySub: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
    paddingHorizontal: 10
  },
  actionBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    
  },
  workSection: {
    marginTop: 40,
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workTitle: {
    color: '#fff',
    fontSize: 17,
    
  },
  addProofBtn: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)'
  },
  addProofText: {
    color: '#10b981',
    fontSize: 11,
    
  },
  receiptCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptRole: {
    color: '#fff',
    fontSize: 15,
    
    flex: 1,
    marginRight: 10
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 8,
    
    fontWeight: '900',
    letterSpacing: 0.5
  },
  receiptOrg: {
    color: 'rgba(16,185,129,0.7)',
    fontSize: 13,
    
    marginBottom: 15,
  },
  receiptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.03)'
  },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  receiptDate: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    
  },
  emptyWorkBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptySectionText: {
    color: 'rgba(255,255,255,0.1)',
    fontSize: 12,
    
    fontStyle: 'italic',
    textAlign: 'center',
  }
});

export default DashboardScreen;

