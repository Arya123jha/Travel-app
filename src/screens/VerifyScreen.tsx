// src/screens/VerifyScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useAuth } from '../hooks/useAuth';
import { verifyTourist, uploadDocument } from '../firebase/services';
import { Button } from '../components/UIComponents';

export default function VerifyScreen() {
  const navigation = useNavigation();
  const { userProfile, refreshProfile } = useAuth();
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [passportPhotoUri, setPassportPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickPassport = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setPassportPhotoUri(result.assets[0].uri);
  };

  const handleVerify = async () => {
    if (!passportNumber.trim()) { Alert.alert('Error', 'Enter passport number'); return; }
    if (!nationality.trim()) { Alert.alert('Error', 'Enter nationality'); return; }
    if (!passportPhotoUri) { Alert.alert('Error', 'Upload passport photo'); return; }
    if (!userProfile?.uid) return;

    setLoading(true);
    try {
      await uploadDocument(userProfile.uid, passportPhotoUri, 'passport');
      await verifyTourist(userProfile.uid, passportNumber.trim().toUpperCase(), nationality.trim());
      await refreshProfile();
      Alert.alert('Verified! 🎉', 'You are now a verified tourist. All features unlocked.', [
        { text: 'Great!', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: Colors.text2, fontSize: 15 }}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={styles.title}>🛂 Tourist Verification</Text>
        <Text style={styles.sub}>
          Verification unlocks SOS emergency services, trekking maps, booking rewards,
          and the full credits system.
        </Text>

        <View style={styles.benefitGrid}>
          {[
            { icon: '🚨', label: 'SOS Emergency' },
            { icon: '🗺️', label: 'Offline Maps' },
            { icon: '💠', label: 'Credits & Rewards' },
            { icon: '🏨', label: 'Booking Priority' },
          ].map(b => (
            <View key={b.label} style={styles.benefitItem}>
              <Text style={{ fontSize: 24 }}>{b.icon}</Text>
              <Text style={styles.benefitLabel}>{b.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Passport Number</Text>
          <TextInput
            style={styles.input}
            value={passportNumber}
            onChangeText={setPassportNumber}
            placeholder="e.g. A12345678"
            placeholderTextColor={Colors.text3}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nationality</Text>
          <TextInput
            style={styles.input}
            value={nationality}
            onChangeText={setNationality}
            placeholder="e.g. American, British, German"
            placeholderTextColor={Colors.text3}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Passport Photo</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickPassport}>
            {passportPhotoUri ? (
              <Text style={{ color: Colors.green, fontSize: 15, fontWeight: '600' }}>
                ✓ Photo uploaded
              </Text>
            ) : (
              <>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📷</Text>
                <Text style={{ color: Colors.text2, fontSize: 14 }}>Tap to upload passport photo</Text>
                <Text style={{ color: Colors.text3, fontSize: 12, marginTop: 4 }}>JPEG or PNG · Max 5MB</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            🔒 Your document is encrypted and stored securely. It is only used for tourist
            verification and will not be shared with third parties.
          </Text>
        </View>

        <Button
          title="Submit for Verification"
          onPress={handleVerify}
          loading={loading}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.lg, paddingTop: Spacing.xl },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  sub: { fontSize: 14, color: Colors.text2, lineHeight: 20, marginBottom: 20 },
  benefitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  benefitItem: {
    width: '47%', backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  benefitLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: 13, color: Colors.text2, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: 14, color: Colors.text, fontSize: 15,
  },
  uploadBox: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: 24, alignItems: 'center',
    borderStyle: 'dashed',
  },
  privacyNote: {
    backgroundColor: Colors.card2, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.md,
  },
  privacyText: { fontSize: 12, color: Colors.text3, lineHeight: 18 },
});