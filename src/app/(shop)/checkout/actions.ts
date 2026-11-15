"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/format";
import { codeLabel, evaluateCode } from "@/lib/discounts";
import { loyaltyApplies, previousOrderCount } from "@/lib/loyalty";
import { getSettings } from "@/lib/settings";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().min(9).max(20),
  zoneId: z.coerce.number().int().positive("Please choose your delivery area"),
  address: z.string().trim().min(3, "Please describe where to deliver (area + landmark)").max(300),
  note: z.string().trim().max(500).default(""),
  payment: z.enum(["MOMO", "CASH"]),
  code: z.string().trim().max(40).default(""),
  items: z
    .array(z.object({ variantId: z.number().int().positive(), qty: z.number().int().min(1).max(50) }))
    .min(1, "Your cart is empty")
    .max(50),
});

export type PlaceOrderInput = z.input<typeof schema>;
export type PlaceOrderResult =
  | { ok: true; token: string }
  | { ok: false; error: string; soldOut?: number[] };

class CodeError extends Error {}

class StockError extends Error {
  constructor(public variantIds: number[], msg: string) {
    super(msg);
  }
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" };
  const d = parsed.data;

  const phone = normalizePhone(d.phone);
  if (!phone) return { ok: false, error: "Please enter a valid Ugandan phone number, e.g. 0772 123 456" };

  // merge duplicate lines
  const qtyByVariant = new Map<number, number>();
  for (const i of d.items) qtyByVariant.set(i.variantId, (qtyByVariant.get(i.variantId) ?? 0) + i.qty);

  const [zone, s] = await Promise.all([
    db.deliveryZone.findFirst({ where: { id: d.zoneId, active: true } }),
    getSettings(),
  ]);
  if (!zone) return { ok: false, error: "Please choose your delivery area" };

  try {
    const order = await db.$transaction(async (tx) => {
      const variants = await tx.variant.findMany({
        where: { id: { in: [...qtyByVariant.keys()] }, product: { active: true } },
        include: { product: { select: { name: true, price: true } } },
      });
      const missing = [...qtyByVariant.keys()].filter((id) => !variants.some((v) => v.id === id));
      if (missing.length) throw new StockError(missing, "Some items are no longer available");

      // reserve stock atomically: only succeeds if enough is left
      const soldOut: number[] = [];
      for (const v of variants) {
        const qty = qtyByVariant.get(v.id)!;
        const r = await tx.variant.updateMany({ where: { id: v.id, stock: { gte: qty } }, data: { stock: { decrement: qty } } });
        if (r.count === 0) soldOut.push(v.id);
      }
      if (soldOut.length) {
        const names = variants.filter((v) => soldOut.includes(v.id)).map((v) => v.product.name);
        throw new StockError(soldOut, `Sorry, not enough stock left for: ${names.join(", ")}`);
      }

      const subtotal = variants.reduce((n, v) => n + v.product.price * qtyByVariant.get(v.id)!, 0);
      // Loyalty reward and discount code don't stack: the customer gets the bigger one.
      const previous = await previousOrderCount(phone);
      let discount = 0;
      let discountLabel = "";
      let discountCode = "";
      if (loyaltyApplies(previous, s)) {
        const pct = Number(s.loyaltyPercent) || 10;
        discount = Math.round((subtotal * pct) / 100);
        discountLabel = `Loyalty reward: ${pct}% off your ${previous + 1}th order`;
      }
      if (d.code) {
        const r = await evaluateCode(d.code, subtotal);
        if (!r.ok) throw new CodeError(r.error);
        if (r.amount > discount) {
          // count the use atomically so a limited code can't be used more times than allowed
          const used = await tx.discountCode.updateMany({
            where: { id: r.code.id, active: true, ...(r.code.maxUses !== null ? { usedCount: { lt: r.code.maxUses } } : {}) },
            data: { usedCount: { increment: 1 } },
          });
          if (used.count === 0) throw new CodeError("This code has been fully used");
          discount = r.amount;
          discountLabel = codeLabel(r.code);
          discountCode = r.code.code;
        }
      }

      return tx.order.create({
        data: {
          token: randomBytes(16).toString("hex"),
          customerName: d.name,
          phone,
          zoneName: zone.name,
          address: d.address,
          note: d.note,
          paymentMethod: d.payment,
          subtotal,
          discount,
          discountLabel,
          discountCode,
          deliveryFee: zone.fee,
          total: subtotal - discount + zone.fee,
          items: {
            create: variants.map((v) => ({
              variantId: v.id,
              name: v.product.name,
              color: v.color,
              size: v.size,
              price: v.product.price,
              qty: qtyByVariant.get(v.id)!,
            })),
          },
        },
      });
    });
    return { ok: true, token: order.token };
  } catch (e) {
    if (e instanceof StockError) return { ok: false, error: e.message, soldOut: e.variantIds };
    if (e instanceof CodeError) return { ok: false, error: e.message };
    console.error("placeOrder failed", e);
    return { ok: false, error: "Something went wrong. Please try again or order on WhatsApp." };
  }
}

/** Lets the checkout page show "You get 10% off this order!" before submitting. */
export async function checkLoyalty(rawPhone: string): Promise<{ eligible: boolean; percent: number }> {
  const phone = normalizePhone(rawPhone);
  const s = await getSettings();
  const percent = Number(s.loyaltyPercent) || 10;
  if (!phone) return { eligible: false, percent };
  return { eligible: loyaltyApplies(await previousOrderCount(phone), s), percent };
}

/** Preview a discount code in the checkout before placing the order. */
export async function checkCode(code: string, subtotal: number): Promise<{ ok: true; amount: number; label: string } | { ok: false; error: string }> {
  const r = await evaluateCode(code, Math.max(0, Math.round(subtotal)));
  return r.ok ? { ok: true, amount: r.amount, label: codeLabel(r.code) } : r;
}
