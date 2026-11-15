import webpush from "web-push";
import { db } from "./db";

export function pushEnabled(): boolean {
  return !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

/** Sends a notification to every device where Josephine turned on order alerts. Never throws. */
export async function notifyAdmin(payload: { title: string; body: string; url: string }): Promise<void> {
  if (!pushEnabled()) return;
  try {
    // push services require an https: or mailto: contact; the live shop URL is https
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    webpush.setVapidDetails(
      site.startsWith("https://") ? site : "https://josephine-shop.invalid",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    const subs = await db.pushSubscription.findMany();
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify(payload),
            { TTL: 24 * 3600, urgency: "high" },
          );
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          // 404/410: the phone unsubscribed or the app was removed – forget it
          if (status === 404 || status === 410) await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
          else console.error("push failed", status, (e as Error).message);
        }
      }),
    );
  } catch (e) {
    console.error("notifyAdmin failed", e);
  }
}
