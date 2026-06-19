import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboardStats } from '../services/api';
import { useWallet } from '../context/WalletContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HiringScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getDashboardStats(walletAddress);
      setCollections(data?.collections || []);
    } catch (error) {
      console.error('Hiring fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [walletAddress])
  );

  const handleShare = async (slug: string) => {
    const url = `https://chainvolio.xyz/r/${slug}`;
    try {
      await Share.share({ message: `Apply for our open position on ChainVolio: ${url}`, url });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>ACCESSING HIRING CENTER...</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hiring Hub</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ACTION BANNER */}
          <View style={styles.actionBanner}>
             <LinearGradient
               colors={['#10b981', '#059669']}
               style={styles.bannerGradient}
               start={{x:0, y:0}}
               end={{x:1, y:1}}
             >
                <View style={styles.bannerInfo}>
                   <Text style={styles.bannerTitle}>Source Elite Talent</Text>
                   <Text style={styles.bannerDesc}>Create a verifiable collection link and filter for on-chain proof.</Text>
                </View>
                <TouchableOpacity 
                   style={styles.plusCircle}
                   onPress={() => navigation.navigate('Create Hiring')}
                >
                   <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
             </LinearGradient>
          </View>

          {/* COLLECTIONS LIST */}
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>YOUR COLLECTIONS</Text>
             <View style={styles.countBadge}><Text style={styles.countText}>{collections.length}</Text></View>
          </View>

          {collections.length === 0 ? (
            <View style={styles.emptyState}>
               <MaterialCommunityIcons name="briefcase-search-outline" size={48} color="#e5e7eb" />
               <Text style={styles.emptyText}>No active collections found.</Text>
               <TouchableOpacity 
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Create Hiring')}
               >
                  <Text style={styles.emptyBtnText}>GENERATE HIRING LINK</Text>
               </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
               {collections.map((col) => (
                 <View key={col.id} style={styles.colCard}>
                    <View style={styles.colTop}>
                       <View style={styles.colIconBox}>
                          <Ionicons name="link-outline" size={20} color="#10b981" />
                       </View>
                       <View style={styles.colMain}>
                          <Text style={styles.colTitle} numberOfLines={1}>{col.title}</Text>
                          <Text style={styles.colDate}>{new Date(col.created_at).toLocaleDateString()}</Text>
                       </View>
                    </View>
                    
                    <View style={styles.colActions}>
                       <TouchableOpacity 
                          style={styles.actionBtn}
                          onPress={() => handleShare(col.slug)}
                       >
                          <Ionicons name="share-social-outline" size={16} color="rgba(255,255,255,0.6)" />
                          <Text style={styles.actionBtnText}>SHARE</Text>
                       </TouchableOpacity>
                       
                       <TouchableOpacity 
                          style={[styles.actionBtn, styles.actionBtnMain]}
                          onPress={() => navigation.navigate('Dashboard')}
                       >
                          <Text style={styles.actionBtnTextMain}>DASHBOARD</Text>
                          <Ionicons name="arrow-forward" size={14} color="#10b981" />
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
  background: { flex: 1, backgroundColor: '#fafafa' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9ca3af', fontSize: 10,  letterSpacing: 2, marginTop: 20 },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f3f4f6' },
  headerTitle: { color: '#1f2937', fontSize: 18,  },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10 },
  actionBanner: { height: 120, borderRadius: 24, overflow: 'hidden', marginBottom: 40 },
  bannerGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, justifyContent: 'space-between' },
  bannerInfo: { flex: 1, paddingRight: 20 },
  bannerTitle: { color: '#fff', fontSize: 18,  },
  bannerDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 11,  marginTop: 4, lineHeight: 16 },
  plusCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { color: '#9ca3af', fontSize: 9,  letterSpacing: 2 },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 0.5, borderColor: 'rgba(16,185,129,0.2)' },
  countText: { color: '#10b981', fontSize: 9,  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#9ca3af', fontSize: 14,  },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#111827' },
  emptyBtnText: { color: '#ffffff', fontSize: 10,  letterSpacing: 1 },
  grid: { gap: 16 },
  colCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 22, 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  colTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  colIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.08)', alignItems: 'center', justifyContent: 'center' },
  colMain: { flex: 1 },
  colTitle: { color: '#1f2937', fontSize: 15,  },
  colDate: { color: '#9ca3af', fontSize: 11,  marginTop: 2 },
  colActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { 
    flex: 1, 
    height: 48, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  actionBtnMain: { borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.05)' },
  actionBtnText: { color: '#6b7280', fontSize: 10,  letterSpacing: 0.5 },
  actionBtnTextMain: { color: '#10b981', fontSize: 10,  letterSpacing: 0.5 },
});

export default HiringScreen;

