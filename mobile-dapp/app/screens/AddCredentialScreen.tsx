import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createCertificate, getCertificates, deleteCertificate } from '../services/api';
import { useWallet } from '../context/WalletContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AddCredentialScreen = ({ navigation }: any) => {
  const { walletAddress } = useWallet();
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [dateIssued, setDateIssued] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  const [certificates, setCertificates] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchCerts = async () => {
    if (!walletAddress) {
      setFetching(false);
      return;
    }
    try {
      const data = await getCertificates(walletAddress);
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch certs error:', error);
    } finally {
      setFetching(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCerts();
    }, [walletAddress])
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDateIssued(selectedDate);
  };

  const handleUpload = async () => {
    if (!title.trim() || !image) {
      Alert.alert('Missing Info', 'Please provide a title and a certificate file.');
      return;
    }

    if (!walletAddress) {
      Alert.alert('Wallet Required', 'Please connect your wallet first.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('wallet', walletAddress);
      formData.append('title', title.trim());
      formData.append('issuer', issuer.trim());
      formData.append('dateIssued', dateIssued.toISOString());

      const uriParts = image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('file', {
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        name: `cert_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      await createCertificate(formData);
      Alert.alert('Success', 'Certificate uploaded successfully.');
      setTitle('');
      setIssuer('');
      setImage(null);
      fetchCerts();
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Credential', 'Are you sure you want to remove this achievement from your legacy?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteCertificate(id, walletAddress!);
            fetchCerts();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete certificate.');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Credential</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* UPLOAD SECTION */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionHeader}>UPLOAD NEW ACHIEVEMENT</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TITLE *</Text>
              <TextInput
                style={styles.input}
                placeholder="Certificate Title"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CREDENTIAL FILE *</Text>
              <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <View style={styles.uploadInner}>
                    <Ionicons name="image-outline" size={32} color="rgba(99, 102, 241, 0.4)" />
                    <Text style={styles.uploadText}>Select Image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (uploading || !title || !image) && styles.submitBtnDisabled]}
              onPress={handleUpload}
              disabled={uploading || !title || !image}
            >
              <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.submitGradient}>
                {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>UPLOAD CREDENTIAL</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* LIST SECTION */}
          <View style={styles.listContainer}>
             <View style={styles.listHeaderRow}>
                <Text style={styles.sectionHeader}>YOUR CREDENTIALS</Text>
                <View style={styles.countBadge}><Text style={styles.countText}>{certificates.length}</Text></View>
             </View>

             {fetching ? (
               <ActivityIndicator color="rgba(255,255,255,0.2)" style={{ marginTop: 20 }} />
             ) : certificates.length === 0 ? (
               <Text style={styles.emptyText}>No credentials uploaded yet.</Text>
             ) : (
               <View style={styles.certsGrid}>
                  {certificates.map((cert) => (
                    <View key={cert.id} style={styles.certItem}>
                       <Image source={{ uri: cert.image_url || cert.imageUrl }} style={styles.certThumb} />
                       <View style={styles.certInfo}>
                          <Text style={styles.certTitle} numberOfLines={1}>{cert.title}</Text>
                          <Text style={styles.certIssuer}>{cert.issuer || 'Verifiable'}</Text>
                       </View>
                       <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(cert.id)}>
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                       </TouchableOpacity>
                    </View>
                  ))}
               </View>
             )}
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
  headerTitle: { color: '#fff', fontSize: 18,  },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10 },
  formContainer: { gap: 24, marginBottom: 50 },
  sectionHeader: { color: 'rgba(255,255,255,0.2)', fontSize: 9,  letterSpacing: 2 },
  inputGroup: { gap: 10 },
  label: { color: 'rgba(255,255,255,0.15)', fontSize: 8,  letterSpacing: 1 },
  input: { height: 50, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14, px: 16, color: '#fff', fontSize: 14,  },
  uploadArea: { height: 140, backgroundColor: 'rgba(63, 66, 241, 0.05)', borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(63, 66, 241, 0.2)', overflow: 'hidden' },
  uploadInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadText: { color: 'rgba(255,255,255,0.4)', fontSize: 12,  },
  previewImage: { width: '100%', height: '100%' },
  submitBtn: { height: 56, borderRadius: 16, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.5 },
  submitGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#fff', fontSize: 13,  letterSpacing: 1 },
  listContainer: { gap: 20 },
  listHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countBadge: { paddingHorizontal: 6, py: 2, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  countText: { color: 'rgba(255,255,255,0.3)', fontSize: 9,  },
  emptyText: { color: 'rgba(255,255,255,0.1)', fontSize: 12,  textAlign: 'center', marginTop: 10 },
  certsGrid: { gap: 12 },
  certItem: { flexDirection: 'row', alignItems: 'center', gap: 14, p: 12, backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)' },
  certThumb: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#111' },
  certInfo: { flex: 1 },
  certTitle: { color: '#fff', fontSize: 13,  },
  certIssuer: { color: 'rgba(255,255,255,0.2)', fontSize: 10,  marginTop: 2 },
  delBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.05)' },
});

export default AddCredentialScreen;

