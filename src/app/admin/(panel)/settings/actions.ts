"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/format";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export async function saveSettings(_: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();
  const values: Record<string, string> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS)) values[k] = String(form.get(k) ?? "").trim();

  for (const k of ["whatsappNumber", "momoNumber"]) {
    const p = normalizePhone(values[k]);
    if (!p) return `Please enter a valid phone number for ${k === "momoNumber" ? "Mobile Money" : "WhatsApp"}`;
    values[k] = p;
  }
  for (const k of ["returnDays", "loyaltyEvery", "loyaltyPercent"]) {
    const n = Number(values[k]);
    if (!Number.isInteger(n) || n < 1 || n > 100) return "Numbers must be between 1 and 100";
  }
  for (const k of ["instagram", "tiktok"]) {
    if (values[k] && !/^https:\/\//.test(values[k])) return "Instagram / TikTok must be full links starting with https://";
  }

  await db.$transaction(
    Object.entries(values).map(([key, value]) => db.setting.upsert({ where: { key }, create: { key, value }, update: { value } })),
  );
  revalidatePath("/", "layout");
  return "✓ Saved";
}
