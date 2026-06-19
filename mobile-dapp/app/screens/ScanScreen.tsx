import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';

const ScanScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScanResult(data);

    // Determine if it's a job/link
    const isUrl = data.startsWith('http://') || data.startsWith('https://');
    const isJobLink = isUrl && (
      data.includes('chainvolio') ||
      data.includes('hiring') ||
      data.includes('job') ||
      data.includes('apply')
    );

    if (isJobLink) {
      Alert.alert(
        '🧑‍💼 Job Opportunity Found',
        `A job listing was detected:\n\n${data}\n\nWould you like to apply?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setScanned(false),
          },
          {
            text: 'Apply Now',
            onPress: () => {
              Linking.openURL(data);
              setScanned(false);
            },
          },
        ]
      );
    } else if (isUrl) {
      Alert.alert(
        '🔗 Link Detected',
        `${data}`,
        [
          {
            text: 'Dismiss',
            style: 'cancel',
            onPress: () => setScanned(false),
          },
          {
            text: 'Open Link',
            onPress: () => {
              Linking.openURL(data);
              setScanned(false);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '📄 QR Code',
        data,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.permissionBox}>
            <Ionicons name="camera-outline" size={52} color="#9ca3af" />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionSub}>
              Allow camera access to scan QR codes for job listings and profiles.
            </Text>
            <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
              <Text style={styles.grantBtnText}>ALLOW CAMERA</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>SCAN QR CODE</Text>
          <View style={{ width: 44 }} />
        </SafeAreaView>

        {/* Center viewfinder */}
        <View style={styles.viewfinderWrapper}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Bottom hint */}
        <View style={styles.bottomHint}>
          <Text style={styles.hintText}>Point camera at a QR code</Text>
          <Text style={styles.hintSub}>Job listings • Profile links • Verification codes</Text>

          {scanned && (
            <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
              <Ionicons name="refresh" size={16} color="#1f2937" />
              <Text style={styles.rescanText}>TAP TO SCAN AGAIN</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  camera: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, backgroundColor: '#fafafa' },
  infoText: { color: '#6b7280',  },
  permissionBox: {
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  permissionTitle: {
    color: '#1f2937',
    fontSize: 20,
    
    textAlign: 'center',
  },
  permissionSub: {
    color: '#6b7280',
    fontSize: 13,
    
    textAlign: 'center',
    lineHeight: 20,
  },
  grantBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1f2937',
  },
  grantBtnText: {
    color: '#fff',
    fontSize: 11,
    
    letterSpacing: 1.5,
  },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  topTitle: {
    color: '#1f2937',
    fontSize: 11,
    
    letterSpacing: 2,
  },
  viewfinderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#1f2937',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
  bottomHint: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 32,
    paddingHorizontal: 30,
    alignItems: 'center',
    gap: 8,
  },
  hintText: {
    color: '#1f2937',
    fontSize: 14,
    
  },
  hintSub: {
    color: '#6b7280',
    fontSize: 11,
    
  },
  rescanBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#fafafa',
    padding: 30,
    roundcolor: '#1f2937',
  },
  rescanText: {
    color: '#1f2937',
    fontSize: 10,
    
    letterSpacing: 1.5,
  },
});

export default ScanScreen;




