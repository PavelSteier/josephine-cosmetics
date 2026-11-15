"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function approveReview(id: number, approved: boolean) {
  await requireAdmin();
  await db.review.update({ where: { id }, data: { approved } });
  revalidatePath("/", "layout");
}

export async function deleteReview(id: number) {
  await requireAdmin();
  await db.review.delete({ where: { id } });
  revalidatePath("/", "layout");
}
