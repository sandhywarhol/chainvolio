import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useWallet } from '../context/WalletContext';
import { getProfile } from '../services/api';

const HiringScreen = () => {
  const { walletAddress } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [walletAddress])
  );

  const fetchData = async (isRefresh = false) => {
    if (!walletAddress) return;
    if (!isRefresh) setLoading(true);
    
    try {
      const prof = await getProfile(walletAddress);
      setProfile(prof);
    } catch (error) {
      console.error('Hiring center sync error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>ACCESSING HIRING CENTER...</Text>
      </View>
    );
  }

  const isRecruiter = profile?.verificationTier === 'recruiter';
  const attestationUsed = profile?.attestationUsed || 0;
  const attestationQuota = profile?.attestationQuota || 0;
  const usagePercent = attestationQuota > 0 ? (attestationUsed / attestationQuota) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
         <View>
            <Text style={styles.headerTitle}>Hiring Center</Text>
            <Text style={styles.headerSubtitle}>Verified Talent Sourcing</Text>
         </View>
         <TouchableOpacity 
           style={styles.plusBtn}
           onPress={() => Linking.openURL('https://chainvolio.xyz/hiring/create')}
         >
            <Ionicons name="add" size={24} color="#000" />
         </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} tintColor="#10b981" />
        }
      >
        
        {/* RECRUITER STATUS CARD */}
        <View style={styles.dashboardCard}>
           <View style={styles.cardHeader}>
              <View style={styles.badgeLabel}>
                 <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                 <Text style={styles.cardLabel}>OFFICIAL RECRUITER</Text>
              </View>
              <View style={[styles.tierBadge, { backgroundColor: isRecruiter ? '#10b98120' : '#222' }]}>
                 <Text style={[styles.tierText, { color: isRecruiter ? '#10b981' : '#666' }]}>
                   {isRecruiter ? 'TIER III' : 'LITE'}
                 </Text>
              </View>
           </View>
           
           <View style={styles.mainStats}>
              <View style={styles.statItem}>
                 <Text style={styles.statVal}>0</Text>
                 <Text style={styles.statLabel}>TALENT POOLS</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={styles.statVal}>0</Text>
                 <Text style={styles.statLabel}>PUBLIC LISTS</Text>
              </View>
           </View>
        </View>

        {/* BENEFIT TRACKER (NEW - MIRRORS DESKTOP) */}
        <View style={styles.benefitCard}>
           <View style={styles.benefitHeader}>
              <Text style={styles.benefitTitle}>MONTHLY ATTESTATION QUOTA</Text>
              <Text style={styles.benefitVal}>{attestationUsed} / {attestationQuota}</Text>
           </View>
           <View style={styles.usageBar}>
              <View style={[styles.usageFill, { width: `${usagePercent}%` }]} />
           </View>
           <View style={styles.benefitFooter}>
              <Ionicons name="time-outline" size={12} color="#444" />
              <Text style={styles.resetText}>Resets in 14 days</Text>
           </View>
        </View>

        {/* TALENT COLLECTIONS */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>TALENT COLLECTIONS</Text>
        </View>

        <View style={styles.emptyBox}>
          <View style={styles.iconCircle}>
             <Ionicons name="search" size={32} color="#111" />
          </View>
          <Text style={styles.emptyTitle}>No active collections</Text>
          <Text style={styles.emptySubtitle}>
            Create your first collection on desktop to start trackting talents with verified employment.
          </Text>
          
          <TouchableOpacity 
             style={styles.actionBtn}
             onPress={() => Linking.openURL('https://chainvolio.xyz/hiring/create')}
          >
             <Text style={styles.actionBtnText}>Go to Desktop Dashboard</Text>
             <Ionicons name="external-link" size={14} color="#000" />
          </TouchableOpacity>
        </View>

        {/* SOURCE TOOLS */}
        <View style={styles.toolsList}>
           <Text style={styles.toolsHeader}>INFRASTRUCTURE TOOLS</Text>
           
           <TouchableOpacity style={styles.toolRow}>
              <View style={[styles.toolIcon, { backgroundColor: '#10b98110' }]}>
                 <MaterialCommunityIcons name="shield-search" size={20} color="#10b981" />
              </View>
              <View style={styles.toolInfo}>
                 <Text style={styles.toolTitle}>Candidate Verification</Text>
                 <Text style={styles.toolDesc}>Request a proof of work from a builder</Text>
              </View>
           </TouchableOpacity>

           <TouchableOpacity style={styles.toolRow}>
              <View style={[styles.toolIcon, { backgroundColor: '#6366f110' }]}>
                 <Ionicons name="people-outline" size={20} color="#6366f1" />
              </View>
              <View style={styles.toolInfo}>
                 <Text style={styles.toolTitle}>Social Sourcing</Text>
                 <Text style={styles.toolDesc}>Discover talent via community attestations</Text>
              </View>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#333', fontSize: 9, marginTop: 16, fontWeight: '900', letterSpacing: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#111' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#444', fontSize: 12, fontWeight: '600' },
  plusBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 24 },
  dashboardCard: { backgroundColor: '#050505', borderRadius: 24, borderWidth: 1, borderColor: '#111', padding: 24, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  badgeLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardLabel: { color: '#10b981', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tierText: { fontSize: 8, fontWeight: '900' },
  mainStats: { flexDirection: 'row', gap: 40 },
  statVal: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  statLabel: { color: '#333', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  benefitCard: { backgroundColor: '#050505', borderRadius: 20, borderWidth: 1, borderColor: '#111', padding: 20, marginBottom: 40 },
  benefitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  benefitTitle: { color: '#444', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  benefitVal: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  usageBar: { height: 6, backgroundColor: '#111', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  usageFill: { height: '100%', backgroundColor: '#10b981' },
  benefitFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resetText: { color: '#444', fontSize: 9, fontWeight: '600' },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { color: '#222', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  emptyBox: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#020202', borderRadius: 24, borderWidth: 1, borderColor: '#111', borderStyle: 'dashed' },
  iconCircle: { width: 70, height: 70, borderRadius: 20, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#111' },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubtitle: { color: '#444', fontSize: 12, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30, marginBottom: 24 },
  actionBtn: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  actionBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  toolsList: { marginTop: 40 },
  toolsHeader: { color: '#222', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#050505', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#111' },
  toolIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toolInfo: { flex: 1 },
  toolTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  toolDesc: { color: '#444', fontSize: 12, marginTop: 2 },
});

export default HiringScreen;
