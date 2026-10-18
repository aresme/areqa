/**
 * Security-rules tests for the client-only checkout. Run with `npm run test:rules`
 * (starts the Firestore emulator). These prove two things:
 *   1. The real `placeOrder` transaction is accepted by the rules.
 *   2. Hand-crafted malicious writes are rejected.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  CheckoutError,
  placeOrder,
  type CheckoutInput,
} from '../../packages/shared/src/services/checkout';

let env: RulesTestEnvironment;

const PRODUCT = {
  name: 'Essential Cotton Tee',
  slug: 'essential-cotton-tee',
  status: 'active',
  price: 1500,
  compareAtPrice: null,
  images: [{ url: 'https://example.com/tee.jpg', publicId: '', color: 'White' }],
  colors: [{ name: 'White', hex: '#fff' }],
  colorNames: ['White'],
  sizes: ['M', 'L'],
  variants: [
    { key: 'white_m', color: 'White', size: 'M' },
    { key: 'white_l', color: 'White', size: 'L' },
  ],
  totalStock: 5,
  salesCount: 10,
  lastOrderId: null,
};

const baseInput = (over: Partial<CheckoutInput> = {}): CheckoutInput => ({
  userId: null,
  lines: [{ productId: 'tee', variantKey: 'white_m', qty: 2 }],
  customer: { name: 'Wanjiru Kamau', email: 'Wanjiru@Example.com', phone: '0712 345 678' },
  delivery: {
    method: 'delivery',
    county: 'Nakuru',
    town: 'Milimani',
    address: 'Kenyatta Ave, House 4',
    notes: '',
    zoneId: 'nakuru-town',
    zoneName: 'Nakuru Town',
    zoneFee: 150,
    estimatedDays: 'Same day',
  },
  paymentMethod: 'pay_on_delivery',
  discountCode: null,
  freeDeliveryThreshold: 5000,
  ...over,
});

async function seed() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore() as unknown as Firestore;
    const b = writeBatch(db);
    b.set(doc(db, 'products/tee'), PRODUCT);
    b.set(doc(db, 'products/draft'), { ...PRODUCT, status: 'draft' });
    b.set(doc(db, 'inventory/tee__white_m'), {
      productId: 'tee',
      variantKey: 'white_m',
      color: 'White',
      size: 'M',
      stock: 3,
      lowStockThreshold: null,
      lastOrderId: null,
    });
    b.set(doc(db, 'inventory/tee__white_l'), {
      productId: 'tee',
      variantKey: 'white_l',
      color: 'White',
      size: 'L',
      stock: 2,
      lowStockThreshold: null,
      lastOrderId: null,
    });
    b.set(doc(db, 'discounts/KARIBU10'), {
      code: 'KARIBU10',
      type: 'percentage',
      value: 10,
      minOrder: 2000,
      usageLimit: null,
      usedCount: 0,
      isActive: true,
      lastOrderId: null,
      startsAt: Timestamp.fromMillis(Date.now() - 86_400_000),
      endsAt: Timestamp.fromMillis(Date.now() + 86_400_000),
    });
    b.set(doc(db, 'discounts/FLAT500'), {
      code: 'FLAT500',
      type: 'fixed',
      value: 500,
      minOrder: 0,
      usageLimit: 1,
      usedCount: 1,
      isActive: true,
      lastOrderId: null,
      startsAt: Timestamp.fromMillis(Date.now() - 86_400_000),
      endsAt: Timestamp.fromMillis(Date.now() + 86_400_000),
    });
    // 10 variants for the worst-case (max lines) order.
    const sizes = ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46'];
    b.set(doc(db, 'products/jeans'), {
      ...PRODUCT,
      name: 'Jeans',
      slug: 'jeans',
      price: 999,
      totalStock: 50,
      sizes,
      variants: sizes.map((sz) => ({ key: `indigo_${sz}`, color: 'Indigo', size: sz })),
    });
    sizes.forEach((sz) =>
      b.set(doc(db, `inventory/jeans__indigo_${sz}`), {
        productId: 'jeans',
        variantKey: `indigo_${sz}`,
        color: 'Indigo',
        size: sz,
        stock: 5,
        lowStockThreshold: null,
        lastOrderId: null,
      }),
    );
    b.set(doc(db, 'admins/owner1'), { role: 'owner', name: 'Owner', email: 'o@x.com' });
    b.set(doc(db, 'admins/staff1'), { role: 'staff', name: 'Staff', email: 's@x.com' });
    b.set(doc(db, 'settings/store'), { storeName: 'Areqa' });
    await b.commit();
  });
}

const guest = () => env.unauthenticatedContext().firestore() as unknown as Firestore;
const user = (uid: string) => env.authenticatedContext(uid).firestore() as unknown as Firestore;

async function readAsAdmin<T>(path: string): Promise<T | undefined> {
  let data: T | undefined;
  await env.withSecurityRulesDisabled(async (ctx) => {
    const snap = await getDoc(doc(ctx.firestore() as unknown as Firestore, path));
    data = snap.data() as T | undefined;
  });
  return data;
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-areqa-test',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});
afterAll(async () => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await seed();
});

describe('placeOrder (real checkout transaction)', () => {
  it('lets a guest place an order and decrements stock atomically', async () => {
    const placed = await placeOrder(guest(), baseInput());
    expect(placed.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    expect(placed.subtotal).toBe(3000);
    expect(placed.deliveryFee).toBe(150);
    expect(placed.total).toBe(3150);
    expect(placed.customer.phone).toBe('254712345678');
    expect(placed.customer.email).toBe('wanjiru@example.com');

    const inv = await readAsAdmin<{ stock: number }>('inventory/tee__white_m');
    expect(inv?.stock).toBe(1);
    const product = await readAsAdmin<{ totalStock: number; salesCount: number }>('products/tee');
    expect(product).toMatchObject({ totalStock: 3, salesCount: 12 });
    const order = await readAsAdmin<{ status: string; paymentStatus: string }>(
      `orders/${placed.id}`,
    );
    expect(order).toMatchObject({ status: 'pending', paymentStatus: 'unpaid' });
  });

  it('handles two variants of the same product in one order', async () => {
    const placed = await placeOrder(
      guest(),
      baseInput({
        lines: [
          { productId: 'tee', variantKey: 'white_m', qty: 1 },
          { productId: 'tee', variantKey: 'white_l', qty: 2 },
        ],
      }),
    );
    expect(placed.items).toHaveLength(2);
    const product = await readAsAdmin<{ totalStock: number; salesCount: number }>('products/tee');
    expect(product).toMatchObject({ totalStock: 2, salesCount: 13 });
  });

  it('applies a percentage discount and counts its use', async () => {
    const placed = await placeOrder(guest(), baseInput({ discountCode: ' karibu10 ' }));
    expect(placed.discount).toEqual({ code: 'KARIBU10', amount: 300 });
    expect(placed.total).toBe(3000 - 300 + 150);
    const d = await readAsAdmin<{ usedCount: number }>('discounts/KARIBU10');
    expect(d?.usedCount).toBe(1);
  });

  it('accepts the worst case: 10 lines, max quantities and a discount', async () => {
    const lines = ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46'].map((sz) => ({
      productId: 'jeans',
      variantKey: `indigo_${sz}`,
      qty: 5,
    }));
    const placed = await placeOrder(guest(), baseInput({ lines, discountCode: 'KARIBU10' }));
    expect(placed.subtotal).toBe(999 * 5 * lines.length);
    expect(placed.discount?.amount).toBe(Math.floor((999 * 5 * lines.length * 10) / 100));
    expect(placed.deliveryFee).toBe(0);
  });

  it('makes delivery free above the threshold and for pickup', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore() as unknown as Firestore, 'inventory/tee__white_m'), {
        stock: 10,
      });
    });
    const free = await placeOrder(
      guest(),
      baseInput({ lines: [{ productId: 'tee', variantKey: 'white_m', qty: 4 }] }),
    );
    expect(free.deliveryFee).toBe(0);
    const pickup = await placeOrder(
      guest(),
      baseInput({ delivery: { ...baseInput().delivery, method: 'pickup' } }),
    );
    expect(pickup.deliveryFee).toBe(0);
    expect(pickup.delivery.zoneName).toBe('Store pickup');
  });

  it('rejects orders larger than available stock without writing anything', async () => {
    await expect(
      placeOrder(
        guest(),
        baseInput({ lines: [{ productId: 'tee', variantKey: 'white_m', qty: 5 }] }),
      ),
    ).rejects.toMatchObject({
      code: 'insufficient_stock',
    });
    const inv = await readAsAdmin<{ stock: number }>('inventory/tee__white_m');
    expect(inv?.stock).toBe(3);
  });

  it('rejects an exhausted discount code', async () => {
    const err = await placeOrder(guest(), baseInput({ discountCode: 'FLAT500' })).catch((e) => e);
    expect(err).toBeInstanceOf(CheckoutError);
    expect(err.code).toBe('discount_invalid');
  });

  it('records the signed-in user and lets only them read the order', async () => {
    const placed = await placeOrder(user('alice'), baseInput({ userId: 'alice' }));
    await assertSucceeds(getDoc(doc(user('alice'), `orders/${placed.id}`)));
    await assertFails(getDoc(doc(user('bob'), `orders/${placed.id}`)));
    await assertFails(getDoc(doc(guest(), `orders/${placed.id}`)));
  });

  it('exposes tracking only by order number + phone hash, never by listing', async () => {
    const placed = await placeOrder(guest(), baseInput());
    const snap = await assertSucceeds(getDoc(doc(guest(), `orderLookup/${placed.lookupId}`)));
    expect(snap.data()).toMatchObject({ status: 'pending', orderNumber: placed.orderNumber });
    expect(JSON.stringify(snap.data())).not.toContain('Wanjiru');
    await assertFails(getDocs(collection(guest(), 'orderLookup')));
  });
});

describe('tampering is rejected', () => {
  async function craftOrder(
    db: Firestore,
    mutate: (o: Record<string, unknown>) => void,
    opts: { decrement?: boolean } = { decrement: true },
  ) {
    const id = doc(collection(db, 'orders')).id;
    const lookupId = `ORD-20261018-1234__${'a'.repeat(64)}`;
    const order: Record<string, unknown> = {
      orderNumber: 'ORD-20261018-1234',
      userId: null,
      customer: { name: 'Mallory', email: 'm@x.com', phone: '254712345678' },
      delivery: {
        method: 'delivery',
        county: 'Nakuru',
        town: 'Nakuru',
        address: 'Somewhere 1',
        notes: '',
        zoneId: 'z',
        zoneName: 'Z',
        fee: 150,
        estimatedDays: '1',
      },
      items: [
        {
          productId: 'tee',
          variantKey: 'white_m',
          name: 'Tee',
          slug: 'tee',
          image: '',
          color: 'White',
          size: 'M',
          qty: 1,
          unitPrice: 1500,
        },
      ],
      productIds: ['tee'],
      itemCount: 1,
      subtotal: 1500,
      discount: null,
      deliveryFee: 150,
      total: 1650,
      paymentMethod: 'pay_on_delivery',
      paymentStatus: 'unpaid',
      paymentRef: null,
      paidAt: null,
      status: 'pending',
      statusHistory: [{ status: 'pending', at: Timestamp.now(), by: 'customer' }],
      adminNotes: '',
      lookupId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    mutate(order);
    const b = writeBatch(db);
    b.set(doc(db, `orders/${id}`), order);
    b.set(doc(db, `orderLookup/${lookupId}`), {
      orderId: id,
      orderNumber: 'ORD-20261018-1234',
      status: 'pending',
      statusHistory: [],
      itemCount: 1,
      total: order.total,
      deliveryMethod: 'delivery',
      createdAt: serverTimestamp(),
    });
    if (opts.decrement) {
      b.update(doc(db, 'inventory/tee__white_m'), {
        stock: 2,
        lastOrderId: id,
        updatedAt: serverTimestamp(),
      });
    }
    return b.commit();
  }

  it('accepts a well-formed hand-built order (control case)', async () => {
    await assertSucceeds(craftOrder(guest(), () => {}));
  });

  it('rejects a total that does not add up', async () => {
    await assertFails(craftOrder(guest(), (o) => (o.total = 100)));
  });

  it('rejects more than 10 lines', async () => {
    await assertFails(
      craftOrder(guest(), (o) => {
        o.items = Array(11).fill((o.items as unknown[])[0]);
      }),
    );
  });

  it('rejects an order created as already confirmed or paid', async () => {
    await assertFails(craftOrder(guest(), (o) => (o.status = 'confirmed')));
    await assertFails(craftOrder(guest(), (o) => (o.paymentStatus = 'paid')));
  });

  it('rejects an invalid phone number and extra fields', async () => {
    await assertFails(
      craftOrder(guest(), (o) => ((o.customer as Record<string, string>).phone = '12345')),
    );
    await assertFails(craftOrder(guest(), (o) => (o.isVip = true)));
  });

  it('rejects a made-up discount amount', async () => {
    await assertFails(
      craftOrder(guest(), (o) => {
        o.discount = { code: 'KARIBU10', amount: 1500 };
        o.total = 150;
      }),
    );
  });

  it('rejects stock changes not tied to a new order', async () => {
    await assertFails(
      updateDoc(doc(guest(), 'inventory/tee__white_m'), {
        stock: 0,
        lastOrderId: 'fake',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(updateDoc(doc(guest(), 'inventory/tee__white_m'), { stock: 99 }));
    await assertFails(updateDoc(doc(guest(), 'products/tee'), { price: 1 }));
  });

  it('rejects decrementing stock of a product that is not in the order', async () => {
    await assertFails(
      craftOrder(guest(), (o) => {
        o.items = [{ ...(o.items as Record<string, unknown>[])[0], productId: 'draft' }];
        o.productIds = ['draft'];
      }),
    );
  });

  it('rejects updating an order or reading other orders as a customer', async () => {
    const placed = await placeOrder(user('alice'), baseInput({ userId: 'alice' }));
    await assertFails(
      updateDoc(doc(user('alice'), `orders/${placed.id}`), { status: 'delivered' }),
    );
    await assertFails(getDocs(collection(user('alice'), 'orders')));
  });

  it('rejects listing discount codes', async () => {
    await assertFails(getDocs(collection(guest(), 'discounts')));
    await assertSucceeds(getDoc(doc(guest(), 'discounts/KARIBU10')));
  });
});

describe('catalogue, settings and admin roles', () => {
  it('hides draft products from the public', async () => {
    await assertSucceeds(getDoc(doc(guest(), 'products/tee')));
    await assertFails(getDoc(doc(guest(), 'products/draft')));
    await assertSucceeds(getDoc(doc(user('staff1'), 'products/draft')));
  });

  it('lets staff edit products but only owners edit settings and admins', async () => {
    await assertSucceeds(updateDoc(doc(user('staff1'), 'products/tee'), { price: 1600 }));
    await assertFails(setDoc(doc(user('staff1'), 'settings/store'), { storeName: 'Hacked' }));
    await assertSucceeds(setDoc(doc(user('owner1'), 'settings/store'), { storeName: 'Areqa Ltd' }));
    await assertFails(setDoc(doc(user('staff1'), 'admins/eve'), { role: 'owner' }));
    await assertFails(setDoc(doc(user('eve'), 'admins/eve'), { role: 'owner' }));
    await assertSucceeds(
      setDoc(doc(user('owner1'), 'admins/newstaff'), {
        role: 'staff',
        name: 'N',
        email: 'n@x.com',
      }),
    );
  });
});

describe('public forms', () => {
  it('accepts a newsletter sign-up once and rejects duplicates and reads', async () => {
    const ref = doc(guest(), 'newsletter/a@b.co');
    await assertSucceeds(
      setDoc(ref, { email: 'a@b.co', source: 'footer', createdAt: serverTimestamp() }),
    );
    await assertFails(
      setDoc(ref, { email: 'a@b.co', source: 'footer', createdAt: serverTimestamp() }),
    );
    await assertFails(getDoc(ref));
  });

  it('accepts valid contact messages only', async () => {
    const col = collection(guest(), 'messages');
    const msg = {
      name: 'Brian',
      email: 'b@x.com',
      phone: '',
      subject: 'Sizes',
      message: 'Do you have the chinos in 36?',
      status: 'new',
      createdAt: serverTimestamp(),
    };
    await assertSucceeds(setDoc(doc(col), msg));
    await assertFails(setDoc(doc(col), { ...msg, status: 'replied' }));
    await assertFails(setDoc(doc(col), { ...msg, message: 'hi' }));
  });
});

describe('reviews', () => {
  it('allows a review only from a customer whose delivered order contains the product', async () => {
    const placed = await placeOrder(user('alice'), baseInput({ userId: 'alice' }));
    const review = {
      productId: 'tee',
      orderId: placed.id,
      userId: 'alice',
      userName: 'Alice',
      rating: 5,
      title: 'Great',
      body: 'Fits perfectly and feels premium.',
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    // Not delivered yet → denied.
    await assertFails(setDoc(doc(collection(user('alice'), 'reviews')), review));

    await env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore() as unknown as Firestore, `orders/${placed.id}`), {
        status: 'delivered',
      });
    });
    await assertSucceeds(setDoc(doc(collection(user('alice'), 'reviews')), review));
    await assertFails(
      setDoc(doc(collection(user('bob'), 'reviews')), { ...review, userId: 'bob' }),
    );
    await assertFails(
      setDoc(doc(collection(user('alice'), 'reviews')), { ...review, status: 'approved' }),
    );
  });

  it('lets customers list only their own orders and reviews (account pages)', async () => {
    const placed = await placeOrder(user('alice'), baseInput({ userId: 'alice' }));
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore() as unknown as Firestore;
      await setDoc(doc(db, `reviews/${placed.id}_tee`), {
        productId: 'tee',
        orderId: placed.id,
        userId: 'alice',
        userName: 'A',
        rating: 5,
        title: '',
        body: 'Lovely fabric overall.',
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      await setDoc(doc(db, 'reviews/other'), {
        productId: 'tee',
        orderId: 'x',
        userId: 'bob',
        userName: 'B',
        rating: 2,
        title: '',
        body: 'Not for me, sorry.',
        status: 'pending',
        createdAt: Timestamp.now(),
      });
    });
    const mine = await assertSucceeds(
      getDocs(
        query(
          collection(user('alice'), 'orders'),
          where('userId', '==', 'alice'),
          orderBy('createdAt', 'desc'),
        ),
      ),
    );
    expect(mine.size).toBe(1);
    const reviews = await assertSucceeds(
      getDocs(
        query(
          collection(user('alice'), 'reviews'),
          where('userId', '==', 'alice'),
          orderBy('createdAt', 'desc'),
        ),
      ),
    );
    expect(reviews.size).toBe(1);
    await assertFails(
      getDocs(query(collection(user('alice'), 'reviews'), where('userId', '==', 'bob'))),
    );
    // The public product page query only sees approved reviews.
    await assertSucceeds(
      getDocs(
        query(
          collection(guest(), 'reviews'),
          where('productId', '==', 'tee'),
          where('status', '==', 'approved'),
        ),
      ),
    );
    await assertFails(
      getDocs(query(collection(guest(), 'reviews'), where('productId', '==', 'tee'))),
    );
  });
});

describe('customer profiles', () => {
  it('lets a user write only their own profile with allowed fields', async () => {
    const ref = doc(user('alice'), 'users/alice');
    await assertSucceeds(
      setDoc(ref, {
        displayName: 'Alice',
        email: 'a@x.com',
        phone: '',
        addresses: [],
        wishlist: [],
        cart: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(updateDoc(ref, { wishlist: ['tee'], updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(ref, { role: 'owner' }));
    await assertFails(setDoc(doc(user('alice'), 'users/bob'), { displayName: 'Hijack' }));
    await assertFails(getDoc(doc(user('bob'), 'users/alice')));
  });
});
