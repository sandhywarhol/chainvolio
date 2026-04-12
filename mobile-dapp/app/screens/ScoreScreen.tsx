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
import { getWalletScore } from '../services/api';
import { useWallet } from '../context/WalletContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ScoreScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [scoreData, setScoreData] = useState<any>(null);
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
      const data = await getWalletScore(walletAddress);
      setScoreData(data);
    } catch (error) {
      console.error('Score fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricLabel = (val: number) => {
    if (val >= 80) return 'EXCELLENT';
    if (val >= 60) return 'STRONG';
    if (val >= 40) return 'BALANCED';
    return 'EMERGING';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>CALCULATING REPUTATION...</Text>
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
          <Text style={styles.headerTitle}>CV Analysis</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Score Orbit */}
          <View style={styles.scoreOrbit}>
             <LinearGradient
               colors={['rgba(168, 85, 247, 0.1)', 'transparent']}
               style={styles.orbitGlow}
             />
             <View style={styles.scoreCircle}>
                <Text style={styles.scoreMainVal}>{scoreData?.score || 0}</Text>
                <Text style={styles.scoreLevelText}>{scoreData?.level || 'NEWBIE'}</Text>
             </View>
             <View style={styles.orbitLabels}>
                <Text style={styles.networkTitle}>CHAINVOLIO NETWORK SCORE</Text>
                <View style={styles.mainProgressContainer}>
                   <View style={[styles.mainProgressBar, { width: `${scoreData?.score || 0}%` }]} />
                </View>
             </View>
          </View>

          {/* Reputation Badges Row */}
          <View style={styles.badgeGrid}>
             <View style={styles.badgeCard}>
                <Ionicons name="shield-checkmark" size={20} color={scoreData?.trust_score >= 40 ? '#10b981' : '#f59e0b'} />
                <View>
                   <Text style={styles.badgeVal}>{scoreData?.trust_score || 0}</Text>
                   <Text style={styles.badgeLabel}>TRUST</Text>
                </View>
             </View>
             <View style={styles.badgeCard}>
                <Ionicons name="pulse" size={20} color="#6366f1" />
                <View>
                   <Text style={styles.badgeVal}>{Math.round((scoreData?.confidence || 0) * 100)}%</Text>
                   <Text style={styles.badgeLabel}>CONFIDENCE</Text>
                </View>
             </View>
          </View>

          {/* Metrics Breakdown */}
          <View style={styles.section}>
             <Text style={styles.sectionHeading}>METRIC BREAKDOWN</Text>
             <View style={styles.metricsBox}>
                {[
                  { name: 'Experience', val: scoreData?.breakdown?.experience || 0, color: '#a855f7' },
                  { name: 'Verification', val: scoreData?.breakdown?.verification || 0, color: '#10b981' },
                  { name: 'Consistency', val: scoreData?.breakdown?.consistency || 0, color: '#eb4899' },
                  { name: 'Skills', val: scoreData?.breakdown?.skill || 0, color: '#06b6d4' },
                  { name: 'On-Chain Activity', val: scoreData?.breakdown?.activity || 0, color: '#f59e0b' },
                ].map((item, idx) => (
                  <View key={idx} style={styles.metricItem}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricName}>{item.name}</Text>
                      <Text style={[styles.metricStatus, { color: item.color }]}>{getMetricLabel(item.val)}</Text>
                    </View>
                    <View style={styles.progressBack}>
                       <View style={[styles.progressFill, { width: `${item.val}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))}
             </View>
          </View>

          {/* Domain Expertise */}
          {scoreData?.domains && (
            <View style={styles.section}>
               <Text style={styles.sectionHeading}>DOMAIN EXPERTISE</Text>
               <View style={styles.expertiseBox}>
                  {Object.entries(scoreData.domains).map(([domain, val]: [string, any], idx) => (
                    <View key={idx} style={styles.domainRow}>
                       <View style={styles.domainDot} />
                       <Text style={styles.domainName}>{domain.toUpperCase()}</Text>
                       <Text style={styles.domainVal}>{String(val)}</Text>
                    </View>
                  ))}
               </View>
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
    paddingHorizontal: 20,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'SpaceGrotesk-Bold' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10 },
  scoreOrbit: { alignItems: 'center', marginBottom: 40, position: 'relative' },
  orbitGlow: { position: 'absolute', top: 0, width: 260, height: 260, borderRadius: 130 },
  scoreCircle: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    borderWidth: 1, 
    borderColor: 'rgba(168, 85, 247, 0.3)', 
    backgroundColor: '#0a0a0f', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#a855f7',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  scoreMainVal: { color: '#fff', fontSize: 48, fontFamily: 'SpaceGrotesk-Bold' },
  scoreLevelText: { color: '#a855f7', fontSize: 9, fontFamily: 'Inter-Bold', letterSpacing: 2, marginTop: -4 },
  orbitLabels: { marginTop: 24, width: '100%', alignItems: 'center' },
  networkTitle: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter-Bold', letterSpacing: 2, marginBottom: 12 },
  mainProgressContainer: { width: 220, height: 4, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 2, overflow: 'hidden' },
  mainProgressBar: { height: '100%', backgroundColor: '#a855f7' },
  badgeGrid: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  badgeCard: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    padding: 16, 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    borderRadius: 18, 
    borderWidth: 0.5, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  badgeVal: { color: '#fff', fontSize: 16, fontFamily: 'SpaceGrotesk-Bold' },
  badgeLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 8, fontFamily: 'Inter-Bold', letterSpacing: 1 },
  section: { marginBottom: 40 },
  sectionHeading: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter-Bold', letterSpacing: 2, marginBottom: 16 },
  metricsBox: { gap: 20 },
  metricItem: { gap: 8 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  metricName: { color: '#fff', fontSize: 13, fontFamily: 'Inter-Bold' },
  metricStatus: { fontSize: 8, fontFamily: 'Inter-Bold', letterSpacing: 1 },
  progressBack: { height: 6, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  expertiseBox: { 
    backgroundColor: 'rgba(255,255,255,0.01)', 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 0.5, 
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 12
  },
  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  domainDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
  domainName: { flex: 1, color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter-Bold' },
  domainVal: { color: '#fff', fontSize: 12, fontFamily: 'SpaceGrotesk-Bold' },
});

export default ScoreScreen;
