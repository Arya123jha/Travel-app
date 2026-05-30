// src/screens/MapScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, SafeAreaView, Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useLocation } from '../hooks/useLocation';
import { EBC_ROUTE, ANNAPURNA_ROUTE, LANGTANG_ROUTE } from '../data/trekRoutes';
import { Button, Card, Badge, RatingStars } from '../components/UIComponents';
import type { TrekRoute, Checkpoint, Accommodation, HazardZone, MedicalPost } from '../types';

const { width } = Dimensions.get('window');

type SelectedPOI =
  | { kind: 'checkpoint'; data: Checkpoint }
  | { kind: 'hotel'; data: Accommodation }
  | { kind: 'hazard'; data: HazardZone }
  | { kind: 'medical'; data: MedicalPost };

const ROUTES = [EBC_ROUTE, ANNAPURNA_ROUTE, LANGTANG_ROUTE];

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { location } = useLocation();
  const [activeRoute, setActiveRoute] = useState<TrekRoute>(EBC_ROUTE);
  const [selectedPOI, setSelectedPOI] = useState<SelectedPOI | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [showRouteList, setShowRouteList] = useState(false);

  // Center map on first checkpoint when route changes
  useEffect(() => {
    const cp = activeRoute.checkpoints[0];
    if (cp && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: cp.latitude,
        longitude: cp.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }, 600);
    }
  }, [activeRoute]);

  const routeCoords = activeRoute.checkpoints.map(cp => ({
    latitude: cp.latitude,
    longitude: cp.longitude,
  }));

  // Simulate user passed first 5 checkpoints
  const passedIds = activeRoute.checkpoints.slice(0, 5).map(c => c.id);
  const passedCoords = activeRoute.checkpoints
    .filter(c => passedIds.includes(c.id))
    .map(c => ({ latitude: c.latitude, longitude: c.longitude }));

  const initialRegion = {
    latitude: activeRoute.checkpoints[3]?.latitude ?? 27.8,
    longitude: activeRoute.checkpoints[3]?.longitude ?? 86.76,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6,
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Route selector header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.routeBtn} onPress={() => setShowRouteList(true)}>
          <Text style={styles.routeName}>{activeRoute.name}</Text>
          <Text style={styles.routeMeta}>
            {activeRoute.durationDays}d · {activeRoute.maxAltitudeM}m max · {activeRoute.difficulty}
          </Text>
        </TouchableOpacity>
        <View style={styles.mapTypeRow}>
          {(['standard', 'satellite', 'terrain'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setMapType(t)}
              style={[styles.mapTypeBtn, mapType === t && styles.mapTypeBtnActive]}
            >
              <Text style={{ fontSize: 10, color: mapType === t ? '#000' : Colors.text3, textTransform: 'capitalize' }}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        mapType={mapType}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
      >
        {/* Full route line (dashed look via segment) */}
        <Polyline
          coordinates={routeCoords}
          strokeColor="rgba(232,165,60,0.4)"
          strokeWidth={3}
          lineDashPattern={[8, 5]}
        />

        {/* Completed route */}
        {passedCoords.length > 1 && (
          <Polyline
            coordinates={passedCoords}
            strokeColor={Colors.accent}
            strokeWidth={4}
          />
        )}

        {/* Checkpoints */}
        {activeRoute.checkpoints.map((cp) => {
          const passed = passedIds.includes(cp.id);
          return (
            <Marker
              key={cp.id}
              coordinate={{ latitude: cp.latitude, longitude: cp.longitude }}
              onPress={() => setSelectedPOI({ kind: 'checkpoint', data: cp })}
            >
              <View style={[styles.cpMarker, passed && styles.cpMarkerDone]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: passed ? '#000' : Colors.accent }}>
                  {cp.dayNumber}
                </Text>
              </View>
            </Marker>
          );
        })}

        {/* Hotels */}
        {activeRoute.hotels.map((h) => (
          <Marker
            key={h.id}
            coordinate={{ latitude: h.latitude, longitude: h.longitude }}
            onPress={() => setSelectedPOI({ kind: 'hotel', data: h })}
          >
            <View style={styles.poiMarker}>
              <Text style={{ fontSize: 16 }}>🏡</Text>
            </View>
          </Marker>
        ))}

        {/* Medical posts */}
        {activeRoute.medicalPosts.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            onPress={() => setSelectedPOI({ kind: 'medical', data: m })}
          >
            <View style={styles.poiMarker}>
              <Text style={{ fontSize: 16 }}>🩺</Text>
            </View>
          </Marker>
        ))}

        {/* Hazard zones */}
        {activeRoute.hazardZones.map((hz) => (
          <React.Fragment key={hz.id}>
            <Circle
              center={{ latitude: hz.latitude, longitude: hz.longitude }}
              radius={300}
              fillColor="rgba(255,71,87,0.15)"
              strokeColor="rgba(255,71,87,0.5)"
              strokeWidth={1}
            />
            <Marker
              coordinate={{ latitude: hz.latitude, longitude: hz.longitude }}
              onPress={() => setSelectedPOI({ kind: 'hazard', data: hz })}
            >
              <Text style={{ fontSize: 20 }}>⚠️</Text>
            </Marker>
          </React.Fragment>
        ))}

        {/* Live user location pulse (custom) */}
        {location && (
          <Circle
            center={{ latitude: location.latitude, longitude: location.longitude }}
            radius={200}
            fillColor="rgba(45,212,182,0.15)"
            strokeColor={Colors.teal}
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* Altitude / legend bar */}
      <View style={styles.legendBar}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.text3 }]} />
          <Text style={styles.legendText}>Ahead</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendText}>🏡 Stay</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendText}>⚠️ Risk</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendText}>🩺 Medical</Text>
        </View>
        {location && (
          <View style={[styles.legendItem, { marginLeft: 'auto' }]}>
            <Text style={[styles.legendText, { color: Colors.teal, fontWeight: '600' }]}>
              📍 {Math.round(location.altitudeM)}m
            </Text>
          </View>
        )}
      </View>

      {/* POI Detail Modal */}
      <Modal
        visible={!!selectedPOI}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPOI(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPOI(null)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            {selectedPOI && <POIDetail poi={selectedPOI} onClose={() => setSelectedPOI(null)} />}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Route picker Modal */}
      <Modal
        visible={showRouteList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRouteList(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRouteList(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose Trek Route</Text>
            {ROUTES.map(r => (
              <TouchableOpacity
                key={r.id}
                style={[styles.routeOption, activeRoute.id === r.id && styles.routeOptionActive]}
                onPress={() => { setActiveRoute(r); setShowRouteList(false); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeOptionName}>{r.name}</Text>
                  <Text style={styles.routeOptionMeta}>
                    {r.durationDays} days · {r.maxAltitudeM}m max · {r.difficulty}
                  </Text>
                </View>
                {activeRoute.id === r.id && <Text style={{ color: Colors.accent, fontSize: 18 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function POIDetail({ poi, onClose }: { poi: SelectedPOI; onClose: () => void }) {
  if (poi.kind === 'checkpoint') {
    const cp = poi.data;
    return (
      <View>
        <Text style={styles.modalTitle}>📍 {cp.name}</Text>
        <Text style={styles.modalSub}>{cp.description}</Text>
        <View style={styles.statRow}>
          <StatChip label="Altitude" value={`${cp.altitudeM}m`} color={Colors.blue} />
          <StatChip label="Credits" value={`+${cp.credits}`} color={Colors.accent} />
          <StatChip label="Day" value={`Day ${cp.dayNumber}`} color={Colors.teal} />
        </View>
        <Button title="Scan QR to check in" onPress={onClose} style={{ marginTop: 16 }} />
      </View>
    );
  }
  if (poi.kind === 'hotel') {
    const h = poi.data;
    return (
      <View>
        <Text style={styles.modalTitle}>{h.type === 'Tea House' ? '🍵' : '🏡'} {h.name}</Text>
        <RatingStars rating={h.rating} />
        <Text style={styles.modalSub}>{h.reviewCount} reviews · {h.altitudeM}m altitude</Text>
        <View style={styles.statRow}>
          <StatChip label="Per Night" value={`NPR ${h.priceNPR.toLocaleString()}`} color={Colors.accent} />
          <StatChip label="QR Credits" value={`+${h.qrCredits}`} color={Colors.teal} />
          <StatChip label="Available" value={h.available ? 'Yes' : 'Full'} color={h.available ? Colors.green : Colors.red} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 12 }}>
          {h.amenities.map(a => <Badge key={a} label={a} />)}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Call" onPress={() => {}} variant="outline" style={{ flex: 1 }} />
          <Button title="Book Now" onPress={onClose} style={{ flex: 2 }} />
        </View>
      </View>
    );
  }
  if (poi.kind === 'hazard') {
    const hz = poi.data;
    return (
      <View>
        <Text style={styles.modalTitle}>⚠️ {hz.type}</Text>
        <Badge label={hz.severity + ' severity'} color={hz.severity === 'High' ? Colors.red : Colors.accent} />
        <Text style={[styles.modalSub, { marginTop: 10 }]}>{hz.description}</Text>
        <Text style={{ color: Colors.text3, fontSize: 12, marginTop: 8 }}>
          Verified by {hz.verifiedCount} trekkers
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Alt. Route" onPress={onClose} variant="outline" style={{ flex: 1 }} />
          <Button title="Report Update" onPress={onClose} style={{ flex: 1 }} />
        </View>
      </View>
    );
  }
  if (poi.kind === 'medical') {
    const m = poi.data;
    return (
      <View>
        <Text style={styles.modalTitle}>🩺 {m.name}</Text>
        <Text style={styles.modalSub}>{m.open24h ? '🟢 Open 24/7' : '🔴 Check hours'}</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginVertical: 10 }}>
          {m.hasOxygen && <Badge label="Oxygen" color={Colors.teal} />}
          {m.hasGamowBag && <Badge label="Gamow Bag" color={Colors.blue} />}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {m.services.map(s => <Badge key={s} label={s} />)}
        </View>
        <Button title={`📞 Call ${m.phone}`} onPress={() => {}} variant="danger" />
      </View>
    );
  }
  return null;
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statChip, { backgroundColor: color + '1A', borderColor: color + '44' }]}>
      <Text style={{ fontSize: 11, color: Colors.text3 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bg2,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  routeBtn: { marginBottom: 8 },
  routeName: { fontSize: 18, fontWeight: '800', color: Colors.text },
  routeMeta: { fontSize: 12, color: Colors.text2, marginTop: 2 },
  mapTypeRow: { flexDirection: 'row', gap: 6 },
  mapTypeBtn: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapTypeBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  map: { flex: 1 },
  legendBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: Colors.bg2,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.text3 },
  cpMarker: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.bg3,
    borderWidth: 2, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  cpMarkerDone: { backgroundColor: Colors.accent },
  poiMarker: {
    backgroundColor: Colors.bg2,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.bg2,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  modalSub: { fontSize: 14, color: Colors.text2, lineHeight: 20, marginBottom: 8 },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  statChip: {
    flex: 1, borderRadius: Radius.sm, padding: 10,
    borderWidth: 1, alignItems: 'center',
  },
  routeOption: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: 10,
  },
  routeOptionActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '15' },
  routeOptionName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  routeOptionMeta: { fontSize: 12, color: Colors.text3, marginTop: 2 },
});