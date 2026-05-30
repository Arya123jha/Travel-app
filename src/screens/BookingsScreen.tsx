// src/screens/BookingsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useAuth } from '../hooks/useAuth';
import { createBooking } from '../firebase/services';
import { Button, RatingStars, Badge, SectionHeader } from '../components/UIComponents';
import { EBC_ROUTE, GUIDES, TRANSPORT } from '../data/trekRoutes';
import type { Accommodation, Guide, Transport } from '../types';

type Tab = 'hotels' | 'transport' | 'guides';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('hotels');
  const [selectedItem, setSelectedItem] = useState<Accommodation | Guide | Transport | null>(null);
  const [booking, setBooking] = useState(false);
  const { userProfile } = useAuth();

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'hotels', label: 'Stay', emoji: '🏡' },
    { id: 'transport', label: 'Transport', emoji: '🚌' },
    { id: 'guides', label: 'Guides', emoji: '🧭' },
  ];

  const handleBook = async (item: Accommodation | Guide | Transport) => {
    if (!userProfile) { Alert.alert('Login required'); return; }
    setBooking(true);
    try {
      await createBooking({
        userId: userProfile.uid,
        type: activeTab === 'hotels' ? 'Accommodation' : activeTab === 'transport' ? 'Transport' : 'Guide',
        itemId: item.id,
        itemName: (item as any).name,
        date: new Date(),
        status: 'Pending',
        totalNPR: (item as any).priceNPR || ((item as any).pricePerDayUSD || 0) * 133,
        createdAt: new Date(),
      });
      Alert.alert('Booking Confirmed! 🎉', `Your ${(item as any).name} booking is confirmed.`);
      setSelectedItem(null);
    } catch {
      Alert.alert('Error', 'Booking saved offline. Will confirm when connected.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.emoji} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HOTELS */}
        {activeTab === 'hotels' && EBC_ROUTE.hotels.map(hotel => (
          <TouchableOpacity
            key={hotel.id}
            style={styles.listCard}
            onPress={() => setSelectedItem(hotel)}
          >
            <View style={styles.imgBox}>
              <Text style={{ fontSize: hotel.type === 'Tea House' ? 24 : 28 }}>
                {hotel.type === 'Hotel' ? '🏨' : hotel.type === 'Tea House' ? '🍵' : hotel.type === 'Homestay' ? '🏡' : '⛺'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{hotel.name}</Text>
              <Text style={styles.cardMeta}>{hotel.type} · {hotel.altitudeM}m altitude</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <RatingStars rating={hotel.rating} size={12} />
                <Text style={styles.cardMeta}>{hotel.reviewCount} reviews</Text>
              </View>
              {!hotel.available && <Badge label="Fully Booked" color={Colors.red} />}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>NPR {hotel.priceNPR.toLocaleString()}</Text>
              <Text style={styles.priceUnit}>/night</Text>
              {hotel.qrCredits > 0 && (
                <Text style={styles.qrTag}>+{hotel.qrCredits} 💠</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* TRANSPORT */}
        {activeTab === 'transport' && TRANSPORT.map(t => (
          <TouchableOpacity
            key={t.id}
            style={styles.listCard}
            onPress={() => setSelectedItem(t)}
          >
            <View style={styles.imgBox}>
              <Text style={{ fontSize: 28 }}>
                {t.type === 'Flight' ? '✈️' : t.type === 'Bus' ? '🚌' : t.type === 'Helicopter' ? '🚁' : '🚙'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{t.from} → {t.to}</Text>
              <Text style={styles.cardMeta}>{t.operator} · {t.type}</Text>
              <Text style={styles.cardMeta}>
                🕐 {t.departureTime} · {Math.floor(t.durationMinutes / 60)}h {t.durationMinutes % 60}m
              </Text>
              <Text style={styles.cardMeta}>💺 {t.seatsAvailable} seats left</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>
                {t.priceNPR > 10000 ? `$${Math.round(t.priceNPR / 133)}` : `NPR ${t.priceNPR.toLocaleString()}`}
              </Text>
              <Text style={styles.priceUnit}>one way</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* GUIDES */}
        {activeTab === 'guides' && GUIDES.map(g => (
          <TouchableOpacity
            key={g.id}
            style={styles.listCard}
            onPress={() => setSelectedItem(g)}
          >
            <View style={[styles.imgBox, { backgroundColor: Colors.teal + '22' }]}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.teal }}>
                {g.name.split(' ').map(w => w[0]).join('')}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{g.name}</Text>
              <Text style={styles.cardMeta}>{g.experienceYears}yr exp · {g.languages.join(', ')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <RatingStars rating={g.rating} size={12} />
                <Text style={styles.cardMeta}>{g.reviewCount} reviews</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                {g.isEmergencyCertified && <Badge label="Emergency cert." color={Colors.teal} />}
                {g.isWomenLed && <Badge label="Women-led" color={Colors.purple} />}
                {!g.available && <Badge label="Unavailable" color={Colors.red} />}
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>${g.pricePerDayUSD}</Text>
              <Text style={styles.priceUnit}>/day</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedItem} transparent animationType="slide" onRequestClose={() => setSelectedItem(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelectedItem(null)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            {selectedItem && (
              <DetailView
                item={selectedItem}
                tab={activeTab}
                onBook={() => handleBook(selectedItem)}
                booking={booking}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function DetailView({
  item, tab, onBook, booking,
}: { item: any; tab: Tab; onBook: () => void; booking: boolean }) {
  if (tab === 'hotels') {
    return (
      <>
        <Text style={styles.detailTitle}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <RatingStars rating={item.rating} />
          <Text style={{ fontSize: 13, color: Colors.text3 }}>{item.reviewCount} reviews</Text>
        </View>
        <Text style={{ fontSize: 13, color: Colors.text3, marginBottom: 16 }}>
          {item.type} · {item.altitudeM}m altitude
        </Text>
        <View style={styles.statRow}>
          <StatCell label="Per Night" value={`NPR ${item.priceNPR.toLocaleString()}`} color={Colors.accent} />
          <StatCell label="QR Credits" value={`+${item.qrCredits}`} color={Colors.teal} />
          <StatCell label="Status" value={item.available ? 'Open' : 'Full'} color={item.available ? Colors.green : Colors.red} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 12 }}>
          {item.amenities.map((a: string) => <Badge key={a} label={a} />)}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Directions" onPress={() => {}} variant="outline" style={{ flex: 1 }} />
          <Button title="Book Now" onPress={onBook} loading={booking} style={{ flex: 2 }} disabled={!item.available} />
        </View>
      </>
    );
  }
  if (tab === 'transport') {
    return (
      <>
        <Text style={styles.detailTitle}>{item.from} → {item.to}</Text>
        <Text style={{ fontSize: 13, color: Colors.text3, marginBottom: 16 }}>{item.operator} · {item.type}</Text>
        <View style={styles.statRow}>
          <StatCell label="Price" value={`NPR ${item.priceNPR.toLocaleString()}`} color={Colors.accent} />
          <StatCell label="Departs" value={item.departureTime} color={Colors.blue} />
          <StatCell label="Seats" value={`${item.seatsAvailable}`} color={Colors.green} />
        </View>
        <Button title="Book Now" onPress={onBook} loading={booking} style={{ marginTop: 20 }} />
      </>
    );
  }
  // guide
  return (
    <>
      <Text style={styles.detailTitle}>{item.name}</Text>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {item.isEmergencyCertified && <Badge label="Emergency Certified" color={Colors.teal} />}
        {item.isWomenLed && <Badge label="Women-led" color={Colors.purple} />}
      </View>
      <Text style={{ fontSize: 14, color: Colors.text2, lineHeight: 20, marginBottom: 16 }}>{item.bio}</Text>
      <View style={styles.statRow}>
        <StatCell label="Rate" value={`$${item.pricePerDayUSD}/day`} color={Colors.accent} />
        <StatCell label="Experience" value={`${item.experienceYears}yr`} color={Colors.blue} />
        <StatCell label="Rating" value={`★ ${item.rating}`} color={Colors.teal} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
        <Button title="Message" onPress={() => {}} variant="outline" style={{ flex: 1 }} />
        <Button title={`Book ${item.name.split(' ')[0]}`} onPress={onBook} loading={booking} style={{ flex: 2 }} disabled={!item.available} />
      </View>
    </>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statCell, { backgroundColor: color + '1A', borderColor: color + '44' }]}>
      <Text style={{ fontSize: 11, color: Colors.text3 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.lg, paddingTop: Spacing.xl },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 8, marginBottom: 16 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.text3 },
  tabTextActive: { color: '#000' },
  listCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: Spacing.lg, marginBottom: 10,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.lg, padding: 14,
  },
  imgBox: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: Colors.card2, alignItems: 'center', justifyContent: 'center',
  },
  cardName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  cardMeta: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '800', color: Colors.accent },
  priceUnit: { fontSize: 11, color: Colors.text3 },
  qrTag: { fontSize: 11, color: Colors.teal, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg2, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, paddingBottom: 36, borderTopWidth: 1, borderTopColor: Colors.border,
    maxHeight: '80%',
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  detailTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  statRow: { flexDirection: 'row', gap: 8 },
  statCell: { flex: 1, borderRadius: Radius.sm, padding: 10, borderWidth: 1, alignItems: 'center' },
});