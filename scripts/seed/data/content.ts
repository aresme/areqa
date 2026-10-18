import type { HomeContent, PagesContent } from '../../../packages/shared/src/types';
import { IMG } from './images';

const img = (url: string, alt: string) => ({ url, publicId: '', alt });

export const HOME: HomeContent = {
  announcement: {
    text: 'Free delivery on orders over KSh 5,000 · Pay on delivery countrywide',
    href: '/shipping',
    isActive: true,
  },
  heroSlides: [
    {
      id: 'short-rains',
      eyebrow: 'New season',
      headline: 'Layer up for the short rains',
      subtext: 'Coats, knits and outerwear cut for cool Kenyan mornings.',
      image: img(IMG.coatBlue, 'Woman in a long pale blue coat walking in the city'),
      primaryCta: { label: 'Shop new in', href: '/shop/new-in' },
      secondaryCta: { label: 'Outerwear', href: '/shop/jackets-coats' },
    },
    {
      id: 'workwear',
      eyebrow: 'The Workwear Edit',
      headline: 'Sharp lines. Easy days.',
      subtext: 'Tailoring and shirts that move from the office to dinner.',
      image: img(IMG.suitFull, 'Man in a navy tailored suit outside a glass office building'),
      primaryCta: { label: 'Shop the edit', href: '/shop/the-workwear-edit' },
      secondaryCta: { label: 'Shop men', href: '/shop/men' },
    },
    {
      id: 'weekend',
      eyebrow: 'Weekend Essentials',
      headline: 'Made for slow Saturdays',
      subtext: 'Lounge sets, heavyweight sweats and everyday tees.',
      image: img(IMG.loungeSet, 'Woman in a mustard two-piece lounge set on a basketball court'),
      primaryCta: { label: 'Shop essentials', href: '/shop/weekend-essentials' },
      secondaryCta: null,
    },
  ],
  featureBanner: {
    eyebrow: 'Collection',
    headline: 'Nairobi Nights',
    body: 'Statement dresses, satin and leather for evenings that run late. Designed to turn heads from Westlands to Watamu.',
    image: img(IMG.maxiRed, 'Woman twirling in a flowing red maxi dress'),
    cta: { label: 'Explore the collection', href: '/shop/nairobi-nights' },
  },
  testimonials: [
    {
      id: 't1',
      name: 'Wanjiru K.',
      location: 'Nakuru',
      quote:
        'Ordered in the morning, delivered the same afternoon. The maxi dress fit perfectly and the fabric feels expensive.',
      rating: 5,
    },
    {
      id: 't2',
      name: 'Brian O.',
      location: 'Nairobi',
      quote:
        'Finally a Kenyan brand that gets fit right. The chinos and oxford shirt are now my office uniform.',
      rating: 5,
    },
    {
      id: 't3',
      name: 'Amina H.',
      location: 'Mombasa',
      quote:
        'Paying on delivery made me comfortable trying them out. The team called to confirm within an hour. Will order again.',
      rating: 5,
    },
    {
      id: 't4',
      name: 'Kevin M.',
      location: 'Eldoret',
      quote:
        'The heavyweight crewneck is the warmest sweatshirt I own. Courier delivery took two days.',
      rating: 4,
    },
  ],
  lookbook: [
    {
      id: 'l1',
      image: img(IMG.redGraphicLook, 'Model in a red graphic top and black jacket'),
      caption: '@areqa',
      href: '/shop/new-in',
    },
    {
      id: 'l2',
      image: img(IMG.flatlayMen, 'Flat lay of chinos, tee, watch and white sneakers'),
      caption: 'Off-duty',
      href: '/shop/men',
    },
    {
      id: 'l3',
      image: img(IMG.knitFlatlay, 'Knitwear and denim flat lay with tulips'),
      caption: 'Soft layers',
      href: '/shop/knitwear-sweats',
    },
    {
      id: 'l4',
      image: img(IMG.laceTop, 'Model in a green lace top against a yellow wall'),
      caption: 'Colour pop',
      href: '/shop/women',
    },
    {
      id: 'l5',
      image: img(IMG.rackNeutral, 'Neutral tones on a clothing rail'),
      caption: 'Neutrals',
      href: '/shop',
    },
    {
      id: 'l6',
      image: img(IMG.storeRack, 'Colourful clothing rail in the Areqa studio'),
      caption: 'In store',
      href: '/about',
    },
  ],
  newsletter: {
    headline: 'Join the list',
    body: 'New drops, restocks and members-only offers. No spam, unsubscribe anytime.',
  },
};

