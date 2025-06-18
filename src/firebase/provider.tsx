'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
// type FirebaseApp removed as 'firebase/app' is not available.

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: any; // Changed from FirebaseApp to any, will likely be null
}

export interface FirebaseContextState {

  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;

}

export interface FirebaseServices {
  firebaseApp: any; // Changed from FirebaseApp to any
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
}) => {
  const contextValue = useMemo((): FirebaseContextState => {
    // Services are available if firebaseApp is not null,
    // but it will be null if the SDK isn't present.
    const servicesAvailable = !!(firebaseApp);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
    };
  }, [firebaseApp]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServices => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }


  return {
    firebaseApp: context.firebaseApp,
  };
};


/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth | null => { // Changed to Auth | null
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => { // Changed to Firestore | null
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => { // Changed to FirebaseApp | null

  const { firebaseApp } = useFirebase();
  return firebaseApp;
};
