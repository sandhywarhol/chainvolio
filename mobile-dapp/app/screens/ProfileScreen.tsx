import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Image,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useWallet } from '../context/WalletContext';
import { getDashboardStats, updateProfile, uploadAvatar, getWalletScore } from '../services/api';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
  const { walletAddress, disconnect } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  const [form, setForm] = useState<any>({
    displayName: '',
    bio: '',
    skills: '',
    twitter: '',
    github: '',
    website: '',
    discord: '',
    whatsapp: '',
    email: '',
    country: '',
    avatarUrl: '',
    lookingFor: '',
    timezone: '',
    workPreference: [],
    telegram: '',
    linkedin: '',
    instagram: '',
    role: '',
    organization: '',
  });

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [walletAddress])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.02, 0.1]
  });

  const fetchData = async (isRefresh = false) => {
    if (!walletAddress) return;
    if (!isRefresh) setLoading(true);
    
    try {
      const [stats, score] = await Promise.all([
        getDashboardStats(walletAddress),
        getWalletScore(walletAddress)
      ]);
      const prof = stats.profile;
      setProfile(prof);
      setScoreData(score);
      
      if (prof) {
        setForm({
            displayName: prof.displayName || "",
            bio: prof.bio || "",
            skills: prof.skills || "",
            twitter: prof.twitter || "",
            github: prof.github || "",
            website: prof.website || "",
            discord: prof.discord || "",
            whatsapp: prof.whatsapp || "",
            email: prof.email || "",
            country: prof.country || "",
            avatarUrl: prof.avatarUrl || "",
            lookingFor: prof.lookingFor || "",
            timezone: prof.timezone || "",
            workPreference: Array.isArray(prof.workPreference) ? prof.workPreference : [],
            telegram: prof.telegram || "",
            linkedin: prof.linkedin || "",
            instagram: prof.instagram || "",
            role: prof.role || "",
            organization: prof.organization || "",
        });
      }
    } catch (error) {
      console.error('Profile sync error:', error);
      Alert.alert('Network Delay', 'Could not sync with the database. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && walletAddress) {
      setIsUploading(true);
      try {
        const permanentUrl = await uploadAvatar(result.assets[0].uri, walletAddress);
        handleUpdateField('avatarUrl', permanentUrl);
        Alert.alert('Cloud Sync', 'Avatar uploaded and synced with your professional profile.');
      } catch (err) {
        Alert.alert('Upload Error', 'Failed to store image on servers.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUpdateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const toggleWorkPreference = (type: string) => {
    const current = [...(form.workPreference || [])];
    const index = current.indexOf(type);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(type);
    }
    handleUpdateField('workPreference', current);
  };

  const handleUpdateProfile = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      await updateProfile(walletAddress, form);
      Alert.alert('Success', 'Profile identity updated successfully.');
      fetchData(true);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Update Failed', 'Changes could not be saved to your on-chain identity.');
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>RESOLVING IDENTITY...</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" />
      
      {/* AMBIENT LIGHT SOURCES */}
      <Animated.View style={[styles.glowLeft, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.glowRight, { opacity: glowOpacity }]} />

      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{isEditing ? 'Identity Editor' : 'Professional Identity'}</Text>
                <Text style={styles.headerSub}>{isEditing ? 'Syncing changes to trust layer' : 'Your verifiable persona'}</Text>
            </View>
            <TouchableOpacity style={[styles.editModeBtn, isEditing && styles.editModeBtnActive]} onPress={() => setIsEditing(!isEditing)}>
                <Ionicons name={isEditing ? "eye-outline" : "create-outline"} size={22} color={isEditing ? "#1f2937" : "#1f2937"} />
            </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => { setRefreshing(true); fetchData(true); }} 
                tintColor="#1f2937" 
            />
          }
        >
          <View style={styles.editorContent}>
             <View style={styles.avatarSection}>
                <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} disabled={isUploading}>
                   {isUploading ? <ActivityIndicator size="small" color="#1f2937" /> : (
                     form.avatarUrl ? <Image source={{ uri: form.avatarUrl }} style={styles.avatarImg} /> : (
                       <View style={styles.avatarPlaceholder}><Text style={styles.avatarLetter}>{form.displayName?.[0] || '?'}</Text></View>
                     )
                   )}
                   <View style={styles.editBadge}><Ionicons name="camera" size={14} color="#fff" /></View>
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                   <Text style={styles.walletAddr}>{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}</Text>
                   <Text style={styles.identityLabel}>IDENTITY MANAGEMENT</Text>
                </View>
             </View>

             <View style={styles.formSection}>
                <Text style={styles.groupLabel}>PERSONAL INFORMATION</Text>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
                    <TextInput style={styles.input} value={form.displayName} onChangeText={v => handleUpdateField('displayName', v)} placeholder="Pseudonym or Real Name" placeholderTextColor="#9ca3af" />
                </View>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>PROFESSIONAL BIO</Text>
                    <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={form.bio} onChangeText={v => handleUpdateField('bio', v)} multiline placeholder="Career highlights..." placeholderTextColor="#9ca3af" />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.groupLabel}>PROFESSIONAL INFORMATION</Text>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>CURRENT ROLE</Text>
                    <TextInput style={styles.input} value={form.role} onChangeText={v => handleUpdateField('role', v)} placeholder="Lead Dev" placeholderTextColor="#9ca3af" />
                </View>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>ORGANIZATION</Text>
                    <TextInput style={styles.input} value={form.organization} onChangeText={v => handleUpdateField('organization', v)} placeholder="Trust Org" placeholderTextColor="#9ca3af" />
                </View>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>CORE SKILLS</Text>
                    <TextInput style={styles.input} value={form.skills} onChangeText={v => handleUpdateField('skills', v)} placeholder="Rust, Next.js, Solana..." placeholderTextColor="#9ca3af" />
                </View>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>COUNTRY</Text>
                    <TextInput style={styles.input} value={form.country} onChangeText={v => handleUpdateField('country', v)} placeholder="Global" placeholderTextColor="#9ca3af" />
                </View>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>TIMEZONE</Text>
                    <TextInput style={styles.input} value={form.timezone} onChangeText={v => handleUpdateField('timezone', v)} placeholder="UTC" placeholderTextColor="#9ca3af" />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.groupLabel}>CONTACT & SOCIAL</Text>
                {/* Social Footprint Grid Simplified to Full Width */}
                {[
                  { key: 'twitter', label: 'X / TWITTER', placeholder: '@user' },
                  { key: 'github', label: 'GITHUB', placeholder: 'user' },
                  { key: 'linkedin', label: 'LINKEDIN', placeholder: 'user' },
                  { key: 'telegram', label: 'TELEGRAM', placeholder: '@user' },
                  { key: 'discord', label: 'DISCORD', placeholder: 'user' },
                  { key: 'instagram', label: 'INSTAGRAM', placeholder: '@user' },
                ].map(s => (
                  <View key={s.key} style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>{s.label}</Text>
                    <TextInput style={styles.input} value={form[s.key]} onChangeText={v => handleUpdateField(s.key, v)} placeholder={s.placeholder} placeholderTextColor="#9ca3af" />
                  </View>
                ))}
                
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>WHATSAPP</Text>
                    <TextInput style={styles.input} value={form.whatsapp} onChangeText={v => handleUpdateField('whatsapp', v)} placeholder="+..." placeholderTextColor="#9ca3af" />
                </View>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>EMAIL</Text>
                    <TextInput style={styles.input} value={form.email} onChangeText={v => handleUpdateField('email', v)} placeholder="me@..." placeholderTextColor="#9ca3af" />
                </View>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>WEBSITE</Text>
                    <TextInput style={styles.input} value={form.website} onChangeText={v => handleUpdateField('website', v)} placeholder="https://..." placeholderTextColor="#9ca3af" />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.groupLabel}>CAREER GOALS</Text>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>LOOKING FOR</Text>
                    <TextInput style={styles.input} value={form.lookingFor} onChangeText={v => handleUpdateField('lookingFor', v.slice(0, 160))} placeholder="Open to roles..." placeholderTextColor="#9ca3af" />
                    <Text style={styles.charCount}>{form.lookingFor?.length || 0}/160</Text>
                </View>
                <View style={styles.inputStack}>
                    <Text style={styles.fieldLabel}>AVAILABILITY</Text>
                    <View style={styles.tagGrid}>
                      {["Full-time", "Contract", "Freelance", "Project-based"].map(t => (
                        <TouchableOpacity key={t} onPress={() => toggleWorkPreference(t)} style={[styles.tag, form.workPreference?.includes(t) && styles.tagActive]}>
                          <Text style={[styles.tagText, form.workPreference?.includes(t) && styles.tagTextActive]}>{t.toUpperCase()}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile}>
                 <LinearGradient colors={['#f97316', '#ea580c']} style={styles.saveGradient}><Text style={styles.saveBtnText}>Save Changes</Text></LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.disconnectBtn} onPress={() => {
                Alert.alert('Disconnect', 'Are you sure you want to exit your professional hub?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Disconnect', onPress: () => { disconnect(); navigation.replace('Welcome'); } }
                ]);
              }}>
                 <Ionicons name="log-out-outline" size={18} color="rgba(31,41,55,0.8)" />
                 <Text style={styles.disconnectText}>Disconnect Session</Text>
              </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#fafafa' },
  container: { flex: 1 },
  glowLeft: {
    position: 'absolute',
    top: height * 0.1,
    left: -width * 0.3,
    width: width,
    height: width,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: width,
  },
  glowRight: {
     position: 'absolute',
     bottom: height * 0.2,
     right: -width * 0.3,
     width: width,
     height: width,
     backgroundColor: 'rgba(59, 130, 246, 0.1)',
     borderRadius: width,
  },
  loadingContainer: { flex: 1, backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#6b7280', fontSize: 10, marginTop: 20,  letterSpacing: 2 },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
  header: { 
    height: 100, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 25
  },
  headerTitle: { color: '#1f2937', fontSize: 22,  },
  headerSub: { color: '#6b7280', fontSize: 11,  marginTop: 2 },
  editModeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  editModeBtnActive: { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' },
  headerInfo: { marginLeft: 20, flex: 1 },
  identityLabel: { color: '#1f2937', fontSize: 8,  letterSpacing: 2, marginTop: 4 },
  
  /* EDITOR STYLES */
  avatarSection: { alignItems: 'center', marginVertical: 30 },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    position: 'relative',
    padding: 3
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 45 },
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: '#e5e7eb', borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#1f2937', fontSize: 32,  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  walletAddr: { color: '#6b7280', fontSize: 10,  marginTop: 12, letterSpacing: 1 },
  
  formSection: { marginBottom: 40 },
  groupLabel: { color: '#1f2937', fontSize: 10,  letterSpacing: 2, marginBottom: 25 },
  inputStack: { marginBottom: 20 },
  fieldLabel: { color: '#6b7280', fontSize: 9,  letterSpacing: 1, marginBottom: 10 },
  input: { 
    backgroundColor: '#f9fafb', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 16, 
    padding: 16, 
    color: '#1f2937', 
    fontSize: 14, 
     
  },
  charCount: { color: '#6b7280', fontSize: 8,  textAlign: 'right', marginTop: 4 },
  
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 10, 
    backgroundColor: '#f9fafb', 
    borderWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  tagActive: { 
    backgroundColor: 'rgba(244, 63, 94, 0.1)', 
    borderColor: 'rgba(244, 63, 94, 0.3)' 
  },
  tagText: { color: '#6b7280', fontSize: 10,  },
  tagTextActive: { color: '#1f2937' },
  
  saveBtn: { marginTop: 20, borderRadius: 18, overflow: 'hidden' },
  saveGradient: { height: 60, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 16,  },
  
  cancelBtn: { marginTop: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: '#6b7280', fontSize: 13,  },
  disconnectBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  disconnectText: {
    color: '#1f2937',
    fontSize: 13,
    
  }
});

export default ProfileScreen;




