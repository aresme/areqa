import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

export interface FirebaseEnv {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_MEASUREMENT_ID?: string;
  /** "true" → talk to the local emulators started by `npm run emulators`. */
  VITE_FIREBASE_EMULATOR?: string;
}

export function firebaseConfigFromEnv(env: FirebaseEnv): FirebaseOptions | null {
  if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID || !env.VITE_FIREBASE_APP_ID) {
    return null;
  }
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let services: FirebaseServices | null = null;

/**
 * Initialise Firebase once. Firestore uses the IndexedDB cache so repeat visits
 * re-read from disk, keeping us well inside the Spark daily read quota.
 */
export function initFirebase(
  config: FirebaseOptions,
  { offlineCache = true, emulator = false } = {},
): FirebaseServices {
  if (services) return services;
  const app = getApps()[0] ?? initializeApp(config);
  const db = initializeFirestore(
    app,
    offlineCache && !emulator && typeof indexedDB !== 'undefined'
      ? { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }
      : {},
  );
  const auth = getAuth(app);
  if (emulator) {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  services = { app, auth, db };
  return services;
}

export function getFirebase(): FirebaseServices {
  if (!services) {
    throw new Error('Firebase is not configured. Copy .env.example to .env and add your keys.');
  }
  return services;
}

export function isFirebaseReady(): boolean {
  return services !== null;
}
