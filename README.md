# Josephine Cosmetics & Jewelry – e-shop

Online shop for cosmetics, clothes, jewelry, heels and wigs in Uganda.
Customers order as guests and pay with **MTN Mobile Money** or **cash on delivery**.
Josephine runs everything from her iPhone at `/admin`.

## Features
- Catalogue in 5 categories, colour/size variants, stock (sold-out items hidden automatically)
- Cart, guest checkout, delivery area (Kampala boda/Faras, upcountry bus/taxi). No fixed delivery prices:
  the fee is agreed with the customer on WhatsApp; Josephine can note it on the order and the total updates
- Order page with MoMo instructions (personal number now, MoMoPay merchant code later – just fill it in Settings)
- "Order on WhatsApp" on every product + "Send order on WhatsApp" after checkout
- Order tracking (`/track`) with order number + phone
- Loyalty: 10% off every 5th order (counted by phone number, configurable)
- Discount codes (% or UGX off, minimum order, max uses, expiry). They don't stack with the loyalty reward – the bigger discount wins
- Product reviews with stars, "Verified buyer" badge (phone matches a delivered order), published only after Josephine approves
- Admin (mobile-first, add to iPhone home screen): orders, status, paid, WhatsApp message templates,
  products with photo upload (resized on the phone), reviews, discount codes, delivery areas, settings
- SEO: sitemap, robots, product structured data for Google

## Tech
Next.js 15 · Prisma · PostgreSQL. Photos are stored in the database (no extra storage service).
Everything runs on free tiers: **Vercel** (hosting) + **Supabase** or **Neon** (Postgres).
The only cost is the domain.

## Run locally
```bash
cp .env.example .env      # set DATABASE_URL, DIRECT_URL, ADMIN_PASSWORD, SESSION_SECRET
npm install
npx prisma migrate dev
npm run seed              # categories, example delivery areas, demo products (SEED_DEMO=0 to skip demos)
npm run dev               # http://localhost:3000 – admin at /admin
```

## Deploy (free)
1. Create a Supabase project → Project Settings → Database → copy the pooled (6543) and direct (5432) connection strings.
2. Import the GitHub repo in Vercel, set the env vars from `.env.example`.
   The `build` script runs `prisma migrate deploy` automatically.
3. Once: run `npm run seed` locally against the production `DATABASE_URL` (use `SEED_DEMO=0` for no demo products).
4. Add the domain in Vercel → Domains.

## Still to fill in (placeholders now)
- Delivery areas (names only) → Admin → More → Delivery areas
- Real products & photos → Admin → Products (delete the demo products)
- Instagram / TikTok links → Admin → Settings

## Phase 2 ideas
Google Business Profile · Instagram product feed · push notifications for new orders.
