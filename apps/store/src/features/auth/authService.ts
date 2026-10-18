import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { COL, normalizeKenyanPhone, type UserProfile } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';
import { config } from '@/lib/env';

const userRef = (uid: string) => doc(requireFirebase().db, COL.users, uid);

/** Creates users/{uid} on first sign-in; returns the stored profile. */
export async function ensureProfile(
  uid: string,
  seed: { displayName: string; email: string; phone?: string },
): Promise<UserProfile> {
  const ref = userRef(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;
  const profile = {
    displayName: seed.displayName,
    email: seed.email,
    phone: seed.phone ? normalizeKenyanPhone(seed.phone) : '',
    addresses: [],
    wishlist: [],
    cart: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return { ...profile, createdAt: null, updatedAt: null };
}

export async function updateUserDoc(
  uid: string,
  data: Partial<Omit<UserProfile, 'createdAt' | 'updatedAt'>>,
) {
  await updateDoc(userRef(uid), { ...data, updatedAt: serverTimestamp() });
}

export async function signInEmail(email: string, password: string) {
  await signInWithEmailAndPassword(requireFirebase().auth, email.trim(), password);
}

export async function registerEmail(name: string, email: string, password: string, phone: string) {
  const { auth } = requireFirebase();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, { displayName: name.trim() });
  await ensureProfile(cred.user.uid, {
    displayName: name.trim(),
    email: email.trim().toLowerCase(),
    phone,
  });
}

export async function signInGoogle() {
  const { auth } = requireFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    // Some mobile browsers block popups; fall back to a full-page redirect.
    if ((err as { code?: string }).code === 'auth/popup-blocked')
      await signInWithRedirect(auth, provider);
    else throw err;
  }
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(requireFirebase().auth, email.trim(), {
    url: `${config.siteUrl}/login`,
  });
}

export async function signOut() {
  await fbSignOut(requireFirebase().auth);
}
