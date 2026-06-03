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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletReceipts } from '../services/api';
import { useWallet } from '../context/WalletContext';
import { getShortDate, calculateDuration } from '../utils/date';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const TimelineScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [walletAddress])
  );

  const fetchData = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getWalletReceipts(walletAddress);
      // Sort newest at the top for the vertical timeline
      const sorted = (data?.receipts || []).sort((a: any, b: any) => {
          const dA = new Date(a.startDate || a.start_date).getTime();
          const dB = new Date(b.startDate || b.start_date).getTime();
          return dB - dA;
      });
      setReceipts(sorted);
    } catch (error) {
      console.error('Timeline fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>CHRONICLING HISTORY...</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Career Timeline</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introSection}>
             <Text style={styles.tagline}>VERIFIED PROFESSIONAL JOURNEY</Text>
             <Text style={styles.desc}>A chronological record of your verifiable on-chain work history and career milestones.</Text>
          </View>

          {receipts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color="rgba(255,255,255,0.05)" />
              <Text style={styles.emptyText}>No history anchored yet.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Add Proof')} style={styles.anchorBtn}>
                 <Text style={styles.anchorBtnText}>ANCHOR FIRST WORK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
               <View style={styles.verticalLine} />
               {receipts.map((r, i) => {
                 const startStr = getShortDate(r.startDate || r.start_date);
                 const endStr = getShortDate(r.endDate || r.end_date);
                 const duration = calculateDuration(r.startDate || r.start_date, r.endDate || r.end_date);
                 
                 return (
                    <View key={r.id || i} style={[styles.timelineItem, i === 0 && styles.firstItem]}>
                       <View style={[styles.node, { backgroundColor: r.status === 'Attested' ? '#10b981' : '#333' }]}>
                          {r.status === 'Attested' && <Ionicons name="shield-checkmark" size={10} color="#000" />}
                       </View>
                       
                       <View style={styles.contentCard}>
                          <Text style={styles.dateLabel}>{startStr} - {endStr}</Text>
                          <Text style={styles.durationLabel}>{duration}</Text>
                          
                          <View style={styles.mainInfo}>
                             <Text style={styles.orgName}>{r.org}</Text>
                             <Text style={styles.roleName}>{r.role}</Text>
                          </View>
                          
                          <View style={styles.badgeRow}>
                             {r.status === 'Attested' && (
                                <View style={styles.verifiedBadge}>
                                   <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                                </View>
                             )}
                             <Text style={styles.workType}>{r.workType || 'Project'}</Text>
                          </View>

                          {r.description && (
                            <Text style={styles.description} numberOfLines={2}>{r.description}</Text>
                          )}
                       </View>
                    </View>
                 );
               })}
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
  loadingText: { color: 'rgba(255,255,255,0.2)', fontSize: 10,  letterSpacing: 2, marginTop: 20 },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerTitle: { color: '#fff', fontSize: 18,  },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10 },
  introSection: { marginBottom: 40 },
  tagline: { color: '#10b981', fontSize: 9,  letterSpacing: 3, marginBottom: 8 },
  desc: { color: 'rgba(255,255,255,0.3)', fontSize: 13,  lineHeight: 20 },
  timelineContainer: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.05)', marginLeft: 6, paddingLeft: 24 },
  verticalLine: { position: 'absolute', left: -1, top: 15, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  timelineItem: { marginBottom: 45, position: 'relative' },
  firstItem: { marginTop: 10 },
  node: { 
    position: 'absolute', 
    left: -31, 
    top: 0, 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#050505'
  },
  contentCard: { 
    backgroundColor: 'rgba(255,255,255,0.01)', 
    borderRadius: 20, 
    padding: 18, 
    borderWidth: 0.5, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  dateLabel: { color: '#fff', fontSize: 12,  },
  durationLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 10,  marginTop: 2 },
  mainInfo: { marginVertical: 14 },
  orgName: { color: '#10b981', fontSize: 15,  },
  roleName: { color: '#fff', fontSize: 14,  marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  verifiedBadge: { px: 6, py: 2, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(16, 185, 129, 0.2)' },
  verifiedBadgeText: { color: '#10b981', fontSize: 7,  letterSpacing: 1 },
  workType: { color: 'rgba(255,255,255,0.2)', fontSize: 9,  textTransform: 'uppercase' },
  description: { color: 'rgba(255,255,255,0.4)', fontSize: 12,  lineHeight: 18 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 15 },
  emptyText: { color: 'rgba(255,255,255,0.1)', fontSize: 14,  },
  anchorBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  anchorBtnText: { color: '#10b981', fontSize: 11,  }
});

export default TimelineScreen;

