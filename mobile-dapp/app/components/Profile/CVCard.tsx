import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CVCardProps {
  profile: any;
  scoreData: any;
  walletAddress: string;
  onScorePress?: () => void;
}

const CVCard = ({ profile, scoreData, walletAddress, onScorePress }: CVCardProps) => {
  return (
    <View style={styles.cvCardBorder}>
      <View style={styles.cvCardMain}>
        <Image 
          source={require('../../../assets/images/card_background.jpeg')} 
          style={styles.cardBg} 
          resizeMode="cover" 
        />
        <View style={styles.cardOverlay} />
        <View style={styles.cardInner}>
          <View style={styles.lookingForBox}>
            <Ionicons name="briefcase-outline" size={10} color="#10b981" />
            <Text style={styles.lookingForText}>{profile?.lookingFor || 'Founders Mode'}</Text>
          </View>

          <View style={styles.absScore}>
            {profile?.isVerified && (
              <View style={styles.verifiedRosette}>
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
              </View>
            )}
            {scoreData && (
              <TouchableOpacity style={styles.scoreOrbit} onPress={onScorePress}>
                <Text style={styles.scoreVal}>{scoreData.score}</Text>
                <Text style={styles.scoreLabel}>CV SCORE</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.cardRow}>
            <View style={styles.cardLeftCol}>
              <View style={styles.cardAvatarFrame}>
                {profile?.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.cardAvatar} />
                ) : (
                  <View style={styles.cardAvatarPlaceholder}>
                    <Text style={{ color: '#fff', fontSize: 24 }}>👤</Text>
                  </View>
                )}
              </View>
              <View style={styles.sideMeta}>
                <View style={styles.sideMetaRow}>
                  <Ionicons name="location-outline" size={9} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.sideMetaText}>{profile?.country || 'Global'}</Text>
                </View>
                <View style={[styles.sideMetaRow, { marginTop: 8 }]}>
                  <Text style={styles.availLabel}>AVAILABILITY</Text>
                </View>
                <View style={styles.availPill}>
                  <Text style={styles.availPillText}>{profile?.workPreference?.[0] || 'Full-time'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardRightCol}>
              <View style={styles.identityHeader}>
                <Text style={styles.cardName} numberOfLines={1}>{profile?.displayName || 'Sandhy Warhol'}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{profile?.role || 'Professional'}</Text>
              </View>
              
              <View style={styles.badgesRow}>
                <View style={[styles.cardBadge, styles.badgeEmer]}>
                  <View style={styles.dotEmer} />
                  <Text style={styles.badgeTextEmer}>BUILDER</Text>
                </View>
                <View style={[styles.cardBadge, styles.badgeOrange]}>
                  <Ionicons name="star" size={8} color="#f59e0b" />
                  <Text style={styles.badgeTextOrange}>GENESIS 100</Text>
                </View>
              </View>

              <View style={styles.skillsBox}>
                {(profile?.skills?.split(',') || []).slice(0, 4).map((s: string, i: number) => (
                  <View key={i} style={styles.skillPill}>
                    <Text style={styles.skillPillText}>{s.trim()}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.cardBio} numberOfLines={3}>
                {profile?.bio || 'Professional bio synced from legacy...'}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.socialIcons}>
              <FontAwesome5 name="twitter" size={13} color="rgba(255,255,255,0.4)" />
              <FontAwesome5 name="github" size={13} color="rgba(255,255,255,0.4)" />
              <FontAwesome5 name="linkedin" size={13} color="rgba(255,255,255,0.4)" />
            </View>
            <View style={styles.cardWalletInfo}>
              <Text style={styles.cardWalletAddr}>
                {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
              </Text>
              <Text style={styles.cardId}>
                #{String(profile?.cardNumber || 0).padStart(5, '0')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cvCardBorder: { 
    borderRadius: 24, 
    padding: 1, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    marginBottom: 25,
    width: '100%',
  },
  cvCardMain: { 
    borderRadius: 23, 
    backgroundColor: '#0f172a', 
    overflow: 'hidden', 
    padding: 18, 
    paddingBottom: 20 
  },
  cardBg: { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.4)' },
  cardInner: { zIndex: 1 },
  lookingForBox: { 
    alignSelf: 'center', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 100, 
    backgroundColor: 'rgba(16,185,129,0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(16,185,129,0.2)', 
    marginBottom: 8 
  },
  lookingForText: { color: '#10b981', fontSize: 9, fontWeight: '900' },
  absScore: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    alignItems: 'center', 
    gap: 6, 
    zIndex: 100 
  },
  verifiedRosette: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: '#10b981', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  scoreOrbit: { 
    alignItems: 'center', 
    backgroundColor: 'rgba(15,23,42,0.8)', 
    padding: 6, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  scoreVal: { color: '#fff', fontSize: 24, fontWeight: '900' },
  scoreLabel: { 
    color: '#a855f7', 
    fontSize: 6, 
    fontWeight: '900', 
    letterSpacing: 1, 
    marginTop: -2 
  },
  cardRow: { flexDirection: 'row', gap: 14 },
  cardLeftCol: { width: 80, alignItems: 'center' },
  cardAvatarFrame: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    borderWidth: 2, 
    borderColor: '#1e293b', 
    overflow: 'hidden' 
  },
  cardAvatar: { width: '100%', height: '100%' },
  cardAvatarPlaceholder: { 
    flex: 1, 
    backgroundColor: '#1e293b', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sideMeta: { gap: 4, marginTop: 8, alignItems: 'center', width: '100%' },
  sideMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sideMetaText: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '700' },
  availLabel: { 
    color: 'rgba(255,255,255,0.15)', 
    fontSize: 6, 
    fontWeight: '900', 
    letterSpacing: 1, 
    textAlign: 'center' 
  },
  availPill: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6, 
    backgroundColor: 'rgba(16,185,129,0.1)', 
    borderWidth: 1, 
    borderColor: 'rgba(16,185,129,0.2)', 
    width: '100%', 
    alignItems: 'center' 
  },
  availPillText: { color: '#10b981', fontSize: 8, fontWeight: '900' },
  cardRightCol: { flex: 1, paddingRight: 45 },
  identityHeader: { marginBottom: 6 },
  cardName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', marginTop: 1 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  cardBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 5, 
    paddingVertical: 2, 
    borderRadius: 4, 
    borderWidth: 1 
  },
  badgeEmer: { backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' },
  dotEmer: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#10b981' },
  badgeTextEmer: { color: '#10b981', fontSize: 7, fontWeight: '900' },
  badgeOrange: { backgroundColor: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' },
  badgeTextOrange: { color: '#f59e0b', fontSize: 7, fontWeight: '900' },
  skillsBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 10 },
  skillPill: { 
    paddingHorizontal: 6, 
    paddingVertical: 3, 
    borderRadius: 6, 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)' 
  },
  skillPillText: { color: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: '900' },
  cardBio: { 
    color: 'rgba(255,255,255,0.6)', 
    fontSize: 10, 
    fontWeight: '500', 
    lineHeight: 14, 
    marginTop: 12 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTopWidth: 0.5, 
    borderTopColor: 'rgba(255,255,255,0.08)', 
    paddingTop: 12, 
    marginTop: 20 
  },
  socialIcons: { flexDirection: 'row', gap: 10 },
  cardWalletInfo: { alignItems: 'flex-end', gap: 2 },
  cardWalletAddr: { color: 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: '700' },
  cardId: { color: 'rgba(255,255,255,0.1)', fontSize: 8, fontWeight: '700' },
});

export default CVCard;
