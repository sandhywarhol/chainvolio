import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

interface WorkVerificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  work: any;
}

const getVerificationLabel = (type?: string): string => {
  const t = (type || "").toLowerCase();
  if (t.includes("builder")) return "Verified Builder";
  if (t.includes("figure") || t.includes("public")) return "Verified Public Figure";
  if (t.includes("community") || t.includes("dao")) return "Verified Community";
  if (t.includes("company") || t.includes("organization") || t.includes("org")) return "Verified Organization";
  return "Verified Entity";
};

const WorkVerificationModal = ({ isVisible, onClose, work }: WorkVerificationModalProps) => {
  const navigation = useNavigation<any>();
  if (!work) return null;

  const isAttested = work.status === "Attested";

  return (
    <Modal 
      visible={isVisible} 
      animationType="slide" 
      transparent={true} 
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderRow}>
              {work?.attestationType === 'Hiring Proof' ? (
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              ) : (
                <Ionicons name="briefcase-outline" size={20} color="#10b981" />
              )}
              <Text style={styles.modalTitle}>
                {work?.attestationType === 'Hiring Proof' ? 'On-Chain Hiring Proof' : 'Work Verification'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Status Hero */}
            <View style={[
              styles.statusHero, 
              { backgroundColor: isAttested ? 'rgba(16,185,129,0.1)' : 'rgba(30,41,59,0.5)',
                borderColor: isAttested ? 'rgba(16,185,129,0.3)' : 'rgba(51,65,85,1)' }
            ]}>
              <View style={styles.statusHeroContent}>
                {work.attestationType === "Hiring Proof" ? (
                  <>
                    <Ionicons name="shield-checkmark" size={32} color="#10b981" />
                    <Text style={styles.statusHeroTitle}>Hiring Recorded On-Chain</Text>
                    <Text style={styles.statusHeroSub}>Institutional Recruitment Decision</Text>
                  </>
                ) : isAttested ? (
                  <>
                    <Ionicons name="shield-checkmark" size={32} color="#10b981" />
                    <Text style={styles.statusHeroTitle}>On-Chain Verified</Text>
                    <Text style={styles.statusHeroSub}>This experience has been cryptographically confirmed by a third party.</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="person-outline" size={32} color="#64748b" />
                    <Text style={[styles.statusHeroTitle, { color: '#94a3b8' }]}>Self-Claimed</Text>
                    <Text style={styles.statusHeroSub}>Information provided directly by the candidate.</Text>
                  </>
                )}
              </View>
            </View>

            {/* Core Info */}
            <View style={styles.coreInfoSection}>
              <Text style={styles.sectionLabel}>POSITION</Text>
              <Text style={styles.mainTitle}>
                {work?.role} <Text style={styles.atText}>at</Text> <Text style={styles.orgText}>{work?.org}</Text>
              </Text>
              <Text style={styles.descriptionText}>{work?.description}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.sectionLabel}>TIME PERIOD</Text>
                  <View style={styles.metaValRow}>
                    <Ionicons name="calendar-outline" size={14} color="#10b981" />
                    <Text style={styles.metaValText}>
                      {work?.startDate ? new Date(work.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} – {work?.endDate ? new Date(work.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                    </Text>
                  </View>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.sectionLabel}>WORK TYPE</Text>
                  <View style={styles.metaValRow}>
                    <View style={styles.typeDot} />
                    <Text style={styles.metaValText}>{work?.workType || 'Freelance'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Verification Details */}
            {isAttested && (
              <View style={styles.verificationSection}>
                <Text style={styles.sectionLabel}>
                  {work?.attestationType === 'Hiring Proof' ? 'VERIFIED RECRUITER' : 'CONFIRMED BY'}
                </Text>
                
                <View style={styles.attesterCard}>
                  {work.attesterAvatar ? (
                    <Image source={{ uri: work.attesterAvatar }} style={styles.attesterAvatar} />
                  ) : (
                    <View style={styles.attesterAvatarPlaceholder}>
                      <Text style={{ color: '#fff', fontSize: 14 }}>👤</Text>
                    </View>
                  )}
                  <View style={styles.attesterInfo}>
                    <View style={styles.attesterHeaderRow}>
                      <TouchableOpacity 
                        style={styles.attesterLink}
                        onPress={() => work.attesterWallet && Linking.openURL(`https://chainvolio.xyz/cv/${work.attesterWallet}`)}
                      >
                         <Text style={styles.attesterName}>
                            {work.attestationType === "Hiring Proof" && work.attesterName === "Anonymous" 
                              ? "Verified Recruiter" 
                              : work.attesterName}
                         </Text>
                         <Ionicons name="open-outline" size={12} color="rgba(148, 163, 184, 0.4)" />
                      </TouchableOpacity>
                      
                      {work.isAttesterVerified && (
                        <View style={styles.attesterVerifiedBadge}>
                          <Ionicons name="shield-checkmark" size={10} color="#10b981" />
                          <Text style={styles.attesterVerifiedText}>
                            {getVerificationLabel(work.attesterVerificationType).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.attesterTitle}>
                      {work?.attesterRole}
                      {work?.attesterOrg && ` at ${work.attesterOrg}`}
                    </Text>
                  </View>
                </View>

                {work.attesterComment && (
                  <View style={styles.commentBox}>
                    <Text style={styles.quoteMarkLeft}>"</Text>
                    <Text style={styles.commentText}>{work.attesterComment}</Text>
                    <Text style={styles.quoteMarkRight}>"</Text>
                  </View>
                )}

                <View style={styles.detailsGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>ATTESTATION TYPE</Text>
                    <Text style={styles.gridValEmerald}>{work?.attestationType}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>CONFIDENCE LEVEL</Text>
                    <Text style={styles.gridValEmerald}>{work?.confidence || "Confirmed"}</Text>
                  </View>
                  <View style={[styles.gridItem, { width: '100%', marginTop: 12 }]}>
                    <Text style={styles.gridLabel}>WALLET ADDRESS</Text>
                    <Text style={styles.gridValMono}>{work?.attesterWallet || "Anchored On-Chain"}</Text>
                  </View>
                  <View style={[styles.gridItem, { marginTop: 12 }]}>
                    <Text style={styles.gridLabel}>TIMESTAMP</Text>
                    <Text style={styles.gridVal}>
                      {work?.attesterAt ? new Date(work.attesterAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Dec 2023'}
                    </Text>
                  </View>
                  <View style={[styles.gridItem, { marginTop: 12 }]}>
                    <Text style={styles.gridLabel}>NETWORK</Text>
                    <View style={styles.networkRow}>
                      <View style={styles.networkDot} />
                      <Text style={styles.gridVal}>Solana Mainnet</Text>
                    </View>
                  </View>
                  <View style={[styles.gridItem, { width: '100%', marginTop: 12 }]}>
                    <Text style={styles.gridLabel}>TECHNICAL PROOF</Text>
                    <Text style={styles.gridValMono} numberOfLines={1}>
                      {work.txSignature ? `TX: ${work.txSignature.slice(0, 16)}...` : work.attesterSignature ? `SIG: ${work.attesterSignature.slice(0, 16)}...` : "ANALYTIC_PROOF_V1"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Evidence Link Section (if not attested) */}
            {!isAttested && work.evidenceLinks?.length > 0 && (
              <View style={styles.evidenceSection}>
                <Text style={styles.sectionLabel}>SUPPORTING EVIDENCE</Text>
                {work.evidenceLinks.map((link: any, idx: number) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={styles.evidenceLinkCard}
                    onPress={() => Linking.openURL(link.url)}
                  >
                    <View style={styles.evidenceLinkLeft}>
                      <Ionicons name="link-outline" size={16} color="#10b981" />
                      <Text style={styles.evidenceLinkLabel}>{link.label}</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#475569" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.actionBtnRow}>
              {work.txSignature && (
                <TouchableOpacity 
                  style={styles.primaryActionBtn}
                  onPress={() => Linking.openURL(`https://solscan.io/tx/${work.txSignature}`)}
                >
                  <Ionicons name="globe-outline" size={18} color="#fff" />
                  <Text style={styles.primaryActionText}>View Proof</Text>
                  <Ionicons name="open-outline" size={12} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}

              {work.attestationId ? (
                <TouchableOpacity 
                  style={[styles.secondaryActionBtn, !work.txSignature && { flex: 1 }]}
                  onPress={() => {
                    onClose();
                    navigation.navigate('Memo', { id: work.attestationId });
                  }}
                >
                  <Ionicons name="document-text-outline" size={18} color="#fff" />
                  <Text style={styles.secondaryActionText}>View Memo</Text>
                </TouchableOpacity>
              ) : work.attestationType === "Hiring Proof" && (
                <View style={styles.syncPendingBox}>
                   <Text style={styles.syncPendingText}>Memo Pending Sync</Text>
                </View>
              )}
            </View>

            <Text style={styles.footerNote}>Verified by decentralized cryptographic attestation.</Text>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { 
    height: height * 0.92, 
    backgroundColor: '#0f172a', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.1)' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  closeBtn: { padding: 4 },
  modalBody: { flex: 1, padding: 24 },
  statusHero: { 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 30 
  },
  statusHeroContent: { alignItems: 'center', gap: 8 },
  statusHeroTitle: { color: '#10b981', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  statusHeroSub: { 
    color: 'rgba(148, 163, 184, 0.7)', 
    fontSize: 11, 
    fontWeight: '500', 
    textAlign: 'center', 
    lineHeight: 16,
    maxWidth: 280
  },
  coreInfoSection: { marginBottom: 35 },
  sectionLabel: { 
    color: '#64748b', 
    fontSize: 9, 
    fontWeight: '900', 
    letterSpacing: 1.5, 
    marginBottom: 8 
  },
  mainTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
  atText: { color: '#64748b', fontWeight: '500', fontSize: 18 },
  orgText: { color: '#10b981' },
  descriptionText: { 
    color: '#94a3b8', 
    fontSize: 14, 
    fontWeight: '500', 
    lineHeight: 22, 
    marginTop: 12 
  },
  metaRow: { flexDirection: 'row', gap: 20, marginTop: 25 },
  metaItem: { flex: 1 },
  metaValRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaValText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  typeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  verificationSection: { 
    paddingTop: 30, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.05)',
    marginBottom: 35
  },
  attesterCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 16, 
    backgroundColor: 'rgba(30,41,59,0.5)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)', 
    marginBottom: 20 
  },
  attesterAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#334155' },
  attesterAvatarPlaceholder: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#334155', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  attesterInfo: { marginLeft: 14, flex: 1 },
  attesterHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  attesterLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  attesterName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  attesterVerifiedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 100, 
    backgroundColor: 'rgba(16,185,129,0.1)', 
    borderWidth: 1, 
    borderColor: 'rgba(16,185,129,0.2)' 
  },
  attesterVerifiedText: { color: '#10b981', fontSize: 8, fontWeight: '900' },
  attesterTitle: { color: '#64748b', fontSize: 12, fontWeight: '500', marginTop: 2 },
  commentBox: { 
    padding: 20, 
    borderRadius: 20, 
    backgroundColor: 'rgba(16,185,129,0.03)', 
    borderWidth: 1, 
    borderColor: 'rgba(16,185,129,0.1)', 
    marginBottom: 25,
    position: 'relative'
  },
  commentText: { color: '#cbd5e1', fontSize: 14, fontStyle: 'italic', lineHeight: 22 },
  quoteMarkLeft: { 
    position: 'absolute', 
    top: -5, 
    left: 8, 
    fontSize: 40, 
    color: 'rgba(16,185,129,0.2)', 
    fontFamily: 'serif' 
  },
  quoteMarkRight: { 
    position: 'absolute', 
    bottom: -30, 
    right: 8, 
    fontSize: 40, 
    color: 'rgba(16,185,129,0.2)', 
    fontFamily: 'serif' 
  },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 20, columnGap: 24 },
  gridItem: { width: '46%' },
  gridLabel: { 
    color: '#64748b', 
    fontSize: 8, 
    fontWeight: '900', 
    letterSpacing: 1.2, 
    marginBottom: 6 
  },
  gridValEmerald: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  gridVal: { color: '#cbd5e1', fontSize: 11, fontWeight: '700' },
  gridValMono: { color: '#64748b', fontSize: 10, fontWeight: '500' },
  networkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  networkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#14F195' },
  evidenceSection: {
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    marginBottom: 35
  },
  evidenceLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(30,41,59,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10
  },
  evidenceLinkLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  evidenceLinkLabel: { color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
  actionBtnRow: { flexDirection: 'row', gap: 12, marginTop: 40 },
  primaryActionBtn: { 
    flex: 1, 
    height: 55, 
    borderRadius: 16, 
    backgroundColor: '#059669', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10,
    elevation: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  primaryActionText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  secondaryActionBtn: { 
    flex: 1, 
    height: 55, 
    borderRadius: 16, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10 
  },
  secondaryActionText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  syncPendingBox: { 
    flex: 1, 
    height: 55, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderStyle: 'dashed', 
    borderColor: '#334155', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(30,41,59,0.3)' 
  },
  syncPendingText: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  footerNote: { 
    color: '#475569', 
    fontSize: 9, 
    fontWeight: '500', 
    textAlign: 'center', 
    marginTop: 25 
  },
});

export default WorkVerificationModal;
