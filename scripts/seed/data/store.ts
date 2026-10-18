import { KENYA_COUNTIES } from '../../../packages/shared/src/constants';
import type { DeliveryZone, StoreSettings } from '../../../packages/shared/src/types';

const NAKURU_TOWN = [
  'Nakuru Town',
  'Milimani',
  'Section 58',
  'Lanet',
  'Free Area',
  'Shabab',
  'Kiamunyi',
  'Pipeline',
  'London',
  'Bondeni',
];
const NAIROBI_METRO_COUNTIES = ['Nairobi', 'Kiambu', 'Kajiado', 'Machakos'];
const COAST = ['Mombasa', 'Kilifi', 'Kwale'];

type SeedZone = DeliveryZone & { id: string };

/** Matching order: a zone listing the town wins over a county-only zone (see checkout service). */
export const DELIVERY_ZONES: SeedZone[] = [
  {
    id: 'nakuru-town',
    name: 'Nakuru Town',
    counties: ['Nakuru'],
    towns: NAKURU_TOWN,
    fee: 150,
    estimatedDays: 'Same day (order before 2pm)',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'nakuru-county',
    name: 'Rest of Nakuru County',
    counties: ['Nakuru'],
    towns: [],
    fee: 300,
    estimatedDays: '1–2 days',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'nairobi-metro',
    name: 'Nairobi & Metro',
    counties: NAIROBI_METRO_COUNTIES,
    towns: [],
    fee: 350,
    estimatedDays: '1–2 days',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'coast',
    name: 'Mombasa & Coast',
    counties: COAST,
    towns: [],
    fee: 450,
    estimatedDays: '2–3 days',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'rest-of-kenya',
    name: 'Rest of Kenya',
    counties: KENYA_COUNTIES.filter(
      (c) => !['Nakuru', ...NAIROBI_METRO_COUNTIES, ...COAST].includes(c),
    ),
    towns: [],
    fee: 500,
    estimatedDays: '2–4 days via courier',
    sortOrder: 5,
    isActive: true,
  },
];

const apparelGuide = {
  title: 'Tops & outerwear (cm)',
  columns: ['Size', 'Chest', 'Waist', 'Length'],
  rows: [
    { cells: ['XS', '84–88', '70–74', '66'] },
    { cells: ['S', '89–94', '75–80', '69'] },
    { cells: ['M', '95–100', '81–86', '72'] },
    { cells: ['L', '101–106', '87–92', '74'] },
    { cells: ['XL', '107–113', '93–99', '76'] },
    { cells: ['XXL', '114–120', '100–106', '78'] },
  ],
  note: 'Measure around the fullest part of your chest. Between sizes? Size up for a relaxed fit.',
};

export const SETTINGS: StoreSettings = {
  storeName: 'Areqa',
  tagline: 'Modern fashion, made for Kenya.',
  logo: null,
  contactEmail: 'hello@areqa.co.ke',
  orderAlertEmail: 'orders@areqa.co.ke',
  phone: '0712 345 678',
  whatsappNumber: '254712345678',
  address: 'Kenyatta Avenue, Nakuru CBD, Kenya',
  pickupLocation: 'Areqa Studio, Kenyatta Avenue, Nakuru CBD (Mon–Sat, 9am–6pm)',
  businessHours: 'Mon–Sat 9am–6pm · Sun 11am–4pm',
  social: {
    instagram: 'https://instagram.com/areqa',
    tiktok: 'https://tiktok.com/@areqa',
    facebook: 'https://facebook.com/areqa',
    x: '',
  },
  freeDeliveryThreshold: 5000,
  lowStockThreshold: 5,
  sizeGuides: {
    default: apparelGuide,
    'trousers-denim': {
      title: 'Trousers & denim (cm)',
      columns: ['Size', 'Waist', 'Hip', 'Inseam'],
      rows: [
        { cells: ['28 / XS', '71', '89', '78'] },
        { cells: ['30 / S', '76', '94', '79'] },
        { cells: ['32 / M', '81', '99', '80'] },
        { cells: ['34 / L', '86', '104', '81'] },
        { cells: ['36 / XL', '91', '109', '82'] },
        { cells: ['38 / XXL', '97', '114', '82'] },
      ],
      note: 'Measure your natural waist without a belt. Women’s styles use XS–XL labels.',
    },
    dresses: {
      title: 'Dresses (cm)',
      columns: ['Size', 'UK', 'Bust', 'Waist', 'Hip'],
      rows: [
        { cells: ['XS', '6', '80', '62', '87'] },
        { cells: ['S', '8–10', '84–88', '66–70', '91–95'] },
        { cells: ['M', '12', '93', '75', '100'] },
        { cells: ['L', '14', '98', '80', '105'] },
        { cells: ['XL', '16', '103', '85', '110'] },
      ],
      note: 'Our dresses are true to size. For fitted bodices, choose your bust measurement.',
    },
  },
};

export const DISCOUNTS = [
  { code: 'KARIBU10', type: 'percentage' as const, value: 10, minOrder: 2000, usageLimit: null },
  { code: 'AREQA500', type: 'fixed' as const, value: 500, minOrder: 5000, usageLimit: 100 },
];
