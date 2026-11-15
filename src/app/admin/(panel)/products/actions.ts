"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";

const schema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Name is too short").max(120),
  description: z.string().trim().max(3000),
  categoryId: z.number().int().positive("Choose a category"),
  price: z.number().int().min(0, "Enter a price"),
  oldPrice: z.number().int().min(0).nullable(),
  active: z.boolean(),
  featured: z.boolean(),
  variants: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        color: z.string().trim().max(40),
        size: z.string().trim().max(20),
        stock: z.number().int().min(0).max(100000),
      }),
    )
    .min(1, "Add at least one row with stock"),
});

export type ProductInput = z.infer<typeof schema>;

export async function saveProduct(input: ProductInput): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" };
  const d = parsed.data;

  const keys = d.variants.map((v) => `${v.color.toLowerCase()}|${v.size.toLowerCase()}`);
  if (new Set(keys).size !== keys.length) return { ok: false, error: "The same colour + size is listed twice" };

  const data = {
    name: d.name,
    description: d.description,
    categoryId: d.categoryId,
    price: d.price,
    oldPrice: d.oldPrice && d.oldPrice > d.price ? d.oldPrice : null,
    active: d.active,
    featured: d.featured,
  };

  const id = await db.$transaction(async (tx) => {
    let productId = d.id;
    if (productId) {
      await tx.product.update({ where: { id: productId }, data });
    } else {
      const base = slugify(d.name) || "product";
      const taken = await tx.product.findUnique({ where: { slug: base } });
      const created = await tx.product.create({ data: { ...data, slug: taken ? `${base}-${Date.now().toString(36)}` : base } });
      productId = created.id;
    }

    const keep = d.variants.filter((v) => v.id).map((v) => v.id!);
    await tx.variant.deleteMany({ where: { productId, id: { notIn: keep } } });
    for (const v of d.variants) {
      if (v.id) {
        await tx.variant.updateMany({ where: { id: v.id, productId }, data: { color: v.color, size: v.size, stock: v.stock } });
      } else {
        await tx.variant.create({ data: { productId, color: v.color, size: v.size, stock: v.stock } });
      }
    }
    return productId;
  });

  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  // Keep sales history: products that were ordered are hidden instead of deleted.
  const ordered = await db.orderItem.count({ where: { variant: { productId: id } } });
  if (ordered > 0) await db.product.update({ where: { id }, data: { active: false } });
  else await db.product.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function deleteImage(imageId: number) {
  await requireAdmin();
  await db.productImage.delete({ where: { id: imageId } });
  revalidatePath("/", "layout");
}

export async function makeMainImage(productId: number, imageId: number) {
  await requireAdmin();
  const images = await db.productImage.findMany({ where: { productId }, orderBy: { sortOrder: "asc" }, select: { id: true } });
  const order = [imageId, ...images.map((i) => i.id).filter((id) => id !== imageId)];
  await db.$transaction(order.map((id, i) => db.productImage.update({ where: { id }, data: { sortOrder: i } })));
  revalidatePath("/", "layout");
}
