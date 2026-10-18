import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { COL, type Order, type UserProfile } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';
import { buildCustomers } from './customers';

export const useCustomers = () =>
  useQuery({
    queryKey: ['admin-customers'],
    staleTime: 60_000,
    queryFn: async () => {
      const { db } = requireFirebase();
      const [orders, users] = await Promise.all([
        getDocs(query(collection(db, COL.orders), orderBy('createdAt', 'desc'), limit(1000))),
        getDocs(collection(db, COL.users)),
      ]);
      return buildCustomers(
        orders.docs.map((d) => ({ id: d.id, ...(d.data() as Order) })),
        users.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) })),
      );
    },
  });
