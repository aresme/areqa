import type { Gender } from '../../../packages/shared/src/types';
import { IMG } from './images';

export interface SeedCategory {
  slug: string;
  name: string;
  description: string;
  image: string;
}

export const CATEGORIES: SeedCategory[] = [
  {
    slug: 't-shirts',
    name: 'T-Shirts',
    description: 'Heavyweight cotton essentials and graphic tees.',
    image: IMG.teeStack,
  },
  {
    slug: 'shirts',
    name: 'Shirts',
    description: 'Crisp oxfords and easy chambray for work and weekend.',
    image: IMG.oxfordShirts,
  },
  {
    slug: 'knitwear-sweats',
    name: 'Knitwear & Sweats',
    description: 'Crewnecks, lounge sets and soft knits.',
    image: IMG.crewWhite,
  },
  {
    slug: 'jackets-coats',
    name: 'Jackets & Coats',
    description: 'Layers for Nairobi mornings and the short rains.',
    image: IMG.leatherJacket,
  },
  {
    slug: 'trousers-denim',
    name: 'Trousers & Denim',
    description: 'Chinos, denim and relaxed trousers.',
    image: IMG.denimStraight,
  },
  {
    slug: 'dresses',
    name: 'Dresses',
    description: 'Maxi, midi and occasion dresses.',
    image: IMG.maxiRed,
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    description: 'Caps, bags and finishing touches.',
    image: IMG.truckerCap,
  },
];

export const COLLECTIONS: SeedCategory[] = [
  {
    slug: 'nairobi-nights',
    name: 'Nairobi Nights',
    description: 'Statement pieces for evenings out in the city.',
    image: IMG.maxiRed,
  },
  {
    slug: 'weekend-essentials',
    name: 'Weekend Essentials',
    description: 'Easy, comfortable pieces you will reach for every Saturday.',
    image: IMG.loungeSet,
  },
  {
    slug: 'the-workwear-edit',
    name: 'The Workwear Edit',
    description: 'Sharp tailoring and shirts that take you from desk to dinner.',
    image: IMG.suitFull,
  },
];

export interface SeedProduct {
  name: string;
  category: string;
  collections?: string[];
  gender: Gender;
  price: number;
  compareAt?: number;
  short: string;
  description: string;
  material: string;
  tags: string[];
  colors: { name: string; hex: string; images: string[] }[];
  sizes: 'apparel' | 'waist' | 'one' | string[];
  flags?: { featured?: boolean; new?: boolean; best?: boolean };
  /** Stock profile: normal, low (1–3 per variant), mixed (some sold out). */
  stock?: 'normal' | 'low' | 'mixed';
  salesCount?: number;
}

const CARE_COTTON =
  'Machine wash cold with similar colours. Do not bleach. Tumble dry low or line dry in shade. Warm iron inside out.';
const CARE_DELICATE =
  'Hand wash cold or dry clean. Do not wring. Dry flat in shade. Cool iron on reverse.';

