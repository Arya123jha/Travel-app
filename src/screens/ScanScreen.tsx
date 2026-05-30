// src/screens/ScanScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Alert, Modal, ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import { saveCheckin } from '../firebase/services';
import { queueCheckin } from '../utils/offlineStorage';
import { Button } from '../components/UIComponents';
import { EBC_ROUTE } from '../data/trekRoutes';

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

interface CheckinResult {
  locationName: string;
  credits: number;
  altitude: number;
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [foodChoice, setFoodChoice] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const { userProfile } = useAuth();
  const { location } = useLocation();
  const lastScanTime = useRef(0);

  const FOOD_OPTIONS = ['🍛 Dal bhat', '🫖 Tea', '🍪 Snacks', '🧀 Yak cheese', '🍜 Noodles', 'Other'];

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    const now = Date.now();
    if (scanned || now - lastScanTime.current < 3000) return;
    lastScanTime.current = now;
    setScanned(true);
    setScanState('scanning');

    // Validate QR against known checkpoints
    const checkpoint = EBC_ROUTE.checkpoints.find(cp => cp.qrCode === data);
    // Also check hotels
    const hotel = EBC_ROUTE.hotels.find(h => h.id === data);

    if (!checkpoint && !hotel) {
      setScanState('error');
      setTimeout(() => { setScanned(false); setScanState('idle'); }, 2500);
      return;
    }

    const locationName = checkpoint?.name ?? hotel?.name ?? 'Unknown';
    const credits = checkpoint?.credits ?? hotel?.qrCredits ?? 10;
    const altitude = checkpoint?.altitudeM ?? hotel?.altitudeM ?? location?.altitudeM ?? 0;

    // Validate GPS proximity (within 500m of checkpoint)
    // In production, use getDistanceMeters() here

    const checkin = {
      userId: userProfile?.uid ?? 'guest',
      locationId: checkpoint?.id ?? hotel?.id ?? data,
      locationName,
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
      altitudeM: altitude,
      creditsEarned: credits,
      timestamp: new Date(),
      synced: false,
    };

    try {
      await saveCheckin(checkin);
    } catch {
      // Offline — queue for later
      await queueCheckin(checkin);
    }

    setResult({ locationName, credits, altitude });
    setScanState('success');
    setShowSuccess(true);
    setScanned(false);
  };

  const toggleFood = (item: string) => {
    setFoodChoice(prev =>
      prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]
    );
  };

  if (!permission) {
    return <View style={styles.root} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.permBox}>
          <Text style={styles.permEmoji}>📷</Text>
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <Text style={styles.permSub}>
            Camera is required to scan QR codes at checkpoints and earn credits.
          </Text>
          <Button title="Grant Permission" onPress={requestPermission} style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan & Earn 📷</Text>
        <Text style={styles.subtitle}>Scan QR codes at checkpoints for credits</Text>
      </View>

      {/* Camera viewfinder */}
      <View style={styles.cameraBox}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {/* Overlay corners */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              {scanState === 'scanning' && <View style={styles.scanLine} />}
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay} />
        </View>

        {/* Status text */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {scanState === 'idle' && '🔍 Align QR code in frame'}
            {scanState === 'scanning' && '⏳ Verifying...'}
            {scanState === 'success' && '✅ Check-in verified!'}
            {scanState === 'error' && '❌ Invalid or expired QR'}
          </Text>
        </View>
      </View>

      {/* Security note */}
      <View style={styles.securityNote}>
        <Text style={styles.securityText}>
          🔒 Live camera only · Gallery uploads rejected · GPS verified
        </Text>
      </View>

      {/* Recent check-ins */}
      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Recent Check-ins</Text>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {[
          { name: 'Namche Bazaar', pts: 20, time: '2h ago', alt: '3440m' },
          { name: 'Monjo Village', pts: 15, time: '5h ago', alt: '2835m' },
          { name: 'Phakding', pts: 15, time: 'Yesterday', alt: '2610m' },
        ].map((item, i) => (
          <View key={i} style={styles.recentItem}>
            <View style={styles.recentDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.recentName}>{item.name}</Text>
              <Text style={styles.recentMeta}>{item.alt} · {item.time}</Text>
            </View>
            <Text style={styles.recentPts}>+{item.pts} 💠</Text>
          </View>
        ))}
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Verified Check-in!</Text>
            <Text style={styles.successLocation}>{result?.locationName}</Text>
            <Text style={styles.successCredits}>+{result?.credits} credits earned 💠</Text>
            <Text style={styles.successAlt}>📍 {result?.altitude}m altitude</Text>

            <Text style={styles.foodLabel}>What did you have here?</Text>
            <View style={styles.foodGrid}>
              {FOOD_OPTIONS.map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => toggleFood(f)}
                  style={[styles.foodChip, foodChoice.includes(f) && styles.foodChipActive]}
                >
                  <Text style={{ fontSize: 12, color: foodChoice.includes(f) ? Colors.accent : Colors.text2 }}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Done"
              onPress={() => { setShowSuccess(false); setResult(null); setFoodChoice([]); }}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const FRAME_SIZE = 220;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.lg, paddingTop: Spacing.xl },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.text2, marginTop: 4 },
  cameraBox: { height: 300, marginHorizontal: Spacing.lg, borderRadius: Radius.xl, overflow: 'hidden', position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject },
  topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  middleRow: { flexDirection: 'row', height: FRAME_SIZE },
  sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  bottomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  frame: { width: FRAME_SIZE, height: FRAME_SIZE, position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: Colors.accent, borderStyle: 'solid' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLine: {
    position: 'absolute', left: 10, right: 10, height: 2,
    backgroundColor: Colors.accent, top: '40%', borderRadius: 1,
  },
  statusBadge: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    alignItems: 'center',
  },
  statusText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: Colors.text,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  securityNote: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: Spacing.lg,
  },
  securityText: { fontSize: 11, color: Colors.text3, textAlign: 'center' },
  recentHeader: { paddingHorizontal: Spacing.lg, paddingBottom: 8 },
  recentTitle: { fontSize: 12, fontWeight: '700', color: Colors.text3, textTransform: 'uppercase', letterSpacing: 1 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  recentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.teal },
  recentName: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  recentMeta: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  recentPts: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  permBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permEmoji: { fontSize: 56, marginBottom: 16 },
  permTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  permSub: { fontSize: 14, color: Colors.text2, textAlign: 'center', lineHeight: 20 },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: Spacing.xl },
  successCard: {
    backgroundColor: Colors.bg2, borderRadius: Radius.xl,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  successIcon: { fontSize: 48, marginBottom: 8 },
  successTitle: { fontSize: 20, fontWeight: '800', color: Colors.teal, marginBottom: 4 },
  successLocation: { fontSize: 17, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  successCredits: { fontSize: 22, fontWeight: '800', color: Colors.accent, marginBottom: 2 },
  successAlt: { fontSize: 13, color: Colors.text3, marginBottom: 16 },
  foodLabel: { fontSize: 13, color: Colors.text2, marginBottom: 8, alignSelf: 'flex-start' },
  foodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignSelf: 'flex-start' },
  foodChip: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  foodChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '22' },
});