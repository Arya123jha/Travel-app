// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../firebase/services';
import { getUserCheckins, getUserBookings } from '../firebase/services';
import { Button, SectionHeader, CreditsPill } from '../components/UIComponents';
import type { Achievement } from '../types';

const ACHIEVEMENTS: Achievement[] = [
  { id: 'ebc', title: 'EBC Explorer', description: 'Reached Everest Base Camp', icon: '🏔', unlocked: true },
  { id: 'sunrise', title: 'Sunrise Hunter', description: 'Watched sunrise from Poon Hill', icon: '🌅', unlocked: true },
  { id: 'eco', title: 'Eco Trekker', description: 'Zero-waste trail record', icon: '🌿', unlocked: true },
  { id: 'safety', title: 'Safety First', description: 'Completed AMS safety protocol', icon: '🛡️', unlocked: false },
  { id: 'foodie', title: 'Dal Bhat Power', description: 'Ate dal bhat at 10 locations', icon: '🍛', unlocked: false },
  { id: 'social', title: 'Trek Buddy', description: 'Helped relay SOS for another trekker', icon: '🤝', unlocked: false },
];

const RANK_CONFIG: Record<string, { color: string; emoji: string; nextAt: number }> = {
  'Trail Starter': { color: Colors.text3, emoji: '🥾', nextAt: 200 },
  'Hill Walker': { color: Colors.green, emoji: '⛰️', nextAt: 500 },
  'Mountain Navigator': { color: Colors.blue, emoji: '🧭', nextAt: 1000 },
  'Himalayan Explorer': { color: Colors.accent, emoji: '🏔', nextAt: 2000 },
  'Summit Master': { color: '#FFD700', emoji: '👑', nextAt: 9999 },
};

