'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
// Firestore and Auth related imports removed

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  // Firestore and Auth props removed
}

export interface FirebaseContextState {
  areServicesAvailable: boolean; 
  firebaseApp: FirebaseApp | null;
  // Firestore and Auth state removed
}

export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  // Firestore and Auth services removed
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
}) => {
  const contextValue = useMemo((): FirebaseContextState => {
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

  if (!context.areServicesAvailable || !context.firebaseApp) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
  };
};

// useFirestore hook removed
// export const useFirestore = (): Firestore => {
//   const { firestore } = useFirebase();
//   return firestore;
// };

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};
