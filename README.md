# Areqa

Modern fashion e-commerce for Kenya: a customer **storefront** and a private **admin panel** sharing one Firebase backend. Runs entirely on free tiers (Firebase Spark, Cloudinary, EmailJS, Vercel Hobby).

```
apps/store       React + Vite storefront        → e.g. areqa.vercel.app
apps/admin       React + Vite admin dashboard   → e.g. areqa-admin.vercel.app
packages/shared  Types, constants, utils, Firebase init, Tailwind design tokens
scripts/seed     Firestore sample-data seeder (Firebase Admin SDK)
firestore.rules  Security rules (the only backend: every client write is validated here)
```

> Full setup and deployment documentation is written in phase 9. This covers getting started.

## Requirements

- Node.js 20+ (developed on Node 22)
- Java 11+ (only for the local Firebase emulator)

## Quick start

```bash
npm install
cp apps/store/.env.example apps/store/.env
cp apps/admin/.env.example apps/admin/.env
npm run dev:store     # http://localhost:5173
npm run dev:admin     # http://localhost:5174
```

Both apps run without keys: they show "not connected" states until Firebase is configured.

### Local development with the Firebase emulator (no cloud project needed)

```bash
npm run emulators         # terminal 1 — Firestore + Auth emulators (UI at http://localhost:4000)
npm run seed:emulator     # terminal 2 — load the sample catalogue into the emulator
npm run dev:store         # http://localhost:5173
```

Set `VITE_FIREBASE_EMULATOR=true` in `apps/*/.env` to point the apps at the emulators, and `false` to use the real project. Emulator data resets when it stops; re-run the seed.

## 1. Create the Firebase project

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (Analytics optional; enable it if you want GA4 e-commerce events).
2. **Build → Firestore Database → Create database** → production mode → region `eur3` or `europe-west` (closest to Kenya).
3. **Build → Authentication → Get started** → enable **Email/Password** and **Google**.
4. **Project settings → General → Your apps → Web (`</>`)** → register an app, then copy the config values into both `.env` files.
5. Set the project id in `.firebaserc`.

## 2. Deploy rules and indexes

```bash
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes
```

## 3. Seed sample data

1. **Project settings → Service accounts → Generate new private key** and save it as `service-account.json` in the repo root. It is git-ignored; never commit it.
2. Optional: set up Cloudinary first (below) so seed images are copied into your account.
3. Run:

```bash
npm run seed -- --dry-run   # validate data, no writes
npm run seed                # write products, categories, zones, content, settings, discounts
npm run seed -- --reset     # wipe seeded collections first (never touches orders or users)
```

## 4. Create the first admin

1. **Authentication → Users → Add user** with your email and password.
2. Grant the owner role:

```bash
npm run seed -- --admin you@example.com
```

Or manually: create a Firestore doc `admins/{that user's UID}` with `{ role: "owner", name: "...", email: "..." }`. Use `role: "staff"` for team members who should not change settings or manage admins.

## 5. Cloudinary (images)

Firebase Storage needs the paid Blaze plan, so images live on Cloudinary's free tier.

1. Cloudinary console → **Settings → Upload → Upload presets → Add upload preset**.
2. Signing mode **Unsigned**, name `areqa_unsigned`, folder `areqa`.
3. Put your cloud name and preset name in both `.env` files.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev:store` / `dev:admin` | Start an app in dev mode |
| `npm run build` | Typecheck and build both apps |
| `npm run lint` / `format` | ESLint / Prettier |
| `npm run seed` | Seed Firestore (see above) |

## Design tokens

Defined once in `packages/shared/tailwind.preset.cjs` and `src/styles/tokens.css`: `ink`, `paper`, `mist`, `line`, `muted`, `mint`, `mint-strong`, `mint-deep`, `danger`, `danger-deep`. Fonts: Space Grotesk (display) and Inter (body).
