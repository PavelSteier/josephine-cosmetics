import type { Prisma } from "@prisma/client";
import { db } from "./db";

export const inStockWhere: Prisma.ProductWhereInput = {
  active: true,
  variants: { some: { stock: { gt: 0 } } },
};

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  oldPrice: true,
  images: { select: { id: true }, orderBy: { sortOrder: "asc" }, take: 1 },
} satisfies Prisma.ProductSelect;

export type CardProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  imageId: number | null;
};

function toCard(p: Prisma.ProductGetPayload<{ select: typeof cardSelect }>): CardProduct {
  return { id: p.id, slug: p.slug, name: p.name, price: p.price, oldPrice: p.oldPrice, imageId: p.images[0]?.id ?? null };
}

export async function listProducts(opts: {
  categoryId?: number;
  featured?: boolean;
  take?: number;
  sort?: "new" | "price-asc" | "price-desc";
}): Promise<CardProduct[]> {
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    opts.sort === "price-asc" ? { price: "asc" } : opts.sort === "price-desc" ? { price: "desc" } : { createdAt: "desc" };
  const rows = await db.product.findMany({
    where: {
      ...inStockWhere,
      ...(opts.categoryId ? { categoryId: opts.categoryId } : {}),
      ...(opts.featured ? { featured: true } : {}),
    },
    orderBy,
    take: opts.take,
    select: cardSelect,
  });
  return rows.map(toCard);
}
