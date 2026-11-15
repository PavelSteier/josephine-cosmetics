"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/format";

const schema = z.object({
  productId: z.number().int().positive(),
  name: z.string().trim().min(2, "Please enter your name").max(60),
  rating: z.number().int().min(1, "Please choose stars").max(5),
  text: z.string().trim().min(3, "Please write a few words").max(1000),
  phone: z.string().trim().max(20),
  website: z.string().max(0), // honeypot: hidden field that only bots fill in
});

export async function submitReview(input: z.input<typeof schema>): Promise<{ ok: boolean; error?: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" };
  const d = parsed.data;
  const product = await db.product.findFirst({ where: { id: d.productId, active: true }, select: { id: true } });
  if (!product) return { ok: false, error: "Product not found" };

  // "Verified buyer" when the phone matches a delivered order containing this product. The phone is not stored.
  const phone = d.phone ? normalizePhone(d.phone) : null;
  const verified = phone
    ? (await db.order.count({
        where: { phone, status: "DELIVERED", items: { some: { variant: { productId: d.productId } } } },
      })) > 0
    : false;

  await db.review.create({ data: { productId: d.productId, name: d.name, rating: d.rating, text: d.text, verified } });
  return { ok: true };
}
