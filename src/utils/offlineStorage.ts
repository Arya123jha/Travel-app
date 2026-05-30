
// src/utils/offlineStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TrekRoute, QRCheckin, SOSPacket } from '../types';

const KEYS = {
  USER: '@nepal_tour:user',
  TREK_ROUTES: '@nepal_tour:trek_routes',
  CHECKINS_QUEUE: '@nepal_tour:checkins_queue',
  SOS_QUEUE: '@nepal_tour:sos_queue',
  ACTIVE_TREK: '@nepal_tour:active_trek',
  LOCATION_HISTORY: '@nepal_tour:location_history',
  DOWNLOADED_MAPS: '@nepal_tour:downloaded_maps',
};

// ─── GENERIC ──────────────────────────────────────────────────────────────────

export const saveOffline = async (key: string, value: unknown) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getOffline = async <T>(key: string): Promise<T | null> => {
  const val = await AsyncStorage.getItem(key);
  return val ? JSON.parse(val) : null;
};

export const removeOffline = async (key: string) => AsyncStorage.removeItem(key);

// ─── USER ─────────────────────────────────────────────────────────────────────

export const saveUserLocally = (user: unknown) => saveOffline(KEYS.USER, user);
export const getUserLocally = () => getOffline(KEYS.USER);

// ─── TREK ROUTES ──────────────────────────────────────────────────────────────

export const cacheTrekRoute = async (route: TrekRoute) => {
  const existing = (await getOffline<TrekRoute[]>(KEYS.TREK_ROUTES)) || [];
  const filtered = existing.filter(r => r.id !== route.id);
  await saveOffline(KEYS.TREK_ROUTES, [...filtered, { ...route, offlineCached: true }]);
};

export const getCachedRoutes = (): Promise<TrekRoute[] | null> =>
  getOffline<TrekRoute[]>(KEYS.TREK_ROUTES);

export const getCachedRoute = async (routeId: string): Promise<TrekRoute | null> => {
  const routes = await getCachedRoutes();
  return routes?.find(r => r.id === routeId) ?? null;
};

// ─── QR CHECK-IN QUEUE ────────────────────────────────────────────────────────

export const queueCheckin = async (checkin: Omit<QRCheckin, 'id'>) => {
  const queue = (await getOffline<QRCheckin[]>(KEYS.CHECKINS_QUEUE)) || [];
  queue.push({ ...checkin, id: `local_${Date.now()}` });
  await saveOffline(KEYS.CHECKINS_QUEUE, queue);
};

export const getCheckinQueue = (): Promise<QRCheckin[] | null> =>
  getOffline<QRCheckin[]>(KEYS.CHECKINS_QUEUE);

export const clearCheckinQueue = () => removeOffline(KEYS.CHECKINS_QUEUE);

// ─── SOS QUEUE ────────────────────────────────────────────────────────────────

export const queueSOS = async (packet: Omit<SOSPacket, 'id'>) => {
  const queue = (await getOffline<SOSPacket[]>(KEYS.SOS_QUEUE)) || [];
  queue.push({ ...packet, id: `sos_${Date.now()}` });
  await saveOffline(KEYS.SOS_QUEUE, queue);
};

export const getSosQueue = (): Promise<SOSPacket[] | null> =>
  getOffline<SOSPacket[]>(KEYS.SOS_QUEUE);

export const clearSosQueue = () => removeOffline(KEYS.SOS_QUEUE);

// ─── LOCATION HISTORY ─────────────────────────────────────────────────────────

export const appendLocationHistory = async (point: {
  lat: number; lng: number; altitudeM: number; time: string;
}) => {
  const history = (await getOffline<typeof point[]>(KEYS.LOCATION_HISTORY)) || [];
  // Keep last 500 points (~8hrs at 1 point/min)
  const trimmed = history.slice(-499);
  trimmed.push(point);
  await saveOffline(KEYS.LOCATION_HISTORY, trimmed);
};

export const getLocationHistory = () =>
  getOffline<{ lat: number; lng: number; altitudeM: number; time: string }[]>(
    KEYS.LOCATION_HISTORY
  );

// ─── ACTIVE TREK ──────────────────────────────────────────────────────────────

export const setActiveTrek = (trek: { routeId: string; startedAt: string; checkpointsPassed: string[] }) =>
  saveOffline(KEYS.ACTIVE_TREK, trek);

export const getActiveTrek = () =>
  getOffline<{ routeId: string; startedAt: string; checkpointsPassed: string[] }>(KEYS.ACTIVE_TREK);

export const markCheckpointPassed = async (checkpointId: string) => {
  const trek = await getActiveTrek();
  if (!trek) return;
  if (!trek.checkpointsPassed.includes(checkpointId)) {
    trek.checkpointsPassed.push(checkpointId);
    await setActiveTrek(trek);
  }
};

// ─── SYNC (call when back online) ─────────────────────────────────────────────

export const syncQueuedData = async (
  syncCheckin: (c: QRCheckin) => Promise<void>,
  syncSos: (s: SOSPacket) => Promise<void>
) => {
  const checkins = await getCheckinQueue();
  if (checkins?.length) {
    for (const c of checkins) {
      try {
        await syncCheckin(c);
      } catch {
        /* keep in queue if fails */
      }
    }
    await clearCheckinQueue();
  }

  const sosList = await getSosQueue();
  if (sosList?.length) {
    for (const s of sosList) {
      try {
        await syncSos(s);
      } catch {
        /* keep in queue */
      }
    }
    await clearSosQueue();
  }
};