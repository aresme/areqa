/**
 * Order placement — the only code path that writes orders from the storefront.
 *
 * Runs in a single Firestore transaction so stock, discount usage, the order and its
 * public tracking doc are written atomically. firestore.rules re-validates every write,
 * so this module and the rules must stay in sync (see tests/rules/checkout.test.ts).
 *
 * Payments: orders are created `unpaid`. A future provider (M-Pesa STK push, Paystack,
 * IntaSend) plugs in AFTER placeOrder via a server function that marks the order paid —
 * nothing here needs restructuring.
 */
import {
  Timestamp,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore';
import { COL } from '../constants/collections';
import {
  MAX_ORDER_LINES,
  MAX_QTY_PER_LINE,
  type DeliveryMethod,
  type PaymentMethod,
} from '../constants/orders';
import type { Discount, InventoryItem, Order, OrderItem, OrderLookup, Product } from '../types';
import type { KES } from '../types/common';
import { deliveryFeeFor } from '../utils/delivery';
import { evaluateDiscount, normalizeCode } from '../utils/discount';
import { generateOrderNumber, orderLookupId } from '../utils/order';
import { normalizeKenyanPhone } from '../utils/phone';
import { inventoryId } from '../utils/text';

export interface CheckoutLine {
  productId: string;
  variantKey: string;
  qty: number;
}

export interface CheckoutInput {
  userId: string | null;
  lines: CheckoutLine[];
  customer: { name: string; email: string; phone: string };
  delivery: {
    method: DeliveryMethod;
    county: string;
    town: string;
    address: string;
    notes: string;
    zoneId: string | null;
    zoneName: string;
    zoneFee: KES;
    estimatedDays: string;
  };
  paymentMethod: PaymentMethod;
  discountCode: string | null;
  freeDeliveryThreshold: KES;
}

/** What the customer sees after placing an order (guests cannot read the order doc back). */
export interface PlacedOrder {
  id: string;
  orderNumber: string;
  lookupId: string;
  items: OrderItem[];
  subtotal: KES;
  discount: { code: string; amount: KES } | null;
  deliveryFee: KES;
  total: KES;
  customer: CheckoutInput['customer'];
  delivery: Order['delivery'];
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export type CheckoutErrorCode =
  | 'empty'
  | 'too_many_lines'
  | 'invalid_phone'
  | 'unavailable'
  | 'insufficient_stock'
  | 'discount_invalid'
  | 'failed';

export class CheckoutError extends Error {
  constructor(
    public readonly code: CheckoutErrorCode,
    message: string,
    /** For stock problems: the line and how many are actually available. */
    public readonly lines: {
      productId: string;
      variantKey: string;
      available: number;
      name: string;
    }[] = [],
  ) {
    super(message);
    this.name = 'CheckoutError';
  }
}

/** Merge duplicate lines and clamp quantities. */
function normalizeLines(lines: CheckoutLine[]): CheckoutLine[] {
  const map = new Map<string, CheckoutLine>();
  for (const l of lines) {
    const key = `${l.productId}::${l.variantKey}`;
    const prev = map.get(key);
    map.set(key, {
      ...l,
      qty: Math.min(MAX_QTY_PER_LINE, (prev?.qty ?? 0) + Math.max(1, Math.floor(l.qty))),
    });
  }
  return [...map.values()];
}

export async function placeOrder(db: Firestore, input: CheckoutInput): Promise<PlacedOrder> {
  const lines = normalizeLines(input.lines);
  if (lines.length === 0) throw new CheckoutError('empty', 'Your bag is empty.');
  if (lines.length > MAX_ORDER_LINES) {
    throw new CheckoutError(
      'too_many_lines',
      `Orders can contain up to ${MAX_ORDER_LINES} different items.`,
    );
  }
  const phone = normalizeKenyanPhone(input.customer.phone);
  if (!phone) throw new CheckoutError('invalid_phone', 'Enter a valid Kenyan phone number.');
  const customer = {
    name: input.customer.name.trim(),
    email: input.customer.email.trim().toLowerCase(),
    phone,
  };
  const code = input.discountCode ? normalizeCode(input.discountCode) : null;
  const productIds = [...new Set(lines.map((l) => l.productId))];

  const orderRef = doc(collection(db, COL.orders));

  // Order number collisions are vanishingly rare, but the lookup doc id must be unique.
  let attempt = 0;
  while (true) {
    attempt++;
    const orderNumber = generateOrderNumber();
    const lookupId = await orderLookupId(orderNumber, phone);
    try {
      return await runTransaction(db, async (tx) => {
        // ── reads (all before any write) ──
        const lookupRef = doc(db, COL.orderLookup, lookupId);
        const productRefs = productIds.map(
          (id) => doc(db, COL.products, id) as DocumentReference<Product>,
        );
        const invRefs = lines.map(
          (l) =>
            doc(
              db,
              COL.inventory,
              inventoryId(l.productId, l.variantKey),
            ) as DocumentReference<InventoryItem>,
        );
        const discountRef = code
          ? (doc(db, COL.discounts, code) as DocumentReference<Discount>)
          : null;

        const [lookupSnap, productSnaps, invSnaps, discountSnap] = await Promise.all([
          tx.get(lookupRef),
          Promise.all(productRefs.map((r) => tx.get(r).catch(() => null))),
          Promise.all(invRefs.map((r) => tx.get(r))),
          discountRef ? tx.get(discountRef) : Promise.resolve(null),
        ]);
        if (lookupSnap.exists()) throw new CollisionError();

        const products = new Map<string, Product>();
        productSnaps.forEach((s, i) => {
          if (s?.exists() && s.data().status === 'active') products.set(productIds[i]!, s.data());
        });

        // ── validate stock with live prices ──
        const problems: CheckoutError['lines'] = [];
        const items: OrderItem[] = [];
        lines.forEach((l, i) => {
          const product = products.get(l.productId);
          const inv = invSnaps[i]!.exists() ? invSnaps[i]!.data() : null;
          const variant = product?.variants.find((v) => v.key === l.variantKey);
          const available = inv?.stock ?? 0;
          if (!product || !variant || !inv) {
            problems.push({
              productId: l.productId,
              variantKey: l.variantKey,
              available: 0,
              name: product?.name ?? 'An item',
            });
            return;
          }
          if (available < l.qty) {
            problems.push({
              productId: l.productId,
              variantKey: l.variantKey,
              available,
              name: product.name,
            });
            return;
          }
          const image =
            product.images.find((im) => im.color === variant.color) ?? product.images[0];
          items.push({
            productId: l.productId,
            variantKey: l.variantKey,
            name: product.name,
            slug: product.slug,
            image: image?.url ?? '',
            color: variant.color,
            size: variant.size,
            qty: l.qty,
            unitPrice: product.price,
          });
        });
        if (problems.length > 0) {
          const unavailable = problems.every((p) => p.available === 0);
          throw new CheckoutError(
            unavailable ? 'unavailable' : 'insufficient_stock',
            problems.length === 1
              ? `${problems[0]!.name} ${problems[0]!.available === 0 ? 'is no longer available' : `only has ${problems[0]!.available} left`} in that size.`
              : 'Some items in your bag are no longer available in the quantity you chose.',
            problems,
          );
        }

        const subtotal = items.reduce((n, it) => n + it.qty * it.unitPrice, 0);
        const itemCount = items.reduce((n, it) => n + it.qty, 0);

        let discount: Order['discount'] = null;
        if (discountRef && code) {
          const check = evaluateDiscount(
            discountSnap?.exists() ? discountSnap.data() : null,
            subtotal,
          );
          if (!check.ok) throw new CheckoutError('discount_invalid', check.reason);
          discount = { code, amount: check.amount };
        }

        const isPickup = input.delivery.method === 'pickup';
        const deliveryFee = isPickup
          ? 0
          : deliveryFeeFor(
              input.delivery.zoneFee,
              subtotal - (discount?.amount ?? 0),
              input.freeDeliveryThreshold,
            );
        const total = subtotal - (discount?.amount ?? 0) + deliveryFee;
        const delivery: Order['delivery'] = {
          method: input.delivery.method,
          county: isPickup ? '' : input.delivery.county,
          town: isPickup ? '' : input.delivery.town.trim(),
          address: isPickup ? '' : input.delivery.address.trim(),
          notes: input.delivery.notes.trim(),
          zoneId: isPickup ? null : input.delivery.zoneId,
          zoneName: isPickup ? 'Store pickup' : input.delivery.zoneName,
          fee: deliveryFee,
          estimatedDays: input.delivery.estimatedDays,
        };

        // serverTimestamp() is not allowed inside arrays, so history uses the client clock.
        const historyAt = Timestamp.now();

        // ── writes ──
        const order: Omit<Order, 'createdAt' | 'updatedAt' | 'paidAt'> & Record<string, unknown> = {
          orderNumber,
          userId: input.userId,
          customer,
          delivery,
          items,
          productIds: [...new Set(items.map((i) => i.productId))],
          itemCount,
          subtotal,
          discount,
          deliveryFee,
          total,
          paymentMethod: input.paymentMethod,
          paymentStatus: 'unpaid',
          paymentRef: null,
          paidAt: null,
          status: 'pending',
          statusHistory: [{ status: 'pending', at: historyAt, by: input.userId ?? 'customer' }],
          adminNotes: '',
          lookupId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        tx.set(orderRef, order);

        const lookup: Omit<OrderLookup, 'createdAt'> & { createdAt: unknown } = {
          orderId: orderRef.id,
          orderNumber,
          status: 'pending',
          statusHistory: [{ status: 'pending', at: historyAt }],
          itemCount,
          total,
          deliveryMethod: delivery.method,
          createdAt: serverTimestamp(),
        };
        tx.set(lookupRef, lookup);

        lines.forEach((l, i) => {
          tx.update(invRefs[i]!, {
            stock: invSnaps[i]!.data()!.stock - l.qty,
            lastOrderId: orderRef.id,
            updatedAt: serverTimestamp(),
          });
        });

        productIds.forEach((id, i) => {
          const sold = lines.filter((l) => l.productId === id).reduce((n, l) => n + l.qty, 0);
          const p = products.get(id)!;
          tx.update(productRefs[i]!, {
            totalStock: Math.max(0, p.totalStock - sold),
            salesCount: p.salesCount + (p.totalStock - Math.max(0, p.totalStock - sold)),
            lastOrderId: orderRef.id,
          });
        });

        if (discountRef && discountSnap?.exists()) {
          tx.update(discountRef, {
            usedCount: discountSnap.data().usedCount + 1,
            lastOrderId: orderRef.id,
          });
        }

        return {
          id: orderRef.id,
          orderNumber,
          lookupId,
          items,
          subtotal,
          discount,
          deliveryFee,
          total,
          customer,
          delivery,
          paymentMethod: input.paymentMethod,
          createdAt: new Date().toISOString(),
        };
      });
    } catch (err) {
      if (err instanceof CollisionError && attempt < 3) continue;
      if (err instanceof CheckoutError) throw err;
      console.error('[checkout] transaction failed', err);
      throw new CheckoutError(
        'failed',
        'We could not place your order. Please check your connection and try again.',
      );
    }
  }
}

class CollisionError extends Error {}
