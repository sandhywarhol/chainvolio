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
import { LinearGradient } from 'expo-linear-gradient';

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
        <LinearGradient
          colors={['#1f2937', '#111827', '#030712']}
          style={styles.cardBg}
        />
        <View style={styles.cardOverlay} />
        <View style={styles.cardInner}>
          <View style={styles.lookingForBox}>
            <Ionicons name="briefcase-outline" size={10} color="#ffffff" />
            <Text style={styles.lookingForText}>{profile?.lookingFor || 'Founders Mode'}</Text>
          </View>

          <View style={styles.absScore}>
            {profile?.isVerified && (
              <View style={styles.verifiedRosette}>
                <Ionicons name="shield-checkmark" size={14} color="#f97316" />
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
                    <Text style={{ color: '#ffffff', fontSize: 24 }}>👤</Text>
                  </View>
                )}
              </View>
              <View style={styles.sideMeta}>
                <View style={styles.sideMetaRow}>
                  <Ionicons name="location-outline" size={9} color="#9ca3af" />
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
                  <Ionicons name="star" size={8} color="#f97316" />
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
              <FontAwesome5 name="twitter" size={13} color="#6b7280" />
              <FontAwesome5 name="github" size={13} color="#6b7280" />
              <FontAwesome5 name="linkedin" size={13} color="#6b7280" />
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
    backgroundColor: '#374151', // Dark border 
    marginBottom: 25,
    width: '100%',
  },
  cvCardMain: { 
    borderRadius: 23, 
    backgroundColor: '#1f2937', // Dark Grey background
    overflow: 'hidden', 
    padding: 18, 
    paddingBottom: 20 
  },
  cardBg: { ...StyleSheet.absoluteFillObject },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(31, 41, 55, 0.4)' },
  cardInner: { zIndex: 1 },
  lookingForBox: { 
    alignSelf: 'center', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 100, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)', 
    marginBottom: 8 
  },
  lookingForText: { color: '#ffffff', fontSize: 9, fontWeight: '700' },
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
    borderColor: '#f97316', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  scoreOrbit: { 
    alignItems: 'center', 
    backgroundColor: '#111827', 
    padding: 6, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  scoreVal: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  scoreLabel: { 
    color: '#9ca3af', 
    fontSize: 6, 
    fontWeight: '700', 
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
    borderColor: '#4b5563', 
    overflow: 'hidden' 
  },
  cardAvatar: { width: '100%', height: '100%' },
  cardAvatarPlaceholder: { 
    flex: 1, 
    backgroundColor: '#374151', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sideMeta: { gap: 4, marginTop: 8, alignItems: 'center', width: '100%' },
  sideMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sideMetaText: { color: '#9ca3af', fontSize: 8, fontWeight: '600' },
  availLabel: { 
    color: '#6b7280', 
    fontSize: 6, 
    fontWeight: '700', 
    letterSpacing: 1, 
    textAlign: 'center' 
  },
  availPill: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.15)', 
    width: '100%', 
    alignItems: 'center' 
  },
  availPillText: { color: '#ffffff', fontSize: 8, fontWeight: '600' },
  cardRightCol: { flex: 1, paddingRight: 45 },
  identityHeader: { marginBottom: 6 },
  cardName: { color: '#ffffff', fontSize: 20, fontWeight: '600' },
  cardTitle: { color: '#d1d5db', fontSize: 11, fontWeight: '500', marginTop: 1 },
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
  badgeEmer: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' },
  dotEmer: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ffffff' },
  badgeTextEmer: { color: '#ffffff', fontSize: 7, fontWeight: '700' },
  badgeOrange: { backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: 'rgba(249, 115, 22, 0.3)' },
  badgeTextOrange: { color: '#f97316', fontSize: 7, fontWeight: '700' },
  skillsBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 10 },
  skillPill: { 
    paddingHorizontal: 6, 
    paddingVertical: 3, 
    borderRadius: 6, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  skillPillText: { color: '#d1d5db', fontSize: 7, fontWeight: '600' },
  cardBio: { 
    color: '#9ca3af', 
    fontSize: 10, 
    fontWeight: '400', 
    lineHeight: 14, 
    marginTop: 12 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTopWidth: 0.5, 
    borderTopColor: '#374151', 
    paddingTop: 12, 
    marginTop: 20 
  },
  socialIcons: { flexDirection: 'row', gap: 10 },
  cardWalletInfo: { alignItems: 'flex-end', gap: 2 },
  cardWalletAddr: { color: '#6b7280', fontSize: 8, fontWeight: '600' },
  cardId: { color: '#4b5563', fontSize: 8, fontWeight: '600' },
});

export default CVCard;
