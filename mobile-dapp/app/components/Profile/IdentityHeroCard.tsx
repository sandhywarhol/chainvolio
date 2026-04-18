import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Easing
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface HeroCardProps {
  profile: any;
  scoreData: any;
  onScorePress?: () => void;
}

const IdentityHeroCard = ({ profile, scoreData, onScorePress }: HeroCardProps) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  const getVerificationColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'org': case 'company': case 'organization': return '#f59e0b'; // Amber
      case 'figure': case 'public figure': return '#ec4899'; // Pink
      case 'builder': return '#10b981'; // Emerald
      case 'community': case 'dao': return '#3b82f6'; // Blue
      default: return '#10b981';
    }
  };

  const vColor = getVerificationColor(profile?.verificationType);

  return (
    <View style={styles.container}>
      {/* 1. Background Layers */}
      {/* Silver gradient border simulation */}
      <View style={styles.silverBorder} />
      
      {/* Dark inner background */}
      <View style={styles.innerBg}>
        {/* Glow accents */}
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
      </View>

      {/* 2. Shimmer Effect */}
      <Animated.View 
        style={[
          styles.shimmer, 
          { transform: [{ translateX: shimmerTranslateX }, { rotate: '25deg' }] }
        ]} 
      />

      {/* 3. Top Right Section */}
      <View style={styles.topRightActions}>
        {profile?.isVerified && (
          <View style={styles.rosetteContainer}>
            <View style={[styles.rosetteOuter, { borderColor: vColor + '40' }]}>
              <MaterialCommunityIcons name="seal-variant" size={20} color={vColor} />
              <Ionicons name="checkmark" size={10} color={vColor} style={styles.rosetteCheck} />
            </View>
          </View>
        )}

        {scoreData && (
          <TouchableOpacity style={styles.scoreBtn} onPress={onScorePress}>
            <Text style={styles.scoreVal}>{scoreData.score}</Text>
            <Text style={styles.scoreLabel}>CV SCORE</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 4. Center Content */}
      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarBorder}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
            )}
          </View>
          
          {/* Badge Overlays */}
          <View style={styles.badgeOverlayRow}>
             <View style={[styles.miniBadge, { backgroundColor: '#000', borderColor: vColor + '50' }]}>
                <Ionicons name="shield-checkmark" size={10} color={vColor} />
             </View>
             <View style={[styles.miniBadge, { backgroundColor: '#000', borderColor: '#10b98150' }]}>
                <Ionicons name="ribbon" size={10} color="#10b981" />
             </View>
          </View>
        </View>

        {/* Identity */}
        <Text style={styles.name}>{profile?.displayName || 'Anonymous'}</Text>
        <Text style={styles.role}>
          {profile?.role || 'Builder'} 
          {profile?.organization && <Text style={styles.orgText}> at {profile.organization}</Text>}
        </Text>

        {/* Trust & Completion Badges */}
        <View style={styles.statusRow}>
           {profile?.isVerified && (
             <View style={[styles.statusBadge, { backgroundColor: vColor + '15', borderColor: vColor + '30' }]}>
               <Ionicons name="shield-half" size={10} color={vColor} />
               <Text style={[styles.statusBadgeText, { color: vColor }]}>
                 {profile.verificationType?.toUpperCase() || 'VERIFIED'}
               </Text>
             </View>
           )}
           <View style={[styles.statusBadge, { backgroundColor: '#10b98115', borderColor: '#10b98130' }]}>
             <Ionicons name="checkmark-circle" size={10} color="#10b981" />
             <Text style={[styles.statusBadgeText, { color: '#10b981' }]}>PROFILE COMPLETE</Text>
           </View>
        </View>

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>5+</Text>
            <Text style={styles.metricLabel}>EXP YEARS</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{profile?.receiptCount || '0'}</Text>
            <Text style={styles.metricLabel}>PROOFS</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>12</Text>
            <Text style={styles.metricLabel}>COMMUNITY</Text>
          </View>
        </View>

        {/* Social Icons Row */}
        <View style={styles.socialRow}>
          {[
            { key: 'twitter', icon: 'logo-twitter' },
            { key: 'github', icon: 'logo-github' },
            { key: 'linkedin', icon: 'logo-linkedin' },
            { key: 'telegram', icon: 'send', provider: 'Ionicons' },
            { key: 'discord', icon: 'logo-discord' },
            { key: 'instagram', icon: 'logo-instagram' },
            { key: 'website', icon: 'globe-outline' }
          ].map((s) => {
            if (!profile?.[s.key]) return null;
            return (
              <TouchableOpacity key={s.key} style={styles.socialBtn}>
                {s.provider === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons name={s.icon as any} size={18} color="rgba(255,255,255,0.6)" />
                ) : (
                  <Ionicons name={s.icon as any} size={18} color="rgba(255,255,255,0.6)" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Finishing touches: Corner sparkles */}
      <View style={[styles.sparkle, { top: 12, left: 12 }]} />
      <View style={[styles.sparkle, { bottom: 12, right: 12 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 420,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0a0a0f',
    position: 'relative',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)', // slate-400
  },
  silverBorder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
  },
  innerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  topGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  shimmer: {
    position: 'absolute',
    top: -100,
    left: 0,
    width: 40,
    height: '200%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1,
  },
  topRightActions: {
    position: 'absolute',
    top: 20,
    right: 20,
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  rosetteContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosetteOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosetteCheck: {
    position: 'absolute',
    top: 14,
    left: 15,
  },
  scoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  scoreVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#a855f7',
  },
  scoreLabel: {
    fontSize: 6,
    fontWeight: '900',
    color: 'rgba(168, 85, 247, 0.8)',
    marginTop: -2,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#1e293b',
    padding: 2,
    backgroundColor: '#0f172a',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  badgeOverlayRow: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  miniBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  role: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  orgText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#475569',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignSelf: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 20,
  },
  socialBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default IdentityHeroCard;
