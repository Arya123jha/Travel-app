// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import { CreditsPill, AlertBanner, SectionHeader, Card } from '../components/UIComponents';
import { getActiveTrek } from '../utils/offlineStorage';
import { EBC_ROUTE } from '../data/trekRoutes';

interface DashCard {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  screen: string;
  accent?: boolean;
}

const DASH_CARDS: DashCard[] = [
  { id: 'qr', icon: '📷', title: 'Scan QR', subtitle: 'Earn credits', color: Colors.teal, screen: 'Scan' },
  { id: 'map', icon: '🗺️', title: 'Trek Map', subtitle: 'Offline routes', color: Colors.blue, screen: 'Map' },
  { id: 'stay', icon: '🏡', title: 'Accommodation', subtitle: 'Hotels & homestays', color: Colors.green, screen: 'Bookings' },
  { id: 'transport', icon: '🚌', title: 'Transport', subtitle: 'Bus · Jeep · Flight', color: Colors.accent, screen: 'Bookings' },
  { id: 'guide', icon: '🧭', title: 'Hire Guide', subtitle: 'Expert locals', color: Colors.purple, screen: 'Bookings' },
  { id: 'feedback', icon: '⭐', title: 'Feedback', subtitle: 'Rate & report trail', color: '#F87171', screen: 'Profile' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const { location } = useLocation();
  const [activeTrek, setActiveTrek] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [altitude, setAltitude] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location) setAltitude(Math.round(location.altitudeM));
  }, [location]);

  const loadData = async () => {
    const trek = await getActiveTrek();
    setActiveTrek(trek);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const route = EBC_ROUTE;
  const passedCount = activeTrek?.checkpointsPassed?.length ?? 7;
  const totalCheckpoints = route.checkpoints.length;
  const progress = passedCount / totalCheckpoints;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              Hello, {userProfile?.displayName?.split(' ')[0] ?? 'Trekker'} 🏔
            </Text>
            <Text style={styles.greetingSub}>
              {userProfile?.rank ?? 'Trail Starter'} ·{' '}
              {userProfile?.isVerifiedTourist ? '✓ Verified Tourist' : '⚠ Unverified'}
            </Text>
          </View>
          <CreditsPill credits={userProfile?.credits ?? 0} />
        </View>

        {/* ALTITUDE / WEATHER BANNER */}
        <AlertBanner
          type="warning"
          message={`${altitude ? `📍 ${altitude}m altitude  ·  ` : ''}⚠ Moderate risk at Dingboche today`}
        />

        {/* SOS BUTTON */}
        <TouchableOpacity
          style={styles.sosCard}
          onPress={() => navigation.navigate('SOS')}
          activeOpacity={0.85}
        >
          <View style={styles.sosLeft}>
            <Text style={styles.sosIcon}>🚨</Text>
            <View>
              <Text style={styles.sosTitle}>SOS Emergency</Text>
              <Text style={styles.sosSub}>GPS · Medical history · Rescue relay</Text>
            </View>
          </View>
          <Text style={styles.sosArrow}>›</Text>
        </TouchableOpacity>

        {/* ACTIVE TREK PROGRESS */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
          <SectionHeader title="Active Trek" action="Details" onAction={() => navigation.navigate('Map')} />
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <View>
                <Text style={styles.trekName}>{route.name}</Text>
                <Text style={styles.trekSub}>Day 5 of {route.durationDays} · Namche → Tengboche</Text>
              </View>
              <Text style={styles.trekPercent}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.trekStats}>
              <Text style={styles.trekStat}>✓ {passedCount} checkpoints passed</Text>
              <Text style={styles.trekStat}>{totalCheckpoints - passedCount} remaining</Text>
            </View>
          </Card>
        </View>

        {/* QUICK ACTIONS GRID */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.grid}>
            {DASH_CARDS.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.gridCard}
                onPress={() => navigation.navigate(card.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconBox, { backgroundColor: card.color + '22' }]}>
                  <Text style={styles.gridIcon}>{card.icon}</Text>
                </View>
                <Text style={styles.gridTitle}>{card.title}</Text>
                <Text style={styles.gridSub}>{card.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* NOT VERIFIED WARNING */}
        {!userProfile?.isVerifiedTourist && (
          <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
            <TouchableOpacity
              style={styles.verifyBanner}
              onPress={() => navigation.navigate('Verify')}
            >
              <Text style={styles.verifyTitle}>🛂 Verify your tourist status</Text>
              <Text style={styles.verifySub}>Upload passport to unlock SOS, rewards & all features</Text>
              <Text style={styles.verifyBtn}>Verify Now →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.text },
  greetingSub: { fontSize: 13, color: Colors.text2, marginTop: 3 },
  sosCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: '#3D0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255,71,87,0.3)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sosLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  sosIcon: { fontSize: 32 },
  sosTitle: { fontSize: 17, fontWeight: '700', color: '#FF8A94' },
  sosSub: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  sosArrow: { fontSize: 24, color: Colors.red },
  trekName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  trekSub: { fontSize: 12, color: Colors.text2, marginTop: 2 },
  trekPercent: { fontSize: 20, fontWeight: '800', color: Colors.accent },
  progressBg: {
    height: 6, backgroundColor: Colors.border,
    borderRadius: 3, marginBottom: 8,
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.teal, borderRadius: 3,
  },
  trekStats: { flexDirection: 'row', justifyContent: 'space-between' },
  trekStat: { fontSize: 12, color: Colors.text3 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    width: '31%',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 14,
    minHeight: 100,
  },
  gridIconBox: {
    width: 40, height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridIcon: { fontSize: 20 },
  gridTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  gridSub: { fontSize: 11, color: Colors.text3 },
  verifyBanner: {
    backgroundColor: Colors.card2,
    borderWidth: 1,
    borderColor: 'rgba(232,165,60,0.3)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  verifyTitle: { fontSize: 15, fontWeight: '700', color: Colors.accent },
  verifySub: { fontSize: 13, color: Colors.text2, marginTop: 4, lineHeight: 18 },
  verifyBtn: { fontSize: 13, color: Colors.accent, marginTop: 10, fontWeight: '600' },
});