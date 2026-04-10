import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Dimensions,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { updateProfile } from '../services/api';

const { width } = Dimensions.get('window');

const SetupScreen = ({ navigation }: any) => {
  const { walletAddress, setHasProfile } = useWallet();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    displayName: '',
    role: '',
    organization: '',
    bio: '',
    skills: '',
    github: '',
    twitter: ''
  });

  const handlePublish = async () => {
    if (!form.displayName || !form.role) return;
    
    setLoading(true);
    try {
      // Identity Logic Mirroring Desktop POST /api/profile
      await updateProfile(walletAddress!, {
        displayName: form.displayName,
        role: form.role,
        organization: form.organization,
        bio: form.bio,
        skills: form.skills,
        github: form.github,
        twitter: form.twitter
      });
      
      setHasProfile(true);
      navigation.replace('MainTabs', { screen: 'Profile' });
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop' }} 
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
               <View style={styles.logoCircle}>
                  <Ionicons name="flash" size={24} color="#10b981" />
               </View>
               <Text style={styles.title}>Professional Identity</Text>
               <Text style={styles.subtitle}>Define your verifiable career persona</Text>
            </View>

            <View style={styles.formCard}>
              
              {/* DISPLAY NAME */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DISPLAY NAME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Satoshi Nakamoto"
                  placeholderTextColor="#444"
                  value={form.displayName}
                  onChangeText={(t) => setForm({...form, displayName: t})}
                />
              </View>

              {/* ROLE */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PROFESSIONAL ROLE *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Protocol Engineer"
                  placeholderTextColor="#444"
                  value={form.role}
                  onChangeText={(t) => setForm({...form, role: t})}
                />
              </View>

              {/* ORGANIZATION */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CURRENT ORGANIZATION</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ChainVolio Labs"
                  placeholderTextColor="#444"
                  value={form.organization}
                  onChangeText={(t) => setForm({...form, organization: t})}
                />
              </View>

              {/* BIO */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>BIO</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Briefly describe your career impact"
                  placeholderTextColor="#444"
                  multiline
                  value={form.bio}
                  onChangeText={(t) => setForm({...form, bio: t})}
                />
              </View>

              {/* SKILLS */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CORE SKILLS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="React, Solidity, Rust..."
                  placeholderTextColor="#444"
                  value={form.skills}
                  onChangeText={(t) => setForm({...form, skills: t})}
                />
              </View>

              <View style={styles.divider} />

              {/* SOCIALS */}
              <View style={styles.socialRow}>
                 <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>GITHUB</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="username"
                      placeholderTextColor="#444"
                      value={form.github}
                      onChangeText={(t) => setForm({...form, github: t})}
                    />
                 </View>
                 <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                    <Text style={styles.label}>TWITTER</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="@username"
                      placeholderTextColor="#444"
                      value={form.twitter}
                      onChangeText={(t) => setForm({...form, twitter: t})}
                    />
                 </View>
              </View>

              <View style={styles.walletInfo}>
                 <Ionicons name="wallet-outline" size={12} color="#444" />
                 <Text style={styles.walletText}>Connected: {walletAddress?.slice(0, 10)}...</Text>
              </View>

            </View>

            <TouchableOpacity 
              style={[styles.publishBtn, (!form.displayName || !form.role) && styles.btnDisabled]} 
              onPress={handlePublish}
              disabled={loading || !form.displayName || !form.role}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.publishText}>Publish Identity</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterBtn} onPress={() => navigation.replace('MainTabs')}>
               <Text style={styles.laterText}>Skip and go to Dashboard</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 10,
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  walletText: {
    color: '#333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  publishBtn: {
    backgroundColor: '#10b981',
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  btnDisabled: {
    opacity: 0.3,
  },
  publishText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  laterBtn: {
    alignSelf: 'center',
  },
  laterText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '700',
  }
});

export default SetupScreen;
