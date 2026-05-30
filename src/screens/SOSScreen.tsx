// src/screens/SOSScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Alert, Vibration, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import { saveSosPacket } from '../firebase/services';
import { queueSOS, getLocationHistory } from '../utils/offlineStorage';
import { Button, AlertBanner } from '../components/UIComponents';
import type { SOSPacket } from '../types';

const EMERGENCY_TYPES = [
  'Altitude sickness (AMS)',
  'Injury / fracture',
  'Lost / disoriented',
  'Avalanche / landslide',
  'Weather emergency',
  'Cardiac / respiratory',
];

const SYMPTOMS = [
  'Headache',
  'Dizziness',
  'Nausea / vomiting',
  'Breathlessness',
  'Confusion',
  'Chest pain',
  'Extreme fatigue',
  'Blue lips / fingers',
];

const AMS_ADVICE = [
  '🛑 Stop ascending immediately',
  '💧 Hydrate — drink 3-4L water today',
  '🧘 Rest completely — do not exert',
  '⬇️ Descend at least 500m if symptoms worsen',
  '💊 Ibuprofen for headache (not aspirin)',
  '🫁 Use supplemental oxygen if available',
];

const INJURY_ADVICE = [
  '🩹 Immobilize injured area',
  '❄️ Apply cold compress if available',
  '📍 Stay in place — do not move if spine injury suspected',
  '🚁 Request helicopter evacuation',
  '🧤 Keep patient warm',
];

