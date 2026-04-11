import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletReceipts } from '../services/api';
import { useWallet } from '../context/WalletContext';
import { getShortDate } from '../utils/date';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PortfolioScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getWalletReceipts(walletAddress);
      setReceipts(data?.receipts || []);
    } catch (error) {
      console.error('Portfolio fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [walletAddress])
  );

  const handleCopyLink = async (id: string) => {
    const url = `https://chainvolio.com/attest/${id}`;
    try {
      await Share.share({
        message: `Verify my career milestone on ChainVolio: ${url}`,
        url,
      });
    } catch (error) {
       Alert.alert('Error', 'Could not generate share link.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>COLLECTING ACHIEVEMENTS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Legacy Portfolio</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Add Proof')} style={styles.addBtn}>
             <Ionicons name="add" size={24} color="#10b981" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* STATS ROW */}
          <View style={styles.statsRow}>
             <View style={styles.statBox}>
                <Text style={styles.statVal}>{receipts.length}</Text>
                <Text style={styles.statLabel}>PROOFS</Text>
             </View>
             <View style={styles.statBox}>
                <Text style={styles.statVal}>{receipts.filter(r => r.status === 'Attested').length}</Text>
                <Text style={styles.statLabel}>ON-CHAIN</Text>
             </View>
          </View>

          <Text style={styles.sectionHeading}>PROOF OF WORK GALLERY</Text>

          {receipts.length === 0 ? (
            <View style={styles.emptyState}>
               <Ionicons name="layers-outline" size={64} color="rgba(255,255,255,0.05)" />
               <Text style={styles.emptyMsg}>No projects anchored yet.</Text>
               <TouchableOpacity 
                 style={styles.emptyBtn}
                 onPress={() => navigation.navigate('Add Proof')}
               >
                  <Text style={styles.emptyBtnText}>ANCHOR FIRST PROOF</Text>
               </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.receiptGrid}>
               {receipts.map((r, i) => (
                 <View key={r.id || i} style={styles.receiptCard}>
                    <View style={styles.cardHeader}>
                       <Text style={styles.orgText}>{r.org}</Text>
                       {r.status === 'Attested' ? (
                         <View style={styles.verifiedTag}>
                            <Ionicons name="shield-checkmark" size={10} color="#10b981" />
                            <Text style={styles.verifiedText}>VERIFIED</Text>
                         </View>
                       ) : (
                        <TouchableOpacity 
                          style={styles.requestButton}
                          onPress={() => handleCopyLink(r.id)}
                        >
                           <Ionicons name="link-outline" size={12} color="#6366f1" />
                           <Text style={styles.requestText}>ASK VERIFICATION</Text>
                        </TouchableOpacity>
                       )}
                    </View>
                    
                    <Text style={styles.roleText}>{r.role}</Text>
                    
                    <View style={styles.cardFooter}>
                       <Text style={styles.dateText}>
                          {getShortDate(r.startDate || r.start_date)} — {getShortDate(r.endDate || r.end_date)}
                       </Text>
                       <TouchableOpacity onPress={() => navigation.navigate('Timeline')}>
                          <View style={styles.detailsLink}>
                             <Text style={styles.detailsText}>VIEW DETAILS</Text>
                             <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.4)" />
                          </View>
                       </TouchableOpacity>
                    </View>
                 </View>
               ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#050505' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'Inter-Bold', letterSpacing: 2, marginTop: 20 },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'SpaceGrotesk-Bold' },
  addBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.05)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.1)' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 20 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 40 },
  statBox: { 
    flex: 1, 
    height: 80, 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    borderRadius: 18, 
    borderWidth: 0.5, 
    borderColor: 'rgba(255,255,255,0.05)', 
    justifyContent: 'center', 
    paddingHorizontal: 20 
  },
  statVal: { color: '#fff', fontSize: 24, fontFamily: 'SpaceGrotesk-Bold' },
  statLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter-Bold', letterSpacing: 1, marginTop: 2 },
  sectionHeading: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter-Bold', letterSpacing: 2, marginBottom: 20 },
  receiptGrid: { gap: 16 },
  receiptCard: { 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 0.5, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orgText: { color: '#10b981', fontSize: 13, fontFamily: 'Inter-Bold' },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, py: 3, borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.05)', borderWidth: 0.5, borderColor: 'rgba(16,185,129,0.1)' },
  verifiedText: { color: '#10b981', fontSize: 8, fontFamily: 'Inter-Bold', letterSpacing: 0.5 },
  requestButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, py: 4, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.05)', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.15)' },
  requestText: { color: '#818cf8', fontSize: 8, fontFamily: 'Inter-Bold', letterSpacing: 0.5 },
  roleText: { color: '#fff', fontSize: 17, fontFamily: 'SpaceGrotesk-Bold', marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Inter-Bold' },
  detailsLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'Inter-Bold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 15 },
  emptyMsg: { color: 'rgba(255,255,255,0.15)', fontSize: 14, fontFamily: 'Inter-Bold' },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  emptyBtnText: { color: '#10b981', fontSize: 10, fontFamily: 'Inter-Bold' },
});

export default PortfolioScreen;
