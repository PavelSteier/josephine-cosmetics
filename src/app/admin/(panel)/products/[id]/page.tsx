import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "../product-form";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const id = Number((await params).id);
  const created = (await searchParams).created === "1";
  const [product, categories] = await Promise.all([
    Number.isInteger(id)
      ? db.product.findUnique({
          where: { id },
          include: { variants: { orderBy: { id: "asc" } }, images: { select: { id: true }, orderBy: { sortOrder: "asc" } } },
        })
      : null,
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/admin/products" className="text-sm text-muted">← Products</Link>
        {product.active && <Link href={`/p/${product.slug}`} target="_blank" className="text-sm text-gold-light underline">View in shop</Link>}
      </div>
      <h1 className="font-display text-2xl text-gold-light">{product.name}</h1>
      {created && <p className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm">✓ Product created. Now add photos below.</p>}
      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          price: product.price,
          oldPrice: product.oldPrice,
          active: product.active,
          featured: product.featured,
          variants: product.variants.map((v) => ({ id: v.id, color: v.color, size: v.size, stock: v.stock })),
          imageIds: product.images.map((i) => i.id),
        }}
      />
    </div>
  );
}
