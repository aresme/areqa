import { z } from 'zod';
import { KENYA_COUNTIES } from '../constants/kenya';
import { PAYMENT_METHODS } from '../constants/orders';
import { isValidKenyanPhone } from '../utils/phone';

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name').max(80),
    email: z.string().trim().toLowerCase().email('Enter a valid email address').max(120),
    phone: z
      .string()
      .trim()
      .refine(isValidKenyanPhone, 'Use a Kenyan number like 0712 345 678 or +254 712 345 678'),
    method: z.enum(['delivery', 'pickup']),
    county: z.string(),
    town: z.string().trim().max(80),
    address: z.string().trim().max(200),
    notes: z.string().trim().max(500),
    paymentMethod: z.enum(PAYMENT_METHODS),
    /** Honeypot — must stay empty. */
    website: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.method !== 'delivery') return;
    if (!(KENYA_COUNTIES as readonly string[]).includes(v.county)) {
      ctx.addIssue({ code: 'custom', path: ['county'], message: 'Choose your county' });
    }
    if (v.town.length < 2)
      ctx.addIssue({ code: 'custom', path: ['town'], message: 'Enter your town or area' });
    if (v.address.length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['address'],
        message: 'Enter your street, building or landmark',
      });
    }
  });

export type CheckoutForm = z.infer<typeof checkoutSchema>;
