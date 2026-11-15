import Link from "next/link";
import type { CardProduct } from "@/lib/catalog";
import { ugx } from "@/lib/format";
import { ProductImage } from "./product-image";

export function ProductCard({ p }: { p: CardProduct }) {
  return (
    <Link href={`/p/${p.slug}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-ink-2">
        <ProductImage imageId={p.imageId} name={p.name} className="transition duration-500 group-hover:scale-105" />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-cream">{p.name}</p>
      <p className="mt-0.5 text-sm">
        <span className="font-semibold text-gold-light">{ugx(p.price)}</span>
        {p.oldPrice && p.oldPrice > p.price && (
          <span className="ml-2 text-xs text-muted line-through">{ugx(p.oldPrice)}</span>
        )}
      </p>
    </Link>
  );
}

export function ProductGrid({ products }: { products: CardProduct[] }) {
  if (products.length === 0) {
    return <p className="py-10 text-center text-muted">New items are coming soon. Check back shortly!</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
