// src/hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, createUserProfile } from '../firebase/services';
import { saveUserLocally, getUserLocally } from '../utils/offlineStorage';
import type { User } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    const profile = await getUserProfile(firebaseUser.uid);
    if (profile) {
      setUserProfile(profile);
      await saveUserLocally(profile);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Try remote first, fall back to local cache
        try {
          let profile = await getUserProfile(fbUser.uid);
          if (!profile) {
            // First login — create profile
            await createUserProfile(fbUser.uid, {
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'Trekker',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
            });
            profile = await getUserProfile(fbUser.uid);
          }
          if (profile) {
            setUserProfile(profile);
            await saveUserLocally(profile);
          }
        } catch {
          // Offline — load from cache
          const cached = await getUserLocally();
          if (cached) setUserProfile(cached as User);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);