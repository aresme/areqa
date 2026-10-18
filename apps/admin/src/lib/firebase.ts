import { firebaseConfigFromEnv, initFirebase, type FirebaseServices } from '@areqa/shared/firebase';

const firebaseConfig = firebaseConfigFromEnv(import.meta.env);

/** Admin skips the offline cache so staff always see fresh orders and stock. */
export const firebase: FirebaseServices | null = firebaseConfig
  ? initFirebase(firebaseConfig, {
      offlineCache: false,
      emulator: import.meta.env.VITE_FIREBASE_EMULATOR === 'true',
    })
  : null;

export function requireFirebase(): FirebaseServices {
  if (!firebase)
    throw new Error('Admin is not connected to Firebase yet. Add keys to apps/admin/.env.');
  return firebase;
}
