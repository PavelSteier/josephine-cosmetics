import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionValue } from "./auth";

/** Call at the top of every admin server action / route. */
export async function requireAdmin(): Promise<void> {
  const c = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionValue(c))) redirect("/admin/login");
}

export async function isAdmin(): Promise<boolean> {
  return verifySessionValue((await cookies()).get(SESSION_COOKIE)?.value);
}
