# 🏔 Nepal Tour — Smart Tourism Super App

A secure, **offline-first** smart tourism platform for Nepal combining QR-verified travel, trekking maps, emergency SOS, bookings, and tourism rewards in one ecosystem.

> Built with React Native (Expo) + Firebase

---

## 📱 Features

| Feature | Description |
|---|---|
| 🗺 **Offline Trek Maps** | Full EBC, Annapurna, Langtang routes with markers, hazard zones, medical posts |
| 📷 **QR Check-ins** | Scan QR codes at checkpoints to earn credits — GPS + timestamp verified |
| 🚨 **SOS Emergency** | One-tap emergency with GPS packet, Bluetooth relay, offline queue |
| 🏨 **Bookings** | Hotels, transport, guide booking with Firebase confirmation |
| 💠 **Rewards System** | Credits → rank system (Trail Starter → Summit Master) |
| 🛂 **Tourist Verification** | Passport upload unlocks all features |
| 📡 **Offline-first** | Everything queues locally, syncs on reconnect |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native + Expo SDK 51 |
| Navigation | React Navigation v6 (Stack + BottomTabs) |
| Maps | `react-native-maps` (Google Maps provider) |
| Auth | Firebase Authentication |
| Database | Firebase Firestore (with offline persistence) |
| Storage | Firebase Storage (passport uploads) |
| Offline | AsyncStorage queue system |
| Location | expo-location |
| Camera | expo-camera (QR scanner) |
| Language | TypeScript |

---

## 📁 Project Structure

```
NepalTourApp/
├── App.tsx                        # Root component + navigation setup
├── index.js                       # Expo entry point
├── app.json                       # Expo config (permissions, splash, etc.)
├── babel.config.js                # Babel (required for reanimated)
├── tsconfig.json
├── package.json
│
└── src/
    ├── types/
    │   └── index.ts               # All TypeScript interfaces
    │
    ├── utils/
    │   ├── theme.ts               # Colors, spacing, radius tokens
    │   └── offlineStorage.ts      # AsyncStorage queue system
    │
    ├── firebase/
    │   ├── config.ts              # Firebase init ← PUT YOUR KEYS HERE
    │   └── services.ts            # All Firestore/Auth/Storage functions
    │
    ├── hooks/
    │   ├── useAuth.tsx            # Auth context + user profile
    │   └── useLocation.ts         # GPS tracking hook
    │
    ├── data/
    │   └── trekRoutes.ts          # Static trek data (EBC, Annapurna, Langtang)
    │
    ├── components/
    │   └── UIComponents.tsx       # Button, Card, Badge, RatingStars, etc.
    │
    └── screens/
        ├── AuthScreen.tsx         # Login / Register
        ├── HomeScreen.tsx         # Dashboard
        ├── MapScreen.tsx          # Trek map (react-native-maps)
        ├── ScanScreen.tsx         # QR scanner (expo-camera)
        ├── SOSScreen.tsx          # Emergency SOS
        ├── BookingsScreen.tsx     # Hotels / Transport / Guides
        ├── ProfileScreen.tsx      # Profile, achievements, settings
        └── VerifyScreen.tsx       # Tourist passport verification
```

---

## 🚀 Getting Started (After Cloning)

### Step 1 — Prerequisites

Make sure you have these installed:

```bash
# Node.js 18 or higher
node -v

# Expo CLI
npm install -g expo-cli

# iOS: Xcode (Mac only) or Expo Go app on iPhone
# Android: Android Studio with emulator OR Expo Go app on Android
```

### Step 2 — Install dependencies

```bash
git clone https://github.com/YOUR_USERNAME/nepal-tour-app.git
cd nepal-tour-app
npm install
```

### Step 3 — Firebase Setup (Required)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it `NepalTourApp`
3. In your project: click **"Add app"** → choose **Web** (⚠ even for mobile — Expo uses the web SDK)
4. Copy the config object and paste it into `src/firebase/config.ts`:

```ts
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "nepaltourapp.firebaseapp.com",
  projectId: "nepaltourapp",
  storageBucket: "nepaltourapp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

5. Enable **Authentication**:
   - Firebase Console → Authentication → Sign-in method
   - Enable: **Email/Password**, **Google**, **Phone**

6. Enable **Firestore Database**:
   - Firebase Console → Firestore → Create database → **Production mode**
   - After creating, go to **Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /qr_checkins/{doc} {
      allow read, write: if request.auth != null;
    }
    match /bookings/{doc} {
      allow read, write: if request.auth != null;
    }
    match /sos_packets/{doc} {
      allow read, write: if request.auth != null;
    }
    match /routes/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /guides/{doc} {
      allow read: if true;
    }
    match /transport/{doc} {
      allow read: if true;
    }
  }
}
```

7. Enable **Storage**:
   - Firebase Console → Storage → Get started
   - Accept default rules for now

### Step 4 — Google Maps API Key (for MapScreen)

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Enable **Maps SDK for Android** and **Maps SDK for iOS**
3. Create an API Key
4. Add to `app.json`:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_ANDROID_MAPS_KEY"
    }
  }
},
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_IOS_MAPS_KEY"
  }
}
```

### Step 5 — Run the app

```bash
# Start Expo dev server
npx expo start

