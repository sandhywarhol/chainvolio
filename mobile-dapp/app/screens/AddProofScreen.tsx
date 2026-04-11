import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useWallet } from '../context/WalletContext';
import { createReceipt } from '../services/api';

const { width, height } = Dimensions.get('window');

const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Other"];
const COMP_TYPES = ["Paid", "Unpaid", "Token", "Equity", "Other"];

const AddProofScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const [form, setForm] = useState({
    role: '',
    org: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    workType: 'Full-time',
    compensationType: 'Paid',
    impact: [] as string[],
    evidenceLinks: [] as { label: string, url: string }[],
    portfolioImages: [] as string[]
  });

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (form.portfolioImages.length >= 5) {
      Alert.alert('Limit Reached', 'Max 5 portfolio images allowed.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setForm({
        ...form,
        portfolioImages: [...form.portfolioImages, result.assets[0].uri]
      });
    }
  };

  const addImpact = () => {
    Haptics.selectionAsync();
    if (form.impact.length < 5) {
      setForm({ ...form, impact: [...form.impact, ''] });
    }
  };

  const updateImpact = (val: string, index: number) => {
    const newImpact = [...form.impact];
    newImpact[index] = val;
    setForm({ ...form, impact: newImpact });
  };

  const addLink = () => {
    Haptics.selectionAsync();
    setForm({ ...form, evidenceLinks: [...form.evidenceLinks, { label: 'GitHub', url: '' }] });
  };

  const updateLink = (field: 'label' | 'url', val: string, index: number) => {
    const newLinks = [...form.evidenceLinks];
    newLinks[index][field] = val;
    setForm({ ...form, evidenceLinks: newLinks });
  };

  const handleAddProof = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (!walletAddress || !form.description) {
      Alert.alert('Missing Fields', 'Description is required to anchor a proof.');
      return;
    }

    Alert.alert(
      'Secure Permanent Proof?',
      'Once anchored, core work details (Role, Organization, Dates) will be cryptographically immutable.',
      [
        { text: 'Review', style: 'cancel' },
        { text: 'Verify & Secure', onPress: processSubmission }
      ]
    );
  };

  const processSubmission = async () => {
    setLoading(true);
    try {
      await createReceipt({
        walletAddress,
        ...form,
        status: 'Self-Declared'
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Legacy Secured', 'Your work history has been anchored.', [
        { text: 'View Identity', onPress: () => navigation.navigate('Profile') }
      ]);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sync Error', 'Could not secure proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
               <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <View>
               <Text style={styles.headerTitle}>Physical Proof</Text>
               <Text style={styles.headerSubtitle}>Immutable career legacy</Text>
            </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.fieldGroup}>
                <Text style={styles.sectionLabel}>Role / Job Title (optional)</Text>
                <BlurView intensity={10} tint="dark" style={styles.inputBlur}>
                   <TextInput style={styles.input} value={form.role} onChangeText={v => setForm({...form, role: v})} placeholder="e.g. Smart Contract Developer, Independent Builder" placeholderTextColor="rgba(255,255,255,0.2)" />
                </BlurView>
                <Text style={styles.sectionLabel}>Organization / Project (optional)</Text>
                <BlurView intensity={10} tint="dark" style={styles.inputBlur}>
                   <TextInput style={styles.input} value={form.org} onChangeText={v => setForm({...form, org: v})} placeholder="e.g. Project or company name" placeholderTextColor="rgba(255,255,255,0.2)" />
                </BlurView>
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.sectionLabel}>Duration & Work type *</Text>
                <View style={styles.dateRow}>
                   <TouchableOpacity style={styles.dateSelector} onPress={() => setShowStartPicker(true)}>
                      <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.2)" />
                      <Text style={styles.dateText}>Start: {form.startDate.toLocaleDateString()}</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.dateSelector} onPress={() => setShowEndPicker(true)}>
                      <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.2)" />
                      <Text style={styles.dateText}>End: {form.endDate.toLocaleDateString()}</Text>
                   </TouchableOpacity>
                </View>

                {(showStartPicker || showEndPicker) && (
                   <DateTimePicker
                      value={showStartPicker ? form.startDate : form.endDate}
                      mode="date"
                      display="default"
                      onChange={(e, d) => {
                         if (showStartPicker) { setShowStartPicker(false); if (d) setForm({...form, startDate: d}); }
                         else { setShowEndPicker(false); if (d) setForm({...form, endDate: d}); }
                      }}
                   />
                )}

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                   {WORK_TYPES.map(t => (
                     <TouchableOpacity key={t} style={[styles.pill, form.workType === t && styles.activePill]} onPress={() => { Haptics.selectionAsync(); setForm({...form, workType: t}); }}>
                        <Text style={[styles.pillText, form.workType === t && styles.activePillText]}>{t}</Text>
                     </TouchableOpacity>
                   ))}
                </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.sectionLabel}>Job description *</Text>
                <BlurView intensity={10} tint="dark" style={[styles.inputBlur, { height: 120 }]}>
                   <TextInput style={[styles.input, { height: '100%', paddingTop: 16 }]} value={form.description} onChangeText={v => setForm({...form, description: v})} placeholder="Summary of tasks and contributions" placeholderTextColor="rgba(255,255,255,0.2)" multiline />
                </BlurView>
            </View>

            <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>Impact / Outcomes (optional, max 5)</Text>
                    <TouchableOpacity onPress={addImpact}><Text style={styles.addText}>+ ADD</Text></TouchableOpacity>
                </View>
                {form.impact.map((imp, idx) => (
                    <BlurView key={idx} intensity={10} tint="dark" style={[styles.inputBlur, styles.dynamicRow]}>
                        <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={imp} onChangeText={v => updateImpact(v, idx)} placeholder="e.g. Optimized TPS by 40%" placeholderTextColor="rgba(255,255,255,0.1)" />
                        <TouchableOpacity onPress={() => setForm({...form, impact: form.impact.filter((_, i) => i !== idx)})}><Ionicons name="close-circle" size={18} color="#ff4444" /></TouchableOpacity>
                    </BlurView>
                ))}
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.sectionLabel}>Portfolio Images (optional, max 5)</Text>
                <View style={styles.imageGrid}>
                    {form.portfolioImages.map((uri, idx) => (
                        <View key={idx} style={styles.imageBox}>
                            <Image source={{ uri }} style={styles.fullImg} />
                            <TouchableOpacity style={styles.imgClose} onPress={() => setForm({...form, portfolioImages: form.portfolioImages.filter((_, i) => i !== idx)})}><Ionicons name="close" size={10} color="#fff" /></TouchableOpacity>
                        </View>
                    ))}
                    {form.portfolioImages.length < 5 && (
                        <TouchableOpacity style={styles.addSquare} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={24} color="rgba(255,255,255,0.1)" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>Evidence Links</Text>
                    <TouchableOpacity onPress={addLink}><Text style={styles.addText}>+ LINK</Text></TouchableOpacity>
                </View>
                {form.evidenceLinks.map((lnk, idx) => (
                    <BlurView key={idx} intensity={10} tint="dark" style={[styles.inputBlur, styles.dynamicRow]}>
                        <TextInput style={[styles.input, { width: 80, marginBottom: 0 }]} value={lnk.label} onChangeText={v => updateLink('label', v, idx)} placeholder="Label" placeholderTextColor="rgba(255,255,255,0.1)" />
                        <TextInput style={[styles.input, { flex: 1, marginBottom: 0, marginLeft: 10 }]} value={lnk.url} onChangeText={v => updateLink('url', v, idx)} placeholder="https://..." placeholderTextColor="rgba(255,255,255,0.1)" />
                        <TouchableOpacity onPress={() => setForm({...form, evidenceLinks: form.evidenceLinks.filter((_, i) => i !== idx)})}><Ionicons name="close-circle" size={18} color="#ff4444" /></TouchableOpacity>
                    </BlurView>
                ))}
            </View>

            <TouchableOpacity onPress={handleAddProof} disabled={loading} style={styles.submitOuter}>
                <LinearGradient colors={['#10b981', '#059669']} style={styles.submitInner}>
                    {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>Save Receipt (Self-Declared)</Text>}
                </LinearGradient>
            </TouchableOpacity>


            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#050505' },
  container: { flex: 1 },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, gap: 15 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.02)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'SpaceGrotesk-Bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'Inter-Bold', marginTop: 2 },
  scrollContent: { paddingHorizontal: 25, paddingTop: 20 },
  fieldGroup: { marginBottom: 35 },
  sectionLabel: { color: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: 'Inter-Bold', letterSpacing: 2, marginBottom: 15, marginLeft: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  addText: { color: '#10b981', fontSize: 10, fontFamily: 'Inter-Bold' },
  inputBlur: { borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12, overflow: 'hidden' },
  input: { paddingHorizontal: 16, height: 56, color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  dateSelector: { flex: 1, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 },
  dateText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: 'Inter-Bold' },
  pillScroll: { marginTop: 5 },
  pill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.02)', marginRight: 10, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)' },
  activePill: { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  pillText: { color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'Inter-Bold' },
  activePillText: { color: '#10b981' },
  dynamicRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 15 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  imageBox: { width: 64, height: 64, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  fullImg: { width: '100%', height: '100%' },
  imgClose: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.5)', padding: 3, borderRadius: 8 },
  addSquare: { width: 64, height: 64, borderRadius: 14, borderStyle: 'dashed', borderWidth: 1, borderColor: '#222', alignItems: 'center', justifyContent: 'center' },
  submitOuter: { borderRadius: 20, overflow: 'hidden', marginTop: 10 },
  submitInner: { height: 64, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#000', fontSize: 16, fontFamily: 'SpaceGrotesk-Bold' }
});

export default AddProofScreen;
