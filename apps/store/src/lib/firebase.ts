import { firebaseConfigFromEnv, initFirebase, type FirebaseServices } from '@areqa/shared/firebase';

const firebaseConfig = firebaseConfigFromEnv(import.meta.env);

/** Null when .env is not filled in yet — pages render friendly "not configured" states. */
export const firebase: FirebaseServices | null = firebaseConfig
  ? initFirebase(firebaseConfig, {
      emulator: import.meta.env.VITE_FIREBASE_EMULATOR === 'true',
    })
  : null;

export function requireFirebase(): FirebaseServices {
  if (!firebase)
    throw new Error('Store is not connected to Firebase yet. Add keys to apps/store/.env.');
  return firebase;
}
