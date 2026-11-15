import type { DiscountCode } from "@prisma/client";
import { db } from "./db";
import { ugx } from "./format";

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function codeLabel(c: Pick<DiscountCode, "code" | "type" | "value">): string {
  return c.type === "PERCENT" ? `Code ${c.code}: ${c.value}% off` : `Code ${c.code}: ${ugx(c.value)} off`;
}

/** Checks a code against the cart subtotal. Does not use it up. */
export async function evaluateCode(
  rawCode: string,
  subtotal: number,
): Promise<{ ok: true; code: DiscountCode; amount: number } | { ok: false; error: string }> {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, error: "Enter a code" };
  const c = await db.discountCode.findUnique({ where: { code } });
  if (!c || !c.active) return { ok: false, error: "This code is not valid" };
  if (c.expiresAt && c.expiresAt < new Date()) return { ok: false, error: "This code has expired" };
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return { ok: false, error: "This code has been fully used" };
  if (subtotal < c.minOrder) return { ok: false, error: `This code needs an order of at least ${ugx(c.minOrder)}` };
  const amount = c.type === "PERCENT" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
  return { ok: true, code: c, amount };
}
