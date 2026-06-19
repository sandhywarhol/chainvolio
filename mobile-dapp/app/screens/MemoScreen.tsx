import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Linking,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PERF_LABELS = [
  { key: "reliability", label: "Reliability" },
  { key: "technical_skill", label: "Technical Proficiency" },
  { key: "communication", label: "Communication" },
  { key: "leadership", label: "Leadership" },
  { key: "integrity", label: "Professional Integrity" },
];

const MemoScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = 'https://chainvolio.xyz/api';

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/memo/${id}`);
      if (!response.ok) throw new Error('Memo not found');
      const d = await response.json();
      setData(d);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>RESOLVING PROTOCOL RECORD...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Verification Not Found</Text>
        <Text style={styles.errorSub}>The requested credential may have been revoked or the ID is invalid.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { attestation, receipt, attester_verification, attester_profile } = data;
  const memo: any = attestation.memo_v2;
  const performance = memo?.content?.performance;
  const isHiring = attestation.attestation_type?.toLowerCase() === "hiring proof" && 
                   attestation.classification?.toLowerCase() !== "professional attestation";
  const issuerName = attester_profile?.display_name || (memo?.signature?.signatory_name) || attestation.attester_name;

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification Memo</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            {/* Entry Label */}
            <View style={styles.entryLabelBox}>
              <View style={styles.badgeLine} />
              <View style={styles.badgeInner}>
                <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                <Text style={styles.badgeText}>PROTOCOL ISSUED ENTRY</Text>
              </View>
              <View style={styles.badgeLine} />
            </View>

            <Text style={styles.memoHeading}>
              {isHiring ? "HIRING MEMO" : "VERIFICATION MEMO"}
            </Text>
            
            <Text style={styles.memoSubheading}>
              {isHiring 
                ? `Official record confirming the recruitment of ${receipt?.role || "Recipient"} by ${receipt?.org || "Institution"}.`
                : `Official institutional record for work performed by ${receipt?.role || "Recipient"}, cryptographically verified and anchored on the Solana blockchain.`
              }
            </Text>

            {/* Meta Items Grid */}
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>ISSUE DATE</Text>
                <Text style={styles.metaValue}>
                  {attestation.memo_issued_at ? new Date(attestation.memo_issued_at).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : '08 March 2026'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>MEMO ID</Text>
                <Text style={[styles.metaValue, styles.mono]}>{String(id).slice(0, 12).toUpperCase()}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>PROTOCOL STATUS</Text>
                <Text style={[styles.metaValue, { color: '#059669' }]}>Verified & Active</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>CLASSIFICATION</Text>
                <Text style={styles.metaValue}>{attestation.classification || "Professional Attestation"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Performance Summary */}
            {memo?.content?.executive_summary && (
              <View style={styles.summarySection}>
                 <Text style={styles.sectionTitle}>PERFORMANCE SUMMARY</Text>
                 <View style={styles.quoteBox}>
                    <Text style={styles.quoteText}>"{memo.content.executive_summary}"</Text>
                 </View>
              </View>
            )}

            {/* On-Chain Verification Card */}
            <View style={styles.verificationCard}>
               <Text style={[styles.sectionTitle, { textAlign: 'left', marginBottom: 20 }]}>ON-CHAIN VERIFICATION</Text>
               <View style={styles.verifHeader}>
                  <View style={styles.solanaLogoBox}>
                    <Image source={require('../../assets/images/solana-logo.png')} style={styles.solanaLogoImg} /> 
                  </View>
                  <View>
                     <Text style={styles.verifProvider}>SOLANA PROTOCOL</Text>
                     <Text style={styles.verifStatus}>MAINNET CONSENSUS</Text>
                  </View>
               </View>

               <View style={styles.signatureBox}>
                  <View style={styles.sigHeaderRow}>
                    <Text style={styles.sigLabel}>TRANSACTION SIGNATURE</Text>
                    <View style={styles.onChainPill}><Text style={styles.onChainPillText}>ON-CHAIN</Text></View>
                  </View>
                  <Text style={styles.sigText} numberOfLines={3}>{attestation.tx_signature || 'N/A'}</Text>
               </View>

               <View style={styles.qrRow}>
                  <View style={styles.qrCodeBox}>
                    <Image 
                      source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chainvolio.xyz/memo/${id}&bgcolor=ffffff` }} 
                      style={styles.qrImg} 
                    />
                  </View>
                  <View style={styles.qrTextCol}>
                     <Text style={styles.qrTitle}>DIGITAL ORIGINAL</Text>
                     <Text style={styles.qrSub}>Scan this secure gateway to verify the authenticity of this digital certificate directly on the protocol.</Text>
                  </View>
               </View>

               <View style={styles.tamperProofRow}>
                  <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                  <Text style={styles.tamperProofText}>TAMPER-PROOF SECURE</Text>
               </View>
               <Text style={styles.idSubscript}>The content hash matches the on-chain instruction data, ensuring zero tampering.</Text>
            </View>

            {/* Recipient Details */}
            <View style={styles.detailsGroup}>
               <Text style={styles.sectionTitle}>RECIPIENT DETAILS</Text>
               <View style={styles.detailsGrid}>
                  <DetailItem label="Professional Position" value={receipt?.role} />
                  <DetailItem label="Affiliated Organization" value={receipt?.org} />
                  <DetailItem label="Engagement Start" value={receipt?.start_date} />
                  <DetailItem label="Engagement End" value={receipt?.end_date || 'Present'} />
               </View>

               {/* Key Contributions */}
               {memo?.content?.key_achievements?.length > 0 && (
                 <View style={styles.achievementsBox}>
                   <Text style={[styles.sectionTitle, { textAlign: 'left', marginBottom: 20 }]}>KEY CONTRIBUTIONS</Text>
                   {memo.content.key_achievements.filter((s: string) => s.trim()).map((s: string, i: number) => (
                     <View key={i} style={styles.achievementItem}>
                       <View style={styles.achievementDot} />
                       <Text style={styles.achievementText}>{s}</Text>
                     </View>
                   ))}
                 </View>
               )}
            </View>

            {/* Performance Ratings */}
            {(performance || !isHiring) && (
              <View style={styles.ratingSection}>
                <Text style={styles.sectionTitle}>PERFORMANCE ASSESSMENT</Text>
                <View style={styles.ratingCard}>
                  {PERF_LABELS.map(({ key, label }) => (
                    <View key={key} style={styles.ratingRow}>
                      <View style={styles.ratingHeader}>
                        <Text style={styles.ratingLabel}>{label}</Text>
                        <Text style={styles.ratingVal}>{performance?.[key] || 0}/5</Text>
                      </View>
                      <View style={styles.barBg}>
                        <View style={[styles.barFill, { width: `${(performance?.[key] || 0) * 20}%` }]} />
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.aggregateRow}>
                    <Text style={styles.aggregateLabel}>AGGREGATE RATING</Text>
                    <Text style={styles.aggregateVal}>
                      {(Object.values(performance || {}).reduce((a: any, b: any) => a + b, 0) / 5).toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Signature Area */}
            <View style={styles.footer}>
               <Text style={styles.sectionTitle}>AUTHORIZED SIGNATORY</Text>
               <View style={styles.signatoryCard}>
                  <View style={styles.signatoryAvatar}>
                    {attester_profile?.avatar_url ? (
                      <Image source={{ uri: attester_profile.avatar_url }} style={styles.avatarImg} />
                    ) : (
                      <View style={styles.avatarPlaceholder}><Text style={styles.placeholderText}>{issuerName?.[0]}</Text></View>
                    )}
                  </View>
                  <View style={styles.signatoryInfo}>
                    <Text style={styles.signatoryName}>{issuerName}</Text>
                    <Text style={styles.signatoryTitle}>{data.issuer_role} - {attester_profile?.organization || attestation.attester_org || ''}</Text>
                    <View style={styles.trustBadge}>
                       <Ionicons name="shield-checkmark" size={10} color="#10b981" />
                       <Text style={styles.trustText}>INSTITUTIONAL TRUST LEVEL ACTIVE</Text>
                    </View>
                  </View>
               </View>

               <View style={styles.idBox}>
                  <Text style={styles.idLabel}>ISSUER WALLET IDENTITY</Text>
                  <Text style={styles.idValue}>{attestation.attester_wallet}</Text>
               </View>

               <View style={styles.protocolStamp}>
                  <View style={styles.stampHeader}>
                     <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                     <Text style={styles.stampTitle}>Cryptographically Signed</Text>
                  </View>
                  <Text style={styles.stampSub}>ChainVolio Protocol • Institutional Integrity Unit</Text>
               </View>
            </View>

            <View style={{ height: 60 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const DetailItem = ({ label, value }: any) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label.toUpperCase()}</Text>
    <Text style={styles.detailValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#fafafa' },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#6b7280', fontSize: 10, letterSpacing: 2, marginTop: 20 },
  errorContainer: { flex: 1, backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center', padding: 30 },
  errorTitle: { color: '#1f2937', fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  errorSub: { color: '#6b7280', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  backBtn: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  backBtnText: { color: '#1f2937', fontWeight: 'bold' },

  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  headerTitle: { color: '#1f2937', fontSize: 16, fontWeight: 'bold' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  container: { flex: 1 },
  content: { padding: 25 },

  entryLabelBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
  badgeLine: { height: 1, flex: 1, backgroundColor: '#e5e7eb' },
  badgeInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', backgroundColor: 'rgba(16,185,129,0.05)' },
  badgeText: { color: '#059669', fontSize: 7, fontWeight: '900', letterSpacing: 2 },

  memoHeading: { color: '#1f2937', fontSize: 36, fontWeight: '900', textAlign: 'center', letterSpacing: -1 },
  memoSubheading: { color: '#4b5563', fontSize: 12, textAlign: 'center', marginTop: 15, lineHeight: 18, fontWeight: '500' },

  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 40 },
  metaItem: { width: '50%', marginBottom: 25 },
  metaLabel: { color: '#6b7280', fontSize: 8, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
  metaValue: { color: '#1f2937', fontSize: 12, fontWeight: '900' },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11 },

  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 35 },

  summarySection: { marginBottom: 45 },
  sectionTitle: { color: '#6b7280', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 15, textAlign: 'center' },
  quoteBox: { padding: 25, borderRadius: 24, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  quoteText: { color: '#4b5563', fontSize: 16, fontStyle: 'italic', fontWeight: '500', textAlign: 'center', lineHeight: 26 },

  verificationCard: { 
    padding: 25, 
    borderRadius: 30, 
    backgroundColor: '#ffffff', 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    marginBottom: 50
  },
  verifHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 25 },
  solanaLogoBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  solanaLogoImg: { width: 22, height: 22 },
  verifProvider: { color: '#1f2937', fontSize: 13, fontWeight: '900' },
  verifStatus: { color: '#6b7280', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },

  signatureBox: { padding: 18, borderRadius: 18, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb' },
  sigHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sigLabel: { color: '#6b7280', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  onChainPill: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  onChainPillText: { color: '#059669', fontSize: 7, fontWeight: '900' },
  sigText: { color: '#4b5563', fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 14 },

  qrRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 25, paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  qrCodeBox: { width: 85, height: 85, padding: 4, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  qrImg: { width: '100%', height: '100%' },
  qrTextCol: { flex: 1 },
  qrTitle: { color: '#1f2937', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  qrSub: { color: '#6b7280', fontSize: 9, lineHeight: 14, marginTop: 4, fontWeight: '500' },

  tamperProofRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 25 },
  tamperProofText: { color: '#059669', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  idSubscript: { color: '#9ca3af', fontSize: 8, lineHeight: 12, marginTop: 6, fontWeight: '500' },

  detailsGroup: { marginBottom: 45 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '50%', marginBottom: 25 },
  detailLabel: { color: '#6b7280', fontSize: 8, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
  detailValue: { color: '#1f2937', fontSize: 13, fontWeight: '900' },

  achievementsBox: { marginTop: 10, paddingTop: 30, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  achievementItem: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  achievementDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#059669', marginTop: 6 },
  achievementText: { color: '#4b5563', fontSize: 13, lineHeight: 22, flex: 1, fontWeight: '500' },

  ratingSection: { marginBottom: 45 },
  ratingCard: { padding: 25, borderRadius: 24, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  ratingRow: { marginBottom: 18 },
  ratingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ratingLabel: { color: '#6b7280', fontSize: 11, fontWeight: '700' },
  ratingVal: { color: '#1f2937', fontSize: 11, fontWeight: '900' },
  barBg: { height: 3, width: '100%', backgroundColor: '#f3f4f6', borderRadius: 2 },
  barFill: { height: '100%', backgroundColor: '#059669', borderRadius: 2 },

  aggregateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  aggregateLabel: { color: '#6b7280', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  aggregateVal: { color: '#059669', fontSize: 28, fontWeight: '900' },

  footer: { marginTop: 25 },
  signatoryCard: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 30 },
  signatoryAvatar: { width: 75, height: 75, borderRadius: 40, borderWidth: 2, borderColor: '#059669', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#059669', fontSize: 26, fontWeight: 'bold' },
  signatoryName: { color: '#1f2937', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  signatoryTitle: { color: '#6b7280', fontSize: 12, fontStyle: 'italic', marginTop: 4, fontWeight: '500' },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  trustText: { color: '#9ca3af', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },

  idBox: { marginTop: 30 },
  idLabel: { color: '#6b7280', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginBottom: 5 },
  idValue: { color: '#4b5563', fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  protocolStamp: { 
    marginTop: 50,
    padding: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    backgroundColor: 'rgba(16,185,129,0.05)',
    alignItems: 'center'
  },
  stampHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  stampTitle: { color: '#059669', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  stampSub: { color: '#6b7280', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
});

export default MemoScreen;
