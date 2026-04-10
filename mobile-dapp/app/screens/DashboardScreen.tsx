import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { getProfile, getWalletReceipts, getWalletScore } from '../services/api';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImpactExpanded, setIsImpactExpanded] = useState(false);
  const [isHiringExpanded, setIsHiringExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress) return;
      try {
        const [prof, recs] = await Promise.all([
          getProfile(walletAddress),
          getWalletReceipts(walletAddress)
        ]);
        setProfile(prof);
        setReceipts(recs);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [walletAddress]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const completion = profile?.completionPercentage || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Management Row */}
        <View style={styles.header}>
           <View>
             <Text style={styles.greeting}>Dashboard</Text>
             <Text style={styles.subGreeting}>Manage your professional identity</Text>
           </View>
           <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('Setup')}>
             <Ionicons name="create-outline" size={18} color="#fff" />
           </TouchableOpacity>
        </View>

        {/* Profile Completion Card */}
        {completion < 100 && (
          <View style={styles.completionCard}>
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
               Add a <Text style={styles.whiteText}>bio</Text>, <Text style={styles.whiteText}>skills</Text>, and <Text style={styles.whiteText}>proofs</Text> to reach 100% visibility.
             </Text>
          </View>
        )}

        {/* Verified Identity Impact (Accordion-like) */}
        {profile?.isVerified && (
          <View style={styles.managementSection}>
             <TouchableOpacity 
               style={styles.sectionHeader}
               onPress={() => setIsImpactExpanded(!isImpactExpanded)}
             >
                <View style={styles.sectionTitleRow}>
                   <View style={[styles.iconBox, { backgroundColor: '#10b98120' }]}>
                      <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                   </View>
                   <View>
                      <Text style={styles.sectionMainTitle}>Verified Identity Impact</Text>
                      <Text style={styles.sectionSubTitle}>Trust signals and performance metrics</Text>
                   </View>
                </View>
                <Ionicons 
                  name={isImpactExpanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#666" 
                />
             </TouchableOpacity>

             {isImpactExpanded && (
               <View style={styles.expandedContent}>
                  <View style={styles.statsGrid}>
                     <View style={styles.statBox}>
                        <Text style={styles.statLabel}>MONTHLY BENEFITS</Text>
                        <Text style={styles.statVal}>
                           {profile.attestationUsed || 0} <Text style={styles.dimText}>/</Text> {profile.attestationQuota || 0}
                        </Text>
                        <Text style={styles.statSub}>Attestations used</Text>
                     </View>
                     <View style={styles.statBox}>
                        <Text style={styles.statLabel}>IMPACT TIER</Text>
                        <Text style={[styles.statVal, { color: '#10b981' }]}>
                           {profile.verifierTier === 4 ? 'IV' : 'I'}
                        </Text>
                     </View>
                  </View>
               </View>
             )}
          </View>
        )}

        {/* Hiring Center */}
        <View style={styles.managementSection}>
           <TouchableOpacity 
             style={styles.sectionHeader}
             onPress={() => setIsHiringExpanded(!isHiringExpanded)}
           >
              <View style={styles.sectionTitleRow}>
                 <View style={[styles.iconBox, { backgroundColor: '#3b82f620' }]}>
                    <Ionicons name="briefcase" size={20} color="#3b82f6" />
                 </View>
                 <View>
                    <Text style={styles.sectionMainTitle}>Hiring Center</Text>
                    <Text style={styles.sectionSubTitle}>Manage talent collections and hiring links</Text>
                 </View>
              </View>
              <Ionicons 
                name={isHiringExpanded ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#666" 
              />
           </TouchableOpacity>

           {isHiringExpanded && (
              <View style={styles.expandedContent}>
                 <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Ready to Source Talent?</Text>
                    <TouchableOpacity style={styles.actionBtn}>
                       <Text style={styles.actionBtnText}>Create Hiring Collection</Text>
                    </TouchableOpacity>
                 </View>
              </View>
           )}
        </View>

        {/* Proof of Work Section */}
        <View style={styles.workSection}>
           <View style={styles.workHeader}>
              <Text style={styles.workTitle}>Proof of Work</Text>
              <TouchableOpacity style={styles.addProofBtn}>
                 <Text style={styles.addProofText}>+ Add Proof</Text>
              </TouchableOpacity>
           </View>

           {receipts.length > 0 ? (
             receipts.map((r, i) => (
               <View key={i} style={styles.receiptCard}>
                  <View style={styles.receiptHeader}>
                     <Text style={styles.receiptRole}>{r.role}</Text>
                     <View style={[styles.statusBadge, { backgroundColor: r.status === 'Attested' ? '#10b98120' : '#333' }]}>
                        <Text style={[styles.statusText, { color: r.status === 'Attested' ? '#10b981' : '#666' }]}>
                           {r.status === 'Attested' ? '✓ ATTESTED' : 'PENDING'}
                        </Text>
                     </View>
                  </View>
                  <Text style={styles.receiptOrg}>{r.org}</Text>
                  <View style={styles.receiptMeta}>
                     <Text style={styles.receiptDate}>Jan 2024</Text>
                     <TouchableOpacity>
                        <Ionicons name="create-outline" size={16} color="#666" />
                     </TouchableOpacity>
                  </View>
               </View>
             ))
           ) : (
             <Text style={styles.emptySectionText}>No proofs added yet.</Text>
           )}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subGreeting: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 12,
  },
  completionCard: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    color: '#666',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  completionPercent: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  completionHint: {
    color: '#444',
    fontSize: 10,
    lineHeight: 14,
  },
  whiteText: {
    color: '#888',
  },
  managementSection: {
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionMainTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionSubTitle: {
    color: '#555',
    fontSize: 9,
    marginTop: 1,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#111',
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: '#444',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statVal: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dimText: {
    color: '#333',
  },
  statSub: {
    color: '#333',
    fontSize: 8,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: '#3b82f620',
    borderWidth: 1,
    borderColor: '#3b82f640',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workSection: {
    marginTop: 30,
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addProofBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addProofText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  receiptCard: {
    backgroundColor: '#070707',
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
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
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: 'black',
  },
  receiptOrg: {
    color: '#666',
    fontSize: 13,
    marginBottom: 12,
  },
  receiptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptDate: {
    color: '#333',
    fontSize: 11,
  },
  emptySectionText: {
    color: '#444',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  }
});

export default DashboardScreen;
