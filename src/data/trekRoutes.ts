// src/data/trekRoutes.ts
import type { TrekRoute, Accommodation, Guide, Transport } from '../types';

export const EBC_ROUTE: TrekRoute = {
  id: 'everest-base-camp',
  name: 'Everest Base Camp',
  region: 'Khumbu',
  difficulty: 'Hard',
  durationDays: 14,
  maxAltitudeM: 5364,
  offlineCached: false,
  checkpoints: [
    {
      id: 'cp-lukla', name: 'Lukla Airport', latitude: 27.6869, longitude: 86.7291,
      altitudeM: 2860, credits: 10, qrCode: 'QR_LUKLA_001', dayNumber: 1,
      description: 'Trek starting point — famous Tenzing-Hillary Airport',
    },
    {
      id: 'cp-phakding', name: 'Phakding', latitude: 27.7397, longitude: 86.7134,
      altitudeM: 2610, credits: 15, qrCode: 'QR_PHAKDING_001', dayNumber: 1,
      description: 'First night stop along the Dudh Koshi river',
    },
    {
      id: 'cp-namche', name: 'Namche Bazaar', latitude: 27.8069, longitude: 86.7134,
      altitudeM: 3440, credits: 20, qrCode: 'QR_NAMCHE_001', dayNumber: 2,
      description: 'Gateway to Everest — bustling Sherpa market town',
    },
    {
      id: 'cp-tengboche', name: 'Tengboche', latitude: 27.8361, longitude: 86.7637,
      altitudeM: 3867, credits: 20, qrCode: 'QR_TENGBOCHE_001', dayNumber: 4,
      description: 'Famous monastery with Everest views',
    },
    {
      id: 'cp-dingboche', name: 'Dingboche', latitude: 27.8956, longitude: 86.8296,
      altitudeM: 4410, credits: 25, qrCode: 'QR_DINGBOCHE_001', dayNumber: 6,
      description: 'Acclimatization stop in upper Khumbu',
    },
    {
      id: 'cp-lobuche', name: 'Lobuche', latitude: 27.9375, longitude: 86.8105,
      altitudeM: 4940, credits: 30, qrCode: 'QR_LOBUCHE_001', dayNumber: 9,
      description: 'Last major stop before base camp',
    },
    {
      id: 'cp-gorak-shep', name: 'Gorak Shep', latitude: 28.0006, longitude: 86.8293,
      altitudeM: 5164, credits: 35, qrCode: 'QR_GORAKSHEP_001', dayNumber: 11,
      description: 'Base camp for EBC and Kala Patthar summit',
    },
    {
      id: 'cp-ebc', name: 'Everest Base Camp', latitude: 28.0025, longitude: 86.8528,
      altitudeM: 5364, credits: 100, qrCode: 'QR_EBC_001', dayNumber: 12,
      description: '🏔 You made it! Everest Base Camp at 5,364m',
    },
  ],
  hotels: [
    {
      id: 'h-namche-1', name: 'Hotel Everest View', type: 'Hotel',
      latitude: 27.8069, longitude: 86.7134, altitudeM: 3440,
      priceNPR: 2800, rating: 4.8, reviewCount: 142,
      photos: [], phone: '+977-38-540028',
      amenities: ['Hot water', 'WiFi', 'Restaurant', 'Mountain view'],
      available: true, qrCredits: 15,
    },
    {
      id: 'h-tengboche-1', name: 'Tengboche Tea House', type: 'Tea House',
      latitude: 27.8361, longitude: 86.7637, altitudeM: 3867,
      priceNPR: 1200, rating: 4.6, reviewCount: 88,
      photos: [], phone: '+977-38-560033',
      amenities: ['Dal bhat', 'Yak wool blankets', 'Hot tea'],
      available: true, qrCredits: 10,
    },
    {
      id: 'h-dingboche-1', name: 'Himalayan Lodge', type: 'Lodge',
      latitude: 27.8956, longitude: 86.8296, altitudeM: 4410,
      priceNPR: 900, rating: 4.5, reviewCount: 64,
      photos: [], amenities: ['Oxygen available', 'Hot meals', 'Heating'],
      available: true, qrCredits: 10,
    },
    {
      id: 'h-gorak-1', name: 'Gorak Shep Lodge', type: 'Lodge',
      latitude: 28.0006, longitude: 86.8293, altitudeM: 5164,
      priceNPR: 800, rating: 4.3, reviewCount: 56,
      photos: [], amenities: ['Emergency oxygen', 'Meals'],
      available: true, qrCredits: 20,
    },
  ],
  medicalPosts: [
    {
      id: 'med-pheriche', name: 'Himalayan Rescue Association — Pheriche',
      latitude: 27.8925, longitude: 86.8186, phone: '+977-1-4440066',
      services: ['AMS treatment', 'Altitude sickness consultation', 'Evacuation coordination'],
      open24h: true, hasOxygen: true, hasGamowBag: true,
    },
    {
      id: 'med-namche', name: 'Namche Medical Clinic',
      latitude: 27.8069, longitude: 86.7134, phone: '+977-38-540066',
      services: ['General health', 'AMS check', 'First aid'],
      open24h: false, hasOxygen: true, hasGamowBag: false,
    },
  ],
  hazardZones: [
    {
      id: 'hz-1', type: 'Loose Rocks',
      latitude: 27.8200, longitude: 86.7300,
      description: 'Loose rocks between Namche and Tengboche after rain',
      reportedAt: new Date(), verifiedCount: 3, severity: 'Medium',
    },
    {
      id: 'hz-2', type: 'Avalanche',
      latitude: 27.9600, longitude: 86.8200,
      description: 'Seasonal avalanche zone — use designated path',
      reportedAt: new Date(), verifiedCount: 5, severity: 'High',
    },
  ],
  guides: [],
  restaurants: [],
};

