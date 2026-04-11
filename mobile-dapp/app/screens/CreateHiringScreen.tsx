import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createHiringCollection } from '../services/api';
import { useWallet } from '../context/WalletContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CreateHiringScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    roleType: 'Full-time',
    workMode: 'Remote',
    experienceLevel: 'Senior',
    compensationType: 'Crypto + Equity',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Info', 'Please provide a job position title.');
      return;
    }
    if (!walletAddress) {
      Alert.alert('Wallet Required', 'Please connect your wallet first.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        ownerWallet: walletAddress,
        visibility: 'public',
        // In a real mobile app, we would add the signed action here
        // matching the desktop's signChainVolioAction
      };
      
      const res = await createHiringCollection(payload);
      const slug = res?.data?.slug || res?.slug;

      if (slug) {
        Alert.alert('Collection Live!', `Your recruitment portal for ${formData.title} is ready.`, [
          { text: 'View Dashboard', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error('API did not return a valid collection link.');
      }
    } catch (error: any) {
      console.error('Hiring creation error:', error);
      Alert.alert('Creation Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const renderSelect = (label: string, value: string, options: string[], field: string) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.optionRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionBtn, value === opt && styles.optionBtnActive]}
            onPress={() => setFormData({ ...formData, [field]: opt })}
          >
            <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Collection</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>JOB POSITION *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Frontend Engineer"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Briefly describe the role..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>

            {renderSelect('Role Type', formData.roleType, ['Full-time', 'Contract', 'Freelance'], 'roleType')}
            {renderSelect('Work Mode', formData.workMode, ['Remote', 'Hybrid', 'On-site'], 'workMode')}
            {renderSelect('Experience', formData.experienceLevel, ['Senior', 'Mid', 'Junior'], 'experienceLevel')}
            
            <View style={styles.submitSection}>
               <TouchableOpacity
                 style={[styles.submitBtn, (loading || !formData.title) && styles.submitBtnDisabled]}
                 onPress={handleSubmit}
                 disabled={loading || !formData.title}
               >
                 <LinearGradient
                   colors={['#10b981', '#059669']}
                   style={styles.submitGradient}
                 >
                   {loading ? (
                     <ActivityIndicator color="#fff" />
                   ) : (
                     <><Ionicons name="flash-outline" size={18} color="#fff" /><Text style={styles.submitBtnText}>GENERATE LINK</Text></>
                   )}
                 </LinearGradient>
               </TouchableOpacity>
               <Text style={styles.footerNote}>By creating this collection, you agree to handle rigorous candidate data with care.</Text>
            </View>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#050505' },
  container: { flex: 1 },
  header: { height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'SpaceGrotesk-Bold' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10 },
  formContainer: { gap: 32 },
  inputGroup: { gap: 12 },
  label: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter-Bold', letterSpacing: 2 },
  input: {
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 18,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter-Bold',
  },
  textArea: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionBtn: { 
    paddingHorizontal: 16, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionBtnActive: { borderColor: 'rgba(16,185,129,0.5)', backgroundColor: 'rgba(16,185,129,0.05)' },
  optionText: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Inter-Bold' },
  optionTextActive: { color: '#10b981' },
  submitSection: { marginTop: 10, gap: 16 },
  submitBtn: { height: 60, borderRadius: 18, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.5 },
  submitGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  submitBtnText: { color: '#fff', fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', letterSpacing: 1 },
  footerNote: { textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: 'Inter-Bold', lineHeight: 16 },
});

export default CreateHiringScreen;
