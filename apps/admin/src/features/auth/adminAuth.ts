import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { COL, type AdminRole, type AdminUser } from '@areqa/shared';
import { firebase, requireFirebase } from '@/lib/firebase';

interface AdminState {
  status: 'loading' | 'signed-out' | 'admin';
  uid: string | null;
  admin: AdminUser | null;
  /** Shown on the login page, e.g. after a non-admin signs in. */
  notice: string;
}

export const useAdminAuth = create<AdminState>()(() => ({
  status: 'loading',
  uid: null,
  admin: null,
  notice: '',
}));

export const isOwner = (role: AdminRole | undefined) => role === 'owner';

/**
 * Only users with an admins/{uid} doc may use the panel. Anyone else is signed out
 * immediately — Firestore rules enforce the same thing server-side.
 */
export function startAdminAuth(): () => void {
  if (!firebase) {
    useAdminAuth.setState({
      status: 'signed-out',
      notice: 'Admin is not connected to Firebase. Add keys to apps/admin/.env.',
    });
    return () => undefined;
  }
  const { auth, db } = firebase;
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      useAdminAuth.setState({ status: 'signed-out', uid: null, admin: null });
      return;
    }
    try {
      const snap = await getDoc(doc(db, COL.admins, user.uid));
      if (!snap.exists()) {
        await fbSignOut(auth);
        useAdminAuth.setState({
          status: 'signed-out',
          uid: null,
          admin: null,
          notice: 'This account does not have admin access. Ask the store owner to add you.',
        });
        return;
      }
      useAdminAuth.setState({
        status: 'admin',
        uid: user.uid,
        admin: snap.data() as AdminUser,
        notice: '',
      });
    } catch {
      await fbSignOut(auth);
      useAdminAuth.setState({
        status: 'signed-out',
        uid: null,
        admin: null,
        notice: 'Could not verify admin access. Check your connection and try again.',
      });
    }
  });
}

export async function adminSignIn(email: string, password: string) {
  useAdminAuth.setState({ notice: '' });
  await signInWithEmailAndPassword(requireFirebase().auth, email.trim(), password);
}

export async function adminSignOut() {
  await fbSignOut(requireFirebase().auth);
}
