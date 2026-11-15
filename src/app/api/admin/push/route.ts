import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/push";

const sub = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }),
});

/** Save this device's subscription (and send a test notification). */
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "unauthorised" }, { status: 401 });
  const parsed = sub.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad subscription" }, { status: 400 });
  const { endpoint, keys } = parsed.data;
  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { p256dh: keys.p256dh, auth: keys.auth },
  });
  await notifyAdmin({ title: "Notifications are on ✨", body: "You will get a message here for every new order.", url: "/admin" });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (endpoint) await db.pushSubscription.deleteMany({ where: { endpoint } });
  return Response.json({ ok: true });
}
