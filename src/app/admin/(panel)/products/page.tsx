import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { db } from "@/lib/db";
import { ugx } from "@/lib/format";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string }> }) {
  const { q = "", c = "" } = await searchParams;
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  const products = await db.product.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      ...(c ? { category: { slug: c } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      variants: { select: { stock: true } },
      images: { select: { id: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-gold-light">Products</h1>
        <Link href="/admin/products/new" className="btn btn-pink py-2">+ Add</Link>
      </div>
      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Search products…" className="input" />
        {c && <input type="hidden" name="c" value={c} />}
      </form>
      <div className="my-3 flex gap-2 overflow-x-auto text-sm [scrollbar-width:none]">
        <Link href="/admin/products" className={`shrink-0 rounded-full px-3 py-1 ${!c ? "bg-pink-deep text-white" : "border border-line text-muted"}`}>All</Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/admin/products?c=${cat.slug}`} className={`shrink-0 rounded-full px-3 py-1 ${c === cat.slug ? "bg-pink-deep text-white" : "border border-line text-muted"}`}>
            {cat.name}
          </Link>
        ))}
      </div>
      <ul className="space-y-2">
        {products.map((p) => {
          const stock = p.variants.reduce((n, v) => n + v.stock, 0);
          return (
            <li key={p.id}>
              <Link href={`/admin/products/${p.id}`} className="card flex items-center gap-3 p-3 hover:border-gold">
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg">
                  <ProductImage imageId={p.images[0]?.id} name={p.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted">{p.category.name} · {ugx(p.price)}</p>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <p className={stock === 0 ? "text-pink" : stock <= 3 ? "text-gold-light" : "text-muted"}>
                    {stock === 0 ? "Sold out" : `${stock} in stock`}
                  </p>
                  {!p.active && <p className="text-muted">Hidden</p>}
                  {p.images.length === 0 && <p className="text-pink/80">No photo</p>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {products.length === 0 && <p className="py-10 text-center text-muted">No products found.</p>}
    </div>
  );
}
