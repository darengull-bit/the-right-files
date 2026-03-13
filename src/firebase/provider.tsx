'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { initializeFirebase } from '@/firebase';

interface UserAuthState {
  user: User | null;
  profile: any | null;
  organization: any | null;
  member: any | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState extends UserAuthState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * TRIPLE-LOCK FIREWALL: Prevents hydration crashes and build-time SDK execution.
 * 1. Verifies browser environment.
 * 2. Verifies real SDK instances (no shells).
 * 3. Defers listeners until mount.
 */
export function FirebaseProvider({
  children,
  firebaseApp,
  firestore,
  auth,
}: {
  children: ReactNode;
  firebaseApp: any;
  firestore: any;
  auth: any;
}) {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    profile: null,
    organization: null,
    member: null,
    isUserLoading: true,
    userError: null,
  });

  // Use state to track hydration to prevent ChunkLoadError and shell mismatches
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    const { isReal } = initializeFirebase();
    
    // LOCK 1: Environment & Hydration Check
    if (!isBrowser || !isReal || !isHydrated) {
      if (!isBrowser || !isHydrated) {
        // Still loading or server-side
      } else {
        // Browser but no config
        setUserAuthState(prev => ({ ...prev, isUserLoading: false }));
      }
      return;
    }

    // LOCK 2: Service Instance Validation
    if (!auth || auth.name === 'auth-shell' || !firestore || firestore.name === 'firestore-shell') {
      setUserAuthState(prev => ({ ...prev, isUserLoading: false }));
      return;
    }

    let unsubProfile: (() => void) | undefined;
    let unsubOrg: (() => void) | undefined;
    let unsubMember: (() => void) | undefined;

    // LOCK 3: Final Authenticated State Guard
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUserAuthState({ user: null, profile: null, organization: null, member: null, isUserLoading: false, userError: null });
        return;
      }

      setUserAuthState(prev => ({ ...prev, user: firebaseUser }));

      const userRef = doc(firestore, 'users', firebaseUser.uid);
      unsubProfile = onSnapshot(userRef, (userDoc) => {
        if (userDoc.exists()) {
          const profileData = { ...userDoc.data(), id: userDoc.id };
          setUserAuthState(prev => ({ ...prev, profile: profileData, isUserLoading: false }));

          if (profileData.organizationId) {
            const orgRef = doc(firestore, 'organizations', profileData.organizationId);
            unsubOrg = onSnapshot(orgRef, (orgDoc) => {
              if (orgDoc.exists()) {
                setUserAuthState(prev => ({ ...prev, organization: { ...orgDoc.data(), id: orgDoc.id } }));
              }
            });

            const memberRef = doc(firestore, 'organizations', profileData.organizationId, 'members', firebaseUser.uid);
            unsubMember = onSnapshot(memberRef, (memDoc) => {
              if (memDoc.exists()) {
                setUserAuthState(prev => ({ ...prev, member: { ...memDoc.data(), id: memDoc.id } }));
              }
            });
          }
        } else {
          setUserAuthState(prev => ({ ...prev, isUserLoading: false }));
        }
      }, (err) => {
        setUserAuthState(prev => ({ ...prev, isUserLoading: false, userError: err }));
      });
    });

    return () => {
      unsubscribeAuth();
      unsubProfile?.();
      unsubOrg?.();
      unsubMember?.();
    };
  }, [auth, firestore, isHydrated]);

  const areServicesAvailable = useMemo(() => {
    return isHydrated && auth && auth.name !== 'auth-shell';
  }, [isHydrated, auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    return {
      areServicesAvailable,
      firebaseApp: areServicesAvailable ? firebaseApp : null,
      firestore: areServicesAvailable ? firestore : null,
      auth: areServicesAvailable ? auth : null,
      ...userAuthState,
    };
  }, [firebaseApp, firestore, auth, userAuthState, areServicesAvailable]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useFirebase must be used within a FirebaseProvider.');
  return context;
};

export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
export const useFirebaseApp = () => useFirebase().firebaseApp;

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T & {__memo?: boolean} {
  const memoized = useMemo(factory, deps) as any;
  if (memoized && typeof memoized === 'object') memoized.__memo = true;
  return memoized;
}

export const useUser = () => {
  const { user, profile, organization, member, isUserLoading, userError } = useFirebase();
  return { user, profile, organization, member, isUserLoading, userError };
};
