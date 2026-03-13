'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Runtime Firewall: Initialization.
 * Returns an 'isReal' flag to identify real SDK instances vs build-time shells.
 */
export function initializeFirebase() {
  const isBrowser = typeof window !== 'undefined';
  
  // LOGIC GATE: Only initialize real Firebase if in browser AND has real config
  const hasConfig = firebaseConfig.projectId && 
                    firebaseConfig.projectId !== 'studio-8519943663-3d25d' &&
                    firebaseConfig.apiKey;

  if (isBrowser && hasConfig) {
    try {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      return {
        firebaseApp: app,
        auth: getAuth(app),
        firestore: getFirestore(app),
        isReal: true
      };
    } catch (e) {
      // Fall through to shell return on error
    }
  }

  // BUILD-SHELL: Safe, inert objects for server-side and build-phase execution
  return {
    firebaseApp: { name: 'build-shell' } as any,
    auth: { 
      name: 'auth-shell', 
      onAuthStateChanged: () => () => {}, 
      signOut: async () => {} 
    } as any,
    firestore: { 
      name: 'firestore-shell',
      type: 'mock' 
    } as any,
    isReal: false
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
