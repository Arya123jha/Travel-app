// src/hooks/useLocation.ts
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { appendLocationHistory } from '../utils/offlineStorage';

interface LocationData {
  latitude: number;
  longitude: number;
  altitudeM: number;
  accuracy: number;
  timestamp: number;
}

export const useLocation = (trackBackground = false) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied.');
        return;
      }
      setPermissionGranted(true);

      if (trackBackground) {
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== 'granted') {
          console.warn('Background location not granted — foreground only');
        }
      }

      // Get initial position
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const loc = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        altitudeM: pos.coords.altitude ?? 0,
        accuracy: pos.coords.accuracy ?? 0,
        timestamp: pos.timestamp,
      };
      setLocation(loc);

      // Watch position (every 30s during trekking)
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000,
          distanceInterval: 50,
        },
        async (newPos) => {
          const updated = {
            latitude: newPos.coords.latitude,
            longitude: newPos.coords.longitude,
            altitudeM: newPos.coords.altitude ?? 0,
            accuracy: newPos.coords.accuracy ?? 0,
            timestamp: newPos.timestamp,
          };
          setLocation(updated);
          await appendLocationHistory({
            lat: updated.latitude,
            lng: updated.longitude,
            altitudeM: updated.altitudeM,
            time: new Date().toISOString(),
          });
        }
      );
    })();

    return () => {
      watchRef.current?.remove();
    };
  }, [trackBackground]);

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    if (!permissionGranted) return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      altitudeM: pos.coords.altitude ?? 0,
      accuracy: pos.coords.accuracy ?? 0,
      timestamp: pos.timestamp,
    };
  };

  return { location, permissionGranted, error, getCurrentLocation };
};

// Haversine distance in meters
export const getDistanceMeters = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};