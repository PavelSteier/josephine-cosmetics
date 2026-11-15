"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { normalizeCode } from "@/lib/discounts";

const schema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20).regex(/^[A-Z0-9]+$/, "Use only letters and numbers"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().min(1, "Enter the discount"),
  minOrder: z.number().int().min(0),
  maxUses: z.number().int().min(1).nullable(),
  expiresAt: z.date().nullable(),
});

export async function createCode(_: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();
  const num = (k: string) => Number(String(form.get(k) ?? "").replace(/[^\d]/g, "")) || 0;
  const expires = String(form.get("expiresAt") ?? "");
  const parsed = schema.safeParse({
    code: normalizeCode(String(form.get("code") ?? "")),
    type: form.get("type"),
    value: num("value"),
    minOrder: num("minOrder"),
    maxUses: num("maxUses") || null,
    // end of the chosen day, Kampala time (UTC+3)
    expiresAt: expires ? new Date(`${expires}T23:59:59+03:00`) : null,
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Please check the form";
  if (parsed.data.type === "PERCENT" && parsed.data.value > 90) return "Percent discount can be at most 90%";
  if (await db.discountCode.findUnique({ where: { code: parsed.data.code } })) return "This code already exists";
  await db.discountCode.create({ data: parsed.data });
  revalidatePath("/admin/discounts");
  return "✓ Code created";
}

export async function toggleCode(id: number, active: boolean) {
  await requireAdmin();
  await db.discountCode.update({ where: { id }, data: { active } });
  revalidatePath("/admin/discounts");
}

export async function deleteCode(id: number) {
  await requireAdmin();
  await db.discountCode.delete({ where: { id } });
  revalidatePath("/admin/discounts");
}
