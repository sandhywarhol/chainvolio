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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { createReceipt } from '../services/api';

const AddProofScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    role: '',
    org: '',
    description: '',
    startDate: '',
    endDate: '',
    workType: 'Full-time',
    evidenceLinks: '',
    isExternal: false
  });

  const handleAddProof = async () => {
    if (!walletAddress || !form.role || !form.org) {
      Alert.alert('Missing Fields', 'Role and Organization are required to anchor a proof.');
      return;
    }
    
    setLoading(true);
    try {
      await createReceipt({
        walletAddress,
        ...form,
        evidenceLinks: form.evidenceLinks.split(',').map(s => s.trim()).filter(Boolean),
        status: 'Self-Declared'
      });
      
      Alert.alert('Success', 'Your professional proof has been anchored to your identity.', [
        { text: 'View Profile', onPress: () => navigation.navigate('Profile') }
      ]);
      
      setForm({ role: '', org: '', description: '', startDate: '', endDate: '', workType: 'Full-time', evidenceLinks: '', isExternal: false });
    } catch (error) {
      console.error('Anchor error:', error);
      Alert.alert('Error', 'Could not anchor the proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
         <Text style={styles.headerTitle}>Anchor New Proof</Text>
         <Text style={styles.headerSubtitle}>Build your verifiable career legacy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         
         <View style={styles.formSection}>
            <Text style={styles.label}>CORE IDENTITY</Text>
            <TextInput 
              style={styles.input} 
              value={form.role} 
              onChangeText={v => setForm({...form, role: v})} 
              placeholder="e.g. Lead Product Designer" 
              placeholderTextColor="#333" 
            />
            <TextInput 
              style={styles.input} 
              value={form.org} 
              onChangeText={v => setForm({...form, org: v})} 
              placeholder="Company or Project Name" 
              placeholderTextColor="#333" 
            />
         </View>

         <View style={styles.formSection}>
            <Text style={styles.label}>DURATION & TYPE</Text>
            <View style={styles.row}>
               <TextInput 
                 style={[styles.input, { flex: 1 }]} 
                 value={form.startDate} 
                 onChangeText={v => setForm({...form, startDate: v})} 
                 placeholder="Start Date" 
                 placeholderTextColor="#333" 
               />
               <TextInput 
                 style={[styles.input, { flex: 1, marginLeft: 12 }]} 
                 value={form.endDate} 
                 onChangeText={v => setForm({...form, endDate: v})} 
                 placeholder="End Date" 
                 placeholderTextColor="#333" 
               />
            </View>
            <TextInput 
              style={styles.input} 
              value={form.workType} 
              onChangeText={v => setForm({...form, workType: v})} 
              placeholder="e.g. Contract, Full-time" 
              placeholderTextColor="#333" 
            />
         </View>

         <View style={styles.formSection}>
            <Text style={styles.label}>ACHIEVEMENTS & IMPACT</Text>
            <TextInput 
              style={[styles.input, { height: 100 }]} 
              value={form.description} 
              onChangeText={v => setForm({...form, description: v})} 
              placeholder="Describe your role and impact..." 
              multiline 
              placeholderTextColor="#333" 
            />
         </View>

         <View style={styles.formSection}>
            <Text style={styles.label}>EVIDENCE LINKS</Text>
            <TextInput 
              style={styles.input} 
              value={form.evidenceLinks} 
              onChangeText={v => setForm({...form, evidenceLinks: v})} 
              placeholder="GitHub repo, Portfolio, or Drive links (comma separated)" 
              placeholderTextColor="#333" 
            />
         </View>

         <TouchableOpacity 
           style={[styles.submitBtn, loading && styles.disabledBtn]} 
           onPress={handleAddProof}
           disabled={loading}
         >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Anchor Proof to Identity</Text>
                <Ionicons name="flash" size={16} color="#000" />
              </>
            )}
         </TouchableOpacity>

         <View style={styles.disclaimer}>
            <Ionicons name="shield-checkmark" size={12} color="#444" />
            <Text style={styles.disclaimerText}>
              Anchored proofs are stored as self-declared. You can request official attestations later for maximum trust score.
            </Text>
         </View>
         
         <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#111' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#444', fontSize: 13, fontWeight: '600', marginTop: 4 },
  scrollContent: { padding: 24 },
  formSection: { marginBottom: 32 },
  label: { color: '#222', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  input: { backgroundColor: '#050505', borderRadius: 14, borderWidth: 1, borderColor: '#111', padding: 16, color: '#fff', fontSize: 14, marginBottom: 12 },
  row: { flexDirection: 'row' },
  submitBtn: { height: 56, backgroundColor: '#10b981', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  disabledBtn: { opacity: 0.6 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  disclaimer: { flexDirection: 'row', gap: 10, padding: 20, backgroundColor: '#040404', borderRadius: 16, marginTop: 40, borderWidth: 1, borderColor: '#111' },
  disclaimerText: { flex: 1, color: '#444', fontSize: 11, lineHeight: 18, fontWeight: '500' }
});

export default AddProofScreen;
