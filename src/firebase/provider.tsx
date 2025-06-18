'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
// Auth related imports removed
// import { Auth, User, onAuthStateChanged } from 'firebase/auth';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  // auth: Auth; // Auth removed
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; 
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  // auth: Auth | null; // Auth removed
  // User authentication state removed
}

// Return type for useFirebase()
export interface FirebaseServices { // Renamed from FirebaseServicesAndUser
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  // auth: Auth; // Auth removed
  // User state removed
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  // auth, // Auth removed
}) => {
  // User auth state and effect removed

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore /*&& auth*/); // Auth removed from check
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      // auth: servicesAvailable ? auth : null, // Auth removed
      // User state removed
    };
  }, [firebaseApp, firestore /*, auth*/]); // Auth removed from dependencies

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServices => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore /*|| !context.auth*/) { // Auth removed
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    // auth: context.auth, // Auth removed
    // User state removed
  };
};

// useAuth hook removed
// export const useAuth = (): Auth => {
//   const { auth } = useFirebase();
//   return auth;
// };

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

// useUser hook removed
// export const useUser = (): UserHookResult => { 
//   const { user, isUserLoading, userError } = useFirebase(); 
//   return { user, isUserLoading, userError };
// };
