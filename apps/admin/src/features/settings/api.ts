import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  COL,
  DOC,
  slugify,
  type AdminUser,
  type DeliveryZone,
  type StoreSettings,
  type UserProfile,
  type WithId,
} from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

const db = () => requireFirebase().db;

export const saveSettings = (s: StoreSettings) =>
  setDoc(doc(db(), COL.settings, DOC.storeSettings), s);

export async function fetchZones(): Promise<WithId<DeliveryZone>[]> {
  const snap = await getDocs(query(collection(db(), COL.deliveryZones), orderBy('sortOrder')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DeliveryZone) }));
}
export async function saveZone(id: string | null, z: DeliveryZone): Promise<string> {
  const zoneId = id ?? (slugify(z.name) || crypto.randomUUID().slice(0, 8));
  await setDoc(doc(db(), COL.deliveryZones, zoneId), z);
  return zoneId;
}
export const deleteZone = (id: string) => deleteDoc(doc(db(), COL.deliveryZones, id));

export async function fetchAdmins(): Promise<WithId<AdminUser>[]> {
  const snap = await getDocs(collection(db(), COL.admins));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as AdminUser) }));
}
export async function fetchUsers(): Promise<WithId<UserProfile>[]> {
  const snap = await getDocs(collection(db(), COL.users));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) }));
}
export const setAdmin = (uid: string, a: AdminUser) => setDoc(doc(db(), COL.admins, uid), a);
export const removeAdmin = (uid: string) => deleteDoc(doc(db(), COL.admins, uid));

export const useZones = () => useQuery({ queryKey: ['admin-zones'], queryFn: fetchZones });
export const useAdmins = () => useQuery({ queryKey: ['admin-admins'], queryFn: fetchAdmins });
export const useUsers = () =>
  useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers, staleTime: 60_000 });

export function useInvalidate() {
  const qc = useQueryClient();
  return (key: string) => void qc.invalidateQueries({ queryKey: [key] });
}

/** Counties no active zone covers (customers there cannot choose delivery). */
export function uncoveredCounties(zones: DeliveryZone[], all: readonly string[]): string[] {
  const covered = new Set(zones.filter((z) => z.isActive).flatMap((z) => z.counties));
  return all.filter((c) => !covered.has(c));
}
