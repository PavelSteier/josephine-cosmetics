"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const zone = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(80),
  fee: z.number().int().min(0),
  note: z.string().trim().max(200),
  upcountry: z.boolean(),
  active: z.boolean(),
});

export async function saveZones(zones: z.input<typeof zone>[]): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const parsed = z.array(zone).safeParse(zones);
  if (!parsed.success) return { ok: false, error: "Every area needs a name and a price" };
  await db.$transaction(async (tx) => {
    const keep = parsed.data.filter((z) => z.id).map((z) => z.id!);
    await tx.deliveryZone.deleteMany({ where: { id: { notIn: keep } } });
    for (const [i, z] of parsed.data.entries()) {
      const data = { name: z.name, fee: z.fee, note: z.note, upcountry: z.upcountry, active: z.active, sortOrder: i };
      if (z.id) await tx.deliveryZone.update({ where: { id: z.id }, data });
      else await tx.deliveryZone.create({ data });
    }
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
