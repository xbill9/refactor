'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
// Firebase App is still needed for potential other Firebase services like Genkit if it were to use Firebase Functions/Storage, etc.
// For now, it's kept minimal.

export function initializeFirebase() {
  if (!getApps().length) {
    if (process.env.NODE_ENV === "production") {
      let firebaseApp: FirebaseApp;
      try {
        firebaseApp = initializeApp();
      } catch (e) {
        console.info('Automatic initialization failed. Falling back to firebase config object.', e);
        firebaseApp = initializeApp(firebaseConfig);
      }
      return { firebaseApp };
    } else {
      const firebaseApp = initializeApp(firebaseConfig);
      // Emulators for other services (like Auth, if re-added) would be connected here.
      // Since Firestore is removed, no Firestore emulator connection is needed.
      return { firebaseApp };
    }
  }

  const firebaseApp = getApp();
  return { firebaseApp };
}

export * from './provider';
export * from './client-provider';
// Firestore specific exports (use-collection, use-doc, non-blocking-updates) are removed
// as Firestore itself is removed.
