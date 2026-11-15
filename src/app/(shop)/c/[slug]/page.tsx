import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product-card";
import { listProducts } from "@/lib/catalog";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await db.category.findUnique({ where: { slug } });
  return c ? { title: c.name, description: `Shop ${c.name.toLowerCase()} at Josephine Cosmetics & Jewelry, Kampala.` } : {};
}

const SORTS = [
  ["new", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
] as const;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort: rawSort } = await searchParams;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();
  const sort = SORTS.some(([k]) => k === rawSort) ? (rawSort as (typeof SORTS)[number][0]) : "new";
  const products = await listProducts({ categoryId: category.id, sort });

  return (
    <div className="pt-8">
      <h1 className="font-display text-3xl text-gold-shine">{category.name}</h1>
      <div className="my-5 flex gap-2 overflow-x-auto text-sm [scrollbar-width:none]">
        {SORTS.map(([key, label]) => (
          <Link
            key={key}
            href={`/c/${slug}?sort=${key}`}
            className={`shrink-0 rounded-full px-3 py-1 ${sort === key ? "bg-pink-deep text-white" : "border border-line text-muted"}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
