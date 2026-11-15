// Fills a new database with categories, example delivery areas and a few demo products.
// Run once: npm run seed   (safe to re-run: it skips anything that already exists)
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const categories = [
  ["cosmetics", "Cosmetics"],
  ["clothes", "Clothes"],
  ["jewelry", "Jewelry"],
  ["heels", "Heels"],
  ["wigs", "Wigs"],
] as const;

// Delivery areas (no fixed prices – the delivery fee is agreed per order on WhatsApp)
const zones = [
  { name: "Kampala", note: "Boda boda or Faras, often the same day", upcountry: false },
  { name: "Near Kampala (Wakiso, Entebbe, Mukono…)", note: "", upcountry: false },
  { name: "Upcountry (bus / taxi)", note: "Sent by bus or taxi – pick up at the park in your town", upcountry: true },
];

// DEMO products so the shop isn't empty – delete or edit them in Admin → Products
const demo: { cat: string; name: string; price: number; desc: string; colors: string[]; sizes: string[]; featured?: boolean }[] = [
  { cat: "cosmetics", name: "Matte Liquid Lipstick", price: 25000, desc: "Long-lasting matte finish.", colors: ["Ruby Red", "Nude", "Berry"], sizes: [], featured: true },
  { cat: "cosmetics", name: "Glow Foundation", price: 55000, desc: "Light, natural glow for every skin tone.", colors: ["Caramel", "Mocha", "Espresso"], sizes: [] },
  { cat: "clothes", name: "Satin Wrap Dress", price: 120000, desc: "Elegant satin dress for evenings out.", colors: ["Black", "Pink"], sizes: ["S", "M", "L", "XL"], featured: true },
  { cat: "jewelry", name: "Gold Hoop Earrings", price: 35000, desc: "Gold-plated hoops.", colors: [], sizes: [], featured: true },
  { cat: "jewelry", name: "Pearl Necklace", price: 65000, desc: "Classic pearl necklace with gold clasp.", colors: [], sizes: [] },
  { cat: "heels", name: "Classic Stiletto Heels", price: 150000, desc: "10 cm heel, comfortable insole.", colors: ["Black", "Nude"], sizes: ["37", "38", "39", "40"], featured: true },
  { cat: "wigs", name: "Body Wave Lace Front Wig", price: 350000, desc: "Human hair, natural hairline.", colors: ["Natural Black"], sizes: ['16"', '20"'] },
];

async function main() {
  for (const [i, [slug, name]] of categories.entries()) {
    await db.category.upsert({ where: { slug }, update: {}, create: { slug, name, sortOrder: i } });
  }
  if ((await db.deliveryZone.count()) === 0) {
    await db.deliveryZone.createMany({ data: zones.map((z, i) => ({ ...z, sortOrder: i })) });
  }
  if ((await db.product.count()) === 0 && process.env.SEED_DEMO !== "0") {
    for (const p of demo) {
      const cat = await db.category.findUniqueOrThrow({ where: { slug: p.cat } });
      const cs = p.colors.length ? p.colors : [""];
      const ss = p.sizes.length ? p.sizes : [""];
      await db.product.create({
        data: {
          slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""),
          name: p.name,
          description: p.desc,
          price: p.price,
          featured: p.featured ?? false,
          categoryId: cat.id,
          variants: { create: cs.flatMap((color) => ss.map((size) => ({ color, size, stock: 5 }))) },
        },
      });
    }
  }
  console.log("Seed done");
}

main().finally(() => db.$disconnect());
