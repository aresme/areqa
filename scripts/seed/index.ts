/**
 * Seeds Firestore with realistic Areqa sample data.
 *
 *   npm run seed                      # upsert all sample data
 *   npm run seed -- --reset           # delete seeded collections first (never touches orders/users)
 *   npm run seed -- --no-upload       # skip Cloudinary, keep Unsplash URLs
 *   npm run seed -- --emulator        # write to the local emulators instead
 *   npm run seed -- --dry-run         # build everything and print a summary, no Firebase needed
 *   npm run seed -- --admin you@x.com # grant owner role to an existing Auth user
 *
 * Credentials: a service-account JSON (Firebase console → Project settings → Service accounts →
 * Generate new private key) at ./service-account.json or the path in SEED_SERVICE_ACCOUNT.
 * Cloudinary settings are read from apps/admin/.env.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { cert, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, type Firestore, type WriteBatch } from 'firebase-admin/firestore';
import { COL, DOC } from '../../packages/shared/src/constants/collections';
import { toCatalogEntry } from '../../packages/shared/src/utils/catalog';
import { buildProduct, type BuiltProduct } from './build';
import { SeedImageUploader } from './cloudinary';
import { CATEGORIES, COLLECTIONS, PRODUCTS } from './data/catalog';
import { HOME, PAGES } from './data/content';
import { DELIVERY_ZONES, DISCOUNTS, SETTINGS } from './data/store';

const ROOT = resolve(import.meta.dirname, '../..');
loadEnv({ path: resolve(ROOT, 'apps/admin/.env') });

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const DRY_RUN = flag('dry-run');
const SEEDED_COLLECTIONS = [
  COL.products,
  COL.inventory,
  COL.categories,
  COL.collections,
  COL.deliveryZones,
  COL.discounts,
  COL.meta,
];

function connect(): Firestore {
  if (flag('emulator')) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099';
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'areqa-store';
    initializeApp({ projectId });
    console.log(`→ Connected to local emulators (project "${projectId}")`);
    return getFirestore();
  }
  const keyPath = resolve(ROOT, process.env.SEED_SERVICE_ACCOUNT ?? 'service-account.json');
  if (!existsSync(keyPath)) {
    console.error(`\n✖ Service account key not found at ${keyPath}`);
    console.error('  Download it from Firebase console → Project settings → Service accounts,');
    console.error(
      '  save it as service-account.json in the repo root (it is git-ignored), and re-run.\n',
    );
    process.exit(1);
  }
  const key = JSON.parse(readFileSync(keyPath, 'utf8')) as ServiceAccount & { project_id: string };
  initializeApp({ credential: cert(key) });
  console.log(`→ Connected to Firebase project "${key.project_id}"`);
  return getFirestore();
}

/** Batches writes in chunks of 400 (Firestore limit is 500 per batch). */
class BatchWriter {
  private batch: WriteBatch;
  private count = 0;
  private total = 0;
  constructor(private readonly db: Firestore) {
    this.batch = db.batch();
  }
  async set(path: string, data: object) {
    this.batch.set(this.db.doc(path), data);
    this.total++;
    if (++this.count >= 400) await this.flush();
  }
  async flush() {
    if (this.count === 0) return;
    await this.batch.commit();
    this.batch = this.db.batch();
    this.count = 0;
  }
  get written() {
    return this.total;
  }
}

async function resetCollections(db: Firestore) {
  for (const name of SEEDED_COLLECTIONS) {
    const snap = await db.collection(name).get();
    const bulk = db.bulkWriter();
    snap.docs.forEach((d) => bulk.delete(d.ref));
    await bulk.close();
    console.log(`  ✓ cleared ${name} (${snap.size})`);
  }
}

async function grantOwner(email: string) {
  const db = connect();
  const user = await getAuth()
    .getUserByEmail(email)
    .catch(() => null);
  if (!user) {
    console.error(
      `✖ No Firebase Auth user with email ${email}. Create it first (Authentication → Users → Add user).`,
    );
    process.exit(1);
  }
  await db
    .doc(`${COL.admins}/${user.uid}`)
    .set({ role: 'owner', name: user.displayName ?? email.split('@')[0], email });
  console.log(`✓ ${email} (${user.uid}) is now an owner admin.`);
}