export const PRODUCTS: SeedProduct[] = [
  {
    name: 'Essential Cotton Tee',
    category: 't-shirts',
    collections: ['weekend-essentials'],
    gender: 'unisex',
    price: 1500,
    short: 'A 220gsm everyday tee with a clean crew neck and a relaxed, structured fit.',
    description:
      'The tee everything else is built around. Cut from dense 220gsm combed cotton that holds its shape wash after wash, with a ribbed crew neck that stays flat and a relaxed body that skims rather than clings.\n\nWear it alone with chinos, or layer it under a jacket when the evening cools down.',
    material: `100% combed cotton, 220gsm. ${CARE_COTTON}`,
    tags: ['basics', 'cotton', 'crew neck', 'everyday'],
    colors: [
      { name: 'White', hex: '#FFFFFF', images: [IMG.teeWhite, IMG.teeStack] },
      { name: 'Black', hex: '#0B0B0B', images: [IMG.teeBlack] },
      { name: 'Sky', hex: '#A9C4DE', images: [IMG.teeSky] },
    ],
    sizes: 'apparel',
    flags: { best: true },
    salesCount: 184,
  },
  {
    name: 'Original Graphic Tee',
    category: 't-shirts',
    gender: 'unisex',
    price: 1800,
    short: 'Boxy-fit heavyweight tee with a bold screen-printed front graphic.',
    description:
      'A boxy, slightly dropped-shoulder tee finished with a crisp two-colour screen print. Printed locally in small runs so the ink sits sharp and soft to the touch.',
    material: `100% cotton, 240gsm. Screen-printed graphic. ${CARE_COTTON}`,
    tags: ['graphic', 'streetwear', 'print', 'boxy'],
    colors: [{ name: 'Sand', hex: '#D8C3A5', images: [IMG.teeGraphic, IMG.teeStack] }],
    sizes: 'apparel',
    flags: { new: true },
    salesCount: 46,
  },
  {
    name: 'Peace Sign Graphic Tee',
    category: 't-shirts',
    gender: 'men',
    price: 1900,
    short: 'Longline black tee with a hand-drawn skeleton peace-sign print.',
    description:
      'A longline cut with a slightly curved hem and a hand-drawn front print. Made for layering over a longer white tee or wearing on its own with black denim.',
    material: `100% cotton jersey, 200gsm. ${CARE_COTTON}`,
    tags: ['graphic', 'streetwear', 'longline'],
    colors: [{ name: 'Black', hex: '#0B0B0B', images: [IMG.teeSkeleton] }],
    sizes: 'apparel',
    stock: 'mixed',
    salesCount: 31,
  },
  {
    name: 'Heavyweight Crewneck Sweatshirt',
    category: 'knitwear-sweats',
    collections: ['weekend-essentials'],
    gender: 'unisex',
    price: 3200,
    compareAt: 3800,
    short: 'Brushed-back fleece crewneck with ribbed cuffs and hem.',
    description:
      'Our warmest everyday layer. A 380gsm brushed-back fleece with a soft interior, ribbed trims and a relaxed shoulder. Perfect for chilly Nakuru mornings and evenings in Limuru.',
    material: `80% cotton, 20% polyester fleece, 380gsm. ${CARE_COTTON}`,
    tags: ['sweatshirt', 'fleece', 'crewneck', 'warm'],
    colors: [
      { name: 'White', hex: '#FFFFFF', images: [IMG.crewWhite] },
      { name: 'Orange', hex: '#E8833A', images: [IMG.sweatOrange] },
    ],
    sizes: 'apparel',
    flags: { best: true },
    salesCount: 122,
  },
  {
    name: 'Pastel Crew Sweatshirt',
    category: 'knitwear-sweats',
    gender: 'men',
    price: 2900,
    short: 'A lightweight loopback crew in a washed pastel pink.',
    description:
      'Lighter than our heavyweight crew, with a garment-dyed finish that gives each piece a slightly lived-in tone. Pair it with distressed denim for an easy weekend look.',
    material: `100% cotton loopback, 300gsm, garment dyed. ${CARE_COTTON}`,
    tags: ['sweatshirt', 'pastel', 'garment dyed'],
    colors: [{ name: 'Pink', hex: '#F4B6C2', images: [IMG.sweatPink] }],
    sizes: 'apparel',
    flags: { new: true },
    salesCount: 18,
  },
  {
    name: 'Two-Piece Lounge Set',
    category: 'knitwear-sweats',
    collections: ['weekend-essentials'],
    gender: 'women',
    price: 5500,
    short: 'Cropped hoodie and cuffed jogger set in a sunny mustard fleece.',
    description:
      'A matching set made for slow Sundays and airport runs. The cropped hoodie has a roomy hood and dropped shoulders; the joggers sit high on the waist with an elasticated drawcord and cuffed ankles.\n\nSold as a set.',
    material: `70% cotton, 30% polyester fleece. ${CARE_COTTON}`,
    tags: ['set', 'lounge', 'hoodie', 'joggers', 'co-ord'],
    colors: [{ name: 'Mustard', hex: '#E3B23C', images: [IMG.loungeSet] }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    flags: { featured: true, new: true },
    salesCount: 64,
  },
  {
    name: 'Satin Bomber Jacket',
    category: 'jackets-coats',
    collections: ['nairobi-nights'],
    gender: 'unisex',
    price: 4800,
    short: 'Lightweight satin-finish bomber with a ribbed collar and zip pockets.',
    description:
      'A classic bomber silhouette in a lightly padded satin-finish shell. Ribbed collar, cuffs and hem keep the shape neat, and two zip pockets keep your phone safe on a night out.',
    material: `Shell: 100% polyester. Lining: 100% polyester. ${CARE_DELICATE}`,
    tags: ['bomber', 'jacket', 'satin', 'outerwear'],
    colors: [{ name: 'Rust', hex: '#B4532A', images: [IMG.bomberRust] }],
    sizes: 'apparel',
    flags: { new: true },
    salesCount: 27,
  },
  {
    name: 'Moto Leather Jacket',
    category: 'jackets-coats',
    collections: ['nairobi-nights'],
    gender: 'men',
    price: 12500,
    compareAt: 14500,
    short: 'Asymmetric-zip biker jacket in buttery-soft genuine leather.',
    description:
      'Cut from soft, full-grain leather that only gets better with wear. Asymmetric front zip, snap-down lapels, zipped cuffs and a quilted lining for structure. An investment piece you will wear for years.',
    material:
      'Shell: 100% genuine leather. Lining: 100% polyester. Specialist leather clean only. Store on a wide hanger away from direct sunlight.',
    tags: ['leather', 'biker', 'jacket', 'outerwear', 'premium'],
    colors: [{ name: 'Black', hex: '#0B0B0B', images: [IMG.leatherJacket, IMG.leatherLook] }],
    sizes: ['S', 'M', 'L', 'XL'],
    flags: { featured: true },
    stock: 'low',
    salesCount: 14,
  },
  {
    name: 'Classic Denim Jacket',
    category: 'jackets-coats',
    collections: ['weekend-essentials'],
    gender: 'unisex',
    price: 5200,
    short: 'Rigid indigo trucker jacket with a contrast corduroy collar.',
    description:
      'A heritage trucker jacket in 13oz rigid denim with a brown corduroy collar. Starts crisp and softens into your shape. Size up for an oversized fit.',
    material: `100% cotton denim, 13oz. Wash inside out, cold, sparingly. ${CARE_COTTON}`,
    tags: ['denim', 'jacket', 'trucker', 'corduroy'],
    colors: [{ name: 'Indigo', hex: '#2E3E5C', images: [IMG.denimJacket, IMG.chinoLook] }],
    sizes: 'apparel',
    flags: { best: true },
    salesCount: 96,
  },
  {
    name: 'Wool Blend Tailored Coat',
    category: 'jackets-coats',
    collections: ['the-workwear-edit'],
    gender: 'women',
    price: 9800,
    short: 'Single-breasted, mid-thigh coat in a rich burgundy wool blend.',
    description:
      'A sharp, single-breasted coat with notch lapels, welt pockets and a clean back vent. The wool blend is warm without bulk, ideal for cool mornings during the rains.',
    material: `60% wool, 35% polyester, 5% other fibres. ${CARE_DELICATE}`,
    tags: ['coat', 'wool', 'tailored', 'outerwear'],
    colors: [{ name: 'Burgundy', hex: '#6D1F2B', images: [IMG.coatBurgundy] }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    flags: { featured: true },
    salesCount: 22,
  },
  {
    name: 'Oversized Plaid Blazer',
    category: 'jackets-coats',
    collections: ['the-workwear-edit'],
    gender: 'women',
    price: 6500,
    short: 'Relaxed double-breasted blazer in a deep green and navy check.',
    description:
      'An oversized take on a menswear classic. Strong shoulders, a longer length and a soft check that dresses up jeans or relaxes a pair of tailored trousers.',
    material: `65% polyester, 35% viscose. Lined. ${CARE_DELICATE}`,
    tags: ['blazer', 'plaid', 'check', 'oversized', 'tailoring'],
    colors: [{ name: 'Navy Check', hex: '#1E2A44', images: [IMG.plaidBlazer] }],
    sizes: ['XS', 'S', 'M', 'L'],
    salesCount: 19,
  },
  {
    name: 'Tailored Suit Blazer',
    category: 'jackets-coats',
    collections: ['the-workwear-edit'],
    gender: 'men',
    price: 8900,
    short: 'Slim two-button blazer in a deep navy stretch suiting.',
    description:
      'A slim, two-button blazer with a half-canvas front for a clean drape. The stretch suiting moves with you through a long day in town and still looks sharp at the evening event.',
    material: `68% polyester, 30% viscose, 2% elastane. ${CARE_DELICATE}`,
    tags: ['blazer', 'suit', 'tailoring', 'formal', 'office'],
    colors: [{ name: 'Navy', hex: '#1E2A44', images: [IMG.suitFull, IMG.suitDetail] }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    salesCount: 37,
  },
  {
    name: 'Oxford Dress Shirt',
    category: 'shirts',
    collections: ['the-workwear-edit'],
    gender: 'men',
    price: 2800,
    short: 'A crisp, easy-iron oxford shirt with a button-down collar.',
    description:
      'The workhorse of a good wardrobe. Woven from a soft oxford cotton with an easy-iron finish, a button-down collar and a tailored-but-not-tight body.',
    material: `100% cotton oxford, easy-iron finish. ${CARE_COTTON}`,
    tags: ['shirt', 'oxford', 'office', 'formal'],
    colors: [
      { name: 'Grey', hex: '#6B7280', images: [IMG.oxfordShirts] },
      { name: 'White', hex: '#FFFFFF', images: [IMG.oxfordShirts] },
      { name: 'Burgundy', hex: '#6D1F2B', images: [IMG.oxfordShirts] },
    ],
    sizes: 'apparel',
    flags: { best: true },
    salesCount: 141,
  },
  {
    name: 'Chambray Dot Shirt',
    category: 'shirts',
    gender: 'women',
    price: 2600,
    short: 'Lightweight chambray shirt with a micro dot print and three-quarter sleeves.',
    description:
      'Airy chambray with a playful micro-dot print. Three-quarter sleeves, a relaxed body and a curved hem that looks great tucked or loose.',
    material: `100% cotton chambray. ${CARE_COTTON}`,
    tags: ['shirt', 'chambray', 'print', 'casual'],
    colors: [{ name: 'Denim', hex: '#5A7BA6', images: [IMG.chambrayShirt] }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 'low',
    salesCount: 29,
  },
  {
    name: 'Slim Stretch Chino',
    category: 'trousers-denim',
    collections: ['weekend-essentials'],
    gender: 'men',
    price: 3400,
    short: 'Slim-tapered chino in a stretch cotton twill.',
    description:
      'Clean, slim and endlessly versatile. A stretch cotton twill with a mid rise and a gentle taper through the leg. Dress it up with an oxford or down with a tee and sneakers.',
    material: `98% cotton, 2% elastane twill. ${CARE_COTTON}`,
    tags: ['chinos', 'trousers', 'slim', 'stretch'],
    colors: [{ name: 'Sand', hex: '#C8B08A', images: [IMG.chinoLook, IMG.flatlayMen] }],
    sizes: 'waist',
    flags: { best: true },
    salesCount: 133,
  },
  {
    name: 'Straight Leg Raw Denim',
    category: 'trousers-denim',
    gender: 'men',
    price: 3900,
    short: 'Classic five-pocket jean in a deep rinse with a straight leg.',
    description:
      'A timeless five-pocket straight leg in a deep indigo rinse. Mid rise, regular through the thigh and straight from knee to hem.',
    material: `99% cotton, 1% elastane denim, 12oz. Wash inside out, cold. ${CARE_COTTON}`,
    tags: ['jeans', 'denim', 'straight leg'],
    colors: [{ name: 'Indigo', hex: '#2E3E5C', images: [IMG.denimStraight] }],
    sizes: 'waist',
    salesCount: 58,
  },
  {
    name: 'Satin Cargo Jogger',
    category: 'trousers-denim',
    collections: ['nairobi-nights'],
    gender: 'women',
    price: 3600,
    compareAt: 4500,
    short: 'High-rise satin jogger with utility pockets and cuffed ankles.',
    description:
      'Utility meets polish. A fluid satin jogger with a high, elasticated waist, front pleats, patch cargo pockets and cuffed ankles. Pair it with heels and a simple bodysuit for an elevated night look.',
    material: `100% polyester satin. ${CARE_DELICATE}`,
    tags: ['joggers', 'cargo', 'satin', 'trousers'],
    colors: [{ name: 'Blush', hex: '#E7C3B6', images: [IMG.cargoJogger] }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    salesCount: 44,
  },
  {
    name: 'Striped Wide-Leg Trousers',
    category: 'trousers-denim',
    gender: 'women',
    price: 3800,
    short: 'Flowing high-waisted trousers in a bold black and white stripe.',
    description:
      'Make an entrance. A super-wide leg that moves beautifully, a high waist that elongates and a bold vertical stripe. Side zip with a clean, flat front.',
    material: `95% polyester, 5% elastane crepe. ${CARE_DELICATE}`,
    tags: ['trousers', 'wide leg', 'stripe', 'high waist'],
    colors: [{ name: 'Black/White', hex: '#0B0B0B', images: [IMG.stripedTrousers] }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    flags: { new: true },
    salesCount: 12,
  },
  {
    name: 'Flowing Maxi Dress',
    category: 'dresses',
    collections: ['nairobi-nights'],
    gender: 'women',
    price: 5800,
    short: 'A sleeveless, floor-sweeping maxi with a fitted bodice and full skirt.',
    description:
      'Our most-loved occasion dress. A fitted, lined bodice gives way to a full, floor-length skirt that swirls when you move. Concealed back zip. Made for weddings, ruracios and every celebration in between.',
    material: `100% polyester chiffon, fully lined. ${CARE_DELICATE}`,
    tags: ['dress', 'maxi', 'occasion', 'wedding guest'],
    colors: [{ name: 'Red', hex: '#B91C1C', images: [IMG.maxiRed] }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    flags: { featured: true, best: true },
    salesCount: 108,
  },
  {
    name: 'Floral Midi Dress',
    category: 'dresses',
    gender: 'women',
    price: 4900,
    compareAt: 6200,
    short: 'Ruffle-sleeve midi dress in a red ditsy floral with a self-tie belt.',
    description:
      'Feminine and easy to wear. A wrap-effect neckline, soft ruffle sleeves and a swishy midi skirt, finished with a matching belt to define the waist.',
    material: `100% viscose. ${CARE_DELICATE}`,
    tags: ['dress', 'midi', 'floral', 'print'],
    colors: [{ name: 'Red Floral', hex: '#C2272D', images: [IMG.floralMidi] }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 'mixed',
    salesCount: 52,
  },
  {
    name: 'Crochet Fringe Poncho',
    category: 'knitwear-sweats',
    gender: 'women',
    price: 2400,
    short: 'Open-knit crochet poncho with a V-neck and fringed hem.',
    description:
      'A lightweight, hand-finished crochet layer for breezy beach evenings in Diani or a boho weekend look. Slips over a vest or swimwear.',
    material: `100% cotton yarn. Hand wash cold, dry flat. Do not hang when wet.`,
    tags: ['poncho', 'crochet', 'knit', 'beach', 'boho'],
    colors: [{ name: 'Off White', hex: '#F3EFE6', images: [IMG.poncho] }],
    sizes: 'one',
    flags: { new: true },
    salesCount: 9,
  },
  {
    name: 'Everyday Backpack',
    category: 'accessories',
    gender: 'unisex',
    price: 3500,
    short: 'Water-resistant 20L backpack with a padded laptop sleeve.',
    description:
      'Built for the matatu commute. A water-resistant shell, padded 15" laptop sleeve, hidden back pocket for your phone and wallet, and comfortable padded straps.',
    material: 'Water-resistant 600D polyester. Wipe clean with a damp cloth.',
    tags: ['bag', 'backpack', 'laptop', 'commute'],
    colors: [{ name: 'Navy', hex: '#1E2A44', images: [IMG.backpack] }],
    sizes: 'one',
    salesCount: 71,
  },
  {
    name: 'Mesh Trucker Cap',
    category: 'accessories',
    gender: 'unisex',
    price: 1200,
    short: 'Structured foam-front trucker cap with breathable mesh back.',
    description:
      'A clean, structured trucker with a breathable mesh back and adjustable snapback strap.',
    material: 'Front: polyester foam. Back: nylon mesh. Spot clean only.',
    tags: ['cap', 'hat', 'trucker'],
    colors: [{ name: 'White', hex: '#FFFFFF', images: [IMG.truckerCap, IMG.capLook] }],
    sizes: 'one',
    flags: { best: true },
    salesCount: 88,
  },
  {
    name: 'Washed Dad Cap',
    category: 'accessories',
    gender: 'unisex',
    price: 1100,
    compareAt: 1500,
    short: 'Unstructured, garment-washed cotton cap with a curved brim.',
    description:
      'Soft, unstructured and already broken in. Garment washed for a faded look, with an adjustable brass buckle strap.',
    material: '100% cotton twill, garment washed. Hand wash cold.',
    tags: ['cap', 'hat', 'dad cap'],
    colors: [{ name: 'Charcoal', hex: '#374151', images: [IMG.dadCap] }],
    sizes: 'one',
    salesCount: 40,
  },
  {
    name: 'Structured Top-Handle Bag',
    category: 'accessories',
    collections: ['nairobi-nights'],
    gender: 'women',
    price: 6900,
    short: 'Boxy top-handle bag with a polished turn-lock and detachable strap.',
    description:
      'A compact, structured bag with a polished silver turn-lock, a sturdy top handle and a detachable crossbody strap. Fits your phone, cards and lipstick.',
    material: 'Faux leather with suede-feel lining. Wipe clean. Store stuffed to keep its shape.',
    tags: ['bag', 'handbag', 'top handle', 'crossbody'],
    colors: [{ name: 'Red', hex: '#B91C1C', images: [IMG.handbagRed] }],
    sizes: 'one',
    flags: { featured: true, new: true },
    stock: 'low',
    salesCount: 15,
  },
];
