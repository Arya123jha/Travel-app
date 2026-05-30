// src/screens/AuthScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Spacing, Radius } from '../utils/theme';
import { loginWithEmail, registerWithEmail } from '../firebase/services';
import { Button } from '../components/UIComponents';

export default function AuthScreen() {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      await registerWithEmail(email, password);
    } catch (e: any) {
      Alert.alert('Registration failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'welcome') {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏔</Text>
          <Text style={styles.heroTitle}>Explore Nepal</Text>
          <Text style={styles.heroSubtitle}>Smartly & Safely</Text>
          <Text style={styles.heroDesc}>
            The offline-first smart tourism platform combining QR verified travel,
            trekking maps, emergency SOS, bookings and rewards.
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert('Google Sign-In', 'Configure via Firebase Console')}>
            <Text style={styles.socialBtnText}>G  Continue with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert('Apple Sign-In', 'Available on iOS')}>
            <Text style={styles.socialBtnText}>🍎  Continue with Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert('OTP', 'Configure Twilio or Firebase Phone Auth')}>
            <Text style={styles.socialBtnText}>📱  Phone OTP</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button title="Login with Email" onPress={() => setMode('login')} style={{ marginBottom: 10 }} />
          <Button title="Create Account" onPress={() => setMode('register')} variant="outline" />

          <Text style={styles.verifyNote}>
            ✓ Tourist verification unlocks SOS, maps, bookings & rewards
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
          <TouchableOpacity onPress={() => setMode('welcome')} style={{ marginBottom: Spacing.xl }}>
            <Text style={{ color: Colors.text2, fontSize: 15 }}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.formTitle}>
            {mode === 'login' ? 'Welcome back 🙏' : 'Create account'}
          </Text>
          <Text style={styles.formSub}>
            {mode === 'login' ? 'Sign in to continue your trek' : 'Start your Himalayan journey'}
          </Text>

          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={Colors.text3}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors.text3}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.text3}
              secureTextEntry
            />
          </View>

          <Button
            title={mode === 'login' ? 'Sign In' : 'Create Account'}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            loading={loading}
            style={{ marginTop: Spacing.xl }}
          />

          <TouchableOpacity
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ marginTop: Spacing.lg, alignItems: 'center' }}
          >
            <Text style={{ color: Colors.text2, fontSize: 14 }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={{ color: Colors.accent }}>
                {mode === 'login' ? 'Register' : 'Login'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  heroEmoji: { fontSize: 72, marginBottom: 16 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: Colors.text, letterSpacing: -1 },
  heroSubtitle: { fontSize: 24, fontWeight: '600', color: Colors.accent, marginBottom: 16 },
  heroDesc: {
    fontSize: 15, color: Colors.text2, textAlign: 'center',
    lineHeight: 22, maxWidth: 300,
  },
  buttons: { padding: Spacing.xl, gap: 0 },
  socialBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  socialBtnText: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.text3, fontSize: 13 },
  verifyNote: {
    textAlign: 'center', color: Colors.text3, fontSize: 12,
    marginTop: 16, lineHeight: 18,
  },
  formTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  formSub: { fontSize: 15, color: Colors.text2, marginBottom: 28 },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: 13, color: Colors.text2, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
  },
});