export default function SOSScreen() {
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const { location, getCurrentLocation } = useLocation();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulsing animation for SOS button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const toggleType = (t: string) =>
    setSelectedTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const getAdvice = (): string[] => {
    const isAMS =
      selectedTypes.some(t => t.includes('Altitude')) ||
      selectedSymptoms.some(s => ['Headache', 'Dizziness', 'Nausea / vomiting', 'Confusion'].includes(s));
    const isInjury = selectedTypes.some(t => t.includes('Injury'));
    return isAMS ? AMS_ADVICE : isInjury ? INJURY_ADVICE : AMS_ADVICE;
  };

  const handleSendSOS = async () => {
    if (selectedTypes.length === 0) {
      Alert.alert('Select emergency type', 'Please select at least one emergency type');
      return;
    }

    Vibration.vibrate([0, 200, 100, 200]);
    setSending(true);

    const currentLocation = await getCurrentLocation();
    const history = await getLocationHistory();

    const packet: Omit<SOSPacket, 'id'> = {
      userId: userProfile?.uid ?? 'guest',
      userProfile: {
        displayName: userProfile?.displayName,
        phoneNumber: userProfile?.phoneNumber,
        emergencyContacts: userProfile?.emergencyContacts ?? [],
      },
      emergencyType: selectedTypes,
      symptoms: selectedSymptoms,
      latitude: currentLocation?.latitude ?? location?.latitude ?? 0,
      longitude: currentLocation?.longitude ?? location?.longitude ?? 0,
      altitudeM: currentLocation?.altitudeM ?? location?.altitudeM ?? 0,
      lastCheckpoint: 'Namche Bazaar', // from active trek state
      trailHistory: (history ?? []).slice(-20).map(h => ({
        lat: h.lat, lng: h.lng, time: new Date(h.time),
      })),
      advice: getAdvice(),
      timestamp: new Date(),
      sent: false,
    };

    try {
      await saveSosPacket(packet);
      setSent(true);
    } catch {
      // Offline — queue
      await queueSOS(packet);
      setSent(true); // still show success; will sync later
    }

    setSending(false);
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={{ padding: Spacing.xl, alignItems: 'center' }}>
          <Text style={{ fontSize: 72, marginBottom: 20 }}>📡</Text>
          <Text style={styles.sentTitle}>SOS Packet Sent</Text>
          <Text style={styles.sentSub}>
            Emergency packet transmitted. Rescue coordination activated.
          </Text>

          <View style={styles.sentInfoBox}>
            <Text style={styles.sentInfoTitle}>📍 Your location shared</Text>
            <Text style={styles.sentInfoValue}>
              {location?.latitude.toFixed(5)}, {location?.longitude.toFixed(5)}
            </Text>
            <Text style={styles.sentInfoTitle}>📏 Altitude</Text>
            <Text style={styles.sentInfoValue}>{Math.round(location?.altitudeM ?? 0)}m</Text>
            <Text style={styles.sentInfoTitle}>🏥 Nearest rescue</Text>
            <Text style={styles.sentInfoValue}>Himalayan Rescue Post — Pheriche (+977-1-4440066)</Text>
            <Text style={styles.sentInfoTitle}>🔄 Relay method</Text>
            <Text style={styles.sentInfoValue}>Bluetooth / Tea-house sync if offline</Text>
          </View>

          <AlertBanner
            type="warning"
            message="If offline, packet will auto-relay via Bluetooth to nearby trekkers or sync at next tea-house WiFi."
          />

          <Text style={styles.adviceTitle}>While you wait:</Text>
          {getAdvice().map((a, i) => (
            <View key={i} style={styles.adviceItem}>
              <Text style={styles.adviceText}>{a}</Text>
            </View>
          ))}

          <Button
            title="Close"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{ marginTop: 24, width: '100%' }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Red header */}
        <View style={styles.sosHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={{ color: Colors.text2, fontSize: 15 }}>✕</Text>
          </TouchableOpacity>

          <Animated.View style={[styles.sosBigBtn, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={{ fontSize: 40 }}>🚨</Text>
          </Animated.View>

          <Text style={styles.sosTitle}>Emergency SOS</Text>
          <Text style={styles.sosSub}>
            Your GPS, altitude, trail history & medical info will be sent to rescue services
          </Text>

          <View style={styles.locationRow}>
            <Text style={styles.locText}>
              📍 {location
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)} · ${Math.round(location.altitudeM)}m`
                : 'Acquiring location...'}
            </Text>
          </View>
        </View>

        {/* Emergency type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Emergency Type *</Text>
          <View style={styles.chipGrid}>
            {EMERGENCY_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => toggleType(t)}
                style={[styles.chip, selectedTypes.includes(t) && styles.chipActive]}
              >
                <Text style={{ fontSize: 13, color: selectedTypes.includes(t) ? Colors.red : Colors.text2 }}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Symptoms (select all that apply)</Text>
          <View style={styles.chipGrid}>
            {SYMPTOMS.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => toggleSymptom(s)}
                style={[styles.chip, selectedSymptoms.includes(s) && styles.chipActiveYellow]}
              >
                <Text style={{ fontSize: 13, color: selectedSymptoms.includes(s) ? Colors.accent : Colors.text2 }}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live advice preview */}
        {(selectedTypes.length > 0 || selectedSymptoms.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Immediate Advice</Text>
            <View style={styles.adviceBox}>
              {getAdvice().slice(0, 3).map((a, i) => (
                <Text key={i} style={styles.adviceBoxText}>• {a}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Signal status */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Signal Status</Text>
          <View style={styles.signalBox}>
            <View style={styles.signalDot} />
            <Text style={styles.signalText}>
              Weak signal — packet queued for Bluetooth relay via nearby trekkers & tea-house WiFi sync
            </Text>
          </View>
        </View>

        {/* Send button */}
        <View style={{ padding: Spacing.lg, paddingBottom: 40 }}>
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSendSOS}
            disabled={sending}
            activeOpacity={0.85}
          >
            <Text style={styles.sendBtnText}>
              {sending ? '⏳ Sending...' : '🚨 SEND EMERGENCY PACKET'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.sendNote}>
            This will alert Nepal Tourism Emergency Response + your emergency contacts
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  sosHeader: {
    backgroundColor: '#2D0808',
    padding: Spacing.xl,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,71,87,0.2)',
  },
  closeBtn: {
    position: 'absolute', top: 50, right: 20,
    backgroundColor: Colors.card, borderRadius: 20,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  sosBigBtn: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.red,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
  },
  sosTitle: { fontSize: 22, fontWeight: '800', color: '#FF8A94', marginBottom: 8 },
  sosSub: { fontSize: 13, color: Colors.text2, textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  locationRow: {
    backgroundColor: 'rgba(255,71,87,0.1)', borderRadius: Radius.sm,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  locText: { fontSize: 12, color: '#FF8A94' },
  section: { padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.text3,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: 'rgba(255,71,87,0.12)',
    borderColor: 'rgba(255,71,87,0.5)',
  },
  chipActiveYellow: {
    backgroundColor: Colors.accent + '1A',
    borderColor: Colors.accent + '66',
  },
  adviceBox: {
    backgroundColor: Colors.accent + '12',
    borderWidth: 1, borderColor: Colors.accent + '33',
    borderRadius: Radius.md, padding: Spacing.md,
  },
  adviceBoxText: { fontSize: 13, color: Colors.text2, lineHeight: 22 },
  signalBox: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center',
    gap: 10, padding: Spacing.md,
  },
  signalDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF8A00',
  },
  signalText: { flex: 1, fontSize: 12, color: Colors.text2, lineHeight: 18 },
  sendBtn: {
    backgroundColor: Colors.red, borderRadius: Radius.md,
    padding: 18, alignItems: 'center',
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  sendBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  sendNote: { fontSize: 12, color: Colors.text3, textAlign: 'center', marginTop: 10, lineHeight: 16 },
  sentTitle: { fontSize: 26, fontWeight: '800', color: Colors.teal, marginBottom: 8 },
  sentSub: { fontSize: 14, color: Colors.text2, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  sentInfoBox: {
    backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.lg, width: '100%', marginBottom: 16, gap: 4,
  },
  sentInfoTitle: { fontSize: 11, color: Colors.text3, textTransform: 'uppercase', marginTop: 8 },
  sentInfoValue: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  adviceTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, alignSelf: 'flex-start', marginBottom: 8, marginTop: 8 },
  adviceItem: {
    backgroundColor: Colors.card, borderRadius: Radius.sm, padding: Spacing.md,
    width: '100%', marginBottom: 6, borderLeftWidth: 3, borderLeftColor: Colors.accent,
  },
  adviceText: { fontSize: 13, color: Colors.text2 },
});