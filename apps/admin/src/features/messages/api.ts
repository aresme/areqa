import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { COL, type ContactMessage, type MessageStatus, type WithId } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

const db = () => requireFirebase().db;

/** Live inbox so new messages show without a refresh. */
export function useMessagesLive() {
  const [state, setState] = useState<{ data: WithId<ContactMessage>[]; loading: boolean }>({
    data: [],
    loading: true,
  });
  useEffect(
    () =>
      onSnapshot(
        query(collection(db(), COL.messages), orderBy('createdAt', 'desc')),
        (snap) =>
          setState({
            data: snap.docs.map((d) => ({ id: d.id, ...(d.data() as ContactMessage) })),
            loading: false,
          }),
        () => setState((s) => ({ ...s, loading: false })),
      ),
    [],
  );
  return state;
}

export const setMessageStatus = (id: string, status: MessageStatus) =>
  updateDoc(doc(db(), COL.messages, id), { status });
export const deleteMessage = (id: string) => deleteDoc(doc(db(), COL.messages, id));