export const PAGES: PagesContent = {
  faq: [
    {
      id: 'f1',
      group: 'Orders',
      question: 'How do I place an order?',
      answer:
        'Add items to your cart, go to checkout, fill in your contact and delivery details and tap **Place order**. You will receive an email confirmation and our team will call you to confirm.',
    },
    {
      id: 'f2',
      group: 'Orders',
      question: 'Do I need an account to order?',
      answer:
        'No. You can check out as a guest. Creating an account lets you track orders, save addresses and keep a wishlist across devices.',
    },
    {
      id: 'f3',
      group: 'Payment',
      question: 'How do I pay?',
      answer:
        'Choose **Pay on Delivery** (cash or M-Pesa to the rider) or **Pay via M-Pesa after confirmation**, where we send you our Till number once we confirm your order by phone.',
    },
    {
      id: 'f4',
      group: 'Delivery',
      question: 'How long does delivery take?',
      answer:
        'Nakuru Town: same day for orders before 2pm. Nairobi & Metro: 1–2 days. Mombasa & Coast: 2–3 days. Rest of Kenya: 2–4 days via courier.',
    },
    {
      id: 'f5',
      group: 'Delivery',
      question: 'How much is delivery?',
      answer:
        'Fees depend on your location and are shown at checkout before you place your order. Delivery is **free** on orders over KSh 5,000.',
    },
    {
      id: 'f6',
      group: 'Delivery',
      question: 'Can I pick up my order?',
      answer:
        'Yes. Select **Pick up from store** at checkout and collect from our Nakuru CBD studio once we notify you that your order is ready.',
    },
    {
      id: 'f7',
      group: 'Returns',
      question: 'What is your returns policy?',
      answer:
        'Unworn items with tags can be exchanged or returned within 7 days of delivery. See our [Returns & Exchanges](/returns) page for details.',
    },
    {
      id: 'f8',
      group: 'Products',
      question: 'How do I find my size?',
      answer:
        'Every product page has a **Size guide** link with measurements in centimetres. If you are between sizes, WhatsApp us and we will help.',
    },
  ],
  pages: {
    about: {
      title: 'About Areqa',
      body: `Areqa is a Kenyan fashion label based in Nakuru, making modern, well-cut clothing for everyday life in East Africa.

## What we believe
- **Quality first.** We choose fabrics that last: heavyweight cottons, real leather and breathable linens.
- **Fit for here.** Our patterns are tested on real Kenyan bodies and for our climate, from chilly highland mornings to humid coast evenings.
- **Honest pricing.** No inflated "sales". Fair prices, all year round.

## Visit us
Come and see the collection at our studio on Kenyatta Avenue, Nakuru CBD, Monday to Saturday, 9am–6pm.`,
    },
    shipping: {
      title: 'Shipping & Delivery',
      body: `We deliver to all 47 counties.

## Delivery zones
- **Nakuru Town:** KSh 150, same day for orders placed before 2pm.
- **Rest of Nakuru County:** KSh 300, 1–2 days.
- **Nairobi & Metro** (Nairobi, Kiambu, Kajiado, Machakos): KSh 350, 1–2 days.
- **Mombasa & Coast** (Mombasa, Kilifi, Kwale): KSh 450, 2–3 days.
- **Rest of Kenya:** KSh 500, 2–4 days via courier.

Orders over **KSh 5,000** ship free.

## How it works
1. Place your order online.
2. We call or WhatsApp you to confirm, usually within an hour during business hours.
3. Your order is packed and handed to our rider or courier.
4. Pay on delivery, or via M-Pesa once confirmed.

You can follow progress any time on the [Track order](/track) page.`,
    },
    returns: {
      title: 'Returns & Exchanges',
      body: `We want you to love what you ordered.

## Eligibility
- Request a return or exchange within **7 days** of delivery.
- Items must be unworn, unwashed and with original tags attached.
- For hygiene reasons, we cannot accept returns on underwear or earrings.

## How to return
1. WhatsApp or email us with your order number and the item(s).
2. Drop the item at our Nakuru studio, or we will arrange a pickup (delivery fee applies).
3. Once inspected, we will exchange the item or refund via M-Pesa within 3 working days.

Sale items can be exchanged but not refunded.`,
    },
    privacy: {
      title: 'Privacy Policy',
      body: `This policy explains how Areqa collects and uses your personal data, in line with the Kenya Data Protection Act, 2019.

## What we collect
Your name, phone number, email address and delivery address when you place an order or create an account, plus basic usage analytics.

## How we use it
To process and deliver your orders, contact you about your order, and, only if you opt in, send you marketing emails.

## Sharing
We share delivery details only with our riders and courier partners. We never sell your data.

## Your rights
You can request access to, correction of, or deletion of your data at any time by emailing us.`,
    },
    terms: {
      title: 'Terms & Conditions',
      body: `By using this website and placing an order you agree to these terms.

## Orders
All orders are subject to confirmation and stock availability. We may cancel an order if an item is unavailable or a pricing error occurs, and will let you know immediately.

## Prices
Prices are in Kenya Shillings (KSh) and include VAT where applicable. Delivery fees are shown at checkout.

## Payment
Payment is made on delivery or via M-Pesa after we confirm your order.

## Liability
We are not liable for delays caused by events outside our control, such as weather or courier disruptions.`,
    },
  },
};
