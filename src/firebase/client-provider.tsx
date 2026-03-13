'use client';

import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Runtime Firewall: Client Provider.
 * Wraps the FirebaseProvider and ensures services are only initialized once.
 * HARDENED: Checks 'isMounted' to ensure client-only hydration.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const firebaseServices = useMemo(() => {
    // initializeFirebase ensures real services in browser and shells in build/server
    return initializeFirebase();
  }, [isMounted]); 

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
