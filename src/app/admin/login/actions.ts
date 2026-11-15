"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionValue, SESSION_COOKIE } from "@/lib/auth";

export async function login(_: string | null, form: FormData): Promise<string | null> {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (process.env.NODE_ENV === "production" && (expected.length < 10 || expected === "changeme")) {
    return "Admin password is not set up safely (ADMIN_PASSWORD must be at least 10 characters).";
  }
  const given = String(form.get("password") ?? "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return "Wrong password";
  }
  const { value, maxAge } = await createSessionValue();
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
