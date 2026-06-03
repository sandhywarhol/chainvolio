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
import ProofOfWorkCard from '../components/Profile/ProofOfWorkCard';

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
    const url = `https://chainvolio.xyz/attest/${id}`;
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
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>COLLECTING ACHIEVEMENTS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Proof of Work</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => navigation.navigate('Add Credential')} style={styles.addBtn} activeOpacity={0.7}>
               <Ionicons name="document-text-outline" size={18} color="#ffffff" />
               <Text style={styles.addBtnText}>Add Credential</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Add Proof')} style={styles.addBtn} activeOpacity={0.7}>
               <Ionicons name="add" size={20} color="#ffffff" />
               <Text style={styles.addBtnText}>Add Proof</Text>
            </TouchableOpacity>
          </View>
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
               <Ionicons name="layers-outline" size={64} color="rgba(0,0,0,0.1)" />
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
                 <ProofOfWorkCard 
                    key={r.id || i} 
                    work={r} 
                    onPress={() => handleCopyLink(r.id)} 
                 />
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
  background: { flex: 1, backgroundColor: '#fafafa' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#6b7280', fontSize: 10,  letterSpacing: 2, marginTop: 20 },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
  },
  headerTitle: { color: '#1f2937', fontSize: 20, fontWeight: '600' },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#111827' },
  addBtnText: { color: '#ffffff', fontSize: 11,  letterSpacing: 0.5, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 20 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 40 },
  statBox: { 
    flex: 1, 
    height: 80, 
    backgroundColor: '#f3f4f6', 
    borderRadius: 18, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    justifyContent: 'center', 
    paddingHorizontal: 20 
  },
  statVal: { color: '#1f2937', fontSize: 24, fontWeight: '600' },
  statLabel: { color: '#6b7280', fontSize: 9,  letterSpacing: 1, marginTop: 2, fontWeight: '600' },
  sectionHeading: { color: '#6b7280', fontSize: 9,  letterSpacing: 2, marginBottom: 20, fontWeight: '600' },
  receiptGrid: { gap: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 15 },
  emptyMsg: { color: '#6b7280', fontSize: 14, fontWeight: '400' },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#111827' },
  emptyBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
});

export default PortfolioScreen;




