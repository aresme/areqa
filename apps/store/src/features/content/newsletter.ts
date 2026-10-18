import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { COL } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

export type SubscribeResult = 'subscribed' | 'already';

/** Doc id = email, and rules allow create only, so a repeat sign-up is rejected harmlessly. */
export async function subscribe(email: string, source: string): Promise<SubscribeResult> {
  const id = email.trim().toLowerCase();
  try {
    await setDoc(doc(requireFirebase().db, COL.newsletter, id), {
      email: id,
      source,
      createdAt: serverTimestamp(),
    });
    return 'subscribed';
  } catch (err) {
    if ((err as { code?: string }).code === 'permission-denied') return 'already';
    throw err;
  }
}
