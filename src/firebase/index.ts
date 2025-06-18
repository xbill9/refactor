'use client';

// Firebase app related imports removed as 'firebase/app' is no longer available.
// This file is modified to prevent build errors.
// Its exports are now minimal or no-ops if they depended on FirebaseApp.

// Config import might still be here, but initializeApp will not use it effectively.
// import { firebaseConfig } from '@/firebase/config';

export function initializeFirebase() {
  // No Firebase app to initialize or connect to emulators if 'firebase/app' is not available.
  // console.warn("Firebase SDK ('firebase/app') not found. Firebase initialization is a no-op.");
  return { firebaseApp: null }; // Return null or an empty object for firebaseApp
}

// Re-exporting provider and client-provider, which will also be modified
// to not depend on a live FirebaseApp instance.
export * from './provider';
export * from './client-provider';

// Firestore specific exports (use-collection, use-doc, non-blocking-updates) were removed previously.
// Auth specific exports (use-user) were also removed previously.
