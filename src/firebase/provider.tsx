'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
// type FirebaseApp removed as 'firebase/app' is not available.

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: any; // Changed from FirebaseApp to any, will likely be null
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: any | null; // Changed from FirebaseApp to any
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

  // if (!context.areServicesAvailable || !context.firebaseApp) {
  //   // This error might be too strict if we expect Firebase to be optional/removed
  //   // console.warn('Firebase core services not available. Check FirebaseProvider props.');
  //   // Return nulls or a structure indicating unavailability
  //   return { firebaseApp: null };
  // }
  // For now, let's assume if the context exists, firebaseApp could be null.
  // The consuming code should check for firebaseApp's existence.

  return {
    firebaseApp: context.firebaseApp,
  };
};

export const useFirebaseApp = (): any | null => { // Changed from FirebaseApp to any | null
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};
