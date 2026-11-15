"use server";

import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const STATUSES: OrderStatus[] = ["NEW", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export async function setStatus(orderId: number, status: OrderStatus) {
  await requireAdmin();
  if (!STATUSES.includes(status)) return;
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
    if (order.status === status) return;
    // Cancelling puts the items back in stock; un-cancelling takes them out again.
    const restock = status === "CANCELLED" ? 1 : order.status === "CANCELLED" ? -1 : 0;
    if (restock) {
      for (const i of order.items) {
        if (i.variantId) {
          await tx.variant.update({ where: { id: i.variantId }, data: { stock: { increment: restock * i.qty } } });
        }
      }
    }
    if (restock && order.discountCode) {
      // give the code use back when an order is cancelled (and take it again if un-cancelled)
      await tx.discountCode.updateMany({ where: { code: order.discountCode }, data: { usedCount: { increment: -restock } } });
    }
    await tx.order.update({ where: { id: orderId }, data: { status } });
  });
  revalidatePath("/admin", "layout");
}

export async function setDeliveryFee(orderId: number, fee: number | null) {
  await requireAdmin();
  if (fee !== null && (!Number.isInteger(fee) || fee < 0 || fee > 10_000_000)) return;
  const o = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  await db.order.update({ where: { id: orderId }, data: { deliveryFee: fee, total: o.subtotal - o.discount + (fee ?? 0) } });
  revalidatePath("/admin", "layout");
}

export async function setPaid(orderId: number, paid: boolean) {
  await requireAdmin();
  await db.order.update({ where: { id: orderId }, data: { paid } });
  revalidatePath("/admin", "layout");
}
