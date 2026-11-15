import Link from "next/link";
import { ProductGrid } from "@/components/product-card";
import { listProducts } from "@/lib/catalog";
import { db } from "@/lib/db";

const CATEGORY_ICONS: Record<string, string> = {
  cosmetics: "💄",
  clothes: "👗",
  jewelry: "💍",
  heels: "👠",
  wigs: "💇🏾‍♀️",
};

export default async function HomePage() {
  const [categories, featured, newest] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    listProducts({ featured: true, take: 8 }),
    listProducts({ take: 8 }),
  ]);

  return (
    <>
      <section className="relative -mx-4 overflow-hidden px-4 py-14 text-center sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#4a1e33_0%,transparent_60%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.4em] text-pink">Kampala · Uganda</p>
          <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">
            <span className="text-gold-shine">Shine like gold</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Cosmetics, clothes, jewelry, heels and wigs, delivered to your door. Pay with MTN Mobile Money or cash on
            delivery.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="#new" className="btn btn-gold">Shop now</Link>
            <Link href="/track" className="btn btn-outline">Track my order</Link>
          </div>
        </div>
      </section>

      <section aria-label="Categories" className="grid grid-cols-5 gap-2 sm:gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/c/${c.slug}`}
            className="card flex flex-col items-center gap-1 py-4 text-center hover:border-gold"
          >
            <span className="text-2xl sm:text-3xl" aria-hidden="true">{CATEGORY_ICONS[c.slug] ?? "✨"}</span>
            <span className="text-[11px] text-cream sm:text-sm">{c.name}</span>
          </Link>
        ))}
      </section>

      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-2xl text-gold-light">Josephine&apos;s picks</h2>
          <ProductGrid products={featured} />
        </section>
      )}

      <section id="new" className="mt-12 scroll-mt-32">
        <h2 className="mb-5 font-display text-2xl text-gold-light">New arrivals</h2>
        <ProductGrid products={newest} />
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          ["🛵", "Fast delivery", "Same day in Kampala when we're not too busy. Upcountry by bus or taxi."],
          ["📱", "Mobile Money or cash", "Pay with MTN MoMo or cash when your order arrives."],
          ["🎁", "Loyalty reward", "Get 10% off every 5th order, automatically."],
        ].map(([icon, title, text]) => (
          <div key={title} className="card p-5">
            <p className="text-2xl" aria-hidden="true">{icon}</p>
            <p className="mt-2 font-semibold text-gold-light">{title}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
