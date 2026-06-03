import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProofOfWorkCardProps {
  work: any;
  onPress: () => void;
}

const getTierStyles = (type?: string) => {
    const t = (type || "").toLowerCase();
    
    if (t.includes("public") || t.includes("figure")) return {
      label: "Verified Public Figure",
      color: "#f472b6", 
      bg: "rgba(244, 114, 182, 0.1)",
      border: "rgba(244, 114, 182, 0.2)",
      bars: 2
    };
    
    if (t.includes("community") || t.includes("dao")) return {
      label: "Verified Community",
      color: "#60a5fa", 
      bg: "rgba(96, 165, 250, 0.1)",
      border: "rgba(96, 165, 250, 0.2)",
      bars: 3
    };
    
    if (t.includes("company") || t.includes("organization") || t.includes("org")) return {
      label: "Verified Organization",
      color: "#fbbf24", 
      bg: "rgba(251, 191, 36, 0.1)",
      border: "rgba(251, 191, 36, 0.2)",
      bars: 4
    };
    
    return {
      label: "Verified Builder",
      color: "#10b981", 
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.2)",
      bars: 1
    };
};

const ProofOfWorkCard = ({ work, onPress }: ProofOfWorkCardProps) => {
  const isAttested = work.status === 'Attested';
  const tier = getTierStyles(work.verificationTier || work.attesterVerificationType);

  return (
    <TouchableOpacity style={styles.workCard} onPress={onPress}>
      <View style={styles.workCardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.workRole}>{work.role}</Text>
          <Text style={styles.workOrg}>{work.org}</Text>
          <Text style={styles.workMeta}>
            {work.startDate ? new Date(work.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'} - {work.endDate ? new Date(work.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
          </Text>
        </View>
        {isAttested && (
          <View style={styles.attestedTag}>
            <Text style={styles.attestedTagText}>✓ ATTESTED</Text>
          </View>
        )}
      </View>
      <Text style={styles.workDescription} numberOfLines={3}>
        {work.description}
      </Text>

      {isAttested && (
        <View style={styles.attesterFooter}>
           <View style={styles.footerLine} />
           <View style={styles.attesterRow}>
              {work.attesterAvatar ? (
                <Image source={{ uri: work.attesterAvatar }} style={styles.attesterAvatar} />
              ) : (
                <View style={styles.attesterAvatarPlaceholder}>
                   <Ionicons name="person" size={12} color="#9ca3af" />
                </View>
              )}
              <View style={styles.attesterTextCol}>
                 <View style={[styles.attesterNameLabelRow, { justifyContent: 'space-between' }]}>
                    <Text style={[styles.attesterName, { flex: 1 }]} numberOfLines={1}>{work.attesterName || 'Anonymous'}</Text>
                    {(work.isOfficial || work.isAttesterVerified) && (
                        <View style={{ alignItems: 'center', gap: 4 }}>
                            <View style={[styles.tierBadge, { backgroundColor: tier.bg, borderColor: tier.border }]}>
                               <Ionicons name="shield-checkmark" size={8} color={tier.color} />
                               <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 3 }}>
                                {[0, 1, 2, 3].map((i) => (
                                    <View 
                                        key={i} 
                                        style={{ 
                                            width: 10, 
                                            height: 2, 
                                            borderRadius: 1, 
                                            backgroundColor: i < (tier.bars || 1) ? tier.color : '#e5e7eb',
                                        }} 
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                 </View>
                 <Text style={styles.attesterStatusSub}>
                    {work.attesterRole || 'Authority'}
                    {work.attesterOrg ? ` • ${work.attesterOrg}` : ''}
                 </Text>
              </View>
           </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  workCard: { 
    padding: 20, 
    backgroundColor: '#ffffff', 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  workCardTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 14 
  },
  workRole: { color: '#1f2937', fontSize: 17, fontWeight: 'bold' },
  workOrg: { color: '#1f2937', fontSize: 15, fontWeight: '700', marginTop: 4 },
  workMeta: { color: '#6b7280', fontSize: 10, fontWeight: '700', marginTop: 6 },
  attestedTag: { 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8, 
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1, 
    borderColor: 'rgba(244, 63, 94, 0.2)' 
  },
  attestedTagText: { color: '#1f2937', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  workDescription: { 
    color: '#4b5563', 
    fontSize: 13, 
    fontWeight: '500', 
    lineHeight: 20,
    marginBottom: 12
  },
  attesterFooter: { marginTop: 8 },
  footerLine: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 14 },
  attesterRow: { flexDirection: 'row', alignItems: 'center' },
  attesterAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#e5e7eb' },
  attesterAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  attesterTextCol: { marginLeft: 12, flex: 1 },
  attesterNameLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attesterName: { color: '#1f2937', fontSize: 13, fontWeight: 'bold' },
  attesterStatusSub: { color: '#6b7280', fontSize: 10, fontWeight: '500', marginTop: 2 },
  tierBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 100, 
    borderWidth: 1,
  },
  tierText: { fontSize: 7, fontWeight: '900', letterSpacing: 0.3 },
});

export default ProofOfWorkCard;


