"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { normalizePhone, parseOrderNumber } from "@/lib/format";

export async function findOrder(_: string | null, form: FormData): Promise<string | null> {
  const id = parseOrderNumber(String(form.get("number") ?? ""));
  const phone = normalizePhone(String(form.get("phone") ?? ""));
  if (!id || !phone) return "Please enter your order number (e.g. JC1005) and phone number.";
  const order = await db.order.findFirst({ where: { id, phone }, select: { token: true } });
  if (!order) return "We couldn't find that order. Check the number and phone, or message us on WhatsApp.";
  redirect(`/order/${order.token}`);
}