export const ANNAPURNA_ROUTE: TrekRoute = {
  id: 'annapurna-circuit',
  name: 'Annapurna Circuit',
  region: 'Annapurna',
  difficulty: 'Moderate',
  durationDays: 12,
  maxAltitudeM: 5416,
  offlineCached: false,
  checkpoints: [
    {
      id: 'ac-besisahar', name: 'Besisahar', latitude: 28.2306, longitude: 84.3817,
      altitudeM: 760, credits: 10, qrCode: 'QR_BESI_001', dayNumber: 1,
      description: 'Starting point of the Annapurna Circuit',
    },
    {
      id: 'ac-manang', name: 'Manang', latitude: 28.6720, longitude: 84.0181,
      altitudeM: 3519, credits: 20, qrCode: 'QR_MANANG_001', dayNumber: 6,
      description: 'Acclimatization village with Gangapurna views',
    },
    {
      id: 'ac-thorong-la', name: 'Thorong La Pass', latitude: 28.7948, longitude: 83.9306,
      altitudeM: 5416, credits: 80, qrCode: 'QR_THORONG_001', dayNumber: 9,
      description: 'Highest point of the circuit at 5,416m',
    },
  ],
  hotels: [], medicalPosts: [], hazardZones: [], guides: [], restaurants: [],
};

export const LANGTANG_ROUTE: TrekRoute = {
  id: 'langtang-valley',
  name: 'Langtang Valley',
  region: 'Langtang',
  difficulty: 'Moderate',
  durationDays: 7,
  maxAltitudeM: 3870,
  offlineCached: false,
  checkpoints: [
    {
      id: 'lt-syabru', name: 'Syabru Besi', latitude: 28.1583, longitude: 85.2102,
      altitudeM: 1460, credits: 10, qrCode: 'QR_SYABRU_001', dayNumber: 1,
      description: 'Gateway to Langtang',
    },
    {
      id: 'lt-langtang', name: 'Langtang Village', latitude: 28.2167, longitude: 85.5167,
      altitudeM: 3430, credits: 20, qrCode: 'QR_LANGTANG_001', dayNumber: 3,
      description: 'Rebuilt village after 2015 earthquake',
    },
  ],
  hotels: [], medicalPosts: [], hazardZones: [], guides: [], restaurants: [],
};

export const ALL_ROUTES = [EBC_ROUTE, ANNAPURNA_ROUTE, LANGTANG_ROUTE];

export const GUIDES: Guide[] = [
  {
    id: 'g-pemba', name: 'Pemba Sherpa', languages: ['Nepali', 'English', 'German'],
    experienceYears: 12, routes: ['everest-base-camp', 'annapurna-circuit'],
    rating: 4.9, reviewCount: 203, pricePerDayUSD: 45,
    isEmergencyCertified: true, isWomenLed: false,
    phone: '+977-9841234567', available: true,
    bio: 'Experienced high-altitude guide with first aid training. Summited Everest twice. Specializes in safe acclimatization planning.',
  },
  {
    id: 'g-sita', name: 'Sita Tamang', languages: ['Nepali', 'English'],
    experienceYears: 8, routes: ['langtang-valley', 'annapurna-circuit'],
    rating: 4.8, reviewCount: 127, pricePerDayUSD: 40,
    isEmergencyCertified: true, isWomenLed: true,
    phone: '+977-9841234568', available: true,
    bio: 'Nepal\'s top women-led guide. Expert in Langtang and Annapurna. Known for her warm hospitality and cultural insights.',
  },
  {
    id: 'g-dawa', name: 'Dawa Lama', languages: ['Nepali', 'English', 'French'],
    experienceYears: 15, routes: ['everest-base-camp', 'langtang-valley'],
    rating: 4.7, reviewCount: 318, pricePerDayUSD: 50,
    isEmergencyCertified: true, isWomenLed: false,
    phone: '+977-9841234569', available: false,
    bio: 'Senior guide with 15 years experience. Expert wilderness first responder. Has guided over 300 trekkers to EBC.',
  },
];

export const TRANSPORT: Transport[] = [
  {
    id: 't-ktm-lukla', type: 'Flight', from: 'Kathmandu', to: 'Lukla',
    departureTime: '06:00', durationMinutes: 35, priceNPR: 23000,
    seatsAvailable: 8, rating: 4.5, operator: 'Tara Air',
  },
  {
    id: 't-ktm-pokh', type: 'Bus', from: 'Kathmandu', to: 'Pokhara',
    departureTime: '07:30', durationMinutes: 420, priceNPR: 1200,
    seatsAvailable: 18, rating: 4.2, operator: 'Greenline Bus',
  },
  {
    id: 't-jeep-jiri', type: 'Jeep', from: 'Kathmandu', to: 'Jiri',
    departureTime: '06:00', durationMinutes: 360, priceNPR: 8500,
    seatsAvailable: 5, rating: 4.0, operator: 'Local Charter',
  },
  {
    id: 't-heli-ebc', type: 'Helicopter', from: 'Kathmandu', to: 'Everest Base Camp',
    departureTime: '07:00', durationMinutes: 60, priceNPR: 120000,
    seatsAvailable: 4, rating: 4.9, operator: 'Simrik Air',
  },
];