export default function ProfileScreen() {
  const { userProfile, refreshProfile } = useAuth();
  const [checkinCount, setCheckinCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, [userProfile]);

  const loadStats = async () => {
    if (!userProfile?.uid) return;
    try {
      const [checkins, bookings] = await Promise.all([
        getUserCheckins(userProfile.uid),
        getUserBookings(userProfile.uid),
      ]);
      setCheckinCount(checkins.length);
      setBookingCount(bookings.length);
    } catch {
      // Offline — show cached values
    }
  };

  const handleLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);

  const rank = userProfile?.rank ?? 'Trail Starter';
  const rankConf = RANK_CONFIG[rank] ?? RANK_CONFIG['Trail Starter'];
  const credits = userProfile?.credits ?? 0;
  const progressToNext = Math.min((credits / rankConf.nextAt) * 100, 100);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(userProfile?.displayName ?? 'T').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{userProfile?.displayName ?? 'Trekker'}</Text>
          <Text style={styles.email}>{userProfile?.email}</Text>
          <View style={styles.rankRow}>
            <Text style={[styles.rankLabel, { color: rankConf.color }]}>
              {rankConf.emoji} {rank}
            </Text>
            {userProfile?.isVerifiedTourist && (
              <Text style={styles.verifiedBadge}>✓ Verified</Text>
            )}
          </View>

          {/* Credits progress */}
          <View style={styles.creditsBox}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={styles.creditsLabel}>💠 {credits} credits</Text>
              <Text style={styles.creditsLabel}>{rankConf.nextAt} for next rank</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progressToNext}%`, backgroundColor: rankConf.color }]} />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox value={checkinCount || 47} label="QR Scans" />
          <StatBox value={bookingCount || 3} label="Bookings" />
          <StatBox value={ACHIEVEMENTS.filter(a => a.unlocked).length} label="Badges" />
          <StatBox value={12} label="Trips" />
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <SectionHeader title="Achievements" />
          <View style={styles.badgeGrid}>
            {ACHIEVEMENTS.map(a => (
              <View key={a.id} style={[styles.badgeCard, !a.unlocked && styles.badgeCardLocked]}>
                <Text style={[styles.badgeIcon, !a.unlocked && { opacity: 0.3 }]}>{a.icon}</Text>
                <Text style={[styles.badgeTitle, !a.unlocked && { color: Colors.text3 }]}>{a.title}</Text>
                <Text style={styles.badgeSub}>{a.description}</Text>
                {!a.unlocked && <Text style={styles.lockedText}>🔒</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Visited Places */}
        <View style={styles.section}>
          <SectionHeader title="Places Visited" />
          {[
            { name: 'Kathmandu Durbar Square', type: 'Heritage', pts: 30, visits: 3 },
            { name: 'Pokhara Lakeside', type: 'Nature', pts: 20, visits: 2 },
            { name: 'Namche Bazaar', type: 'Trek', pts: 20, visits: 1 },
            { name: 'Tengboche Monastery', type: 'Culture', pts: 30, visits: 1 },
          ].map((place, i) => (
            <View key={i} style={styles.visitRow}>
              <View style={[styles.visitDot, { backgroundColor: i < 2 ? Colors.teal : Colors.accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.visitName}>{place.name}</Text>
                <Text style={styles.visitMeta}>{place.type} · {place.visits} visit{place.visits > 1 ? 's' : ''}</Text>
              </View>
              <Text style={styles.visitPts}>+{place.pts} 💠</Text>
            </View>
          ))}
        </View>

        {/* Emergency contacts */}
        <View style={styles.section}>
          <SectionHeader title="Emergency Contacts" action="Edit" />
          {(userProfile?.emergencyContacts ?? []).length === 0 ? (
            <TouchableOpacity style={styles.addContactBtn}>
              <Text style={styles.addContactText}>+ Add emergency contact</Text>
              <Text style={styles.addContactSub}>Required for SOS activation</Text>
            </TouchableOpacity>
          ) : (
            userProfile?.emergencyContacts.map((c, i) => (
              <View key={i} style={styles.contactRow}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactMeta}>{c.relation} · {c.phone}</Text>
              </View>
            ))
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <SectionHeader title="Settings" />
          {[
            { label: '🗺 Downloaded Maps', sub: 'EBC, Annapurna cached' },
            { label: '🔔 Notifications', sub: 'Trail alerts, SOS updates' },
            { label: '🌐 Language', sub: 'English' },
            { label: '📞 Emergency Number', sub: 'Nepal Police: 100' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingMeta}>{item.sub}</Text>
              </View>
              <Text style={{ color: Colors.text3, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: Spacing.lg, paddingBottom: 40 }}>
          <Button title="Sign Out" onPress={handleLogout} variant="outline" />
          <Text style={styles.version}>Nepal Tour App v1.0 · Powered by 💙 Nepal</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statNum}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  profileCard: {
    backgroundColor: Colors.card2, margin: Spacing.lg,
    borderRadius: Radius.xl, padding: Spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    background: Colors.accent,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#000' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text },
  email: { fontSize: 13, color: Colors.text3, marginTop: 2, marginBottom: 8 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  rankLabel: { fontSize: 15, fontWeight: '700' },
  verifiedBadge: {
    backgroundColor: Colors.teal + '22', color: Colors.teal,
    fontSize: 11, paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, fontWeight: '600', borderWidth: 1, borderColor: Colors.teal + '44',
  },
  creditsBox: { width: '100%' },
  creditsLabel: { fontSize: 12, color: Colors.text3 },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  progressFill: { height: '100%', borderRadius: 3 },
  statsRow: {
    flexDirection: 'row', marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg, gap: 8,
  },
  statBox: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center',
  },
  statNum: { fontSize: 20, fontWeight: '800', color: Colors.accent },
  statLabel: { fontSize: 10, color: Colors.text3, marginTop: 2 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeCard: {
    width: '47%', backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center',
  },
  badgeCardLocked: { opacity: 0.6 },
  badgeIcon: { fontSize: 28, marginBottom: 6 },
  badgeTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  badgeSub: { fontSize: 10, color: Colors.text3, textAlign: 'center', marginTop: 2 },
  lockedText: { fontSize: 12, marginTop: 4 },
  visitRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10,
  },
  visitDot: { width: 8, height: 8, borderRadius: 4 },
  visitName: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  visitMeta: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  visitPts: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  addContactBtn: {
    backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, borderStyle: 'dashed', padding: Spacing.lg, alignItems: 'center',
  },
  addContactText: { fontSize: 14, color: Colors.accent, fontWeight: '600' },
  addContactSub: { fontSize: 12, color: Colors.text3, marginTop: 4 },
  contactRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  contactName: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  contactMeta: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  settingLabel: { fontSize: 14, color: Colors.text },
  settingMeta: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  version: { fontSize: 12, color: Colors.text3, textAlign: 'center', marginTop: 16 },
});