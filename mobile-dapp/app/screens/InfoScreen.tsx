import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const InfoScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Knowledge Hub</Text>
          <Text style={styles.subtitle}>Guide, terms, and platform info</Text>
        </View>

        <View style={styles.section}>
           <Text style={styles.sectionLabel}>PLATFORM</Text>
           <TouchableOpacity style={styles.linkItem}>
              <View style={styles.linkLeft}>
                 <Ionicons name="document-text-outline" size={20} color="#10b981" />
                 <Text style={styles.linkText}>Product Whitepaper</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#333" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.linkItem}>
              <View style={styles.linkLeft}>
                 <Ionicons name="book-outline" size={20} color="#3b82f6" />
                 <Text style={styles.linkText}>Verification Guide</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#333" />
           </TouchableOpacity>
        </View>

        <View style={styles.section}>
           <Text style={styles.sectionLabel}>LEGAL</Text>
           <TouchableOpacity style={styles.linkItem}>
              <View style={styles.linkLeft}>
                 <Ionicons name="shield-outline" size={20} color="#666" />
                 <Text style={styles.linkText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#333" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.linkItem}>
              <View style={styles.linkLeft}>
                 <Ionicons name="contract-outline" size={20} color="#666" />
                 <Text style={styles.linkText}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#333" />
           </TouchableOpacity>
        </View>

        <View style={styles.supportBox}>
           <Text style={styles.supportTitle}>Need Help?</Text>
           <Text style={styles.supportText}>Contact our support team for any verification issues or questions about your CV Score.</Text>
           <TouchableOpacity style={styles.supportBtn}>
              <Text style={styles.supportBtnText}>Contact Support</Text>
           </TouchableOpacity>
        </View>

        <Text style={styles.footerVersion}>ChainVolio Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 14, marginTop: 4 },
  section: { marginBottom: 30 },
  sectionLabel: { color: '#333', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  linkLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkText: { color: '#ccc', fontSize: 14, fontWeight: '500' },
  supportBox: {
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  supportTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  supportText: { color: '#666', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  supportBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportBtnText: { color: '#000', fontSize: 13, fontWeight: 'bold' },
  footerVersion: { color: '#222', textAlign: 'center', marginTop: 40, fontSize: 10, letterSpacing: 1 },
});

export default InfoScreen;