# Then press:
# a → open Android emulator
# i → open iOS simulator (Mac only)
# w → open in browser (limited features)
# Scan QR with Expo Go app on your phone
```

---

## ⚠️ Known Dependency Issues & Fixes

### Issue 1 — `expo-barcode-scanner` deprecated in Expo 51+
**Fix:** We removed it. The app uses `expo-camera`'s built-in `barcodeScannerSettings` which is the correct approach for Expo 51+.

### Issue 2 — `react-native-reanimated` requires Babel plugin
**Fix:** `babel.config.js` includes `'react-native-reanimated/plugin'` as the **last plugin**. If you add new Babel plugins, keep reanimated last or you'll get a JS engine crash.

### Issue 3 — `expo-router` vs `react-navigation` conflict
**Fix:** We removed `expo-router` and use `react-navigation` with a plain `index.js` entry. Do NOT use both in the same project — they conflict over navigation state.

### Issue 4 — Firebase `initializeAuth` on web vs native
**Fix:** `src/firebase/config.ts` uses `initializeAuth` with `getReactNativePersistence(AsyncStorage)` for native persistence. Do not use `getAuth()` directly in React Native.

### Issue 5 — `react-native-maps` blank screen on Android
**Fix:** You MUST add the Google Maps API key to `app.json` under `android.config.googleMaps.apiKey`. Without it the map is blank on Android (works fine on iOS simulator without a key).

### Issue 6 — `expo-camera` permission crash on first launch
**Fix:** `ScanScreen.tsx` uses `useCameraPermissions()` hook which handles the permission flow gracefully. Always call `requestPermission()` inside a user interaction (button press), not on mount.

### Issue 7 — TypeScript error on `firebase/auth` in React Native
**Fix:** Import `initializeAuth` and `getReactNativePersistence` from `firebase/auth` — do NOT import from `firebase/auth/react-native` (that path was removed in Firebase 10).

---

## 🗂 What's Built vs What's Remaining

### ✅ Built (this codebase)

- [x] Auth screen (email/password, social button UI)
- [x] Firebase config + all service functions
- [x] Home dashboard with trek progress
- [x] Trek map with `react-native-maps` — checkpoints, hotels, hazards, medical posts
- [x] QR scanner screen with check-in flow
- [x] SOS emergency screen — type/symptom selection, packet send, offline queue
- [x] Bookings screen — hotels, transport, guides tabs
- [x] Profile screen — rank, credits, achievements, visited places
- [x] Tourist verification screen — passport upload
- [x] Full TypeScript types for all entities
- [x] Offline queue system (AsyncStorage)
- [x] Location tracking hook
- [x] Auth context with offline fallback
- [x] Trek route data — EBC, Annapurna, Langtang

### 🔨 Remaining To Build (Next Steps)

#### Phase 2 — Core Improvements
- [ ] **Real QR code generation** for checkpoints (use `react-native-qrcode-svg`)
- [ ] **GPS proximity validation** — only allow check-in within 200m of checkpoint
- [ ] **Firebase seed script** — populate Firestore with routes, guides, transport data
- [ ] **Offline map tiles** — integrate Mapbox or download Google Maps tiles
- [ ] **Image carousel** in hotel/guide detail modals

#### Phase 3 — Social & Feedback
- [ ] **Trail feedback system** — rate + photo upload at checkpoints
- [ ] **Hazard reporting** — let trekkers report new hazards on map
- [ ] **Community trail conditions** — live updates from other trekkers
- [ ] **Guide review system** — detailed reviews with photos

#### Phase 4 — Safety & Offline
- [ ] **Bluetooth SOS relay** — use `react-native-ble-plx` to relay to nearby phones
- [ ] **Background location tracking** — track trail even when screen is off
- [ ] **AMS score calculator** — symptom checklist → risk score
- [ ] **Offline Mapbox tiles** — pre-download EBC/Annapurna tiles for offline use

#### Phase 5 — Government Dashboard
- [ ] **Admin web dashboard** (React + Firebase) for tourism ministry
- [ ] **Real-time trekker heatmap** — active tourist locations
- [ ] **SOS analytics** — emergency trends, response times
- [ ] **Revenue analytics** — bookings by region/season

#### Phase 6 — Polish
- [ ] **Push notifications** (Firebase FCM) — weather alerts, SOS updates
- [ ] **Apple/Google Sign-In** — full OAuth implementation
- [ ] **Multi-language** — Nepali (नेपाली), Hindi, Japanese
- [ ] **App Store / Play Store** submission with `eas build`

---

## 🔐 Environment Variables

Create a `.env` file for sensitive keys (never commit this):

```env
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender
FIREBASE_APP_ID=your_app_id
GOOGLE_MAPS_API_KEY=your_maps_key
```

Then install `expo-constants` and access via `Constants.expoConfig.extra`.

---

## 📦 Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android (APK)
eas build --platform android --profile preview

# Build for iOS (requires Apple Developer account $99/year)
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

---

## 🧪 Testing

```bash
# Run TypeScript type checks
npx tsc --noEmit

# Lint
npx eslint src --ext .ts,.tsx
```

---

## 📞 Nepal Emergency Numbers

| Service | Number |
|---|---|
| Nepal Police | 100 |
| Ambulance | 102 |
| Himalayan Rescue Association | +977-1-4440066 |
| Tourism Emergency | 1144 |

---

## 📄 License

MIT — Built with 💙 for Nepal's trekking community.