async function main() {
  const adminEmail = option('admin');
  if (adminEmail) return grantOwner(adminEmail);

  const uploader = new SeedImageUploader(
    flag('no-upload') || DRY_RUN ? '' : (process.env.VITE_CLOUDINARY_CLOUD_NAME ?? ''),
    process.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '',
    process.env.VITE_CLOUDINARY_FOLDER ?? 'areqa',
  );
  console.log(
    uploader.enabled
      ? '→ Images will be copied to Cloudinary'
      : '→ Using original image URLs (Cloudinary not configured or skipped)',
  );
  const resolveImage = (url: string) => uploader.upload(url);

  // Build everything first so a data error never leaves Firestore half-seeded.
  const categoryName = new Map(CATEGORIES.map((c) => [c.slug, c.name]));
  const built: BuiltProduct[] = [];
  for (const p of PRODUCTS) {
    const name = categoryName.get(p.category);
    if (!name) throw new Error(`Unknown category "${p.category}" on ${p.name}`);
    built.push(await buildProduct(p, p.category, name, resolveImage));
  }
  const ids = new Set(built.map((b) => b.id));
  if (ids.size !== built.length) throw new Error('Duplicate product slugs in seed data');

  const groups = async (list: typeof CATEGORIES) =>
    Promise.all(
      list.map(async (c, i) => {
        const up = await resolveImage(c.image);
        return {
          id: c.slug,
          data: {
            name: c.name,
            slug: c.slug,
            description: c.description,
            image: { url: up.url, publicId: up.publicId, alt: c.name },
            sortOrder: i + 1,
            isVisible: true,
          },
        };
      }),
    );
  const categories = await groups(CATEGORIES);
  const collections = await groups(COLLECTIONS);

  const variantCount = built.reduce((n, b) => n + b.inventory.length, 0);
  const outOfStock = built.reduce((n, b) => n + b.inventory.filter((i) => i.stock === 0).length, 0);
  console.log(
    `→ Built ${built.length} products, ${variantCount} variants (${outOfStock} sold out), ${categories.length} categories, ${collections.length} collections, ${DELIVERY_ZONES.length} delivery zones`,
  );

  if (DRY_RUN) {
    console.log('\nDry run — nothing written. Sample product:\n');
    const { searchKeywords, ...sample } = built[0]!.product;
    console.log(
      JSON.stringify(
        { ...sample, searchKeywords: `[${searchKeywords.length} tokens]` },
        null,
        2,
      ).slice(0, 1800),
    );
    return;
  }

  const db = connect();
  if (flag('reset')) {
    console.log('→ Resetting seeded collections');
    await resetCollections(db);
  }

  const w = new BatchWriter(db);
  const now = Date.now();
  const DAY = 86_400_000;

  const catalogEntries = [];
  for (const [i, b] of built.entries()) {
    // New-in items get the most recent dates so "Newest" sorting looks right.
    const ageDays = b.product.isNew ? 1 + i * 0.5 : 20 + i * 3;
    const at = Timestamp.fromMillis(now - ageDays * DAY);
    catalogEntries.push(toCatalogEntry(b.id, { ...b.product, createdAt: at }, b.categoryName));
    await w.set(`${COL.products}/${b.id}`, { ...b.product, createdAt: at, updatedAt: at });
    for (const { id, ...item } of b.inventory) {
      await w.set(`${COL.inventory}/${id}`, { ...item, updatedAt: at });
    }
  }
  for (const c of categories) await w.set(`${COL.categories}/${c.id}`, c.data);
  for (const c of collections) await w.set(`${COL.collections}/${c.id}`, c.data);
  for (const { id, ...zone } of DELIVERY_ZONES) await w.set(`${COL.deliveryZones}/${id}`, zone);

  for (const d of DISCOUNTS) {
    await w.set(`${COL.discounts}/${d.code}`, {
      ...d,
      startsAt: Timestamp.fromMillis(now - DAY),
      endsAt: Timestamp.fromMillis(now + 365 * DAY),
      usedCount: 0,
      isActive: true,
      lastOrderId: null,
    });
  }

  const hero = await Promise.all(
    HOME.heroSlides.map(async (s) => ({
      ...s,
      image: { ...s.image, ...(await resolveImage(s.image.url)) },
    })),
  );
  const lookbook = await Promise.all(
    HOME.lookbook.map(async (l) => ({
      ...l,
      image: { ...l.image, ...(await resolveImage(l.image.url)) },
    })),
  );
  const banner = {
    ...HOME.featureBanner,
    image: { ...HOME.featureBanner.image, ...(await resolveImage(HOME.featureBanner.image.url)) },
  };

  await w.set(`${COL.content}/${DOC.homeContent}`, {
    ...HOME,
    heroSlides: hero,
    lookbook,
    featureBanner: banner,
  });
  await w.set(`${COL.content}/${DOC.pagesContent}`, PAGES);
  await w.set(`${COL.settings}/${DOC.storeSettings}`, SETTINGS);
  await w.set(`${COL.meta}/${DOC.catalogIndex}`, {
    entries: catalogEntries,
    updatedAt: Timestamp.now(),
  });
  await w.flush();

  console.log(`\n✓ Seed complete — ${w.written} documents written.`);
  console.log(
    '  Next: create your admin user in Firebase Auth, then run  npm run seed -- --admin you@example.com\n',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
