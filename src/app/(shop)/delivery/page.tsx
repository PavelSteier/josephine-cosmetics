import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Delivery" };

export default async function DeliveryPage() {
  const zones = await db.deliveryZone.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <div className="mx-auto max-w-2xl pt-10">
      <h1 className="font-display text-3xl text-gold-shine">Delivery</h1>
      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted">
        <p>In Kampala and nearby we deliver by <strong className="text-cream">boda boda and Faras</strong>. Upcountry orders are sent by <strong className="text-cream">bus or taxi</strong> and you pick them up at the park in your town.</p>
        <p>When we are not too busy, Kampala orders can arrive <strong className="text-cream">the same day</strong>.</p>
        <p>The <strong className="text-cream">delivery fee depends on where you are</strong>. After you order, Josephine agrees the fee and the time with you on WhatsApp.</p>
      </div>
      <ul className="card mt-6 divide-y divide-line text-sm">
        {zones.map((z) => (
          <li key={z.id} className="p-3">
            {z.name}
            {z.note && <span className="block text-xs text-muted">{z.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
