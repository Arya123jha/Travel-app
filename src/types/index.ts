// src/types/index.ts

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  isVerifiedTourist: boolean;
  passportNumber?: string;
  nationality?: string;
  credits: number;
  rank: TrekkerRank;
  createdAt: Date;
  emergencyContacts: EmergencyContact[];
}

export type TrekkerRank =
  | 'Trail Starter'
  | 'Hill Walker'
  | 'Mountain Navigator'
  | 'Himalayan Explorer'
  | 'Summit Master';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface TrekRoute {
  id: string;
  name: string;
  region: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Extreme';
  durationDays: number;
  maxAltitudeM: number;
  checkpoints: Checkpoint[];
  hotels: Accommodation[];
  medicalPosts: MedicalPost[];
  hazardZones: HazardZone[];
  guides: Guide[];
  restaurants: Restaurant[];
  offlineCached: boolean;
}

export interface Checkpoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitudeM: number;
  credits: number;
  qrCode: string;
  description?: string;
  dayNumber: number;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'Hotel' | 'Homestay' | 'Tea House' | 'Lodge';
  latitude: number;
  longitude: number;
  altitudeM: number;
  priceNPR: number;
  rating: number;
  reviewCount: number;
  photos: string[];
  phone?: string;
  amenities: string[];
  available: boolean;
  qrCredits: number;
}

export interface MedicalPost {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  phone: string;
  services: string[];
  open24h: boolean;
  hasOxygen: boolean;
  hasGamowBag: boolean;
}

export interface HazardZone {
  id: string;
  type: 'Landslide' | 'Avalanche' | 'Loose Rocks' | 'Flood' | 'Unsafe Bridge';
  latitude: number;
  longitude: number;
  description: string;
  reportedAt: Date;
  verifiedCount: number;
  severity: 'Low' | 'Medium' | 'High';
}

export interface Guide {
  id: string;
  name: string;
  photoURL?: string;
  languages: string[];
  experienceYears: number;
  routes: string[];
  rating: number;
  reviewCount: number;
  pricePerDayUSD: number;
  isEmergencyCertified: boolean;
  isWomenLed: boolean;
  phone: string;
  available: boolean;
  bio: string;
}

export interface Restaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  cuisine: string[];
  priceRange: 'Budget' | 'Mid' | 'High';
  rating: number;
  qrCredits: number;
}

export interface QRCheckin {
  id: string;
  userId: string;
  locationId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  altitudeM: number;
  creditsEarned: number;
  foodConsumed?: string[];
  timestamp: Date;
  synced: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  type: 'Accommodation' | 'Transport' | 'Guide';
  itemId: string;
  itemName: string;
  date: Date;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  totalNPR: number;
  notes?: string;
  createdAt: Date;
}

export interface Transport {
  id: string;
  type: 'Bus' | 'Jeep' | 'Flight' | 'Helicopter';
  from: string;
  to: string;
  departureTime: string;
  durationMinutes: number;
  priceNPR: number;
  seatsAvailable: number;
  rating: number;
  operator: string;
}

export interface SOSPacket {
  id: string;
  userId: string;
  userProfile: Partial<User>;
  emergencyType: string[];
  symptoms: string[];
  latitude: number;
  longitude: number;
  altitudeM: number;
  lastCheckpoint?: string;
  trailHistory: { lat: number; lng: number; time: Date }[];
  advice: string[];
  timestamp: Date;
  sent: boolean;
  relayMethod?: 'direct' | 'bluetooth' | 'teahouse' | 'pending';
}

export interface Feedback {
  id: string;
  userId: string;
  locationId: string;
  locationName: string;
  rating: number;
  comment: string;
  photos?: string[];
  trailReport?: TrailReport;
  createdAt: Date;
}

export interface TrailReport {
  landslide: boolean;
  unsafeBridge: boolean;
  crowded: boolean;
  amazingView: boolean;
  customNote?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  unlocked: boolean;
}