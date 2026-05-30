// src/firebase/services.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './config';
import type {
  User, QRCheckin, Booking, SOSPacket,
  Feedback, TrekRoute, Guide, Transport, Accommodation,
} from '../types';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export const createUserProfile = async (uid: string, data: Partial<User>) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    credits: 0,
    rank: 'Trail Starter',
    isVerifiedTourist: false,
    createdAt: serverTimestamp(),
    emergencyContacts: [],
  });
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as User) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<User>) =>
  updateDoc(doc(db, 'users', uid), data);

export const verifyTourist = async (uid: string, passportNumber: string, nationality: string) =>
  updateDoc(doc(db, 'users', uid), {
    isVerifiedTourist: true,
    passportNumber,
    nationality,
    verifiedAt: serverTimestamp(),
  });

export const addCredits = async (uid: string, amount: number, reason: string) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const current = snap.data().credits || 0;
  const newTotal = current + amount;
  const newRank = getRankFromCredits(newTotal);
  await updateDoc(userRef, { credits: newTotal, rank: newRank });
  await addDoc(collection(db, 'credit_history'), {
    userId: uid,
    amount,
    reason,
    total: newTotal,
    timestamp: serverTimestamp(),
  });
};

const getRankFromCredits = (credits: number): string => {
  if (credits >= 2000) return 'Summit Master';
  if (credits >= 1000) return 'Himalayan Explorer';
  if (credits >= 500) return 'Mountain Navigator';
  if (credits >= 200) return 'Hill Walker';
  return 'Trail Starter';
};

// ─── QR CHECK-INS ─────────────────────────────────────────────────────────────

export const saveCheckin = async (checkin: Omit<QRCheckin, 'id'>) => {
  const ref = await addDoc(collection(db, 'qr_checkins'), {
    ...checkin,
    timestamp: serverTimestamp(),
  });
  await addCredits(checkin.userId, checkin.creditsEarned, `Check-in: ${checkin.locationName}`);
  return ref.id;
};

export const getUserCheckins = async (uid: string): Promise<QRCheckin[]> => {
  const q = query(
    collection(db, 'qr_checkins'),
    where('userId', '==', uid),
    orderBy('timestamp', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as QRCheckin));
};

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

export const createBooking = async (booking: Omit<Booking, 'id'>) => {
  const ref = await addDoc(collection(db, 'bookings'), {
    ...booking,
    status: 'Pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getUserBookings = async (uid: string): Promise<Booking[]> => {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
};

export const cancelBooking = async (bookingId: string) =>
  updateDoc(doc(db, 'bookings', bookingId), { status: 'Cancelled' });

// ─── SOS PACKETS ──────────────────────────────────────────────────────────────

export const saveSosPacket = async (packet: Omit<SOSPacket, 'id'>) => {
  const ref = await addDoc(collection(db, 'sos_packets'), {
    ...packet,
    timestamp: serverTimestamp(),
  });
  return ref.id;
};

export const markSosSent = async (packetId: string, method: string) =>
  updateDoc(doc(db, 'sos_packets', packetId), {
    sent: true,
    relayMethod: method,
    sentAt: serverTimestamp(),
  });

// ─── TREK ROUTES ──────────────────────────────────────────────────────────────

export const getTrekRoutes = async (): Promise<TrekRoute[]> => {
  const snap = await getDocs(collection(db, 'routes'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TrekRoute));
};

export const getTrekRoute = async (routeId: string): Promise<TrekRoute | null> => {
  const snap = await getDoc(doc(db, 'routes', routeId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as TrekRoute) : null;
};

// ─── ACCOMMODATIONS ───────────────────────────────────────────────────────────

export const getAccommodations = async (routeId?: string): Promise<Accommodation[]> => {
  const q = routeId
    ? query(collection(db, 'locations'), where('routeId', '==', routeId), where('type', '==', 'accommodation'))
    : collection(db, 'locations');
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Accommodation));
};

// ─── GUIDES ───────────────────────────────────────────────────────────────────

export const getGuides = async (): Promise<Guide[]> => {
  const snap = await getDocs(collection(db, 'guides'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Guide));
};

// ─── TRANSPORT ────────────────────────────────────────────────────────────────

export const getTransport = async (): Promise<Transport[]> => {
  const snap = await getDocs(collection(db, 'transport'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Transport));
};

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────

export const submitFeedback = async (feedback: Omit<Feedback, 'id'>) => {
  await addDoc(collection(db, 'feedback'), {
    ...feedback,
    createdAt: serverTimestamp(),
  });
};

export const getLocationFeedback = async (locationId: string): Promise<Feedback[]> => {
  const q = query(
    collection(db, 'feedback'),
    where('locationId', '==', locationId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
};

// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────

export const uploadDocument = async (
  uid: string,
  uri: string,
  docType: 'passport' | 'photo'
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `users/${uid}/${docType}_${Date.now()}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};