import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  ActivityIndicator,
  Image,
  RefreshControl,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useWallet } from '../context/WalletContext';
import { getDashboardStats, updateProfile, getWalletReceipts } from '../services/api';

const ProfileScreen = ({ navigation }: any) => {
  const { walletAddress, disconnect } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  
  // FORM STATE
  const [form, setForm] = useState<any>({});

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [walletAddress])
  );

  const fetchData = async (isRefresh = false) => {
    if (!walletAddress) return;
    if (!isRefresh) setLoading(true);
    
    // Safety timeout to prevent "stuck on sync"
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setRefreshing(false);
        console.warn('Sync timeout reached');
      }
    }, 10000);

    try {
      const [stats, recs] = await Promise.all([
        getDashboardStats(walletAddress),
        getWalletReceipts(walletAddress)
      ]);
      
      const prof = stats.profile;
      setProfile(prof);
      setCertificates(stats.certificates || []);
      setReceipts(recs?.receipts || []);
      
      if (prof) {
        setForm({ ...prof });
      }
    } catch (error) {
      console.error('Core sync error:', error);
      Alert.alert('Sync Delay', 'The database is taking longer than expected to respond. Please check your connection.');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleUpdateProfile = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      await updateProfile(walletAddress, form);
      setIsEditModalOpen(false);
      fetchData(true);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Update Failed', 'Your changes could not be saved to the database.');
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>SYNCING IDENTITY...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} tintColor="#10b981" />}
      >
        
        {/* IDENTITY MANAGEMENT CARD */}
        <View style={styles.card}>
          <View style={styles.identityHeader}>
            <View style={styles.avatarContainer}>
               {profile?.avatarUrl ? (
                 <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
               ) : (
                 <View style={styles.avatarPlaceholder}><Text style={styles.avatarLetter}>{profile?.displayName?.[0] || '?'}</Text></View>
               )}
            </View>
            <View style={styles.headerActions}>
               <TouchableOpacity style={styles.actionCircle} onPress={() => setIsEditModalOpen(true)}><Ionicons name="settings" size={16} color="#10b981" /></TouchableOpacity>
               <TouchableOpacity style={[styles.actionCircle, { marginLeft: 10 }]} onPress={() => disconnect()}><Ionicons name="log-out" size={16} color="#ff4444" /></TouchableOpacity>
            </View>
          </View>

          <View style={styles.idInfo}>
             <Text style={styles.displayName}>{profile?.displayName || 'Anonymous User'}</Text>
             {profile?.role && <Text style={styles.roleText}>{profile.role} {profile.organization && <Text style={{color: '#333'}}>@ {profile.organization}</Text>}</Text>}
             <View style={styles.badgeRow}>
                <View style={styles.idBadge}><Text style={styles.idBadgeText}>#{profile?.cardNumber || '0000'}</Text></View>
                {profile?.isVerified && <View style={styles.verifiedBadge}><Ionicons name="shield-checkmark" size={10} color="#10b981" /><Text style={styles.verifiedText}>VERIFIED</Text></View>}
             </View>
          </View>
          
          <TouchableOpacity style={styles.editFullBtn} onPress={() => setIsEditModalOpen(true)}>
             <Text style={styles.editFullText}>Edit Profile Details</Text>
          </TouchableOpacity>
        </View>

        {/* IDENTITY METRICS */}
        <View style={styles.statsRow}>
           <View style={styles.statBox}><Text style={styles.statVal}>{receipts.length}</Text><Text style={styles.statLabel}>PROOFS</Text></View>
           <View style={styles.statBox}><Text style={styles.statVal}>{profile?.attestationUsed || 0}</Text><Text style={styles.statLabel}>IMPACT</Text></View>
           <View style={styles.statBox}><Text style={styles.statVal}>{profile?.completionPercentage || 0}%</Text><Text style={styles.statLabel}>COMPLETE</Text></View>
        </View>

        {/* FOOTPRINT & CONTACT */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>CONTACT & FOOTPRINT</Text>
           <View style={styles.infoGrid}>
              {profile?.email && <View style={styles.infoItem}><Ionicons name="mail" size={14} color="#555" /><Text style={styles.infoVal}>{profile.email}</Text></View>}
              {profile?.twitter && <View style={styles.infoItem}><Ionicons name="logo-twitter" size={14} color="#555" /><Text style={styles.infoVal}>@{profile.twitter}</Text></View>}
              {profile?.discord && <View style={styles.infoItem}><Ionicons name="logo-discord" size={14} color="#555" /><Text style={styles.infoVal}>{profile.discord}</Text></View>}
              {profile?.instagram && <View style={styles.infoItem}><Ionicons name="logo-instagram" size={14} color="#555" /><Text style={styles.infoVal}>@{profile.instagram}</Text></View>}
           </View>
        </View>

        {/* VERIFIED CERTIFICATES */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>PROFESSIONAL CERTIFICATES</Text>
           {certificates.length === 0 ? <Text style={styles.emptyHint}>No certificates linked.</Text> : (
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.certScroll}>
               {certificates.map((c, i) => (
                 <View key={i} style={styles.certCard}>
                    <Ionicons name="ribbon" size={20} color="#10b981" />
                    <Text style={styles.certTitle} numberOfLines={1}>{c.title}</Text>
                    <Text style={styles.certIssuer}>{c.issuer}</Text>
                 </View>
               ))}
             </ScrollView>
           )}
        </View>

      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Update Identity</Text>
                  <TouchableOpacity onPress={() => setIsEditModalOpen(false)}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
               </View>
               <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                 <Text style={styles.formGroupLabel}>CORE IDENTITY</Text>
                 <TextInput style={styles.input} value={form.displayName} onChangeText={v => handleUpdateField('displayName', v)} placeholder="Display Name" placeholderTextColor="#333" />
                 <TextInput style={styles.input} value={form.role} onChangeText={v => handleUpdateField('role', v)} placeholder="Professional Role" placeholderTextColor="#333" />
                 <TextInput style={styles.input} value={form.organization} onChangeText={v => handleUpdateField('organization', v)} placeholder="Organization" placeholderTextColor="#333" />
                 
                 <Text style={styles.formGroupLabel}>SUMMARY</Text>
                 <TextInput style={[styles.input, { height: 100 }]} value={form.bio} onChangeText={v => handleUpdateField('bio', v)} placeholder="Professional Bio" multiline placeholderTextColor="#333" />
                 
                 <Text style={styles.formGroupLabel}>CONTACT CHANNELS</Text>
                 <TextInput style={styles.input} value={form.email} onChangeText={v => handleUpdateField('email', v)} placeholder="Email Address" placeholderTextColor="#333" />
                 <TextInput style={styles.input} value={form.twitter} onChangeText={v => handleUpdateField('twitter', v)} placeholder="Twitter / X" placeholderTextColor="#333" />
                 <TextInput style={styles.input} value={form.discord} onChangeText={v => handleUpdateField('discord', v)} placeholder="Discord Handle" placeholderTextColor="#333" />
                 <TextInput style={styles.input} value={form.instagram} onChangeText={v => handleUpdateField('instagram', v)} placeholder="Instagram" placeholderTextColor="#333" />

                 <Text style={styles.formGroupLabel}>REGIONAL & SEARCH</Text>
                 <TextInput style={styles.input} value={form.country} onChangeText={v => handleUpdateField('country', v)} placeholder="Country" placeholderTextColor="#333" />
                 <TextInput style={styles.input} value={form.lookingFor} onChangeText={v => handleUpdateField('lookingFor', v)} placeholder="e.g. Open to work" placeholderTextColor="#333" />

                 <TouchableOpacity style={styles.saveAction} onPress={handleUpdateProfile}>
                    <Text style={styles.saveActionText}>Apply Updates</Text>
                 </TouchableOpacity>
                 <View style={{ height: 40 }} />
               </ScrollView>
            </View>
         </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#333', fontSize: 10, marginTop: 20, fontWeight: '900', letterSpacing: 2 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  card: { backgroundColor: '#050505', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#111', marginBottom: 24 },
  identityHeader: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, position: 'relative' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#111', borderWidth: 2, borderColor: '#222', padding: 2 },
  avatarImg: { width: '100%', height: '100%', borderRadius: 40 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  headerActions: { position: 'absolute', right: 0, top: 0, flexDirection: 'row' },
  actionCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#222', alignItems: 'center', justifyContent: 'center' },
  idInfo: { alignItems: 'center', marginBottom: 20 },
  displayName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  roleText: { color: '#10b981', fontSize: 13, fontWeight: '600', marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  idBadge: { backgroundColor: '#0a0a0a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#111' },
  idBadgeText: { color: '#444', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  verifiedBadge: { backgroundColor: '#10b98115', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { color: '#10b981', fontSize: 9, fontWeight: '900' },
  editFullBtn: { width: '100%', height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#111', alignItems: 'center', justifyContent: 'center' },
  editFullText: { color: '#555', fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  statBox: { flex: 1, height: 75, backgroundColor: '#050505', borderRadius: 16, borderWidth: 1, borderColor: '#111', alignItems: 'center', justifyContent: 'center' },
  statVal: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#333', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { color: '#222', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 16 },
  infoGrid: { gap: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoVal: { color: '#888', fontSize: 14 },
  emptyHint: { color: '#222', fontSize: 12, fontStyle: 'italic' },
  certScroll: { gap: 12, paddingRight: 20 },
  certCard: { width: 160, backgroundColor: '#050505', borderRadius: 16, borderWidth: 1, borderColor: '#111', padding: 16, gap: 8 },
  certTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  certIssuer: { color: '#444', fontSize: 10, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#080808', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '85%', borderTopWidth: 1, borderTopColor: '#222' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalScroll: { flex: 1 },
  formGroupLabel: { color: '#222', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginTop: 24, marginBottom: 12 },
  input: { backgroundColor: '#050505', borderWidth: 1, borderColor: '#111', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, marginBottom: 12 },
  saveAction: { backgroundColor: '#10b981', height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  saveActionText: { color: '#000', fontSize: 16, fontWeight: '900' }
});

export default ProfileScreen;
