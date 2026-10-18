import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { COL, type UserProfile } from '@areqa/shared';
import { useCart } from '@/features/cart/cartStore';
import { useWishlist } from '@/features/wishlist/wishlistStore';
import { firebase } from '@/lib/firebase';
import { ensureProfile, updateUserDoc } from './authService';
import { useAuth } from './authStore';
import { mergeCarts, mergeWishlists } from './mergeCart';

const PUSH_DELAY = 800;

/**
 * Keeps the signed-in customer's cart and wishlist in users/{uid}. The only real-time
 * listener on the storefront (per the free-tier read budget), and only while signed in.
 */
export function AuthSync() {
  useEffect(() => {
    if (!firebase) {
      useAuth.getState().set({ status: 'guest' });
      return;
    }
    const { auth, db } = firebase;
    let stopDoc: (() => void) | null = null;
    let stopLocal: (() => void) | null = null;
    let timer: number | undefined;

    const teardown = () => {
      stopDoc?.();
      stopLocal?.();
      stopDoc = stopLocal = null;
      window.clearTimeout(timer);
    };

    const stopAuth = onAuthStateChanged(auth, async (fbUser) => {
      const wasUser = useAuth.getState().status === 'user';
      teardown();
      if (!fbUser) {
        useAuth.getState().set({ status: 'guest', user: null, profile: null });
        if (wasUser) {
          // Signed out: don't leave the account's bag on a shared device.
          useCart.getState().clear();
          useWishlist.getState().replaceAll([]);
        }
        return;
      }

      const user = {
        uid: fbUser.uid,
        email: fbUser.email ?? '',
        displayName: fbUser.displayName ?? '',
        providers: fbUser.providerData.map((p) => p.providerId),
      };
      // Signed in as soon as Auth says so; the profile arrives with the first snapshot.
      useAuth.getState().set({ status: 'user', user, profile: useAuth.getState().profile });
      try {
        await ensureProfile(fbUser.uid, { displayName: user.displayName, email: user.email });
      } catch (err) {
        console.error('[auth] could not create profile', err);
      }

      let lastPushed = '';
      let merged = false;
      const snapshotOf = () =>
        JSON.stringify({ cart: useCart.getState().items, wishlist: useWishlist.getState().ids });

      const push = () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const json = snapshotOf();
          if (json === lastPushed) return;
          lastPushed = json;
          const { cart, wishlist } = JSON.parse(json) as Pick<UserProfile, 'cart' | 'wishlist'>;
          updateUserDoc(fbUser.uid, { cart, wishlist }).catch((err) =>
            console.warn('[auth] sync failed', err),
          );
        }, PUSH_DELAY);
      };

      stopDoc = onSnapshot(
        doc(db, COL.users, fbUser.uid),
        (snap) => {
          if (!snap.exists() || snap.metadata.hasPendingWrites) return;
          const profile = snap.data() as UserProfile;
          useAuth.getState().set({ status: 'user', user, profile });
          const remote = JSON.stringify({
            cart: profile.cart ?? [],
            wishlist: profile.wishlist ?? [],
          });
          if (!merged) {
            merged = true;
            useCart.getState().replaceAll(mergeCarts(useCart.getState().items, profile.cart ?? []));
            useWishlist
              .getState()
              .replaceAll(mergeWishlists(useWishlist.getState().ids, profile.wishlist ?? []));
            lastPushed = remote;
            push();
          } else if (remote !== lastPushed) {
            // Changed on another device.
            lastPushed = remote;
            useCart.getState().replaceAll(profile.cart ?? []);
            useWishlist.getState().replaceAll(profile.wishlist ?? []);
          }
        },
        (err) => console.error('[auth] profile listener failed', err),
      );

      const unsubCart = useCart.subscribe(push);
      const unsubWish = useWishlist.subscribe(push);
      stopLocal = () => {
        unsubCart();
        unsubWish();
      };
    });

    return () => {
      stopAuth();
      teardown();
    };
  }, []);

  return null;
}
